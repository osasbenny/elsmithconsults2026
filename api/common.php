<?php
declare(strict_types=1);

function app_config(): array
{
    static $config;
    if ($config !== null) {
        return $config;
    }
    $path = __DIR__ . '/config.php';
    if (!is_file($path)) {
        http_response_code(503);
        json_response(['success' => false, 'error' => 'The website email service is not configured.']);
    }
    $config = require $path;
    date_default_timezone_set($config['timezone'] ?? 'Africa/Lagos');
    return $config;
}

function json_response(array $payload, int $status = 200): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    echo json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

function require_post(): void
{
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
        json_response(['success' => false, 'error' => 'Method not allowed.'], 405);
    }
}

function request_payload(): array
{
    $raw = file_get_contents('php://input') ?: '';
    $data = json_decode($raw, true);
    if (!is_array($data)) {
        json_response(['success' => false, 'error' => 'Invalid request.'], 400);
    }
    return $data;
}

function text_value(array $data, string $key, int $max = 500): string
{
    $value = trim((string)($data[$key] ?? ''));
    $value = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $value) ?? '';
    return mb_substr($value, 0, $max);
}

function require_fields(array $values): void
{
    foreach ($values as $label => $value) {
        if ($value === '') {
            json_response(['success' => false, 'error' => 'Please complete all required fields.'], 422);
        }
    }
}

function request_email(array $data, string $key = 'email'): string
{
    $email = filter_var(trim((string)($data[$key] ?? '')), FILTER_SANITIZE_EMAIL);
    if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL) || mb_strlen($email) > 320) {
        json_response(['success' => false, 'error' => 'Please enter a valid email address.'], 422);
    }
    return $email;
}

function reject_honeypot(array $data): void
{
    if (trim((string)($data['website'] ?? '')) !== '') {
        json_response(['success' => true, 'message' => 'Your enquiry has been received.']);
    }
}

function csrf_token(): string
{
    $config = app_config();
    $session = hash_hmac('sha256', ($_SERVER['REMOTE_ADDR'] ?? 'unknown') . '|' . ($_SERVER['HTTP_USER_AGENT'] ?? ''), (string)$config['app_secret']);
    return $session;
}

function verify_csrf(array $data): void
{
    $expected = csrf_token();
    $provided = (string)($data['csrf'] ?? '');
    if ($provided === '' || !hash_equals($expected, $provided)) {
        json_response(['success' => false, 'error' => 'Your session has expired. Please refresh and try again.'], 419);
    }
}

function rate_limit(string $bucket, int $limit = 8, int $window = 3600): void
{
    $config = app_config();
    $dir = (string)$config['storage_dir'];
    if (!is_dir($dir)) {
        @mkdir($dir, 0750, true);
    }
    $key = hash('sha256', $bucket . '|' . ($_SERVER['REMOTE_ADDR'] ?? 'unknown'));
    $path = $dir . '/rate-' . $key . '.json';
    $now = time();
    $state = is_file($path) ? json_decode((string)file_get_contents($path), true) : [];
    if (!is_array($state) || ($now - (int)($state['started'] ?? 0)) >= $window) {
        $state = ['started' => $now, 'count' => 0];
    }
    $state['count'] = (int)$state['count'] + 1;
    file_put_contents($path, json_encode($state), LOCK_EX);
    if ($state['count'] > $limit) {
        json_response(['success' => false, 'error' => 'Too many requests. Please try again later.'], 429);
    }
}

function availability_settings(): array
{
    $config = app_config();
    return [
        'timezone' => $config['timezone'] ?? 'Africa/Lagos',
        'working_days' => [1, 2, 3, 4, 5],
        'start_minutes' => 9 * 60,
        'end_minutes' => 17 * 60,
        'duration_minutes' => 60,
        'buffer_minutes' => 15,
        'blocked_dates' => $config['blocked_dates'] ?? []
    ];
}

function valid_date(string $date): bool
{
    $parsed = DateTimeImmutable::createFromFormat('!Y-m-d', $date, new DateTimeZone('Africa/Lagos'));
    return $parsed !== false && $parsed->format('Y-m-d') === $date;
}

