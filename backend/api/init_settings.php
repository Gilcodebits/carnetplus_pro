<?php
require_once __DIR__ . '/../config/database.php';

try {
    $db = getDB();
    
    // Create settings table
    $db->exec("CREATE TABLE IF NOT EXISTS settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        cle VARCHAR(50) UNIQUE NOT NULL,
        valeur TEXT,
        groupe VARCHAR(50) DEFAULT 'general',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )");
    
    // Insert default settings if empty
    $defaults = [
        ['app_name', 'CarnetPlus Pro', 'general'],
        ['support_email', 'support@carnetplus.com', 'general'],
        ['maintenance_mode', 'false', 'security'],
        ['min_password_length', '8', 'security'],
        ['session_timeout', '60', 'security'],
        ['allow_registration', 'true', 'general']
    ];
    
    foreach($defaults as $d) {
        $stmt = $db->prepare("INSERT IGNORE INTO settings (cle, valeur, groupe) VALUES (?, ?, ?)");
        $stmt->execute($d);
    }
    
    echo json_encode(["success" => true, "message" => "Table des paramètres initialisée"]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
