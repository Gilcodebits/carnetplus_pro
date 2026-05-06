<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/auth.php';

$user   = requireAuth();
$method = $_SERVER['REQUEST_METHOD'];
$db     = getDB();
$input  = json_decode(file_get_contents('php://input'), true) ?? [];
$id     = intval($_GET['id'] ?? 0);

if ($method === 'GET') {
    $date      = $_GET['date'] ?? null;
    $medecinId = intval($_GET['medecin_id'] ?? 0);
    $patientId = intval($_GET['patient_id'] ?? 0);

    $where = ['1=1'];
    $params = [];

    if ($date)      { $where[] = 'r.date_rdv = ?';    $params[] = $date; }
    if ($medecinId) { $where[] = 'r.medecin_id = ?';  $params[] = $medecinId; }
    if ($patientId) { $where[] = 'r.patient_id = ?';  $params[] = $patientId; }
    if ($user['role'] === 'patient') {
        $stmt = $db->prepare("SELECT id FROM patients WHERE utilisateur_id=?");
        $stmt->execute([$user['id']]);
        $p = $stmt->fetch();
        if ($p) { $where[] = 'r.patient_id = ?'; $params[] = $p['id']; }
    }

    $sql = "
        SELECT r.*,
               CONCAT(p.prenom,' ',p.nom) as patient_nom, p.numero_dossier,
               CONCAT(m.prenom,' ',m.nom) as medecin_nom,
               CONCAT(s.prenom,' ',s.nom) as secretaire_nom
        FROM rendez_vous r
        JOIN patients    p ON r.patient_id  = p.id
        JOIN utilisateurs m ON r.medecin_id = m.id
        LEFT JOIN utilisateurs s ON r.secretaire_id = s.id
        WHERE " . implode(' AND ', $where) . "
        ORDER BY r.date_rdv, r.heure_rdv
    ";
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    echo json_encode($stmt->fetchAll());
}

elseif ($method === 'POST') {
    requireRole(['secretaire','admin','patient']);

    if (empty($input['patient_id']) || empty($input['medecin_id']) ||
        empty($input['date_rdv'])   || empty($input['heure_rdv'])) {
        http_response_code(400);
        die(json_encode(['error' => 'Champs obligatoires manquants']));
    }

    // Vérifier disponibilité médecin
    $stmt = $db->prepare("
        SELECT id FROM rendez_vous
        WHERE medecin_id=? AND date_rdv=? AND heure_rdv=? AND statut NOT IN ('annule')
    ");
    $stmt->execute([$input['medecin_id'], $input['date_rdv'], $input['heure_rdv']]);
    if ($stmt->fetch()) {
        http_response_code(409);
        die(json_encode([
            'error'       => 'Créneau déjà occupé',
            'suggestion'  => 'Veuillez choisir un autre horaire',
        ]));
    }

    $stmt = $db->prepare("
        INSERT INTO rendez_vous (patient_id,medecin_id,secretaire_id,date_rdv,heure_rdv,motif,statut)
        VALUES (?,?,?,?,?,?,'planifie')
    ");
    $stmt->execute([
        $input['patient_id'], $input['medecin_id'],
        $user['role'] === 'secretaire' ? $user['id'] : null,
        $input['date_rdv'], $input['heure_rdv'],
        $input['motif'] ?? 'Consultation',
    ]);
    $newId = $db->lastInsertId();

    // Notifier le médecin
    $db->prepare("INSERT INTO notifications (utilisateur_id,titre,message,type) VALUES (?,?,?,?)")
       ->execute([$input['medecin_id'], 'Nouveau RDV', "Nouveau rendez-vous le {$input['date_rdv']} à {$input['heure_rdv']}", 'info']);

    echo json_encode(['id' => $newId, 'message' => 'RDV planifié avec succès']);
}

elseif ($method === 'PUT' && $id) {
    requireRole(['secretaire','admin']);
    $statut = $input['statut'] ?? null;
    if ($statut) {
        $db->prepare("UPDATE rendez_vous SET statut=? WHERE id=?")->execute([$statut, $id]);
    } else {
        $db->prepare("UPDATE rendez_vous SET date_rdv=?,heure_rdv=?,motif=?,statut=? WHERE id=?")
           ->execute([$input['date_rdv']??'', $input['heure_rdv']??'', $input['motif']??'', $input['statut']??'planifie', $id]);
    }
    echo json_encode(['message' => 'RDV mis à jour']);
}

elseif ($method === 'DELETE' && $id) {
    requireRole(['secretaire','admin']);
    $db->prepare("UPDATE rendez_vous SET statut='annule' WHERE id=?")->execute([$id]);
    echo json_encode(['message' => 'RDV annulé']);
}

else { http_response_code(405); echo json_encode(['error' => 'Méthode non autorisée']); }
