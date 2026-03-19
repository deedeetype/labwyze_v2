<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Load PHPMailer
require '../vendor/phpmailer/src/Exception.php';
require '../vendor/phpmailer/src/PHPMailer.php';
require '../vendor/phpmailer/src/SMTP.php';

$errors = array();

// Check if name has been entered
if (!isset($_POST['name'])) {
    $errors['name'] = 'Please enter your name';
}

// Check if email has been entered and is valid
if (!isset($_POST['email']) || !filter_var($_POST['email'], FILTER_VALIDATE_EMAIL)) {
    $errors['email'] = 'Please enter a valid email address';
}

// Check if message has been entered
if (!isset($_POST['message'])) {
    $errors['message'] = 'Please enter your message';
}

$errorOutput = '';

if (!empty($errors)) {
    $errorOutput .= '<div class="alert alert-danger alert-dismissible" role="alert">';
    $errorOutput .= '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>';
    $errorOutput .= '<ul>';

    foreach ($errors as $key => $value) {
        $errorOutput .= '<li>'.$value.'</li>';
    }

    $errorOutput .= '</ul>';
    $errorOutput .= '</div>';

    echo $errorOutput;
    die();
}

$name = $_POST['name'];
$email = $_POST['email'];
$message = $_POST['message'];
$to = 'info@labwyze.com';
$subject = 'Contact Form : Labwyze Website';

// Create new PHPMailer instance
$mail = new PHPMailer(true);

try {
    // Server settings
    $mail->isSMTP();
    $mail->Host       = 'smtp.gmail.com';
    $mail->SMTPAuth   = true;
    $mail->Username   = 'admin@wyzenews.com';
    $mail->Password   = 'vuyasemjtsvnrqaf';
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = 587;

    // Recipients
    $mail->setFrom($email, $name);
    $mail->addAddress($to, 'David Laborieux');
    $mail->addReplyTo($email, $name);

    // Content
    $mail->isHTML(false);
    $mail->Subject = $subject;
    $mail->Body    = "From: $name\nE-Mail: $email\nMessage:\n$message";

    // Send
    $mail->send();
    
    $result = '';
    $result .= '<div class="alert alert-success alert-dismissible" role="alert">';
    $result .= '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>';
    $result .= 'Thank You! I will be in touch';
    $result .= '</div>';

    echo $result;
    die();

} catch (Exception $e) {
    $result = '';
    $result .= '<div class="alert alert-danger alert-dismissible" role="alert">';
    $result .= '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>';
    $result .= 'Something bad happened during sending this message. Please try again later';
    $result .= '</div>';

    echo $result;
    die();
}
