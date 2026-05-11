<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/mail.php';

// Fixer le fuseau horaire pour éviter les décalages avec la BDD
date_default_timezone_set('Africa/Porto-Novo'); 

try {
    $db     = getDB();
    $method = $_SERVER['REQUEST_METHOD'];
    $action = $_GET['action'] ?? '';
    $input  = json_decode(file_get_contents('php://input'), true) ?? [];
    $now    = date('Y-m-d H:i:s');

    // ─── ÉTAPE 1 : Demande de réinitialisation (envoi email) ─────────────────────
    if ($method === 'POST' && $action === 'request') {
        $email = trim($input['email'] ?? '');
        if (empty($email)) {
            http_response_code(400);
            die(json_encode(['error' => 'Email requis']));
        }

        // S'assurer que la table existe
        $db->exec("CREATE TABLE IF NOT EXISTS password_resets (
            id INT AUTO_INCREMENT PRIMARY KEY,
            utilisateur_id INT NOT NULL,
            token VARCHAR(64) NOT NULL UNIQUE,
            expires_at DATETIME NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_token (token),
            INDEX idx_user (utilisateur_id)
        )");

        // Vérifier que l'utilisateur existe
        $stmt = $db->prepare("SELECT id, prenom, nom FROM utilisateurs WHERE email = ? AND actif = 1");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if ($user) {
            // Supprimer les anciens tokens
            $db->prepare("DELETE FROM password_resets WHERE utilisateur_id = ?")->execute([$user['id']]);

            // Générer un token
            $token     = bin2hex(random_bytes(32));
            $expiresAt = date('Y-m-d H:i:s', strtotime('+15 minutes'));

            $db->prepare("INSERT INTO password_resets (utilisateur_id, token, expires_at) VALUES (?, ?, ?)")
               ->execute([$user['id'], $token, $expiresAt]);

            // Envoyer l'email
            $resetLink = "http://localhost:5173/reset-password?token=$token";
            $subject   = "Réinitialisation de votre mot de passe CarnetPlus";
            $body = "
                <div style='font-family: sans-serif; padding: 30px; color: #1e293b; max-width: 500px; margin: auto;'>
                    <div style='background: #2563eb; padding: 20px; border-radius: 16px 16px 0 0; text-align: center;'>
                        <h1 style='color: white; margin: 0; font-size: 22px;'>🔐 CarnetPlus Health</h1>
                    </div>
                    <div style='background: #f8fafc; padding: 30px; border-radius: 0 0 16px 16px; border: 1px solid #e2e8f0;'>
                        <h2 style='color: #1e293b; margin-top: 0;'>Réinitialisation de mot de passe</h2>
                        <p>Bonjour <strong>{$user['prenom']} {$user['nom']}</strong>,</p>
                        <p>Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous :</p>
                        <div style='text-align: center; margin: 30px 0;'>
                            <a href='$resetLink'
                               style='background: #2563eb; color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;'>
                               Réinitialiser mon mot de passe
                            </a>
                        </div>
                        <p style='color: #64748b; font-size: 13px;'>⏱️ Ce lien est valable <strong>15 minutes</strong> seulement.</p>
                        <p style='color: #64748b; font-size: 13px;'>Si vous n'avez pas fait cette demande, ignorez cet email. Votre compte reste sécurisé.</p>
                        <hr style='border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;'>
                        <p style='font-size: 12px; color: #94a3b8; margin: 0;'>L'équipe CarnetPlus Health</p>
                    </div>
                </div>
            ";
            sendEmail($email, $subject, $body);
        }

        echo json_encode(['message' => 'Si cet email existe, un lien de réinitialisation a été envoyé.']);
    }

    // ─── ÉTAPE 2 : Validation du token ───────────────────────────────────────────
    elseif ($method === 'GET' && $action === 'verify') {
        $token = trim($_GET['token'] ?? '');
        if (empty($token)) {
            http_response_code(400);
            die(json_encode(['error' => 'Token manquant']));
        }

        $stmt = $db->prepare("SELECT * FROM password_resets WHERE token = ? AND expires_at > ?");
        $stmt->execute([$token, $now]);
        $reset = $stmt->fetch();

        if (!$reset) {
            http_response_code(400);
            die(json_encode(['error' => 'Lien invalide ou expiré. Veuillez refaire une demande.']));
        }

        echo json_encode(['valid' => true, 'message' => 'Token valide']);
    }

    // ─── ÉTAPE 3 : Mise à jour du mot de passe ───────────────────────────────────
    elseif ($method === 'POST' && $action === 'reset') {
        $token    = trim($input['token'] ?? '');
        $password = $input['password'] ?? '';

        if (empty($token) || empty($password)) {
            http_response_code(400);
            die(json_encode(['error' => 'Token et nouveau mot de passe requis']));
        }
        if (strlen($password) < 6) {
            http_response_code(400);
            die(json_encode(['error' => 'Le mot de passe doit contenir au moins 6 caractères']));
        }

        $stmt = $db->prepare("SELECT * FROM password_resets WHERE token = ? AND expires_at > ?");
        $stmt->execute([$token, $now]);
        $reset = $stmt->fetch();

        if (!$reset) {
            http_response_code(400);
            die(json_encode(['error' => 'Lien invalide ou expiré. Veuillez refaire une demande.']));
        }

        $hashed = password_hash($password, PASSWORD_BCRYPT);
        $db->prepare("UPDATE utilisateurs SET mot_de_passe = ? WHERE id = ?")
           ->execute([$hashed, $reset['utilisateur_id']]);

        $db->prepare("DELETE FROM password_resets WHERE token = ?")->execute([$token]);

        $ip = $_SERVER['REMOTE_ADDR'] ?? '';
        $details = json_encode(['method' => 'email_link', 'message' => 'Mot de passe réinitialisé via lien email']);
        $db->prepare("INSERT INTO audit_logs (utilisateur_id, action, details, ip) VALUES (?, ?, ?, ?)")
           ->execute([$reset['utilisateur_id'], 'password_reset', $details, $ip]);

        echo json_encode(['success' => true, 'message' => 'Mot de passe réinitialisé avec succès !']);
    }

    else {
        http_response_code(400);
        echo json_encode(['error' => 'Action non reconnue']);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Erreur Serveur: ' . $e->getMessage()]);
} catch (Error $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Erreur Fatale: ' . $e->getMessage()]);
}
