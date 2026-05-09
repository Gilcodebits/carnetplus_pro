<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/auth.php';

$method = $_SERVER['REQUEST_METHOD'];
$db = getDB();

try {
    if ($method === 'GET') {
        $user = requireAuth();
        if ($user['role'] !== 'admin') throw new Exception("Accès refusé", 403);
        $stmt = $db->query("SELECT * FROM demandes_adhesion ORDER BY created_at DESC");
        echo json_encode($stmt->fetchAll());
    } 
    elseif ($method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        if (empty($data['nom_etablissement']) || empty($data['email_contact'])) {
            throw new Exception("Veuillez renseigner le nom de l'établissement et l'email.", 400);
        }
        $stmt = $db->prepare("INSERT INTO demandes_adhesion (nom_etablissement, type_structure, ville, nom_responsable, email_contact) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([
            $data['nom_etablissement'],
            $data['type_structure'] ?? 'hopital',
            $data['ville'] ?? null,
            $data['nom_responsable'] ?? null,
            $data['email_contact']
        ]);
        echo json_encode(["success" => true, "message" => "Demande enregistrée"]);
    } 
    elseif ($method === 'PUT') {
        $user = requireAuth();
        if ($user['role'] !== 'admin') throw new Exception("Accès refusé", 403);

        $id = $_GET['id'] ?? null;
        $data = json_decode(file_get_contents('php://input'), true);
        $statut = $data['statut'] ?? null;

        if (!$id || !$statut) throw new Exception("ID ou statut manquant", 400);

        // 1. Get the request details
        $stmt = $db->prepare("SELECT * FROM demandes_adhesion WHERE id = ?");
        $stmt->execute([$id]);
        $demande = $stmt->fetch();
        if (!$demande) throw new Exception("Demande introuvable");

        // 2. If approving, create Etablissement and Gestionnaire
        if ($statut === 'approuve' && $demande['statut'] !== 'approuve') {
            $db->beginTransaction();
            try {
                // Create Etablissement
                $stmt = $db->prepare("INSERT INTO etablissements (nom, type, ville, email, adresse, telephone, statut) VALUES (?, ?, ?, ?, ?, ?, 'actif')");
                $stmt->execute([
                    $demande['nom_etablissement'], 
                    $demande['type_structure'],
                    $demande['ville'], 
                    $demande['email_contact'],
                    $demande['adresse'] ?? '',
                    $demande['telephone'] ?? ''
                ]);
                $etablissement_id = $db->lastInsertId();

                // Create Gestionnaire account
                // Split name (simple logic)
                $nameParts = explode(' ', $demande['nom_responsable'] ?? 'Responsable');
                $prenom = $nameParts[0];
                $nom = count($nameParts) > 1 ? implode(' ', array_slice($nameParts, 1)) : 'Nom';
                
                $default_pass = 'Carnet2024';
                $hashed_pass = password_hash($default_pass, PASSWORD_DEFAULT);

                $stmt = $db->prepare("INSERT INTO utilisateurs (nom, prenom, email, mot_de_passe, role, etablissement_id, actif) VALUES (?, ?, ?, ?, 'gestionnaire', ?, 1)");
                $stmt->execute([$nom, $prenom, $demande['email_contact'], $hashed_pass, $etablissement_id]);

                // Update request status
                $stmt = $db->prepare("UPDATE demandes_adhesion SET statut = 'approuve' WHERE id = ?");
                $stmt->execute([$id]);

                $db->commit();
                
                // Simulation of Email sending
                $email_content = "Bonjour {$demande['nom_responsable']},\n\n" .
                                "Félicitations ! Votre établissement '{$demande['nom_etablissement']}' a été approuvé sur le réseau CarnetPlus.\n" .
                                "Vous pouvez désormais vous connecter avec les identifiants suivants :\n" .
                                "Email : {$demande['email_contact']}\n" .
                                "Mot de passe temporaire : {$default_pass}\n\n" .
                                "Cordialement,\nL'équipe CarnetPlus.";
                
                // In a real app, use mail() or a library like PHPMailer
                // For now we log it or return it in response for demo
                echo json_encode([
                    "success" => true, 
                    "message" => "Établissement et compte gestionnaire créés avec succès.",
                    "debug_email" => $email_content
                ]);
            } catch (Exception $e) {
                $db->rollBack();
                throw $e;
            }
        } else {
            // Simple status update for rejection or already approved
            $stmt = $db->prepare("UPDATE demandes_adhesion SET statut = ? WHERE id = ?");
            $stmt->execute([$statut, $id]);
            echo json_encode(["success" => true, "message" => "Statut mis à jour"]);
        }
    }
} catch (Exception $e) {
    http_response_code($e->getCode() ?: 400);
    echo json_encode(["error" => $e->getMessage()]);
}
