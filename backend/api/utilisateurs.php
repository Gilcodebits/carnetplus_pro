<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/auth.php';

$user = requireAuth();
$db   = getDB();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $role = $_GET['role'] ?? '';
    $where = $role ? "WHERE role = ?" : "WHERE 1=1";
    $params = $role ? [$role] : [];
    
    // Inclure etablissement_id et actif pour que le frontend puisse filtrer
    $stmt = $db->prepare("SELECT id, nom, prenom, email, role, etablissement_id, telephone, actif FROM utilisateurs $where ORDER BY id ASC");
    $stmt->execute($params);
    echo json_encode($stmt->fetchAll());
    exit;
}

if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data) {
        http_response_code(400);
        echo json_encode(['error' => 'Données invalides']);
        exit;
    }

    $prenom = $data['prenom'] ?? '';
    $nom    = $data['nom'] ?? '';
    $email  = $data['email'] ?? '';
    $role   = $data['role'] ?? 'medecin';
    $etab_id = $data['etablissement_id'] ?? null;
    $tel     = $data['telephone'] ?? '';
    $pass    = $data['password'] ?? 'password123';
    
    $hashed_pass = password_hash($pass, PASSWORD_BCRYPT);

    try {
        $stmt = $db->prepare("INSERT INTO utilisateurs (nom, prenom, email, mot_de_passe, role, etablissement_id, telephone, actif) VALUES (?, ?, ?, ?, ?, ?, ?, 1)");
        $stmt->execute([$nom, $prenom, $email, $hashed_pass, $role, $etab_id, $tel]);
        
        $newId = $db->lastInsertId();
        echo json_encode(['success' => true, 'id' => $newId]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Erreur lors de la création : ' . $e->getMessage()]);
    }
    exit;
}

if ($method === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = $data['id'] ?? null;
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'ID manquant']);
        exit;
    }

    $prenom = $data['prenom'] ?? '';
    $nom    = $data['nom'] ?? '';
    $email  = $data['email'] ?? '';
    $role   = $data['role'] ?? '';
    $etab_id = $data['etablissement_id'] ?? null;
    $tel     = $data['telephone'] ?? '';

    try {
        $stmt = $db->prepare("UPDATE utilisateurs SET nom=?, prenom=?, email=?, role=?, etablissement_id=?, telephone=? WHERE id=?");
        $stmt->execute([$nom, $prenom, $email, $role, $etab_id, $tel, $id]);
        echo json_encode(['success' => true]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Erreur lors de la mise à jour']);
    }
    exit;
}

if ($method === 'DELETE') {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = $data['id'] ?? null;
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'ID manquant']);
        exit;
    }

    try {
        // Au lieu de supprimer, on peut désactiver l'utilisateur
        $stmt = $db->prepare("UPDATE utilisateurs SET actif=0 WHERE id=?");
        $stmt->execute([$id]);
        echo json_encode(['success' => true]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Erreur lors de la suppression']);
    }
    exit;
}
