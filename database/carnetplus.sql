-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3306
-- Généré le : dim. 07 juin 2026 à 13:34
-- Version du serveur : 8.4.7
-- Version de PHP : 8.3.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `carnetplus`
--

-- --------------------------------------------------------

--
-- Structure de la table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `utilisateur_id` int DEFAULT NULL,
  `action` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `table_cible` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_cible` int DEFAULT NULL,
  `details` json DEFAULT NULL,
  `ip` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=189 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `audit_logs`
--

INSERT INTO `audit_logs` (`id`, `utilisateur_id`, `action`, `table_cible`, `id_cible`, `details`, `ip`, `created_at`) VALUES
(94, 1, 'login', NULL, NULL, NULL, '::1', '2026-05-11 20:41:44'),
(95, 1, 'login', NULL, NULL, NULL, '::1', '2026-05-11 20:55:49'),
(96, 1, 'login', NULL, NULL, NULL, '::1', '2026-05-11 21:17:34'),
(97, 1, 'login', NULL, NULL, NULL, '::1', '2026-05-11 21:25:21'),
(98, 1, 'login', NULL, NULL, NULL, '::1', '2026-05-12 11:32:27'),
(99, 1, 'login', NULL, NULL, NULL, '::1', '2026-05-13 17:58:32'),
(100, 1, 'login', NULL, NULL, NULL, '::1', '2026-05-13 18:15:15'),
(101, 16, 'login', NULL, NULL, NULL, '::1', '2026-05-13 18:16:30'),
(102, 17, 'login', NULL, NULL, NULL, '::1', '2026-05-13 18:26:24'),
(103, 17, 'create_patient', 'patients', 6, NULL, NULL, '2026-05-13 18:28:09'),
(104, 18, 'login', NULL, NULL, NULL, '::1', '2026-05-13 18:29:41'),
(105, 16, 'login', NULL, NULL, NULL, '::1', '2026-05-13 18:35:55'),
(106, 16, 'login', NULL, NULL, NULL, '::1', '2026-05-13 18:37:43'),
(107, 19, 'login', NULL, NULL, NULL, '::1', '2026-05-13 18:40:03'),
(108, 17, 'login', NULL, NULL, NULL, '::1', '2026-05-13 18:44:11'),
(109, 18, 'login', NULL, NULL, NULL, '::1', '2026-05-13 18:47:00'),
(110, 17, 'login', NULL, NULL, NULL, '::1', '2026-05-13 18:49:15'),
(111, 18, 'login', NULL, NULL, NULL, '::1', '2026-05-13 18:51:01'),
(112, 19, 'login', NULL, NULL, NULL, '::1', '2026-05-13 18:51:43'),
(113, 19, 'login', NULL, NULL, NULL, '::1', '2026-06-01 14:07:39'),
(114, 19, 'login', NULL, NULL, NULL, '::1', '2026-06-01 14:08:38'),
(115, 17, 'login', NULL, NULL, NULL, '::1', '2026-06-01 14:09:19'),
(116, 16, 'login', NULL, NULL, NULL, '::1', '2026-06-01 14:11:19'),
(117, 20, 'login', NULL, NULL, NULL, '::1', '2026-06-01 14:15:31'),
(118, 19, 'login', NULL, NULL, NULL, '::1', '2026-06-01 14:18:35'),
(119, 17, 'login', NULL, NULL, NULL, '::1', '2026-06-01 14:19:27'),
(120, 18, 'login', NULL, NULL, NULL, '::1', '2026-06-01 14:20:45'),
(121, 19, 'login', NULL, NULL, NULL, '::1', '2026-06-01 14:26:57'),
(122, 18, 'login', NULL, NULL, NULL, '::1', '2026-06-01 14:27:35'),
(123, 16, 'login', NULL, NULL, NULL, '::1', '2026-06-01 14:27:56'),
(124, 16, 'login', NULL, NULL, NULL, '::1', '2026-06-04 17:37:47'),
(125, 19, 'login', NULL, NULL, NULL, '::1', '2026-06-04 17:40:14'),
(126, 18, 'login', NULL, NULL, NULL, '::1', '2026-06-04 17:40:24'),
(127, 1, 'login', NULL, NULL, NULL, '::1', '2026-06-04 17:41:13'),
(128, 18, 'login', NULL, NULL, NULL, '::1', '2026-06-04 17:45:12'),
(129, 19, 'login', NULL, NULL, NULL, '::1', '2026-06-04 17:45:31'),
(130, 20, 'login', NULL, NULL, NULL, '::1', '2026-06-04 17:45:43'),
(131, 16, 'login', NULL, NULL, NULL, '::1', '2026-06-04 17:47:06'),
(132, 17, 'login', NULL, NULL, NULL, '::1', '2026-06-04 17:50:55'),
(133, 1, 'login', NULL, NULL, NULL, '::1', '2026-06-07 00:37:39'),
(134, 1, 'login', NULL, NULL, NULL, '::1', '2026-06-07 00:41:31'),
(135, 1, 'login', NULL, NULL, NULL, '::1', '2026-06-07 01:49:22'),
(136, 1, 'login', NULL, NULL, NULL, '::1', '2026-06-07 01:51:14'),
(137, 1, 'login', NULL, NULL, NULL, '::1', '2026-06-07 01:53:07'),
(138, 1, 'login', NULL, NULL, NULL, '::1', '2026-06-07 01:55:03'),
(139, 1, 'login', NULL, NULL, NULL, '::1', '2026-06-07 01:57:21'),
(140, 1, 'login', NULL, NULL, NULL, '::1', '2026-06-07 02:00:36'),
(141, 1, 'login', NULL, NULL, NULL, '::1', '2026-06-07 06:11:55'),
(142, 1, 'login', NULL, NULL, NULL, '::1', '2026-06-07 06:19:38'),
(143, 1, 'login', NULL, NULL, NULL, '::1', '2026-06-07 06:24:33'),
(144, 1, 'login', NULL, NULL, NULL, '::1', '2026-06-07 10:43:48'),
(145, 1, 'login', NULL, NULL, NULL, '::1', '2026-06-07 10:45:52'),
(146, 28, 'login', NULL, NULL, NULL, '::1', '2026-06-07 10:47:33'),
(147, 29, 'login', NULL, NULL, NULL, '::1', '2026-06-07 11:04:46'),
(148, 29, 'create_patient', 'patients', 7, NULL, NULL, '2026-06-07 11:11:03'),
(149, 29, 'create_patient', 'patients', 8, NULL, NULL, '2026-06-07 11:17:21'),
(150, 30, 'login', NULL, NULL, NULL, '::1', '2026-06-07 11:19:20'),
(151, 30, 'create_consultation', 'consultations', 4, NULL, NULL, '2026-06-07 11:24:50'),
(152, 34, 'login', NULL, NULL, NULL, '::1', '2026-06-07 11:30:18'),
(153, 31, 'login', NULL, NULL, NULL, '::1', '2026-06-07 11:33:36'),
(154, 30, 'login', NULL, NULL, NULL, '::1', '2026-06-07 11:57:30'),
(155, 34, 'login', NULL, NULL, NULL, '::1', '2026-06-07 11:58:29'),
(156, 1, 'login', NULL, NULL, NULL, '::1', '2026-06-07 12:02:34'),
(157, 30, 'login', NULL, NULL, NULL, '::1', '2026-06-07 12:03:04'),
(158, 28, 'login', NULL, NULL, NULL, '::1', '2026-06-07 12:03:12'),
(159, 28, 'login', NULL, NULL, NULL, '::1', '2026-06-07 12:03:25'),
(160, 31, 'login', NULL, NULL, NULL, '::1', '2026-06-07 12:03:31'),
(161, 31, 'login', NULL, NULL, NULL, '::1', '2026-06-07 12:04:09'),
(162, 1, 'login', NULL, NULL, NULL, '::1', '2026-06-07 12:14:39'),
(163, 35, 'login', NULL, NULL, NULL, '::1', '2026-06-07 12:16:47'),
(164, 36, 'login', NULL, NULL, NULL, '::1', '2026-06-07 12:22:30'),
(165, 36, 'create_patient', 'patients', 9, NULL, NULL, '2026-06-07 12:25:58'),
(166, 36, 'create_patient', 'patients', 10, NULL, NULL, '2026-06-07 12:27:59'),
(167, 40, 'login', NULL, NULL, NULL, '::1', '2026-06-07 12:28:48'),
(168, 40, 'login', NULL, NULL, NULL, '::1', '2026-06-07 12:30:42'),
(169, 37, 'login', NULL, NULL, NULL, '::1', '2026-06-07 12:32:52'),
(170, 36, 'login', NULL, NULL, NULL, '::1', '2026-06-07 12:36:07'),
(171, 37, 'login', NULL, NULL, NULL, '::1', '2026-06-07 12:38:26'),
(172, 40, 'login', NULL, NULL, NULL, '::1', '2026-06-07 12:38:41'),
(173, 41, 'login', NULL, NULL, NULL, '::1', '2026-06-07 12:39:28'),
(174, 30, 'login', NULL, NULL, NULL, '::1', '2026-06-07 12:40:07'),
(175, 34, 'login', NULL, NULL, NULL, '::1', '2026-06-07 12:43:00'),
(176, 33, 'login', NULL, NULL, NULL, '::1', '2026-06-07 12:44:19'),
(177, 34, 'login', NULL, NULL, NULL, '::1', '2026-06-07 12:44:50'),
(178, 40, 'login', NULL, NULL, NULL, '::1', '2026-06-07 12:45:26'),
(179, 41, 'login', NULL, NULL, NULL, '::1', '2026-06-07 12:45:56'),
(180, 37, 'login', NULL, NULL, NULL, '::1', '2026-06-07 12:46:26'),
(181, 36, 'login', NULL, NULL, NULL, '::1', '2026-06-07 12:48:26'),
(182, 40, 'login', NULL, NULL, NULL, '::1', '2026-06-07 12:49:21'),
(183, 41, 'login', NULL, NULL, NULL, '::1', '2026-06-07 12:50:38'),
(184, 36, 'login', NULL, NULL, NULL, '::1', '2026-06-07 12:51:07'),
(185, 35, 'login', NULL, NULL, NULL, '::1', '2026-06-07 12:53:13'),
(186, 37, 'login', NULL, NULL, NULL, '::1', '2026-06-07 12:53:52'),
(187, 35, 'login', NULL, NULL, NULL, '::1', '2026-06-07 12:56:29'),
(188, 28, 'login', NULL, NULL, NULL, '::1', '2026-06-07 13:17:36');

-- --------------------------------------------------------

--
-- Structure de la table `consultations`
--

DROP TABLE IF EXISTS `consultations`;
CREATE TABLE IF NOT EXISTS `consultations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `patient_id` int NOT NULL,
  `medecin_id` int NOT NULL,
  `rdv_id` int DEFAULT NULL,
  `motif` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `symptomes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `diagnostic` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `traitement` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `observations` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `tension` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `temperature` decimal(4,1) DEFAULT NULL,
  `poids` decimal(5,2) DEFAULT NULL,
  `taille` decimal(5,2) DEFAULT NULL,
  `date_consultation` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `patient_id` (`patient_id`),
  KEY `medecin_id` (`medecin_id`),
  KEY `rdv_id` (`rdv_id`)
) ENGINE=MyISAM AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `consultations`
--

INSERT INTO `consultations` (`id`, `patient_id`, `medecin_id`, `rdv_id`, `motif`, `symptomes`, `diagnostic`, `traitement`, `observations`, `tension`, `temperature`, `poids`, `taille`, `date_consultation`) VALUES
(4, 8, 30, NULL, 'Vertige', 'corps chaud....', 'debut de palu...', '2 jour de repos...', 'aucune', '120', 23.0, 70.00, 175.00, '2026-06-07 12:24:50');

-- --------------------------------------------------------

--
-- Structure de la table `demandes_adhesion`
--

DROP TABLE IF EXISTS `demandes_adhesion`;
CREATE TABLE IF NOT EXISTS `demandes_adhesion` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nom_etablissement` varchar(255) NOT NULL,
  `type_structure` varchar(50) DEFAULT NULL,
  `adresse` text,
  `ville` varchar(100) DEFAULT NULL,
  `nom_responsable` varchar(255) DEFAULT NULL,
  `email_contact` varchar(255) NOT NULL,
  `telephone` varchar(20) DEFAULT NULL,
  `motif` text,
  `statut` enum('en_attente','approuve','rejete') DEFAULT 'en_attente',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `demandes_adhesion`
