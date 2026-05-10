<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/auth.php';

$user   = requireAuth();
$method = $_SERVER['REQUEST_METHOD'];
$db     = getDB();
$input  = json_decode(file_get_contents('php://input'), true) ?? [];

if ($method === 'GET') {
    $stmt = $db->prepare("
        SELECT m.*,
               CONCAT(e.prenom,' ',e.nom) as expediteur_nom,
               CONCAT(d.prenom,' ',d.nom) as destinataire_nom
        FROM messages m
        JOIN utilisateurs e ON m.expediteur_id   = e.id
        JOIN utilisateurs d ON m.destinataire_id = d.id
        WHERE m.expediteur_id=? OR m.destinataire_id=?
        ORDER BY m.created_at DESC
    ");
    $stmt->execute([$user['id'], $user['id']]);
    echo json_encode($stmt->fetchAll());
}

elseif ($method === 'POST') {
    if (empty($input['destinataire_id']) || empty($input['contenu'])) {
        http_response_code(400);
        die(json_encode(['error' => 'Destinataire et contenu requis']));
    }
    $stmt = $db->prepare("INSERT INTO messages (expediteur_id,destinataire_id,objet,contenu,lu) VALUES (?,?,?,?,0)");
    $stmt->execute([$user['id'], $input['destinataire_id'], $input['objet']??'', $input['contenu']]);
    echo json_encode(['id' => $db->lastInsertId(), 'message' => 'Message envoyé']);
}

elseif ($method === 'PUT') {
    // Marquer les messages d'un interlocuteur comme lus
    $interlocuteur_id = intval($_GET['interlocuteur_id'] ?? 0);
    if ($interlocuteur_id) {
        $stmt = $db->prepare("UPDATE messages SET lu=1 WHERE expediteur_id=? AND destinataire_id=?");
        $stmt->execute([$interlocuteur_id, $user['id']]);
        echo json_encode(['message' => 'Messages marqués comme lus']);
    } else {
        http_response_code(400);
        echo json_encode(['error' => 'ID interlocuteur requis']);
    }
}

else { http_response_code(405); echo json_encode(['error' => 'Méthode non autorisée']); }
