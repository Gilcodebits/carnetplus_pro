<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/auth.php';

$user   = requireRole(['medecin','admin','agent_sante']);
$method = $_SERVER['REQUEST_METHOD'];
$db     = getDB();
$input  = json_decode(file_get_contents('php://input'), true) ?? [];
$id     = intval($_GET['id'] ?? 0);
$patientId = intval($_GET['patient_id'] ?? 0);

if ($method === 'GET' && $patientId) {
    $stmt = $db->prepare("
        SELECT c.*, CONCAT(u.prenom,' ',u.nom) as medecin_nom
        FROM consultations c JOIN utilisateurs u ON c.medecin_id = u.id
        WHERE c.patient_id = ? ORDER BY c.date_consultation DESC
    ");
    $stmt->execute([$patientId]);
    echo json_encode($stmt->fetchAll());
}

elseif ($method === 'GET' && $id) {
    $stmt = $db->prepare("
        SELECT c.*, CONCAT(u.prenom,' ',u.nom) as medecin_nom,
               CONCAT(p.prenom,' ',p.nom) as patient_nom, p.numero_dossier
        FROM consultations c
        JOIN utilisateurs u ON c.medecin_id = u.id
        JOIN patients p ON c.patient_id = p.id
        WHERE c.id = ?
    ");
    $stmt->execute([$id]);
    $c = $stmt->fetch();
    if (!$c) { http_response_code(404); die(json_encode(['error'=>'Introuvable'])); }

    // Prescriptions liées
    $stmt = $db->prepare("
        SELECT pr.*, pm.nom_medicament, pm.posologie, pm.duree
        FROM prescriptions pr
        JOIN prescription_medicaments pm ON pr.id = pm.prescription_id
        WHERE pr.consultation_id = ?
    ");
    $stmt->execute([$id]);
    $c['prescriptions'] = $stmt->fetchAll();

    // Examens liés
    $stmt = $db->prepare("SELECT * FROM examens WHERE consultation_id = ?");
    $stmt->execute([$id]);
    $c['examens'] = $stmt->fetchAll();

    echo json_encode($c);
}

elseif ($method === 'POST') {
    // Vérifier patient existe
    $stmt = $db->prepare("SELECT id FROM patients WHERE id = ?");
    $stmt->execute([$input['patient_id'] ?? 0]);
    if (!$stmt->fetch()) {
        http_response_code(404);
        die(json_encode(['error' => 'Patient introuvable — retour à la recherche']));
    }

    // Vérifier données
    if (empty($input['motif'])) {
        http_response_code(400);
        die(json_encode(['error' => 'Le motif de consultation est requis']));
    }

    $stmt = $db->prepare("
        INSERT INTO consultations
        (patient_id,medecin_id,rdv_id,motif,symptomes,diagnostic,traitement,observations,tension,temperature,poids,taille)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
    ");
    $stmt->execute([
        $input['patient_id'], $user['id'],
        $input['rdv_id'] ?? null,
        $input['motif'], $input['symptomes'] ?? '',
        $input['diagnostic'] ?? '', $input['traitement'] ?? '',
        $input['observations'] ?? '',
        $input['tension'] ?? null, $input['temperature'] ?? null,
        $input['poids'] ?? null, $input['taille'] ?? null,
    ]);
    $newId = $db->lastInsertId();

    // Mettre à jour statut RDV si lié
    if (!empty($input['rdv_id'])) {
        $db->prepare("UPDATE rendez_vous SET statut='termine' WHERE id=?")
           ->execute([$input['rdv_id']]);
    }

    $db->prepare("INSERT INTO audit_logs (utilisateur_id,action,table_cible,id_cible) VALUES (?,?,?,?)")
       ->execute([$user['id'], 'create_consultation', 'consultations', $newId]);

    // Notifier le patient
    $stmt = $db->prepare("SELECT utilisateur_id FROM patients WHERE id=?");
    $stmt->execute([$input['patient_id']]);
    $patUser = $stmt->fetchColumn();
    if ($patUser) {
        $db->prepare("INSERT INTO notifications (utilisateur_id,titre,message,type) VALUES (?,?,?,?)")
           ->execute([$patUser, 'Nouvelle consultation', 'Une nouvelle consultation a été enregistrée dans votre dossier.', 'info']);
    }

    echo json_encode(['id' => $newId, 'message' => 'Consultation enregistrée']);
}

elseif ($method === 'PUT' && $id) {
    $stmt = $db->prepare("
        UPDATE consultations SET motif=?,symptomes=?,diagnostic=?,traitement=?,
        observations=?,tension=?,temperature=?,poids=?,taille=? WHERE id=? AND medecin_id=?
    ");
    $stmt->execute([
        $input['motif']??'', $input['symptomes']??'',
        $input['diagnostic']??'', $input['traitement']??'',
        $input['observations']??'', $input['tension']??null,
        $input['temperature']??null, $input['poids']??null,
        $input['taille']??null, $id, $user['id'],
    ]);
    echo json_encode(['message' => 'Consultation mise à jour']);
}

else { http_response_code(405); echo json_encode(['error' => 'Méthode non autorisée']); }
