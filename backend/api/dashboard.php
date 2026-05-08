<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/auth.php';

$user = requireAuth();
$db   = getDB();
$etabId = $user['etablissement_id'] ?? 1;

$stats = [];

if (in_array($user['role'], ['admin'])) {
    $stats['patients']      = (int)$db->query("SELECT COUNT(*) FROM patients")->fetchColumn();
    $stats['medecins']      = (int)$db->query("SELECT COUNT(*) FROM utilisateurs WHERE role='medecin'")->fetchColumn();
    $stats['consultations'] = (int)$db->query("SELECT COUNT(*) FROM consultations")->fetchColumn(); // Total consultations
    $stats['rdv_today']     = (int)$db->query("SELECT COUNT(*) FROM rendez_vous WHERE date_rdv=CURDATE()")->fetchColumn();
    
    // Fetch recent audit logs for Admin
    $stmt = $db->query("
        SELECT a.*, CONCAT(u.prenom, ' ', u.nom) as utilisateur_nom
        FROM audit_logs a
        LEFT JOIN utilisateurs u ON a.utilisateur_id = u.id
        ORDER BY a.created_at DESC
        LIMIT 5
    ");
    $stats['logs'] = $stmt->fetchAll() ?: [];
}
elseif ($user['role'] === 'medecin') {
    $uid = $user['id'];
    $stats['mes_patients']   = (int)$db->query("SELECT COUNT(DISTINCT patient_id) FROM consultations WHERE medecin_id=$uid")->fetchColumn();
    $stats['rdv_today']      = (int)$db->query("SELECT COUNT(*) FROM rendez_vous WHERE medecin_id=$uid AND date_rdv=CURDATE() AND statut!='annule'")->fetchColumn();
    $stats['consultations_semaine'] = (int)$db->query("SELECT COUNT(*) FROM consultations WHERE medecin_id=$uid AND WEEK(date_consultation)=WEEK(NOW())")->fetchColumn();
    $stats['prescriptions_actives'] = (int)$db->query("SELECT COUNT(*) FROM prescriptions WHERE medecin_id=$uid AND statut='active'")->fetchColumn();
    
    $stmt = $db->prepare("
        SELECT r.*, CONCAT(p.prenom,' ',p.nom) as patient_nom
        FROM rendez_vous r JOIN patients p ON r.patient_id=p.id
        WHERE r.medecin_id=? AND r.date_rdv=CURDATE() AND r.statut!='annule'
        ORDER BY r.heure_rdv
    ");
    $stmt->execute([$uid]);
    $stats['rdv_liste'] = $stmt->fetchAll() ?: [];
}
elseif ($user['role'] === 'secretaire') {
    $stats['rdv_today']     = (int)$db->query("SELECT COUNT(*) FROM rendez_vous WHERE date_rdv=CURDATE()")->fetchColumn();
    $stats['rdv_attente']   = (int)$db->query("SELECT COUNT(*) FROM rendez_vous WHERE statut='planifie' AND date_rdv>=CURDATE()")->fetchColumn();
    $stats['patients_total']= (int)$db->query("SELECT COUNT(*) FROM patients WHERE etablissement_id=$etabId")->fetchColumn();
    
    $stmt = $db->prepare("
        SELECT r.*, CONCAT(p.prenom,' ',p.nom) as patient_nom,
               CONCAT(m.prenom,' ',m.nom) as medecin_nom
        FROM rendez_vous r JOIN patients p ON r.patient_id=p.id JOIN utilisateurs m ON r.medecin_id=m.id
        WHERE r.date_rdv=CURDATE() ORDER BY r.heure_rdv
    ");
    $stmt->execute();
    $stats['rdv_liste'] = $stmt->fetchAll() ?: [];
}
elseif ($user['role'] === 'labo') {
    $stats['demandes']    = (int)$db->query("SELECT COUNT(*) FROM examens WHERE statut='demande'")->fetchColumn();
    $stats['en_cours']    = (int)$db->query("SELECT COUNT(*) FROM examens WHERE statut='en_cours'")->fetchColumn();
    $stats['termines']    = (int)$db->query("SELECT COUNT(*) FROM examens WHERE statut='termine' AND DATE(date_resultat)=CURDATE()")->fetchColumn();
    $stats['urgents']     = (int)$db->query("SELECT COUNT(*) FROM examens WHERE urgence=1 AND statut IN('demande','en_cours')")->fetchColumn();
    $stats['patients_total'] = (int)$db->query("SELECT COUNT(DISTINCT patient_id) FROM examens")->fetchColumn();
    
    // Activité des 7 derniers jours
    $stmt = $db->query("
        SELECT DATE_FORMAT(date_demande, '%d/%m') as jour, COUNT(*) as total 
        FROM examens 
        WHERE date_demande >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
        GROUP BY DATE(date_demande)
        ORDER BY date_demande ASC
    ");
    $stats['activite_semaine'] = $stmt->fetchAll() ?: [];
}
elseif ($user['role'] === 'gestionnaire') {
    $uid = $user['id'];
    $stats['en_attente']  = (int)$db->query("SELECT COUNT(*) FROM transferts_dossiers WHERE gestionnaire_id=$uid AND statut='en_attente'")->fetchColumn();
    $stats['acceptes']    = (int)$db->query("SELECT COUNT(*) FROM transferts_dossiers WHERE gestionnaire_id=$uid AND statut='accepte'")->fetchColumn();
    $stats['transferes']  = (int)$db->query("SELECT COUNT(*) FROM transferts_dossiers WHERE gestionnaire_id=$uid AND statut='transfere'")->fetchColumn();
    $stats['urgents']     = (int)$db->query("SELECT COUNT(*) FROM transferts_dossiers WHERE gestionnaire_id=$uid AND priorite='urgente' AND statut='en_attente'")->fetchColumn();
}
elseif ($user['role'] === 'patient') {
    $uid = $user['id'];
    
    // Infos patient
    $stmt = $db->prepare("SELECT * FROM patients WHERE utilisateur_id = ?");
    $stmt->execute([$uid]);
    $patient = $stmt->fetch();
    $stats['patient'] = $patient;

    if ($patient) {
        $pid = $patient['id'];
        
        // Prochain RDV
        $stmt = $db->prepare("
            SELECT r.*, CONCAT(m.prenom,' ',m.nom) as medecin_nom
            FROM rendez_vous r JOIN utilisateurs m ON r.medecin_id=m.id
            WHERE r.patient_id=? AND r.date_rdv>=CURDATE() AND r.statut!='annule'
            ORDER BY r.date_rdv ASC, r.heure_rdv ASC LIMIT 1
        ");
        $stmt->execute([$pid]);
        $stats['prochain_rdv'] = $stmt->fetch() ?: null;

        // Prescriptions
        $stmt = $db->prepare("
            SELECT pr.*, CONCAT(m.prenom,' ',m.nom) as medecin_nom
            FROM prescriptions pr JOIN utilisateurs m ON pr.medecin_id=m.id
            WHERE pr.patient_id=? ORDER BY pr.created_at DESC LIMIT 5
        ");
        $stmt->execute([$pid]);
        $stats['prescriptions'] = $stmt->fetchAll() ?: [];

        // Examens
        $stmt = $db->prepare("
            SELECT e.*, CONCAT(m.prenom,' ',m.nom) as medecin_nom
            FROM examens e JOIN utilisateurs m ON e.medecin_id=m.id
            WHERE e.patient_id=? ORDER BY e.date_demande DESC LIMIT 5
        ");
        $stmt->execute([$pid]);
        $stats['examens'] = $stmt->fetchAll() ?: [];

        $stats['documents_count'] = count($stats['prescriptions']) + count($stats['examens']);
        $stats['score_sante'] = 85; // Mock score for now
    } else {
        // Si pas de profil patient encore, on renvoie quand même le nom de l'utilisateur
        $stats['patient'] = [
            'prenom' => $user['prenom'],
            'nom'    => $user['nom']
        ];
        $stats['score_sante'] = 0;
        $stats['documents_count'] = 0;
    }
}

echo json_encode($stats);
