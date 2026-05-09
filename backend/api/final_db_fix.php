<?php
require_once __DIR__ . '/../config/database.php';

try {
    $db = getDB();
    
    // Attempt to add column without 'IF NOT EXISTS' for better compatibility
    // We wrap it in a try-catch in case it already exists
    try {
        $db->exec("ALTER TABLE etablissements ADD statut VARCHAR(20) DEFAULT 'actif' AFTER email");
    } catch (Exception $e) {
        // Column probably exists, it's fine
    }
    
    // Double check 'type' as well
    try {
        $db->exec("ALTER TABLE etablissements ADD type VARCHAR(50) DEFAULT 'hopital' AFTER nom");
    } catch (Exception $e) {}

    // Force values
    $db->exec("UPDATE etablissements SET statut = 'actif' WHERE statut IS NULL OR statut = ''");
    
    echo json_encode(["success" => true, "message" => "Base de données réparée et établissements réactivés"]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
