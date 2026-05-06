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
    $where  = ['t.gestionnaire_id = ?'];
    $params = [$user['id']];
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
    if (empty($input['patient_id']) || empty($input['etablissement_dest_id']) || empty($input['type'])) {
        http_response_code(400);
        die(json_encode(['error' => 'Patient, établissement destination et type requis']));
    }
    $stmt = $db->prepare("
        INSERT INTO transferts_dossiers
        (patient_id,gestionnaire_id,etablissement_source_id,etablissement_dest_id,motif,type,priorite,notes_gestionnaire)
        VALUES (?,?,?,?,?,?,?,?)
    ");
    $stmt->execute([
        $input['patient_id'], $user['id'],
        $user['etablissement_id'],
        $input['etablissement_dest_id'],
        $input['motif'] ?? '',
        $input['type'],
        $input['priorite'] ?? 'normale',
        $input['notes'] ?? '',
    ]);
    $newId = $db->lastInsertId();

    // Notifier admin dest
    $db->prepare("INSERT INTO notifications (utilisateur_id,titre,message,type) VALUES (1,?,?,?)")
       ->execute(["Demande de transfert", "Nouvelle demande de transfert de dossier reçue", "info"]);

    echo json_encode(['id' => $newId, 'message' => 'Demande de transfert créée']);
}

elseif ($method === 'PUT' && $id) {
    $statut = $input['statut'] ?? null;
    if (!$statut) { http_response_code(400); die(json_encode(['error'=>'Statut requis'])); }

    $db->prepare("
        UPDATE transferts_dossiers
        SET statut=?, notes_gestionnaire=?, date_traitement=NOW()
        WHERE id=? AND gestionnaire_id=?
    ")->execute([$statut, $input['notes']??'', $id, $user['id']]);

    echo json_encode(['message' => 'Transfert mis à jour — statut: '.$statut]);
}

else { http_response_code(405); echo json_encode(['error' => 'Méthode non autorisée']); }
