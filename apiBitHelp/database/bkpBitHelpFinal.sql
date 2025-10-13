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
  `imagen` blob NOT NULL,
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario`
--

LOCK TABLES `usuario` WRITE;
/*!40000 ALTER TABLE `usuario` DISABLE KEYS */;
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

-- Dump completed on 2025-10-12 19:50:17
