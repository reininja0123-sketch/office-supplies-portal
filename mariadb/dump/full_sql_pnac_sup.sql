/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.8.5-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: pnac_sup
-- ------------------------------------------------------
-- Server version	11.8.5-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

--
-- Table structure for table `app_reference`
--

DROP TABLE IF EXISTS `app_reference`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_reference` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `app_name` char(255) NOT NULL,
  `app_value` char(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `app_reference`
--

LOCK TABLES `app_reference` WRITE;
/*!40000 ALTER TABLE `app_reference` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `app_reference` VALUES
('21a22827-cdff-11f0-a43b-4c2338ce70c4','app_title','Office Supplies Portal','2025-11-30 15:13:34',NULL),
('392173af-cdff-11f0-a43b-4c2338ce70c4','sign_in_title','Procurement Store','2025-11-30 15:14:13',NULL),
('832a7452-cdff-11f0-a43b-4c2338ce70c4','store_header','Procurement Service','2025-11-30 15:16:17',NULL),
('832b6439-cdff-11f0-a43b-4c2338ce70c4','store_sub_header','Philippine Government Electronic Procurement System','2025-11-30 15:16:17',NULL),
('832b6439-cdff-11f0-a43b-4c2338ce70c4','store_banner_label','Common Use Items','2025-11-30 15:16:17',NULL),
('832b9283-cdff-11f0-a43b-4c2338ce70c4','store_banner_desc','Browse our comprehensive catalog of government procurement supplies. All items are pre-approved for common use and comply with PhilGEPS standards.','2025-11-30 15:16:17',NULL);
/*!40000 ALTER TABLE `app_reference` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `audit`
--

DROP TABLE IF EXISTS `audit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `trans_type` varchar(20) NOT NULL,
  `trans_table` varchar(20) NOT NULL,
  `trans_action` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `transaction_by` char(36) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit`
--

LOCK TABLES `audit` WRITE;
/*!40000 ALTER TABLE `audit` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `audit` VALUES
(1,'UPDATE','USER_ROLE','5a71d5ed-97b6-4c3c-8aea-b7ee9c192e95,admin,user','2025-12-01 08:13:45','00000000-0000-0000-0000-000000000001'),
(2,'UPDATE','USER_ROLE','5a71d5ed-97b6-4c3c-8aea-b7ee9c192e95,user,admin','2025-12-01 08:13:59','00000000-0000-0000-0000-000000000001'),
(3,'UPDATE','USER_ROLE','5a71d5ed-97b6-4c3c-8aea-b7ee9c192e95,admin,user','2025-12-01 08:14:12','00000000-0000-0000-0000-000000000001');
/*!40000 ALTER TABLE `audit` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `categories` VALUES
('11111111-1111-1111-1111-111111111111','Electronics','Electronic devices','2025-11-22 11:00:27'),
('22222222-2222-2222-2222-222222222222','Accessories','Accessories and peripherals','2025-11-22 11:00:27'),
('33333333-3333-3333-3333-333333333333','Computers','Desktop and laptop computers','2025-11-22 11:00:27'),
('44444444-4444-4444-4444-444444444444','Cameras','Digital cameras','2025-11-22 11:00:27'),
('55555555-5555-5555-5555-555555555555','Networking','Networking devices','2025-11-22 11:00:27'),
('becb4b5e-7ba6-4718-9300-d024818f9dbf','Cases','Iphone cases','2025-11-22 15:20:56'),
('db6a4fb1-03ab-4f86-ba15-3ff35d557424','Phone','test','2025-11-22 15:21:54');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Temporary table structure for view `get_admin_emails`
--

DROP TABLE IF EXISTS `get_admin_emails`;
/*!50001 DROP VIEW IF EXISTS `get_admin_emails`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `get_admin_emails` AS SELECT
 1 AS `email` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `low_stock_products`
--

DROP TABLE IF EXISTS `low_stock_products`;
/*!50001 DROP VIEW IF EXISTS `low_stock_products`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `low_stock_products` AS SELECT
 1 AS `product_id`,
  1 AS `product_name`,
  1 AS `current_stock`,
  1 AS `threshold` */;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `order_id` char(36) NOT NULL,
  `product_id` char(36) NOT NULL,
  `quantity` int(11) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `order_items` VALUES
('4c688c48-db62-4716-983e-b8d765efb324','d28ade6f-ad02-4406-b4e1-7c3ea1d89664','58ac22c2-5a25-4891-bf29-75195b3bd2cf',1,10000.00,'2025-11-30 15:00:16'),
('574e33ef-6f39-45d6-aeee-99339cd3a34d','62830c9e-40ec-4d1e-ae3c-22013219bbc5','32ec96b9-0311-4d2e-b34a-e363b00d2632',1,848.35,'2025-11-30 10:58:09'),
('9153167a-a318-4a82-85c4-f7cd016b6a67','9417e102-8ae7-4c06-a2ad-58737e83ade2','58ac22c2-5a25-4891-bf29-75195b3bd2cf',1,10000.00,'2025-11-30 15:01:08'),
('ce79a28a-60b3-4a68-94df-8b3e3e5f611d','62830c9e-40ec-4d1e-ae3c-22013219bbc5','470d31ad-a03a-4d33-9fc0-469dd781a969',1,11111.00,'2025-11-30 10:58:09'),
('cf98f1cf-7c75-4865-acfa-048c21397787','ceffd1cf-e9ca-46e9-80f3-2d7b3ebca6d6','58ac22c2-5a25-4891-bf29-75195b3bd2cf',1,10000.00,'2025-11-30 14:39:44'),
('d227a2d8-a347-4629-997e-6ad23036bc7f','62830c9e-40ec-4d1e-ae3c-22013219bbc5','58ac22c2-5a25-4891-bf29-75195b3bd2cf',1,10000.00,'2025-11-30 10:58:09'),
('dfc3d9d6-57c7-45df-b279-018c1eea0bff','62830c9e-40ec-4d1e-ae3c-22013219bbc5','8a252d43-8733-4667-9c4e-7aa4a14f278e',1,179.04,'2025-11-30 10:58:09'),
('e9072806-6ac2-4f88-804c-7826ead33090','20aa5ae7-f920-454b-953f-fff38428ae16','58ac22c2-5a25-4891-bf29-75195b3bd2cf',1,10000.00,'2025-11-30 14:58:46'),
('f7cff9f5-7687-4219-a0ae-c872252908d2','9870ee4f-1952-4799-9fbb-501880b61b8c','58ac22c2-5a25-4891-bf29-75195b3bd2cf',1,10000.00,'2025-11-30 14:58:16');
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `user_email` varchar(255) NOT NULL,
  `user_name` varchar(255) NOT NULL,
  `user_phone` varchar(50) DEFAULT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `user_id` char(36) DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `approved_by` char(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `approved_by` (`approved_by`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `orders` VALUES
('20aa5ae7-f920-454b-953f-fff38428ae16','bean@bean.com','Mr Bean','09271234567',10000.00,'completed','2025-11-30 14:58:46',NULL,'2025-11-30 14:58:58','798b75df-94c0-48cc-94e4-9e5f64befcf9'),
('62830c9e-40ec-4d1e-ae3c-22013219bbc5','tsest@rtwew.com','test','21312312',22138.39,'completed','2025-11-30 10:58:09',NULL,'2025-11-30 13:05:46','00000000-0000-0000-0000-000000000001'),
('9417e102-8ae7-4c06-a2ad-58737e83ade2','user@user.com','Mr Bean','09271234567',10000.00,'pending','2025-11-30 15:01:08',NULL,NULL,NULL),
('9870ee4f-1952-4799-9fbb-501880b61b8c','bean@bean.com','Mr Bean','09271234567',10000.00,'completed','2025-11-30 14:58:16',NULL,'2025-11-30 14:58:30','798b75df-94c0-48cc-94e4-9e5f64befcf9'),
('ceffd1cf-e9ca-46e9-80f3-2d7b3ebca6d6','bean@bean.com','Mr Bean','09271234567',10000.00,'completed','2025-11-30 14:39:44',NULL,'2025-11-30 14:39:53','798b75df-94c0-48cc-94e4-9e5f64befcf9'),
('d28ade6f-ad02-4406-b4e1-7c3ea1d89664','user@user.com','Ordinary users','09271234567',10000.00,'pending','2025-11-30 15:00:16',NULL,NULL,NULL);
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `product_variants`
--

DROP TABLE IF EXISTS `product_variants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_variants` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `product_id` char(36) NOT NULL,
  `variant_type` varchar(100) NOT NULL,
  `variant_value` varchar(100) NOT NULL,
  `price_adjustment` decimal(10,2) DEFAULT 0.00,
  `stock_quantity` int(11) NOT NULL DEFAULT 0,
  `sku` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_product_variants_product_id` (`product_id`),
  CONSTRAINT `product_variants_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_variants`
