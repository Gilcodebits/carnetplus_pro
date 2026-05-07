<?php
require_once '../config/database.php';
require_once '../config/cors.php';

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];
$userId = $_GET['user_id'] ?? null;

if (!$userId) {
    echo json_encode(['error' => 'User ID required']);
    exit;
}

try {
    if ($method === 'GET') {
        // Fetch notifications
        $stmt = $pdo->prepare("SELECT * FROM notifications WHERE utilisateur_id = ? ORDER BY created_at DESC");
        $stmt->execute([$userId]);
        $notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($notifications);
    } 
    elseif ($method === 'POST') {
        // Mark as read or mark all as read
        $data = json_decode(file_get_contents('php://input'), true);
        $action = $data['action'] ?? null;
        $notifId = $data['id'] ?? null;

        if ($action === 'mark_read' && $notifId) {
            $stmt = $pdo->prepare("UPDATE notifications SET lu = 1 WHERE id = ? AND utilisateur_id = ?");
            $stmt->execute([$notifId, $userId]);
            echo json_encode(['success' => true]);
        } elseif ($action === 'mark_all_read') {
            $stmt = $pdo->prepare("UPDATE notifications SET lu = 1 WHERE utilisateur_id = ?");
            $stmt->execute([$userId]);
            echo json_encode(['success' => true]);
        } elseif ($action === 'delete' && $notifId) {
            $stmt = $pdo->prepare("DELETE FROM notifications WHERE id = ? AND utilisateur_id = ?");
            $stmt->execute([$notifId, $userId]);
            echo json_encode(['success' => true]);
        } elseif ($action === 'delete_all') {
            $stmt = $pdo->prepare("DELETE FROM notifications WHERE utilisateur_id = ?");
            $stmt->execute([$userId]);
            echo json_encode(['success' => true]);
        }
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
