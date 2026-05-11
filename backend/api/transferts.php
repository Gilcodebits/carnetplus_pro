<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/auth.php';

$user   = requireRole(['gestionnaire','admin']);
$method = $_SERVER['REQUEST_METHOD'];
$db     = getDB();
$input  = json_decode(file_get_contents('php://input'), true) ?? [];
$id     = intval($_GET['id'] ?? 0);

if ($method === 'GET' && !$id) {
    $statut = $_GET['statut'] ?? '';
    $type   = $_GET['type'] ?? '';
    $where  = ['1=1'];
    $params = [];
    
    if ($user['role'] === 'gestionnaire') {
        $etabId = intval($user['etablissement_id']);
        $where[] = "(t.etablissement_source_id = $etabId OR t.etablissement_dest_id = $etabId)";
    }

    if ($statut) { $where[] = 't.statut = ?';  $params[] = $statut; }
    if ($type)   { $where[] = 't.type = ?';    $params[] = $type; }

    $stmt = $db->prepare("
        SELECT t.*,
               CONCAT(p.prenom,' ',p.nom) as patient_nom, p.numero_dossier,
               es.nom as etab_source, ed.nom as etab_dest
        FROM transferts_dossiers t
        JOIN patients      p  ON t.patient_id = p.id
        JOIN etablissements es ON t.etablissement_source_id = es.id
        JOIN etablissements ed ON t.etablissement_dest_id   = ed.id
        WHERE " . implode(' AND ', $where) . "
        ORDER BY t.priorite DESC, t.date_demande DESC
    ");
    $stmt->execute($params);
    echo json_encode($stmt->fetchAll());
}

elseif ($method === 'GET' && $id) {
    $stmt = $db->prepare("
        SELECT t.*,
               CONCAT(p.prenom,' ',p.nom) as patient_nom, p.numero_dossier,
               p.groupe_sanguin, p.allergies, p.antecedents,
               es.nom as etab_source, ed.nom as etab_dest,
               CONCAT(g.prenom,' ',g.nom) as gestionnaire_nom
        FROM transferts_dossiers t
        JOIN patients       p  ON t.patient_id = p.id
        JOIN etablissements es ON t.etablissement_source_id = es.id
        JOIN etablissements ed ON t.etablissement_dest_id   = ed.id
        JOIN utilisateurs   g  ON t.gestionnaire_id = g.id
        WHERE t.id = ?
    ");
    
    $stmt->execute([$id]);
    $t = $stmt->fetch();
    
    // Sécurité supplémentaire : Vérifier que le gestionnaire a le droit de voir ce transfert précis
    if ($t && $user['role'] === 'gestionnaire') {
        if ($t['etablissement_source_id'] != $user['etablissement_id'] && $t['etablissement_dest_id'] != $user['etablissement_id']) {
            http_response_code(403);
            die(json_encode(['error' => 'Accès refusé à ce dossier de transfert']));
        }
    }
    if (!$t) { http_response_code(404); die(json_encode(['error' => 'Transfert introuvable'])); }
    echo json_encode($t);
}

elseif ($method === 'POST') {
    // Accepter etab_dest_id OU etablissement_dest_id (compatibilité frontend)
    $dest_id = $input['etablissement_dest_id'] ?? $input['etab_dest_id'] ?? null;
    if (empty($input['patient_id']) || empty($dest_id) || empty($input['type'])) {
        http_response_code(400);
        die(json_encode(['error' => 'Patient, établissement destination et type requis']));
    }
    $source_id = $input['etab_source_id'] ?? $user['etablissement_id'] ?? 1;
    $stmt = $db->prepare("
        INSERT INTO transferts_dossiers
        (patient_id,gestionnaire_id,etablissement_source_id,etablissement_dest_id,motif,type,priorite,notes_gestionnaire)
        VALUES (?,?,?,?,?,?,?,?)
    ");
    $stmt->execute([
        $input['patient_id'], $user['id'],
        $source_id,
        $dest_id,
        $input['motif'] ?? '',
        $input['type'],
        $input['priorite'] ?? 'normale',
        $input['notes'] ?? '',
    ]);
    $newId = $db->lastInsertId();

    // Notifier l'admin seulement si ce n'est pas lui qui a créé la demande
    if ($user['id'] != 1) {
        $db->prepare("INSERT INTO notifications (utilisateur_id, titre, message, type) VALUES (1, ?, ?, ?)")
           ->execute([
               "Demande de transfert", 
               "Une nouvelle demande de transfert a été créée par " . $user['prenom'] . " " . $user['nom'], 
               "info"
           ]);
    }

    echo json_encode(['id' => $newId, 'message' => 'Demande de transfert créée']);
}

elseif ($method === 'PUT' && $id) {
    $statut = $input['statut'] ?? null;
    if (!$statut) { http_response_code(400); die(json_encode(['error'=>'Statut requis'])); }

    // Mettre à jour le statut du transfert
    $db->prepare("
        UPDATE transferts_dossiers
        SET statut=?, notes_gestionnaire=?, date_traitement=NOW()
        WHERE id=?
    ")->execute([$statut, $input['notes']??'', $id]);

    // LOGIQUE DE TRANSFERT DE PROPRIÉTÉ :
    // Si le transfert est finalisé ('transfere'), on change l'établissement du patient
    if ($statut === 'transfere') {
        $stmt = $db->prepare("SELECT patient_id, etablissement_dest_id FROM transferts_dossiers WHERE id = ?");
        $stmt->execute([$id]);
        $info = $stmt->fetch();
        if ($info) {
            $db->prepare("UPDATE patients SET etablissement_id = ? WHERE id = ?")
               ->execute([$info['etablissement_dest_id'], $info['patient_id']]);
            // Également mettre à jour l'établissement du compte utilisateur lié
            $db->prepare("UPDATE utilisateurs u JOIN patients p ON u.id = p.utilisateur_id SET u.etablissement_id = ? WHERE p.id = ?")
               ->execute([$info['etablissement_dest_id'], $info['patient_id']]);
        }
    }

    // Notifier le patient ET le gestionnaire demandeur
    $stmt = $db->prepare("SELECT p.utilisateur_id, t.gestionnaire_id, es.nom as source_nom 
                          FROM transferts_dossiers t 
                          JOIN patients p ON t.patient_id = p.id 
                          JOIN etablissements es ON t.etablissement_source_id = es.id
                          WHERE t.id = ?");
    $stmt->execute([$id]);
    $info = $stmt->fetch();
    
    if ($info) {
        // 1. Notifier le patient
        if ($info['utilisateur_id']) {
            $msg = "Le statut de votre demande de transfert est désormais : " . strtoupper($statut);
            $db->prepare("INSERT INTO notifications (utilisateur_id,titre,message,type) VALUES (?,?,?,?)")
               ->execute([$info['utilisateur_id'], 'Suivi de transfert', $msg, 'info']);
        }
        // 2. Notifier le gestionnaire émetteur si c'est quelqu'un d'autre qui répond
        if ($info['gestionnaire_id'] != $user['id']) {
            $type_notif = ($statut === 'accepte' || $statut === 'transfere') ? 'success' : ($statut === 'refuse' ? 'error' : 'info');
            $titre_notif = "Mise à jour Transfert : " . strtoupper($statut);
            $note = !empty($input['notes']) ? " — Motif : " . $input['notes'] : "";
            $msg_notif = "L'établissement destinataire a répondu à votre demande : " . $statut . $note;
            $db->prepare("INSERT INTO notifications (utilisateur_id,titre,message,type) VALUES (?,?,?,?)")
               ->execute([$info['gestionnaire_id'], $titre_notif, $msg_notif, $type_notif]);
        }
    }

    echo json_encode(['message' => 'Transfert mis à jour — statut: '.$statut]);
}

else { http_response_code(405); echo json_encode(['error' => 'Méthode non autorisée']); }
