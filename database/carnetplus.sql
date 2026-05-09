-- ============================================================
--  CarnetPlus — Base de données complète
--  Charset : utf8mb4  |  Moteur : InnoDB
-- ============================================================
CREATE DATABASE IF NOT EXISTS carnetplus CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE carnetplus;

-- ── Établissements ──────────────────────────────────────────
CREATE TABLE etablissements (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  nom         VARCHAR(150) NOT NULL,
  adresse     VARCHAR(255),
  ville       VARCHAR(100),
  telephone   VARCHAR(20),
  email       VARCHAR(100),
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── Utilisateurs ────────────────────────────────────────────
CREATE TABLE utilisateurs (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  nom             VARCHAR(80)  NOT NULL,
  prenom          VARCHAR(80)  NOT NULL,
  email           VARCHAR(150) NOT NULL UNIQUE,
  mot_de_passe    VARCHAR(255) NOT NULL,          -- bcrypt
  role            ENUM('admin','medecin','secretaire','labo','patient','gestionnaire') NOT NULL,
  etablissement_id INT,
  telephone       VARCHAR(20),
  actif           TINYINT(1) DEFAULT 1,
  photo           VARCHAR(255),
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (etablissement_id) REFERENCES etablissements(id) ON DELETE SET NULL
);

-- ── Patients ────────────────────────────────────────────────
CREATE TABLE patients (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  numero_dossier   VARCHAR(20) NOT NULL UNIQUE,   -- généré auto
  nom              VARCHAR(80) NOT NULL,
  prenom           VARCHAR(80) NOT NULL,
  date_naissance   DATE,
  sexe             ENUM('M','F','Autre'),
  email            VARCHAR(150),
  telephone        VARCHAR(20),
  adresse          VARCHAR(255),
  groupe_sanguin   ENUM('A+','A-','B+','B-','AB+','AB-','O+','O-'),
  allergies        TEXT,
  antecedents      TEXT,
  etablissement_id INT,
  utilisateur_id   INT,                           -- compte patient lié
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (etablissement_id) REFERENCES etablissements(id) ON DELETE SET NULL,
  FOREIGN KEY (utilisateur_id)   REFERENCES utilisateurs(id)  ON DELETE SET NULL
);

-- ── Rendez-vous ─────────────────────────────────────────────
CREATE TABLE rendez_vous (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  patient_id      INT NOT NULL,
  medecin_id      INT NOT NULL,
  secretaire_id   INT,
  date_rdv        DATE NOT NULL,
  heure_rdv       TIME NOT NULL,
  motif           VARCHAR(255),
  statut          ENUM('planifie','confirme','annule','termine') DEFAULT 'planifie',
  notes           TEXT,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id)    REFERENCES patients(id)      ON DELETE CASCADE,
  FOREIGN KEY (medecin_id)    REFERENCES utilisateurs(id)  ON DELETE CASCADE,
  FOREIGN KEY (secretaire_id) REFERENCES utilisateurs(id)  ON DELETE SET NULL
);

-- ── Consultations ───────────────────────────────────────────
CREATE TABLE consultations (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  patient_id      INT NOT NULL,
  medecin_id      INT NOT NULL,
  rdv_id          INT,
  motif           VARCHAR(255),
  symptomes       TEXT,
  diagnostic      TEXT,
  traitement      TEXT,
  observations    TEXT,
  tension         VARCHAR(20),
  temperature     DECIMAL(4,1),
  poids           DECIMAL(5,2),
  taille          DECIMAL(5,2),
  date_consultation DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id)     ON DELETE CASCADE,
  FOREIGN KEY (medecin_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
  FOREIGN KEY (rdv_id)     REFERENCES rendez_vous(id)  ON DELETE SET NULL
);

-- ── Prescriptions ───────────────────────────────────────────
CREATE TABLE prescriptions (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  consultation_id  INT NOT NULL,
  patient_id       INT NOT NULL,
  medecin_id       INT NOT NULL,
  date_prescription DATE DEFAULT (CURRENT_DATE),
  statut           ENUM('active','terminee','annulee') DEFAULT 'active',
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (consultation_id) REFERENCES consultations(id) ON DELETE CASCADE,
  FOREIGN KEY (patient_id)      REFERENCES patients(id)      ON DELETE CASCADE,
  FOREIGN KEY (medecin_id)      REFERENCES utilisateurs(id)  ON DELETE CASCADE
);