--

LOCK TABLES `product_variants` WRITE;
/*!40000 ALTER TABLE `product_variants` DISABLE KEYS */;
set autocommit=0;
/*!40000 ALTER TABLE `product_variants` ENABLE KEYS */;
UNLOCK TABLES;
commit;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_uca1400_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER update_product_variants_updated_at
BEFORE UPDATE ON product_variants
FOR EACH ROW
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP();
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `category_id` char(36) DEFAULT NULL,
  `stock_quantity` int(11) NOT NULL DEFAULT 0,
  `sku` varchar(255) NOT NULL,
  `image_url` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `low_stock_threshold` int(11) NOT NULL DEFAULT 10,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sku` (`sku`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `products` VALUES
('32ec96b9-0311-4d2e-b34a-e363b00d2632','Monitor 74','Eco-friendly',848.35,'33333333-3333-3333-3333-333333333333',185,'MON4679','','2025-11-22 14:15:24','2025-12-01 07:08:01',30),
('457ab0fa-299a-43f4-b87d-6751a8b523b2','Printer 27','Latest model',346.27,'33333333-3333-3333-3333-333333333333',201,'PRI8424','','2025-11-22 14:15:24','2025-12-01 07:08:01',30),
('470d31ad-a03a-4d33-9fc0-469dd781a969','412321','wqeqweqweqw',11111.00,NULL,120,'TWEWE',NULL,'2025-11-22 16:09:58','2025-11-30 13:04:28',30),
('4e2bd528-2fdf-4170-b8e5-beb29919a1b9','Laptop 9','Eco-friendly',508.87,'33333333-3333-3333-3333-333333333333',492,'LAP7069','','2025-11-22 14:15:24','2025-12-01 07:08:01',30),
('58ac22c2-5a25-4891-bf29-75195b3bd2cf','Nokia 3310','Indestructible and Holy phone of all ',10000.00,'db6a4fb1-03ab-4f86-ba15-3ff35d557424',983,'HAMMER','http://localhost:3000/uploads/1763907131133-232004057.png','2025-11-23 14:12:12','2025-11-30 15:01:08',30),
('8a252d43-8733-4667-9c4e-7aa4a14f278e','Keyboard 44','High quality product',179.04,'33333333-3333-3333-3333-333333333333',120,'KEY2576','','2025-11-22 14:15:24','2025-12-01 07:08:01',30),
('98d89578-f982-46d1-8701-cf5d9551dff1','Camera 35','Compact design',313.52,'33333333-3333-3333-3333-333333333333',54,'CAM6154','','2025-11-22 14:15:24','2025-12-01 07:08:01',30),
('c04d2c4f-c4f2-466c-a7f8-3846051bd974','Router 56','Compact design',309.30,'33333333-3333-3333-3333-333333333333',107,'ROU3789','','2025-11-22 14:15:24','2025-12-01 07:08:01',30),
('ca6243e3-034a-475a-b9fb-9ce101f0aa52','Printer 78','Compact design',242.55,'33333333-3333-3333-3333-333333333333',109,'PRI4363','','2025-11-22 14:15:24','2025-12-01 07:08:01',30),
('d4fe2b64-7cb7-400e-83b3-da9e93961022','Router 28','Limited edition',612.40,'33333333-3333-3333-3333-333333333333',293,'ROU7026','','2025-11-22 14:15:24','2025-12-01 07:08:01',30);
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;
commit;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_uca1400_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER update_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP();
end */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `profiles`
--

DROP TABLE IF EXISTS `profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `profiles` (
  `id` char(36) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `full_name` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  CONSTRAINT `profiles_ibfk_1` FOREIGN KEY (`id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `profiles`
--

LOCK TABLES `profiles` WRITE;
/*!40000 ALTER TABLE `profiles` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `profiles` VALUES
('00000000-0000-0000-0000-000000000001','supplyofficer@admin.com','System Admin','2025-11-30 12:14:03'),
('5a71d5ed-97b6-4c3c-8aea-b7ee9c192e95','user@user.com','Ordinary user','2025-11-30 14:59:45'),
('798b75df-94c0-48cc-94e4-9e5f64befcf9','dummy@admin.com','C John','2025-11-30 14:33:41');
/*!40000 ALTER TABLE `profiles` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `storage_buckets`
--

DROP TABLE IF EXISTS `storage_buckets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `storage_buckets` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `is_public` tinyint(1) NOT NULL DEFAULT 0,
  `file_size_limit` int(11) DEFAULT NULL,
  `allowed_mime_types` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `storage_buckets`
--

LOCK TABLES `storage_buckets` WRITE;
/*!40000 ALTER TABLE `storage_buckets` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `storage_buckets` VALUES
('product-images','product-images',1,5242880,'image/jpeg,image/jpg,image/png,image/webp');
/*!40000 ALTER TABLE `storage_buckets` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `storage_objects`
--

DROP TABLE IF EXISTS `storage_objects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `storage_objects` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `bucket_id` varchar(255) NOT NULL,
  `file_path` text NOT NULL,
  `mime_type` varchar(255) DEFAULT NULL,
  `size` int(11) DEFAULT NULL,
  `uploaded_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `bucket_id` (`bucket_id`),
  CONSTRAINT `storage_objects_ibfk_1` FOREIGN KEY (`bucket_id`) REFERENCES `storage_buckets` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `storage_objects`
--

LOCK TABLES `storage_objects` WRITE;
/*!40000 ALTER TABLE `storage_objects` DISABLE KEYS */;
set autocommit=0;
/*!40000 ALTER TABLE `storage_objects` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `user_roles`
--

DROP TABLE IF EXISTS `user_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_roles` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `user_id` char(36) NOT NULL,
  `role` enum('admin','user','superadmin') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`,`role`),
  CONSTRAINT `user_roles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_roles`
--

LOCK TABLES `user_roles` WRITE;
/*!40000 ALTER TABLE `user_roles` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `user_roles` VALUES
('0271fd84-cdfa-11f0-a43b-4c2338ce70c4','798b75df-94c0-48cc-94e4-9e5f64befcf9','admin','2025-11-30 15:09:05','2025-12-01 07:03:23'),
('33a666d8-cdfd-11f0-a43b-4c2338ce70c4','5a71d5ed-97b6-4c3c-8aea-b7ee9c192e95','user','2025-11-30 15:09:05','2025-12-01 08:14:12'),
('b2c459a3-cde6-11f0-a43b-4c2338ce70c4','00000000-0000-0000-0000-000000000001','superadmin','2025-11-30 15:09:05','2025-11-30 15:09:05');
/*!40000 ALTER TABLE `user_roles` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `email` varchar(255) DEFAULT NULL,
  `full_name` varchar(255) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `users` VALUES
('00000000-0000-0000-0000-000000000001','supplyofficer@admin.com','System Admin','$2a$12$B9it9UdCMuxnJ90MC/.pb.TNxvj/LLsquTYBq9Ek9IJDIsWvMMXg6','2025-11-30 12:14:03'),
('5a71d5ed-97b6-4c3c-8aea-b7ee9c192e95','user@user.com','Ordinary user','$2b$12$zSFwd9EwoR/bdKltEu7XO.IWKyBRGWJN0mKPF7X6eEcrfPYn6OoZS','2025-11-30 14:59:45'),
('798b75df-94c0-48cc-94e4-9e5f64befcf9','dummy@admin.com','C John','$2a$12$ngdvJXwgFHpt/2BxUNctH.pOcqeQjbsVzVWjUIy/p8BcJOszpvnPq','2025-11-30 14:33:41');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
commit;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_uca1400_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER create_profile_after_user
AFTER INSERT ON users
FOR EACH ROW
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.full_name);
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Dumping events for database 'pnac_sup'
--

--
-- Dumping routines for database 'pnac_sup'
--

--
-- Final view structure for view `get_admin_emails`
--

/*!50001 DROP VIEW IF EXISTS `get_admin_emails`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_uca1400_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `get_admin_emails` AS select `p`.`email` AS `email` from (`profiles` `p` join `user_roles` `ur` on(`p`.`id` = `ur`.`user_id`)) where `ur`.`role` = 'admin' and `p`.`email` is not null */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `low_stock_products`
--

/*!50001 DROP VIEW IF EXISTS `low_stock_products`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_uca1400_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `low_stock_products` AS select `products`.`id` AS `product_id`,`products`.`name` AS `product_name`,`products`.`stock_quantity` AS `current_stock`,`products`.`low_stock_threshold` AS `threshold` from `products` where `products`.`stock_quantity` <= `products`.`low_stock_threshold` and `products`.`stock_quantity` > 0 */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2025-12-01 19:51:00
