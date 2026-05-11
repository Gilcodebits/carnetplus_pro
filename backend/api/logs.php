<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/auth.php';

$user = requireAuth();
$db = getDB();

try {
    // Seuls les admins et les gestionnaires peuvent voir les logs d'audit
    if (!in_array($user['role'], ['admin', 'gestionnaire'])) {
        http_response_code(403);
        echo json_encode(['error' => 'Accès refusé']);
        exit;
    }

    $where = "1=1";
    if ($user['role'] === 'gestionnaire') {
        $etabId = intval($user['etablissement_id']);
        $where = "u.etablissement_id = $etabId";
    }

    $stmt = $db->query("
        SELECT 
            a.id, 
            a.action, 
            COALESCE(a.details, '') as details, 
            COALESCE(a.ip, '0.0.0.0') as ip, 
            a.created_at as date,
            COALESCE(CONCAT_WS(' ', u.prenom, u.nom), 'Personnel') as utilisateur,
            CASE 
                WHEN a.action LIKE '%ERREUR%' OR a.action LIKE '%ECHEC%' THEN 'ALERT'
                ELSE 'SUCCESS'
            END as statut
        FROM audit_logs a
        JOIN utilisateurs u ON a.utilisateur_id = u.id
        WHERE $where
        ORDER BY a.created_at DESC
        LIMIT 100
    ");
    
    echo json_encode($stmt->fetchAll());

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
