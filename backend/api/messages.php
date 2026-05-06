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
    $stmt = $db->prepare("INSERT INTO messages (expediteur_id,destinataire_id,objet,contenu) VALUES (?,?,?,?)");
    $stmt->execute([$user['id'], $input['destinataire_id'], $input['objet']??'', $input['contenu']]);
    echo json_encode(['id' => $db->lastInsertId(), 'message' => 'Message envoyé']);
}

else { http_response_code(405); echo json_encode(['error' => 'Méthode non autorisée']); }