--

INSERT INTO `demandes_adhesion` (`id`, `nom_etablissement`, `type_structure`, `adresse`, `ville`, `nom_responsable`, `email_contact`, `telephone`, `motif`, `statut`, `created_at`) VALUES
(23, 'Jahfide', 'clinique', NULL, 'sp,cpdoc', 'kcnlcl', 'jahfidea@gmail.com', NULL, NULL, 'approuve', '2026-06-04 17:36:42'),
(24, 'Saint jean', 'hopital', NULL, 'cotonou', 'Marc Orel', 'marcorel2004@gmail.com', NULL, NULL, 'approuve', '2026-06-07 01:49:13'),
(25, 'Sqint jeqn', 'clinique', NULL, 'cotonou', 'Yane', 'marcyane342@gmail.com', NULL, NULL, 'approuve', '2026-06-07 01:51:11'),
(26, 'Saint jean', 'cabinet', NULL, 'cotonou', 'Dr Max', 'yanseugene@gmail.com', NULL, NULL, 'approuve', '2026-06-07 01:53:03'),
(27, 'jean pliya', 'cabinet', NULL, 'pahou', '?r Dark', 'yanseugene@gmail.com', NULL, NULL, 'approuve', '2026-06-07 01:55:00'),
(28, 'Alicein', 'laboratoire', NULL, 'kery', 'mike marc', 'decoalice44@gmail.com', NULL, NULL, 'approuve', '2026-06-07 01:57:17'),
(29, 'Qhphi', 'laboratoire', NULL, 'cotonou', '?qrtin', 'codeyaya@gmail.com', NULL, NULL, 'approuve', '2026-06-07 02:00:04'),
(30, 'Sait Daniel', 'clinique', NULL, 'Cotonou', 'Mr Eugene', 'yanseugene@gmail.com', NULL, NULL, 'approuve', '2026-06-07 10:45:48'),
(31, 'Saint Jean', 'hopital', NULL, 'Hevier', 'Dr.Maxim', 'francismarchal08@gmail.com', NULL, NULL, 'approuve', '2026-06-07 12:14:32');

