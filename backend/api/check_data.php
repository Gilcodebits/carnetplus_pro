<?php
require_once __DIR__ . '/../config/database.php';
$db = getDB();

echo "--- Demandes Approuvées ---\n";
$stmt = $db->query("SELECT id, nom_etablissement, statut FROM demandes_adhesion WHERE statut = 'approuve'");
print_r($stmt->fetchAll());

echo "\n--- Liste Etablissements ---\n";
$stmt = $db->query("SELECT id, nom, email FROM etablissements");
print_r($stmt->fetchAll());
