import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { Card } from "../components/Card";
import { prescriptionsAPI, patientsAPI } from "../services/api";
import { ArrowLeft, Save, Plus, Trash2, Pill, CheckCircle, AlertCircle } from "lucide-react";

interface Medicament { id:number; nom:string; posologie:string; duree:string; instructions:string; }

export function Prescription() {
  const navigate = useNavigate();
  const { id }   = useParams();
  const [searchParams] = useSearchParams();
  const consultationId = searchParams.get("consultation_id");

  const [meds, setMeds]       = useState<Medicament[]>([{ id:1, nom:"", posologie:"", duree:"", instructions:"" }]);
  const [patient, setPatient] = useState<any>(null);
  const [saved, setSaved]     = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState<string[]>([]);

  useEffect(() => {
    if (id) {
      patientsAPI.get(Number(id)).then(setPatient).catch(console.error);
    }
  }, [id]);

  const addMed = () => setMeds(prev => [...prev, { id:Date.now(), nom:"", posologie:"", duree:"", instructions:"" }]);
  const removeMed = (id:number) => { if (meds.length>1) setMeds(prev=>prev.filter(m=>m.id!==id)); };
  const setField = (id:number, field:keyof Medicament, value:string) =>
    setMeds(prev=>prev.map(m=>m.id===id?{...m,[field]:value}:m));

  const validate = () => {
    const err: string[] = [];
    meds.forEach((m,i)=>{ if (!m.nom.trim()) err.push(`Médicament #${i+1} : nom requis`); });
    setErrors(err);
    return err.length===0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await prescriptionsAPI.create({
        patient_id: Number(id),
        consultation_id: consultationId ? Number(consultationId) : null,
        medicaments: meds.map(m => ({
          nom_medicament: m.nom,
          posologie: m.posologie,
          duree: m.duree,
          instructions: m.instructions
        }))
      });
      setSaved(true);
      setTimeout(()=>navigate(`/medecin/dossier/${id}`), 1500);
    } catch (err: any) {
      setErrors([err.message || "Erreur lors de l'enregistrement de la prescription"]);
    } finally {
      setLoading(false);
    }
  };

  if (saved) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center animate-scaleIn">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-12 h-12 text-green-600"/>
        </div>
        <h2 className="text-2xl font-black text-gray-900">Prescription enregistrée !</h2>
        <p className="text-gray-400 mt-2">Le patient sera notifié. Redirection…</p>
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
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <Pill className="w-5 h-5 text-green-600"/>
              </div>
              <div>
                <h1 className="text-xl font-black text-gray-900">Prescription Médicale</h1>
                <p className="text-gray-400 text-sm">
                  {patient ? `${patient.prenom} ${patient.nom} (${patient.numero_dossier})` : `Patient #${id}`}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={addMed}
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200 transition-all">
                <Plus className="w-4 h-4"/> Ajouter médicament
              </button>
              <button onClick={handleSave} disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold text-sm hover:-translate-y-0.5 hover:shadow-lg hover:shadow-green-200 transition-all disabled:opacity-60">
                {loading ? (
                  <><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeOpacity="0.3"/><path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round"/></svg>Enregistrement…</>
                ) : <><Save className="w-4 h-4"/> Enregistrer</>}
              </button>
            </div>
          </div>
        </div>

        <div className="p-8 max-w-4xl mx-auto space-y-4">
          {/* Erreurs */}
          {errors.length>0 && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 animate-slideDown">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"/>
              <div>
                {errors.map((e,i)=><p key={i} className="text-red-700 text-sm">{e}</p>)}
              </div>
            </div>
          )}

          {/* Médicaments */}
          {meds.map((med, i)=>(
            <Card key={med.id} animated delay={(i+1)*100} className="relative">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Pill className="w-4 h-4 text-green-600"/>
                  </div>
                  <h3 className="font-black text-gray-900">Médicament #{i+1}</h3>
                  {med.nom && <span className="text-sm text-gray-500 italic">— {med.nom}</span>}
                </div>
                {meds.length>1 && (
                  <button onClick={()=>removeMed(med.id)}
                    className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-100 hover:text-red-600 transition-all">
                    <Trash2 className="w-4 h-4"/>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Nom du médicament <span className="text-red-500">*</span></label>
                  <input value={med.nom} onChange={e=>setField(med.id,"nom",e.target.value)}
                    placeholder="Ex: Paracétamol 1g, Amoxicilline 500mg…"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all text-sm"/>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Posologie <span className="text-red-500">*</span></label>
                  <input value={med.posologie} onChange={e=>setField(med.id,"posologie",e.target.value)}
                    placeholder="Ex: 1 comprimé × 3/jour"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all text-sm"/>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Durée</label>
                  <input value={med.duree} onChange={e=>setField(med.id,"duree",e.target.value)}
                    placeholder="Ex: 7 jours, 1 mois…"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all text-sm"/>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Instructions spéciales</label>
                  <input value={med.instructions} onChange={e=>setField(med.id,"instructions",e.target.value)}
                    placeholder="Ex: À prendre pendant les repas, éviter le soleil…"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all text-sm"/>
                </div>
              </div>
            </Card>
          ))}

          {/* Ajouter */}
          <button onClick={addMed}
            className="w-full py-4 border-2 border-dashed border-green-200 rounded-2xl text-green-600 font-bold text-sm hover:border-green-400 hover:bg-green-50 transition-all flex items-center justify-center gap-2 animate-fadeInUp delay-300">
            <Plus className="w-5 h-5"/> Ajouter un autre médicament
          </button>

          {/* Boutons bas */}
          <div className="flex gap-3 animate-fadeInUp delay-400">
            <button onClick={handleSave} disabled={loading}
              className="flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold hover:-translate-y-0.5 hover:shadow-lg hover:shadow-green-200 transition-all disabled:opacity-60">
              <Save className="w-5 h-5"/> Enregistrer la prescription
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
