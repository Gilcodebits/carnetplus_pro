import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { dashboardAPI, transfertsAPI, etablissementsAPI, patientsAPI } from "../services/api";
import { 
  ArrowLeftRight, Send, Clock, AlertTriangle, Plus, 
  ChevronRight, Building2, User, CheckCircle, XCircle, 
  RefreshCw, MessageSquare, Bell, FileText, ArrowRight, 
  Users, Activity, Globe, Search, Calendar, Filter, Sparkles, TrendingUp, Zap, Cloud, X, ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";

export function GestionnaireDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [transferts, setTransferts] = useState<any[]>([]);
  const [stats, setStats]           = useState<any>({});
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await dashboardAPI.stats();
      // Même si l'API renvoie une erreur partielle, on utilise les données disponibles
      setStats(data || {});
      setTransferts(data?.transfert_liste || []);
    } catch (err) {
      // Erreur réseau totale (serveur inaccessible)
      setStats({});
      setTransferts([]);
      showToast("Serveur inaccessible — vérifiez que le backend est démarré", "error");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="animate-fadeIn bg-slate-50/50 min-h-screen w-full max-w-full overflow-x-hidden">
      <div className="px-6 md:px-10 pb-12 pt-6 space-y-10">
        <div className="flex justify-end mb-4">
           <button onClick={() => setShowModal(true)} className="flex items-center justify-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-200">
            <ArrowLeftRight className="w-4 h-4" /> <span>Nouveau Transfert</span>
          </button>
        </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
          { label: "En attente", val: stats.en_attente || 0, icon: Clock, color: "from-orange-500 to-orange-600" },
          { label: "Validés", val: stats.acceptes || 0, icon: CheckCircle, color: "from-emerald-500 to-emerald-600" },
          { label: "Transférés", val: stats.transferes || 0, icon: Send, color: "from-blue-500 to-blue-600" },
          { label: "Critiques", val: stats.urgents || 0, icon: AlertTriangle, color: "from-rose-500 to-rose-600" },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-3 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] shadow-sm border-2 border-slate-50 flex items-center gap-3 md:gap-6 group hover:border-blue-100 transition-all"
          >
            <div className={`w-14 h-14 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0 group-hover:scale-110 transition-transform`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 leading-none mb-1">{stat.val}</h3>
              <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest opacity-90">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        
        {/* Flux Récents */}
        <div className="xl:col-span-8 space-y-8">
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-4">
                 <div className="w-12 h-12 bg-white text-blue-600 rounded-2xl flex items-center justify-center border-2 border-blue-50 shadow-sm"><ArrowLeftRight className="w-6 h-6"/></div>
                 Flux Récents
              </h2>
              <button onClick={() => navigate('/gestionnaire/transferts')} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg">
                Détails <ArrowRight className="w-4 h-4"/>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {transferts.length > 0 ? transferts.slice(0, 3).map((t, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ x: 6 }}
                  onClick={() => navigate('/gestionnaire/transferts')}
                  className="p-5 rounded-[2rem] border-2 border-slate-50 bg-white hover:border-blue-200 transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center border-2 border-white text-slate-900 font-black text-base shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all">
                      {t.patient_nom.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900 uppercase tracking-tight group-hover:text-blue-600 transition-colors leading-none">{t.patient_nom}</h3>
                      <p className="text-[9px] text-slate-900 font-black uppercase tracking-[0.2em] mt-2 opacity-50">{t.etab_dest}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                    <div className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border shadow-sm ${
                      t.statut === 'accepte' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      t.statut === 'refuse' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                      t.statut === 'transfere' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                      'bg-orange-50 text-orange-600 border-orange-100'
                    }`}>
                      {t.statut === 'en_attente' ? 'En attente' : (t.statut?.replace('_', ' ') || 'En attente')}
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-blue-600 transition-all" />
                  </div>
                </motion.div>
              )) : (
                <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-[3rem] bg-white">
                  <p className="text-slate-900 font-black uppercase tracking-widest text-[10px]">Aucun transfert actif</p>
                </div>
              )}
            </div>
            {transferts.length > 3 && (
              <button
                onClick={() => navigate('/gestionnaire/transferts')}
                className="w-full py-4 bg-slate-50 border-2 border-slate-100 text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all flex items-center justify-center gap-3 active:scale-95"
              >
                Voir plus <span className="bg-blue-600 text-white px-2 py-0.5 rounded-lg text-[9px]">{transferts.length - 3}</span> <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="bg-white p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border-2 border-slate-100 shadow-sm overflow-hidden relative group hidden sm:block">
            <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] mb-12 flex items-center gap-4">
              <Zap className="w-4 h-4 text-blue-600 animate-pulse" /> Architecture de Circulation des Données
            </h3>
            <div className="flex items-center justify-between max-w-2xl mx-auto relative px-10">
              <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-50 -translate-y-1/2 overflow-hidden rounded-full">
                <motion.div 
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="w-1/4 h-full bg-gradient-to-r from-transparent via-blue-600 to-transparent shadow-[0_0_10px_rgba(37,99,235,0.5)]"
                />
              </div>
              {[
                { label: "EMETTEUR", sub: "Établissement Local", icon: Building2, color: "bg-slate-900 text-white" },
                { label: "CARNET PLUS", sub: "Cloud Sécurisé", icon: Cloud, color: "bg-blue-600 text-white shadow-xl shadow-blue-200" },
                { label: "CIBLE", sub: "Établissement Distant", icon: Building2, color: "bg-emerald-600 text-white" },
              ].map((step, i) => (
                <div key={i} className="flex flex-col items-center gap-4 relative z-10">
                  <motion.div 
                    whileHover={{ scale: 1.15, rotate: 5 }}
                    className={`w-12 h-12 md:w-16 md:h-16 ${step.color} rounded-[1.2rem] md:rounded-[1.5rem] flex items-center justify-center border-4 border-white shadow-lg transition-all`}
                  >
                    <step.icon className="w-5 h-5 md:w-7 md:h-7" />
                  </motion.div>
                  <div className="text-center">
                    <p className="text-[10px] md:text-[11px] font-black text-slate-900 uppercase tracking-tighter leading-none">{step.label}</p>
                    <p className="text-[7px] md:text-[8px] text-slate-900 font-black uppercase tracking-widest mt-1 opacity-80">{step.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Réseau Actif - DONNÉES RÉELLES AUTOMATISÉES */}
        <div className="xl:col-span-4 space-y-6">
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-4">
             <div className="w-12 h-12 bg-white text-emerald-600 rounded-2xl flex items-center justify-center border-2 border-emerald-50 shadow-sm"><Globe className="w-6 h-6"/></div>
             Charge Réseau
          </h2>
          <div className="space-y-4">
            {stats.reseau_actif && stats.reseau_actif.length > 0 ? stats.reseau_actif.slice(0, 3).map((site: any, i: number) => (
              <div key={i} className="p-6 rounded-[2.5rem] border-2 border-slate-50 bg-white shadow-sm hover:border-blue-200 transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[12px] font-black text-slate-900 uppercase tracking-tight">{site.name}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-8px] font-black text-emerald-600 uppercase tracking-widest">{site.status}</span>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: site.load === 'Élevée' ? '85%' : site.load === 'Normale' ? '45%' : '15%' }}
                      className={`h-full ${site.color}`} 
                    />
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${site.label}`}>{site.load}</span>
                </div>
              </div>
            )) : (
              <div className="p-10 text-center border-2 border-dashed border-slate-100 rounded-[2.5rem]">
                <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest opacity-80">Aucun partenaire détecté</p>
              </div>
            )}
            {stats.reseau_actif && stats.reseau_actif.length > 3 && (
              <button
                onClick={() => navigate('/gestionnaire/etablissements')}
                className="w-full py-4 bg-slate-50 border-2 border-slate-100 text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all flex items-center justify-center gap-3 active:scale-95"
              >
                Voir tout le réseau <span className="bg-emerald-600 text-white px-2 py-0.5 rounded-lg text-[9px]">{stats.reseau_actif.length - 3}</span> <Globe className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="p-8 bg-gradient-to-br from-slate-900 to-slate-800 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-400" /> Sécurité Active
            </h4>
            <p className="text-[10px] font-medium leading-relaxed opacity-80 mb-6 uppercase tracking-wider">
              Toutes les transactions de données sont cryptées en AES-256 et enregistrées dans le registre de conformité.
            </p>
            <button 
              onClick={() => navigate('/gestionnaire/journal')}
              className="w-full py-4 bg-white text-slate-900 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all active:scale-95"
            >
              Consulter le Journal
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showModal && <NouveauTransfertModal onClose={()=>setShowModal(false)} onSave={()=>{loadData(); setShowModal(false);}}/>}
      </AnimatePresence>
      </div>
    </div>
  );
}

