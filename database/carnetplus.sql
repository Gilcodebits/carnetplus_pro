-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3306
-- Généré le : lun. 11 mai 2026 à 18:15
-- Version du serveur : 9.1.0
-- Version de PHP : 8.3.14

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
  `action` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `table_cible` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_cible` int DEFAULT NULL,
  `details` json DEFAULT NULL,
  `ip` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=94 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
  `motif` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `symptomes` text COLLATE utf8mb4_unicode_ci,
  `diagnostic` text COLLATE utf8mb4_unicode_ci,
  `traitement` text COLLATE utf8mb4_unicode_ci,
  `observations` text COLLATE utf8mb4_unicode_ci,
  `tension` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `temperature` decimal(4,1) DEFAULT NULL,
  `poids` decimal(5,2) DEFAULT NULL,
  `taille` decimal(5,2) DEFAULT NULL,
  `date_consultation` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `patient_id` (`patient_id`),
  KEY `medecin_id` (`medecin_id`),
  KEY `rdv_id` (`rdv_id`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `etablissements`
--

DROP TABLE IF EXISTS `etablissements`;
CREATE TABLE IF NOT EXISTS `etablissements` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'hopital',
  `adresse` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ville` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telephone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `statut` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'actif',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `etablissements`
--

INSERT INTO `etablissements` (`id`, `nom`, `type`, `adresse`, `ville`, `telephone`, `email`, `statut`, `created_at`) VALUES
(27, 'MAMAlife2', 'hopital', '', 'Natitingou', '', 'kekogilbert43@gmail.com', 'actif', '2026-05-11 16:33:23');

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
  `type_examen` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `urgence` tinyint(1) DEFAULT '0',
  `statut` enum('demande','en_cours','termine','transmis') COLLATE utf8mb4_unicode_ci DEFAULT 'demande',
  `resultat` text COLLATE utf8mb4_unicode_ci,
  `fichier_resultat` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date_demande` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `date_resultat` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `patient_id` (`patient_id`),
  KEY `medecin_id` (`medecin_id`),
  KEY `consultation_id` (`consultation_id`)
) ENGINE=MyISAM AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `messages`
--

DROP TABLE IF EXISTS `messages`;
CREATE TABLE IF NOT EXISTS `messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `expediteur_id` int NOT NULL,
  `destinataire_id` int NOT NULL,
  `objet` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contenu` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `lu` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `expediteur_id` (`expediteur_id`),
  KEY `destinataire_id` (`destinataire_id`)
) ENGINE=MyISAM AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `utilisateur_id` int NOT NULL,
  `titre` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `message` text COLLATE utf8mb4_unicode_ci,
  `type` enum('info','success','warning','error') COLLATE utf8mb4_unicode_ci DEFAULT 'info',
  `lu` tinyint(1) DEFAULT '0',
  `lien` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `utilisateur_id` (`utilisateur_id`)
) ENGINE=MyISAM AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `password_resets`
--

DROP TABLE IF EXISTS `password_resets`;
CREATE TABLE IF NOT EXISTS `password_resets` (
  `id` int NOT NULL AUTO_INCREMENT,
  `utilisateur_id` int NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
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
  `numero_dossier` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nom` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `prenom` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `date_naissance` date DEFAULT NULL,
  `sexe` enum('M','F','Autre') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telephone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `adresse` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `groupe_sanguin` enum('A+','A-','B+','B-','AB+','AB-','O+','O-') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `allergies` text COLLATE utf8mb4_unicode_ci,
  `antecedents` text COLLATE utf8mb4_unicode_ci,
  `etablissement_id` int DEFAULT NULL,
  `utilisateur_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `numero_dossier` (`numero_dossier`),
  KEY `etablissement_id` (`etablissement_id`),
  KEY `utilisateur_id` (`utilisateur_id`)
) ENGINE=MyISAM AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
  `statut` enum('active','terminee','annulee') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `consultation_id` (`consultation_id`),
  KEY `patient_id` (`patient_id`),
  KEY `medecin_id` (`medecin_id`)
) ENGINE=MyISAM AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `prescriptions`
--

INSERT INTO `prescriptions` (`id`, `consultation_id`, `patient_id`, `medecin_id`, `date_prescription`, `statut`, `created_at`) VALUES
(1, 1, 1, 2, '2026-05-06', 'active', '2026-05-06 16:40:06'),
(2, 2, 2, 2, '2026-05-06', 'active', '2026-05-06 16:40:06'),
(3, 3, 1, 2, '2026-05-06', 'active', '2026-05-06 16:40:06'),
(4, NULL, 1, 2, '2026-05-07', 'active', '2026-05-07 16:46:29'),
(5, NULL, 1, 7, '2026-05-10', 'active', '2026-05-10 13:22:44');

-- --------------------------------------------------------

--
-- Structure de la table `prescription_medicaments`
--

DROP TABLE IF EXISTS `prescription_medicaments`;
CREATE TABLE IF NOT EXISTS `prescription_medicaments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `prescription_id` int NOT NULL,
  `nom_medicament` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `posologie` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `duree` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `instructions` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  KEY `prescription_id` (`prescription_id`)
) ENGINE=MyISAM AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
  `motif` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `statut` enum('planifie','confirme','annule','termine') COLLATE utf8mb4_unicode_ci DEFAULT 'planifie',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `patient_id` (`patient_id`),
  KEY `medecin_id` (`medecin_id`),
  KEY `secretaire_id` (`secretaire_id`)
) ENGINE=MyISAM AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
CREATE TABLE IF NOT EXISTS `sessions` (
  `id` varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL,
  `utilisateur_id` int NOT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `utilisateur_id` (`utilisateur_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `sessions`
--

INSERT INTO `sessions` (`id`, `utilisateur_id`, `ip_address`, `user_agent`, `expires_at`, `created_at`) VALUES
('da52f1c9dc52293eaceab5b70c3be48ccaf64dbe7e82bd629096b461a7ff1d99', 1, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-05-12 00:56:44', '2026-05-11 17:56:44');

-- --------------------------------------------------------

--
-- Structure de la table `settings`
--

DROP TABLE IF EXISTS `settings`;
CREATE TABLE IF NOT EXISTS `settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cle` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `valeur` text COLLATE utf8mb4_unicode_ci,
  `groupe` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'general',
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
  `motif` text COLLATE utf8mb4_unicode_ci,
  `statut` enum('en_attente','accepte','refuse','transfere') COLLATE utf8mb4_unicode_ci DEFAULT 'en_attente',
  `type` enum('envoi','reception') COLLATE utf8mb4_unicode_ci NOT NULL,
  `priorite` enum('normale','urgente') COLLATE utf8mb4_unicode_ci DEFAULT 'normale',
  `documents_joints` json DEFAULT NULL,
  `notes_gestionnaire` text COLLATE utf8mb4_unicode_ci,
  `date_demande` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `date_traitement` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `patient_id` (`patient_id`),
  KEY `gestionnaire_id` (`gestionnaire_id`),
  KEY `etablissement_source_id` (`etablissement_source_id`),
  KEY `etablissement_dest_id` (`etablissement_dest_id`)
) ENGINE=MyISAM AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `utilisateurs`
--

DROP TABLE IF EXISTS `utilisateurs`;
CREATE TABLE IF NOT EXISTS `utilisateurs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `prenom` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mot_de_passe` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('admin','medecin','secretaire','labo','patient','gestionnaire') COLLATE utf8mb4_unicode_ci NOT NULL,
  `etablissement_id` int DEFAULT NULL,
  `telephone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `actif` tinyint(1) DEFAULT '1',
  `photo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `etablissement_id` (`etablissement_id`)
) ENGINE=MyISAM AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `utilisateurs`
--

INSERT INTO `utilisateurs` (`id`, `nom`, `prenom`, `email`, `mot_de_passe`, `role`, `etablissement_id`, `telephone`, `actif`, `photo`, `created_at`) VALUES
(1, 'Admin', 'Système', 'admin@carnetplus.com', '$2y$10$ZZ5otFvXdJKYzdPB6Jb8iO5GvWjwzItZKnTGIFOEH48vFAnrgU3bS', 'admin', 1, '+229 97 00 00 00', 1, NULL, '2026-05-06 16:40:06'),
(9, 'Nom', 'GILBERT', 'kekogilbert43@gmail.com', '$2y$10$XjGobUrk1qFiWsutyrLid.H/Qt3T3RsBguRRK1KqWiYXAaULLAvsq', 'gestionnaire', 27, NULL, 1, NULL, '2026-05-11 16:33:23');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
