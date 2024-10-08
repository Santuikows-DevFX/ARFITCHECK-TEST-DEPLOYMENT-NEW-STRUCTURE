<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['*'],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['Content-Type', 'X-Auth-Token', 'Origin', 'Authorization'],
    'exposed_headers' => [],
    'max_age' => 3600,
    'supports_credentials' => true,
];

