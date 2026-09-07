<?php
declare(strict_types=1);
require_once __DIR__ . '/common.php';

try {
    $date = trim((string)($_GET['date'] ?? ''));
    if ($date !== '') {
        json_response(['success' => true, 'date' => $date, 'slots' => slots_for_date($date)]);
    }
    $settings = availability_settings();
    $today = new DateTimeImmutable('today', new DateTimeZone($settings['timezone']));
    $dates = [];
    for ($offset = 0; $offset <= 90; $offset++) {
        $dateObject = $today->modify('+' . $offset . ' days');
        $date = $dateObject->format('Y-m-d');
        if (slots_for_date($date) !== []) {
            $dates[] = $date;
        }
    }
    json_response(['success' => true, 'settings' => [
        'timezone' => $settings['timezone'],
        'duration_minutes' => $settings['duration_minutes'],
        'buffer_minutes' => $settings['buffer_minutes']
    ], 'available_dates' => $dates]);
} catch (Throwable $error) {
    error_log('Availability error: ' . $error->getMessage());
    json_response(['success' => false, 'error' => 'We could not load availability right now. Please try again.'], 500);
}
