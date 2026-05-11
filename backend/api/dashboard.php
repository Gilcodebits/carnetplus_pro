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

    // ── Simulation de métriques système dynamiques ──────────────────────────
    // On génère des valeurs qui varient légèrement pour simuler un moniteur vivant
    $stats['system'] = [
        'performance' => [
            ['label' => "Charge CPU globale",   'pct' => rand(8, 15),   'color' => "bg-blue-600"],
            ['label' => "Bande passante réseau", 'pct' => rand(25, 45),  'color' => "bg-indigo-600"],
            ['label' => "Temps de réponse API", 'pct' => rand(80, 95),  'color' => "bg-emerald-500"],
        ],
        'alerts' => [
            [
                'title' => "Serveur de sauvegarde",
                'desc' => "Synchronisation planifiée : 02h00 • Dernière réussite : OK",
                'type' => 'warning',
                'bg' => 'bg-orange-50',
                'border' => 'border-orange-100',
                'text' => 'text-orange-900',
                'subtext' => 'text-orange-700'
            ],
            [
                'title' => "Mise à jour v2.1 disponible",
                'desc' => "Correctifs de sécurité critiques • Installation recommandée",
                'type' => 'info',
                'bg' => 'bg-blue-50',
                'border' => 'border-blue-100',
                'text' => 'text-blue-900',
                'subtext' => 'text-blue-700'
            ]
        ]
    ];
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
    $stats['rdv_today']      = (int)$db->query("SELECT COUNT(*) FROM rendez_vous r JOIN utilisateurs m ON r.medecin_id=m.id WHERE r.date_rdv=CURDATE() AND m.etablissement_id=$etabId")->fetchColumn();
    $stats['rdv_attente']    = (int)$db->query("SELECT COUNT(*) FROM rendez_vous r JOIN utilisateurs m ON r.medecin_id=m.id WHERE r.statut='planifie' AND r.date_rdv>=CURDATE() AND m.etablissement_id=$etabId")->fetchColumn();
    $stats['patients_total'] = (int)$db->query("SELECT COUNT(*) FROM patients WHERE etablissement_id=$etabId")->fetchColumn();
    
    $stmt = $db->prepare("
        SELECT r.*, CONCAT(p.prenom,' ',p.nom) as patient_nom,
               CONCAT(m.prenom,' ',m.nom) as medecin_nom
        FROM rendez_vous r 
        JOIN patients p ON r.patient_id=p.id 
        JOIN utilisateurs m ON r.medecin_id=m.id
        WHERE r.date_rdv=CURDATE() AND m.etablissement_id=? 
        ORDER BY r.heure_rdv
    ");
    $stmt->execute([$etabId]);
    $stats['rdv_liste'] = $stmt->fetchAll() ?: [];
}
elseif ($user['role'] === 'labo') {
    // Filtrer par établissement via le médecin qui a prescrit ou via le patient (ici on utilise l'etabId du labo)
    $stats['demandes']  = (int)$db->query("SELECT COUNT(*) FROM examens e JOIN consultations c ON e.consultation_id=c.id JOIN utilisateurs m ON c.medecin_id=m.id WHERE e.statut='demande' AND m.etablissement_id=$etabId")->fetchColumn();
    $stats['en_cours']  = (int)$db->query("SELECT COUNT(*) FROM examens e JOIN consultations c ON e.consultation_id=c.id JOIN utilisateurs m ON c.medecin_id=m.id WHERE e.statut='en_cours' AND m.etablissement_id=$etabId")->fetchColumn();
    $stats['termines']  = (int)$db->query("SELECT COUNT(*) FROM examens e JOIN consultations c ON e.consultation_id=c.id JOIN utilisateurs m ON c.medecin_id=m.id WHERE e.statut='termine' AND DATE(e.date_resultat)=CURDATE() AND m.etablissement_id=$etabId")->fetchColumn();
    $stats['urgents']   = (int)$db->query("SELECT COUNT(*) FROM examens e JOIN consultations c ON e.consultation_id=c.id JOIN utilisateurs m ON c.medecin_id=m.id WHERE e.urgence=1 AND e.statut IN('demande','en_cours') AND m.etablissement_id=$etabId")->fetchColumn();
}
elseif ($user['role'] === 'gestionnaire') {

    // ── Compteurs filtrés par établissement ──────────────────
    $stats['en_attente'] = (int)$db->query("SELECT COUNT(*) FROM transferts_dossiers WHERE statut='en_attente' AND (etablissement_source_id = $etabId OR etablissement_dest_id = $etabId)")->fetchColumn();
    $stats['acceptes']   = (int)$db->query("SELECT COUNT(*) FROM transferts_dossiers WHERE statut='accepte' AND (etablissement_source_id = $etabId OR etablissement_dest_id = $etabId)")->fetchColumn();
    $stats['transferes'] = (int)$db->query("SELECT COUNT(*) FROM transferts_dossiers WHERE statut='transfere' AND (etablissement_source_id = $etabId OR etablissement_dest_id = $etabId)")->fetchColumn();
    $stats['urgents']    = (int)$db->query("SELECT COUNT(*) FROM transferts_dossiers WHERE priorite='urgente' AND statut='en_attente' AND (etablissement_source_id = $etabId OR etablissement_dest_id = $etabId)")->fetchColumn();

    // ── Flux récents filtrés ─────────────────────────────────
    $stmt = $db->prepare("
        SELECT t.id, t.statut, t.type, t.priorite, t.date_demande, t.motif,
               CONCAT(p.prenom, ' ', p.nom) AS patient_nom,
               p.numero_dossier,
               es.nom AS etab_source,
               ed.nom AS etab_dest
        FROM transferts_dossiers t
        JOIN patients       p  ON t.patient_id             = p.id
        JOIN etablissements es ON t.etablissement_source_id = es.id
        JOIN etablissements ed ON t.etablissement_dest_id   = ed.id
        WHERE t.etablissement_source_id = ? OR t.etablissement_dest_id = ?
        ORDER BY t.date_demande DESC
        LIMIT 5
    ");
    $stmt->execute([$etabId, $etabId]);
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

        // Récupérer tous les RDV à venir pour la liste
        $stmt = $db->prepare("
            SELECT r.*, CONCAT(m.prenom,' ',m.nom) as medecin_nom
            FROM rendez_vous r JOIN utilisateurs m ON r.medecin_id=m.id
            WHERE r.patient_id=? AND r.date_rdv>=CURDATE() AND r.statut!='annule'
            ORDER BY r.date_rdv ASC, r.heure_rdv ASC
        ");
        $stmt->execute([$pid]);
        $stats['rdv_liste'] = $stmt->fetchAll() ?: [];

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