-- --------------------------------------------------------

--
-- Structure de la table `etablissements`
--

DROP TABLE IF EXISTS `etablissements`;
CREATE TABLE IF NOT EXISTS `etablissements` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'hopital',
  `adresse` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ville` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telephone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `statut` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'actif',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=52 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `etablissements`
--

INSERT INTO `etablissements` (`id`, `nom`, `type`, `adresse`, `ville`, `telephone`, `email`, `statut`, `created_at`) VALUES
(50, 'Sait Daniel', 'hopital', '', 'Cotonou', '', 'yanseugene@gmail.com', 'actif', '2026-06-07 10:46:05'),
(51, 'Saint Jean', 'hopital', '', 'Hevier', '', 'francismarchal08@gmail.com', 'actif', '2026-06-07 12:15:54');

-- --------------------------------------------------------

--
-- Structure de la table `examens`
--

DROP TABLE IF EXISTS `examens`;
CREATE TABLE IF NOT EXISTS `examens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `patient_id` int NOT NULL,
  `medecin_id` int NOT NULL,
  `consultation_id` int DEFAULT NULL,
  `type_examen` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `urgence` tinyint(1) DEFAULT '0',
  `statut` enum('demande','en_cours','termine','transmis') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'demande',
  `resultat` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `fichier_resultat` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date_demande` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `date_resultat` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `patient_id` (`patient_id`),
  KEY `medecin_id` (`medecin_id`),
  KEY `consultation_id` (`consultation_id`)
) ENGINE=MyISAM AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `examens`
--

INSERT INTO `examens` (`id`, `patient_id`, `medecin_id`, `consultation_id`, `type_examen`, `description`, `urgence`, `statut`, `resultat`, `fichier_resultat`, `date_demande`, `date_resultat`) VALUES
(7, 8, 30, 4, 'Prise de sang (NFS)', 'uogj', 0, 'termine', 'Glycémie élever', NULL, '2026-06-07 11:25:45', '2026-06-07 11:56:10');

-- --------------------------------------------------------

--
-- Structure de la table `messages`
--

DROP TABLE IF EXISTS `messages`;
CREATE TABLE IF NOT EXISTS `messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `expediteur_id` int NOT NULL,
  `destinataire_id` int NOT NULL,
  `objet` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contenu` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `lu` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `expediteur_id` (`expediteur_id`),
  KEY `destinataire_id` (`destinataire_id`)
) ENGINE=MyISAM AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `messages`
--

INSERT INTO `messages` (`id`, `expediteur_id`, `destinataire_id`, `objet`, `contenu`, `lu`, `created_at`) VALUES
(14, 1, 10, '', 'cc', 0, '2026-05-11 20:57:32'),
(15, 16, 17, '', 'gouùù!', 1, '2026-05-13 18:24:07'),
(16, 19, 17, '', 'mrt a jour le dossier medical.......', 1, '2026-05-13 18:43:40'),
(17, 17, 19, '', 'ok', 1, '2026-05-13 18:44:32'),
(18, 1, 16, '', 'lbssssssssf', 1, '2026-06-04 17:42:23'),
(19, 16, 1, '', '!;,,,,,,,', 0, '2026-06-04 17:47:34'),
(20, 31, 30, '', 'Je viens denvoyer les resultats', 1, '2026-06-07 11:57:15'),
(21, 30, 31, '', 'ok', 1, '2026-06-07 11:57:48');

-- --------------------------------------------------------

--
-- Structure de la table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `utilisateur_id` int NOT NULL,
  `titre` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `type` enum('info','success','warning','error') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'info',
  `lu` tinyint(1) DEFAULT '0',
  `lien` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `utilisateur_id` (`utilisateur_id`)
) ENGINE=MyISAM AUTO_INCREMENT=55 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `notifications`
--

INSERT INTO `notifications` (`id`, `utilisateur_id`, `titre`, `message`, `type`, `lu`, `lien`, `created_at`) VALUES
(20, 1, 'Nouvelle demande d\'adhésion', 'L\'établissement \'St Daniel\' souhaite rejoindre le réseau.', 'info', 0, NULL, '2026-05-11 20:43:21'),
(21, 1, 'Nouvelle demande d\'adhésion', 'L\'établissement \'St Daniel\' souhaite rejoindre le réseau.', 'info', 0, NULL, '2026-05-11 21:14:32'),
(22, 1, 'Nouvelle demande d\'adhésion', 'L\'établissement \'St Daniel\' souhaite rejoindre le réseau.', 'info', 0, NULL, '2026-05-11 21:15:59'),
(23, 1, 'Nouvelle demande d\'adhésion', 'L\'établissement \'St Daniel\' souhaite rejoindre le réseau.', 'info', 0, NULL, '2026-05-11 21:20:12'),
(24, 1, 'Nouvelle demande d\'adhésion', 'L\'établissement \'aure bpko\' souhaite rejoindre le réseau.', 'info', 0, NULL, '2026-05-11 21:24:29'),
(25, 1, 'Nouvelle demande d\'adhésion', 'L\'établissement \'St Daniel\' souhaite rejoindre le réseau.', 'info', 0, NULL, '2026-05-11 21:27:47'),
(26, 1, 'Nouvelle demande d\'adhésion', 'L\'établissement \'fff\' souhaite rejoindre le réseau.', 'info', 0, NULL, '2026-05-11 21:39:24'),
(27, 1, 'Nouvelle demande d\'adhésion', 'L\'établissement \'St Daniel\' souhaite rejoindre le réseau.', 'info', 0, NULL, '2026-05-13 17:47:56'),
(28, 1, 'Nouvelle demande d\'adhésion', 'L\'établissement \'St Daniel\' souhaite rejoindre le réseau.', 'info', 0, NULL, '2026-05-13 18:08:27'),
(29, 18, 'Nouvelle prescription', 'Le médecin vous a prescrit un traitement', 'success', 1, NULL, '2026-05-13 18:42:11'),
(30, 19, 'Nouveau RDV', 'Nouveau rendez-vous le 2026-05-16 à 09:00', 'info', 1, NULL, '2026-05-13 18:48:38'),
(31, 18, 'Mise à jour RDV', 'Votre RDV du 2026-05-16 est confirmé.', 'success', 0, NULL, '2026-05-13 18:50:14'),
(32, 1, 'Nouvelle demande d\'adhésion', 'L\'établissement \'Jahfide\' souhaite rejoindre le réseau.', 'info', 0, NULL, '2026-06-04 17:36:43'),
(33, 1, 'Nouvelle demande d\'adhésion', 'L\'établissement \'Saint jean\' souhaite rejoindre le réseau.', 'info', 0, NULL, '2026-06-07 01:49:13'),
(34, 1, 'Nouvelle demande d\'adhésion', 'L\'établissement \'Sqint jeqn\' souhaite rejoindre le réseau.', 'info', 0, NULL, '2026-06-07 01:51:11'),
(35, 1, 'Nouvelle demande d\'adhésion', 'L\'établissement \'Saint jean\' souhaite rejoindre le réseau.', 'info', 0, NULL, '2026-06-07 01:53:03'),
(36, 1, 'Nouvelle demande d\'adhésion', 'L\'établissement \'jean pliya\' souhaite rejoindre le réseau.', 'info', 0, NULL, '2026-06-07 01:55:00'),
(37, 1, 'Nouvelle demande d\'adhésion', 'L\'établissement \'Alicein\' souhaite rejoindre le réseau.', 'info', 0, NULL, '2026-06-07 01:57:17'),
(38, 1, 'Nouvelle demande d\'adhésion', 'L\'établissement \'Qhphi\' souhaite rejoindre le réseau.', 'info', 1, NULL, '2026-06-07 02:00:04'),
(39, 1, 'Nouvelle demande d\'adhésion', 'L\'établissement \'Sait Daniel\' souhaite rejoindre le réseau.', 'info', 0, NULL, '2026-06-07 10:45:48'),
(40, 34, 'Nouvelle consultation', 'Une nouvelle consultation a été enregistrée dans votre dossier.', 'info', 0, NULL, '2026-06-07 11:24:50'),
(41, 31, 'Nouvelle demande', 'Examen: Prise de sang (NFS)', 'info', 0, NULL, '2026-06-07 11:25:45'),
(42, 34, 'Résultat disponible', 'Votre résultat d\'examen (Prise de sang (NFS)) est disponible.', 'success', 0, NULL, '2026-06-07 11:56:10'),
(43, 1, 'Nouvelle demande d\'adhésion', 'L\'établissement \'Saint Jean\' souhaite rejoindre le réseau.', 'info', 0, NULL, '2026-06-07 12:14:32'),
(44, 30, 'Nouveau RDV', 'Nouveau rendez-vous le 2026-06-07 à 11:30', 'info', 0, NULL, '2026-06-07 12:29:06'),
(45, 30, 'Nouveau RDV', 'Nouveau rendez-vous le 2026-06-07 à 14:38', 'info', 1, NULL, '2026-06-07 12:38:00'),
(46, 37, 'Nouveau RDV', 'Nouveau rendez-vous le 2026-06-08 à 08:30', 'info', 0, NULL, '2026-06-07 12:43:14'),
(47, 37, 'Nouveau RDV', 'Nouveau rendez-vous le 2026-06-08 à 11:30', 'info', 0, NULL, '2026-06-07 12:44:38'),
(48, 34, 'RDV Annulé', 'Votre rendez-vous du 2026-06-08 a été annulé/supprimé par le secrétariat.', 'error', 0, NULL, '2026-06-07 12:49:02'),
(49, 33, 'RDV Annulé', 'Votre rendez-vous du 2026-06-08 a été annulé/supprimé par le secrétariat.', 'error', 0, NULL, '2026-06-07 12:49:10'),
(50, 37, 'Nouveau RDV', 'Nouveau rendez-vous le 2026-06-11 à 08:30', 'info', 0, NULL, '2026-06-07 12:49:43'),
(51, 37, 'Nouveau RDV', 'Nouveau rendez-vous le 2026-06-10 à 08:30', 'info', 0, NULL, '2026-06-07 12:50:48'),
(52, 40, 'Mise à jour RDV', 'Votre RDV du 2026-06-11 est confirmé.', 'success', 0, NULL, '2026-06-07 12:52:36'),
(53, 41, 'Mise à jour RDV', 'Votre RDV du 2026-06-19 est confirmé.', 'success', 0, NULL, '2026-06-07 12:52:39'),
(54, 1, 'Demande de transfert', 'Une nouvelle demande de transfert a été créée par Dr.Maxim Nom', 'info', 0, NULL, '2026-06-07 13:16:39');

-- --------------------------------------------------------

--
-- Structure de la table `password_resets`
--

DROP TABLE IF EXISTS `password_resets`;
CREATE TABLE IF NOT EXISTS `password_resets` (
  `id` int NOT NULL AUTO_INCREMENT,
  `utilisateur_id` int NOT NULL,
  `token` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token` (`token`),
  KEY `idx_token` (`token`),
  KEY `idx_user` (`utilisateur_id`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `patients`
--

DROP TABLE IF EXISTS `patients`;
CREATE TABLE IF NOT EXISTS `patients` (
  `id` int NOT NULL AUTO_INCREMENT,
  `numero_dossier` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `nom` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `prenom` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `date_naissance` date DEFAULT NULL,
  `sexe` enum('M','F','Autre') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telephone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `adresse` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `groupe_sanguin` enum('A+','A-','B+','B-','AB+','AB-','O+','O-') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `allergies` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `antecedents` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `etablissement_id` int DEFAULT NULL,
  `utilisateur_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `numero_dossier` (`numero_dossier`),
  KEY `etablissement_id` (`etablissement_id`),
  KEY `utilisateur_id` (`utilisateur_id`)
) ENGINE=MyISAM AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `patients`
--

INSERT INTO `patients` (`id`, `numero_dossier`, `nom`, `prenom`, `date_naissance`, `sexe`, `email`, `telephone`, `adresse`, `groupe_sanguin`, `allergies`, `antecedents`, `etablissement_id`, `utilisateur_id`, `created_at`) VALUES
(6, 'DOS-2026-001', 'PIO', 'pipi', '2026-05-01', 'M', 'aurelbc91@gmail.com', '+2290151794913', 'COTONOU', 'B+', 'aucune', 'aucun', 37, 18, '2026-05-13 18:28:09'),
(7, 'DOS-2026-002', 'Avaligbe', 'Elfrieda', '2004-01-05', 'F', 'yaniskyt35@gmail.com', '229 0158756397', 'Akpakpa', 'O+', 'Lactose', 'Aucun', 50, 33, '2026-06-07 11:11:03'),
(8, 'DOS-2026-003', 'DOSSOU', 'Yanis', '2008-01-08', 'M', 'jili82482@gmail.com', '229 0169547825', 'Cotonou', 'AB+', 'Aucun', 'Problème Cardiaque', 50, 34, '2026-06-07 11:17:21'),
(9, 'DOS-2026-004', 'KPOGLI', 'Esther', '2008-01-07', 'F', 'ese62366@gmail.com', '229 0194587825', 'Calavi', 'B+', 'Aucun', 'Aucun', 51, 40, '2026-06-07 12:25:58'),
(10, 'DOS-2026-005', 'ASSOGBA', 'Cherydane', '2004-05-12', 'F', 'anastasiaana106@gmail.com', '229 0198562415', 'Cocotomey', 'A+', 'Aucun', 'Tensionnaire', 51, 41, '2026-06-07 12:27:59');

-- --------------------------------------------------------

--
-- Structure de la table `prescriptions`
--

DROP TABLE IF EXISTS `prescriptions`;
CREATE TABLE IF NOT EXISTS `prescriptions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `consultation_id` int DEFAULT NULL,
  `patient_id` int NOT NULL,
  `medecin_id` int NOT NULL,
  `date_prescription` date DEFAULT (curdate()),
  `statut` enum('active','terminee','annulee') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `consultation_id` (`consultation_id`),
  KEY `patient_id` (`patient_id`),
  KEY `medecin_id` (`medecin_id`)
) ENGINE=MyISAM AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `prescriptions`
--

INSERT INTO `prescriptions` (`id`, `consultation_id`, `patient_id`, `medecin_id`, `date_prescription`, `statut`, `created_at`) VALUES
(1, 1, 1, 2, '2026-05-06', 'active', '2026-05-06 16:40:06'),
(2, 2, 2, 2, '2026-05-06', 'active', '2026-05-06 16:40:06'),
(3, 3, 1, 2, '2026-05-06', 'active', '2026-05-06 16:40:06'),
(4, NULL, 1, 2, '2026-05-07', 'active', '2026-05-07 16:46:29'),
(5, NULL, 1, 7, '2026-05-10', 'active', '2026-05-10 13:22:44'),
(6, NULL, 6, 19, '2026-05-13', 'active', '2026-05-13 18:42:11');

-- --------------------------------------------------------

--
-- Structure de la table `prescription_medicaments`
--

DROP TABLE IF EXISTS `prescription_medicaments`;
CREATE TABLE IF NOT EXISTS `prescription_medicaments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `prescription_id` int NOT NULL,
  `nom_medicament` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `posologie` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `duree` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `instructions` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  KEY `prescription_id` (`prescription_id`)
) ENGINE=MyISAM AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `prescription_medicaments`
--

INSERT INTO `prescription_medicaments` (`id`, `prescription_id`, `nom_medicament`, `posologie`, `duree`, `instructions`) VALUES
(11, 6, 'PARA', '2 matin 2 le soir', '13jours', 'Ne pas boire de l\'eau');

-- --------------------------------------------------------

--
-- Structure de la table `rendez_vous`
--

DROP TABLE IF EXISTS `rendez_vous`;
CREATE TABLE IF NOT EXISTS `rendez_vous` (
  `id` int NOT NULL AUTO_INCREMENT,
  `patient_id` int NOT NULL,
  `medecin_id` int NOT NULL,
  `secretaire_id` int DEFAULT NULL,
  `date_rdv` date NOT NULL,
  `heure_rdv` time NOT NULL,
  `motif` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `statut` enum('planifie','confirme','annule','termine') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'planifie',
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `patient_id` (`patient_id`),
  KEY `medecin_id` (`medecin_id`),
  KEY `secretaire_id` (`secretaire_id`)
) ENGINE=MyISAM AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `rendez_vous`
--

INSERT INTO `rendez_vous` (`id`, `patient_id`, `medecin_id`, `secretaire_id`, `date_rdv`, `heure_rdv`, `motif`, `statut`, `notes`, `created_at`) VALUES
(11, 6, 19, NULL, '2026-05-16', '09:00:00', 'Consultation générale', 'confirme', NULL, '2026-05-13 18:48:38'),
(12, 9, 30, NULL, '2026-06-07', '11:30:00', 'Consultation générale', 'planifie', NULL, '2026-06-07 12:29:06'),
(13, 10, 30, 36, '2026-06-07', '14:38:00', 'bilan de santer', 'planifie', NULL, '2026-06-07 12:38:00'),
(17, 10, 37, NULL, '2026-06-19', '10:32:00', 'Consultation générale', 'confirme', NULL, '2026-06-07 12:50:48'),
(16, 9, 37, NULL, '2026-06-11', '08:30:00', 'Consultation générale', 'confirme', NULL, '2026-06-07 12:49:43');

-- --------------------------------------------------------

--
-- Structure de la table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
CREATE TABLE IF NOT EXISTS `sessions` (
  `id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `utilisateur_id` int NOT NULL,
  `ip_address` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `utilisateur_id` (`utilisateur_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `sessions`
--

INSERT INTO `sessions` (`id`, `utilisateur_id`, `ip_address`, `user_agent`, `expires_at`, `created_at`) VALUES
('da52f1c9dc52293eaceab5b70c3be48ccaf64dbe7e82bd629096b461a7ff1d99', 1, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-05-12 00:56:44', '2026-05-11 17:56:44'),
('c7f8d5eab0134ec6c3e29a96065e3267e2cd3af0e44ab8f424be97aaa13581c0', 1, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', '2026-05-12 18:32:27', '2026-05-12 11:32:27'),
('f2b97b6110ae9f70bac71f4743cdb204135df521c25325f40b2f6fb06be092f5', 19, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', '2026-05-14 01:51:43', '2026-05-13 18:51:43'),
('225178b9746d54083765116eed9dbcdc62f1fb73e71590edfccb5ffcd0a821dc', 17, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', '2026-06-05 00:50:55', '2026-06-04 17:50:55'),
('c0e6d014fd9b4e592f0ee22353dd5ae98e51c5f4e6b72f154a0c850a3d702836', 1, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '2026-06-07 09:00:36', '2026-06-07 02:00:36'),
('9affb8ec7028feb8ad96fd56c4ee278f574ca6de194ff10cda092d2488d10b05', 28, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '2026-06-07 20:17:36', '2026-06-07 13:17:36');

-- --------------------------------------------------------

--
-- Structure de la table `settings`
--

DROP TABLE IF EXISTS `settings`;
CREATE TABLE IF NOT EXISTS `settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cle` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `valeur` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `groupe` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'general',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cle` (`cle`)
) ENGINE=MyISAM AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `settings`
--

INSERT INTO `settings` (`id`, `cle`, `valeur`, `groupe`, `created_at`, `updated_at`) VALUES
(1, 'app_name', 'CarnetPlus Pro', 'general', '2026-05-08 20:27:30', '2026-05-08 20:27:30'),
(2, 'support_email', 'support@carnetplus.com', 'general', '2026-05-08 20:27:30', '2026-05-08 20:27:30'),
(3, 'maintenance_mode', 'false', 'security', '2026-05-08 20:27:30', '2026-05-08 20:27:30'),
(4, 'min_password_length', '8', 'security', '2026-05-08 20:27:30', '2026-05-08 20:27:30'),
(5, 'session_timeout', '60', 'security', '2026-05-08 20:27:30', '2026-05-08 20:27:30'),
(6, 'allow_registration', 'true', 'general', '2026-05-08 20:27:30', '2026-05-08 20:27:30');

-- --------------------------------------------------------

--
-- Structure de la table `transferts_dossiers`
--

DROP TABLE IF EXISTS `transferts_dossiers`;
CREATE TABLE IF NOT EXISTS `transferts_dossiers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `patient_id` int NOT NULL,
  `gestionnaire_id` int NOT NULL,
  `etablissement_source_id` int NOT NULL,
  `etablissement_dest_id` int NOT NULL,
  `motif` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `statut` enum('en_attente','accepte','refuse','transfere') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'en_attente',
  `type` enum('envoi','reception') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `priorite` enum('normale','urgente') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'normale',
  `documents_joints` json DEFAULT NULL,
  `notes_gestionnaire` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `date_demande` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `date_traitement` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `patient_id` (`patient_id`),
  KEY `gestionnaire_id` (`gestionnaire_id`),
  KEY `etablissement_source_id` (`etablissement_source_id`),
  KEY `etablissement_dest_id` (`etablissement_dest_id`)
) ENGINE=MyISAM AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `transferts_dossiers`
--

INSERT INTO `transferts_dossiers` (`id`, `patient_id`, `gestionnaire_id`, `etablissement_source_id`, `etablissement_dest_id`, `motif`, `statut`, `type`, `priorite`, `documents_joints`, `notes_gestionnaire`, `date_demande`, `date_traitement`) VALUES
(6, 10, 35, 1, 51, 'changement d\'établissement', 'en_attente', 'envoi', 'urgente', NULL, '', '2026-06-07 13:16:39', NULL);

-- --------------------------------------------------------

--
-- Structure de la table `utilisateurs`
--

DROP TABLE IF EXISTS `utilisateurs`;
CREATE TABLE IF NOT EXISTS `utilisateurs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `prenom` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `mot_de_passe` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('admin','medecin','secretaire','labo','patient','gestionnaire','agent_sante') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `etablissement_id` int DEFAULT NULL,
  `telephone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `actif` tinyint(1) DEFAULT '1',
  `photo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `etablissement_id` (`etablissement_id`)
) ENGINE=MyISAM AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `utilisateurs`
--