function slots_for_date(string $date): array
{
    $settings = availability_settings();
    if (!valid_date($date)) {
        return [];
    }
    $day = (int)(new DateTimeImmutable($date, new DateTimeZone($settings['timezone'])))->format('N');
    if (!in_array($day, $settings['working_days'], true) || in_array($date, $settings['blocked_dates'], true)) {
        return [];
    }
    $booked = read_bookings();
    $taken = [];
    foreach ($booked as $booking) {
        if (($booking['date'] ?? '') === $date && ($booking['status'] ?? '') === 'confirmed') {
            $taken[] = (string)($booking['time'] ?? '');
        }
    }
    $slots = [];
    $step = $settings['duration_minutes'] + $settings['buffer_minutes'];
    $now = new DateTimeImmutable('now', new DateTimeZone($settings['timezone']));
    $currentMinutes = ((int)$now->format('H') * 60) + (int)$now->format('i');
    $isToday = $date === $now->format('Y-m-d');
    for ($minutes = $settings['start_minutes']; $minutes + $settings['duration_minutes'] <= $settings['end_minutes']; $minutes += $step) {
        if ($isToday && $minutes <= $currentMinutes) {
            continue;
        }
        $time = sprintf('%02d:%02d', intdiv($minutes, 60), $minutes % 60);
        if (!in_array($time, $taken, true)) {
            $slots[] = $time;
        }
    }
    return $slots;
}

function read_bookings(): array
{
    $config = app_config();
    $path = (string)$config['storage_dir'] . '/bookings.json';
    if (!is_file($path)) {
        return [];
    }
    $data = json_decode((string)file_get_contents($path), true);
    return is_array($data) ? $data : [];
}

function write_booking(array $booking): void
{
    $config = app_config();
    $dir = (string)$config['storage_dir'];
    if (!is_dir($dir)) {
        @mkdir($dir, 0750, true);
    }
    $path = $dir . '/bookings.json';
    $bookings = read_bookings();
    $bookings[] = $booking;
    file_put_contents($path, json_encode($bookings, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
}

function smtp_send(string $to, string $subject, string $html, string $replyTo): void
{
    $config = app_config();
    $host = (string)$config['smtp_host'];
    $port = (int)$config['smtp_port'];
    $username = (string)$config['smtp_username'];
    $password = (string)$config['smtp_password'];
    $from = (string)$config['from_email'];
    $fromName = (string)$config['from_name'];
    $socket = @stream_socket_client('ssl://' . $host . ':' . $port, $errno, $error, 20, STREAM_CLIENT_CONNECT);
    if (!$socket) {
        error_log('SMTP connection failed: ' . $errno . ' ' . $error);
        throw new RuntimeException('SMTP unavailable');
    }
    stream_set_timeout($socket, 20);
    $expect = static function (string $code) use ($socket): void {
        $response = '';
        while (($line = fgets($socket, 515)) !== false) {
            $response .= $line;
            if (isset($line[3]) && $line[3] === ' ') {
                break;
            }
        }
        if (substr($response, 0, 3) !== $code) {
            throw new RuntimeException('SMTP response error');
        }
    };
    $send = static function (string $command) use ($socket): void {
        fwrite($socket, $command . "\r\n");
    };
    try {
        $expect('220');
        $send('EHLO elsmithconsulting.com');
        $expect('250');
        $send('AUTH LOGIN');
        $expect('334');
        $send(base64_encode($username));
        $expect('334');
        $send(base64_encode($password));
        $expect('235');
        $send('MAIL FROM:<' . $from . '>');
        $expect('250');
        $send('RCPT TO:<' . $to . '>');
        $expect('250');
        $send('DATA');
        $expect('354');
        $safeSubject = str_replace(["\r", "\n"], '', $subject);
        $safeReply = str_replace(["\r", "\n"], '', $replyTo);
        $headers = [
            'Date: ' . date(DATE_RFC2822),
            'From: ' . mb_encode_mimeheader($fromName) . ' <' . $from . '>',
            'To: <' . $to . '>',
            'Reply-To: ' . $safeReply,
            'Subject: ' . mb_encode_mimeheader($safeSubject),
            'MIME-Version: 1.0',
            'Content-Type: text/html; charset=UTF-8'
        ];
        $send(implode("\r\n", $headers) . "\r\n\r\n" . $html . "\r\n.");
        $expect('250');
        $send('QUIT');
    } finally {
        fclose($socket);
    }
}

function esc(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function email_template(string $title, array $rows): string
{
    $body = '<!doctype html><html><body style="font-family:Arial,sans-serif;color:#1e293b;line-height:1.5"><h2 style="color:#123b78">' . esc($title) . '</h2><table cellpadding="8" cellspacing="0" style="border-collapse:collapse;width:100%;max-width:680px">';
    foreach ($rows as $label => $value) {
        $body .= '<tr><th align="left" valign="top" style="border-bottom:1px solid #e2e8f0;width:35%">' . esc((string)$label) . '</th><td style="border-bottom:1px solid #e2e8f0">' . nl2br(esc((string)$value)) . '</td></tr>';
    }
    return $body . '</table></body></html>';
}
