<?php
class JWT {
    private static $secret_key = 'tu_clave_secreta_super_segura_cambiala_en_produccion';
    private static $encrypt = 'HS256';
    private static $aud = null;

    /**
     * Generar un token JWT
     */
    public static function encode($payload) {
        $header = [
            'typ' => 'JWT',
            'alg' => self::$encrypt
        ];

        $payload['iat'] = time();
        $payload['exp'] = time() + (60 * 60 * 24); // 24 horas

        $header = self::base64url_encode(json_encode($header));
        $payload = self::base64url_encode(json_encode($payload));
        $signature = self::signature($header, $payload);

        return $header . "." . $payload . "." . $signature;
    }

    /**
     * Decodificar y validar un token JWT
     */
    public static function decode($token) {
        if (empty($token)) {
            throw new Exception('Token vacío');
        }

        $tokenParts = explode('.', $token);
        if (count($tokenParts) != 3) {
            throw new Exception('Token inválido');
        }

        $header = json_decode(self::base64url_decode($tokenParts[0]));
        $payload = json_decode(self::base64url_decode($tokenParts[1]));
        $signature = $tokenParts[2];

        // Verificar firma
        $valid = self::signature($tokenParts[0], $tokenParts[1]);
        if ($signature !== $valid) {
            throw new Exception('Firma inválida');
        }

        // Verificar expiración
        if ($payload->exp < time()) {
            throw new Exception('Token expirado');
        }

        return $payload;
    }

    private static function signature($header, $payload) {
        $signature = hash_hmac('sha256', $header . "." . $payload, self::$secret_key, true);
        return self::base64url_encode($signature);
    }

    private static function base64url_encode($data) {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private static function base64url_decode($data) {
        return base64_decode(strtr($data, '-_', '+/'));
    }
}