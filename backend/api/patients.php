<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/auth.php';

// Autoriser le patient à voir son propre dossier
$user   = requireRole(['admin','medecin','secretaire','gestionnaire','patient']);
$method = $_SERVER['REQUEST_METHOD'];
$db     = getDB();
$input  = json_decode(file_get_contents('php://input'), true) ?? [];
$id     = intval($_GET['id'] ?? 0);

if ($method === 'GET' && !$id) {
    if ($user['role'] === 'patient') {
        // Rediriger vers son propre dossier complet
        $stmt = $db->prepare("SELECT id FROM patients WHERE utilisateur_id = ?");
        $stmt->execute([$user['id']]);
        $p = $stmt->fetch();
        if (!$p) { http_response_code(404); die(json_encode(['error'=>'Profil patient non trouvé'])); }
        $id = $p['id'];
    } else {
        // Liste patients avec recherche (Medecins/Staff)
        $search = '%' . ($_GET['q'] ?? '') . '%';
        $stmt = $db->prepare("
            SELECT p.*, CONCAT(p.prenom,' ',p.nom) as nom_complet,
                   e.nom as etablissement_nom
            FROM patients p
            LEFT JOIN etablissements e ON p.etablissement_id = e.id
            WHERE p.nom LIKE ? OR p.prenom LIKE ? OR p.numero_dossier LIKE ?
            ORDER BY p.created_at DESC
        ");
        $stmt->execute([$search,$search,$search]);
        echo json_encode($stmt->fetchAll());
        exit;
    }
}

// Si on a un ID ou si c'est un patient (qui a été réassigné un ID ci-dessus)
if ($method === 'GET' && $id) {
    // Si c'est un patient, vérifier qu'il accède à SON dossier
    if ($user['role'] === 'patient') {
        $stmt = $db->prepare("SELECT id FROM patients WHERE utilisateur_id = ?");
        $stmt->execute([$user['id']]);
        $mine = $stmt->fetch();
        if (!$mine || $mine['id'] != $id) {
            http_response_code(403);
            die(json_encode(['error'=>'Accès non autorisé à ce dossier']));
        }
    }

    // Dossier complet
    $stmt = $db->prepare("
        SELECT p.*, e.nom as etablissement_nom
        FROM patients p LEFT JOIN etablissements e ON p.etablissement_id = e.id
        WHERE p.id = ?
    ");
    $stmt->execute([$id]);
    $patient = $stmt->fetch();
    if (!$patient) { http_response_code(404); die(json_encode(['error'=>'Patient introuvable'])); }

    // Consultations
    $stmt = $db->prepare("
        SELECT c.*, CONCAT(u.prenom,' ',u.nom) as medecin_nom
        FROM consultations c JOIN utilisateurs u ON c.medecin_id = u.id
        WHERE c.patient_id = ? ORDER BY c.date_consultation DESC
    ");
    $stmt->execute([$id]);
    $patient['consultations'] = $stmt->fetchAll();

    // Prescriptions
    $stmt = $db->prepare("
        SELECT pr.*, pm.nom_medicament, pm.posologie, pm.duree,
               CONCAT(u.prenom,' ',u.nom) as medecin_nom
        FROM prescriptions pr
        JOIN prescription_medicaments pm ON pr.id = pm.prescription_id
        JOIN utilisateurs u ON pr.medecin_id = u.id
        WHERE pr.patient_id = ? ORDER BY pr.created_at DESC
    ");
    $stmt->execute([$id]);
    $patient['prescriptions'] = $stmt->fetchAll();

    // Examens
    $stmt = $db->prepare("SELECT * FROM examens WHERE patient_id = ? ORDER BY date_demande DESC");
    $stmt->execute([$id]);
    $patient['examens'] = $stmt->fetchAll();

    echo json_encode($patient);
}

elseif ($method === 'POST') {
    requireRole(['secretaire','medecin','admin']);

    // Générer numéro dossier
    $annee    = date('Y');
    $stmt     = $db->prepare("SELECT COUNT(*)+1 as n FROM patients WHERE YEAR(created_at)=?");
    $stmt->execute([$annee]);
    $num      = str_pad($stmt->fetchColumn(), 3, '0', STR_PAD_LEFT);
    $numeroDossier = "DOS-{$annee}-{$num}";

    // Vérifier doublon
    $stmt = $db->prepare("SELECT id FROM patients WHERE nom=? AND prenom=? AND date_naissance=?");
    $stmt->execute([$input['nom']??'', $input['prenom']??'', $input['date_naissance']??'']);
    if ($stmt->fetch()) {
        http_response_code(409);
        die(json_encode(['error'=>'Patient déjà enregistré (doublon détecté)']));
    }

    $stmt = $db->prepare("
        INSERT INTO patients (numero_dossier,nom,prenom,date_naissance,sexe,email,telephone,adresse,groupe_sanguin,allergies,antecedents,etablissement_id)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
    ");
    $stmt->execute([
        $numeroDossier,
        $input['nom'] ?? '', $input['prenom'] ?? '',
        $input['date_naissance'] ?? null,
        $input['sexe'] ?? null,
        $input['email'] ?? '', $input['telephone'] ?? '',
        $input['adresse'] ?? '',
        $input['groupe_sanguin'] ?? null,
        $input['allergies'] ?? '', $input['antecedents'] ?? '',
        $user['etablissement_id'] ?? 1,
    ]);
    $newId = $db->lastInsertId();

    $db->prepare("INSERT INTO audit_logs (utilisateur_id,action,table_cible,id_cible) VALUES (?,?,?,?)")
       ->execute([$user['id'], 'create_patient', 'patients', $newId]);

    echo json_encode(['id'=>$newId, 'numero_dossier'=>$numeroDossier, 'message'=>'Patient enregistré']);
}

elseif ($method === 'PUT' && $id) {
    requireRole(['secretaire','medecin','admin']);
    $stmt = $db->prepare("
        UPDATE patients SET nom=?,prenom=?,date_naissance=?,sexe=?,email=?,telephone=?,
        adresse=?,groupe_sanguin=?,allergies=?,antecedents=? WHERE id=?
    ");
    $stmt->execute([
        $input['nom']??'', $input['prenom']??'',
        $input['date_naissance']??null, $input['sexe']??null,
        $input['email']??'', $input['telephone']??'',
        $input['adresse']??'', $input['groupe_sanguin']??null,
        $input['allergies']??'', $input['antecedents']??'', $id,
    ]);
    echo json_encode(['message'=>'Patient mis à jour']);
}

else { http_response_code(405); echo json_encode(['error'=>'Méthode non autorisée']); }
