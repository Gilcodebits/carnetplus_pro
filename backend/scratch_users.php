<?php
require_once __DIR__ . '/config/database.php';
$db = getDB();
$users = $db->query("SELECT email, role, nom, prenom FROM utilisateurs LIMIT 10")->fetchAll();
echo json_encode($users, JSON_PRETTY_PRINT);
