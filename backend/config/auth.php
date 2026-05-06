<?php
require_once __DIR__ . '/database.php';

function generateToken(): string {
    return bin2hex(random_bytes(32));
}

function getAuthUser(): ?array {
    $headers = getallheaders();
    $auth    = $headers['Authorization'] ?? ($headers['authorization'] ?? '');
    $token   = str_replace('Bearer ', '', $auth);
    if (empty($token)) return null;
    $db   = getDB();
    $stmt = $db->prepare("
        SELECT u.*, e.nom as etablissement_nom
        FROM sessions s
        JOIN utilisateurs u ON s.utilisateur_id = u.id
        LEFT JOIN etablissements e ON u.etablissement_id = e.id
        WHERE s.id = ? AND s.expires_at > NOW() AND u.actif = 1
    ");
    $stmt->execute([$token]);
    return $stmt->fetch() ?: null;
}

function requireAuth(): array {
    $user = getAuthUser();
    if (!$user) { http_response_code(401); die(json_encode(['error'=>'Non authentifié'])); }
    return $user;
}

function requireRole(array $roles): array {
    $user = requireAuth();
    if (!in_array($user['role'], $roles)) { http_response_code(403); die(json_encode(['error'=>'Accès refusé'])); }
    return $user;
}
