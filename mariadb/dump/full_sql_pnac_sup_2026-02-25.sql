/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.8.6-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: pnac_sup
-- ------------------------------------------------------
-- Server version	11.8.6-MariaDB

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

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `app_reference` WRITE;
/*!40000 ALTER TABLE `app_reference` DISABLE KEYS */;
INSERT INTO `app_reference` VALUES
('21a22827-cdff-11f0-a43b-4c2338ce70c4','app_title','Office Supplies Portal','2025-11-30 15:13:34',NULL),
('392173af-cdff-11f0-a43b-4c2338ce70c4','sign_in_title','Procurement Store','2025-11-30 15:14:13',NULL),
('832a7452-cdff-11f0-a43b-4c2338ce70c4','store_header','Procurement Service','2025-11-30 15:16:17',NULL),
('832b6439-cdff-11f0-a43b-4c2338ce70c4','store_sub_header','Philippine Government Electronic Procurement System','2025-11-30 15:16:17',NULL),
('832b6439-cdff-11f0-a43b-4c2338ce70c4','store_banner_label','Common Use Items','2025-11-30 15:16:17',NULL),
('832b9283-cdff-11f0-a43b-4c2338ce70c4','store_banner_desc','Browse our comprehensive catalog of government procurement supplies. All items are pre-approved for common use and comply with PhilGEPS standards.','2025-11-30 15:16:17',NULL),
('4dc162e7-eb11-11f0-a334-4c2338ce70c4','reject_reason_option','Out of stock','2026-01-06 15:06:37',NULL),
('4dc79b7b-eb11-11f0-a334-4c2338ce70c4','reject_reason_option','Limited stocks','2026-01-06 15:06:37',NULL),
('4dc81cd7-eb11-11f0-a334-4c2338ce70c4','reject_reason_option','Please revise your order request','2026-01-06 15:06:37',NULL),
('4dc8c893-eb11-11f0-a334-4c2338ce70c4','reject_reason_option','Please add a purpose of your order request','2026-01-06 15:06:37',NULL),
('4dc910bc-eb11-11f0-a334-4c2338ce70c4','reject_reason_option','Others','2026-01-06 15:06:37',NULL);
/*!40000 ALTER TABLE `app_reference` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

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

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `audit` WRITE;
/*!40000 ALTER TABLE `audit` DISABLE KEYS */;
INSERT INTO `audit` VALUES
(1,'UPDATE','USER_ROLE','5a71d5ed-97b6-4c3c-8aea-b7ee9c192e95,admin,user','2025-12-01 08:13:45','00000000-0000-0000-0000-000000000001'),
(2,'UPDATE','USER_ROLE','5a71d5ed-97b6-4c3c-8aea-b7ee9c192e95,user,admin','2025-12-01 08:13:59','00000000-0000-0000-0000-000000000001'),
(3,'UPDATE','USER_ROLE','5a71d5ed-97b6-4c3c-8aea-b7ee9c192e95,admin,user','2025-12-01 08:14:12','00000000-0000-0000-0000-000000000001');
/*!40000 ALTER TABLE `audit` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

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

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
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
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

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
  `approval_status` varchar(100) DEFAULT NULL,
  `approved_quantity` int(11) DEFAULT NULL,
  `approver_remarks` text DEFAULT NULL,
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

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES
('03e539b6-ba6c-47fb-ab05-15f1957d410a','5c33e0c1-96ba-4d0c-b6db-ef1337b5f3dd','470d31ad-a03a-4d33-9fc0-469dd781a969',1,111.00,'2026-01-03 04:45:13','rejected',0,NULL),
('099d555f-566d-438d-a5b0-018ddc5f9110','2340cba9-67ac-4868-990f-80e826dd0813','4e2bd528-2fdf-4170-b8e5-beb29919a1b9',2,58.87,'2026-01-03 12:06:59','partial',1,NULL),
('0d254b15-795f-47d6-8756-8cf79f4f3c18','0b07770d-20fd-4254-9334-3412b2a84a1a','7c9f30fd-8ad2-4356-abe4-ed491e363f56',1,18.00,'2026-01-06 14:59:54','processing',1,NULL),
('16475ae3-a254-4e8f-bbe6-53e0ffa3f83c','21c15c03-b22f-46a5-9b83-889c116fe37d','ab88d1d9-d6eb-40af-ac68-d11b251975b4',3,120.00,'2026-01-03 05:44:14','rejected',0,NULL),
('1c2e264f-8e38-43c7-9cf8-7a59111f6e10','0193b6f7-fd2a-4093-99ee-bab0e04ef92a','8a252d43-8733-4667-9c4e-7aa4a14f278e',1,19.04,'2026-01-06 15:15:38',NULL,NULL,NULL),
('225c3333-6de6-4ce6-bb46-4ecd39f127c0','b7c3e243-f825-4f46-b8ea-9c03d8b24b1e','ab88d1d9-d6eb-40af-ac68-d11b251975b4',3,120.00,'2026-01-03 12:05:03','partial',2,NULL),
('273a25cf-762c-498f-a188-5b43837bf371','2340cba9-67ac-4868-990f-80e826dd0813','457ab0fa-299a-43f4-b87d-6751a8b523b2',2,46.20,'2026-01-03 12:06:59','processing',2,NULL),
('2b38cf2a-4abc-498d-a3ea-7fb95790889e','d3634615-0cb3-413b-8a9e-d880348983cf','58ac22c2-5a25-4891-bf29-75195b3bd2cf',1,425.22,'2026-01-06 14:17:44','rejected',0,NULL),
('2b8ff10d-626f-431b-a91b-0a1fc2d1ecc0','47b3d058-96db-4564-ad4f-a231f8a4d88c','98d89578-f982-46d1-8701-cf5d9551dff1',2,13.52,'2026-01-03 12:12:58','partial',1,NULL),
('34b110dd-d231-4b40-ac1c-b6d5eed7c01c','356dbf7d-6106-405c-b76e-fd1e703a6313','ab88d1d9-d6eb-40af-ac68-d11b251975b4',1,120.00,'2026-01-06 15:08:53',NULL,NULL,NULL),
('3885ebec-fcbf-4a39-a9bf-e6e4389beb3b','2340cba9-67ac-4868-990f-80e826dd0813','58ac22c2-5a25-4891-bf29-75195b3bd2cf',2,425.22,'2026-01-03 12:06:59','rejected',0,NULL),
('3d58cc3d-90c6-4d8c-a215-fe521f9e29a6','7b99a1bb-ad9a-4955-b085-e28383f10771','ca6243e3-034a-475a-b9fb-9ce101f0aa52',4,242.55,'2026-01-03 12:18:21','processing',4,NULL),
('43b35012-9b61-4db9-aaa4-3051ec7b5fda','49fcdd4e-e934-4f6b-a3db-2dde9b55fd16','470d31ad-a03a-4d33-9fc0-469dd781a969',1,111.00,'2026-01-06 14:03:35','rejected',0,NULL),
('44243f78-06d5-4611-9e4e-f2848155977f','47b3d058-96db-4564-ad4f-a231f8a4d88c','c04d2c4f-c4f2-466c-a7f8-3846051bd974',4,39.30,'2026-01-03 12:12:58','partial',1,NULL),
('484dd4e9-e572-4093-88e1-b76df583edd3','12802044-0e42-4338-a0f1-6108598fe8df','1a4944c3-cf22-4c70-b4bb-06313c6c2fae',1,35.50,'2026-01-06 14:21:29','rejected',0,NULL),
('4c688c48-db62-4716-983e-b8d765efb324','d28ade6f-ad02-4406-b4e1-7c3ea1d89664','58ac22c2-5a25-4891-bf29-75195b3bd2cf',1,10000.00,'2025-11-30 15:00:16','approved',1,NULL),
('574e33ef-6f39-45d6-aeee-99339cd3a34d','62830c9e-40ec-4d1e-ae3c-22013219bbc5','32ec96b9-0311-4d2e-b34a-e363b00d2632',1,848.35,'2025-11-30 10:58:09',NULL,NULL,NULL),
('71ebdbf6-ca75-40fe-8995-7206c5c24659','5c33e0c1-96ba-4d0c-b6db-ef1337b5f3dd','c04d2c4f-c4f2-466c-a7f8-3846051bd974',2,39.30,'2026-01-03 04:45:13','rejected',0,NULL),
('7414e6bc-41b3-47cd-8651-6cdbe9ebae9c','0193b6f7-fd2a-4093-99ee-bab0e04ef92a','457ab0fa-299a-43f4-b87d-6751a8b523b2',1,46.20,'2026-01-06 15:15:38',NULL,NULL,NULL),
('7465c5c9-1552-4808-ba3c-3290bd2cd068','7372b477-55a4-4516-92a6-e58565a038f0','457ab0fa-299a-43f4-b87d-6751a8b523b2',3,46.20,'2026-01-03 11:28:48','rejected',0,NULL),
('9153167a-a318-4a82-85c4-f7cd016b6a67','9417e102-8ae7-4c06-a2ad-58737e83ade2','58ac22c2-5a25-4891-bf29-75195b3bd2cf',1,10000.00,'2025-11-30 15:01:08',NULL,NULL,NULL),
('916510ba-b200-4881-8ac3-2c0cbda4c891','0193b6f7-fd2a-4093-99ee-bab0e04ef92a','32ec96b9-0311-4d2e-b34a-e363b00d2632',1,84.35,'2026-01-06 15:15:38',NULL,NULL,NULL),
('9317065c-a95d-4165-ab8b-ccaa1e9e826f','5c33e0c1-96ba-4d0c-b6db-ef1337b5f3dd','8a252d43-8733-4667-9c4e-7aa4a14f278e',2,19.04,'2026-01-03 04:45:13','rejected',0,NULL),
('99ee66ef-8a26-401a-b723-c74ac8646adf','0193b6f7-fd2a-4093-99ee-bab0e04ef92a','4e2bd528-2fdf-4170-b8e5-beb29919a1b9',1,58.87,'2026-01-06 15:15:38',NULL,NULL,NULL),
('9c84ec6f-eb1d-4001-b909-c7d90c3a98e0','e60cb885-8041-42dc-b71f-dabe4adb3755','ab88d1d9-d6eb-40af-ac68-d11b251975b4',3,120.00,'2026-01-03 05:46:07','partial',2,NULL),
('a1bf5c39-fa16-444d-aede-ceba8adae11f','7372b477-55a4-4516-92a6-e58565a038f0','ab88d1d9-d6eb-40af-ac68-d11b251975b4',2,120.00,'2026-01-03 11:28:48','rejected',0,NULL),
('a4beaf6d-3650-42ef-b113-dc5a8fe4b5d6','25d9465f-a1ac-4182-910d-dd6663553d9a','7c9f30fd-8ad2-4356-abe4-ed491e363f56',1,18.00,'2026-01-06 14:23:21','rejected',0,NULL),
('af65cc50-fa4c-4131-9ef8-2de346569390','a0bb5834-489d-4552-91ee-094a533b3b6e','1a4944c3-cf22-4c70-b4bb-06313c6c2fae',7,35.50,'2026-01-03 13:40:28','processing',7,NULL),
('b030e431-665b-4531-a940-868e8fc2e99c','cd613ab5-f9e4-4732-9129-e64e53b9b206','457ab0fa-299a-43f4-b87d-6751a8b523b2',17,46.20,'2026-01-03 12:21:17','partial',16,NULL),
('c1e41eb4-0028-4dee-92c2-ba0035585be3','0193b6f7-fd2a-4093-99ee-bab0e04ef92a','98d89578-f982-46d1-8701-cf5d9551dff1',1,13.52,'2026-01-06 15:15:38',NULL,NULL,NULL),
('c37e0271-23cd-477b-99b7-842e594ea2de','e60ee5ec-5f1b-405d-81e8-7be81bc35f48','ab88d1d9-d6eb-40af-ac68-d11b251975b4',3,120.00,'2026-01-06 13:55:28','rejected',0,NULL),
('c398b3ed-2704-408a-b59f-3b33b1d56c27','a0bb5834-489d-4552-91ee-094a533b3b6e','7c9f30fd-8ad2-4356-abe4-ed491e363f56',3,18.00,'2026-01-03 13:40:28','processing',3,NULL),
('c98a8a84-eaf6-4cd2-8931-4af382ca00d5','0193b6f7-fd2a-4093-99ee-bab0e04ef92a','c04d2c4f-c4f2-466c-a7f8-3846051bd974',1,39.30,'2026-01-06 15:15:38',NULL,NULL,NULL),
('cb00e26d-4e0b-4ab7-b669-3bfe7f1e0947','21c15c03-b22f-46a5-9b83-889c116fe37d','470d31ad-a03a-4d33-9fc0-469dd781a969',1,111.00,'2026-01-03 05:44:14','rejected',0,NULL),
('cb388cad-068c-439d-9ad9-3cd9575a89c5','18196099-d51d-40b5-b76e-0c6c273dc1e5','470d31ad-a03a-4d33-9fc0-469dd781a969',4,111.00,'2026-01-02 15:12:22','partial',3,NULL),
('ce3dda28-199d-48e5-8f7a-836765c127c1','18196099-d51d-40b5-b76e-0c6c273dc1e5','58ac22c2-5a25-4891-bf29-75195b3bd2cf',2,425.22,'2026-01-02 15:12:22','partial',1,NULL),
('ce79a28a-60b3-4a68-94df-8b3e3e5f611d','62830c9e-40ec-4d1e-ae3c-22013219bbc5','470d31ad-a03a-4d33-9fc0-469dd781a969',1,11111.00,'2025-11-30 10:58:09',NULL,NULL,NULL),
('cf98f1cf-7c75-4865-acfa-048c21397787','ceffd1cf-e9ca-46e9-80f3-2d7b3ebca6d6','58ac22c2-5a25-4891-bf29-75195b3bd2cf',1,10000.00,'2025-11-30 14:39:44',NULL,NULL,NULL),
('d227a2d8-a347-4629-997e-6ad23036bc7f','62830c9e-40ec-4d1e-ae3c-22013219bbc5','58ac22c2-5a25-4891-bf29-75195b3bd2cf',1,10000.00,'2025-11-30 10:58:09',NULL,NULL,NULL),
('d52022c4-a21f-418f-b8d8-04455c88202b','18196099-d51d-40b5-b76e-0c6c273dc1e5','32ec96b9-0311-4d2e-b34a-e363b00d2632',3,84.35,'2026-01-02 15:12:22','partial',1,NULL),
('da342e74-9a29-46c6-af24-88703805c94d','e60cb885-8041-42dc-b71f-dabe4adb3755','470d31ad-a03a-4d33-9fc0-469dd781a969',2,111.00,'2026-01-03 05:46:07','processing',2,NULL),
('df548645-2302-4630-b33d-94e6f0db5f7b','92276993-5bc0-4615-98ae-71871c97bc5e','1a4944c3-cf22-4c70-b4bb-06313c6c2fae',1,35.50,'2026-01-06 14:19:07','rejected',0,NULL),
('dfc3d9d6-57c7-45df-b279-018c1eea0bff','62830c9e-40ec-4d1e-ae3c-22013219bbc5','8a252d43-8733-4667-9c4e-7aa4a14f278e',1,179.04,'2025-11-30 10:58:09',NULL,NULL,NULL),
('dff3d61a-11f1-48d5-bf74-731c5952c9ad','0193b6f7-fd2a-4093-99ee-bab0e04ef92a','470d31ad-a03a-4d33-9fc0-469dd781a969',1,111.00,'2026-01-06 15:15:38',NULL,NULL,NULL),
('e9072806-6ac2-4f88-804c-7826ead33090','20aa5ae7-f920-454b-953f-fff38428ae16','58ac22c2-5a25-4891-bf29-75195b3bd2cf',1,10000.00,'2025-11-30 14:58:46',NULL,NULL,NULL),
('ebcee9cb-9120-41b5-93e3-322203fcd431','7372b477-55a4-4516-92a6-e58565a038f0','32ec96b9-0311-4d2e-b34a-e363b00d2632',2,84.35,'2026-01-03 11:28:48','rejected',0,NULL),
('ede0a97e-4ae8-4e4e-9837-4fe27736d7da','ab9d5d1e-3ad6-4fef-a3a3-18f5da57ed57','1a4944c3-cf22-4c70-b4bb-06313c6c2fae',6,35.50,'2026-01-06 13:56:04','rejected',0,NULL),
('f071f947-4973-4eaf-8b49-beadc593fb32','0193b6f7-fd2a-4093-99ee-bab0e04ef92a','58ac22c2-5a25-4891-bf29-75195b3bd2cf',1,425.22,'2026-01-06 15:15:38',NULL,NULL,NULL),
('f59a636a-8dff-4791-9030-ce4b55a499df','12802044-0e42-4338-a0f1-6108598fe8df','ab88d1d9-d6eb-40af-ac68-d11b251975b4',1,120.00,'2026-01-06 14:21:29','rejected',0,NULL),
('f7cff9f5-7687-4219-a0ae-c872252908d2','9870ee4f-1952-4799-9fbb-501880b61b8c','58ac22c2-5a25-4891-bf29-75195b3bd2cf',1,10000.00,'2025-11-30 14:58:16',NULL,NULL,NULL),
('fb8f23ea-7876-4961-8244-709fe0190ad8','cd613ab5-f9e4-4732-9129-e64e53b9b206','4e2bd528-2fdf-4170-b8e5-beb29919a1b9',11,58.87,'2026-01-03 12:21:17','processing',11,NULL);
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

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
  `req_total_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `ris_seq` int(11) NOT NULL,
  `requester_reasons` text NOT NULL,
  `approver_reasons` text DEFAULT NULL,
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

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES
('0193b6f7-fd2a-4093-99ee-bab0e04ef92a','user@user.com','Ordinary user','09271234567',797.50,'pending','2026-01-06 15:15:38','5a71d5ed-97b6-4c3c-8aea-b7ee9c192e95',NULL,NULL,797.50,5,'Building Gaming Rig',NULL),
('0b07770d-20fd-4254-9334-3412b2a84a1a','user@user.com','Ordinary user','09271234567',18.00,'completed','2026-01-06 14:59:54','5a71d5ed-97b6-4c3c-8aea-b7ee9c192e95','2026-01-06 15:28:56','798b75df-94c0-48cc-94e4-9e5f64befcf9',18.00,3,'Pambalot ng kanin',NULL),
('12802044-0e42-4338-a0f1-6108598fe8df','user@user.com','Ordinary user','09271234567',0.00,'rejected','2026-01-06 14:21:29','5a71d5ed-97b6-4c3c-8aea-b7ee9c192e95','2026-01-06 14:24:17','798b75df-94c0-48cc-94e4-9e5f64befcf9',155.50,3,'',NULL),
('18196099-d51d-40b5-b76e-0c6c273dc1e5','2raas@notebook.com','sfasd','dfasf',842.57,'completed','2026-01-02 15:12:22',NULL,'2026-01-03 04:29:03','798b75df-94c0-48cc-94e4-9e5f64befcf9',1547.49,0,'',NULL),
('20aa5ae7-f920-454b-953f-fff38428ae16','bean@bean.com','Mr Bean','09271234567',10000.00,'completed','2025-11-30 14:58:46',NULL,'2025-11-30 14:58:58','798b75df-94c0-48cc-94e4-9e5f64befcf9',10000.00,0,'',NULL),
('21c15c03-b22f-46a5-9b83-889c116fe37d','tesla@shitcar.com','Tesla','09271234567',0.00,'rejected','2026-01-03 05:44:14',NULL,'2026-01-03 06:20:01','798b75df-94c0-48cc-94e4-9e5f64befcf9',471.00,0,'',NULL),
('2340cba9-67ac-4868-990f-80e826dd0813','bugs@bunny.com','bugs','09271234567',151.27,'completed','2026-01-03 12:06:59',NULL,'2026-01-03 12:07:25','798b75df-94c0-48cc-94e4-9e5f64befcf9',1060.58,0,'',NULL),
('25d9465f-a1ac-4182-910d-dd6663553d9a','user@user.com','Ordinary user','09271234567',0.00,'rejected','2026-01-06 14:23:21','5a71d5ed-97b6-4c3c-8aea-b7ee9c192e95','2026-01-06 14:24:19','798b75df-94c0-48cc-94e4-9e5f64befcf9',18.00,1,'',NULL),
('356dbf7d-6106-405c-b76e-fd1e703a6313','user@user.com','Ordinary user','09271234567',120.00,'pending','2026-01-06 15:08:53','5a71d5ed-97b6-4c3c-8aea-b7ee9c192e95',NULL,NULL,120.00,4,'This Office Supplies will be used by PNAC Personnel.\n',NULL),
('47b3d058-96db-4564-ad4f-a231f8a4d88c','bugs@bunny.com','bugs','09271234567',52.82,'completed','2026-01-03 12:12:58',NULL,'2026-01-03 12:13:26','798b75df-94c0-48cc-94e4-9e5f64befcf9',184.24,0,'',NULL),
('49fcdd4e-e934-4f6b-a3db-2dde9b55fd16','user@user.com','Ordinary user',NULL,0.00,'rejected','2026-01-06 14:03:35','5a71d5ed-97b6-4c3c-8aea-b7ee9c192e95','2026-01-06 14:24:12','798b75df-94c0-48cc-94e4-9e5f64befcf9',111.00,0,'',NULL),
('5c33e0c1-96ba-4d0c-b6db-ef1337b5f3dd','layla@notebook.com','Layla','09271234567',0.00,'rejected','2026-01-03 04:45:13',NULL,'2026-01-03 05:44:38','798b75df-94c0-48cc-94e4-9e5f64befcf9',227.68,0,'',NULL),
('62830c9e-40ec-4d1e-ae3c-22013219bbc5','tsest@rtwew.com','test','21312312',22138.39,'completed','2025-11-30 10:58:09',NULL,'2025-11-30 13:05:46','00000000-0000-0000-0000-000000000001',22138.39,0,'',NULL),
('7372b477-55a4-4516-92a6-e58565a038f0','toyota@numba.com','Clint','09271234567',0.00,'rejected','2026-01-03 11:28:48',NULL,'2026-01-03 11:29:49','798b75df-94c0-48cc-94e4-9e5f64befcf9',547.30,0,'',NULL),
('7b99a1bb-ad9a-4955-b085-e28383f10771','bugs@bunny.com','bugs','09271234567',970.20,'completed','2026-01-03 12:18:21',NULL,'2026-01-03 12:19:39','798b75df-94c0-48cc-94e4-9e5f64befcf9',970.20,0,'',NULL),
('92276993-5bc0-4615-98ae-71871c97bc5e','user@user.com','Ordinary user','09271234567',0.00,'rejected','2026-01-06 14:19:07','5a71d5ed-97b6-4c3c-8aea-b7ee9c192e95','2026-01-06 14:24:15','798b75df-94c0-48cc-94e4-9e5f64befcf9',35.50,2,'',NULL),
('9417e102-8ae7-4c06-a2ad-58737e83ade2','user@user.com','Mr Bean','09271234567',10000.00,'completed','2025-11-30 15:01:08',NULL,'2026-01-02 14:35:11','798b75df-94c0-48cc-94e4-9e5f64befcf9',10000.00,0,'',NULL),
('9870ee4f-1952-4799-9fbb-501880b61b8c','bean@bean.com','Mr Bean','09271234567',10000.00,'completed','2025-11-30 14:58:16',NULL,'2025-11-30 14:58:30','798b75df-94c0-48cc-94e4-9e5f64befcf9',10000.00,0,'',NULL),
('a0bb5834-489d-4552-91ee-094a533b3b6e','user@user.com','Ordinary user',NULL,302.50,'completed','2026-01-03 13:40:28',NULL,'2026-01-06 13:19:04','798b75df-94c0-48cc-94e4-9e5f64befcf9',302.50,0,'',NULL),
('ab9d5d1e-3ad6-4fef-a3a3-18f5da57ed57','user@user.com','Ordinary user','09271234567',0.00,'rejected','2026-01-06 13:56:04','5a71d5ed-97b6-4c3c-8aea-b7ee9c192e95','2026-01-06 14:24:10','798b75df-94c0-48cc-94e4-9e5f64befcf9',213.00,0,'',NULL),
('b7c3e243-f825-4f46-b8ea-9c03d8b24b1e','taskman@shit.com','Taskman','09271234567',240.00,'completed','2026-01-03 12:05:03',NULL,'2026-01-03 12:05:44','798b75df-94c0-48cc-94e4-9e5f64befcf9',360.00,0,'',NULL),
('cd613ab5-f9e4-4732-9129-e64e53b9b206','bugs@bunny.com','bugs','09271234567',1386.77,'completed','2026-01-03 12:21:17',NULL,'2026-01-03 12:29:59','798b75df-94c0-48cc-94e4-9e5f64befcf9',1432.97,0,'',NULL),
('ceffd1cf-e9ca-46e9-80f3-2d7b3ebca6d6','bean@bean.com','Mr Bean','09271234567',10000.00,'completed','2025-11-30 14:39:44',NULL,'2025-11-30 14:39:53','798b75df-94c0-48cc-94e4-9e5f64befcf9',10000.00,0,'',NULL),
('d28ade6f-ad02-4406-b4e1-7c3ea1d89664','user@user.com','Ordinary users','09271234567',10000.00,'completed','2025-11-30 15:00:16',NULL,'2026-01-02 16:06:32','798b75df-94c0-48cc-94e4-9e5f64befcf9',10000.00,0,'',NULL),
('d3634615-0cb3-413b-8a9e-d880348983cf','user@user.com','Ordinary user',NULL,0.00,'rejected','2026-01-06 14:17:44','5a71d5ed-97b6-4c3c-8aea-b7ee9c192e95','2026-01-06 14:24:14','798b75df-94c0-48cc-94e4-9e5f64befcf9',425.22,1,'',NULL),
('e60cb885-8041-42dc-b71f-dabe4adb3755','tesla@shitcar.com','Tesla','09271234567',462.00,'completed','2026-01-03 05:46:07',NULL,'2026-01-03 11:58:56','798b75df-94c0-48cc-94e4-9e5f64befcf9',0.00,0,'',NULL),
('e60ee5ec-5f1b-405d-81e8-7be81bc35f48','user@user.com','Ordinary user','09271234567',0.00,'rejected','2026-01-06 13:55:28','5a71d5ed-97b6-4c3c-8aea-b7ee9c192e95','2026-01-06 14:24:08','798b75df-94c0-48cc-94e4-9e5f64befcf9',360.00,0,'',NULL);
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_uca1400_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER before_order_insert
BEFORE INSERT ON orders
FOR EACH ROW
begin
	DECLARE v_current_count INT;
    DECLARE v_report_id CHAR(36);

    
    
    SELECT ris_count, id INTO v_current_count, v_report_id
    FROM report_ris
    WHERE ris_active = 1
    LIMIT 1
    FOR UPDATE;

    
    IF v_report_id IS NOT NULL then
    	SET v_current_count = v_current_count + 1;
    	SET NEW.ris_seq = v_current_count;
        UPDATE report_ris
        SET ris_count = v_current_count
        WHERE id = v_report_id;
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

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

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `product_variants` WRITE;
/*!40000 ALTER TABLE `product_variants` DISABLE KEYS */;
/*!40000 ALTER TABLE `product_variants` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;
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
  `product_unit` varchar(100) NOT NULL DEFAULT 'PIECE',
  PRIMARY KEY (`id`),
  UNIQUE KEY `sku` (`sku`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES
('1a4944c3-cf22-4c70-b4bb-06313c6c2fae','CARTOLINA, ASSORTED COLORS','20 PCS. PER PACK',35.50,NULL,93,'03-02-0081',NULL,'2026-01-03 13:14:09','2026-01-06 14:24:17',23,'PACK'),
('32ec96b9-0311-4d2e-b34a-e363b00d2632','Monitor 74','Eco-friendly',84.35,'33333333-3333-3333-3333-333333333333',183,'MON4679',NULL,'2025-11-22 14:15:24','2026-01-06 15:15:38',30,'PIECE'),
('457ab0fa-299a-43f4-b87d-6751a8b523b2','Printer 27','Latest model',46.20,'33333333-3333-3333-3333-333333333333',182,'PRI8424',NULL,'2025-11-22 14:15:24','2026-01-06 15:15:38',30,'PIECE'),
('470d31ad-a03a-4d33-9fc0-469dd781a969','412321','wqeqweqweqw',111.00,NULL,114,'TWEWE',NULL,'2025-11-22 16:09:58','2026-01-06 15:15:38',30,'PIECE'),
('4e2bd528-2fdf-4170-b8e5-beb29919a1b9','Laptop 9','Eco-friendly',58.87,'33333333-3333-3333-3333-333333333333',479,'LAP7069',NULL,'2025-11-22 14:15:24','2026-01-06 15:15:38',30,'PIECE'),
('58ac22c2-5a25-4891-bf29-75195b3bd2cf','Nokia 3310','Indestructible and Holy phone of all ',425.22,'db6a4fb1-03ab-4f86-ba15-3ff35d557424',981,'HAMMER','http://localhost:3000/uploads/1763907131133-232004057.png','2025-11-23 14:12:12','2026-01-06 15:15:38',30,'PIECE'),
('7c9f30fd-8ad2-4356-abe4-ed491e363f56','TAPE TRANSPARENT','24MM',18.00,'22222222-2222-2222-2222-222222222222',26,'03-03-0073',NULL,'2026-01-03 13:09:37','2026-01-06 14:59:54',5,'ROLL'),
('8a252d43-8733-4667-9c4e-7aa4a14f278e','Keyboard 44','High quality product',19.04,'33333333-3333-3333-3333-333333333333',119,'KEY2576',NULL,'2025-11-22 14:15:24','2026-01-06 15:15:38',30,'PIECE'),
('98d89578-f982-46d1-8701-cf5d9551dff1','Camera 35','Compact design',13.52,'33333333-3333-3333-3333-333333333333',52,'CAM6154',NULL,'2025-11-22 14:15:24','2026-01-06 15:15:38',30,'PIECE'),
('ab88d1d9-d6eb-40af-ac68-d11b251975b4','03-03-0003','CLEARBOOK, 20 TRANSPARENT',120.00,'22222222-2222-2222-2222-222222222222',45,'03-03-0003',NULL,'2026-01-03 05:43:20','2026-01-06 15:08:53',10,'PIECE'),
('c04d2c4f-c4f2-466c-a7f8-3846051bd974','Router 56','Compact design',39.30,'33333333-3333-3333-3333-333333333333',105,'ROU3789',NULL,'2025-11-22 14:15:24','2026-01-06 15:15:38',30,'PIECE'),
('ca6243e3-034a-475a-b9fb-9ce101f0aa52','Printer 78','Compact design',242.55,'33333333-3333-3333-3333-333333333333',105,'PRI4363','','2025-11-22 14:15:24','2026-01-03 12:18:21',30,'PIECE'),
('d4fe2b64-7cb7-400e-83b3-da9e93961022','Router 28','Limited edition',612.40,'33333333-3333-3333-3333-333333333333',293,'ROU7026','','2025-11-22 14:15:24','2026-01-03 04:34:48',30,'PIECE');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;
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

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `profiles` WRITE;
/*!40000 ALTER TABLE `profiles` DISABLE KEYS */;
INSERT INTO `profiles` VALUES
('00000000-0000-0000-0000-000000000001','supplyofficer@admin.com','System Admin','2025-11-30 12:14:03'),
('5a71d5ed-97b6-4c3c-8aea-b7ee9c192e95','user@user.com','Ordinary user','2025-11-30 14:59:45'),
('798b75df-94c0-48cc-94e4-9e5f64befcf9','dummy@admin.com','C John','2025-11-30 14:33:41');
/*!40000 ALTER TABLE `profiles` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `report_ris`
--

DROP TABLE IF EXISTS `report_ris`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `report_ris` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `ris_yr` varchar(100) NOT NULL DEFAULT '2026',
  `ris_count` int(11) NOT NULL DEFAULT 1,
  `ris_active` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `report_ris`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `report_ris` WRITE;
/*!40000 ALTER TABLE `report_ris` DISABLE KEYS */;
INSERT INTO `report_ris` VALUES
('00f29cbd-e8ac-11f0-a333-4c2338ce70c4','2026',5,1),
('350f860b-eb0b-11f0-a334-4c2338ce70c4','2027',0,0);
/*!40000 ALTER TABLE `report_ris` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

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

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `storage_buckets` WRITE;
/*!40000 ALTER TABLE `storage_buckets` DISABLE KEYS */;
INSERT INTO `storage_buckets` VALUES
('product-images','product-images',1,5242880,'image/jpeg,image/jpg,image/png,image/webp');
/*!40000 ALTER TABLE `storage_buckets` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

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

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `storage_objects` WRITE;
/*!40000 ALTER TABLE `storage_objects` DISABLE KEYS */;
/*!40000 ALTER TABLE `storage_objects` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

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

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `user_roles` WRITE;
/*!40000 ALTER TABLE `user_roles` DISABLE KEYS */;
INSERT INTO `user_roles` VALUES
('0271fd84-cdfa-11f0-a43b-4c2338ce70c4','798b75df-94c0-48cc-94e4-9e5f64befcf9','admin','2025-11-30 15:09:05','2025-12-01 07:03:23'),
('33a666d8-cdfd-11f0-a43b-4c2338ce70c4','5a71d5ed-97b6-4c3c-8aea-b7ee9c192e95','user','2025-11-30 15:09:05','2025-12-01 08:14:12'),
('b2c459a3-cde6-11f0-a43b-4c2338ce70c4','00000000-0000-0000-0000-000000000001','superadmin','2025-11-30 15:09:05','2025-11-30 15:09:05');
/*!40000 ALTER TABLE `user_roles` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

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

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES
('00000000-0000-0000-0000-000000000001','supplyofficer@admin.com','System Admin','$2y$12$NAIGFw7h4BwIZKS.CZaDjOVyGIxIYi1li571ocK2PkWkPjX/0Lxie','2025-11-30 12:14:03'),
('5a71d5ed-97b6-4c3c-8aea-b7ee9c192e95','user@user.com','Ordinary user','$2y$12$wgoW9RSwZZUujw4ss.Woc.SXNFwnq2eobaiVqYc.qQVeRQB/WBkAq','2025-11-30 14:59:45'),
('798b75df-94c0-48cc-94e4-9e5f64befcf9','dummy@admin.com','C John','$2y$12$NAIGFw7h4BwIZKS.CZaDjOVyGIxIYi1li571ocK2PkWkPjX/0Lxie','2025-11-30 14:33:41');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;
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

-- Dump completed on 2026-02-25 21:04:20
