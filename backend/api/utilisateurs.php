<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/auth.php';
$user = requireAuth();
$db   = getDB();
$role = $_GET['role'] ?? '';
$where = $role ? "WHERE role = ?" : "WHERE 1=1";
$params = $role ? [$role] : [];
$stmt = $db->prepare("SELECT id, nom, prenom, email, role, telephone FROM utilisateurs $where AND actif=1 ORDER BY nom");
$stmt->execute($params);
echo json_encode($stmt->fetchAll());
