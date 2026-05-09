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
        $stmt = $db->query("SELECT cle, valeur FROM settings");
        $results = $stmt->fetchAll();
        $settings = [];
        foreach($results as $row) {
            $settings[$row['cle']] = $row['valeur'];
        }
        echo json_encode($settings);
    } 
    elseif ($method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data) throw new Exception("Données invalides");

        $db->beginTransaction();
        foreach($data as $key => $value) {
            $stmt = $db->prepare("UPDATE settings SET valeur = ? WHERE cle = ?");
            $stmt->execute([$value, $key]);
        }
        $db->commit();
        echo json_encode(["success" => true, "message" => "Paramètres mis à jour"]);
    }
} catch (Exception $e) {
    if ($db->inTransaction()) $db->rollBack();
    http_response_code($e->getCode() ?: 400);
    echo json_encode(["error" => $e->getMessage()]);
}
