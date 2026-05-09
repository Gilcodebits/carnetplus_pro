<?php
require_once __DIR__ . '/../config/database.php';

try {
    $db = getDB();
    
    // 1. Add 'type' column to etablissements table if it doesn't exist
    $db->exec("ALTER TABLE etablissements ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'hopital' AFTER nom");
    
    // 2. Sync 'type' from demandes_adhesion to etablissements
    $stmt = $db->query("SELECT nom_etablissement, type_structure FROM demandes_adhesion");
    $demandes = $stmt->fetchAll();
    
    foreach($demandes as $d) {
        $upd = $db->prepare("UPDATE etablissements SET type = ? WHERE nom = ? AND (type IS NULL OR type = 'hopital')");
        $upd->execute([$d['type_structure'], $d['nom_etablissement']]);
    }
    
    echo json_encode(["success" => true, "message" => "Structure DB mise à jour et types synchronisés"]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
