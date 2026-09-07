<?php
declare(strict_types=1);
require_once __DIR__ . '/common.php';

require_post();
$payload = request_payload();
reject_honeypot($payload);
rate_limit('contact', 5, 3600);
verify_csrf($payload);
$name = text_value($payload, 'name', 120);
$email = request_email($payload);
$phone = text_value($payload, 'phone', 50);
$company = text_value($payload, 'company', 160);
$subject = text_value($payload, 'subject', 160);
$message = text_value($payload, 'message', 4000);
require_fields(['Name' => $name, 'Message' => $message]);

$config = app_config();
$timestamp = (new DateTimeImmutable('now', new DateTimeZone($config['timezone'])))->format('Y-m-d H:i:s T');
$rows = [
    'Name' => $name,
    'Email' => $email,
    'Phone' => $phone ?: 'Not provided',
    'Company / Organisation' => $company ?: 'Not provided',
    'Subject / Reason' => $subject ?: 'Not provided',
    'Message' => $message,
    'Submission timestamp' => $timestamp
];
try {
    smtp_send((string)$config['notification_email'], 'New ELSMITH Website Enquiry — ' . $name, email_template('New ELSMITH Website Enquiry', $rows), $email);
    json_response(['success' => true, 'message' => 'Thank you for contacting ELSMITH Consulting. Your enquiry has been received successfully. Our team will review your message and get back to you shortly.']);
} catch (Throwable $error) {
    error_log('Contact submission error: ' . $error->getMessage());
    json_response(['success' => false, 'error' => 'We couldn’t complete your enquiry right now. Please try again or contact ELSMITH directly.'], 502);
}
