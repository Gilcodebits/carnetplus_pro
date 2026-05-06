<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/auth.php';
requireAuth();
$db = getDB();
$stmt = $db->query("SELECT id,nom,ville,adresse FROM etablissements ORDER BY nom");
echo json_encode($stmt->fetchAll());
