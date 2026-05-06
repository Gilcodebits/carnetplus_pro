import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { Card } from "../components/Card";
import { examensAPI, patientsAPI } from "../services/api";
import { ArrowLeft, Save, TestTube, CheckCircle, AlertTriangle, AlertCircle } from "lucide-react";

const TYPES_EXAMENS = [
  { cat:"Biologie", items:["Prise de sang (NFS)","Glycémie à jeun","Bilan lipidique","Bilan hépatique","Créatinine","Ionogramme","TSH","HbA1c"] },
  { cat:"Imagerie",  items:["Radiographie pulmonaire","Échographie abdominale","Scanner thoracique","IRM cérébrale","Mammographie","Ostéodensitométrie"] },
  { cat:"Cardiologie",items:["ECG","Échocardiographie","Test d'effort","Holter ECG 24h"] },
  { cat:"Autre",     items:["Spirométrie","EEG","Électromyogramme","Autre (préciser)"] },
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
      setTimeout(()=>navigate(`/medecin/dossier/${id}`), 1500);
    } catch (err: any) {
      setError(err.message || "Erreur lors de la transmission de la demande");
    } finally {
      setLoading(false);
    }
  };

  if (saved) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center animate-scaleIn">
        <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-12 h-12 text-purple-600"/>
        </div>
        <h2 className="text-2xl font-black text-gray-900">Demande transmise au labo !</h2>
        <p className="text-gray-400 mt-2">Le laboratoire a été notifié. Redirection…</p>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar role="medecin" activePath="/medecin"/>
      <div className="flex-1 overflow-auto">

        <div className="bg-white border-b border-gray-100 px-8 py-4 sticky top-0 z-10 shadow-sm animate-slideDown">
          <button onClick={()=>navigate(`/medecin/dossier/${id}`)}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-3 group transition-all">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-all"/> Retour au dossier
          </button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <TestTube className="w-5 h-5 text-purple-600"/>
              </div>
              <div>
                <h1 className="text-xl font-black text-gray-900">Demande d'Examen</h1>
                <p className="text-gray-400 text-sm">
                  {patient ? `${patient.prenom} ${patient.nom} (${patient.numero_dossier})` : `Patient #${id}`}
                </p>
              </div>
            </div>
            <button onClick={handleSave} disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-bold text-sm hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-200 transition-all disabled:opacity-60">
              {loading ? (
                <><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeOpacity="0.3"/><path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round"/></svg>Transmission…</>
              ) : <><Save className="w-4 h-4"/> Transmettre au labo</>}
            </button>
          </div>
        </div>

        <div className="p-8 max-w-4xl mx-auto space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 animate-slideDown">
              <AlertCircle className="w-5 h-5 text-red-500"/>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Urgence toggle */}
          <div className={`p-5 rounded-2xl border-2 transition-all ${form.urgence ? "border-red-300 bg-red-50" : "border-gray-200 bg-white"}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className={`w-6 h-6 ${form.urgence ? "text-red-500" : "text-gray-400"}`}/>
                <div>
                  <p className="font-black text-gray-900">Examen urgent</p>
                  <p className="text-sm text-gray-500">Le laboratoire sera alerté en priorité</p>
                </div>
              </div>
              <button onClick={()=>setForm(f=>({...f,urgence:!f.urgence}))}
                className={`w-14 h-7 rounded-full transition-all relative ${form.urgence ? "bg-red-500" : "bg-gray-200"}`}>
                <span className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-all ${form.urgence ? "left-7" : "left-0.5"}`}/>
              </button>
            </div>
          </div>

          {/* Sélection type examen */}
          <Card animated delay={100}>
            <h2 className="font-black text-gray-900 mb-5 flex items-center gap-2">
              <TestTube className="w-5 h-5 text-purple-500"/> Type d'examen <span className="text-red-500">*</span>
            </h2>
            <div className="space-y-4">
              {TYPES_EXAMENS.map(({cat,items})=>(
                <div key={cat}>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2">{cat}</p>
                  <div className="flex flex-wrap gap-2">
                    {items.map(item=>(
                      <button key={item} onClick={()=>setForm(f=>({...f,type_examen:item}))}
                        className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all border-2 ${form.type_examen===item ? "border-purple-500 bg-purple-50 text-purple-700" : "border-gray-200 text-gray-600 hover:border-purple-300 hover:bg-purple-50"}`}>
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              {/* Saisie libre */}
              <div className="pt-2">
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Ou saisir un examen spécifique</label>
                <input value={form.type_examen} onChange={e=>setForm(f=>({...f,type_examen:e.target.value}))}
                  placeholder="Ex: Bilan thyroïdien complet…"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm"/>
              </div>
            </div>
          </Card>

          {/* Description */}
          <Card animated delay={200}>
            <h2 className="font-black text-gray-900 mb-4 flex items-center gap-2">
              📋 Informations complémentaires
            </h2>
            <textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))}
              rows={5} placeholder="Contexte clinique, informations importantes pour le laboratoire…"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm resize-none"/>
          </Card>

          {/* Résumé */}
          {form.type_examen && (
            <div className="p-5 bg-purple-50 border border-purple-200 rounded-2xl animate-slideDown">
              <p className="font-black text-purple-900 mb-1">Résumé de la demande</p>
              <div className="flex items-center gap-3 flex-wrap mt-2">
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-sm font-semibold">
                  <TestTube className="w-4 h-4"/> {form.type_examen}
                </span>
                {form.urgence && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-bold">
                    <AlertTriangle className="w-4 h-4"/> URGENT
                  </span>
                )}
                <span className="text-sm text-purple-600">→ Laboratoire Central, Hôpital de Cotonou</span>
              </div>
            </div>
          )}

          <div className="flex gap-3 animate-fadeInUp delay-300">
            <button onClick={handleSave} disabled={loading}
              className="flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-bold hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-200 transition-all disabled:opacity-60">
              <Save className="w-5 h-5"/> Transmettre au laboratoire
            </button>
            <button onClick={()=>navigate(`/medecin/dossier/${id}`)}
              className="px-6 py-3.5 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all">
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
