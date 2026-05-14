<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/auth.php';

$user   = requireRole(['medecin','admin','patient','agent_sante']);
$method = $_SERVER['REQUEST_METHOD'];
$db     = getDB();
$input  = json_decode(file_get_contents('php://input'), true) ?? [];
$id     = intval($_GET['id'] ?? 0);

if ($method === 'GET') {
    $prId = intval($_GET['id'] ?? 0);

    // Sécurité : si c'est un patient, on force son propre ID et on ignore le paramètre GET
    $patientId = intval($_GET['patient_id'] ?? 0);
    if ($user['role'] === 'patient') {
        $stmt = $db->prepare("SELECT id FROM patients WHERE utilisateur_id = ?");
        $stmt->execute([$user['id']]);
        $realPatientId = $stmt->fetchColumn();
        if (!$realPatientId) {
            http_response_code(404);
            die(json_encode(['error' => 'Profil patient introuvable']));
        }
        $patientId = $realPatientId; // Forcer son propre ID, ignorer tout paramètre GET
    }

    $sql = "
        SELECT pr.*, CONCAT(u.prenom,' ',u.nom) as medecin_nom,
               u.email as medecin_email, u.telephone as medecin_tel,
               CONCAT(p.prenom,' ',p.nom) as patient_nom,
               p.numero_dossier
        FROM prescriptions pr
        JOIN utilisateurs u ON pr.medecin_id = u.id
        JOIN patients p ON pr.patient_id = p.id
    ";

    if ($prId > 0) {
        $stmt = $db->prepare($sql . " WHERE pr.id = ?");
        $stmt->execute([$prId]);
        $prescription = $stmt->fetch();

        // Vérification de propriété : un patient ne peut lire que ses propres ordonnances
        if ($prescription && $user['role'] === 'patient' && $prescription['patient_id'] != $patientId) {
            http_response_code(403);
            die(json_encode(['error' => 'Accès refusé à cette ordonnance']));
        }

        if ($prescription) {
            $stmt2 = $db->prepare("SELECT * FROM prescription_medicaments WHERE prescription_id=?");
            $stmt2->execute([$prescription['id']]);
            $prescription['medicaments'] = $stmt2->fetchAll();
            echo json_encode($prescription);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Ordonnance introuvable']);
        }
    } else {
        $stmt = $db->prepare($sql . " WHERE pr.patient_id = ? ORDER BY pr.created_at DESC");
        $stmt->execute([$patientId]);
        $prescriptions = $stmt->fetchAll();
        foreach ($prescriptions as &$pr) {
            $stmt2 = $db->prepare("SELECT * FROM prescription_medicaments WHERE prescription_id=?");
            $stmt2->execute([$pr['id']]);
            $pr['medicaments'] = $stmt2->fetchAll();
        }
        echo json_encode($prescriptions);
    }
}

elseif ($method === 'POST') {
    requireRole(['medecin','admin']);

    if (empty($input['patient_id']) || empty($input['medicaments'])) {
        http_response_code(400);
        die(json_encode(['error' => 'Données incomplètes — patient et médicaments requis']));
    }

    $consultationId = !empty($input['consultation_id']) ? intval($input['consultation_id']) : null;

    $db->beginTransaction();
    try {
        $stmt = $db->prepare("
            INSERT INTO prescriptions (consultation_id,patient_id,medecin_id)
            VALUES (?,?,?)
        ");
        $stmt->execute([$consultationId, $input['patient_id'], $user['id']]);
        $prId = $db->lastInsertId();

        foreach ($input['medicaments'] as $med) {
            if (empty($med['nom_medicament'])) continue;
            $db->prepare("
                INSERT INTO prescription_medicaments (prescription_id,nom_medicament,posologie,duree,instructions)
                VALUES (?,?,?,?,?)
            ")->execute([$prId, $med['nom_medicament'], $med['posologie']??'', $med['duree']??'', $med['instructions']??'']);
        }

        // Notifier agent de santé (labo / patient)
        $stmt = $db->prepare("SELECT utilisateur_id FROM patients WHERE id=?");
        $stmt->execute([$input['patient_id']]);
        $patUser = $stmt->fetchColumn();
        if ($patUser) {
            $db->prepare("INSERT INTO notifications (utilisateur_id,titre,message,type) VALUES (?,?,?,?)")
               ->execute([$patUser, 'Nouvelle prescription', 'Le médecin vous a prescrit un traitement', 'success']);
        }

        $db->commit();
        echo json_encode(['id' => $prId, 'message' => 'Prescription enregistrée']);
    } catch (Exception $e) {
        $db->rollBack();
        http_response_code(500);
        echo json_encode(['error' => 'Erreur système — prescription annulée']);
    }
}

else { http_response_code(405); echo json_encode(['error' => 'Méthode non autorisée']); }
