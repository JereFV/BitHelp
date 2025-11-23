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

/*--- Requerimientos Clases o librerías*/
require_once "controllers/core/Config.php";
require_once "controllers/core/Logger.php";
require_once "controllers/core/HandleException.php";
require_once "controllers/core/MySqlConnect.php";
require_once "controllers/core/Request.php";
require_once "controllers/core/Response.php";

/***--- Agregar todos los modelos*/
require_once "models/RolModel.php";
require_once "models/CategorieModel.php";
require_once "models/TicketModel.php";
require_once "models/UserModel.php";
require_once "models/TicketStatusModel.php";
require_once "models/TicketHistoryModel.php";
require_once "models/TechnicianModel.php";
require_once "models/SpecialtyModel.php";
require_once "models/TicketPriorityModel.php";
require_once "models/TicketTagModel.php";
require_once "models/TicketImageModel.php";
require_once "models/TicketStatusFlowModel.php";

/***--- Agregar todos los controladores*/
require_once "controllers/CategorieController.php";
require_once "controllers/TicketController.php";
require_once "controllers/UserController.php";
require_once "controllers/TechnicianController.php";
require_once "controllers/TicketPriorityController.php";
require_once "controllers/TicketTagController.php";
require_once "controllers/core/JWT.php";
require_once "controllers/AuthController.php";
require_once "controllers/TicketImageController.php";
require_once "controllers/TicketStatusFlowController.php";

//Enrutador
require_once "routes/RoutesController.php";
$index = new RoutesController();
$index->index();
