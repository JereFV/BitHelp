<?php
require_once __DIR__ . '/vendor/autoload.php';

// index.php - front controller robusto

// Intentar cargar Composer autoload si existe (no obligatorio)
$vendorAutoload = __DIR__ . '/vendor/autoload.php';
if (file_exists($vendorAutoload)) {
    require_once $vendorAutoload;
}

// Encabezados / CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: *");
header('Content-Type: application/json; charset=UTF-8');

// Rutas base relativas al index
$BASE_CONTROLLERS = __DIR__ . '/controllers/';
$BASE_MODELS = __DIR__ . '/models/';
$BASE_ROUTES = __DIR__ . '/routes/';

// Incluir archivos core (ajustá si están en otra ruta)
$coreFiles = [
    $BASE_CONTROLLERS . 'core/Config.php',
    $BASE_CONTROLLERS . 'core/Logger.php',         // <- Logger primero
    $BASE_CONTROLLERS . 'core/HandleException.php',// <- luego HandleException
    $BASE_CONTROLLERS . 'core/MySqlConnect.php',
    $BASE_CONTROLLERS . 'core/Request.php',
    $BASE_CONTROLLERS . 'core/Response.php'
];


foreach ($coreFiles as $f) {
    if (file_exists($f)) {
        require_once $f;
    } else {
        http_response_code(500);
        echo json_encode(['status' => 500, 'error' => "Falta archivo core requerido: " . basename($f)]);
        exit;
    }
}

// Incluir modelos y controladores que usás (agregá más si los necesitás)
$models = [
    $BASE_MODELS . 'TicketModel.php',
    // $BASE_MODELS . 'ActorModel.php', // descomenta si lo necesitás
];

$controllers = [
    $BASE_CONTROLLERS . 'ActorController.php',
    $BASE_CONTROLLERS . 'TicketController.php',
    // agregá otros controllers si los tenés
];

foreach ($models as $m) {
    if (file_exists($m)) {
        require_once $m;
    } // no abortamos: si un modelo falta puede que no sea crítico
}

foreach ($controllers as $c) {
    if (file_exists($c)) {
        require_once $c;
    } // igual, continuamos y el router manejará controlador no encontrado
}

// Incluir routes
$routesFile = $BASE_ROUTES . 'RoutesController.php';
if (!file_exists($routesFile)) {
    http_response_code(500);
    echo json_encode(['status' => 500, 'error' => "Falta RoutesController.php en /routes"]);
    exit;
}
require_once $routesFile;

// Ejecutar router
$index = new RoutesController();
$index->index();
