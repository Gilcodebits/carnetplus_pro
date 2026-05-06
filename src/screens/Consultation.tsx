import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { Card } from "../components/Card";
import { consultationsAPI, patientsAPI } from "../services/api";
import {
  ArrowLeft, Save, Pill, TestTube, User,
  Thermometer, Activity, Weight, Ruler, CheckCircle
} from "lucide-react";

export function Consultation() {
  const navigate = useNavigate();
  const { id }   = useParams();

  const [form, setForm] = useState({
    motif:"", symptomes:"", diagnostic:"", traitement:"",
    observations:"", tension:"", temperature:"", poids:"", taille:""
  });
  const [patient, setPatient] = useState<any>(null);
  const [newConsultationId, setNewConsultationId] = useState<number | null>(null);
  const [saved, setSaved]     = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState<Record<string,string>>({});

  useEffect(() => {
    if (id) {
      patientsAPI.get(Number(id)).then(setPatient).catch(console.error);
    }
  }, [id]);

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) =>
    setForm(prev => ({...prev, [key]: e.target.value}));

  const validate = () => {
    const err: Record<string,string> = {};
    if (!form.motif.trim())      err.motif      = "Le motif est obligatoire";
    if (!form.diagnostic.trim()) err.diagnostic = "Le diagnostic est obligatoire";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await consultationsAPI.create({
        ...form,
        patient_id: Number(id)
      });
      setNewConsultationId(res.id);
      setSaved(true);
    } catch (err: any) {
      alert(err.message || "Erreur lors de l'enregistrement");
    } finally {
      setLoading(false);
    }
  };

  if (saved) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center animate-scaleIn max-w-md p-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-12 h-12 text-green-600"/>
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">Consultation enregistrée !</h2>
        <p className="text-gray-500 mb-8">Le dossier du patient {patient?.nom} a été mis à jour avec succès.</p>
        
        <div className="flex flex-col gap-3">
          <button onClick={()=>navigate(`/medecin/prescription/${id}?consultation_id=${newConsultationId}`)}
            className="w-full py-4 bg-green-600 text-white rounded-2xl font-black hover:bg-green-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-100">
            <Pill className="w-5 h-5"/> Ajouter une prescription
          </button>
          <button onClick={()=>navigate(`/medecin/examen/${id}?consultation_id=${newConsultationId}`)}
            className="w-full py-4 bg-purple-600 text-white rounded-2xl font-black hover:bg-purple-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-100">
            <TestTube className="w-5 h-5"/> Demander un examen
          </button>
          <button onClick={()=>navigate(`/medecin/dossier/${id}`)}
            className="w-full py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-all mt-4">
            Retour au dossier
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar role="medecin" activePath="/medecin"/>
      <div className="flex-1 overflow-auto">

        {/* Topbar */}
        <div className="bg-white border-b border-gray-100 px-8 py-4 sticky top-0 z-10 shadow-sm animate-slideDown">
          <button onClick={()=>navigate(`/medecin/dossier/${id}`)}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-3 group transition-all">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-all"/> Retour au dossier
          </button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Activity className="w-5 h-5 text-blue-600"/>
              </div>
              <div>
                <h1 className="text-xl font-black text-gray-900">Nouvelle Consultation</h1>
                <p className="text-gray-400 text-sm">
                  {patient ? `${patient.prenom} ${patient.nom} (${patient.numero_dossier})` : `Patient #${id}`}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleSave} disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-sm hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-200 transition-all disabled:opacity-60">
                {loading ? (
                  <><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeOpacity="0.3"/><path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round"/></svg>Enregistrement…</>
                ) : (
                  <><Save className="w-4 h-4"/> Enregistrer</>
                )}
              </button>
              <button onClick={()=>navigate(`/medecin/prescription/${id}`)}
                className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl font-bold text-sm hover:-translate-y-0.5 transition-all">
                <Pill className="w-4 h-4"/> Prescrire
              </button>
              <button onClick={()=>navigate(`/medecin/examen/${id}`)}
                className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-xl font-bold text-sm hover:-translate-y-0.5 transition-all">
                <TestTube className="w-4 h-4"/> Examen
              </button>
            </div>
          </div>
        </div>

        <div className="p-8 max-w-5xl mx-auto space-y-6">
          {/* Constantes */}
          <Card animated delay={100}>
            <h2 className="font-black text-gray-900 mb-5 flex items-center gap-2">
              <Activity className="w-5 h-5 text-red-500"/> Constantes vitales
            </h2>
            <div className="grid grid-cols-4 gap-4">
              {[
                { key:"tension",     label:"Tension artérielle", icon:Activity,    placeholder:"ex: 120/80",  unit:"mmHg" },
                { key:"temperature", label:"Température",        icon:Thermometer, placeholder:"ex: 37.2",    unit:"°C"   },
                { key:"poids",       label:"Poids",              icon:Weight,      placeholder:"ex: 65",      unit:"kg"   },
                { key:"taille",      label:"Taille",             icon:Ruler,       placeholder:"ex: 168",     unit:"cm"   },
              ].map(({key,label,icon:Icon,placeholder,unit})=>(
                <div key={key} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-blue-200 transition-all">
                  <div className="flex items-center gap-2 mb-3">
                    <Icon className="w-4 h-4 text-gray-500"/>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</p>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <input type="text" value={(form as any)[key]} onChange={set(key)} placeholder={placeholder}
                      className="w-full bg-transparent text-2xl font-black text-gray-900 focus:outline-none placeholder-gray-200"/>
                    <span className="text-sm text-gray-400 flex-shrink-0">{unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Motif & Symptômes */}
          <Card animated delay={200}>
            <h2 className="font-black text-gray-900 mb-5 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-500"/> Motif & Symptômes
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  Motif de consultation <span className="text-red-500">*</span>
                </label>
                <input value={form.motif} onChange={set("motif")} placeholder="Ex: Douleurs abdominales, fièvre…"
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm ${errors.motif ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"}`}/>
                {errors.motif && <p className="text-red-500 text-xs mt-1">{errors.motif}</p>}
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Symptômes observés</label>
                <textarea value={form.symptomes} onChange={set("symptomes")} rows={4}
                  placeholder="Décrivez les symptômes en détail…"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm resize-none"/>
              </div>
            </div>
          </Card>

          {/* Diagnostic & Traitement */}
          <Card animated delay={300}>
            <h2 className="font-black text-gray-900 mb-5 flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-500"/> Diagnostic & Traitement
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  Diagnostic <span className="text-red-500">*</span>
                </label>
                <textarea value={form.diagnostic} onChange={set("diagnostic")} rows={3}
                  placeholder="Diagnostic établi…"
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm resize-none ${errors.diagnostic ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"}`}/>
                {errors.diagnostic && <p className="text-red-500 text-xs mt-1">{errors.diagnostic}</p>}
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Traitement prescrit</label>
                <textarea value={form.traitement} onChange={set("traitement")} rows={3}
                  placeholder="Détails du traitement recommandé…"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm resize-none"/>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Observations complémentaires</label>
                <textarea value={form.observations} onChange={set("observations")} rows={3}
                  placeholder="Notes, recommandations, prochain RDV suggéré…"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm resize-none"/>
              </div>
            </div>
          </Card>

          {/* Boutons bas */}
          <div className="flex gap-3 animate-fadeInUp delay-400">
            <button onClick={handleSave} disabled={loading}
              className="flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-200 transition-all disabled:opacity-60">
              <Save className="w-5 h-5"/> Enregistrer la consultation
            </button>
            <button onClick={()=>navigate(`/medecin/prescription/${id}`)}
              className="flex items-center gap-2 px-6 py-3.5 bg-green-600 text-white rounded-xl font-bold hover:-translate-y-0.5 hover:shadow-lg hover:shadow-green-200 transition-all">
              <Pill className="w-5 h-5"/> Créer une prescription
            </button>
            <button onClick={()=>navigate(`/medecin/examen/${id}`)}
              className="flex items-center gap-2 px-6 py-3.5 bg-purple-600 text-white rounded-xl font-bold hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-200 transition-all">
              <TestTube className="w-5 h-5"/> Demander examen
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
