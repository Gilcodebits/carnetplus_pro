<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/auth.php';

$method = $_SERVER['REQUEST_METHOD'];
$input  = json_decode(file_get_contents('php://input'), true) ?? [];

// POST /api/auth.php?action=login
$action = $_GET['action'] ?? '';

if ($method === 'POST' && $action === 'login') {
    $email = trim($input['email'] ?? '');
    $mdp   = $input['mot_de_passe'] ?? '';

    if (empty($email) || empty($mdp)) {
        http_response_code(400);
        echo json_encode(['error' => 'Email et mot de passe requis']);
        exit;
    }

    $db   = getDB();
    $stmt = $db->prepare("
        SELECT u.*, e.nom as etablissement_nom
        FROM utilisateurs u
        LEFT JOIN etablissements e ON u.etablissement_id = e.id
        WHERE u.email = ? AND u.actif = 1
    ");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($mdp, $user['mot_de_passe'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Identifiants incorrects']);
        exit;
    }

    // Créer session
    $token     = generateToken();
    $expiresAt = date('Y-m-d H:i:s', strtotime('+8 hours'));
    $ip        = $_SERVER['REMOTE_ADDR'] ?? '';
    $ua        = $_SERVER['HTTP_USER_AGENT'] ?? '';

    $db->prepare("INSERT INTO sessions (id, utilisateur_id, ip_address, user_agent, expires_at) VALUES (?,?,?,?,?)")
       ->execute([$token, $user['id'], $ip, $ua, $expiresAt]);

    // Log
    $db->prepare("INSERT INTO audit_logs (utilisateur_id, action, ip) VALUES (?,?,?)")
       ->execute([$user['id'], 'login', $ip]);

    unset($user['mot_de_passe']);

    echo json_encode([
        'token'     => $token,
        'user'      => $user,
        'expires_at'=> $expiresAt,
    ]);
}

elseif ($method === 'POST' && $action === 'logout') {
    $headers = getallheaders();
    $token   = str_replace('Bearer ', '', $headers['Authorization'] ?? '');
    if ($token) {
        getDB()->prepare("DELETE FROM sessions WHERE id = ?")->execute([$token]);
    }
    echo json_encode(['message' => 'Déconnecté']);
}

elseif ($method === 'GET' && $action === 'me') {
    $user = requireAuth();
    unset($user['mot_de_passe']);
    echo json_encode($user);
}

else {
    http_response_code(404);
    echo json_encode(['error' => 'Action non trouvée']);
}
