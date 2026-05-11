<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/auth.php';

$method = $_SERVER['REQUEST_METHOD'];
$db = getDB();

try {
    $user = requireAuth();
    // Autoriser les admins ET les gestionnaires à voir le réseau
    if (!in_array($user['role'], ['admin', 'gestionnaire'])) {
        throw new Exception("Accès refusé", 403);
    }

    if ($method === 'GET') {
        // Correction : La table 'etablissements' n'a pas de colonne 'statut' dans carnetplus.sql
        // On récupère simplement tous les établissements enregistrés
        $sql = "SELECT e.id, e.nom, e.type, e.adresse, e.ville, e.telephone, e.email,
                (SELECT COUNT(*) FROM utilisateurs u WHERE u.etablissement_id = e.id) as membres_count
                FROM etablissements e 
                ORDER BY e.nom ASC";
        
        $stmt = $db->query($sql);
        $data = $stmt->fetchAll();
        
        echo json_encode($data);
    } 
} catch (Exception $e) {
    http_response_code($e->getCode() ?: 400);
    echo json_encode(["error" => $e->getMessage()]);
}
