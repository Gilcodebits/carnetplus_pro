import { useState, useEffect } from "react";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { transfertsAPI, patientsAPI, etablissementsAPI } from "../services/api";
import { 
  ArrowLeftRight, Send, Inbox, Clock, AlertTriangle, 
  Plus, ChevronRight, Building2, CheckCircle, XCircle, 
  Search, Filter, Calendar, FileText, UserPlus, User, ArrowRight, X, Info, ClipboardList
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "../contexts/ToastContext";

const statutConfig: Record<string, { label: string, color: string, icon: any }> = {
  en_attente: { label: "En attente", color: "bg-orange-100 text-orange-700 border-orange-200", icon: Clock },
  accepte: { label: "Accepté", color: "bg-blue-100 text-blue-700 border-blue-200", icon: CheckCircle },
  refuse: { label: "Refusé", color: "bg-red-100 text-red-700 border-red-200", icon: XCircle },
  transfere: { label: "Transféré", color: "bg-green-100 text-green-700 border-green-200", icon: ArrowLeftRight },
};

export function GestionnaireTransferts() {
  const [transferts, setTransferts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"envoi" | "reception" | "archive">("envoi");
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedTransfert, setSelectedTransfert] = useState<any>(null);
  const { showToast } = useToast();

  useEffect(() => {
    loadTransferts();
  }, []);

  const loadTransferts = async () => {
    setLoading(true);
    try {
      const data = await transfertsAPI.list();
      setTransferts(data);
    } catch (err) {
      showToast("Impossible de charger les transferts", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: number, statut: string) => {
    try {
      await transfertsAPI.update(id, { statut });
      showToast(`Flux ${statut === 'accepte' ? 'accepté' : statut === 'refuse' ? 'refusé' : 'finalisé'}`, "success");
      loadTransferts();
    } catch (err) {
      showToast("Erreur lors de la mise à jour", "error");
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
    <div className="min-h-full bg-slate-50/50 p-6 lg:p-10 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight leading-none mb-2">Gestion des <span className="text-blue-600">Flux</span></h1>
          <p className="text-slate-900 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
            Interconnexion et transferts de dossiers médicaux
          </p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-blue-200 active:scale-95">
          <Plus className="w-5 h-5" /> Nouveau Transfert
        </button>
      </div>

      {/* Tabs and Filters */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-6 bg-white p-3 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex gap-1.5 p-1 bg-slate-50 rounded-2xl w-full lg:w-auto">
          {[
            { id: "envoi", label: "Émissions", icon: Send },
            { id: "reception", label: "Réceptions", icon: Inbox },
            { id: "archive", label: "Archives", icon: Clock },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center justify-center gap-3 px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex-1 md:flex-none ${activeTab === tab.id
                  ? "bg-white text-blue-600 shadow-md border border-slate-200"
                  : "text-slate-900 hover:text-blue-600"
                }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full lg:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-900" />
          <input
            type="text"
            placeholder="Rechercher un dossier ou un patient..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-6 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:bg-white focus:border-blue-500 font-bold text-slate-900 text-xs transition-all shadow-inner"
          />
        </div>
      </div>

      {/* List Section */}
      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center bg-white rounded-[3rem] border border-slate-100">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Chargement des flux...</p>
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
                  className={`p-6 bg-white rounded-[2.5rem] border-2 group transition-all hover:shadow-2xl hover:shadow-blue-200/10 ${t.priorite === "urgente" ? "border-rose-100 bg-rose-50/10" : "border-slate-50"
                    }`}
                >
                  <div className="flex flex-col lg:flex-row items-center gap-8">
                    <div className="flex items-center gap-6 flex-1 min-w-0 w-full">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 border shadow-sm ${t.type === "envoi" ? "bg-blue-600 text-white shadow-blue-200" : "bg-emerald-600 text-white shadow-emerald-200"
                        }`}>
                        {t.type === "envoi" ? <Send className="w-6 h-6" /> : <Inbox className="w-6 h-6" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-black text-slate-900 text-lg uppercase tracking-tight truncate group-hover:text-blue-600 transition-colors">{t.patient_nom}</h3>
                          {t.priorite === "urgente" && (
                            <span className="flex items-center gap-1.5 text-[8px] font-black text-rose-600 bg-white border border-rose-100 px-2.5 py-1 rounded-full animate-pulse uppercase tracking-widest">
                              CRITIQUE
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-slate-900 font-black uppercase tracking-widest opacity-60">
                          <span>Dossier #{t.numero_dossier}</span>
                          <div className="w-1 h-1 bg-slate-300 rounded-full" />
                          <span>Le {new Date(t.date_demande).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 px-6 py-3 bg-slate-50 rounded-2xl border border-slate-100 w-full lg:w-auto">
                      <div className="text-right min-w-[120px]">
                        <p className="text-[8px] font-black text-slate-900 uppercase tracking-widest opacity-40 mb-1">Émetteur</p>
                        <p className="text-[10px] font-black text-slate-900 truncate">{t.etab_source}</p>
                      </div>
                      <ArrowLeftRight className="w-4 h-4 text-blue-600" />
                      <div className="min-w-[120px]">
                        <p className="text-[8px] font-black text-slate-900 uppercase tracking-widest opacity-40 mb-1">Récepteur</p>
                        <p className="text-[10px] font-black text-slate-900 truncate">{t.etab_dest}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 ml-auto w-full lg:w-auto justify-between lg:justify-end">
                      <div className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border flex items-center gap-2 ${sc.color}`}>
                        <StatusIcon className="w-3.5 h-3.5" /> {sc.label}
                      </div>

                      <div className="flex gap-2">
                        {t.statut === "en_attente" && (
                          <>
                            <button onClick={() => handleAction(t.id, "accepte")} className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center hover:bg-emerald-700 transition-all shadow-lg active:scale-90">
                              <CheckCircle className="w-5 h-5" />
                            </button>
                            <button onClick={() => handleAction(t.id, "refuse")} className="w-10 h-10 bg-white text-rose-600 border-2 border-rose-100 rounded-xl flex items-center justify-center hover:bg-rose-50 transition-all active:scale-90">
                              <XCircle className="w-5 h-5" />
                            </button>
                          </>
                        )}
                        {t.statut === "accepte" && (
                          <button onClick={() => handleAction(t.id, "transfere")} className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg active:scale-95">
                            Transférer
                          </button>
                        )}
                        <button 
                          onClick={() => setSelectedTransfert(t)}
                          className="w-10 h-10 bg-slate-100 text-slate-900 rounded-xl flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-90"
                        >
                          <FileText className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        ) : (
          <div className="py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
            <Search className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-900 font-black uppercase tracking-widest text-[10px]">Aucun transfert dans cette catégorie</p>
          </div>
        )}
      </div>

      {/* Modale de création */}
      <AnimatePresence>
        {showModal && (
          <NouveauTransfertModal 
            onClose={() => setShowModal(false)} 
            onSave={() => { loadTransferts(); setShowModal(false); }} 
          />
        )}
      </AnimatePresence>

      {/* Modale de Détails du Transfert (Le petit papier) */}
      <AnimatePresence>
        {selectedTransfert && (
          <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md flex items-center justify-center z-[150] p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[3rem] shadow-2xl w-full max-w-lg border border-slate-100 overflow-hidden">
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-xl shadow-blue-100 border border-blue-50">
                    <ClipboardList className="w-7 h-7"/>
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-none">Détails <span className="text-blue-600">Flux</span></h2>
                    <p className="text-blue-900 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Récapitulatif de l'opération</p>
                  </div>
                </div>
                <button onClick={() => setSelectedTransfert(null)} className="w-10 h-10 flex items-center justify-center hover:bg-rose-50 text-slate-900 rounded-full transition-all border border-slate-100">
                  <X className="w-6 h-6"/>
                </button>
              </div>

              <div className="p-8 space-y-8">
                <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest opacity-40 mb-1">Patient</p>
                      <h3 className="text-xl font-black text-slate-900 uppercase">{selectedTransfert.patient_nom}</h3>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest opacity-40 mb-1">Dossier</p>
                      <p className="text-sm font-black text-blue-600">#{selectedTransfert.numero_dossier}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white rounded-2xl border border-slate-100">
                      <p className="text-[8px] font-black text-slate-900 uppercase tracking-widest opacity-40 mb-1">Priorité</p>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${selectedTransfert.priorite === 'urgente' ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {selectedTransfert.priorite}
                      </span>
                    </div>
                    <div className="p-4 bg-white rounded-2xl border border-slate-100">
                      <p className="text-[8px] font-black text-slate-900 uppercase tracking-widest opacity-40 mb-1">Type</p>
                      <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">
                        {selectedTransfert.type === 'envoi' ? 'Émission' : 'Réception'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-[11px] font-black text-slate-900 uppercase tracking-widest ml-1">Motif & Justification Clinique</label>
                  <div className="w-full px-8 py-6 bg-blue-50/30 border-2 border-blue-100 rounded-[2.5rem] font-bold text-slate-900 text-sm italic leading-relaxed">
                    "{selectedTransfert.motif}"
                  </div>
                </div>

                <div className="flex items-center gap-3 p-5 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                  <p className="text-xs font-bold text-emerald-900">Ce flux est crypté de bout en bout et conforme aux normes de sécurité CarnetPlus.</p>
                </div>
              </div>

              <div className="p-8 pt-0">
                <button onClick={() => setSelectedTransfert(null)} className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl active:scale-95">
                  Fermer l'aperçu
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
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
    }).catch(() => showToast("Erreur de chargement des ressources", "error"));
  }, []);

  const handleCreate = async () => {
    if (!form.patient_id || !form.etab_dest_id || !form.motif) {
      return showToast("Veuillez remplir tous les champs obligatoires", "warning");
    }
    setLoading(true);
    try {
      await transfertsAPI.create({ ...form, patient_id: Number(form.patient_id), etab_dest_id: Number(form.etab_dest_id), etab_source_id: 1 });
      showToast("Demande de flux créée avec succès", "success");
      onSave();
    } catch (err) {
      showToast("Erreur lors de la création", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md flex items-center justify-center z-[100] p-4">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }} 
        animate={{ scale: 1, opacity: 1, y: 0 }} 
        className="bg-white rounded-[3.5rem] shadow-2xl w-full max-w-2xl border-2 border-slate-100 overflow-hidden"
      >
        <div className="h-2 bg-blue-600 w-full shadow-[0_0_15px_rgba(37,99,235,0.3)]"/>

        <div className="p-8 pb-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-xl shadow-blue-100 border border-blue-50">
              <ArrowLeftRight className="w-7 h-7"/>
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-none">Configuration <span className="text-blue-600">Flux</span></h2>
              <p className="text-blue-900 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Échange sécurisé de données cliniques</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center hover:bg-rose-50 text-slate-900 rounded-full transition-all border border-slate-100">
            <X className="w-6 h-6"/>
          </button>
        </div>
        
        <div className="p-10 space-y-10 overflow-y-auto max-h-[70vh]">
          <div className="space-y-6">
            <h3 className="text-[11px] font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-3">
              <span className="w-2 h-2 bg-blue-600 rounded-full"/> Acteurs du Transfert
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="block text-[11px] font-black text-slate-900 uppercase tracking-widest ml-1">Patient Concerné</label>
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

              <div className="space-y-3">
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
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-[11px] font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-3">
              <span className="w-2 h-2 bg-blue-600 rounded-full"/> Paramètres Opérationnels
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="block text-[11px] font-black text-slate-900 uppercase tracking-widest ml-1">Sens de l'opération</label>
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
                          ? "bg-white text-slate-900 shadow-xl border border-slate-200 scale-[1.02]" 
                          : "text-slate-900 opacity-40 hover:opacity-100"
                      }`}
                    >
                      <t.icon className="w-4 h-4"/>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-[11px] font-black text-slate-900 uppercase tracking-widest ml-1">Priorité du canal</label>
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
                          : "text-slate-900 opacity-40 hover:opacity-100"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-[11px] font-black text-slate-900 uppercase tracking-widest ml-1">Motif Clinique & Justification</label>
            <textarea 
              value={form.motif} 
              onChange={e=>setForm({...form, motif: e.target.value})} 
              rows={3}
              placeholder="Saisissez ici les détails médicaux justifiant le transfert..."
              className="w-full px-8 py-6 bg-white border-2 border-slate-200 rounded-[2.5rem] focus:border-blue-600 outline-none font-bold text-slate-900 text-sm transition-all resize-none shadow-inner placeholder:text-slate-300" 
            />
          </div>
        </div>

        <div className="p-10 border-t border-slate-100 bg-slate-50/50 flex gap-6">
          <button 
            onClick={handleCreate} 
            disabled={loading}
            className="flex-1 py-6 bg-slate-900 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-2xl shadow-blue-200 disabled:opacity-50 active:scale-[0.98] flex items-center justify-center gap-4"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
            ) : (
              <>Valider l'opération <ArrowRight className="w-4 h-4"/></>
            )}
          </button>
          <button 
            onClick={onClose} 
            className="px-12 py-6 bg-white text-slate-900 border-2 border-slate-900 rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all active:scale-[0.98]"
          >
            Annuler
          </button>
        </div>
      </motion.div>
    </div>
  );
}
