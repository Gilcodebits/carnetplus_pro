<?php
require_once __DIR__ . '/backend/config/mail.php';

$to = "gilbertkeko@gmail.com"; // Remplacez par votre mail pour tester si besoin
$subject = "Test de configuration Brevo";
$body = "<h1>Test Réussi</h1><p>Si vous lisez ceci, l'envoi d'email fonctionne parfaitement.</p>";

echo "Tentative d'envoi à $to...\n";

// Capturons la sortie pour le débug
$ch = curl_init('https://api.brevo.com/v3/smtp/email');
$apiKey = trim(explode('=', file_get_contents(__DIR__ . '/.env')[0], 2)[1]); // Simplifié pour le test

// En réalité, utilisons directement la fonction sendEmail mais avec un retour plus bavard
$result = sendEmail($to, $subject, $body);

if ($result) {
    echo "Félicitations ! Brevo a ACCEPTE l'email. Si vous ne le voyez pas, vérifiez vos SPAMS.\n";
} else {
    echo "L'envoi a échoué au niveau de l'API Brevo.\n";
    echo "Vérifiez que l'expéditeur dans votre .env est EXACTEMENT 'aurelbc91@gmail.com'.\n";
}
