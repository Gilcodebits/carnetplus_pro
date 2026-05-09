import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card } from "../components/Card";
import { dashboardAPI, transfertsAPI, etablissementsAPI, patientsAPI } from "../services/api";
import { ArrowLeftRight, Send, Inbox, Clock, AlertTriangle, Plus, ChevronRight, Building2, User, CheckCircle, XCircle, RefreshCw, MessageSquare, Bell, FileText, ArrowRight, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const statutConfig: Record<string,{label:string,color:string,icon:any}> = {
  en_attente: { label:"En attente", color:"bg-orange-100 text-orange-700 border-orange-200", icon:Clock },
  accepte:    { label:"Accepté",    color:"bg-blue-100 text-blue-700 border-blue-200",       icon:CheckCircle },
  refuse:     { label:"Refusé",     color:"bg-red-100 text-red-700 border-red-200",           icon:XCircle },
  transfere:  { label:"Transféré",  color:"bg-green-100 text-green-700 border-green-200",    icon:ArrowLeftRight },
};

export function GestionnaireDashboard() {
  const navigate = useNavigate();
  const [transferts, setTransferts] = useState<any[]>([]);
  const [stats, setStats]           = useState<any>({});
  const [loading, setLoading]       = useState(true);
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab") as "tous" | "envois" | "receptions";
  const [activeTab, setActiveTab]   = useState<"tous"|"envois"|"receptions">("tous");
  const [showModal, setShowModal]   = useState(false);

  useEffect(() => {
    if (tabFromUrl && ["tous", "envois", "receptions"].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await dashboardAPI.stats();
      setStats(data);
      setTransferts(data.transfert_liste || []);
    } catch (err) {
      console.error("Erreur gestionnaire:", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = transferts.filter(t =>
    activeTab === "tous" ? true :
    activeTab === "envois" ? t.type === "envoi" :
    t.type === "reception"
  );

  const handleAction = async (id:number, statut:string) => {
    try {
      await transfertsAPI.update(id, { statut });
      loadData();
    } catch (err) {
      alert("Erreur lors de la mise à jour du transfert");
    }
  };

  if (loading) return (
    <div className="flex h-screen bg-slate-50 items-center justify-center">
      <div className="text-center p-14 bg-white rounded-[3rem] border-2 border-slate-200 shadow-2xl shadow-slate-200/50">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"/>
        <p className="text-slate-900 font-black uppercase tracking-widest text-[10px]">Chargement du Cockpit…</p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col relative min-h-full">
      <div className="p-8 lg:p-12 space-y-10">
        
        {/* Top Header - Contextual */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                <ArrowLeftRight className="w-6 h-6 text-white"/>
              </div>
              <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Tableau de Bord Gestionnaire</h1>
            </div>
            <p className="text-slate-500 text-xs font-bold flex items-center gap-2 ml-1">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"/>
              Monitoring des flux inter-établissements en temps réel
            </p>
          </div>
          <button onClick={()=>setShowModal(true)}
            className="flex items-center gap-4 px-8 py-4 bg-blue-600 text-white rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest hover:bg-blue-700 hover:shadow-2xl hover:shadow-blue-200 transition-all shadow-xl shadow-slate-200 active:scale-95 border border-blue-500">
            <Plus className="w-5 h-5"/> Nouveau Transfert
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: "Demandes en attente", value: stats.en_attente || 0, icon: Clock, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-100" },
            { title: "Flux validés (24h)", value: stats.acceptes || 0, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
            { title: "Dossiers transférés", value: stats.transferes || 0, icon: Send, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
            { title: "Alertes critiques", value: stats.urgents || 0, icon: AlertTriangle, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100" },
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`p-8 rounded-[2.5rem] border ${stat.border} ${stat.bg} shadow-sm group hover:scale-[1.02] transition-all bg-white relative overflow-hidden`}
            >
              <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bg} rounded-full -mr-12 -mt-12 blur-xl opacity-50`}/>
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className={`w-12 h-12 bg-white rounded-2xl flex items-center justify-center border ${stat.border} shadow-sm group-hover:scale-110 transition-transform`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <span className={`text-4xl font-black ${stat.color} tracking-tighter`}>{stat.value}</span>
              </div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 relative z-10">{stat.title}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Activity / Pipeline */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="border border-slate-200 shadow-xl shadow-slate-200/50 p-10 bg-white rounded-[3rem] overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-32 -mt-32 transition-all group-hover:scale-110 opacity-50 blur-3xl" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-10">
                  <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100"><RefreshCw className="w-5 h-5 text-blue-600"/></div>
                    Pipeline des Transferts
                  </h2>
                </div>
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 px-4">
                  {[
                    { icon: Building2, label: "Hôpital Source", color: "blue" },
                    { icon: ArrowLeftRight, label: "Transit Sécurisé", color: "indigo" },
                    { icon: Building2, label: "Clinique Dest.", color: "emerald" },
                  ].map((step, i) => (
                    <div key={i} className="flex items-center gap-6 w-full md:w-auto">
                      <div className="text-center group/step">
                        <div className={`w-20 h-20 bg-${step.color}-50 border-2 border-${step.color}-100 rounded-[2rem] flex items-center justify-center mb-4 shadow-sm group-hover/step:scale-110 group-hover/step:shadow-${step.color}-200 transition-all mx-auto`}>
                          <step.icon className={`w-8 h-8 text-${step.color}-600`}/>
                        </div>
                        <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{step.label}</p>
                      </div>
                      {i < 2 && <div className="hidden md:block w-16 h-1.5 bg-slate-100 rounded-full relative overflow-hidden">
                        <div className="absolute inset-0 bg-blue-500 animate-slideX opacity-50" />
                      </div>}
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <Card className="p-8 border border-slate-200 rounded-[2.5rem] bg-white hover:shadow-xl transition-all group">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600"><FileText className="w-4 h-4"/></div>
                      Demandes Récentes
                    </div>
                    <span className="bg-slate-100 text-slate-500 px-2 py-1 rounded text-[10px]">{transferts.length}</span>
                  </h3>
                  <div className="space-y-4">
                    {transferts.slice(0, 3).map((t, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-slate-50 hover:bg-blue-50/50 rounded-2xl border border-slate-100 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-black text-[11px] text-blue-600 shadow-sm">
                             {t.patient_nom.charAt(0)}
                          </div>
                          <div>
                            <p className="text-xs font-black text-slate-900 uppercase truncate max-w-[120px]">{t.patient_nom}</p>
                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{t.etab_dest}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300"/>
                      </div>
                    ))}
                    <button onClick={() => navigate('/gestionnaire/transferts')} className="w-full py-4 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:bg-blue-50 rounded-2xl transition-all border border-transparent hover:border-blue-100">
                      Piloter les flux →
                    </button>
                  </div>
               </Card>

               <Card className="p-8 border border-slate-200 rounded-[2.5rem] bg-white hover:shadow-xl transition-all">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600"><Building2 className="w-4 h-4"/></div>
                      Réseau Actif
                    </div>
                    <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-2 py-1 rounded text-[10px]">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"/> En ligne
                    </span>
                  </h3>
                  <div className="space-y-4">
                    {[
                      { name: "Hôpital Central", city: "Cotonou", status: "Connecté" },
                      { name: "Clinique du Lac", city: "Ouidah", status: "Connecté" },
                      { name: "CHU Hubert K.", city: "Cotonou", status: "Connecté" },
                    ].map((e, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-emerald-100 transition-colors">
                        <div>
                          <p className="text-xs font-black text-slate-900 uppercase">{e.name}</p>
                          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{e.city}</p>
                        </div>
                        <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"/>
                      </div>
                    ))}
                    <button onClick={() => navigate('/gestionnaire/etablissements')} className="w-full py-4 text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:bg-emerald-50 rounded-2xl transition-all border border-transparent hover:border-emerald-100">
                      Voir l'annuaire →
                    </button>
                  </div>
               </Card>
            </div>
          </div>

          {/* Quick Actions / Timeline */}
          <div className="space-y-8">
            <Card className="p-1 bg-gradient-to-br from-slate-800 to-slate-900 rounded-[3rem] shadow-2xl shadow-blue-900/20 relative overflow-hidden group">
              {/* Premium Background Effects */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full -mr-32 -mt-32 blur-[60px] pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full -ml-32 -mb-32 blur-[60px] pointer-events-none" />
              
              <div className="relative z-10 bg-slate-900/50 backdrop-blur-2xl rounded-[2.8rem] p-8 h-full border border-white/10">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-8 text-blue-400 flex items-center gap-3">
                   <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(59,130,246,0.8)]"/>
                   Actions Rapides
                </h3>
                
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Nouveau", desc: "Transfert", icon: Plus, color: "from-blue-500 to-blue-600", border: "border-blue-400/30", onClick: () => setShowModal(true) },
                    { label: "Personnel", desc: "Gestion", icon: Users, color: "from-indigo-500 to-indigo-600", border: "border-indigo-400/30", onClick: () => navigate('/gestionnaire/personnel') },
                    { label: "Réseau", desc: "Messagerie", icon: MessageSquare, color: "from-emerald-500 to-emerald-600", border: "border-emerald-400/30", onClick: () => navigate('/gestionnaire/messagerie') },
                    { label: "Alertes", desc: "Centre", icon: Bell, color: "from-rose-500 to-rose-600", border: "border-rose-400/30", onClick: () => navigate('/gestionnaire/notifications') }
                  ].map((action, i) => (
                    <button 
                      key={i} 
                      onClick={action.onClick} 
                      className="group flex flex-col items-center text-center p-5 bg-white/5 hover:bg-white/10 rounded-[2rem] border border-white/5 hover:border-white/20 transition-all duration-300 active:scale-[0.94] relative overflow-hidden"
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-lg mb-3 group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-300 border ${action.border}`}>
                        <action.icon className="w-5 h-5 text-white"/>
                      </div>
                      <span className="text-[10px] font-black text-white uppercase tracking-wider mb-0.5">{action.label}</span>
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{action.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            <Card className="p-8 border border-slate-200 rounded-[3rem] bg-white h-[400px] flex flex-col hover:shadow-xl transition-all">
               <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-3">
                 <Clock className="w-4 h-4 text-blue-600"/> Activité Système
               </h3>
               <div className="flex-1 overflow-y-auto space-y-6 pr-2 scrollbar-hide">
                 {[
                   { user: "Hôpital Central", action: "a validé le transfert #2024", time: "À l'instant", icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-50", border: "border-emerald-100" },
                   { user: "Clinique Lac", action: "demande le dossier #8821", time: "Il y a 15 min", icon: Inbox, color: "text-blue-500", bg: "bg-blue-50", border: "border-blue-100" },
                   { user: "Système", action: "Alerte priorité haute #1209", time: "Il y a 1h", icon: AlertTriangle, color: "text-rose-500", bg: "bg-rose-50", border: "border-rose-100" },
                   { user: "CHU Hubert", action: "mis à jour les infos réseau", time: "Il y a 3h", icon: RefreshCw, color: "text-orange-500", bg: "bg-orange-50", border: "border-orange-100" },
                 ].map((act, i) => (
                   <div key={i} className="flex gap-4 relative group">
                     {i < 3 && <div className="absolute left-5 top-10 bottom-[-24px] w-px bg-slate-200 group-hover:bg-blue-200 transition-colors" />}
                     <div className={`w-10 h-10 rounded-xl ${act.bg} flex items-center justify-center flex-shrink-0 ${act.color} border ${act.border} shadow-sm relative z-10 group-hover:scale-110 transition-transform`}>
                        <act.icon className="w-5 h-5"/>
                     </div>
                     <div className="pt-1">
                       <p className="text-xs font-black text-slate-900 uppercase mb-0.5">{act.user}</p>
                       <p className="text-[11px] text-slate-500 font-medium mb-1.5">{act.action}</p>
                       <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-md border border-slate-100">{act.time}</span>
                     </div>
                   </div>
                 ))}
               </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Modal Nouveau Transfert Premium */}
      <AnimatePresence>
        {showModal && <NouveauTransfertModal onClose={()=>setShowModal(false)} onSave={()=>{loadData(); setShowModal(false);}}/>}
      </AnimatePresence>
    </div>
  );
}

function NouveauTransfertModal({ onClose, onSave }: { onClose: () => void, onSave: () => void }) {
  const [form, setForm] = useState({ patient_id: "", etab_dest_id: "", motif: "", type: "envoi", priorite: "normale" });
  const [etabs, setEtabs] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([etablissementsAPI.list(), patientsAPI.list()]).then(([e, p]) => {
      setEtabs(e);
      setPatients(p);
    }).catch(console.error);
  }, []);

  const handleCreate = async () => {
    if (!form.patient_id || !form.etab_dest_id || !form.motif) return alert("Veuillez remplir tous les champs obligatoires");
    setLoading(true);
    try {
      await transfertsAPI.create({ ...form, patient_id: Number(form.patient_id), etab_dest_id: Number(form.etab_dest_id), etab_source_id: 1 });
      onSave();
    } catch (err) {
      alert("Erreur lors de la création de la demande");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xl flex items-center justify-center z-50 p-4">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }} 
        animate={{ scale: 1, opacity: 1, y: 0 }} 
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
        className="bg-white rounded-[3.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] w-full max-w-2xl border border-slate-200 overflow-hidden relative"
      >
        {/* Progress Indicator */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-100">
          <div className="h-full bg-blue-600 transition-all duration-500 shadow-[0_0_12px_rgba(37,99,235,0.4)]" 
               style={{ width: form.patient_id && form.etab_dest_id && form.motif ? '100%' : form.patient_id || form.etab_dest_id ? '66%' : '33%' }}/>
        </div>

        <div className="p-10 pb-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
              <ArrowLeftRight className="w-7 h-7"/>
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-1">Configuration Flux</h2>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                <Shield className="w-3 h-3 text-emerald-500"/> Échange sécurisé de données cliniques
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-12 h-12 flex items-center justify-center bg-white hover:bg-slate-100 rounded-2xl transition-all text-slate-400 hover:text-slate-900 border border-slate-200 shadow-sm">
            <XCircle className="w-6 h-6"/>
          </button>
        </div>
        
        <div className="p-10 space-y-10 overflow-y-auto max-h-[65vh] scrollbar-hide">
          {/* Acteurs */}
          <div className="space-y-6">
            <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-3">
              <span className="w-2 h-2 bg-blue-600 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.5)]"/> 
              Acteurs du Transfert
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">Patient Concerné</label>
                <div className="relative group">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                  <select 
                    value={form.patient_id} 
                    onChange={e=>setForm({...form, patient_id: e.target.value})}
                    className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-[1.5rem] focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 font-bold text-sm text-slate-900 appearance-none cursor-pointer transition-all shadow-sm hover:border-blue-300"
                  >
                    <option value="">Sélectionner un dossier...</option>
                    {patients.map(p => <option key={p.id} value={p.id}>{p.prenom} {p.nom} (#{p.numero_dossier})</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">Établissement Destinataire</label>
                <div className="relative group">
                  <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                  <select 
                    value={form.etab_dest_id} 
                    onChange={e=>setForm({...form, etab_dest_id: e.target.value})}
                    className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-[1.5rem] focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 font-bold text-sm text-slate-900 appearance-none cursor-pointer transition-all shadow-sm hover:border-blue-300"
                  >
                    <option value="">Cible du flux...</option>
                    {etabs.map(e => <option key={e.id} value={e.id}>{e.nom} ({e.ville})</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Configuration */}
          <div className="space-y-6">
            <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-3">
              <span className="w-2 h-2 bg-blue-600 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.5)]"/> 
              Paramètres Opérationnels
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">Sens de l'opération</label>
                <div className="flex bg-slate-50 p-1.5 rounded-[1.5rem] border border-slate-200">
                  {[
                    { id: "envoi", label: "Émission", icon: Send },
                    { id: "reception", label: "Réception", icon: Inbox }
                  ].map(t => (
                    <button 
                      key={t.id} 
                      onClick={() => setForm({...form, type: t.id})}
                      className={`flex-1 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                        form.type === t.id 
                          ? "bg-white text-blue-600 shadow-md border border-slate-100 scale-[1.02]" 
                          : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/50"
                      }`}
                    >
                      <t.icon className={`w-4 h-4 ${form.type === t.id ? 'text-blue-600' : 'text-slate-400'}`}/>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">Priorité du canal</label>
                <div className="flex bg-slate-50 p-1.5 rounded-[1.5rem] border border-slate-200">
                  {[
                    { id: "normale", label: "Standard", color: "bg-blue-600", shadow: "shadow-blue-200" },
                    { id: "urgente", label: "Critique", color: "bg-rose-600", shadow: "shadow-rose-200" }
                  ].map(p => (
                    <button 
                      key={p.id} 
                      onClick={() => setForm({...form, priorite: p.id})}
                      className={`flex-1 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                        form.priorite === p.id 
                          ? `${p.color} text-white shadow-lg ${p.shadow} scale-[1.02]` 
                          : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/50"
                      }`}
                    >
                      {p.id === 'urgente' && form.priorite === p.id && <AlertTriangle className="w-4 h-4 text-white"/>}
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-3 mb-4">
              <span className="w-2 h-2 bg-blue-600 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.5)]"/> 
              Motif & Justification
            </h3>
            <textarea 
              value={form.motif} 
              onChange={e=>setForm({...form, motif: e.target.value})} 
              rows={4}
              placeholder="Détails du transfert, contexte médical ou instructions spécifiques pour l'établissement destinataire..."
              className="w-full px-6 py-5 bg-white border border-slate-200 rounded-[2rem] focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 font-medium text-sm text-slate-900 transition-all resize-none shadow-sm hover:border-blue-300 placeholder:text-slate-400" 
            />
          </div>
        </div>

        <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex gap-4">
          <button 
            onClick={handleCreate} 
            disabled={loading || !form.patient_id || !form.etab_dest_id || !form.motif}
            className="flex-1 py-5 bg-blue-600 text-white rounded-[2rem] font-black text-[11px] uppercase tracking-[0.1em] hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 disabled:opacity-50 disabled:hover:scale-100 active:scale-[0.98] flex items-center justify-center gap-3 border border-blue-500"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                Traitement en cours...
              </>
            ) : (
              <>Valider l'opération <ArrowRight className="w-5 h-5"/></>
            )}
          </button>
          <button 
            onClick={onClose} 
            className="px-10 py-5 bg-white text-slate-600 border border-slate-200 rounded-[2rem] font-black text-[11px] uppercase tracking-widest hover:bg-slate-50 hover:text-slate-900 transition-all active:scale-[0.98] shadow-sm"
          >
            Annuler
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// Composant local Shield pour palier à l'import manquant s'il y a lieu.
function Shield({className}: {className?: string}) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  );
}
