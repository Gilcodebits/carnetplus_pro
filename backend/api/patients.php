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
        $where = "(p.nom LIKE ? OR p.prenom LIKE ? OR p.numero_dossier LIKE ?)";
        $params = [$search, $search, $search];

        // Sécurisation : Seul l'admin voit tout le réseau, les autres voient leur établissement
        if ($user['role'] !== 'admin') {
            $etabId = intval($user['etablissement_id']);
            $where .= " AND p.etablissement_id = ?";
            $params[] = $etabId;
        }

        $stmt = $db->prepare("
            SELECT p.*, CONCAT(p.prenom,' ',p.nom) as nom_complet,
                   e.nom as etablissement_nom
            FROM patients p
            LEFT JOIN etablissements e ON p.etablissement_id = e.id
            WHERE $where
            ORDER BY p.created_at DESC
        ");
        $stmt->execute($params);
        echo json_encode($stmt->fetchAll());
        exit;
    }
}

    // Si on a un ID ou si c'est un patient (qui a été réassigné un ID ci-dessus)
    if ($method === 'GET' && $id) {
        // 1. Sécurité pour le rôle Patient
        if ($user['role'] === 'patient') {
            $stmt = $db->prepare("SELECT id FROM patients WHERE utilisateur_id = ?");
            $stmt->execute([$user['id']]);
            $mine = $stmt->fetch();
            if (!$mine || $mine['id'] != $id) {
                http_response_code(403);
                die(json_encode(['error'=>'Accès non autorisé à ce dossier']));
            }
        }
        
        // 2. Sécurité pour le personnel médical (Isoler par établissement SAUF si transfert en cours)
        if (in_array($user['role'], ['medecin', 'secretaire', 'gestionnaire'])) {
            $etabId = intval($user['etablissement_id']);
            
            // Vérifier si le patient appartient à l'établissement
            $stmt = $db->prepare("SELECT etablissement_id FROM patients WHERE id = ?");
            $stmt->execute([$id]);
            $patientEtab = $stmt->fetchColumn();
            
            if ($patientEtab != $etabId) {
                // Si le patient n'est pas chez nous, vérifier s'il y a un transfert en cours
                $stmt = $db->prepare("
                    SELECT id FROM transferts_dossiers 
                    WHERE patient_id = ? 
                    AND (etablissement_source_id = ? OR etablissement_dest_id = ?) 
                    AND statut IN ('en_attente', 'accepte', 'transfere')
                ");
                $stmt->execute([$id, $etabId, $etabId]);
                if (!$stmt->fetch()) {
                    http_response_code(403);
                    die(json_encode(['error' => 'Accès refusé. Ce dossier ne fait pas partie de votre établissement et aucun transfert n\'est actif.']));
                }
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

    $db->beginTransaction();
    try {
        // 1. Créer le compte utilisateur
        $defaultPass = str_replace('-', '', $numeroDossier); // DOS2024001
        $hashedPass  = password_hash($defaultPass, PASSWORD_DEFAULT);
        
        $stmt = $db->prepare("
            INSERT INTO utilisateurs (nom, prenom, email, mot_de_passe, role, etablissement_id, actif)
            VALUES (?, ?, ?, ?, 'patient', ?, 1)
        ");
        $stmt->execute([
            $input['nom'] ?? '', 
            $input['prenom'] ?? '',
            $input['email'] ?? ($numeroDossier . "@carnetplus.bj"), // Fallback si pas d'email
            $hashedPass,
            $user['etablissement_id'] ?? 1
        ]);
        $utilisateurId = $db->lastInsertId();

        // 2. Créer le dossier patient
        $stmt = $db->prepare("
            INSERT INTO patients (numero_dossier,nom,prenom,date_naissance,sexe,email,telephone,adresse,groupe_sanguin,allergies,antecedents,etablissement_id,utilisateur_id)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
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
            $utilisateurId
        ]);
        $newId = $db->lastInsertId();

        // 3. Logger l'action
        $db->prepare("INSERT INTO audit_logs (utilisateur_id,action,table_cible,id_cible) VALUES (?,?,?,?)")
           ->execute([$user['id'], 'create_patient', 'patients', $newId]);

        $db->commit();

        // 4. Envoyer email de bienvenue (si email présent)
        if (!empty($input['email'])) {
            require_once __DIR__ . '/../config/mail.php';
            $subject = "Votre Carnet de Santé Numérique CarnetPlus";
            $body = "
                <div style='font-family: sans-serif; padding: 20px; color: #1e293b;'>
                    <h2 style='color: #2563eb;'>Bienvenue sur CarnetPlus Health</h2>
                    <p>Bonjour <strong>{$input['prenom']} {$input['nom']}</strong>,</p>
                    <p>Votre dossier médical numérique a été créé avec succès. Vous pouvez désormais suivre vos consultations, ordonnances et résultats d'examens en ligne.</p>
                    <div style='background: #f1f5f9; padding: 20px; border-radius: 12px; margin: 20px 0;'>
                        <p style='margin: 5px 0;'><strong>N° Dossier :</strong> <span style='color: #2563eb;'>$numeroDossier</span></p>
                        <p style='margin: 10px 0 5px 0;'><strong>Identifiants de connexion :</strong></p>
                        <p style='margin: 2px 0;'>Email : {$input['email']}</p>
                        <p style='margin: 2px 0;'>Mot de passe : <code style='background: #fff; padding: 2px 5px; border-radius: 4px;'>$defaultPass</code></p>
                    </div>
                    <p style='font-size: 0.9em; color: #64748b;'><em>Pour votre sécurité, nous vous conseillons de changer votre mot de passe lors de votre première connexion.</em></p>
                    <hr style='border: none; border-top: 1px solid #e2e8f0; margin: 25px 0;' />
                    <p style='font-size: 0.8em; color: #94a3b8;'>L'équipe CarnetPlus Health</p>
                </div>
            ";
            sendEmail($input['email'], $subject, $body);
        }

        echo json_encode(['id'=>$newId, 'numero_dossier'=>$numeroDossier, 'message'=>'Patient enregistré et compte créé']);

    } catch (Exception $e) {
        $db->rollBack();
        http_response_code(500);
        die(json_encode(['error' => 'Erreur lors de la création du compte: ' . $e->getMessage()]));
    }
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
