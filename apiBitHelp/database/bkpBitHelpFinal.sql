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
  `idCategoria` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(45) NOT NULL,
  `idSla` int(11) NOT NULL,
  `estado` tinyint(4) NOT NULL,
  `idMetodoAsignacion` int(11) NOT NULL DEFAULT 2,
  PRIMARY KEY (`idCategoria`),
  UNIQUE KEY `idCategoria_UNIQUE` (`idCategoria`),
  KEY `fk_Sla_Categoria_idx` (`idSla`),
  KEY `fk_MetodoAsignacion_Categoria_idx` (`idMetodoAsignacion`),
  CONSTRAINT `fk_MetodoAsignacion_Categoria` FOREIGN KEY (`idMetodoAsignacion`) REFERENCES `metodo_asignacion` (`idMetodoAsignacion`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_Sla_Categoria` FOREIGN KEY (`idSla`) REFERENCES `sla` (`idSla`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categoria`
--

LOCK TABLES `categoria` WRITE;
/*!40000 ALTER TABLE `categoria` DISABLE KEYS */;
INSERT INTO `categoria` VALUES (1,'\"Hardware\" y dispositivos',4,1,2),(2,'\"Software\" y aplicaciones',3,1,2),(3,'Cuentas y Acceso',1,1,2),(4,'Redes y Conectividad',2,1,2),(5,'Otro',4,1,1);
/*!40000 ALTER TABLE `categoria` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categoria_especialidad`
--

DROP TABLE IF EXISTS `categoria_especialidad`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categoria_especialidad` (
  `idCategoria` int(11) NOT NULL,
  `idEspecialidad` int(11) NOT NULL,
  PRIMARY KEY (`idCategoria`,`idEspecialidad`),
  KEY `idEspecialidad` (`idEspecialidad`),
  CONSTRAINT `categoria_especialidad_ibfk_1` FOREIGN KEY (`idCategoria`) REFERENCES `categoria` (`idCategoria`),
  CONSTRAINT `categoria_especialidad_ibfk_2` FOREIGN KEY (`idEspecialidad`) REFERENCES `especialidad` (`idEspecialidad`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categoria_especialidad`
--

LOCK TABLES `categoria_especialidad` WRITE;
/*!40000 ALTER TABLE `categoria_especialidad` DISABLE KEYS */;
INSERT INTO `categoria_especialidad` VALUES (1,1),(1,2),(1,3),(1,4),(2,5),(2,6),(2,7),(3,8),(3,9),(3,10),(4,11),(4,12),(4,13),(4,14),(5,15);
/*!40000 ALTER TABLE `categoria_especialidad` ENABLE KEYS */;
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
  `idEspecialidad` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(45) NOT NULL,
  `estado` varchar(45) NOT NULL,
  `idmetodoAsignacion` int(11) NOT NULL,
  PRIMARY KEY (`idEspecialidad`),
  KEY `dk_MetodoAsignacion_Especialidad_idx` (`idmetodoAsignacion`),
  CONSTRAINT `fk_MetodoAsignacion_Especialidad` FOREIGN KEY (`idmetodoAsignacion`) REFERENCES `metodo_asignacion` (`idMetodoAsignacion`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `especialidad`
--

LOCK TABLES `especialidad` WRITE;
/*!40000 ALTER TABLE `especialidad` DISABLE KEYS */;
INSERT INTO `especialidad` VALUES (1,'Incidente con computadora','1',2),(2,'Incidente con impresa','1',1),(3,'Incidente con periféricos','1',2),(4,'Solicitud o préstamo de equipo','1',2),(5,'Incidente con aplicación','1',2),(6,'Incidente con archivo','1',1),(7,'Solicitud de instalación de aplicación','1',2),(8,'Restablecimiento de contraseña','1',2),(9,'Solicitude de desbloqueo','1',2),(10,'Gestión de permisos','1',1),(11,'Incidente con conexión a internet','1',2),(12,'Incidente con VPN','1',2),(13,'Incidente con acceso a servidores','1',2),(14,'Incidente con acceso a recursos compartidos','1',1),(15,'Otro','1',1);
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
INSERT INTO `estado_notificacion` VALUES (1,'No Leída'),(2,'Leída');
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
INSERT INTO `estado_tiquete` VALUES (1,'Pendiente',1),(2,'Asignado',1),(3,'En Proceso',1),(4,'Resuelto',1),(5,'Cerrado',1),(6,'Devuelto',1);
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
INSERT INTO `etiqueta` VALUES (1,'Computadora',1),(2,'Impresora',1),(3,'Monitor',1),(4,'Sistema Operativo',1),(5,'Antivirus',1),(6,'Correo Institucional',1),(7,'Conexión WiFi',1),(8,'Cableado',1),(9,'Licencia de Software',1),(10,'Cuenta de Usuario',1),(11,'Otro',11);
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
INSERT INTO `etiqueta_categoria` VALUES (1,1),(2,1),(3,1),(4,2),(5,2),(6,3),(7,4),(8,4),(9,2),(10,3),(11,5);
/*!40000 ALTER TABLE `etiqueta_categoria` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `flujo_estado_tiquete`
--

DROP TABLE IF EXISTS `flujo_estado_tiquete`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `flujo_estado_tiquete` (
  `idFlujoEstadoTiquete` int(11) NOT NULL AUTO_INCREMENT,
  `idEstadoActual` int(11) NOT NULL,
  `idNuevoEstado` int(11) NOT NULL,
  PRIMARY KEY (`idFlujoEstadoTiquete`),
  KEY `fk_EstadoActual_FlujoEstadoTiquete_idx` (`idEstadoActual`),
  KEY `fk_EstadoNuevo_FlujoEstadoTiquete_idx` (`idNuevoEstado`),
  CONSTRAINT `fk_EstadoActual_FlujoEstadoTiquete` FOREIGN KEY (`idEstadoActual`) REFERENCES `estado_tiquete` (`idEstadoTiquete`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_NuevoEstado_FlujoEstadoTiquete` FOREIGN KEY (`idNuevoEstado`) REFERENCES `estado_tiquete` (`idEstadoTiquete`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `flujo_estado_tiquete`
--

LOCK TABLES `flujo_estado_tiquete` WRITE;
/*!40000 ALTER TABLE `flujo_estado_tiquete` DISABLE KEYS */;
INSERT INTO `flujo_estado_tiquete` VALUES (1,2,3),(2,3,4),(3,4,5),(4,4,6),(5,6,3);
/*!40000 ALTER TABLE `flujo_estado_tiquete` ENABLE KEYS */;
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
INSERT INTO `historial_asignacion_tiquete` VALUES (1,1,3,1,'2025-11-04 09:05:00',3,'Asignación manual del equipo de Redes.'),(2,2,4,2,'2025-11-03 14:00:01',NULL,'Asignación automática a técnico con menor carga.'),(3,3,1,2,'2025-11-15 13:30:01',NULL,'Asignación automática por especialidad de software.'),(4,4,2,2,'2025-11-14 11:05:00',NULL,'Asignación automática por especialidad de red/VPN.'),(5,5,3,1,'2025-11-09 16:05:00',3,'Asignación manual para coordinación de licenciamiento.'),(6,6,1,2,'2025-10-30 08:00:01',NULL,'Asignación automática por especialidad de impresión.'),(7,7,2,2,'2025-11-06 15:30:01',NULL,'Asignación automática por prioridad crítica.'),(8,8,2,1,'2025-11-01 10:05:00',2,'Asignación manual rápida, Técnico 2 estaba disponible.'),(9,9,4,2,'2025-11-20 07:20:00',NULL,'Asignación automática por especialidad de cuentas/DB.'),(10,10,3,2,'2025-10-27 08:05:00',NULL,'Asignación automática por especialidad de contraseñas.');
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
INSERT INTO `historial_tiquete` VALUES (1,1,'2025-11-04 09:00:00',5,'Tiquete creado por el usuario solicitante.',1),(1,2,'2025-11-03 14:00:00',6,'Solicitud de periférico creada.',1),(1,3,'2025-11-15 13:30:00',7,'Tiquete creado. Problema de aplicación.',1),(1,4,'2025-11-14 11:00:00',8,'Incidente de VPN reportado (Alta).',1),(1,5,'2025-11-09 16:00:00',9,'Solicitud de instalación de AutoCAD.',1),(1,6,'2025-10-30 08:00:00',10,'Reporte de lentitud en impresora.',1),(1,7,'2025-11-06 15:30:00',9,'Fallo de acceso a recursos críticos. Máxima prioridad.',1),(1,8,'2025-11-01 10:00:00',8,'PC con reinicios constantes. Atención urgente.',1),(1,9,'2025-11-20 07:10:00',7,'Solicitud de gestión de permisos para DB.',1),(1,10,'2025-10-27 08:00:00',6,'Reporte de contraseña olvidada.',1),(1,18,'2025-11-15 18:36:49',5,'Tiquete registrado con un estado de Pendiente a la espera de ser asignado al personal técnico.',1),(1,50,'2025-11-29 01:05:17',5,'Tiquete registrado con un estado de Pendiente a la espera de ser asignado al personal técnico.',1),(1,52,'2025-11-29 09:16:19',9,'Tiquete registrado con un estado de Pendiente a la espera de ser asignado al personal técnico.',1),(1,53,'2025-11-29 11:01:36',9,'Tiquete registrado con un estado de Pendiente a la espera de ser asignado al personal técnico.',1),(1,54,'2025-11-29 11:04:50',9,'Tiquete registrado con un estado de Pendiente a la espera de ser asignado al personal técnico.',1),(1,55,'2025-12-06 17:14:06',9,'Tiquete registrado con un estado de Pendiente a la espera de ser asignado al personal técnico.',1),(2,1,'2025-11-04 09:05:00',3,'Asignado a Soporte Redes. Diagnóstico iniciado.',2),(2,2,'2025-11-03 14:05:00',4,'Asignado a Inventario/Periféricos.',2),(2,3,'2025-11-15 13:30:01',1,'Asignación automática a Soporte Software.',2),(2,4,'2025-11-14 11:05:00',2,'Asignado a Redes. Se revisan logs de conexión.',2),(2,5,'2025-11-09 16:05:00',3,'Asignado a Diseño/CAD. Se coordina licencia y horario de instalación.',2),(2,6,'2025-10-30 08:00:01',1,'Asignación automática a Impresoras.',2),(2,7,'2025-11-06 15:35:00',9,'Tiquete asignado según carga de trabajo.',2),(2,8,'2025-11-01 10:05:00',2,'Asignado a Hardware. Diagnóstico remoto.',2),(2,9,'2025-11-20 07:20:00',4,'Asignado a Bases de Datos. Revisando aprobación de Gerencia.',2),(2,10,'2025-10-27 08:05:00',3,'Asignado a Cuentas. Reseteo de contraseña iniciado.',2),(2,18,'2025-11-15 18:38:35',12,'Asignación manual al técnico Jaime Vazquez Ríos. Razón: Técnico con menor carga de trabajo.',2),(2,50,'2025-11-29 01:05:21',11,'Asignación Automática (Autotriage). Puntaje de Urgencia: 49520. Técnico seleccionado por menor Carga de Trabajo y especialidad compatible.',2),(2,52,'2025-11-29 09:16:22',11,'Asignación Automática (Autotriage). Puntaje de Urgencia: 49040. Técnico seleccionado por menor Carga de Trabajo y especialidad compatible.',2),(2,53,'2025-11-29 11:01:40',11,'Asignación Automática (Autotriage). Puntaje de Urgencia: 49040. Técnico seleccionado por menor Carga de Trabajo y especialidad compatible.',2),(2,54,'2025-11-29 11:06:48',12,'Asignación manual al técnico Jaime Vazquez Ríos. Razón: Técnico con menor carga de trabaja y especialización adecuada.',2),(3,1,'2025-11-04 12:50:00',3,'Problema de servidor resuelto. Tiquete marcado como resuelto.',4),(3,2,'2025-11-04 11:00:00',4,'Equipo entregado y configurado. Resuelto por técnico.',4),(3,3,'2025-11-15 13:45:00',1,'Técnico inicia el proceso de reinstalación de Office.',3),(3,4,'2025-11-14 11:30:00',2,'Se requiere revisión de la configuración del firewall central.',3),(3,6,'2025-10-30 09:30:00',1,'Técnico revisa configuración, se encuentra error en el spooler.',3),(3,8,'2025-11-01 12:45:00',2,'Reemplazo de hardware. Resuelto por técnico.',4),(3,9,'2025-11-20 08:30:00',4,'Permisos concedidos en ambiente de pruebas.',3),(3,10,'2025-10-27 08:20:00',3,'Contraseña actualizada y verificada con el usuario.',4),(3,50,'2025-11-29 01:09:07',3,'Se procede a iniciar con la revisión del caso, le notificaremos al tener novedades.',3),(3,54,'2025-11-29 11:10:57',4,'Inicia atención del tiquete.',3),(4,1,'2025-11-04 13:10:00',5,'Usuario confirma la solución y cierra el tiquete.',5),(4,2,'2025-11-04 11:30:00',6,'Usuario cierra y valora el servicio.',5),(4,3,'2025-11-15 14:45:00',1,'Proceso finalizado. Tiquete resuelto, esperando confirmación.',4),(4,6,'2025-11-01 10:45:00',1,'Problema resuelto. Tiquete marcado como resuelto.',4),(4,8,'2025-11-01 13:00:00',8,'Usuario cierra el tiquete.',5),(4,10,'2025-10-27 15:35:00',6,'Usuario cierra el tiquete.',5),(4,50,'2025-11-29 01:11:55',3,'Buenas noches,\n\nSe procede a realizar la revisión de la red, identificando que desde otras máquinas responde correctamente.',4),(4,54,'2025-11-29 11:12:09',4,'Buenos días,\n\nSe soluciona el tiquete.',4),(5,3,'2025-12-09 01:46:16',7,'Prueba',5),(5,6,'2025-11-01 11:00:00',10,'Usuario cierra el tiquete.',5),(5,50,'2025-11-29 01:14:26',5,'Buenas noches,\n\nRealicé la revisión desde mi máquina y aún sigue sin funcionar. Por favor darme ayuda urgente.',6),(5,54,'2025-11-29 11:13:46',9,'El problema fue corregido, gracias.',5),(6,50,'2025-11-29 01:16:44',3,'Se retoma la revisión del caso para llegar a la solución definitiva del problema.\nMil disculpas por los inconvenientes presentados.',3),(7,50,'2025-11-29 01:20:30',3,'Buenas noches,\n\nSe realiza una revisión exhaustiva con el usuario, logrando hacer pruebas desde su máquina y finalmente establecer la conexión. (Ver evidencias)',4),(8,50,'2025-11-29 01:30:56',5,'Se realiza la validación y finalmente funciona de manera correcta.\n\nMuchas gracias por la ayuda.',5);
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
INSERT INTO `imagen_historial_tiquete` VALUES (1,1,1,'uploads/ticket 1/idHistory 1/image 1.png'),(1,1,2,'uploads/ticket 2idHistory 1/image 1.png'),(1,1,5,'uploads/ticket 5/idHistory 1/image 1.png'),(1,1,54,'uploads/ticket 54/idHistory 1/image 1.jpeg'),(1,2,2,'uploads/ticket 2/idHistory 2/image 1.png'),(1,2,50,'uploads/ticket 50/idHistory 2/image 1.png'),(1,3,2,'uploads/ticket 2/idHistory 3/image 1.png'),(1,4,1,'uploads/ticket 1/idHistory 4/image 1.png'),(1,4,50,'uploads/ticket 50/idHistory 4/image 1.jpg'),(1,4,54,'uploads/ticket 54/idHistory 4/image 1.jpg'),(1,5,50,'uploads/ticket 50/idHistory 5/image 1.png'),(1,7,50,'uploads/ticket 50/idHistory 7/image 1.jpeg'),(2,4,54,'uploads/ticket 54/idHistory 4/image 2.jpg'),(2,7,50,'uploads/ticket 50/idHistory 7/image 2.jpg');
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
  `descripcion` varchar(300) NOT NULL,
  `idTiquete` int(11) DEFAULT NULL,
  `idEstadoNotificacion` int(11) NOT NULL,
  PRIMARY KEY (`idNotificacion`),
  KEY `fk_TipoNotificacion_Notificacion_idx` (`idTipoNotificacion`),
  KEY `fk_UsuarioRemitente_Usuario_idx` (`idUsuarioRemitente`),
  KEY `fk_UsuarioDestinatario_Usuario_idx` (`idUsuarioDestinatario`),
  KEY `fk_EstadoNotificacion_Notificacion_idx` (`idEstadoNotificacion`),
  KEY `fk_Tiquete_Notificacion` (`idTiquete`),
  CONSTRAINT `fk_EstadoNotificacion_Notificacion` FOREIGN KEY (`idEstadoNotificacion`) REFERENCES `estado_notificacion` (`idEstadoNotificacion`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_TipoNotificacion_Notificacion` FOREIGN KEY (`idTipoNotificacion`) REFERENCES `tipo_notificacion` (`idTipoNotificacion`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_Tiquete_Notificacion` FOREIGN KEY (`idTiquete`) REFERENCES `tiquete` (`idTiquete`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `fk_UsuarioDestinatario_Notificacion` FOREIGN KEY (`idUsuarioDestinatario`) REFERENCES `usuario` (`idUsuario`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_UsuarioRemitente_Notificacion` FOREIGN KEY (`idUsuarioRemitente`) REFERENCES `usuario` (`idUsuario`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notificacion`
--

LOCK TABLES `notificacion` WRITE;
/*!40000 ALTER TABLE `notificacion` DISABLE KEYS */;
INSERT INTO `notificacion` VALUES (2,2,2,2,'2025-11-24 07:29:18','Inicio de sesión detectado para: Rodrigo Herrera Castillo',NULL,2),(3,2,2,11,'2025-11-24 07:29:18','Inicio de sesión detectado para: Rodrigo Herrera Castillo',NULL,1),(4,2,1,1,'2025-11-24 07:30:23','Inicio de sesión detectado para: Jeremy Fuentes Venegas',NULL,1),(5,2,1,11,'2025-11-24 07:30:23','Inicio de sesión detectado para: Jeremy Fuentes Venegas',NULL,1),(6,2,1,2,'2025-11-24 07:30:23','Inicio de sesión detectado para: Jeremy Fuentes Venegas',NULL,2),(7,2,3,3,'2025-11-24 07:30:49','Inicio de sesión detectado para: Jeyson Alfaro Ríos',NULL,1),(8,2,3,11,'2025-11-24 07:30:49','Inicio de sesión detectado para: Jeyson Alfaro Ríos',NULL,1),(9,2,3,2,'2025-11-24 07:30:49','Inicio de sesión detectado para: Jeyson Alfaro Ríos',NULL,2),(10,2,3,3,'2025-11-24 07:36:25','Inicio de sesión detectado para: Jeyson Alfaro Ríos',NULL,1),(11,2,3,11,'2025-11-24 07:36:25','Inicio de sesión detectado para: Jeyson Alfaro Ríos',NULL,1),(12,2,3,2,'2025-11-24 07:36:25','Inicio de sesión detectado para: Jeyson Alfaro Ríos',NULL,1),(13,2,2,2,'2025-11-24 07:39:18','Inicio de sesión detectado para: Rodrigo Herrera Castillo',NULL,1),(14,2,2,11,'2025-11-24 07:39:18','Inicio de sesión detectado para: Rodrigo Herrera Castillo',NULL,1),(15,2,2,2,'2025-11-24 07:43:13','Inicio de sesión detectado para: Rodrigo Herrera Castillo',NULL,1),(16,2,2,11,'2025-11-24 07:43:13','Inicio de sesión detectado para: Rodrigo Herrera Castillo',NULL,1),(17,2,2,2,'2025-11-24 07:43:16','Inicio de sesión detectado para: Rodrigo Herrera Castillo',NULL,1),(18,2,2,11,'2025-11-24 07:43:16','Inicio de sesión detectado para: Rodrigo Herrera Castillo',NULL,1),(19,2,2,2,'2025-11-24 07:45:29','Inicio de sesión detectado para: Rodrigo Herrera Castillo',NULL,1),(20,2,2,11,'2025-11-24 07:45:29','Inicio de sesión detectado para: Rodrigo Herrera Castillo',NULL,1),(21,2,2,2,'2025-11-24 07:52:23','Inicio de sesión detectado para: Rodrigo Herrera Castillo',NULL,1),(22,2,2,11,'2025-11-24 07:52:23','Inicio de sesión detectado para: Rodrigo Herrera Castillo',NULL,1),(23,2,5,5,'2025-11-29 01:04:39','Inicio de sesión detectado para: María Soto Soto',NULL,1),(24,1,5,5,'2025-11-29 01:05:17','Tu ticket #50 \'Problema de conexión a internet\' fue creado exitosamente',50,1),(25,1,5,11,'2025-11-29 01:05:17','Nuevo ticket #50 \'Problema de conexión a internet\' creado por María Soto',50,1),(26,1,11,5,'2025-11-29 01:05:17','Ticket #50 fue asignado automáticamente al técnico Jeyson Alfaro',50,1),(27,1,11,3,'2025-11-29 01:05:17','Ticket #50 \'Problema de conexión a internet\' te fue asignado automáticamente',50,1),(28,2,3,3,'2025-11-29 01:06:29','Inicio de sesión detectado para: Jeyson Alfaro Ríos',NULL,1),(29,1,3,5,'2025-11-29 01:09:07','Ticket #50 \'Problema de conexión a internet\' cambió de estado a \'En Proceso\'. El técnico está trabajando en tu solicitud.',50,1),(30,1,3,3,'2025-11-29 01:09:07','Ticket #50 \'Problema de conexión a internet\' cambió de estado a \'En Proceso\'. Comenzaste a trabajar en este ticket.',50,1),(31,1,3,5,'2025-11-29 01:11:55','Ticket #50 \'Problema de conexión a internet\' cambió de estado a \'Resuelto\'. Por favor verifica que tu problema fue solucionado.',50,2),(32,2,5,5,'2025-11-29 01:12:39','Inicio de sesión detectado para: María Soto Soto',NULL,1),(33,1,5,5,'2025-11-29 01:14:26','Ticket #50 \'Problema de conexión a internet\' cambió de estado a \'Devuelto\'. El problema será revisado nuevamente.',50,1),(34,1,5,3,'2025-11-29 01:14:26','Ticket #50 \'Problema de conexión a internet\' cambió de estado a \'Devuelto\'. El cliente reporta que el problema persiste.',50,2),(35,2,3,3,'2025-11-29 01:15:30','Inicio de sesión detectado para: Jeyson Alfaro Ríos',NULL,2),(36,1,3,5,'2025-11-29 01:16:44','Ticket #50 \'Problema de conexión a internet\' cambió de estado a \'En Proceso\'. El técnico está revisando nuevamente tu solicitud.',50,1),(37,1,3,3,'2025-11-29 01:16:44','Ticket #50 \'Problema de conexión a internet\' cambió de estado a \'En Proceso\'. Continúas trabajando en este ticket.',50,1),(38,1,3,5,'2025-11-29 01:20:31','Ticket #50 \'Problema de conexión a internet\' cambió de estado a \'Resuelto\'. Por favor verifica que tu problema fue solucionado.',50,1),(39,2,5,5,'2025-11-29 01:25:15','Inicio de sesión detectado para: María Soto Soto',NULL,1),(40,1,5,3,'2025-11-29 01:30:56','Ticket #50 \'Problema de conexión a internet\' cambió de estado a \'Cerrado\'. El cliente confirmó la solución.',50,1),(41,2,5,5,'2025-11-29 01:44:43','Inicio de sesión detectado para: María Soto Soto',NULL,1),(46,2,3,3,'2025-11-29 01:45:30','Inicio de sesión detectado para: Jeyson Alfaro Ríos',NULL,1),(50,2,5,5,'2025-11-29 01:51:11','Inicio de sesión detectado para: María Soto Soto',NULL,1),(53,2,3,3,'2025-11-29 01:52:09','Inicio de sesión detectado para: Jeyson Alfaro Ríos',NULL,1),(54,2,9,9,'2025-11-29 09:09:02','Inicio de sesión detectado para: Pablo Méndez Castro',NULL,1),(55,2,11,11,'2025-11-29 09:12:58','Inicio de sesión detectado para: Sistema Automático ',NULL,1),(56,2,9,9,'2025-11-29 09:13:56','Inicio de sesión detectado para: Pablo Méndez Castro',NULL,1),(57,1,9,9,'2025-11-29 09:16:20','Tu ticket #52 \'No me deja acceder a ver videos\' fue creado exitosamente',52,1),(58,1,9,11,'2025-11-29 09:16:20','Nuevo ticket #52 \'No me deja acceder a ver videos\' creado por Pablo Méndez',52,1),(59,1,11,9,'2025-11-29 09:16:20','Ticket #52 fue asignado automáticamente al técnico Jeremy Fuentes',52,1),(60,1,11,1,'2025-11-29 09:16:20','Ticket #52 \'No me deja acceder a ver videos\' te fue asignado automáticamente',52,1),(61,2,9,9,'2025-11-29 09:18:22','Inicio de sesión detectado para: Pablo Méndez Castro',NULL,1),(62,2,9,9,'2025-11-29 09:53:31','Inicio de sesión detectado para: Pablo Méndez Castro',NULL,1),(63,2,11,11,'2025-11-29 10:00:43','Inicio de sesión detectado para: Sistema Automático ',NULL,1),(64,2,9,9,'2025-11-29 10:02:39','Inicio de sesión detectado para: Pablo Méndez Castro',NULL,1),(65,2,11,11,'2025-11-29 10:06:44','Inicio de sesión detectado para: Sistema Automático ',NULL,1),(66,1,11,5,'2025-11-29 10:26:35','Ticket #18 \'Contraseña olvidada\' fue asignado manualmente al técnico Jaime Vazquez',18,1),(67,1,11,4,'2025-11-29 10:26:35','Ticket #18 \'Contraseña olvidada\' te fue asignado manualmente',18,1),(68,2,12,12,'2025-11-29 10:31:57','Inicio de sesión detectado para: Admin  ',NULL,1),(69,2,9,9,'2025-11-29 10:34:42','Inicio de sesión detectado para: Pablo Méndez Castro',NULL,1),(70,2,12,12,'2025-11-29 10:37:02','Inicio de sesión detectado para: Admin  ',NULL,1),(71,2,12,12,'2025-11-29 10:51:01','Inicio de sesión detectado para: Admin  ',NULL,1),(72,2,9,9,'2025-11-29 10:56:27','Inicio de sesión detectado para: Pablo Méndez Castro',NULL,1),(73,2,9,9,'2025-11-29 10:57:19','Inicio de sesión detectado para: Pablo Méndez Castro',NULL,1),(74,2,9,9,'2025-11-29 10:59:46','Inicio de sesión detectado para: Pablo Méndez Castro',NULL,1),(75,1,9,9,'2025-11-29 11:01:36','Tu ticket #53 \'Antivirus vencido\' fue creado exitosamente',53,1),(76,1,9,12,'2025-11-29 11:01:36','Nuevo ticket #53 \'Antivirus vencido\' creado por Pablo Méndez',53,1),(77,1,9,11,'2025-11-29 11:01:36','Nuevo ticket #53 \'Antivirus vencido\' creado por Pablo Méndez',53,1),(78,1,11,9,'2025-11-29 11:01:36','Ticket #53 fue asignado automáticamente al técnico Jeremy Fuentes',53,1),(79,1,11,1,'2025-11-29 11:01:36','Ticket #53 \'Antivirus vencido\' te fue asignado automáticamente',53,1),(80,1,9,9,'2025-11-29 11:04:50','Tu ticket #54 \'Problema de acceso al servidor\' fue creado exitosamente',54,1),(81,1,9,12,'2025-11-29 11:04:50','Nuevo ticket #54 \'Problema de acceso al servidor\' creado por Pablo Méndez',54,1),(82,1,9,11,'2025-11-29 11:04:50','Nuevo ticket #54 \'Problema de acceso al servidor\' creado por Pablo Méndez',54,1),(83,2,12,12,'2025-11-29 11:05:23','Inicio de sesión detectado para: Admin  ',NULL,1),(84,1,12,9,'2025-11-29 11:06:48','Ticket #54 \'Problema de acceso al servidor\' fue asignado manualmente al técnico Jaime Vazquez',54,1),(85,1,12,4,'2025-11-29 11:06:48','Ticket #54 \'Problema de acceso al servidor\' te fue asignado manualmente',54,1),(86,2,4,4,'2025-11-29 11:08:59','Inicio de sesión detectado para: Jaime Vazquez Ríos',NULL,1),(87,1,4,9,'2025-11-29 11:10:57','Ticket #54 \'Problema de acceso al servidor\' cambió de estado a \'En Proceso\'. El técnico está trabajando en tu solicitud.',54,1),(88,1,4,4,'2025-11-29 11:10:57','Ticket #54 \'Problema de acceso al servidor\' cambió de estado a \'En Proceso\'. Comenzaste a trabajar en este ticket.',54,1),(89,1,4,9,'2025-11-29 11:12:09','Ticket #54 \'Problema de acceso al servidor\' cambió de estado a \'Resuelto\'. Por favor verifica que tu problema fue solucionado.',54,1),(90,2,9,9,'2025-11-29 11:12:51','Inicio de sesión detectado para: Pablo Méndez Castro',NULL,1),(91,1,9,4,'2025-11-29 11:13:46','Ticket #54 \'Problema de acceso al servidor\' cambió de estado a \'Cerrado\'. El cliente confirmó la solución.',54,1),(92,2,5,5,'2025-11-29 11:14:27','Inicio de sesión detectado para: María Soto Soto',NULL,1),(93,2,9,9,'2025-12-06 17:13:29','Inicio de sesión detectado para: Pablo Méndez Castro',NULL,1),(94,1,9,9,'2025-12-06 17:14:06','Tu ticket #55 \'Problema en youtube\' fue creado exitosamente',55,1),(95,1,9,12,'2025-12-06 17:14:06','Nuevo ticket #55 \'Problema en youtube\' creado por Pablo Méndez',55,1),(96,1,9,11,'2025-12-06 17:14:06','Nuevo ticket #55 \'Problema en youtube\' creado por Pablo Méndez',55,1),(97,2,12,12,'2025-12-06 17:14:14','Inicio de sesión detectado para: Admin  ',NULL,1),(98,2,12,12,'2025-12-09 00:40:47','Inicio de sesión detectado para: Admin  ',NULL,1),(99,2,7,7,'2025-12-09 00:41:36','Inicio de sesión detectado para: Andrés Flores Vargas',NULL,1),(100,1,7,1,'2025-12-09 00:42:13','Ticket #3 \'Problema con Excel en equipo nuevo\' cambió de estado a \'Cerrado\'. El cliente confirmó la solución.',3,1),(101,1,7,1,'2025-12-09 00:46:45','Ticket #3 \'Problema con Excel en equipo nuevo\' cambió de estado a \'Cerrado\'. El cliente confirmó la solución.',3,1),(102,1,7,1,'2025-12-09 00:48:27','Ticket #3 \'Problema con Excel en equipo nuevo\' cambió de estado a \'Cerrado\'. El cliente confirmó la solución.',3,1),(103,1,7,1,'2025-12-09 00:52:06','Ticket #3 \'Problema con Excel en equipo nuevo\' cambió de estado a \'Cerrado\'. El cliente confirmó la solución.',3,1),(104,1,7,1,'2025-12-09 01:01:30','Ticket #3 \'Problema con Excel en equipo nuevo\' cambió de estado a \'Cerrado\'. El cliente confirmó la solución.',3,1),(105,1,7,7,'2025-12-09 01:05:44','Ticket #3 \'Problema con Excel en equipo nuevo\' cambió de estado a \'Devuelto\'. El problema será revisado nuevamente.',3,1),(106,1,7,1,'2025-12-09 01:05:44','Ticket #3 \'Problema con Excel en equipo nuevo\' cambió de estado a \'Devuelto\'. El cliente reporta que el problema persiste.',3,1),(107,1,7,1,'2025-12-09 01:06:39','Ticket #3 \'Problema con Excel en equipo nuevo\' cambió de estado a \'Cerrado\'. El cliente confirmó la solución.',3,1),(108,1,7,1,'2025-12-09 01:10:47','Ticket #3 \'Problema con Excel en equipo nuevo\' cambió de estado a \'Cerrado\'. El cliente confirmó la solución.',3,1),(109,1,7,1,'2025-12-09 01:11:36','Ticket #3 \'Problema con Excel en equipo nuevo\' cambió de estado a \'Cerrado\'. El cliente confirmó la solución.',3,1),(110,1,7,1,'2025-12-09 01:13:27','Ticket #3 \'Problema con Excel en equipo nuevo\' cambió de estado a \'Cerrado\'. El cliente confirmó la solución.',3,1),(111,1,7,1,'2025-12-09 01:36:53','Ticket #3 \'Problema con Excel en equipo nuevo\' cambió de estado a \'Cerrado\'. El cliente confirmó la solución.',3,1),(112,1,7,1,'2025-12-09 01:42:00','Ticket #3 \'Problema con Excel en equipo nuevo\' cambió de estado a \'Cerrado\'. El cliente confirmó la solución.',3,1),(113,1,7,1,'2025-12-09 01:43:26','Ticket #3 \'Problema con Excel en equipo nuevo\' cambió de estado a \'Cerrado\'. El cliente confirmó la solución.',3,1),(114,1,7,1,'2025-12-09 01:44:37','Ticket #3 \'Problema con Excel en equipo nuevo\' cambió de estado a \'Cerrado\'. El cliente confirmó la solución.',3,1),(115,1,7,1,'2025-12-09 01:46:16','Ticket #3 \'Problema con Excel en equipo nuevo\' cambió de estado a \'Cerrado\'. El cliente confirmó la solución.',3,1),(116,2,1,1,'2025-12-09 21:54:30','Inicio de sesión detectado para: Jeremy Fuentes Venegas',NULL,1),(117,2,2,2,'2025-12-09 22:34:30','Inicio de sesión detectado para: Rodrigo Herrera Castillo',NULL,1),(118,2,3,3,'2025-12-09 22:54:14','Inicio de sesión detectado para: Jeyson Alfaro Ríos',NULL,1),(119,2,4,4,'2025-12-09 23:56:02','Inicio de sesión detectado para: Jaime Vazquez Ríos',NULL,1),(120,2,12,12,'2025-12-10 00:03:48','Inicio de sesión detectado para: Admin  ',NULL,1),(121,2,12,12,'2025-12-10 00:20:14','Inicio de sesión detectado para: Admin  ',NULL,1),(122,2,1,1,'2025-12-10 21:22:04','Inicio de sesión detectado para: Jeremy Fuentes Venegas',NULL,1),(123,2,12,12,'2025-12-10 21:22:18','Inicio de sesión detectado para: Admin  ',NULL,1);
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
INSERT INTO `tecnico` VALUES (1,1,1,'48:00:00',1),(2,2,1,'08:00:00',1),(3,3,1,'16:00:00',1),(4,4,1,'08:00:00',1);
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
INSERT INTO `tecnico_especialidad` VALUES (1,2),(1,5),(1,15),(2,1),(2,12),(2,14),(2,15),(3,7),(3,8),(3,13),(3,15),(4,2),(4,3),(4,4),(4,10);
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
INSERT INTO `tipo_notificacion` VALUES (1,'Cambio de Estado de Ticket'),(2,'Inicio de Sesión');
/*!40000 ALTER TABLE `tipo_notificacion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tiquete`
--

DROP TABLE IF EXISTS `tiquete`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tiquete` (
  `idTiquete` int(11) NOT NULL AUTO_INCREMENT,
  `idUsuarioSolicita` int(11) NOT NULL,
  `idUsuarioCierra` int(11) DEFAULT NULL,
  `titulo` varchar(45) NOT NULL,
  `descripcion` varchar(300) NOT NULL,
  `idEstado` int(11) NOT NULL,
  `idPrioridad` int(11) NOT NULL,
  `idCategoria` int(11) DEFAULT NULL,
  `idEspecialidad` int(11) DEFAULT NULL,
  `fechaCreacion` datetime NOT NULL,
  `fechaCierre` datetime DEFAULT NULL,
  `tiempoResolucion` datetime DEFAULT NULL,
  `slaRespuesta` datetime DEFAULT NULL,
  `slaResolucion` datetime DEFAULT NULL,
  `cumplimientoSlaRespuesta` tinyint(4) DEFAULT NULL,
  `cumplimientoSlaResolucion` tinyint(4) DEFAULT NULL,
  `idTecnicoAsignado` int(11) DEFAULT NULL,
  `idMetodoAsignacion` int(11) DEFAULT NULL,
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
  KEY `fk_Categoria_Tiquete_idx` (`idCategoria`),
  CONSTRAINT `fk_Categoria_Tiquete` FOREIGN KEY (`idCategoria`) REFERENCES `categoria` (`idCategoria`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_Especialidad_Tiquete` FOREIGN KEY (`idEspecialidad`) REFERENCES `especialidad` (`idEspecialidad`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_EstadoTiquete_Tiquete` FOREIGN KEY (`idEstado`) REFERENCES `estado_tiquete` (`idEstadoTiquete`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_MetodoAsignacion_Tiquete` FOREIGN KEY (`idMetodoAsignacion`) REFERENCES `metodo_asignacion` (`idMetodoAsignacion`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_PrioridadTiquete_Tiquete` FOREIGN KEY (`idPrioridad`) REFERENCES `prioridad_tiquete` (`idPrioridadTiquete`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_Tecnico_Tiquete` FOREIGN KEY (`idTecnicoAsignado`) REFERENCES `tecnico` (`idTecnico`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_UsuarioCierra_Tiquete` FOREIGN KEY (`idUsuarioCierra`) REFERENCES `usuario` (`idUsuario`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_UsuarioCrea_Tiquete` FOREIGN KEY (`idUsuarioSolicita`) REFERENCES `usuario` (`idUsuario`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=56 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tiquete`
--

LOCK TABLES `tiquete` WRITE;
/*!40000 ALTER TABLE `tiquete` DISABLE KEYS */;
INSERT INTO `tiquete` VALUES (1,5,5,'Servidor de Correo Caído','Nadie puede enviar o recibir correos electrónicos, impacto crítico en la operación.',5,1,4,13,'2025-11-04 09:00:00','2025-11-04 13:10:00','2025-11-04 04:10:00','2025-11-04 09:15:00','2025-11-04 13:00:00',1,1,3,1,'Resolvieron un problema muy serio en tiempo récord.',5),(2,6,6,'Solicitud de mouse ergonómico','Necesito un mouse vertical para prevenir el dolor de muñeca.',5,4,1,3,'2025-11-03 14:00:00','2025-11-04 11:30:00','2025-11-04 21:30:00','2025-11-03 14:30:00','2025-11-04 10:00:00',1,1,4,2,'El equipo fue entregado al día siguiente sin problemas.',4),(3,7,7,'Problema con Excel en equipo nuevo','Al abrir archivos grandes, Excel se cierra inesperadamente.',5,3,2,5,'2025-11-15 13:30:00','2025-12-09 01:46:16',NULL,NULL,NULL,NULL,NULL,1,2,'A',5),(4,8,NULL,'Mi cuenta de VPN no funciona','No puedo conectarme a la red de la oficina desde casa.',3,2,4,12,'2025-11-14 11:00:00',NULL,NULL,'2025-11-14 11:10:00',NULL,1,NULL,2,2,NULL,NULL),(5,9,NULL,'Petición de software de diseño','Solicito la instalación del programa AutoCAD en mi estación.',2,4,2,7,'2025-11-09 16:00:00',NULL,NULL,'2025-11-09 16:30:00','2025-11-10 14:00:00',1,1,3,1,NULL,NULL),(6,10,10,'Impresora del 3er piso imprime lento','El trabajo de impresión tarda más de 5 minutos en salir.',5,3,1,2,'2025-10-30 08:00:00','2025-11-01 11:00:00','2025-11-06 03:00:00','2025-10-30 08:50:00','2025-11-01 09:30:00',0,0,1,2,'Demoró más de lo esperado en resolverse.',2),(7,9,NULL,'No puedo acceder a recursos compartidos','Error de permisos al intentar abrir la carpeta del departamento de marketing.',1,1,4,14,'2025-11-06 15:30:00',NULL,NULL,'2025-11-06 15:58:00','2025-11-06 16:30:00',1,1,NULL,2,'Excelente atención me ayudaron muy rápido',5),(8,8,8,'Mi PC se reinicia constantemente','Fallo de hardware intermitente. Urgente para poder trabajar.',5,2,1,1,'2025-11-01 10:00:00','2025-11-01 13:00:00','2025-11-04 03:00:00','2025-11-01 10:28:30','2025-11-01 12:46:00',1,1,2,1,'El técnico fue muy profesional y cambió la memoria en menos de 3 horas.',5),(9,7,NULL,'Solicitud de acceso a base de datos','Necesito permisos de lectura para la DB de producción.',3,3,3,10,'2025-11-20 07:10:00',NULL,NULL,'2025-11-20 07:29:00','2025-11-20 10:09:00',1,1,4,2,NULL,NULL),(10,6,6,'Restablecer mi contraseña de dominio','Olvidé mi contraseña después de las vacaciones.',5,3,3,8,'2025-10-27 08:00:00','2025-10-27 15:35:00','2025-11-04 07:35:00','2025-10-27 08:23:07','2025-10-27 14:50:45',1,1,3,2,'Fue una resolución del mismo día, excelente servicio.',5),(18,5,NULL,'Contraseña olvidada','No recuerdo la contraseña que había configurado previamente para acceder al servidor 192.168.x.x.\n\nPueden por favor ayudarme a restablecer la contraseña.',2,3,3,NULL,'2025-11-15 18:36:49',NULL,NULL,'2025-11-29 10:26:35',NULL,1,NULL,4,1,NULL,NULL),(50,5,5,'Problema de conexión a internet','Al intentar conectar internet en mi máquina mediante red WIFI nunca termina de conectarse correctamente.',5,2,4,NULL,'2025-11-29 01:05:17','2025-11-29 01:30:56',NULL,'2025-11-29 01:05:20','2025-11-29 01:20:30',1,1,3,2,'Se resuelve el problema rápidamente, sin embargo tuvo que devolverse el tiquete.',3),(52,9,NULL,'No me deja acceder a ver videos','Al entrar a YouTube a ver videos me sale un tipo de bloqueo, esto lo utilizo para ver música nada más.',2,2,2,NULL,'2025-11-29 09:16:19',NULL,NULL,'2025-11-29 09:16:25',NULL,1,NULL,1,2,NULL,NULL),(53,9,NULL,'Antivirus vencido','El antivirus me muestra un mensaje de que se encuentra vencido, por favor ayuda.',2,2,2,NULL,'2025-11-29 11:01:36',NULL,NULL,'2025-11-29 11:01:39',NULL,1,NULL,1,2,NULL,NULL),(54,9,9,'Problema de acceso al servidor','Tengo problemas al intentar acceder al servidor xxxx.xxxx.xxxx',5,1,5,NULL,'2025-11-29 11:04:50','2025-11-29 11:13:46',NULL,'2025-11-29 11:06:48',NULL,1,NULL,4,1,NULL,NULL),(55,9,NULL,'Problema en youtube','No me funciona mi licencia de youtube',1,4,5,NULL,'2025-12-06 17:14:06',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario`
--

LOCK TABLES `usuario` WRITE;
/*!40000 ALTER TABLE `usuario` DISABLE KEYS */;
INSERT INTO `usuario` VALUES (1,'jfuentes','Jeremy','Fuentes','Venegas','jeremyfvcr15@gmail.com','85197237','$2y$10$zwUlDMVF5g.YXfqkWzv7..KeGA533te/BuOKy9r6YK4ejU2.WRILq',1,2),(2,'rherrera','Rodrigo','Herrera','Castillo','rrhc1606@gmail.com','85848621','$2y$10$zwUlDMVF5g.YXfqkWzv7..KeGA533te/BuOKy9r6YK4ejU2.WRILq',1,2),(3,'jalfaro','Jeyson','Alfaro','Ríos','jeysonalfaro83@gmail.com','72501418','$2y$10$gELLe0TeMkxuSPI7gZ6nfOvKsvGpDCoAIBYnvCvURq6b5HErIKNhS',1,2),(4,'jvazquez','Jaime','Vazquez','Ríos','jeisonv83@gmail.com','72051418','$2y$10$zwUlDMVF5g.YXfqkWzv7..KeGA533te/BuOKy9r6YK4ejU2.WRILq',1,2),(5,'msoto','María','Soto','Soto','msoto.soto@techpro.com','60112022','$2y$10$zwUlDMVF5g.YXfqkWzv7..KeGA533te/BuOKy9r6YK4ejU2.WRILq',1,1),(6,'lchavez','Luis','Chávez','Arias','lchavez@protool.com','60334044','pass123',1,1),(7,'aflores','Andrés','Flores','Vargas','aflores.vargas@rugama.com','60556066','$2y$10$zwUlDMVF5g.YXfqkWzv7..KeGA533te/BuOKy9r6YK4ejU2.WRILq',1,1),(8,'crojas','Carla','Rojas','Mora','crojas.mora@tonypan.com','60778088','pass123',1,1),(9,'pmendez','Pablo','Méndez','Castro','pmendez@techpro.com','60990100','$2y$10$vyP8TuUha7La33xDK5fVyOL9/FFuHfSAEHMtsVZFBhaIYQR394Iuq',1,1),(10,'gquiros','Gabriela','Quirós','León','gquiros.leon@protool.com','61112122','pass123',1,1),(11,'sistema','Sistema','Automático','','system@bithelp.com','','$2y$10$zwUlDMVF5g.YXfqkWzv7..KeGA533te/BuOKy9r6YK4ejU2.WRILq',1,3),(12,'admin','Admin','','','','','$2y$10$zwUlDMVF5g.YXfqkWzv7..KeGA533te/BuOKy9r6YK4ejU2.WRILq',1,3);
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

-- Dump completed on 2025-12-10 21:56:43
