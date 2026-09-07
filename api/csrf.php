<?php
declare(strict_types=1);
require_once __DIR__ . '/common.php';
json_response(['success' => true, 'csrf' => csrf_token()]);
