<?php

/**
 * Charge les variables d'environnement depuis le fichier .env
 */
function getEnvVar($key, $default = null) {
    static $vars = null;
    if ($vars === null) {
        $path = __DIR__ . '/../../.env';
        if (file_exists($path)) {
            $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            $vars = [];
            foreach ($lines as $line) {
                if (strpos(trim($line), '#') === 0) continue;
                $parts = explode('=', $line, 2);
                if (count($parts) === 2) {
                    $vars[trim($parts[0])] = trim($parts[1]);
                }
            }
        } else {
            $vars = [];
        }
    }
    return $vars[$key] ?? $default;
}

/**
 * Envoie un email via l'API Brevo (Sendinblue)
 */
function sendEmail($to, $subject, $content, $isHtml = true) {
    $apiKey = getEnvVar('BREVO_API_KEY');
    $senderName = getEnvVar('MAIL_SENDER_NAME', 'CarnetPlus');
    $senderEmail = getEnvVar('MAIL_SENDER_EMAIL', 'noreply@carnetplus.com');

    if (!$apiKey) {
        error_log("Email Error: BREVO_API_KEY non configurée dans le .env");
        return false;
    }

    $data = [
        "sender" => ["name" => $senderName, "email" => $senderEmail],
        "to" => [["email" => $to]],
        "subject" => $subject,
        $isHtml ? "htmlContent" : "textContent" => $content
    ];

    $ch = curl_init('https://api.brevo.com/v3/smtp/email');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'api-key: ' . $apiKey,
        'Content-Type: application/json',
        'Accept: application/json'
    ]);

    // IMPORTANT : En local, la vérification SSL peut échouer. 
    // On la désactive pour garantir l'envoi en développement.
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    
    if (curl_errno($ch)) {
        $error_msg = curl_error($ch);
        error_log("Email CURL Error: " . $error_msg);
        curl_close($ch);
        return "CURL Error: $error_msg";
    }
    
    curl_close($ch);

    if ($httpCode >= 200 && $httpCode < 300) {
        return true;
    } else {
        error_log("Email API Error (Code $httpCode): " . $response);
        $resObj = json_decode($response, true);
        return $resObj['message'] ?? "Erreur API $httpCode";
    }
}
