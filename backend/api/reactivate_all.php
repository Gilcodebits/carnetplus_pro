<?php
require_once __DIR__ . '/../config/database.php';

try {
    $db = getDB();
    
    // Force ALL existing establishments to 'actif' status
    $count = $db->exec("UPDATE etablissements SET statut = 'actif'");
    
    echo json_encode(["success" => true, "message" => "$count établissements réactivés"]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
