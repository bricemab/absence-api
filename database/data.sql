-- MySQL dump 10.13  Distrib 8.0.33, for Win64 (x86_64)
--
-- Host: localhost    Database: absences
-- ------------------------------------------------------
-- Server version	8.0.33

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
-- Table structure for table `api_clients`
--

DROP TABLE IF EXISTS `api_clients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `api_clients` (
  `id` int NOT NULL AUTO_INCREMENT,
  `key` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `validation_key` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `client_key` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `creation_date` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `key` (`key`),
  UNIQUE KEY `validation_key` (`validation_key`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `api_clients`
--

LOCK TABLES `api_clients` WRITE;
/*!40000 ALTER TABLE `api_clients` DISABLE KEYS */;
INSERT INTO `api_clients` VALUES (2,'asdfASDFI234','439c6cb53fb4dd65cd286c0ca080a29aa56277e59b379a017915a1e51cbb321d','champlan','2024-01-16 20:20:20');
/*!40000 ALTER TABLE `api_clients` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `certificate_timeslots`
--

DROP TABLE IF EXISTS `certificate_timeslots`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `certificate_timeslots` (
  `id` int NOT NULL AUTO_INCREMENT,
  `certificate_id` int NOT NULL,
  `week_day` int NOT NULL,
  `start_hours` varchar(45) COLLATE utf8mb4_general_ci NOT NULL,
  `end_hours` varchar(45) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `asdfasdf_idx` (`certificate_id`),
  CONSTRAINT `fk_certificat_timeslot` FOREIGN KEY (`certificate_id`) REFERENCES `certificates` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `certificate_timeslots`
--

LOCK TABLES `certificate_timeslots` WRITE;
/*!40000 ALTER TABLE `certificate_timeslots` DISABLE KEYS */;
INSERT INTO `certificate_timeslots` VALUES (1,1,2,'12:00','14:00'),(2,1,4,'10:00','12:00');
/*!40000 ALTER TABLE `certificate_timeslots` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `certificates`
--

DROP TABLE IF EXISTS `certificates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `certificates` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `key` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `user_key` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `from_date` datetime NOT NULL,
  `to_date` datetime NOT NULL,
  `client_key` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `creator_api_client_id` int NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `fk_api_client_creator_idx` (`creator_api_client_id`),
  CONSTRAINT `fk_api_client_creator` FOREIGN KEY (`creator_api_client_id`) REFERENCES `api_clients` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `certificates`
--

