<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/auth.php';

$method = $_SERVER['REQUEST_METHOD'];
$db = getDB();

try {
    $user = requireAuth();
    if ($user['role'] !== 'admin') throw new Exception("Accès refusé", 403);

    if ($method === 'GET') {
        // ONLY fetch 'actif' establishments
        $sql = "SELECT e.*, 
                (SELECT COUNT(*) FROM utilisateurs u WHERE u.etablissement_id = e.id) as membres_count
                FROM etablissements e 
                WHERE e.statut = 'actif'
                ORDER BY e.nom";
        
        $stmt = $db->query($sql);
        echo json_encode($stmt->fetchAll());
    } 
} catch (Exception $e) {
    http_response_code($e->getCode() ?: 400);
    echo json_encode(["error" => $e->getMessage()]);
}
