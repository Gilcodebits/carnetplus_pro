<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/auth.php';

$user   = requireAuth();
$method = $_SERVER['REQUEST_METHOD'];
$db     = getDB();
$input  = json_decode(file_get_contents('php://input'), true) ?? [];
$id     = intval($_GET['id'] ?? 0);

if ($method === 'GET') {
    $patientId = intval($_GET['patient_id'] ?? 0);
    $statut    = $_GET['statut'] ?? '';
    $where = ['1=1'];
    $params = [];
    if ($patientId) { $where[] = 'e.patient_id = ?'; $params[] = $patientId; }
    if ($statut)    { $where[] = 'e.statut = ?';     $params[] = $statut; }

    // Sécurisation par établissement
    if ($user['role'] !== 'admin' && $user['role'] !== 'patient') {
        $where[] = 'm.etablissement_id = ?';
        $params[] = $user['etablissement_id'];
    }
    // Si c'est un patient, il ne voit que les siens (déjà géré par patientId généralement, mais on renforce)
    if ($user['role'] === 'patient') {
        $stmt = $db->prepare("SELECT id FROM patients WHERE utilisateur_id=?");
        $stmt->execute([$user['id']]);
        $pid = $stmt->fetchColumn();
        $where[] = 'e.patient_id = ?';
        $params[] = $pid;
    }

    $stmt = $db->prepare("
        SELECT e.*, CONCAT(p.prenom,' ',p.nom) as patient_nom, p.numero_dossier,
               CONCAT(m.prenom,' ',m.nom) as medecin_nom
        FROM examens e
        JOIN patients p ON e.patient_id = p.id
        JOIN utilisateurs m ON e.medecin_id = m.id
        WHERE " . implode(' AND ', $where) . "
        ORDER BY e.urgence DESC, e.date_demande DESC
    ");
    $stmt->execute($params);
    echo json_encode($stmt->fetchAll());
}

elseif ($method === 'POST') {
    requireRole(['medecin','admin','agent_sante']);
    if (empty($input['type_examen']) || empty($input['patient_id'])) {
        http_response_code(400);
        die(json_encode(['error' => 'Type d\'examen et patient requis']));
    }
    $stmt = $db->prepare("
        INSERT INTO examens (patient_id,medecin_id,consultation_id,type_examen,description,urgence)
        VALUES (?,?,?,?,?,?)
    ");
    $stmt->execute([
        $input['patient_id'], $user['id'],
        $input['consultation_id'] ?? null,
        $input['type_examen'], $input['description'] ?? '',
        intval($input['urgence'] ?? 0),
    ]);
    $newId = $db->lastInsertId();

    // Transmettre au labo (notification)
    $stmt = $db->prepare("SELECT id FROM utilisateurs WHERE role='labo' AND etablissement_id=? LIMIT 1");
    $stmt->execute([$user['etablissement_id']]);
    $labo = $stmt->fetchColumn();
    if ($labo) {
        $urgLabel = $input['urgence'] ? ' [URGENT]' : '';
        $db->prepare("INSERT INTO notifications (utilisateur_id,titre,message,type) VALUES (?,?,?,?)")
           ->execute([$labo, "Nouvelle demande{$urgLabel}", "Examen: {$input['type_examen']}", $input['urgence'] ? 'error' : 'info']);
    }
    echo json_encode(['id' => $newId, 'message' => 'Demande transmise au laboratoire']);
}

elseif ($method === 'PUT' && $id) {
    requireRole(['labo','medecin','admin']);
    $statut = $input['statut'] ?? 'en_attente';
    
    $db->prepare("UPDATE examens SET statut=?,resultat=?,date_resultat=NOW() WHERE id=?")
       ->execute([$statut, $input['resultat']??'', $id]);

    // Notifier le patient si l'examen est terminé
    if ($statut === 'termine') {
        $stmt = $db->prepare("SELECT e.type_examen, p.utilisateur_id FROM examens e JOIN patients p ON e.patient_id = p.id WHERE e.id = ?");
        $stmt->execute([$id]);
        $info = $stmt->fetch();
        if ($info && $info['utilisateur_id']) {
            $db->prepare("INSERT INTO notifications (utilisateur_id,titre,message,type) VALUES (?,?,?,?)")
               ->execute([$info['utilisateur_id'], 'Résultat disponible', "Votre résultat d'examen ({$info['type_examen']}) est disponible.", 'success']);
        }
    }
    echo json_encode(['message' => 'Examen mis à jour']);
}

else { http_response_code(405); echo json_encode(['error' => 'Méthode non autorisée']); }
