import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { examensAPI } from "../services/api";
import { TestTube, CheckCircle, Clock, AlertCircle, Search, Filter, ArrowUpRight, Download, FlaskConical, Beaker, User, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDate } from "../utils/format";

export function LaboAnalyses() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"en-cours" | "termines">("en-cours");
  const [examens, setExamens]     = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [selectedExamen, setSelectedExamen] = useState<any>(null);
  const [resultat, setResultat]   = useState("");
  const [saving, setSaving]       = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await examensAPI.list();
      setExamens(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveResult = async () => {
    if (!selectedExamen || !resultat) return;
    setSaving(true);
    try {
      await examensAPI.update(selectedExamen.id, { 
        resultat, 
        statut: 'termine',
        date_termine: new Date().toISOString() 
      });
      setSelectedExamen(null);
      setResultat("");
      loadData();
    } catch (err) {
      console.error("Erreur sauvegarde résultat:", err);
    } finally {
      setSaving(false);
    }
  };

  const filtered = examens.filter(e => 
    (e.patient_nom || "").toLowerCase().includes(search.toLowerCase()) ||
    (e.type_examen || "").toLowerCase().includes(search.toLowerCase())
  );

  const list = activeTab === "en-cours" 
    ? filtered.filter(e => e.statut !== 'termine' && e.statut !== 'transmis')
    : filtered.filter(e => e.statut === 'termine' || e.statut === 'transmis');

  return (
    <div className="animate-fadeIn bg-slate-50/50 min-h-screen w-full max-w-full overflow-x-hidden flex flex-col">
      {/* Modern FIXED Header - Premium White */}
      <div className="fixed top-0 left-0 lg:left-64 right-0 z-50 bg-white border-b-2 border-slate-200 shadow-md h-[90px] flex items-center shrink-0">
        <div className="px-6 md:px-10 flex flex-row justify-between items-center w-full gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="w-1.5 h-10 bg-teal-600 rounded-full shrink-0 shadow-sm shadow-teal-200" />
            <div>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight leading-none">Gestion des Analyses</h1>
              <p className="text-slate-500 text-[9px] md:text-[10px] font-bold uppercase tracking-widest mt-1">{filtered.length} examens répertoriés</p>
            </div>
          </div>
          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-teal-600 transition-colors" />
            <input 
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-teal-500 transition-all shadow-inner"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 md:px-10 pb-12 pt-[130px] md:pt-[140px]">
        <div className="max-w-6xl mx-auto space-y-8">
          
          <div className="flex bg-white/80 backdrop-blur-md p-2 rounded-[1.5rem] border-2 border-slate-100 shadow-sm w-full md:w-auto overflow-x-auto no-scrollbar">
            {[
              { id: 'en-cours', label: 'En cours', count: filtered.filter(e => e.statut !== 'termine' && e.statut !== 'transmis').length },
              { id: 'termines', label: 'Terminés', count: filtered.filter(e => e.statut === 'termine' || e.statut === 'transmis').length }
            ].map(t => (
              <button 
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`flex-1 md:flex-none px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all relative flex items-center gap-3 shrink-0 ${activeTab === t.id ? "bg-teal-600 text-white shadow-lg shadow-teal-100" : "text-slate-600 hover:bg-slate-50"}`}
              >
                {t.label}
                <span className={`px-2 py-0.5 rounded-lg text-[9px] ${activeTab === t.id ? "bg-white/20 text-white" : "bg-slate-100"}`}>{t.count}</span>
              </button>
            ))}
          </div>

          <div className="grid gap-6">
            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid gap-6">
                {list.map((e, i) => (
                  <div key={i} className={`p-4 md:p-8 bg-white rounded-[2rem] md:rounded-[3.5rem] border-2 transition-all hover:scale-[1.01] hover:shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between group gap-4 relative overflow-hidden ${e.urgence ? "border-rose-100" : "border-slate-100 shadow-sm"}`}>
                    <div className="flex items-center gap-4 md:gap-8">
                      <div className={`w-14 h-14 md:w-20 md:h-20 rounded-[1.2rem] md:rounded-[2.2rem] flex items-center justify-center border-2 transition-transform group-hover:rotate-12 ${e.urgence ? "bg-rose-500 border-rose-400 text-white shadow-rose-200" : "bg-slate-50 border-slate-100 text-teal-600"} shadow-xl shrink-0`}>
                        {activeTab === 'en-cours' ? <Beaker className="w-6 h-6 md:w-8 md:h-8" /> : <CheckCircle className="w-6 h-6 md:w-8 md:h-8" />}
                      </div>
                      <div>
                        <h3 className="text-lg md:text-2xl font-black text-slate-900 uppercase tracking-tight group-hover:text-teal-600 transition-colors">{e.patient_nom}</h3>
                        <div className="flex flex-wrap items-center gap-4 md:gap-6 mt-1 md:mt-2">
                          <p className="text-[8px] md:text-[10px] text-slate-600 font-black uppercase tracking-widest flex items-center gap-1.5 md:gap-2">
                            <FlaskConical className="w-3 h-3 md:w-4 md:h-4 text-teal-500"/> {e.type_examen}
                          </p>
                          <span className="hidden md:block w-1.5 h-1.5 bg-slate-300 rounded-full"/>
                          <p className="text-[8px] md:text-[10px] text-slate-600 font-black uppercase tracking-widest flex items-center gap-1.5 md:gap-2">
                            <Clock className="w-3 h-3 md:w-4 md:h-4 text-orange-500"/> {formatDate(e.date_demande)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 md:gap-4 relative z-10 w-full md:w-auto">
                      {activeTab === 'en-cours' ? (
                        <button 
                          onClick={(evt) => { 
                            evt.preventDefault(); 
                            evt.stopPropagation(); 
                            setSelectedExamen(e); 
                            setResultat(e.resultat || "");
                          }}
                          className="flex-1 md:flex-none px-6 md:px-10 py-3 md:py-5 bg-teal-600 text-white rounded-[1rem] md:rounded-[1.5rem] font-black text-[9px] md:text-[10px] uppercase shadow-lg shadow-teal-500/20 hover:bg-teal-500 transition-all active:scale-95"
                        >
                          Saisir Résultats
                        </button>
                      ) : (
                        <button 
                          onClick={(evt) => { 
                            evt.preventDefault(); 
                            evt.stopPropagation(); 
                            setSelectedExamen(e); 
                            setResultat(e.resultat || "");
                          }}
                          className="flex-1 md:flex-none px-6 md:px-10 py-3 md:py-5 bg-teal-50 text-teal-600 rounded-[1rem] md:rounded-[1.5rem] font-black text-[9px] md:text-[10px] uppercase border-2 border-teal-100 hover:bg-teal-600 hover:text-white transition-all flex items-center justify-center gap-2 md:gap-3"
                        >
                          <CheckCircle className="w-4 h-4"/> Détails / Modifier
                        </button>
                      )}
                      <div 
                        className="w-10 h-10 md:w-16 md:h-16 bg-slate-50 text-slate-500 rounded-xl md:rounded-[1.5rem] flex items-center justify-center hover:text-teal-600 hover:bg-teal-50 transition-all cursor-pointer shrink-0"
                      >
                        <ArrowUpRight className="w-5 h-5 md:w-6 md:h-6"/>
                      </div>
                    </div>
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50/50 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
                  </div>
                ))}
                {list.length === 0 && (
                  <div className="py-32 text-center bg-white border-4 border-dashed border-slate-50 rounded-[4rem]">
                    <TestTube className="w-20 h-20 text-slate-100 mx-auto mb-6"/>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Aucune analyse à afficher</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Modal de Saisie de Résultats */}
      <AnimatePresence>
        {selectedExamen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedExamen(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-2xl rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl overflow-hidden border border-white/20"
            >
              <div className="p-6 md:p-12 space-y-6 md:space-y-8">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h2 className="text-xl md:text-3xl font-black text-slate-900 uppercase tracking-tight">
                      {selectedExamen.statut === 'termine' ? "Modifier le Résultat" : "Saisie de Résultat"}
                    </h2>
                    <p className="text-slate-600 text-[9px] md:text-xs font-black uppercase tracking-widest mt-1 md:mt-2">
                      Patient: <span className="text-teal-600 font-black">{selectedExamen.patient_nom}</span> • Examen: {selectedExamen.type_examen}
                    </p>
                  </div>
                  <button onClick={() => setSelectedExamen(null)} className="p-2 md:p-4 bg-slate-50 rounded-xl md:rounded-2xl hover:bg-rose-50 hover:text-rose-600 transition-all text-slate-600 shrink-0">
                    <X className="w-5 h-5 md:w-6 md:h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-4">Conclusions de l'analyse</label>
                  <textarea 
                    value={resultat}
                    onChange={e => setResultat(e.target.value)}
                    placeholder="Saisissez ici les résultats détaillés..."
                    className="w-full h-48 md:h-64 p-6 md:p-8 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] md:rounded-[2.5rem] text-sm font-medium focus:outline-none focus:border-teal-500 focus:bg-white transition-all resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => setSelectedExamen(null)}
                    className="w-full py-5 bg-white text-slate-500 border-2 border-slate-200 rounded-2xl font-black text-[10px] uppercase hover:bg-slate-50 transition-all active:scale-95"
                  >
                    Annuler
                  </button>
                  <button 
                    onClick={handleSaveResult}
                    disabled={saving || !resultat}
                    className={`w-full py-5 rounded-2xl font-black text-[10px] uppercase shadow-xl transition-all active:scale-95 ${
                      saving || !resultat ? "bg-slate-200 text-slate-600 cursor-not-allowed" : "bg-teal-600 text-white shadow-teal-500/20 hover:shadow-teal-500/40"
                    }`}
                  >
                    {saving ? "Enregistrement..." : selectedExamen.statut === 'termine' ? "Modifier le Résultat" : "Valider et Transmettre"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

