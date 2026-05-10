import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { examensAPI } from "../services/api";
import { TestTube, CheckCircle, Clock, AlertCircle, Search, Filter, ArrowUpRight, Download, FlaskConical, Beaker, User } from "lucide-react";
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

  if (loading) return (
    <div className="flex-1 flex items-center justify-center bg-slate-50 min-h-screen">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
        <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Analyses en cours...</p>
      </div>
    </div>
  );

  return (
    <div className="bg-slate-50/50 overflow-x-hidden scrollbar-hide min-h-screen">
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 px-12 py-8 space-y-8 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tight">Gestion des Analyses</h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1 flex items-center gap-2">
              <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"/> {filtered.length} examens répertoriés
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex gap-12">
            {[
              { id: 'en-cours', label: 'En cours', count: filtered.filter(e => e.statut !== 'termine' && e.statut !== 'transmis').length },
              { id: 'termines', label: 'Terminés', count: filtered.filter(e => e.statut === 'termine' || e.statut === 'transmis').length }
            ].map(t => (
              <button 
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`pb-4 text-sm font-black uppercase tracking-widest transition-all relative flex items-center gap-3 ${activeTab === t.id ? "text-teal-600" : "text-slate-400 hover:text-slate-600"}`}
              >
                {t.label}
                <span className={`px-2 py-0.5 rounded-lg text-[10px] ${activeTab === t.id ? "bg-teal-600 text-white" : "bg-slate-100"}`}>{t.count}</span>
                {activeTab === t.id && <motion.div layoutId="tab-anal" className="absolute bottom-0 left-0 right-0 h-1 bg-teal-600 rounded-full" />}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
            <input 
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un dossier ou test..."
              className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl text-xs font-bold focus:outline-none focus:border-teal-500 transition-all shadow-sm"
            />
          </div>
        </div>
      </div>

      <div className="p-12">
        <div className="grid gap-6">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid gap-6">
              {list.map((e, i) => (
                <div key={i} className={`p-8 bg-white rounded-[3.5rem] border-2 transition-all hover:scale-[1.01] hover:shadow-2xl flex items-center justify-between group ${e.urgence ? "border-rose-100" : "border-slate-50 shadow-sm"}`}>
                  <div className="flex items-center gap-8">
                    <div className={`w-20 h-20 rounded-[2.2rem] flex items-center justify-center border-2 transition-transform group-hover:rotate-12 ${e.urgence ? "bg-rose-500 border-rose-400 text-white shadow-rose-200" : "bg-slate-50 border-slate-100 text-teal-600"} shadow-xl`}>
                      {activeTab === 'en-cours' ? <Beaker className="w-8 h-8" /> : <CheckCircle className="w-8 h-8" />}
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight group-hover:text-teal-600 transition-colors">{e.patient_nom}</h3>
                      <div className="flex items-center gap-6 mt-2">
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-2">
                          <FlaskConical className="w-4 h-4 text-teal-500"/> {e.type_examen}
                        </p>
                        <span className="w-1.5 h-1.5 bg-slate-200 rounded-full"/>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-2">
                          <Clock className="w-4 h-4 text-orange-500"/> {formatDate(e.date_demande)}
                        </p>
                      </div>
                    </div>
                  </div>
                    <div className="flex items-center gap-4 relative z-10">
                      {activeTab === 'en-cours' ? (
                        <button 
                          onClick={(evt) => { 
                            evt.preventDefault(); 
                            evt.stopPropagation(); 
                            setSelectedExamen(e); 
                          }}
                          className="px-10 py-5 bg-teal-600 text-white rounded-[1.5rem] font-black text-[10px] uppercase shadow-lg shadow-teal-500/20 hover:bg-teal-500 transition-all active:scale-95"
                        >
                          Saisir Résultats
                        </button>
                      ) : (
                        <button 
                          onClick={() => navigate(`/labo/patients/${e.patient_id}`)}
                          className="px-10 py-5 bg-teal-50 text-teal-600 rounded-[1.5rem] font-black text-[10px] uppercase border-2 border-teal-100 hover:bg-teal-600 hover:text-white transition-all flex items-center gap-3"
                        >
                          <User className="w-4 h-4"/> Dossier Patient
                        </button>
                      )}
                      <div 
                        className="w-16 h-16 bg-slate-50 text-slate-300 rounded-[1.5rem] flex items-center justify-center hover:text-teal-600 hover:bg-teal-50 transition-all cursor-pointer"
                      >
                        <ArrowUpRight className="w-6 h-6"/>
                      </div>
                    </div>
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50/50 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
                </div>
              ))}
              {list.length === 0 && (
                <div className="py-32 text-center bg-white border-4 border-dashed border-slate-50 rounded-[4rem]">
                  <TestTube className="w-20 h-20 text-slate-100 mx-auto mb-6"/>
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Aucune analyse à afficher</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Modal de Saisie de Résultats */}
      <AnimatePresence>
        {selectedExamen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedExamen(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-2xl rounded-[3.5rem] shadow-2xl overflow-hidden border border-white/20"
            >
              <div className="p-12 space-y-8">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Saisie de Résultat</h2>
                    <p className="text-slate-400 text-xs font-black uppercase tracking-widest mt-2">
                      Patient: <span className="text-teal-600">{selectedExamen.patient_nom}</span> • Examen: {selectedExamen.type_examen}
                    </p>
                  </div>
                  <button onClick={() => setSelectedExamen(null)} className="p-4 bg-slate-50 rounded-2xl hover:bg-rose-50 hover:text-rose-600 transition-all text-slate-400">
                    <AlertCircle className="w-6 h-6 rotate-45" />
                  </button>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Conclusions de l'analyse</label>
                  <textarea 
                    value={resultat}
                    onChange={e => setResultat(e.target.value)}
                    placeholder="Saisissez ici les résultats détaillés, les observations et les conclusions médicales..."
                    className="w-full h-64 p-8 bg-slate-50 border-2 border-slate-100 rounded-[2.5rem] text-sm font-medium focus:outline-none focus:border-teal-500 focus:bg-white transition-all resize-none"
                  />
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => setSelectedExamen(null)}
                    className="flex-1 py-5 bg-slate-100 text-slate-400 rounded-2xl font-black text-[10px] uppercase hover:bg-slate-200 transition-all"
                  >
                    Annuler
                  </button>
                  <button 
                    onClick={handleSaveResult}
                    disabled={saving || !resultat}
                    className={`flex-[2] py-5 rounded-2xl font-black text-[10px] uppercase shadow-xl transition-all ${
                      saving || !resultat ? "bg-slate-200 text-slate-400 cursor-not-allowed" : "bg-teal-600 text-white shadow-teal-500/20 hover:shadow-teal-500/40"
                    }`}
                  >
                    {saving ? "Enregistrement..." : "Valider et Transmettre"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  </div>
);
}
