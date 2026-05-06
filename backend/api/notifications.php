<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/auth.php';

$user   = requireAuth();
$method = $_SERVER['REQUEST_METHOD'];
$db     = getDB();
$id     = intval($_GET['id'] ?? 0);

if ($method === 'GET') {
    $stmt = $db->prepare("
        SELECT * FROM notifications
        WHERE utilisateur_id = ?
        ORDER BY created_at DESC LIMIT 30
    ");
    $stmt->execute([$user['id']]);
    $notifs = $stmt->fetchAll();
    $unread = array_sum(array_map(fn($n) => !$n['lu'] ? 1 : 0, $notifs));
    echo json_encode(['notifications' => $notifs, 'unread' => $unread]);
}

elseif ($method === 'PUT') {
    // Marquer tout comme lu
    $db->prepare("UPDATE notifications SET lu=1 WHERE utilisateur_id=?")->execute([$user['id']]);
    echo json_encode(['message' => 'Notifications marquées comme lues']);
}

else { http_response_code(405); echo json_encode(['error' => 'Méthode non autorisée']); }