CREATE TABLE prescription_medicaments (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  prescription_id INT NOT NULL,
  nom_medicament  VARCHAR(150) NOT NULL,
  posologie       VARCHAR(255),
  duree           VARCHAR(100),
  instructions    TEXT,
  FOREIGN KEY (prescription_id) REFERENCES prescriptions(id) ON DELETE CASCADE
);

-- ── Examens / Labo ──────────────────────────────────────────
CREATE TABLE examens (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  patient_id      INT NOT NULL,
  medecin_id      INT NOT NULL,
  consultation_id INT,
  type_examen     VARCHAR(150) NOT NULL,
  description     TEXT,
  urgence         TINYINT(1) DEFAULT 0,
  statut          ENUM('demande','en_cours','termine','transmis') DEFAULT 'demande',
  resultat        TEXT,
  fichier_resultat VARCHAR(255),
  date_demande    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  date_resultat   TIMESTAMP NULL,
  FOREIGN KEY (patient_id)      REFERENCES patients(id)      ON DELETE CASCADE,
  FOREIGN KEY (medecin_id)      REFERENCES utilisateurs(id)  ON DELETE CASCADE,
  FOREIGN KEY (consultation_id) REFERENCES consultations(id) ON DELETE SET NULL
);

-- ── Transferts de dossiers (Gestionnaire) ───────────────────
CREATE TABLE transferts_dossiers (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  patient_id          INT NOT NULL,
  gestionnaire_id     INT NOT NULL,
  etablissement_source_id INT NOT NULL,
  etablissement_dest_id   INT NOT NULL,
  motif               TEXT,
  statut              ENUM('en_attente','accepte','refuse','transfere') DEFAULT 'en_attente',
  type                ENUM('envoi','reception') NOT NULL,
  priorite            ENUM('normale','urgente') DEFAULT 'normale',
  documents_joints    JSON,                      -- liste de fichiers
  notes_gestionnaire  TEXT,
  date_demande        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  date_traitement     TIMESTAMP NULL,
  FOREIGN KEY (patient_id)              REFERENCES patients(id)      ON DELETE CASCADE,
  FOREIGN KEY (gestionnaire_id)         REFERENCES utilisateurs(id)  ON DELETE CASCADE,
  FOREIGN KEY (etablissement_source_id) REFERENCES etablissements(id) ON DELETE CASCADE,
  FOREIGN KEY (etablissement_dest_id)   REFERENCES etablissements(id) ON DELETE CASCADE
);

-- ── Notifications ───────────────────────────────────────────
CREATE TABLE notifications (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  utilisateur_id  INT NOT NULL,
  titre           VARCHAR(255),
  message         TEXT,
  type            ENUM('info','success','warning','error') DEFAULT 'info',
  lu              TINYINT(1) DEFAULT 0,
  lien            VARCHAR(255),
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE
);

-- ── Messages ────────────────────────────────────────────────
CREATE TABLE messages (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  expediteur_id   INT NOT NULL,
  destinataire_id INT NOT NULL,
  objet           VARCHAR(255),
  contenu         TEXT NOT NULL,
  lu              TINYINT(1) DEFAULT 0,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (expediteur_id)   REFERENCES utilisateurs(id) ON DELETE CASCADE,
  FOREIGN KEY (destinataire_id) REFERENCES utilisateurs(id) ON DELETE CASCADE
);

-- ── Sessions ────────────────────────────────────────────────
CREATE TABLE sessions (
  id              VARCHAR(128) PRIMARY KEY,
  utilisateur_id  INT NOT NULL,
  ip_address      VARCHAR(45),
  user_agent      TEXT,
  expires_at      TIMESTAMP,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE
);

