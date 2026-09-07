<?php
declare(strict_types=1);
require_once __DIR__ . '/common.php';

require_post();
$payload = request_payload();
reject_honeypot($payload);
rate_limit('booking', 5, 3600);
verify_csrf($payload);
$name = text_value($payload, 'name', 120);
$email = request_email($payload);
$phone = text_value($payload, 'phone', 50);
$company = text_value($payload, 'company', 160);
$session = text_value($payload, 'session_type', 100);
$message = text_value($payload, 'message', 4000);
$date = text_value($payload, 'date', 10);
$time = text_value($payload, 'time', 5);
$allowedSessions = ['Executive Coaching', 'Leadership Coaching', 'Business / Workforce Advisory', 'Consultation', 'General Enquiry'];
require_fields(['Name' => $name, 'Phone' => $phone, 'Session type' => $session, 'Date' => $date, 'Time' => $time]);
if (!in_array($session, $allowedSessions, true)) {
    json_response(['success' => false, 'error' => 'Please select a valid session type.'], 422);
}
if (!in_array($time, slots_for_date($date), true)) {
    json_response(['success' => false, 'error' => 'This time is no longer available. Please select another time.'], 409);
}

$config = app_config();
$timestamp = new DateTimeImmutable('now', new DateTimeZone($config['timezone']));
$reference = 'ELS-' . strtoupper(substr(bin2hex(random_bytes(5)), 0, 10));
$booking = [
    'reference' => $reference,
    'status' => 'confirmed',
    'name' => $name,
    'email' => $email,
    'phone' => $phone,
    'company' => $company ?: 'Not provided',
    'session_type' => $session,
    'date' => $date,
    'time' => $time,
    'message' => $message ?: 'Not provided',
    'submitted_at' => $timestamp->format('Y-m-d H:i:s T')
];
$bookings = read_bookings();
foreach ($bookings as $existing) {
    if (($existing['status'] ?? '') === 'confirmed' && ($existing['date'] ?? '') === $date && ($existing['time'] ?? '') === $time) {
        json_response(['success' => false, 'error' => 'This time is no longer available. Please select another time.'], 409);
    }
}
try {
    write_booking($booking);
    smtp_send((string)$config['notification_email'], 'New ELSMITH Website Booking — ' . $name . ' — ' . $date . ' ' . $time, email_template('New ELSMITH Website Booking', [
        'Booking reference' => $reference,
        'Booking date' => $date,
        'Booking time' => $time . ' WAT',
        'Session / consultation type' => $session,
        'Full name' => $name,
        'Email' => $email,
        'Phone' => $phone,
        'Company / Organisation' => $company ?: 'Not provided',
        'Message / notes' => $message ?: 'Not provided',
        'Submission timestamp' => $booking['submitted_at']
    ]), $email);
    json_response(['success' => true, 'reference' => $reference, 'booking' => [
        'date' => $date,
        'time' => $time,
        'session_type' => $session
    ], 'message' => 'Your session has been requested successfully. A member of the ELSMITH team will follow up using the contact details you provided.']);
} catch (Throwable $error) {
    error_log('Booking submission error: ' . $error->getMessage());
    json_response(['success' => false, 'error' => 'We couldn’t complete your booking right now. Please try again or contact ELSMITH directly.'], 502);
}