function NouveauTransfertModal({ onClose, onSave }: { onClose: () => void, onSave: () => void }) {
  const [form, setForm] = useState({ patient_id: "", etab_dest_id: "", motif: "", type: "envoi", priorite: "normale" });
  const [etabs, setEtabs] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    Promise.all([etablissementsAPI.list(), patientsAPI.list()]).then(([e, p]) => {
      setEtabs(e);
      setPatients(p);
    }).catch(() => showToast("Erreur de chargement", "error"));
  }, []);

  const handleCreate = async () => {
    if (!form.patient_id || !form.etab_dest_id || !form.motif) {
      return showToast("Veuillez remplir tous les champs", "warning");
    }
    setLoading(true);
    try {
      await transfertsAPI.create({ ...form, patient_id: Number(form.patient_id), etab_dest_id: Number(form.etab_dest_id), etab_source_id: 1 });
      showToast("Transfert initié avec succès", "success");
      onSave();
    } catch (err) {
      showToast("Erreur de création", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md flex items-center justify-center z-[200] p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }} 
        animate={{ scale: 1, opacity: 1, y: 0 }} 
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white rounded-[3rem] shadow-2xl w-full max-w-xl border-2 border-slate-100 overflow-hidden"
      >
        <div className="h-2 bg-blue-600 w-full" />
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-5">
             <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-xl border border-blue-50">
                <ArrowLeftRight className="w-6 h-6"/>
             </div>
             <div>
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Flux <span className="text-blue-600">Sortant</span></h2>
                <p className="text-blue-900 text-[10px] font-black uppercase tracking-widest mt-1">Configuration Sécurisée</p>
             </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center hover:bg-rose-50 text-slate-900 rounded-full border border-slate-100">
            <X className="w-6 h-6"/>
          </button>
        </div>
        
        <div className="p-10 space-y-8 max-h-[65vh] overflow-y-auto">
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <label className="block text-[11px] font-black text-slate-900 uppercase tracking-widest ml-1">Patient</label>
              <div className="relative">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-600" />
                <select 
                  value={form.patient_id} 
                  onChange={e=>setForm({...form, patient_id: e.target.value})}
                  className="w-full pl-14 pr-6 py-5 bg-white border-2 border-slate-200 rounded-2xl focus:border-blue-600 outline-none font-bold text-slate-900 text-sm appearance-none cursor-pointer transition-all"
                >
                  <option value="">Sélectionner un dossier...</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.prenom} {p.nom} (#{p.numero_dossier})</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] font-black text-slate-900 uppercase tracking-widest ml-1">Établissement Cible</label>
              <div className="relative">
                <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-600" />
                <select 
                  value={form.etab_dest_id} 
                  onChange={e=>setForm({...form, etab_dest_id: e.target.value})}
                  className="w-full pl-14 pr-6 py-5 bg-white border-2 border-slate-200 rounded-2xl focus:border-blue-600 outline-none font-bold text-slate-900 text-sm appearance-none cursor-pointer transition-all"
                >
                  <option value="">Cible du flux...</option>
                  {etabs.map(e => <option key={e.id} value={e.id}>{e.nom} ({e.ville})</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-[11px] font-black text-slate-900 uppercase tracking-widest ml-1">Priorité</label>
                <div className="flex bg-slate-50 p-1.5 rounded-2xl border-2 border-slate-100">
                  {['normale', 'urgente'].map(p => (
                    <button 
                      key={p} 
                      onClick={()=>setForm({...form, priorite: p})}
                      className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${form.priorite === p ? 'bg-white text-blue-600 shadow-lg border border-slate-200 scale-105' : 'text-slate-900 opacity-80'}`}
                    >
                      {p === 'normale' ? 'Standard' : 'Critique'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-[11px] font-black text-slate-900 uppercase tracking-widest ml-1">Direction</label>
                <div className="flex bg-slate-50 p-1.5 rounded-2xl border-2 border-slate-100">
                  {['envoi', 'reception'].map(t => (
                    <button 
                      key={t} 
                      onClick={()=>setForm({...form, type: t})}
                      className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${form.type === t ? 'bg-white text-blue-600 shadow-lg border border-slate-200 scale-105' : 'text-slate-900 opacity-80'}`}
                    >
                      {t === 'envoi' ? 'Emission' : 'Réception'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] font-black text-slate-900 uppercase tracking-widest ml-1">Motif & Justification</label>
              <textarea 
                value={form.motif} 
                onChange={e=>setForm({...form, motif: e.target.value})} 
                rows={3}
                placeholder="Précisez le contexte médical..."
                className="w-full px-8 py-5 bg-white border-2 border-slate-200 rounded-[2.5rem] focus:border-blue-600 outline-none font-bold text-slate-900 text-sm resize-none transition-all placeholder:text-slate-200 shadow-inner" 
              />
            </div>
          </div>
        </div>

        <div className="p-10 border-t border-slate-100 bg-slate-50/50 flex gap-4">
          <button 
            onClick={handleCreate} 
            disabled={loading}
            className="flex-1 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-2xl active:scale-95"
          >
            {loading ? 'Traitement...' : 'Initier le Flux'}
          </button>
          <button 
            onClick={onClose} 
            className="px-12 py-5 bg-white text-slate-900 border-2 border-slate-900 rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all active:scale-95"
          >
            Annuler
          </button>
        </div>
      </motion.div>
    </div>
  );
}
