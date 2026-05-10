<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/auth.php';

$user = requireAuth();
$db = getDB();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $userId = intval($_GET['user_id'] ?? $user['id']);
    
    // Sécurité: Un utilisateur normal ne peut voir que ses propres notifications
    if ($user['role'] !== 'admin' && $userId !== $user['id']) {
        http_response_code(403);
        die(json_encode(['error' => 'Accès non autorisé']));
    }
    
    $stmt = $db->prepare("SELECT * FROM notifications WHERE utilisateur_id = ? ORDER BY created_at DESC LIMIT 50");
    $stmt->execute([$userId]);
    echo json_encode($stmt->fetchAll() ?: []);
} 
elseif ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?? [];
    $action = $input['action'] ?? '';
    $id = intval($input['id'] ?? 0);
    
    // Les actions POST (mark_read, delete) s'appliquent implicitement à l'utilisateur connecté
    $userId = $user['id'];
    
    if ($action === 'mark_read' && $id) {
        $stmt = $db->prepare("UPDATE notifications SET lu = 1 WHERE id = ? AND utilisateur_id = ?");
        $stmt->execute([$id, $userId]);
        echo json_encode(['success' => true]);
    } 
    elseif ($action === 'mark_all_read') {
        $stmt = $db->prepare("UPDATE notifications SET lu = 1 WHERE utilisateur_id = ?");
        $stmt->execute([$userId]);
        echo json_encode(['success' => true]);
    } 
    elseif ($action === 'delete' && $id) {
        $stmt = $db->prepare("DELETE FROM notifications WHERE id = ? AND utilisateur_id = ?");
        $stmt->execute([$id, $userId]);
        echo json_encode(['success' => true]);
    } 
    elseif ($action === 'delete_all') {
        $stmt = $db->prepare("DELETE FROM notifications WHERE utilisateur_id = ?");
        $stmt->execute([$userId]);
        echo json_encode(['success' => true]);
    } 
    else {
        http_response_code(400);
        echo json_encode(['error' => 'Action non valide ou manquante']);
    }
} 
else {
    http_response_code(405);
    echo json_encode(['error' => 'Méthode non autorisée']);
}
