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
        // Correction : Retrait de 'type' car non présent en base
        $sql = "SELECT e.id, e.nom, e.adresse, e.ville, e.telephone, e.email, e.type,
                (SELECT COUNT(*) FROM utilisateurs u WHERE u.etablissement_id = e.id) as membres_count
                FROM etablissements e 
                ORDER BY e.nom ASC";
        
        $stmt = $db->query($sql);
        $data = $stmt->fetchAll();
        
        echo json_encode($data);
    } elseif ($method === 'POST') {
        if ($user['role'] !== 'admin') throw new Exception("Action réservée aux administrateurs", 403);
        $data = json_decode(file_get_contents("php://input"), true);
        
        $sql = "INSERT INTO etablissements (nom, adresse, ville, telephone, email, type) 
                VALUES (:nom, :adresse, :ville, :telephone, :email, :type)";
        $stmt = $db->prepare($sql);
        $stmt->execute([
            ":nom" => $data['nom'],
            ":adresse" => $data['adresse'],
            ":ville" => $data['ville'],
            ":telephone" => $data['telephone'],
            ":email" => $data['email'],
            ":type" => $data['type'] ?? 'hopital'
        ]);
        echo json_encode(["message" => "Établissement créé", "id" => $db->lastInsertId()]);
    } elseif ($method === 'PUT') {
        if ($user['role'] !== 'admin') throw new Exception("Action réservée aux administrateurs", 403);
        $id = $_GET['id'] ?? null;
        if (!$id) throw new Exception("ID manquant");
        
        $data = json_decode(file_get_contents("php://input"), true);
        $sql = "UPDATE etablissements SET nom = :nom, adresse = :adresse, ville = :ville, 
                telephone = :telephone, email = :email, type = :type WHERE id = :id";
        $stmt = $db->prepare($sql);
        $stmt->execute([
            ":nom" => $data['nom'],
            ":adresse" => $data['adresse'],
            ":ville" => $data['ville'],
            ":telephone" => $data['telephone'],
            ":email" => $data['email'],
            ":type" => $data['type'],
            ":id" => $id
        ]);
        echo json_encode(["message" => "Établissement mis à jour"]);
    } elseif ($method === 'DELETE') {
        if ($user['role'] !== 'admin') throw new Exception("Action réservée aux administrateurs", 403);
        $id = $_GET['id'] ?? null;
        if (!$id) throw new Exception("ID manquant");
        
        $sql = "DELETE FROM etablissements WHERE id = :id";
        $stmt = $db->prepare($sql);
        $stmt->execute([":id" => $id]);
        echo json_encode(["message" => "Établissement supprimé"]);
    }
} catch (Exception $e) {
    http_response_code($e->getCode() ?: 400);
    echo json_encode(["error" => $e->getMessage()]);
}
