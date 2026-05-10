<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/auth.php';

$user = requireAuth();
$db   = getDB();
$etabId = $user['etablissement_id'] ?? 1;
$stats  = [];

try {

if (in_array($user['role'], ['admin'])) {
    $stats['patients']      = (int)$db->query("SELECT COUNT(*) FROM patients")->fetchColumn();
    $stats['medecins']      = (int)$db->query("SELECT COUNT(*) FROM utilisateurs WHERE role='medecin'")->fetchColumn();
    $stats['consultations'] = (int)$db->query("SELECT COUNT(*) FROM consultations")->fetchColumn();
    $stats['rdv_today']     = (int)$db->query("SELECT COUNT(*) FROM rendez_vous WHERE date_rdv=CURDATE()")->fetchColumn();
    
    $stmt = $db->query("
        SELECT a.action, a.table_cible, a.ip, a.created_at,
               CONCAT(u.prenom, ' ', u.nom) as utilisateur_nom
        FROM audit_logs a
        LEFT JOIN utilisateurs u ON a.utilisateur_id = u.id
        ORDER BY a.created_at DESC
        LIMIT 5
    ");
    $stats['logs'] = $stmt->fetchAll() ?: [];
}
elseif ($user['role'] === 'medecin') {
    $uid = $user['id'];
    $stats['mes_patients']          = (int)$db->query("SELECT COUNT(DISTINCT patient_id) FROM consultations WHERE medecin_id=$uid")->fetchColumn();
    $stats['rdv_today']             = (int)$db->query("SELECT COUNT(*) FROM rendez_vous WHERE medecin_id=$uid AND date_rdv=CURDATE() AND statut!='annule'")->fetchColumn();
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
    $stats['rdv_today']      = (int)$db->query("SELECT COUNT(*) FROM rendez_vous WHERE date_rdv=CURDATE()")->fetchColumn();
    $stats['rdv_attente']    = (int)$db->query("SELECT COUNT(*) FROM rendez_vous WHERE statut='planifie' AND date_rdv>=CURDATE()")->fetchColumn();
    $stats['patients_total'] = (int)$db->query("SELECT COUNT(*) FROM patients WHERE etablissement_id=$etabId")->fetchColumn();
    
    $stmt = $db->prepare("
        SELECT r.*, CONCAT(p.prenom,' ',p.nom) as patient_nom,
               CONCAT(m.prenom,' ',m.nom) as medecin_nom
        FROM rendez_vous r 
        JOIN patients p ON r.patient_id=p.id 
        JOIN utilisateurs m ON r.medecin_id=m.id
        WHERE r.date_rdv=CURDATE() ORDER BY r.heure_rdv
    ");
    $stmt->execute();
    $stats['rdv_liste'] = $stmt->fetchAll() ?: [];
}
elseif ($user['role'] === 'labo') {
    $stats['demandes']  = (int)$db->query("SELECT COUNT(*) FROM examens WHERE statut='demande'")->fetchColumn();
    $stats['en_cours']  = (int)$db->query("SELECT COUNT(*) FROM examens WHERE statut='en_cours'")->fetchColumn();
    $stats['termines']  = (int)$db->query("SELECT COUNT(*) FROM examens WHERE statut='termine' AND DATE(date_resultat)=CURDATE()")->fetchColumn();
    $stats['urgents']   = (int)$db->query("SELECT COUNT(*) FROM examens WHERE urgence=1 AND statut IN('demande','en_cours')")->fetchColumn();
}
elseif ($user['role'] === 'gestionnaire') {

    // ── Compteurs principaux ─────────────────────────────────
    $stats['en_attente'] = (int)$db->query("SELECT COUNT(*) FROM transferts_dossiers WHERE statut='en_attente'")->fetchColumn();
    $stats['acceptes']   = (int)$db->query("SELECT COUNT(*) FROM transferts_dossiers WHERE statut='accepte'")->fetchColumn();
    $stats['transferes'] = (int)$db->query("SELECT COUNT(*) FROM transferts_dossiers WHERE statut='transfere'")->fetchColumn();
    $stats['urgents']    = (int)$db->query("SELECT COUNT(*) FROM transferts_dossiers WHERE priorite='urgente' AND statut='en_attente'")->fetchColumn();

    // ── Flux récents ─────────────────────────────────────────
    $stmt = $db->query("
        SELECT t.id, t.statut, t.type, t.priorite, t.date_demande, t.motif,
               CONCAT(p.prenom, ' ', p.nom) AS patient_nom,
               p.numero_dossier,
               es.nom AS etab_source,
               ed.nom AS etab_dest
        FROM transferts_dossiers t
        JOIN patients       p  ON t.patient_id             = p.id
        JOIN etablissements es ON t.etablissement_source_id = es.id
        JOIN etablissements ed ON t.etablissement_dest_id   = ed.id
        ORDER BY t.date_demande DESC
        LIMIT 5
    ");
    $stats['transfert_liste'] = $stmt->fetchAll() ?: [];

    // ── Charge réseau : on calcule pour chaque établissement ─
    $etabStmt = $db->query("SELECT id, nom FROM etablissements LIMIT 4");
    $reseau = [];
    foreach ($etabStmt->fetchAll() as $etab) {
        $eid = (int)$etab['id'];
        $count = (int)$db->query("
            SELECT COUNT(*) FROM transferts_dossiers
            WHERE (etablissement_source_id = $eid OR etablissement_dest_id = $eid)
              AND statut IN ('en_attente','accepte')
        ")->fetchColumn();

        if ($count > 5)      { $load = 'Élevée';  $color = 'bg-rose-500';   $label = 'text-rose-500'; }
        elseif ($count > 2)  { $load = 'Normale'; $color = 'bg-orange-500'; $label = 'text-orange-500'; }
        else                 { $load = 'Faible';  $color = 'bg-blue-500';   $label = 'text-blue-500'; }

        $reseau[] = [
            'name'   => $etab['nom'],
            'status' => 'Online',
            'load'   => $load,
            'color'  => $color,
            'label'  => $label,
            'count'  => $count,
        ];
    }
    $stats['reseau_actif'] = $reseau;
}
elseif ($user['role'] === 'patient') {
    $uid = $user['id'];
    $stmt = $db->prepare("SELECT * FROM patients WHERE utilisateur_id = ?");
    $stmt->execute([$uid]);
    $patient = $stmt->fetch();
    $stats['patient'] = $patient ?: ['prenom' => $user['prenom'], 'nom' => $user['nom']];

    if ($patient) {
        $pid = $patient['id'];
        $stmt = $db->prepare("
            SELECT r.*, CONCAT(m.prenom,' ',m.nom) as medecin_nom
            FROM rendez_vous r JOIN utilisateurs m ON r.medecin_id=m.id
            WHERE r.patient_id=? AND r.date_rdv>=CURDATE() AND r.statut!='annule'
            ORDER BY r.date_rdv ASC, r.heure_rdv ASC LIMIT 1
        ");
        $stmt->execute([$pid]);
        $stats['prochain_rdv'] = $stmt->fetch() ?: null;

        $stmt = $db->prepare("
            SELECT pr.*, CONCAT(m.prenom,' ',m.nom) as medecin_nom
            FROM prescriptions pr JOIN utilisateurs m ON pr.medecin_id=m.id
            WHERE pr.patient_id=? ORDER BY pr.created_at DESC LIMIT 5
        ");
        $stmt->execute([$pid]);
        $stats['prescriptions'] = $stmt->fetchAll() ?: [];
        $stats['documents_count'] = count($stats['prescriptions']);
        $stats['score_sante'] = 85;
    } else {
        $stats['score_sante'] = 0;
        $stats['documents_count'] = 0;
    }
}

} catch (Exception $e) {
    // Renvoyer les stats partielles déjà calculées plutôt qu'une erreur 500
    $stats['_error'] = $e->getMessage();
}

header('Content-Type: application/json');
echo json_encode($stats);
