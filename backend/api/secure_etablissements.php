<?php
require_once __DIR__ . '/../config/database.php';

try {
    $db = getDB();
    
    // 1. Add 'statut' column to etablissements if missing
    $db->exec("ALTER TABLE etablissements ADD COLUMN IF NOT EXISTS statut VARCHAR(20) DEFAULT 'actif' AFTER type");
    
    // 2. Ensure all existing ones are 'actif' (since they are already in the final table)
    $db->exec("UPDATE etablissements SET statut = 'actif' WHERE statut IS NULL");
    
    echo json_encode(["success" => true, "message" => "Sécurité des statuts activée"]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