LOCK TABLES `certificates` WRITE;
/*!40000 ALTER TABLE `certificates` DISABLE KEYS */;
INSERT INTO `certificates` VALUES (1,'Cerificat de test','hbaQoY01tvQEFXA8SkJdxoOibjNFW9rZ3OIK7HEmMNzvk9oUTO','G7gvpRV33zACrgAwDf84U5BXAX3hG1bD82lz4FQEBuycCNr1gq','2024-01-01 00:00:00','2024-06-05 00:00:00','champlan',2,1);
/*!40000 ALTER TABLE `certificates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clients`
--

DROP TABLE IF EXISTS `clients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clients` (
  `id` int NOT NULL AUTO_INCREMENT,
  `key` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `key` (`key`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clients`
--

LOCK TABLES `clients` WRITE;
/*!40000 ALTER TABLE `clients` DISABLE KEYS */;
INSERT INTO `clients` VALUES (1,'champlan','Champlan');
/*!40000 ALTER TABLE `clients` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `logs`
--

DROP TABLE IF EXISTS `logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `action` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `date` datetime DEFAULT NULL,
  `user_key` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `device_key` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `client_key` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `api_client_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_key` (`user_key`),
  CONSTRAINT `logs_ibfk_1` FOREIGN KEY (`user_key`) REFERENCES `users` (`key`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `logs`
--

LOCK TABLES `logs` WRITE;
/*!40000 ALTER TABLE `logs` DISABLE KEYS */;
INSERT INTO `logs` VALUES (3,'USER_NEW','2024-01-16 23:18:27','2D1tH2fzzNwz34uI3bfVgAH98LgdfBFACdbUNwWF4zs5WmTzJA','zhRzhx7ATpzdeqR7McyvgKfgC2prEy7RWlItRdNzVmh3uLSOM5','champlan',2),(4,'USER_NEW','2024-01-24 16:58:04','G7gvpRV33zACrgAwDf84U5BXAX3hG1bD82lz4FQEBuycCNr1gq','mqSjwOhb4vfMxXtbSuQMZag6vZQYdxvnAjpVLW26EjrhvjxpFi','champlan',2);
/*!40000 ALTER TABLE `logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rooms`
--

DROP TABLE IF EXISTS `rooms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rooms` (
  `id` int NOT NULL AUTO_INCREMENT,
  `key` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `client_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `key` (`key`),
  KEY `client_room_fk_idx` (`client_id`),
  CONSTRAINT `client_room_fk` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rooms`
--

LOCK TABLES `rooms` WRITE;
/*!40000 ALTER TABLE `rooms` DISABLE KEYS */;
INSERT INTO `rooms` VALUES (1,'salle-203','Salle 203',1);
/*!40000 ALTER TABLE `rooms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `scanner_logs`
--

DROP TABLE IF EXISTS `scanner_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `scanner_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_key` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `device_key` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `client_key` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `room_id` int DEFAULT NULL,
  `date` datetime DEFAULT NULL,
  `type` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_key` (`user_key`),
  KEY `client_key` (`client_key`),
  KEY `scanner_logs_ibfk_4_idx` (`room_id`),
  KEY `device_key` (`device_key`),
  CONSTRAINT `scanner_logs_ibfk_1` FOREIGN KEY (`user_key`) REFERENCES `users` (`key`),
  CONSTRAINT `scanner_logs_ibfk_3` FOREIGN KEY (`client_key`) REFERENCES `clients` (`key`),
  CONSTRAINT `scanner_logs_ibfk_4` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`),
  CONSTRAINT `scanner_logs_ibfk_5` FOREIGN KEY (`device_key`) REFERENCES `user_devices` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `scanner_logs`
--

LOCK TABLES `scanner_logs` WRITE;
/*!40000 ALTER TABLE `scanner_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `scanner_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `scanners`
--

DROP TABLE IF EXISTS `scanners`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `scanners` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `key` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `client_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_scanner_client_idx` (`client_id`),
  CONSTRAINT `fk_scanner_client` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `scanners`
--

LOCK TABLES `scanners` WRITE;
/*!40000 ALTER TABLE `scanners` DISABLE KEYS */;
INSERT INTO `scanners` VALUES (1,'Scanner 01','scanner-01',1);
/*!40000 ALTER TABLE `scanners` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_devices`
--

DROP TABLE IF EXISTS `user_devices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_devices` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_key` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `key` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `client_key` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `brand` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `model` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `os` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `version` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `apns_token` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `status` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `creation_date` datetime NOT NULL,
  `key_expiration_date` datetime NOT NULL,
  `activation_date` datetime DEFAULT NULL,
  `has_been_process` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `user_devices_ibfk_1` (`user_key`) /*!80000 INVISIBLE */,
  KEY `user_devices_key_ibfk_1` (`key`),
  CONSTRAINT `user_devices_ibfk_1` FOREIGN KEY (`user_key`) REFERENCES `users` (`key`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_devices`
--

LOCK TABLES `user_devices` WRITE;
/*!40000 ALTER TABLE `user_devices` DISABLE KEYS */;
INSERT INTO `user_devices` VALUES (5,'2D1tH2fzzNwz34uI3bfVgAH98LgdfBFACdbUNwWF4zs5WmTzJA','zhRzhx7ATpzdeqR7McyvgKfgC2prEy7RWlItRdNzVmh3uLSOM5','champlan','','','Windows','10.0',NULL,'DEVICE_ENABLED','2024-01-16 23:18:27','2025-01-10 23:18:27','2024-01-22 18:48:23',0),(6,'G7gvpRV33zACrgAwDf84U5BXAX3hG1bD82lz4FQEBuycCNr1gq','aaa','champlan','google','sdk_gphone64_x86_64','Android','14','fZepM8OySuurKi-IcvzL5Y:APA91bFrm91kgxMAt5QXsOugE-xJw-zKaYIsSmzIYWOQaI6QYrgLcDH4Gj3wxHsHZBsM7ePnX3YWgVf-KJIUkNwOlfPIXWQEU-bJrrH4dwrQnS6lzBZFbz872Wuin1Ac3R0tNXspxq96','DEVICE_ENABLED','2024-01-24 16:58:04','2034-02-07 16:58:04','2024-02-07 23:11:40',0);
/*!40000 ALTER TABLE `user_devices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `key` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `client_key` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `creation_date` datetime DEFAULT NULL,
  `activation_date` datetime DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `key` (`key`),
  KEY `client_key` (`client_key`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`client_key`) REFERENCES `clients` (`key`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (10,'2D1tH2fzzNwz34uI3bfVgAH98LgdfBFACdbUNwWF4zs5WmTzJA','champlan','2024-01-16 23:18:27','2024-01-22 18:48:23',1),(11,'G7gvpRV33zACrgAwDf84U5BXAX3hG1bD82lz4FQEBuycCNr1gq','champlan','2024-01-24 16:58:04','2024-02-07 23:11:40',1);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-02-22 22:20:32
