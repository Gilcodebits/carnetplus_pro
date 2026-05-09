import { useState, useEffect } from "react";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { transfertsAPI, patientsAPI, etablissementsAPI } from "../services/api";
import { 
  ArrowLeftRight, Send, Inbox, Clock, AlertTriangle, 
  Plus, ChevronRight, Building2, CheckCircle, XCircle, 
  Search, Filter, Calendar, FileText, UserPlus, User, ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const statutConfig: Record<string,{label:string,color:string,icon:any}> = {
  en_attente: { label:"En attente", color:"bg-orange-100 text-orange-700 border-orange-200", icon:Clock },
  accepte:    { label:"Accepté",    color:"bg-blue-100 text-blue-700 border-blue-200",       icon:CheckCircle },
  refuse:     { label:"Refusé",     color:"bg-red-100 text-red-700 border-red-200",           icon:XCircle },
  transfere:  { label:"Transféré",  color:"bg-green-100 text-green-700 border-green-200",    icon:ArrowLeftRight },
};

export function GestionnaireTransferts() {
  const [transferts, setTransferts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"envoi" | "reception" | "archive">("envoi");
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadTransferts();
  }, []);

  const loadTransferts = async () => {
    setLoading(true);
    try {
      const data = await transfertsAPI.list();
      setTransferts(data);
    } catch (err) {
      console.error("Erreur transferts:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: number, statut: string) => {
    try {
      await transfertsAPI.update(id, { statut });
      loadTransferts();
    } catch (err) {
      alert("Erreur lors de la mise à jour");
    }
  };

  const filtered = transferts.filter(t => {
    const matchesTab = activeTab === "archive" 
      ? (t.statut === "transfere" || t.statut === "refuse")
      : (t.type === activeTab && t.statut !== "transfere" && t.statut !== "refuse");
    
    const matchesSearch = t.patient_nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         t.numero_dossier.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesTab && matchesSearch;
  });

  return (
    <div className="p-8 lg:p-12 space-y-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight mb-2">Gestion des Flux</h1>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"/>
            Suivi et validation des transferts de dossiers médicaux
          </p>
        </div>
        <div className="flex gap-4">
           <button onClick={() => setShowModal(true)}
            className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-600 transition-all shadow-xl active:scale-95 border-2 border-slate-800">
            <Plus className="w-5 h-5"/> Demander un dossier
          </button>
        </div>
      </div>

      {/* Tabs and Filters */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex bg-white p-1.5 rounded-2xl border-2 border-slate-100 shadow-sm w-full md:w-auto">
          {[
            { id: "envoi", label: "Envois en cours", icon: Send },
            { id: "reception", label: "Réceptions", icon: Inbox },
            { id: "archive", label: "Historique", icon: Clock },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-3 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex-1 md:flex-none ${
                activeTab === tab.id 
                  ? "bg-slate-900 text-white shadow-lg" 
                  : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
              }`}
            >
              <tab.icon className="w-4 h-4"/>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher un patient ou n° dossier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-6 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-orange-500 transition-all font-bold text-sm shadow-sm"
          />
        </div>
      </div>

      {/* List Section */}
      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[3rem] border-2 border-slate-100 border-dashed">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Chargement des données...</p>
          </div>
        ) : filtered.length > 0 ? (
          <AnimatePresence mode="popLayout">
            {filtered.map((t) => {
              const sc = statutConfig[t.statut] || statutConfig.en_attente;
              const StatusIcon = sc.icon;
              return (
                <motion.div
                  key={t.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`p-6 bg-white rounded-[2.5rem] border-2 group transition-all hover:shadow-2xl hover:shadow-slate-200/50 ${
                    t.priorite === "urgente" ? "border-rose-100 shadow-lg shadow-rose-50" : "border-slate-100"
                  }`}
                >
                  <div className="flex flex-col lg:flex-row items-center gap-8">
                    {/* Patient Info */}
                    <div className="flex items-center gap-6 flex-1 min-w-0 w-full">
                      <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center flex-shrink-0 border-2 shadow-sm ${
                        t.type === "envoi" ? "bg-blue-50 border-blue-100 text-blue-600" : "bg-emerald-50 border-emerald-100 text-emerald-600"
                      }`}>
                        {t.type === "envoi" ? <Send className="w-7 h-7"/> : <Inbox className="w-7 h-7"/>}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-black text-slate-900 text-xl tracking-tight truncate group-hover:text-blue-600 transition-colors">{t.patient_nom}</h3>
                          {t.priorite === "urgente" && (
                            <span className="flex items-center gap-1.5 text-[8px] font-black text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-full animate-pulse uppercase tracking-widest">
                              <AlertTriangle className="w-3 h-3"/> Urgent
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-black uppercase tracking-widest">
                          <span>#{t.numero_dossier}</span>
                          <span className="w-1 h-1 bg-slate-200 rounded-full"/>
                          <span>Demande du {new Date(t.date_demande).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Route Details */}
                    <div className="flex items-center gap-6 px-8 py-3 bg-slate-50 rounded-2xl border border-slate-100 w-full lg:w-auto overflow-hidden">
                      <div className="text-right min-w-[80px]">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Émetteur</p>
                        <p className="text-[11px] font-bold text-slate-700 truncate">{t.etab_source}</p>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <ArrowLeftRight className="w-4 h-4 text-slate-400"/>
                        <div className="w-12 h-0.5 bg-slate-200 rounded-full"/>
                      </div>
                      <div className="min-w-[80px]">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Récepteur</p>
                        <p className="text-[11px] font-bold text-slate-700 truncate">{t.etab_dest}</p>
                      </div>
                    </div>

                    {/* Status & Actions */}
                    <div className="flex items-center gap-6 ml-auto w-full lg:w-auto justify-between lg:justify-end">
                      <span className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border shadow-sm ${sc.color}`}>
                        <StatusIcon className="w-3.5 h-3.5"/> {sc.label}
                      </span>
                      
                      <div className="flex gap-2">
                        {t.statut === "en_attente" && (
                          <div className="flex gap-2">
                            <button onClick={() => handleAction(t.id, "accepte")}
                              className="w-11 h-11 bg-emerald-600 text-white rounded-xl flex items-center justify-center hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-200 transition-all active:scale-90 border-2 border-emerald-500">
                              <CheckCircle className="w-5 h-5"/>
                            </button>
                            <button onClick={() => handleAction(t.id, "refuse")}
                              className="w-11 h-11 bg-white text-rose-600 border-2 border-rose-100 rounded-xl flex items-center justify-center hover:bg-rose-50 hover:border-rose-200 transition-all active:scale-90">
                              <XCircle className="w-5 h-5"/>
                            </button>
                          </div>
                        )}
                        {t.statut === "accepte" && (
                          <button onClick={() => handleAction(t.id, "transfere")}
                            className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center gap-2 shadow-lg active:scale-95 border-2 border-slate-800">
                            <Send className="w-4 h-4"/> Finaliser
                          </button>
                        )}
                        <button className="w-11 h-11 bg-white text-slate-400 border-2 border-slate-100 rounded-xl flex items-center justify-center hover:text-blue-600 hover:border-blue-200 transition-all active:scale-90 group-hover:border-blue-200">
                          <FileText className="w-5 h-5"/>
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[3rem] border-2 border-slate-100 border-dashed">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <Search className="w-10 h-10 text-slate-200"/>
            </div>
            <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Aucun transfert trouvé</p>
            <p className="text-xs text-slate-400 font-medium italic">Essayez de modifier vos filtres ou de créer une nouvelle demande</p>
          </div>
        )}
      </div>

      {showModal && <NouveauTransfertModal onClose={() => setShowModal(false)} onSave={() => { loadTransferts(); setShowModal(false); }} />}
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
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl flex items-center justify-center z-50 p-4 animate-fadeIn">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }} 
        animate={{ scale: 1, opacity: 1, y: 0 }} 
        className="bg-white rounded-[3.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] w-full max-w-2xl border-4 border-slate-100 overflow-hidden relative"
      >
        {/* Progress Indicator (Faked for visual appeal) */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-100">
          <div className="h-full bg-blue-600 w-2/3 transition-all duration-500 shadow-[0_0_12px_rgba(37,99,235,0.4)]"/>
        </div>

        <div className="p-10 pb-6 border-b-2 border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-inner">
              <ArrowLeftRight className="w-7 h-7"/>
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-none mb-1">Configuration Flux</h2>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Échange sécurisé de données cliniques</p>
            </div>
          </div>
          <button onClick={onClose} className="w-12 h-12 flex items-center justify-center hover:bg-slate-50 rounded-2xl transition-all text-slate-300 hover:text-slate-900 border-2 border-transparent hover:border-slate-100">
            <XCircle className="w-6 h-6"/>
          </button>
        </div>
        
        <div className="p-10 space-y-10 overflow-y-auto max-h-[65vh] scrollbar-hide">
          {/* Step 1: Patient & Destination */}
          <div className="space-y-6">
            <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"/> Acteurs du Transfert
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Patient Concerné</label>
                <div className="relative group">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  <select 
                    value={form.patient_id} 
                    onChange={e=>setForm({...form, patient_id: e.target.value})}
                    className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 font-bold text-sm appearance-none cursor-pointer transition-all"
                  >
                    <option value="">Sélectionner un dossier...</option>
                    {patients.map(p => <option key={p.id} value={p.id}>{p.prenom} {p.nom} (#{p.numero_dossier})</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Établissement Partenaire</label>
                <div className="relative group">
                  <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  <select 
                    value={form.etab_dest_id} 
                    onChange={e=>setForm({...form, etab_dest_id: e.target.value})}
                    className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 font-bold text-sm appearance-none cursor-pointer transition-all"
                  >
                    <option value="">Cible du flux...</option>
                    {etabs.map(e => <option key={e.id} value={e.id}>{e.nom} ({e.ville})</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Configuration */}
          <div className="space-y-6">
            <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"/> Paramètres Opérationnels
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Sens de l'opération</label>
                <div className="flex bg-slate-50 p-2 rounded-2xl border-2 border-slate-100">
                  {[
                    { id: "envoi", label: "Émission", icon: Send },
                    { id: "reception", label: "Réception", icon: Inbox }
                  ].map(t => (
                    <button 
                      key={t.id} 
                      onClick={() => setForm({...form, type: t.id})}
                      className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${
                        form.type === t.id 
                          ? "bg-white text-slate-900 shadow-lg border border-slate-100 scale-[1.02]" 
                          : "text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      <t.icon className="w-4 h-4"/>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Priorité du canal</label>
                <div className="flex bg-slate-50 p-2 rounded-2xl border-2 border-slate-100">
                  {[
                    { id: "normale", label: "Standard", color: "bg-blue-600" },
                    { id: "urgente", label: "Critique", color: "bg-rose-600" }
                  ].map(p => (
                    <button 
                      key={p.id} 
                      onClick={() => setForm({...form, priorite: p.id})}
                      className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        form.priorite === p.id 
                          ? `${p.color} text-white shadow-xl scale-[1.02]` 
                          : "text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Step 3: Justification */}
          <div className="space-y-3">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Motif Clinique & Justification</label>
            <textarea 
              value={form.motif} 
              onChange={e=>setForm({...form, motif: e.target.value})} 
              rows={4}
              placeholder="Détails du transfert, contexte médical ou instructions spécifiques..."
              className="w-full px-8 py-6 bg-slate-50 border-2 border-slate-100 rounded-[2.5rem] focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 font-medium text-sm transition-all resize-none shadow-inner placeholder:text-slate-300" 
            />
          </div>
        </div>

        <div className="p-10 border-t-2 border-slate-50 bg-slate-50/30 flex gap-6">
          <button 
            onClick={handleCreate} 
            disabled={loading}
            className="flex-1 py-6 bg-slate-900 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-2xl shadow-slate-200 border-2 border-slate-800 disabled:opacity-50 active:scale-[0.98] flex items-center justify-center gap-4"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
            ) : (
              <>Valider l'opération <ArrowRight className="w-4 h-4"/></>
            )}
          </button>
          <button 
            onClick={onClose} 
            className="px-12 py-6 bg-white text-slate-400 border-2 border-slate-100 rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 hover:text-slate-900 transition-all active:scale-[0.98]"
          >
            Annuler
          </button>
        </div>
      </motion.div>
    </div>
  );
}