INSERT INTO `utilisateurs` (`id`, `nom`, `prenom`, `email`, `mot_de_passe`, `role`, `etablissement_id`, `telephone`, `actif`, `photo`, `created_at`) VALUES
(1, 'Admin', 'Système', 'admin@carnetplus.com', '$2y$10$ZZ5otFvXdJKYzdPB6Jb8iO5GvWjwzItZKnTGIFOEH48vFAnrgU3bS', 'admin', 1, '+229 97 00 00 00', 1, NULL, '2026-05-06 16:40:06'),
(28, 'Eugene', 'Mr', 'yanseugene@gmail.com', '$2y$10$ir7woXlV4Evf6EtAfXTo..SB5iItpC3kLKzBgqf6z1DKQJArWAo..', 'gestionnaire', 50, NULL, 1, NULL, '2026-06-07 10:46:05'),
(29, 'NOUKOUDJO', 'Marc Orel', 'marcorel2004@gmail.com', '$2y$10$XFGtbmVR63gKQ.CT2HtVqeBGN8yyYjQLzhUZkixbFc1wbp8oOgAGu', 'secretaire', 50, '0160096456', 1, NULL, '2026-06-07 10:54:23'),
(30, 'AMOUSSOU', 'Yane-Kery', 'yanekery0@gmail.com', '$2y$10$Ut.GvATPTHT4NTg1t6gZZuFDgVTDHiGd5mPqNCb84Bh0TTWMirJD.', 'medecin', 50, '', 1, NULL, '2026-06-07 10:56:58'),
(31, 'BOKO', 'Philipio', 'marcyane342@gmail.com', '$2y$10$l4uIG5C1sZHaKvcJdMDRAuSbQaEa1brov3uZFqk5O9jJo90coyQxq', 'labo', 50, '0156987532', 1, NULL, '2026-06-07 10:59:10'),
(32, 'BOKO', 'Aurel', 'decoalice44@gmail.com', '$2y$10$3PD9X/zHqnlZOhUCG04hOuCPdE0l9p6PnLuXYG1LAhemhFOQqRCyy', 'agent_sante', 50, '0198657458', 1, NULL, '2026-06-07 11:01:43'),
(33, 'Avaligbe', 'Elfrieda', 'yaniskyt35@gmail.com', '$2y$10$Xto7yMU8Hfz2ue/AXmdqEuRgv/Bly4M459Qn1Lb4r8Ho/WmSC8G/u', 'patient', 50, NULL, 1, NULL, '2026-06-07 11:11:03'),
(34, 'DOSSOU', 'Yanis', 'jili82482@gmail.com', '$2y$10$7f0NPrwW4xewnPRx64Kulum2LQQ7UdqDtZ2RBIpQBYdlI.mU6/13G', 'patient', 50, NULL, 1, NULL, '2026-06-07 11:17:21'),
(35, 'Nom', 'Dr.Maxim', 'francismarchal08@gmail.com', '$2y$10$I1sw6JBNm20yPcW34GtiTuCsUqI/5sx/oOIBDt9zNY7Hfj2AH1VkO', 'gestionnaire', 51, NULL, 1, NULL, '2026-06-07 12:15:55'),
(36, ' SAVI', 'Corine', 'cori09050@gmail.com', '$2y$10$JwcsPf8rTFbAuJ9otigLpu1orkSJspI90nf/.ytXsEcW6tLQ1U7tG', 'secretaire', 51, '0169853214', 1, NULL, '2026-06-07 12:18:53'),
(37, 'SALIFOU', 'Kamal', 'kiti63476@gmail.com', '$2y$10$A7vlrO/ZV9Q/OL1OD0I8DOCa2.Epf.yqnyVEZ7NmTimBH1iPME3P2', 'medecin', 51, '0196125345', 1, NULL, '2026-06-07 12:19:43'),
(38, 'Alikon', 'David ', 'eunicesalt9@gmail.com', '$2y$10$g6LEYBWJfRhKiJnF6zu1n.Dk.2cJWBVRB/lgYwE9ZlP6MI73LAnSW', 'labo', 51, '0197854525', 1, NULL, '2026-06-07 12:20:15'),
(39, 'MOUSSA', 'Moubarack', 'noukoudjomarc904@gmail.com', '$2y$10$C6xAyJT7dlf8uAuI7O15o.G9eppqWvWMyYZH1Xuzeuxtxu2ZF7fRG', 'agent_sante', 51, '0197458695', 1, NULL, '2026-06-07 12:21:12'),
(40, 'KPOGLI', 'Esther', 'ese62366@gmail.com', '$2y$10$jrsxto//VUYI0QDrhMC1X.DzDSLGdYPWOXMAMcEySB84zU33pqWjm', 'patient', 51, NULL, 1, NULL, '2026-06-07 12:25:58'),
(41, 'ASSOGBA', 'Cherydane', 'anastasiaana106@gmail.com', '$2y$10$UeLw.G9kK1AyOJnrmwcpquvlZMd5Nt7Tv.jnlgTDtdi5LqXuUXmF2', 'patient', 51, NULL, 1, NULL, '2026-06-07 12:27:59');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
