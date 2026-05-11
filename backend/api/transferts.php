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

    // Permettre à tout gestionnaire de mettre à jour (pas seulement le créateur)
    $db->prepare("
        UPDATE transferts_dossiers
        SET statut=?, notes_gestionnaire=?, date_traitement=NOW()
        WHERE id=?
    ")->execute([$statut, $input['notes']??'', $id]);

    // Notifier le patient
    $stmt = $db->prepare("SELECT p.utilisateur_id FROM transferts_dossiers t JOIN patients p ON t.patient_id = p.id WHERE t.id = ?");
    $stmt->execute([$id]);
    $patUser = $stmt->fetchColumn();
    if ($patUser) {
        $msg = "Le statut de votre demande de transfert est désormais : " . strtoupper($statut);
        $db->prepare("INSERT INTO notifications (utilisateur_id,titre,message,type) VALUES (?,?,?,?)")
           ->execute([$patUser, 'Suivi de transfert', $msg, 'info']);
    }

    echo json_encode(['message' => 'Transfert mis à jour — statut: '.$statut]);
}

else { http_response_code(405); echo json_encode(['error' => 'Méthode non autorisée']); }
