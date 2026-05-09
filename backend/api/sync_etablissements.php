<?php
require_once __DIR__ . '/../config/database.php';

try {
    $db = getDB();
    
    // 1. Check for approved requests that don't have an establishment yet
    // We'll search by email as a simple unique identifier for now
    $stmt = $db->query("SELECT * FROM demandes_adhesion WHERE statut = 'approuve'");
    $demandes = $stmt->fetchAll();
    
    $created = 0;
    foreach($demandes as $d) {
        // Check if establishment already exists
        $check = $db->prepare("SELECT id FROM etablissements WHERE nom = ? OR email = ?");
        $check->execute([$d['nom_etablissement'], $d['email_contact']]);
        
        if (!$check->fetch()) {
            // Create Etablissement
            $ins = $db->prepare("INSERT INTO etablissements (nom, ville, email, adresse, telephone) VALUES (?, ?, ?, ?, ?)");
            $ins->execute([
                $d['nom_etablissement'], 
                $d['ville'], 
                $d['email_contact'],
                $d['adresse'] ?? '',
                $d['telephone'] ?? ''
            ]);
            $created++;
        }
    }
    
    echo json_encode(["success" => true, "message" => "$created établissements synchronisés"]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
