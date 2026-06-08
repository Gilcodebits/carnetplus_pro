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
import { useAuth } from "../contexts/AuthContext";
import { formatDate } from "../utils/format";

const statutConfig: Record<string, { label: string, color: string, icon: any }> = {
  en_attente: { label: "En attente", color: "bg-orange-50 text-orange-600 border-orange-100", icon: Clock },
  accepte: { label: "Accepté", color: "bg-emerald-50 text-emerald-600 border-emerald-100", icon: CheckCircle },
  refuse: { label: "Refusé", color: "bg-rose-50 text-rose-600 border-rose-100", icon: XCircle },
  transfere: { label: "Transféré", color: "bg-blue-50 text-blue-600 border-blue-100", icon: ArrowLeftRight },
};

export function GestionnaireTransferts() {
  const { user } = useAuth();
  const myEtabId = user?.etablissement_id ? Number(user.etablissement_id) : 0;
  const [transferts, setTransferts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"envoi" | "reception" | "archive">("envoi");
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedTransfert, setSelectedTransfert] = useState<any>(null);
  const [refusalModal, setRefusalModal] = useState<{ show: boolean; id: number | null }>({ show: false, id: null });
  const [refusalReason, setRefusalReason] = useState("");
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

  const handleAction = async (id: number, statut: string, notes?: string) => {
    try {
      await transfertsAPI.update(id, { statut, notes });
      showToast(`Flux ${statut === 'accepte' ? 'accepté ✓' : statut === 'refuse' ? 'refusé — motif transmis' : 'finalisé ✓'}`, statut === 'refuse' ? 'error' : 'success');
      loadTransferts();
    } catch (err) {
      showToast("Erreur lors de la mise à jour", "error");
    }
  };

  const handleRefuse = async () => {
    if (!refusalModal.id) return;
    if (refusalReason.trim().length < 10) {
      return showToast("Le motif de refus doit contenir au moins 10 caractères", "warning");
    }
    await handleAction(refusalModal.id, 'refuse', refusalReason);
    setRefusalModal({ show: false, id: null });
    setRefusalReason("");
  };

  // Calcul de la perspective : envoi = j'envoie (source = mon étab), réception = je reçois (dest = mon étab)
  const filtered = transferts.filter(t => {
    const isEnvoi = Number(t.etablissement_source_id) === myEtabId;
    const isReception = Number(t.etablissement_dest_id) === myEtabId;
    const isActive = t.statut !== 'transfere' && t.statut !== 'refuse';

    const matchesTab = activeTab === 'archive'
      ? (t.statut === 'transfere' || t.statut === 'refuse')
      : activeTab === 'envoi'
        ? (isEnvoi && isActive)
        : (isReception && isActive);

    const matchesSearch = t.patient_nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.numero_dossier?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesTab && matchesSearch;
  });

  return (
    <div className="animate-fadeIn bg-slate-50/50 min-h-screen w-full max-w-full overflow-x-hidden flex flex-col">
      <div className="px-6 md:px-10 pb-12 pt-6 space-y-10">

        {/* Tabs and Filters */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-6 bg-white p-2 md:p-3 rounded-2xl md:rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex gap-1 p-1 bg-slate-50 rounded-xl md:rounded-2xl w-full lg:w-auto overflow-x-auto no-scrollbar">
            {[
              { id: "envoi", label: "Émissions", icon: Send },
              { id: "reception", label: "Réceptions", icon: Inbox },
              { id: "archive", label: "Archives", icon: Clock },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center justify-center gap-2 md:gap-3 px-3 md:px-6 py-2.5 md:py-3 rounded-lg md:rounded-xl text-[8px] md:text-[9px] font-black uppercase tracking-widest transition-all flex-1 md:flex-none whitespace-nowrap shrink-0 ${activeTab === tab.id
                  ? "bg-white text-blue-600 shadow-md border border-slate-200"
                  : "text-slate-900 hover:text-blue-600"
                  }`}
              >
                <tab.icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
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
                const isSource = Number(t.etablissement_source_id) === myEtabId;
                const isDest = Number(t.etablissement_dest_id) === myEtabId;
                const canValidate = (t.type === 'envoi' && isDest) || (t.type === 'reception' && isSource);
                const canFinalize = (t.type === 'envoi' && isSource) || (t.type === 'reception' && isDest);
                return (
                  <motion.div
                    key={t.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`p-4 md:p-6 bg-white rounded-[1.5rem] md:rounded-[2.5rem] border-2 group transition-all hover:shadow-2xl hover:shadow-blue-200/10 ${t.priorite === "urgente" ? "border-rose-100 bg-rose-50/10" : "border-slate-50 shadow-sm"
                      }`}
                  >
                    <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 md:gap-8">
                      <div className="flex items-center gap-4 md:gap-6 flex-1 min-w-0 w-full">
                        <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0 border shadow-sm ${t.type === "envoi" ? "bg-blue-600 text-white shadow-blue-200" : "bg-emerald-600 text-white shadow-emerald-200"
                          }`}>
                          {t.type === "envoi" ? <Send className="w-5 h-5 md:w-6 md:h-6" /> : <Inbox className="w-5 h-5 md:w-6 md:h-6" />}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 md:gap-3 mb-0.5 md:mb-1">
                            <h3 className="font-black text-slate-900 text-base md:text-lg uppercase tracking-tight truncate group-hover:text-blue-600 transition-colors">{t.patient_nom}</h3>
                            {t.priorite === "urgente" && (
                              <span className="flex items-center gap-1.5 text-[7px] md:text-[8px] font-black text-rose-600 bg-white border border-rose-100 px-2 py-0.5 md:py-1 rounded-full animate-pulse uppercase tracking-widest">
                                CRITIQUE
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 md:gap-3 text-[8px] md:text-[10px] text-slate-900 font-black uppercase tracking-widest opacity-90">
                            <span>#{t.numero_dossier}</span>
                            <div className="w-1 h-1 bg-slate-300 rounded-full" />
                            <span>{formatDate(t.date_demande)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 md:gap-6 px-4 md:px-6 py-2.5 md:py-3 bg-slate-50 rounded-xl md:rounded-2xl border border-slate-100 w-full lg:w-auto overflow-hidden">
                        <div className="text-right flex-1 lg:flex-none lg:min-w-[120px]">
                          <p className="text-[7px] md:text-[8px] font-black text-slate-900 uppercase tracking-widest opacity-80 mb-0.5 md:mb-1">De</p>
                          <p className="text-[9px] md:text-[10px] font-black text-slate-900 truncate">{t.etab_source}</p>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-600 shrink-0" />
                        <div className="flex-1 lg:flex-none lg:min-w-[120px]">
                          <p className="text-[7px] md:text-[8px] font-black text-slate-900 uppercase tracking-widest opacity-80 mb-0.5 md:mb-1">Vers</p>
                          <p className="text-[9px] md:text-[10px] font-black text-slate-900 truncate">{t.etab_dest}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 ml-auto w-full lg:w-auto justify-between lg:justify-end">
                        <div className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border flex items-center gap-2 ${sc.color}`}>
                          <StatusIcon className="w-3.5 h-3.5" /> {sc.label}
                        </div>

                        <div className="flex gap-2">
                          {t.statut === "en_attente" && (
                            canValidate ? (
                              <div className="flex flex-1 md:flex-none gap-2">
                                <button
                                  onClick={() => handleAction(t.id, "accepte")}
                                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3 md:px-4 py-2.5 bg-emerald-600 text-white rounded-lg md:rounded-xl text-[8px] md:text-[9px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg active:scale-90"
                                >
                                  <CheckCircle className="w-4 h-4 hidden md:block" /> Accepter
                                </button>
                                <button
                                  onClick={() => { setRefusalModal({ show: true, id: t.id }); setRefusalReason(""); }}
                                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3 md:px-4 py-2.5 bg-white text-rose-600 border-2 border-rose-200 rounded-lg md:rounded-xl text-[8px] md:text-[9px] font-black uppercase tracking-widest hover:bg-rose-50 transition-all active:scale-90"
                                >
                                  <XCircle className="w-4 h-4 hidden md:block" /> Refuser
                                </button>
                              </div>
                            ) : (
                              <span className="text-[9px] font-black text-orange-500 uppercase tracking-widest px-2 py-2">En attente réponse</span>
                            )
                          )}
                          {t.statut === "accepte" && (
                            canFinalize ? (
                              <button onClick={() => handleAction(t.id, "transfere")} className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg active:scale-95">
                                Finaliser
                              </button>
                            ) : (
                              <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest px-2 py-2">En attente finalisation</span>
                            )
                          )}
                          <button
                            onClick={() => setSelectedTransfert(t)}
                            title="Voir le dossier"
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

        {/* Modale de Refus avec Motif Obligatoire */}
        <AnimatePresence>
          {refusalModal.show && (
            <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md flex items-center justify-center z-[200] p-4">
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-[3rem] shadow-2xl w-full max-w-md border-2 border-rose-100 overflow-hidden"
              >
                <div className="h-2 bg-rose-500 w-full" />
                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-rose-50/30">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-rose-600 shadow-lg border border-rose-100">
                      <XCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Refuser le Transfert</h2>
                      <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mt-1">Motif obligatoire</p>
                    </div>
                  </div>
                  <button onClick={() => setRefusalModal({ show: false, id: null })} className="w-9 h-9 flex items-center justify-center hover:bg-rose-100 text-slate-500 rounded-full">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-8 space-y-6">
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
                    <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-xs font-bold text-amber-800">Le motif sera automatiquement transmis à l'établissement demandeur pour qu'il puisse orienter son patient vers un autre établissement.</p>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[11px] font-black text-slate-900 uppercase tracking-widest">
                      Motif du refus <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      value={refusalReason}
                      onChange={e => setRefusalReason(e.target.value)}
                      rows={4}
                      placeholder="Ex: Capacité d'accueil insuffisante, Manque de spécialiste disponible, Équipement non adapté..."
                      className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-200 focus:border-rose-400 rounded-2xl outline-none font-medium text-slate-900 text-sm resize-none transition-all placeholder:text-slate-500"
                    />
                    <p className={`text-[10px] font-black uppercase tracking-widest text-right ${refusalReason.length < 10 ? 'text-rose-400' : 'text-emerald-500'
                      }`}>
                      {refusalReason.length} / 10 caractères minimum
                    </p>
                  </div>
                </div>
                <div className="px-8 pb-8 grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setRefusalModal({ show: false, id: null })}
                    className="w-full py-4 bg-white text-slate-500 border-2 border-slate-200 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleRefuse}
                    disabled={refusalReason.trim().length < 10}
                    className="w-full py-4 bg-rose-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-700 transition-all shadow-lg shadow-rose-200 disabled:opacity-80 disabled:cursor-not-allowed active:scale-95"
                  >
                    Confirmer le Refus
                  </button>
                </div>
              </motion.div>
            </div>
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
                      <ClipboardList className="w-7 h-7" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-none">Détails <span className="text-blue-600">Flux</span></h2>
                      <p className="text-blue-900 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Récapitulatif de l'opération</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedTransfert(null)} className="w-10 h-10 flex items-center justify-center hover:bg-rose-50 text-slate-900 rounded-full transition-all border border-slate-100">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="p-8 space-y-8">
                  <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest opacity-90 mb-1">Patient</p>
                        <h3 className="text-xl font-black text-slate-900 uppercase">{selectedTransfert.patient_nom}</h3>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest opacity-90 mb-1">Dossier</p>
                        <p className="text-sm font-black text-blue-600">#{selectedTransfert.numero_dossier}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-white rounded-2xl border border-slate-100">
                        <p className="text-[8px] font-black text-slate-900 uppercase tracking-widest opacity-80 mb-1">Priorité</p>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${selectedTransfert.priorite === 'urgente' ? 'text-rose-600' : 'text-emerald-600'}`}>
                          {selectedTransfert.priorite}
                        </span>
                      </div>
                      <div className="p-4 bg-white rounded-2xl border border-slate-100">
                        <p className="text-[8px] font-black text-slate-900 uppercase tracking-widest opacity-80 mb-1">Type</p>
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
    </div>
  );
}

function NouveauTransfertModal({ onClose, onSave }: { onClose: () => void, onSave: () => void }) {
  const { user } = useAuth();
  const myEtabId = user?.etablissement_id ? Number(user.etablissement_id) : 0;
  const [form, setForm] = useState({ patient_id: "", etab_dest_id: "", motif: "", type: "envoi", priorite: "normale" });
  const [etabs, setEtabs] = useState<any[]>([]);
  const [allPatients, setAllPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const isEmission = form.type === 'envoi';

  useEffect(() => {
    Promise.all([etablissementsAPI.list(), patientsAPI.list('', true)]).then(([e, p]) => {
      setEtabs((e as any[]).filter((et: any) => Number(et.id) !== myEtabId));
      setAllPatients(p as any[]);
    }).catch(() => showToast("Erreur de chargement des ressources", "error"));
  }, []);

  // Émission : patients de mon étab à envoyer ailleurs
  // Réception : patients d'autres étabs dont je veux recevoir le dossier
  const patients = allPatients.filter(p =>
    isEmission
      ? Number(p.etablissement_id) === myEtabId
      : Number(p.etablissement_id) !== myEtabId
  );

  // L'établissement sélectionné (pour l'affichage contextuel)
  const selectedEtab = etabs.find(e => String(e.id) === String(form.etab_dest_id));

  const handleCreate = async () => {
    if (!form.patient_id || !form.etab_dest_id || !form.motif) {
      return showToast("Veuillez remplir tous les champs obligatoires", "warning");
    }
    setLoading(true);
    try {
      const etab_source_id = isEmission ? myEtabId : Number(form.etab_dest_id);
      const etab_dest_id   = isEmission ? Number(form.etab_dest_id) : myEtabId;
      await transfertsAPI.create({
        ...form,
        patient_id: Number(form.patient_id),
        etab_source_id,
        etab_dest_id
      });
      showToast(
        isEmission
          ? "Demande d'émission envoyée — en attente de confirmation"
          : "Demande de réception envoyée — en attente de confirmation",
        "success"
      );
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
        className="bg-white rounded-[2rem] sm:rounded-[3.5rem] shadow-2xl w-full max-w-2xl border-2 border-slate-100 overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Barre de couleur dynamique */}
        <div className={`h-2 w-full ${isEmission ? 'bg-blue-600' : 'bg-emerald-600'}`} />

        {/* En-tête */}
        <div className="p-6 md:p-8 pb-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50 flex-shrink-0">
          <div className="flex items-center gap-5">
            <div className={`w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-xl border ${isEmission ? 'text-blue-600 shadow-blue-100 border-blue-50' : 'text-emerald-600 shadow-emerald-100 border-emerald-50'}`}>
              {isEmission ? <Send className="w-7 h-7" /> : <Inbox className="w-7 h-7" />}
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-none">
                {isEmission ? <>Flux <span className="text-blue-600">Sortant</span></> : <>Flux <span className="text-emerald-600">Entrant</span></>}
              </h2>
              <p className={`text-[10px] font-black uppercase tracking-[0.2em] mt-2 ${isEmission ? 'text-blue-700' : 'text-emerald-700'}`}>
                {isEmission ? "Envoyer un dossier vers un autre établissement" : "Demander à recevoir un dossier d'un autre établissement"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center hover:bg-rose-50 text-slate-900 rounded-full transition-all border border-slate-100">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 md:p-10 space-y-8 overflow-y-auto flex-1 no-scrollbar">

          {/* Sélection du sens */}
          <div className="space-y-3">
            <label className="block text-[11px] font-black text-slate-900 uppercase tracking-widest ml-1">Type d'opération</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setForm({ ...form, type: 'envoi', patient_id: '', etab_dest_id: '' })}
                className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all ${form.type === 'envoi' ? 'bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-100' : 'bg-white text-slate-700 border-slate-200 hover:border-blue-200'}`}
              >
                <Send className="w-6 h-6" />
                <div className="text-center">
                  <p className="text-[11px] font-black uppercase tracking-widest">Émission</p>
                  <p className={`text-[9px] font-bold mt-0.5 ${form.type === 'envoi' ? 'text-blue-100' : 'text-slate-500'}`}>J'envoie un dossier</p>
                </div>
              </button>
              <button
                onClick={() => setForm({ ...form, type: 'reception', patient_id: '', etab_dest_id: '' })}
                className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all ${form.type === 'reception' ? 'bg-emerald-600 text-white border-emerald-600 shadow-xl shadow-emerald-100' : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-200'}`}
              >
                <Inbox className="w-6 h-6" />
                <div className="text-center">
                  <p className="text-[11px] font-black uppercase tracking-widest">Réception</p>
                  <p className={`text-[9px] font-bold mt-0.5 ${form.type === 'reception' ? 'text-emerald-100' : 'text-slate-500'}`}>Je demande un dossier</p>
                </div>
              </button>
            </div>
          </div>

          {/* Bannière contextuelle explicative */}
          <div className={`flex items-start gap-4 p-4 rounded-2xl border ${isEmission ? 'bg-blue-50 border-blue-100 text-blue-900' : 'bg-emerald-50 border-emerald-100 text-emerald-900'}`}>
            <Info className={`w-5 h-5 shrink-0 mt-0.5 ${isEmission ? 'text-blue-600' : 'text-emerald-600'}`} />
            <p className="text-xs font-bold leading-relaxed">
              {isEmission
                ? "Vous allez envoyer le dossier d'un de vos patients vers un autre établissement. Cet établissement devra accepter la demande avant que le transfert soit effectif."
                : "Vous allez demander à recevoir le dossier d'un patient actuellement dans un autre établissement. L'établissement source devra confirmer avant que vous puissiez accéder au dossier."}
            </p>
          </div>

          {/* Patient et établissement */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="block text-[11px] font-black text-slate-900 uppercase tracking-widest ml-1">
                {isEmission ? "Patient à transférer" : "Patient à recevoir"}
              </label>
              <div className="relative">
                <User className={`absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 ${isEmission ? 'text-blue-600' : 'text-emerald-600'}`} />
                <select
                  value={form.patient_id}
                  onChange={e => setForm({ ...form, patient_id: e.target.value })}
                  className="w-full pl-14 pr-6 py-5 bg-white border-2 border-slate-200 rounded-2xl focus:border-blue-600 outline-none font-bold text-slate-900 text-sm appearance-none cursor-pointer transition-all"
                >
                  <option value="">{isEmission ? "Choisir un patient de mon étab..." : "Choisir un patient externe..."}</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.prenom} {p.nom} (#{p.numero_dossier})</option>)}
                </select>
              </div>
              {patients.length === 0 && (
                <p className="text-[10px] text-slate-500 font-bold ml-2 italic">
                  {isEmission ? "Aucun patient enregistré dans votre établissement." : "Aucun patient externe trouvé dans le réseau."}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <label className="block text-[11px] font-black text-slate-900 uppercase tracking-widest ml-1">
                {isEmission ? "Établissement destinataire" : "Établissement détenteur du dossier"}
              </label>
              <div className="relative">
                <Building2 className={`absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 ${isEmission ? 'text-blue-600' : 'text-emerald-600'}`} />
                <select
                  value={form.etab_dest_id}
                  onChange={e => setForm({ ...form, etab_dest_id: e.target.value })}
                  className="w-full pl-14 pr-6 py-5 bg-white border-2 border-slate-200 rounded-2xl focus:border-blue-600 outline-none font-bold text-slate-900 text-sm appearance-none cursor-pointer transition-all"
                >
                  <option value="">{isEmission ? "Choisir l'établissement cible..." : "Choisir l'établissement source..."}</option>
                  {etabs.map(e => <option key={e.id} value={e.id}>{e.nom} ({e.ville})</option>)}
                </select>
              </div>
              {selectedEtab && (
                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black ${isEmission ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'}`}>
                  <CheckCircle className="w-3.5 h-3.5" />
                  {isEmission ? `Sera notifié : ${selectedEtab.nom}` : `Sera contacté : ${selectedEtab.nom}`}
                </div>
              )}
            </div>
          </div>

          {/* Priorité */}
          <div className="space-y-3">
            <label className="block text-[11px] font-black text-slate-900 uppercase tracking-widest ml-1">Priorité</label>
            <div className="flex gap-3">
              {[
                { id: "normale", label: "Standard", desc: "Traitement dans les délais habituels" },
                { id: "urgente", label: "Critique / Urgent", desc: "Nécessite une réponse immédiate" }
              ].map(p => (
                <button
                  key={p.id}
                  onClick={() => setForm({ ...form, priorite: p.id })}
                  className={`flex-1 py-4 px-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 text-left ${form.priorite === p.id
                    ? p.id === 'urgente' ? 'bg-rose-600 text-white border-rose-600 shadow-xl' : 'bg-slate-900 text-white border-slate-900 shadow-xl'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <p>{p.label}</p>
                  <p className={`text-[8px] font-bold normal-case tracking-normal mt-1 ${form.priorite === p.id ? 'opacity-70' : 'text-slate-400'}`}>{p.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Motif */}
          <div className="space-y-3">
            <label className="block text-[11px] font-black text-slate-900 uppercase tracking-widest ml-1">
              Motif & Justification <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={form.motif}
              onChange={e => setForm({ ...form, motif: e.target.value })}
              rows={3}
              placeholder={isEmission
                ? "Ex: Patient transféré pour prise en charge spécialisée non disponible dans notre établissement..."
                : "Ex: Patient connu de notre établissement, retour pour suivi post-opératoire, demande de transfert de dossier..."
              }
              className="w-full px-8 py-6 bg-white border-2 border-slate-200 rounded-[2.5rem] focus:border-blue-600 outline-none font-bold text-slate-900 text-sm transition-all resize-none shadow-inner placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 md:p-10 border-t border-slate-100 bg-slate-50/50 grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-6 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full py-5 md:py-6 bg-white text-slate-500 border-2 border-slate-200 rounded-2xl md:rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-[0.98]"
          >
            Annuler
          </button>
          <button
            onClick={handleCreate}
            disabled={loading || !form.patient_id || !form.etab_dest_id || !form.motif}
            className={`w-full py-5 md:py-6 text-white rounded-2xl md:rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-2xl disabled:opacity-50 active:scale-[0.98] flex items-center justify-center gap-4 ${isEmission ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-200' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'}`}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>{isEmission ? "Envoyer la demande d'émission" : "Envoyer la demande de réception"} <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
