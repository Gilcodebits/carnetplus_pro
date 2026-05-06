<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/auth.php';

$user = requireAuth();
$db   = getDB();
$etabId = $user['etablissement_id'];

$stats = [];

if (in_array($user['role'], ['admin'])) {
    $stats['patients']      = $db->query("SELECT COUNT(*) FROM patients")->fetchColumn();
    $stats['medecins']      = $db->query("SELECT COUNT(*) FROM utilisateurs WHERE role='medecin'")->fetchColumn();
    $stats['consultations'] = $db->query("SELECT COUNT(*) FROM consultations WHERE DATE(date_consultation)=CURDATE()")->fetchColumn();
    $stats['rdv_today']     = $db->query("SELECT COUNT(*) FROM rendez_vous WHERE date_rdv=CURDATE()")->fetchColumn();
}
elseif ($user['role'] === 'medecin') {
    $uid = $user['id'];
    $stats['mes_patients']   = $db->query("SELECT COUNT(DISTINCT patient_id) FROM consultations WHERE medecin_id=$uid")->fetchColumn();
    $stats['rdv_today']      = $db->query("SELECT COUNT(*) FROM rendez_vous WHERE medecin_id=$uid AND date_rdv=CURDATE() AND statut!='annule'")->fetchColumn();
    $stats['consultations_semaine'] = $db->query("SELECT COUNT(*) FROM consultations WHERE medecin_id=$uid AND WEEK(date_consultation)=WEEK(NOW())")->fetchColumn();
    $stats['prescriptions_actives'] = $db->query("SELECT COUNT(*) FROM prescriptions WHERE medecin_id=$uid AND statut='active'")->fetchColumn();
    // RDV du jour
    $stmt = $db->prepare("
        SELECT r.*, CONCAT(p.prenom,' ',p.nom) as patient_nom
        FROM rendez_vous r JOIN patients p ON r.patient_id=p.id
        WHERE r.medecin_id=? AND r.date_rdv=CURDATE() AND r.statut!='annule'
        ORDER BY r.heure_rdv
    ");
    $stmt->execute([$uid]);
    $stats['rdv_liste'] = $stmt->fetchAll();
}
elseif ($user['role'] === 'secretaire') {
    $stats['rdv_today']     = $db->query("SELECT COUNT(*) FROM rendez_vous WHERE date_rdv=CURDATE()")->fetchColumn();
    $stats['rdv_attente']   = $db->query("SELECT COUNT(*) FROM rendez_vous WHERE statut='planifie' AND date_rdv>=CURDATE()")->fetchColumn();
    $stats['patients_total']= $db->query("SELECT COUNT(*) FROM patients WHERE etablissement_id=$etabId")->fetchColumn();
    $stmt = $db->prepare("
        SELECT r.*, CONCAT(p.prenom,' ',p.nom) as patient_nom,
               CONCAT(m.prenom,' ',m.nom) as medecin_nom
        FROM rendez_vous r JOIN patients p ON r.patient_id=p.id JOIN utilisateurs m ON r.medecin_id=m.id
        WHERE r.date_rdv=CURDATE() ORDER BY r.heure_rdv
    ");
    $stmt->execute();
    $stats['rdv_liste'] = $stmt->fetchAll();
}
elseif ($user['role'] === 'labo') {
    $stats['demandes']    = $db->query("SELECT COUNT(*) FROM examens WHERE statut='demande'")->fetchColumn();
    $stats['en_cours']    = $db->query("SELECT COUNT(*) FROM examens WHERE statut='en_cours'")->fetchColumn();
    $stats['termines']    = $db->query("SELECT COUNT(*) FROM examens WHERE statut='termine' AND DATE(date_resultat)=CURDATE()")->fetchColumn();
    $stats['urgents']     = $db->query("SELECT COUNT(*) FROM examens WHERE urgence=1 AND statut IN('demande','en_cours')")->fetchColumn();
}
elseif ($user['role'] === 'gestionnaire') {
    $uid = $user['id'];
    $stats['en_attente']  = $db->query("SELECT COUNT(*) FROM transferts_dossiers WHERE gestionnaire_id=$uid AND statut='en_attente'")->fetchColumn();
    $stats['acceptes']    = $db->query("SELECT COUNT(*) FROM transferts_dossiers WHERE gestionnaire_id=$uid AND statut='accepte'")->fetchColumn();
    $stats['transferes']  = $db->query("SELECT COUNT(*) FROM transferts_dossiers WHERE gestionnaire_id=$uid AND statut='transfere'")->fetchColumn();
    $stats['urgents']     = $db->query("SELECT COUNT(*) FROM transferts_dossiers WHERE gestionnaire_id=$uid AND priorite='urgente' AND statut='en_attente'")->fetchColumn();
}

echo json_encode($stats);
