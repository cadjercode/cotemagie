<?php
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Méthode non autorisée']);
    exit;
}

// Honeypot anti-spam
if (!empty($_POST['_honey'])) {
    echo json_encode(['ok' => true]);
    exit;
}

$nom   = trim($_POST['nom'] ?? '');
$tel   = trim($_POST['tel'] ?? '');
$email = trim($_POST['email'] ?? '');
$event = trim($_POST['evenement'] ?? '');
$msg   = trim($_POST['message'] ?? '');

if ($nom === '' || ($tel === '' && $email === '') || $event === '') {
    http_response_code(422);
    echo json_encode(['ok' => false, 'error' => 'Champs obligatoires manquants']);
    exit;
}

if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'error' => 'Adresse e-mail invalide']);
    exit;
}

$to = 'cotemagie@gmail.com';
$subject = 'Nouvelle demande de devis — cotemagie.fr';

$contact = '';
if ($tel !== '') $contact .= "Téléphone : $tel\n";
if ($email !== '') $contact .= "E-mail : $email\n";

$body  = "Nouveau message depuis cotemagie.fr\n";
$body .= "══════════════════════════════════\n\n";
$body .= "Nom : $nom\n";
$body .= $contact;
$body .= "Événement : $event\n\n";
if ($msg !== '') {
    $body .= "Message :\n$msg\n";
}
$body .= "\n——\nEnvoyé depuis le formulaire cotemagie.fr";

$replyTo = $email !== '' ? $email : 'noreply@cotemagie.fr';
$headers  = "From: cotemagie.fr <noreply@cotemagie.fr>\r\n";
$headers .= "Reply-To: $replyTo\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "X-Mailer: cotemagie.fr";

$sent = mail($to, $subject, $body, $headers);

if ($sent) {
    echo json_encode(['ok' => true]);
} else {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Erreur serveur']);
}