-- ── Logs d'audit ────────────────────────────────────────────
CREATE TABLE audit_logs (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  utilisateur_id  INT,
  action          VARCHAR(100),
  table_cible     VARCHAR(100),
  id_cible        INT,
  details         JSON,
  ip              VARCHAR(45),
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── Demandes d'adhésion (Onboarding) ────────────────────────
CREATE TABLE demandes_adhesion (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  nom_etablissement VARCHAR(150) NOT NULL,
  type_structure  ENUM('hopital','clinique','cabinet','laboratoire') NOT NULL,
  adresse         VARCHAR(255),
  ville           VARCHAR(100),
  nom_responsable VARCHAR(150),
  email_contact   VARCHAR(150) NOT NULL,
  telephone       VARCHAR(20),
  motif           TEXT,
  statut          ENUM('en_attente','approuve','rejete') DEFAULT 'en_attente',
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
--  Données de démonstration
-- ============================================================
INSERT INTO etablissements (nom, adresse, ville, telephone, email) VALUES
('Hôpital Central de Cotonou',     'Avenue Jean-Paul II',         'Cotonou',      '+229 21 30 01 00', 'contact@hcc.com'),
('Clinique Sainte-Marie',          '12 Rue des Palmiers',         'Porto-Novo',   '+229 20 21 32 00', 'info@csm.com'),
('Centre Médical du Littoral',     '45 Boulevard de la Marina',   'Cotonou',      '+229 21 31 45 00', 'cml@sante.com'),
('Polyclinique Les Cocotiers',     '8 Rue de l\'Indépendance',    'Parakou',      '+229 23 61 00 12', 'cocotiers@sante.com');

-- Mot de passe : "password123" (bcrypt hash)
INSERT INTO utilisateurs (nom, prenom, email, mot_de_passe, role, etablissement_id, telephone) VALUES
('Admin',      'Système',     'admin@carnetplus.com',        '$2y$10$6pZ0S6pZ0S6pZ0S6pZ0S6ueP6Z0S6pZ0S6pZ0S6pZ0S6pZ0S6pZ0S', 'admin',         1, '+229 97 00 00 00'),
('Rousseau',   'Alain',       'medecin@carnetplus.com',      '$2y$10$6pZ0S6pZ0S6pZ0S6pZ0S6ueP6Z0S6pZ0S6pZ0S6pZ0S6pZ0S6pZ0S', 'medecin',       1, '+229 97 11 22 33'),
('Adjovi',     'Carine',      'secretaire@carnetplus.com',   '$2y$10$6pZ0S6pZ0S6pZ0S6pZ0S6ueP6Z0S6pZ0S6pZ0S6pZ0S6pZ0S6pZ0S', 'secretaire',    1, '+229 96 22 33 44'),
('Hounsa',     'Serge',       'labo@carnetplus.com',         '$2y$10$6pZ0S6pZ0S6pZ0S6pZ0S6ueP6Z0S6pZ0S6pZ0S6pZ0S6pZ0S6pZ0S', 'labo',          1, '+229 95 33 44 55'),
('Dubois',     'Marie',       'patient@carnetplus.com',      '$2y$10$6pZ0S6pZ0S6pZ0S6pZ0S6ueP6Z0S6pZ0S6pZ0S6pZ0S6pZ0S6pZ0S', 'patient',       1, '+229 97 55 66 77'),
('Kpossou',    'Lionel',      'gestionnaire@carnetplus.com', '$2y$10$6pZ0S6pZ0S6pZ0S6pZ0S6ueP6Z0S6pZ0S6pZ0S6pZ0S6pZ0S6pZ0S', 'gestionnaire',  1, '+229 96 66 77 88');

INSERT INTO patients (numero_dossier, nom, prenom, date_naissance, sexe, email, telephone, adresse, groupe_sanguin, allergies, antecedents, etablissement_id, utilisateur_id) VALUES
('DOS-2026-001', 'Dubois',   'Marie',   '1981-03-12', 'F', 'patient@carnetplus.com',   '+229 97 55 66 77', 'Quartier Akpakpa, Cotonou',   'A+', 'Pénicilline',      'Hypertension',          1, 5),
('DOS-2026-002', 'Martin',   'Jean',    '1964-07-25', 'M', 'jean.martin@email.com',   '+229 96 44 55 66', 'Rue de la Paix, Porto-Novo',  'O+', 'Aspirine',         'Diabète type 2',        1, NULL),
('DOS-2026-003', 'Laurent',  'Sophie',  '1992-11-08', 'F', 'sophie.l@email.com',      '+229 95 33 44 55', 'Cadjehoun, Cotonou',           'B+', 'Aucune connue',    'Asthme',                1, NULL),
('DOS-2026-004', 'Houngbo',  'Pierre',  '1968-02-20', 'M', 'p.houngbo@email.com',     '+229 94 22 33 44', 'Fidjrossè, Cotonou',           'AB+','Sulfamides',       'Hypertension, Obésité', 1, NULL),
('DOS-2026-005', 'Amoussou', 'Claire',  '1995-05-14', 'F', 'claire.a@email.com',      '+229 93 11 22 33', 'Zogbohouè, Cotonou',           'A-', 'Aucune connue',    'Aucun',                 2, NULL);

INSERT INTO rendez_vous (patient_id, medecin_id, secretaire_id, date_rdv, heure_rdv, motif, statut) VALUES
(1, 2, 3, '2026-05-05', '09:00:00', 'Consultation générale',       'confirme'),
(2, 2, 3, '2026-05-05', '10:30:00', 'Contrôle diabète',            'confirme'),
(3, 2, 3, '2026-05-05', '14:00:00', 'Bilan annuel',                'planifie'),
(4, 2, 3, '2026-05-06', '09:30:00', 'Renouvellement ordonnance',   'planifie'),
(5, 2, 3, '2026-05-06', '11:00:00', 'Consultation générale',       'planifie');

INSERT INTO consultations (patient_id, medecin_id, motif, symptomes, diagnostic, traitement, tension, temperature, poids, taille) VALUES
(1, 2, 'Consultation générale', 'Maux de tête, fatigue', 'Hypertension légère', 'Repos, hydratation', '130/85', 37.2, 65.0, 168.0),
(2, 2, 'Contrôle diabète',      'Soif excessive, fatigue', 'Diabète type 2 stable', 'Continuer metformine', '125/80', 36.8, 82.0, 174.0),
(1, 2, 'Grippe',                'Fièvre, toux, courbatures', 'Syndrome grippal', 'Paracétamol, repos 3 jours', '120/80', 38.5, 65.0, 168.0);

INSERT INTO prescriptions (consultation_id, patient_id, medecin_id) VALUES
(1, 1, 2), (2, 2, 2), (3, 1, 2);

INSERT INTO prescription_medicaments (prescription_id, nom_medicament, posologie, duree) VALUES
(1, 'Paracétamol 1g',   '1 comprimé × 3/jour', '7 jours'),
(1, 'Amlodipine 5mg',   '1 comprimé/matin',    '30 jours'),
(2, 'Metformine 500mg', '1 comprimé × 2/jour', '30 jours'),
(3, 'Paracétamol 500mg','1 comprimé × 3/jour', '5 jours'),
(3, 'Amoxicilline 1g',  '1 comprimé × 2/jour', '7 jours');

INSERT INTO examens (patient_id, medecin_id, type_examen, description, urgence, statut) VALUES
(1, 2, 'Prise de sang',   'Numération formule sanguine complète', 0, 'termine'),
(2, 2, 'Glycémie à jeun', 'Contrôle diabète',                    0, 'transmis'),
(3, 2, 'Radio pulmonaire','Suspicion asthme',                     0, 'en_cours'),
(4, 2, 'ECG',             'Contrôle cardiaque',                   1, 'demande'),
(5, 2, 'IRM cérébrale',   'Maux de tête récurrents',              1, 'demande');

INSERT INTO transferts_dossiers (patient_id, gestionnaire_id, etablissement_source_id, etablissement_dest_id, motif, statut, type, priorite) VALUES
(1, 6, 1, 2, 'Spécialiste en cardiologie requis',         'en_attente', 'envoi',    'normale'),
(3, 6, 1, 3, 'Transfert pour chirurgie programmée',       'accepte',    'envoi',    'urgente'),
(5, 6, 2, 1, 'Retour établissement d''origine',           'transfere',  'reception','normale'),
(2, 6, 1, 4, 'Suivi diabétologie spécialisée',            'en_attente', 'envoi',    'normale');

INSERT INTO notifications (utilisateur_id, titre, message, type) VALUES
(2, 'Nouveau RDV',              'Marie Dubois a un RDV le 05/05 à 09h00',     'info'),
(3, 'RDV à confirmer',          'Jean Martin attend confirmation pour le 05/05','warning'),
(5, 'Résultats disponibles',    'Vos résultats de prise de sang sont prêts',   'success'),
(6, 'Transfert à traiter',      'Nouvelle demande de transfert reçue (DOS-2026-001)', 'info'),
(2, 'Prescription à renouveler','Pierre Houngbo : ordonnance expirée',         'warning');

INSERT INTO messages (expediteur_id, destinataire_id, objet, contenu) VALUES
(2, 5, 'Votre ordonnance',        'Bonjour Marie, votre ordonnance est prête à récupérer au cabinet.'),
(5, 2, 'Re: Votre ordonnance',    'Merci docteur, je passerai demain matin.'),
(3, 2, 'Confirmation RDV',        'Dr. Rousseau, le RDV de Mme Dubois du 05/05 est confirmé.');

