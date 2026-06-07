<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/auth.php';

$user = requireAuth();
$db   = getDB();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $role = $_GET['role'] ?? '';

    // Sécurité multi-tenancy
    if ($user['role'] === 'gestionnaire') {
        $etabId = intval($user['etablissement_id']);
        $where  = $role
            ? "WHERE u.role = ? AND u.etablissement_id = $etabId AND u.role NOT IN ('admin','gestionnaire','patient')"
            : "WHERE u.etablissement_id = $etabId AND u.role NOT IN ('admin','gestionnaire','patient')";
        $params = $role ? [$role] : [];
    } elseif ($user['role'] === 'secretaire') {
        // La secrétaire ne voit que les utilisateurs de son propre établissement
        $etabId = intval($user['etablissement_id']);
        $where  = $role
            ? "WHERE u.role = ? AND u.etablissement_id = $etabId"
            : "WHERE u.etablissement_id = $etabId";
        $params = $role ? [$role] : [];
    } else {
        $where  = $role ? "WHERE u.role = ?" : "WHERE 1=1";
        $params = $role ? [$role] : [];
    }

    $stmt = $db->prepare("
        SELECT u.id, u.nom, u.prenom, u.email, u.role, u.etablissement_id, u.telephone, u.actif,
               e.nom as etablissement_nom
        FROM utilisateurs u
        LEFT JOIN etablissements e ON u.etablissement_id = e.id
        $where
        ORDER BY u.id ASC
    ");
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

    $prenom  = $data['prenom'] ?? '';
    $nom     = $data['nom'] ?? '';
    $email   = $data['email'] ?? '';
    $role    = $data['role'] ?? 'medecin';
    $etab_id = $data['etablissement_id'] ?? ($user['etablissement_id'] ?? null);
    $tel     = $data['telephone'] ?? '';

    // Génération automatique d'un mot de passe temporaire fort
    $chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    $pass  = substr(str_shuffle(str_repeat($chars, 3)), 0, 10);
    
    $hashed_pass = password_hash($pass, PASSWORD_BCRYPT);

    try {
        $stmt = $db->prepare("INSERT INTO utilisateurs (nom, prenom, email, mot_de_passe, role, etablissement_id, telephone, actif) VALUES (?, ?, ?, ?, ?, ?, ?, 1)");
        $stmt->execute([$nom, $prenom, $email, $hashed_pass, $role, $etab_id, $tel]);
        
        $newId = $db->lastInsertId();

        // Envoyer email de bienvenue au nouveau membre du personnel
        require_once __DIR__ . '/../config/mail.php';
        $roleLabel = [
            'admin' => 'Administrateur',
            'medecin' => 'Médecin',
            'secretaire' => 'Secrétaire',
            'labo' => 'Technicien de Laboratoire',
            'gestionnaire' => 'Gestionnaire'
        ][$role] ?? $role;

        $subject = "Vos accès CarnetPlus Health - $roleLabel";
        $body = "
            <div style='font-family: sans-serif; padding: 20px; color: #1e293b;'>
                <h2 style='color: #2563eb;'>Bienvenue dans l'équipe CarnetPlus</h2>
                <p>Bonjour <strong>$prenom $nom</strong>,</p>
                <p>Un compte membre du personnel vous a été créé avec le rôle de <strong>$roleLabel</strong>.</p>
                <p>Vous pouvez désormais accéder à la plateforme avec les identifiants suivants :</p>
                <div style='background: #f1f5f9; padding: 15px; border-radius: 10px; margin: 20px 0;'>
                    <p style='margin: 5px 0;'><strong>Lien :</strong> <a href='http://localhost:5173/login' style='color: #2563eb;'>Accéder au portail</a></p>
                    <p style='margin: 5px 0;'><strong>Email :</strong> $email</p>
                    <p style='margin: 5px 0;'><strong>Mot de passe temporaire :</strong> $pass</p>
                </div>
                <p style='font-size: 0.9em; color: #64748b;'><em>Nous vous recommandons de changer votre mot de passe lors de votre première connexion.</em></p>
                <hr style='border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;' />
                <p style='font-size: 0.8em; color: #94a3b8;'>Cordialement,<br />L'équipe CarnetPlus</p>
            </div>
        ";
        sendEmail($email, $subject, $body);

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
