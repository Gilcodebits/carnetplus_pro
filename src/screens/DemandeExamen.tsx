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
        <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest italic bg-slate-50 py-3 rounded-xl border border-slate-100">Redirection automatique...</p>
      </Card>
    </div>
  );

  return (
    <div className="pt-6 px-10 pb-10 animate-fadeIn bg-slate-200 min-h-screen">

      <div className="sticky top-0 z-40 bg-slate-200/90 backdrop-blur-xl -mx-10 px-10 py-6 border-b border-slate-300/50 mb-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-purple-200 border-2 border-white/20">
              <FlaskConical className="w-8 h-8 text-white"/>
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tight">Prescription Labo</h1>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1 bg-white px-3 py-1 rounded-lg border border-slate-100 inline-block">
                {patient ? `${patient.prenom} ${patient.nom} • ${patient.numero_dossier}` : "Chargement..."}
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="hidden md:flex items-center gap-3 px-6 py-3 bg-white/50 backdrop-blur-md border border-white/20 rounded-2xl">
               <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
               <span className="text-[9px] font-black text-purple-700 uppercase tracking-widest">Analyse Labo en cours</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 max-w-[1400px]">
        <div className="lg:col-span-3 space-y-8">
          {/* Urgency Alert Card */}
          <div 
            onClick={()=>setForm(f=>({...f,urgence:!f.urgence}))}
            className={`p-8 rounded-[2.5rem] border-2 transition-all cursor-pointer flex items-center justify-between group shadow-2xl ${form.urgence ? "bg-rose-50 border-rose-400 shadow-rose-200/50" : "bg-white border-slate-200 shadow-slate-200/50 hover:border-rose-300"}`}
          >
            <div className="flex items-center gap-5">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all border-2 shadow-sm ${form.urgence ? "bg-rose-600 border-rose-500 text-white animate-pulse" : "bg-rose-50 border-rose-100 text-rose-500"}`}>
                <AlertTriangle className="w-7 h-7"/>
              </div>
              <div>
                <p className={`font-black uppercase tracking-tight text-lg ${form.urgence ? "text-rose-700" : "text-slate-900"}`}>Examen Prioritaire (URGENT)</p>
                <p className={`text-[10px] font-black uppercase tracking-widest mt-1 opacity-80 ${form.urgence ? "text-rose-600" : "text-slate-400"}`}>Alerte immédiate au biologiste</p>
              </div>
            </div>
            <div className={`w-16 h-8 rounded-full transition-all relative border-2 ${form.urgence ? "bg-rose-600 border-rose-500 shadow-inner" : "bg-slate-100 border-slate-200"}`}>
              <span className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-lg transition-all ${form.urgence ? "left-8" : "left-0.5"}`}/>
            </div>
          </div>

          {/* Type of Exam Selection */}
          <Card className="rounded-[3rem] border-2 border-slate-200 shadow-2xl shadow-slate-200/50 p-10 bg-white">
            <h2 className="text-2xl font-black text-slate-900 mb-10 flex items-center gap-4 uppercase tracking-tight">
              <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center border border-purple-100 shadow-sm">
                <TestTube className="w-6 h-6 text-purple-600"/>
              </div>
              Sélection des examens <span className="text-rose-500 text-3xl leading-none">*</span>
            </h2>
            
            <div className="space-y-10">
              {TYPES_EXAMENS.map(({cat, items, color})=>(
                <div key={cat} className="space-y-4">
                  <div className="flex items-center gap-4 ml-2 mb-6 border-b border-slate-50 pb-4">
                    <p className="text-[11px] font-black text-purple-700 uppercase tracking-[0.2em]">{cat}</p>
                    <div className="flex-1 h-px bg-slate-100" />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                    {items.map(item=>(
                      <button 
                        key={item} 
                        onClick={()=>setForm(f=>({...f,type_examen:item}))}
                        className={`px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 text-left flex items-center justify-between group/btn ${form.type_examen===item ? `bg-purple-600 border-purple-500 text-white shadow-xl shadow-purple-200 scale-[1.02]` : `bg-white border-slate-100 text-slate-600 hover:border-purple-300 hover:bg-purple-50/50 hover:text-purple-700`}`}
                      >
                        <span className="truncate">{item}</span>
                        {form.type_examen===item && <CheckCircle className="w-4 h-4 text-white/50 flex-shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <div className="pt-8 border-t-2 border-slate-50">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-3 block">Saisie libre du type d'examen</label>
                <input 
                  value={form.type_examen} 
                  onChange={e=>setForm(f=>({...f,type_examen:e.target.value}))}
                  placeholder="Ex: Analyse spécifique..."
                  className="w-full px-6 py-5 border-2 border-slate-200 rounded-[1.5rem] bg-slate-50 focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none text-sm font-bold transition-all text-slate-900 placeholder-slate-300 shadow-inner"
                />
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-8">
          {/* Description */}
          <Card className="rounded-[3rem] border-2 border-slate-200 shadow-2xl shadow-slate-200/50 p-10 bg-white">
            <h2 className="text-2xl font-black text-slate-900 mb-10 flex items-center gap-4 uppercase tracking-tight">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100 shadow-sm">
                <Info className="w-6 h-6 text-blue-600"/>
              </div>
              Contexte Médical
            </h2>
            <textarea 
              value={form.description} 
              onChange={e=>setForm(f=>({...f,description:e.target.value}))}
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
              ) : <><Save className="w-6 h-6"/> TRANSMETTRE AU LABORATOIRE</>}
            </button>
            <button onClick={()=>navigate(`/medecin/dossier/${id}`)}
              className="w-full py-5 bg-white border-2 border-slate-100 text-slate-400 rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm"
            >
              Annuler la prescription
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
