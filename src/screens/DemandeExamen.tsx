import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Card } from "../components/Card";
import { examensAPI, patientsAPI } from "../services/api";
import { ArrowLeft, Save, TestTube, CheckCircle, AlertTriangle, AlertCircle, ChevronLeft, FlaskConical, Info } from "lucide-react";

const TYPES_EXAMENS = [
  { cat:"Biologie", items:["Prise de sang (NFS)","Glycémie à jeun","Bilan lipidique","Bilan hépatique","Créatinine","Ionogramme","TSH","HbA1c"], color:"blue" },
  { cat:"Imagerie",  items:["Radiographie pulmonaire","Échographie abdominale","Scanner thoracique","IRM cérébrale","Mammographie","Ostéodensitométrie"], color:"emerald" },
  { cat:"Cardiologie",items:["ECG","Échocardiographie","Test d'effort","Holter ECG 24h"], color:"rose" },
  { cat:"Autre",     items:["Spirométrie","EEG","Électromyogramme","Autre (préciser)"], color:"purple" },
];

export function DemandeExamen() {
  const navigate = useNavigate();
  const { id }   = useParams();
  const [searchParams] = useSearchParams();
  const consultationId = searchParams.get("consultation_id");

  const [form, setForm] = useState({
    type_examen:"", description:"", urgence:false
  });
  const [patient, setPatient] = useState<any>(null);
  const [saved, setSaved]     = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  useEffect(() => {
    if (id) {
      patientsAPI.get(Number(id)).then(setPatient).catch(console.error);
    }
  }, [id]);

  const handleSave = async () => {
    if (!form.type_examen.trim()) { setError("Veuillez sélectionner ou saisir un type d'examen"); return; }
    setError(""); setLoading(true);
    try {
      await examensAPI.create({
        ...form,
        patient_id: Number(id),
        consultation_id: consultationId ? Number(consultationId) : null,
        urgence: form.urgence ? 1 : 0
      });
      setSaved(true);
      setTimeout(()=>navigate(`/medecin/dossier/${id}`), 1800);
    } catch (err: any) {
      setError(err.message || "Erreur lors de la transmission de la demande");
    } finally {
      setLoading(false);
    }
  };

  if (saved) return (
    <div className="p-8 animate-scaleIn flex items-center justify-center min-h-[80vh] bg-slate-200">
      <Card className="max-w-md w-full p-12 rounded-[3rem] border-2 border-slate-200 shadow-2xl shadow-slate-200/50 text-center bg-white">
        <div className="w-24 h-24 bg-emerald-50 border-2 border-emerald-100 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-sm">
          <CheckCircle className="w-12 h-12 text-emerald-600"/>
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight uppercase">Examen Transmis !</h2>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-6 opacity-80">La demande a été envoyée au laboratoire central.</p>
        <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest italic bg-slate-50 py-3 rounded-xl border border-slate-100">Redirection automatique...</p>
      </Card>
    </div>
  );

  return (
    <div className="animate-fadeIn bg-slate-50 min-h-screen w-full max-w-full overflow-x-hidden">
      <div className="px-6 md:px-10 pb-12 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-6">
            {/* Urgency Alert Toggle */}
            <div
              onClick={() => setForm(f => ({ ...f, urgence: !f.urgence }))}
              className={`p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border-2 transition-all cursor-pointer flex items-center justify-between group shadow-xl ${form.urgence ? "bg-rose-50 border-rose-400 shadow-rose-200/20" : "bg-white border-slate-200 shadow-slate-200/20 hover:border-rose-300"}`}
            >
              <div className="flex items-center gap-4 md:gap-5">
                <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center transition-all border-2 shadow-sm shrink-0 ${form.urgence ? "bg-rose-600 border-rose-500 text-white animate-pulse" : "bg-rose-50 border-rose-100 text-rose-500"}`}>
                  <AlertTriangle className="w-6 h-6 md:w-7 md:h-7" />
                </div>
                <div className="min-w-0">
                  <p className={`font-black uppercase tracking-tight text-base md:text-lg truncate ${form.urgence ? "text-rose-700" : "text-slate-900"}`}>Examen Prioritaire (URGENT)</p>
                  <p className={`text-[8px] md:text-[10px] font-black uppercase tracking-widest mt-1 opacity-80 truncate ${form.urgence ? "text-rose-600" : "text-slate-600"}`}>Alerte immédiate au biologiste</p>
                </div>
              </div>
              <div className={`w-12 md:w-16 h-6 md:h-8 rounded-full transition-all relative border-2 shrink-0 ${form.urgence ? "bg-rose-600 border-rose-500 shadow-inner" : "bg-slate-100 border-slate-200"}`}>
                <span className={`absolute top-0.5 w-4.5 md:w-6 h-4.5 md:h-6 bg-white rounded-full shadow-lg transition-all ${form.urgence ? "left-6 md:left-8" : "left-0.5"}`} />
              </div>
            </div>

            {/* Type of Exam Selection */}
            <Card className="rounded-[2.5rem] md:rounded-[3rem] border-2 border-slate-200 shadow-2xl shadow-slate-200/50 p-6 md:p-10 bg-white">
              <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-8 md:mb-10 flex items-center gap-4 uppercase tracking-tight">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-50 rounded-xl md:rounded-2xl flex items-center justify-center border border-purple-100 shadow-sm">
                  <TestTube className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
                </div>
                Sélection des examens <span className="text-rose-500 text-2xl md:text-3xl leading-none">*</span>
              </h2>

              <div className="space-y-10">
                {TYPES_EXAMENS.map(({ cat, items, color }) => (
                  <div key={cat} className="space-y-4">
                    <div className="flex items-center gap-4 ml-2 mb-6 border-b border-slate-50 pb-4">
                      <p className="text-[11px] font-black text-purple-700 uppercase tracking-[0.2em]">{cat}</p>
                      <div className="flex-1 h-px bg-slate-100" />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-3">
                      {items.map(item => (
                        <button
                          key={item}
                          onClick={() => setForm(f => ({ ...f, type_examen: item }))}
                          className={`px-3 md:px-5 py-3 md:py-4 rounded-xl md:rounded-2xl text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-all border-2 text-left flex items-center justify-between group/btn ${form.type_examen === item ? `bg-purple-600 border-purple-500 text-white shadow-xl shadow-purple-200 scale-[1.02]` : `bg-white border-slate-100 text-slate-600 hover:border-purple-300 hover:bg-purple-50/50 hover:text-purple-700`}`}
                        >
                          <span className="truncate">{item}</span>
                          {form.type_examen === item && <CheckCircle className="w-3 h-3 md:w-4 md:h-4 text-white/50 flex-shrink-0" />}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="pt-8 border-t-2 border-slate-50">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-3 block">Saisie libre du type d'examen</label>
                  <input
                    value={form.type_examen}
                    onChange={e => setForm(f => ({ ...f, type_examen: e.target.value }))}
                    placeholder="Ex: Analyse spécifique..."
                    className="w-full px-6 py-5 border-2 border-slate-200 rounded-[1.5rem] bg-slate-50 focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none text-sm font-bold transition-all text-slate-900 placeholder-slate-300 shadow-inner"
                  />
                </div>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card className="rounded-[2.5rem] md:rounded-[3rem] border-2 border-slate-200 shadow-2xl shadow-slate-200/50 p-6 md:p-10 bg-white">
              <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-8 md:mb-10 flex items-center gap-4 uppercase tracking-tight">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-50 rounded-xl md:rounded-2xl flex items-center justify-center border border-blue-100 shadow-sm">
                  <Info className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                </div>
                Contexte Médical
              </h2>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={8}
                placeholder="Saisissez les indications cliniques pour le laboratoire..."
                className="w-full px-6 py-5 border-2 border-slate-200 rounded-[1.5rem] bg-slate-50 focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none text-sm font-bold transition-all text-slate-900 placeholder-slate-300 shadow-inner resize-none"
              />
            </Card>

            {/* Result Preview */}
            {form.type_examen && (
              <div className="p-6 bg-purple-50 border border-purple-100 rounded-[2rem] animate-fadeInUp">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse" />
                  <p className="text-[10px] font-black text-purple-900 uppercase tracking-widest">Récapitulatif de demande</p>
                </div>
                <p className="text-lg font-black text-purple-900 mb-2">{form.type_examen}</p>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase ${form.urgence ? 'bg-rose-500 text-white' : 'bg-purple-100 text-purple-600'}`}>
                    {form.urgence ? 'Priorité : Haute' : 'Priorité : Standard'}
                  </span>
                  <span className="text-[8px] font-black text-purple-400 uppercase tracking-widest">Destinataire : Laboratoire Central</span>
                </div>
              </div>
            )}

            <div className="pt-4 space-y-4">
              <button
                onClick={handleSave}
                disabled={loading}
                className="w-full py-6 bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest hover:shadow-2xl hover:shadow-purple-300 transition-all flex items-center justify-center gap-4 shadow-xl shadow-purple-500/30 border-2 border-purple-400 active:scale-95"
              >
                {loading ? (
                  <div className="w-7 h-7 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                ) : <><Save className="w-6 h-6" /> TRANSMETTRE AU LABORATOIRE</>}
              </button>
              <button onClick={() => navigate(`/medecin/dossier/${id}`)}
                className="w-full py-5 bg-white border-2 border-slate-100 text-slate-600 rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm"
              >
                Annuler la prescription
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

