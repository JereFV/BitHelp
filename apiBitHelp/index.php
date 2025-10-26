<?php
// Composer autoloader
require_once 'vendor/autoload.php';
/*Encabezada de las solicitudes*/
/*CORS*/
header("Access-Control-Allow-Origin: * ");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: *");
header('Content-Type: application/json');

/*--- Requerimientos Clases o librerías*/
require_once "controllers/core/Config.php";
require_once "controllers/core/Logger.php";
require_once "controllers/core/HandleException.php";
require_once "controllers/core/MySqlConnect.php";
require_once "controllers/core/Request.php";
require_once "controllers/core/Response.php";

/***--- Agregar todos los modelos*/
require_once "models/ActorModel.php";
require_once "models/RolModel.php";
require_once "models/CategorieModel.php";
require_once "models/TicketModel.php";
require_once "models/UserModel.php";
require_once "models/TicketStatusModel.php";
require_once "models/TicketHistoryModel.php";

/***--- Agregar todos los controladores*/
require_once "controllers/ActorController.php";
require_once "controllers/CategorieController.php";
require_once "controllers/TicketController.php";
require_once "controllers/UserController.php";

//Enrutador
require_once "routes/RoutesController.php";
$index = new RoutesController();
$index->index();


