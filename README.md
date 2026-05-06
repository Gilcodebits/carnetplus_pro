# 🏥 CarnetPlus v2.0 — Plateforme de Santé

## Structure du projet

```
carnetplus_pro/
├── src/                  ← Frontend React + TypeScript
│   ├── screens/          ← Tous les écrans par rôle
│   ├── components/       ← Composants réutilisables
│   ├── services/api.ts   ← Couche API (fetch vers PHP)
│   └── contexts/         ← AuthContext (session)
├── backend/
│   ├── api/              ← Endpoints PHP REST
│   │   ├── auth.php          (connexion / session)
│   │   ├── patients.php      (CRUD patients)
│   │   ├── consultations.php (consultations médecin)
│   │   ├── rdv.php           (rendez-vous)
│   │   ├── prescriptions.php (ordonnances)
│   │   ├── examens.php       (demandes labo)
│   │   ├── transferts.php    (transferts dossiers)
│   │   ├── notifications.php
│   │   ├── messages.php
│   │   └── dashboard.php
│   └── config/
│       ├── database.php  (connexion PDO)
│       ├── auth.php      (tokens session)
│       └── cors.php      (headers HTTP)
└── database/
    └── carnetplus.sql    ← Script SQL complet

```

## Installation

### 1. Base de données (MySQL)
```sql
mysql -u root -p < database/carnetplus.sql
```

### 2. Backend PHP
Copier le dossier `backend/` dans votre serveur web :
```
XAMPP : C:/xampp/htdocs/carnetplus/
WAMP  : C:/wamp64/www/carnetplus/
```
URL backend : `http://localhost/carnetplus/`

Éditer `backend/config/database.php` si nécessaire :
```php
define('DB_USER', 'root');
define('DB_PASS', 'votre_mot_de_passe');
```

Éditer `src/services/api.ts` pour pointer vers votre backend :
```ts
const BASE = 'http://localhost/carnetplus/api';
```

### 3. Frontend React
```bash
npm install
npm run dev     # Dev : http://localhost:5173
npm run build   # Production dans dist/
```

## Comptes de démonstration

| Rôle         | Email                         | Mot de passe  |
|--------------|-------------------------------|---------------|
| Médecin      | medecin@carnetplus.bj         | password123   |
| Patient      | patient@carnetplus.bj         | password123   |
| Secrétaire   | secretaire@carnetplus.bj      | password123   |
| Laboratoire  | labo@carnetplus.bj            | password123   |
| Gestionnaire | gestionnaire@carnetplus.bj    | password123   |
| Admin        | admin@carnetplus.bj           | password123   |

## Rôles & fonctionnalités

| Rôle          | Fonctionnalités principales |
|---------------|-----------------------------|
| **Médecin**   | Patients, consultations, prescriptions, examens |
| **Secrétaire**| Enregistrement patients, planification RDV, confirmation |
| **Labo**      | Réception demandes, saisie résultats, transmission |
| **Patient**   | RDV en ligne, assistant IA, bilan santé, dossier |
| **Gestionnaire** | Transferts dossiers inter-établissements (envoi/réception) |
| **Admin**     | Tableau de bord global, gestion utilisateurs |

## Cas d'utilisation implémentés

✅ Se connecter (avec gestion rôle + session sécurisée)
✅ Enregistrer un patient (numéro dossier auto, doublon détecté)
✅ Enregistrer une consultation (constantes + diagnostic)
✅ Planifier RDV (vérification disponibilité médecin)
✅ Prescrire un traitement (médicaments + posologie)
✅ Demander examen médical (transmission labo + notification)
✅ Transfert de dossiers médicaux (Gestionnaire)

