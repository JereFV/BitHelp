CREATE DATABASE  IF NOT EXISTS `bithelp` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */;
USE `bithelp`;
-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: bithelp
-- ------------------------------------------------------
-- Server version	5.5.5-10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `categoria`
--

DROP TABLE IF EXISTS `categoria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categoria` (
  `idCategoria` int(11) NOT NULL,
  `nombre` varchar(45) NOT NULL,
  `idSla` int(11) NOT NULL,
  `estado` tinyint(4) NOT NULL,
  PRIMARY KEY (`idCategoria`),
  UNIQUE KEY `idCategoria_UNIQUE` (`idCategoria`),
  KEY `fk_Sla_Categoria_idx` (`idSla`),
  CONSTRAINT `fk_Sla_Categoria` FOREIGN KEY (`idSla`) REFERENCES `sla` (`idSla`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categoria`
--

LOCK TABLES `categoria` WRITE;
/*!40000 ALTER TABLE `categoria` DISABLE KEYS */;
INSERT INTO `categoria` VALUES (1,'\"Hardware\" y dispositivos',4,1),(2,'\"Software\" y aplicaciones',3,1),(3,'Cuentas y Acceso',1,1),(4,'Redes y conectividad',2,1);
/*!40000 ALTER TABLE `categoria` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `disponibilidad_tecnico`
--

DROP TABLE IF EXISTS `disponibilidad_tecnico`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `disponibilidad_tecnico` (
  `idDisponibilidad` int(11) NOT NULL,
  `nombre` varchar(45) NOT NULL,
  `estado` tinyint(4) NOT NULL,
  PRIMARY KEY (`idDisponibilidad`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `disponibilidad_tecnico`
--

LOCK TABLES `disponibilidad_tecnico` WRITE;
/*!40000 ALTER TABLE `disponibilidad_tecnico` DISABLE KEYS */;
INSERT INTO `disponibilidad_tecnico` VALUES (1,'Disponible',1),(2,'Ocupado',1);
/*!40000 ALTER TABLE `disponibilidad_tecnico` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `especialidad`
--

DROP TABLE IF EXISTS `especialidad`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `especialidad` (
  `idEspecialidad` int(11) NOT NULL,
  `idCategoria` int(11) NOT NULL,
  `nombre` varchar(45) NOT NULL,
  `estado` varchar(45) NOT NULL,
  `idmetodoAsignacion` int(11) NOT NULL,
  PRIMARY KEY (`idEspecialidad`),
  KEY `fk_Categoria_Especialidad_idx` (`idCategoria`),
  KEY `dk_MetodoAsignacion_Especialidad_idx` (`idmetodoAsignacion`),
  CONSTRAINT `fk_Categoria_Especialidad` FOREIGN KEY (`idCategoria`) REFERENCES `categoria` (`idCategoria`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_MetodoAsignacion_Especialidad` FOREIGN KEY (`idmetodoAsignacion`) REFERENCES `metodo_asignacion` (`idMetodoAsignacion`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `especialidad`
--

LOCK TABLES `especialidad` WRITE;
/*!40000 ALTER TABLE `especialidad` DISABLE KEYS */;
INSERT INTO `especialidad` VALUES (1,1,'Incidente con computadora','1',2),(2,1,'Incidente con impresa','1',1),(3,1,'Incidente con periféricos','1',2),(4,1,'Solicitud o préstamo de equipo','1',2),(5,2,'Incidente con aplicación','1',2),(6,2,'Incidente con archivo','1',1),(7,2,'Solicitud de instalación de aplicación','1',2),(8,3,'Restablecimiento de contraseña','1',2),(9,3,'Solicitude de desbloqueo','1',2),(10,3,'Gestión de permisos','1',1),(11,4,'Incidente con conexión a internet','1',2),(12,4,'Incidente con VPN','1',2),(13,4,'Incidente con acceso a servidores','1',2),(14,4,'Incidente con acceso a recursos compartidos','1',1);
/*!40000 ALTER TABLE `especialidad` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `estado_notificacion`
--

DROP TABLE IF EXISTS `estado_notificacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `estado_notificacion` (
  `idEstadoNotificacion` int(11) NOT NULL,
  `nombre` varchar(20) NOT NULL,
  PRIMARY KEY (`idEstadoNotificacion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estado_notificacion`
--

LOCK TABLES `estado_notificacion` WRITE;
/*!40000 ALTER TABLE `estado_notificacion` DISABLE KEYS */;
/*!40000 ALTER TABLE `estado_notificacion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `estado_tiquete`
--

DROP TABLE IF EXISTS `estado_tiquete`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `estado_tiquete` (
  `idEstadoTiquete` int(11) NOT NULL,
  `nombre` varchar(45) NOT NULL,
  `estado` tinyint(4) NOT NULL,
  PRIMARY KEY (`idEstadoTiquete`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estado_tiquete`
--

LOCK TABLES `estado_tiquete` WRITE;
/*!40000 ALTER TABLE `estado_tiquete` DISABLE KEYS */;
INSERT INTO `estado_tiquete` VALUES (1,'Pendiente',1),(2,'Asignado',1),(3,'En Proceso',1),(4,'Resuelto',1),(5,'Cerrado',1);
/*!40000 ALTER TABLE `estado_tiquete` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `etiqueta`
--

DROP TABLE IF EXISTS `etiqueta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `etiqueta` (
  `idEtiqueta` int(11) NOT NULL,
  `nombre` varchar(45) NOT NULL,
  `estado` tinyint(4) NOT NULL,
  PRIMARY KEY (`idEtiqueta`),
  UNIQUE KEY `idEtiqueta_UNIQUE` (`idEtiqueta`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `etiqueta`
--

LOCK TABLES `etiqueta` WRITE;
/*!40000 ALTER TABLE `etiqueta` DISABLE KEYS */;
/*!40000 ALTER TABLE `etiqueta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `etiqueta_categoria`
--

DROP TABLE IF EXISTS `etiqueta_categoria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `etiqueta_categoria` (
  `idEtiqueta` int(11) NOT NULL,
  `idCategoria` int(11) NOT NULL,
  PRIMARY KEY (`idEtiqueta`,`idCategoria`),
  KEY `fk_Categoria_EtiquetaCategoria_idx` (`idCategoria`),
  CONSTRAINT `fk_Categoria_EtiquetaCategoria` FOREIGN KEY (`idCategoria`) REFERENCES `categoria` (`idCategoria`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_Etiqueta_EtiquetaCategoria` FOREIGN KEY (`idEtiqueta`) REFERENCES `etiqueta` (`idEtiqueta`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `etiqueta_categoria`
--

LOCK TABLES `etiqueta_categoria` WRITE;
/*!40000 ALTER TABLE `etiqueta_categoria` DISABLE KEYS */;
/*!40000 ALTER TABLE `etiqueta_categoria` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historial_asignacion_tiquete`
--

DROP TABLE IF EXISTS `historial_asignacion_tiquete`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historial_asignacion_tiquete` (
  `idHistorialAsignacionTiquete` int(11) NOT NULL,
  `idTiquete` int(11) NOT NULL,
  `idTecnico` int(11) NOT NULL,
  `idMetodoAsignacion` int(11) NOT NULL,
  `fecha` datetime NOT NULL,
  `idUsuarioAsigna` int(11) DEFAULT NULL,
  `justificacion` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`idHistorialAsignacionTiquete`),
  KEY `fk_Tiquete_HistorialAsignacion_idx` (`idTiquete`),
  KEY `fk_MetodoAsignacion_idx` (`idMetodoAsignacion`),
  KEY `fk_Tecnico_HistorialAsignacion_idx` (`idTecnico`),
  KEY `fk_Usuario_HistorialAsignacion_idx` (`idUsuarioAsigna`),
  CONSTRAINT `fk_MetodoAsignacion_HistorialAsignacion` FOREIGN KEY (`idMetodoAsignacion`) REFERENCES `metodo_asignacion` (`idMetodoAsignacion`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_Tecnico_HistorialAsignacion` FOREIGN KEY (`idTecnico`) REFERENCES `tecnico` (`idTecnico`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_Tiquete_HistorialAsignacion` FOREIGN KEY (`idTiquete`) REFERENCES `tiquete` (`idTiquete`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_Usuario_HistorialAsignacion` FOREIGN KEY (`idUsuarioAsigna`) REFERENCES `usuario` (`idUsuario`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historial_asignacion_tiquete`
--

LOCK TABLES `historial_asignacion_tiquete` WRITE;
/*!40000 ALTER TABLE `historial_asignacion_tiquete` DISABLE KEYS */;
/*!40000 ALTER TABLE `historial_asignacion_tiquete` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historial_tiquete`
--

DROP TABLE IF EXISTS `historial_tiquete`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historial_tiquete` (
  `idHistorialTiquete` int(11) NOT NULL,
  `idTiquete` int(11) NOT NULL,
  `fecha` datetime NOT NULL,
  `idUsuario` int(11) NOT NULL,
  `observacion` varchar(300) NOT NULL,
  `idEstado` int(11) NOT NULL,
  PRIMARY KEY (`idHistorialTiquete`,`idTiquete`),
  KEY `fk_Usuario_HistorialTiquete_idx` (`idUsuario`),
  KEY `fk_EstadoTiquete_HistorialTiquete_idx` (`idEstado`),
  CONSTRAINT `fk_EstadoTiquete_HistorialTiquete` FOREIGN KEY (`idEstado`) REFERENCES `estado_tiquete` (`idEstadoTiquete`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_Usuario_HistorialTiquete` FOREIGN KEY (`idUsuario`) REFERENCES `usuario` (`idUsuario`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historial_tiquete`
--

LOCK TABLES `historial_tiquete` WRITE;
/*!40000 ALTER TABLE `historial_tiquete` DISABLE KEYS */;
INSERT INTO `historial_tiquete` VALUES (1,1,'2025-10-28 09:00:00',1,'Asignación Automática',2),(1,2,'2025-10-28 12:00:00',1,'',2),(1,3,'2025-10-28 15:00:00',1,'',2),(1,4,'2025-10-30 08:30:00',2,'',2),(2,1,'2025-10-28 10:00:00',1,'Empieza atención del ticket.',3);
/*!40000 ALTER TABLE `historial_tiquete` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `imagen_historial_tiquete`
--

DROP TABLE IF EXISTS `imagen_historial_tiquete`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `imagen_historial_tiquete` (
  `idImagen` int(11) NOT NULL,
  `idHistorialTiquete` int(11) NOT NULL,
  `idTiquete` int(11) NOT NULL,
  `imagen` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`idImagen`,`idHistorialTiquete`,`idTiquete`),
  KEY `fk_HistorialTiquete_ImagenTiquete_idx` (`idHistorialTiquete`,`idTiquete`),
  CONSTRAINT `fk_HistorialTiquete_ImagenTiquete` FOREIGN KEY (`idHistorialTiquete`, `idTiquete`) REFERENCES `historial_tiquete` (`idHistorialTiquete`, `idTiquete`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `imagen_historial_tiquete`
--

LOCK TABLES `imagen_historial_tiquete` WRITE;
/*!40000 ALTER TABLE `imagen_historial_tiquete` DISABLE KEYS */;
INSERT INTO `imagen_historial_tiquete` VALUES (1,1,1,'/src/images/Problema Inicio Sesión.png'),(1,1,2,'/src/images/Error acceso nube_1.jpg'),(1,1,3,'/src/images/Error impresión.png'),(2,1,2,'/src/images/Error nube_2.png');
/*!40000 ALTER TABLE `imagen_historial_tiquete` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `metodo_asignacion`
--

DROP TABLE IF EXISTS `metodo_asignacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `metodo_asignacion` (
  `idMetodoAsignacion` int(11) NOT NULL,
  `nombre` varchar(45) NOT NULL,
  `estado` tinyint(4) NOT NULL,
  PRIMARY KEY (`idMetodoAsignacion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `metodo_asignacion`
--

LOCK TABLES `metodo_asignacion` WRITE;
/*!40000 ALTER TABLE `metodo_asignacion` DISABLE KEYS */;
INSERT INTO `metodo_asignacion` VALUES (1,'Manual',1),(2,'Automático',1);
/*!40000 ALTER TABLE `metodo_asignacion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notificacion`
--

DROP TABLE IF EXISTS `notificacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notificacion` (
  `idNotificacion` int(11) NOT NULL,
  `idTipoNotificacion` int(11) NOT NULL,
  `idUsuarioRemitente` int(11) NOT NULL,
  `idUsuarioDestinatario` int(11) NOT NULL,
  `fecha` datetime NOT NULL,
  `idEstadoNotificacion` int(11) NOT NULL,
  PRIMARY KEY (`idNotificacion`),
  KEY `fk_TipoNotificacion_Notificacion_idx` (`idTipoNotificacion`),
  KEY `fk_UsuarioRemitente_Usuario_idx` (`idUsuarioRemitente`),
  KEY `fk_UsuarioDestinatario_Usuario_idx` (`idUsuarioDestinatario`),
  KEY `fk_EstadoNotificacion_Notificacion_idx` (`idEstadoNotificacion`),
  CONSTRAINT `fk_EstadoNotificacion_Notificacion` FOREIGN KEY (`idEstadoNotificacion`) REFERENCES `estado_notificacion` (`idEstadoNotificacion`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_TipoNotificacion_Notificacion` FOREIGN KEY (`idTipoNotificacion`) REFERENCES `tipo_notificacion` (`idTipoNotificacion`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_UsuarioDestinatario_Notificacion` FOREIGN KEY (`idUsuarioDestinatario`) REFERENCES `usuario` (`idUsuario`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_UsuarioRemitente_Notificacion` FOREIGN KEY (`idUsuarioRemitente`) REFERENCES `usuario` (`idUsuario`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notificacion`
--

LOCK TABLES `notificacion` WRITE;
/*!40000 ALTER TABLE `notificacion` DISABLE KEYS */;
/*!40000 ALTER TABLE `notificacion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `prioridad_tiquete`
--

DROP TABLE IF EXISTS `prioridad_tiquete`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prioridad_tiquete` (
  `idPrioridadTiquete` int(11) NOT NULL,
  `nombre` varchar(45) NOT NULL,
  `estado` tinyint(4) NOT NULL,
  `puntaje` int(11) NOT NULL,
  PRIMARY KEY (`idPrioridadTiquete`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prioridad_tiquete`
--

LOCK TABLES `prioridad_tiquete` WRITE;
/*!40000 ALTER TABLE `prioridad_tiquete` DISABLE KEYS */;
INSERT INTO `prioridad_tiquete` VALUES (1,'Crítica',1,100),(2,'Alta',1,50),(3,'Media',1,10),(4,'Baja',1,1);
/*!40000 ALTER TABLE `prioridad_tiquete` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rol_usuario`
--

DROP TABLE IF EXISTS `rol_usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rol_usuario` (
  `idRolUsuario` int(11) NOT NULL,
  `nombre` varchar(45) NOT NULL,
  PRIMARY KEY (`idRolUsuario`),
  UNIQUE KEY `idRolUsuario_UNIQUE` (`idRolUsuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rol_usuario`
--

LOCK TABLES `rol_usuario` WRITE;
/*!40000 ALTER TABLE `rol_usuario` DISABLE KEYS */;
INSERT INTO `rol_usuario` VALUES (1,'Cliente'),(2,'Técnico'),(3,'Administrador');
/*!40000 ALTER TABLE `rol_usuario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sla`
--

DROP TABLE IF EXISTS `sla`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sla` (
  `idSla` int(11) NOT NULL,
  `tiempoMaxRespuesta` time NOT NULL,
  `tiempoMaxResolucion` time NOT NULL,
  `estado` tinyint(4) NOT NULL,
  PRIMARY KEY (`idSla`),
  UNIQUE KEY `idSla_UNIQUE` (`idSla`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sla`
--

LOCK TABLES `sla` WRITE;
/*!40000 ALTER TABLE `sla` DISABLE KEYS */;
INSERT INTO `sla` VALUES (1,'00:30:00','04:00:00',1),(2,'00:30:00','08:00:00',1),(3,'01:00:00','16:00:00',1),(4,'00:30:00','24:00:00',1);
/*!40000 ALTER TABLE `sla` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tecnico`
--

DROP TABLE IF EXISTS `tecnico`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tecnico` (
  `idTecnico` int(11) NOT NULL,
  `idUsuario` int(11) NOT NULL,
  `idDisponibilidad` int(11) NOT NULL,
  `cargaTrabajo` time NOT NULL,
  `estado` tinyint(4) NOT NULL,
  PRIMARY KEY (`idTecnico`),
  KEY `fk_Usuario_Tecnico_idx` (`idUsuario`),
  KEY `fk_DisponibilidadTecnico_Tecnico_idx` (`idDisponibilidad`),
  CONSTRAINT `fk_DisponibilidadTecnico_Tecnico` FOREIGN KEY (`idDisponibilidad`) REFERENCES `disponibilidad_tecnico` (`idDisponibilidad`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_Usuario_Tecnico` FOREIGN KEY (`idUsuario`) REFERENCES `usuario` (`idUsuario`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tecnico`
--

LOCK TABLES `tecnico` WRITE;
/*!40000 ALTER TABLE `tecnico` DISABLE KEYS */;
INSERT INTO `tecnico` VALUES (1,1,1,'00:00:00',1),(2,2,1,'36:00:00',1),(3,3,1,'03:00:00',1),(4,4,1,'10:30:00',1);
/*!40000 ALTER TABLE `tecnico` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tecnico_especialidad`
--

DROP TABLE IF EXISTS `tecnico_especialidad`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tecnico_especialidad` (
  `idTecnico` int(11) NOT NULL,
  `idEspecialidad` int(11) NOT NULL,
  PRIMARY KEY (`idTecnico`,`idEspecialidad`),
  KEY `fk_Especialiad_TecnicoEspecialidad_idx` (`idEspecialidad`),
  CONSTRAINT `fk_Especialiad_TecnicoEspecialidad` FOREIGN KEY (`idEspecialidad`) REFERENCES `especialidad` (`idEspecialidad`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_Tecnico_TecnicoEspecialidad` FOREIGN KEY (`idTecnico`) REFERENCES `tecnico` (`idTecnico`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tecnico_especialidad`
--

LOCK TABLES `tecnico_especialidad` WRITE;
/*!40000 ALTER TABLE `tecnico_especialidad` DISABLE KEYS */;
/*!40000 ALTER TABLE `tecnico_especialidad` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tipo_notificacion`
--

DROP TABLE IF EXISTS `tipo_notificacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tipo_notificacion` (
  `idTipoNotificacion` int(11) NOT NULL,
  `nombre` varchar(45) NOT NULL,
  PRIMARY KEY (`idTipoNotificacion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tipo_notificacion`
--

LOCK TABLES `tipo_notificacion` WRITE;
/*!40000 ALTER TABLE `tipo_notificacion` DISABLE KEYS */;
/*!40000 ALTER TABLE `tipo_notificacion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tiquete`
--

DROP TABLE IF EXISTS `tiquete`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tiquete` (
  `idTiquete` int(11) NOT NULL,
  `idUsuarioSolicita` int(11) NOT NULL,
  `idUsuarioCierra` int(11) DEFAULT NULL,
  `titulo` varchar(45) NOT NULL,
  `descripcion` varchar(300) NOT NULL,
  `idEstado` int(11) NOT NULL,
  `idPrioridad` int(11) NOT NULL,
  `idEspecialidad` int(11) NOT NULL,
  `fechaCreacion` datetime NOT NULL,
  `fechaCierre` datetime DEFAULT NULL,
  `tiempoResolucion` datetime DEFAULT NULL,
  `slaRespuesta` datetime NOT NULL,
  `slaResolucion` datetime NOT NULL,
  `cumplimientoSlaRespuesta` tinyint(4) DEFAULT NULL,
  `cumplimientoSlaResolucion` tinyint(4) DEFAULT NULL,
  `idTecnicoAsignado` int(11) NOT NULL,
  `idMetodoAsignacion` int(11) NOT NULL,
  `comentarioValoracionServicio` varchar(100) DEFAULT NULL,
  `valoracion` smallint(1) DEFAULT NULL,
  PRIMARY KEY (`idTiquete`),
  KEY `fk_UsuarioCrea_Ticket_idx` (`idUsuarioSolicita`),
  KEY `fk_UsuarioCierra_Ticket_idx` (`idUsuarioCierra`),
  KEY `fk_Especialidad_Tiquete_idx` (`idEspecialidad`),
  KEY `fk_PrioridadTiquete_Tiquete_idx` (`idPrioridad`),
  KEY `fk_EstadoTiquete_Tiquete_idx` (`idEstado`),
  KEY `fk_Tecnico_Tiquete_idx` (`idTecnicoAsignado`),
  KEY `fk_MetodoAsignacion_Tiquete` (`idMetodoAsignacion`),
  CONSTRAINT `fk_Especialidad_Tiquete` FOREIGN KEY (`idEspecialidad`) REFERENCES `especialidad` (`idEspecialidad`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_EstadoTiquete_Tiquete` FOREIGN KEY (`idEstado`) REFERENCES `estado_tiquete` (`idEstadoTiquete`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_MetodoAsignacion_Tiquete` FOREIGN KEY (`idMetodoAsignacion`) REFERENCES `metodo_asignacion` (`idMetodoAsignacion`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_PrioridadTiquete_Tiquete` FOREIGN KEY (`idPrioridad`) REFERENCES `prioridad_tiquete` (`idPrioridadTiquete`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_Tecnico_Tiquete` FOREIGN KEY (`idTecnicoAsignado`) REFERENCES `tecnico` (`idTecnico`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_UsuarioCierra_Tiquete` FOREIGN KEY (`idUsuarioCierra`) REFERENCES `usuario` (`idUsuario`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_UsuarioCrea_Tiquete` FOREIGN KEY (`idUsuarioSolicita`) REFERENCES `usuario` (`idUsuario`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tiquete`
--

LOCK TABLES `tiquete` WRITE;
/*!40000 ALTER TABLE `tiquete` DISABLE KEYS */;
INSERT INTO `tiquete` VALUES (1,1,NULL,'Problemas al iniciar sesión','No me deja iniciar sesión a pesar de haber digitado las credenciales.',1,2,8,'2025-10-28 09:00:00',NULL,NULL,'2025-10-28 09:30:00','2025-10-28 13:00:00',NULL,NULL,1,2,NULL,NULL),(2,1,NULL,'Permisos al servidor de la nube','Buenas tardes, necesito permsisos para acceder al servidor xxxxxxxx desde mi máquina local.',1,3,10,'2025-10-28 12:00:00',NULL,NULL,'2025-10-28 12:30:00','2025-10-28 16:00:00',NULL,NULL,1,1,NULL,NULL),(3,1,NULL,'Error al imprimir documentos','Buenas tardes, estoy intentando imprimir documentos pero me sale un error inesperado.',1,3,2,'2025-10-28 15:00:00',NULL,NULL,'2025-10-28 15:30:00','2025-10-29 15:00:00',NULL,NULL,1,2,NULL,NULL),(4,2,NULL,'Lentitud en el sistema de inventario','El sistema está muy lento, no puedo ingresar datos de nuevos productos rápidamente.',1,2,5,'2025-10-30 08:30:00',NULL,NULL,'2025-10-30 09:00:00','2025-10-30 12:30:00',NULL,NULL,2,1,NULL,NULL);
/*!40000 ALTER TABLE `tiquete` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuario`
--

DROP TABLE IF EXISTS `usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario` (
  `idUsuario` int(11) NOT NULL AUTO_INCREMENT,
  `usuario` varchar(20) NOT NULL,
  `nombre` varchar(45) NOT NULL,
  `primerApellido` varchar(45) NOT NULL,
  `segundoApellido` varchar(45) NOT NULL,
  `correo` varchar(45) NOT NULL,
  `telefono` varchar(22) NOT NULL,
  `contrasenna` varchar(200) NOT NULL,
  `estado` tinyint(4) NOT NULL,
  `idRol` int(11) NOT NULL,
  PRIMARY KEY (`idUsuario`),
  UNIQUE KEY `correo_UNIQUE` (`correo`),
  UNIQUE KEY `usuario_UNIQUE` (`usuario`),
  KEY `fkRolUsuario_Usuario_idx` (`idRol`),
  CONSTRAINT `fkRolUsuario_Usuario` FOREIGN KEY (`idRol`) REFERENCES `rol_usuario` (`idRolUsuario`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario`
--

LOCK TABLES `usuario` WRITE;
/*!40000 ALTER TABLE `usuario` DISABLE KEYS */;
INSERT INTO `usuario` VALUES (1,'jfuentes','Jeremy','Fuentes','Venegas','jeremyfvcr15@gmail.com','85197237','Prueba',1,2),(2,'rherrera','Rodrigo','Herrera','Castillo','rrhc1606@gmail.com','85848621','123456',1,2),(3,'jalfaro','Jeyson','Alfaro','Ríos','jeysonalfaro83@gmail.com','72501418','123456',1,2),(4,'jvazquez','Jaime','Vazquez','Ríos','jeisonv83@gmail.com','72051418','123456',1,2);
/*!40000 ALTER TABLE `usuario` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-26 22:51:43
