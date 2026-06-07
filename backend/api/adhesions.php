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
        
        // Vérifier si une demande identique est déjà en attente
        $check = $db->prepare("SELECT id FROM demandes_adhesion WHERE email_contact = ? AND statut = 'en_attente'");
        $check->execute([$data['email_contact']]);
        if ($check->fetch()) {
            http_response_code(400);
            echo json_encode(['error' => 'Une demande est déjà en cours de traitement pour cette adresse email.']);
            exit;
        }

        if (empty($data['nom_etablissement']) || empty($data['email_contact'])) {
            throw new Exception("Veuillez renseigner le nom de l'établissement et l'email.", 400);
        }

        // Validation du numéro de téléphone : chiffres, +, espaces, tirets, parenthèses uniquement
        $telephone = $data['telephone'] ?? '';
        if (!empty($telephone) && !preg_match('/^[0-9+\s\-\(\)]+$/', $telephone)) {
            http_response_code(400);
            echo json_encode(['error' => 'Le numéro de téléphone doit uniquement contenir des chiffres et des caractères de formatage (+, -, espaces).']);
            exit;
        }

        $stmt = $db->prepare("INSERT INTO demandes_adhesion (nom_etablissement, type_structure, ville, nom_responsable, email_contact, adresse, telephone, motif) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $data['nom_etablissement'],
            $data['type_structure'] ?? 'hopital',
            $data['ville'] ?? null,
            $data['nom_responsable'] ?? null,
            $data['email_contact'],
            $data['adresse'] ?? null,
            $telephone ?: null,
            $data['motif'] ?? null
        ]);
        $demandeId = $db->lastInsertId();

        // Notifier tous les administrateurs système
        $admins = $db->query("SELECT id FROM utilisateurs WHERE role = 'admin'")->fetchAll();
        foreach ($admins as $admin) {
            $notif_stmt = $db->prepare("INSERT INTO notifications (utilisateur_id, titre, message, type) VALUES (?, ?, ?, 'info')");
            $notif_stmt->execute([
                $admin['id'],
                "Nouvelle demande d'adhésion",
                "L'établissement '{$data['nom_etablissement']}' souhaite rejoindre le réseau."
            ]);
        }
        // Envoyer email de confirmation de réception
        require_once __DIR__ . '/../config/mail.php';
        $confirm_subject = "Demande d'adhésion CarnetPlus reçue";
        $confirm_body = "
            <div style='font-family: sans-serif; padding: 20px; color: #1e293b;'>
                <h2 style='color: #2563eb;'>Accusé de réception</h2>
                <p>Bonjour,</p>
                <p>Nous avons bien reçu votre demande d'adhésion pour l'établissement <strong>'{$data['nom_etablissement']}'</strong>.</p>
                <p>Notre équipe examine actuellement votre dossier. Vous recevrez une réponse par email sous 48h ouvrées.</p>
                <p>Merci de votre confiance.</p>
                <hr style='border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;' />
                <p style='font-size: 0.8em; color: #94a3b8;'>Ceci est un message automatique, merci de ne pas y répondre.<br />L'équipe CarnetPlus Health</p>
            </div>
        ";
        $mail_res = sendEmail($data['email_contact'], $confirm_subject, $confirm_body);

        echo json_encode([
            "success" => true, 
            "message" => "Demande enregistrée et email de confirmation envoyé",
            "mail_status" => $mail_res === true ? "success" : "failed",
            "mail_error" => $mail_res === true ? null : $mail_res
        ]);
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
                // Create Etablissement (Fix structure to match DB)
                $stmt = $db->prepare("INSERT INTO etablissements (nom, ville, email, adresse, telephone) VALUES (?, ?, ?, ?, ?)");
                $stmt->execute([
                    $demande['nom_etablissement'], 
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
                
                // Check if user already exists and cleanup if orphan (from previous failed attempts)
                $checkUser = $db->prepare("SELECT id, etablissement_id FROM utilisateurs WHERE email = ?");
                $checkUser->execute([$demande['email_contact']]);
                $existingUser = $checkUser->fetch();
                
                if ($existingUser) {
                    if ($existingUser['etablissement_id'] === null) {
                        // Safe to cleanup orphan user from failed attempt
                        $db->prepare("DELETE FROM utilisateurs WHERE id = ?")->execute([$existingUser['id']]);
                    } else {
                        throw new Exception("Un compte utilisateur actif avec l'adresse email '{$demande['email_contact']}' existe déjà et est lié à un établissement.");
                    }
                }

                $default_pass = 'Carnet2024';
                $hashed_pass = password_hash($default_pass, PASSWORD_DEFAULT);

                $stmt = $db->prepare("INSERT INTO utilisateurs (nom, prenom, email, mot_de_passe, role, etablissement_id, actif) VALUES (?, ?, ?, ?, 'gestionnaire', ?, 1)");
                $stmt->execute([$nom, $prenom, $demande['email_contact'], $hashed_pass, $etablissement_id]);

                // Update request status
                $stmt = $db->prepare("UPDATE demandes_adhesion SET statut = 'approuve' WHERE id = ?");
                $stmt->execute([$id]);

                $db->commit();
                
                require_once __DIR__ . '/../config/mail.php';
                $email_subject = "Bienvenue sur CarnetPlus - Accès Établissement";
                $email_body = "
                    <div style='font-family: sans-serif; padding: 20px; color: #1e293b;'>
                        <h2 style='color: #2563eb;'>Félicitations !</h2>
                        <p>Bonjour <strong>{$demande['nom_responsable']}</strong>,</p>
                        <p>Votre établissement <strong>'{$demande['nom_etablissement']}'</strong> a été approuvé sur le réseau <strong>CarnetPlus</strong>.</p>
                        <p>Vous pouvez désormais vous connecter à votre espace gestionnaire avec les identifiants suivants :</p>
                        <div style='background: #f1f5f9; padding: 15px; border-radius: 10px; margin: 20px 0;'>
                            <p style='margin: 5px 0;'><strong>Email :</strong> {$demande['email_contact']}</p>
                            <p style='margin: 5px 0;'><strong>Mot de passe temporaire :</strong> {$default_pass}</p>
                        </div>
                        <p style='font-size: 0.9em; color: #64748b;'><em>Nous vous recommandons de changer votre mot de passe dès votre première connexion.</em></p>
                        <hr style='border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;' />
                        <p style='font-size: 0.8em; color: #94a3b8;'>Cordialement,<br />L'équipe CarnetPlus Health</p>
                    </div>
                ";
                
                $mail_res = sendEmail($demande['email_contact'], $email_subject, $email_body);

                echo json_encode([
                    "success" => true, 
                    "message" => "Établissement approuvé et email d'accès envoyé.",
                    "mail_status" => $mail_res === true ? "success" : "failed",
                    "mail_error" => $mail_res === true ? null : $mail_res
                ]);
            } catch (Exception $e) {
                $db->rollBack();
                throw $e;
            }
        } else {
            // Rejet ou autre mise à jour simple
            $stmt = $db->prepare("UPDATE demandes_adhesion SET statut = ? WHERE id = ?");
            $stmt->execute([$statut, $id]);
            
            if ($statut === 'rejete') {
                require_once __DIR__ . '/../config/mail.php';
                $motif = $data['motif'] ?? 'Dossier non conforme ou informations manquantes.';
                $email_subject = "Suite à votre demande d'adhésion CarnetPlus";
                $email_body = "
                    <div style='font-family: sans-serif; padding: 20px; color: #1e293b;'>
                        <h2 style='color: #e11d48;'>Mise à jour de votre demande</h2>
                        <p>Bonjour,</p>
                        <p>Nous avons examiné votre demande d'adhésion pour l'établissement <strong>'{$demande['nom_etablissement']}'</strong>.</p>
                        <p>Nous avons le regret de vous informer que votre demande n'a pas pu être retenue pour le motif suivant :</p>
                        <div style='background: #fff1f2; padding: 15px; border-radius: 10px; border-left: 4px solid #e11d48; margin: 20px 0;'>
                            <p style='margin: 0;'><strong>Motif :</strong> $motif</p>
                        </div>
                        <p>Nous restons à votre disposition pour toute information complémentaire si vous souhaitez soumettre une nouvelle demande ultérieurement.</p>
                        <hr style='border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;' />
                        <p style='font-size: 0.8em; color: #94a3b8;'>Cordialement,<br />L'équipe CarnetPlus Health</p>
                    </div>
                ";
                sendEmail($demande['email_contact'], $email_subject, $email_body);
            }
            
            echo json_encode(["success" => true, "message" => "Statut mis à jour et email envoyé"]);
        }
    }
} catch (Exception $e) {
    http_response_code($e->getCode() ?: 400);
    echo json_encode(["error" => $e->getMessage()]);
}
