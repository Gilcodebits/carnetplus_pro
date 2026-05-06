import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { Card } from "../components/Card";
import { patientsAPI } from "../services/api";
import { ArrowLeft, Save, User, CheckCircle, AlertCircle } from "lucide-react";

export function NouveauPatient() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nom:"", prenom:"", date_naissance:"", sexe:"",
    email:"", telephone:"", adresse:"",
    groupe_sanguin:"", allergies:"", antecedents:""
  });
  const [errors, setErrors]   = useState<Record<string,string>>({});
  const [saved, setSaved]     = useState(false);
  const [loading, setLoading] = useState(false);
  const [dossierNum, setDossierNum] = useState("");
  const [doublon, setDoublon] = useState(false);
  const [apiError, setApiError] = useState("");

  const set = (key:string) => (e:React.ChangeEvent<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>) =>
    setForm(prev=>({...prev,[key]:e.target.value}));

  const validate = () => {
    const err: Record<string,string> = {};
    if (!form.nom.trim())         err.nom            = "Nom obligatoire";
    if (!form.prenom.trim())      err.prenom         = "Prénom obligatoire";
    if (!form.date_naissance)     err.date_naissance = "Date de naissance obligatoire";
    if (!form.telephone.trim())   err.telephone      = "Téléphone obligatoire";
    setErrors(err);
    return Object.keys(err).length===0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setLoading(true);
    setApiError("");
    setDoublon(false);
    
    try {
      const res = await patientsAPI.create(form);
      setDossierNum(res.numero_dossier);
      setSaved(true);
    } catch (err: any) {
      if (err.message.includes("409") || err.message.toLowerCase().includes("doublon")) {
        setDoublon(true);
      } else {
        setApiError(err.message || "Une erreur est survenue lors de l'enregistrement");
      }
    } finally {
      setLoading(false);
    }
  };

  if (saved) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center animate-scaleIn max-w-md w-full p-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-12 h-12 text-green-600"/>
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">Patient enregistré !</h2>
        <p className="text-gray-500 mb-4">{form.prenom} {form.nom} a été ajouté au système</p>
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6">
          <p className="text-sm text-blue-600 font-semibold">Numéro de dossier généré</p>
          <p className="text-3xl font-black text-blue-700 mt-1 font-mono">{dossierNum}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={()=>navigate("/medecin")}
            className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all">
            Retour au dashboard
          </button>
          <button onClick={()=>{ setSaved(false); setForm({nom:"",prenom:"",date_naissance:"",sexe:"",email:"",telephone:"",adresse:"",groupe_sanguin:"",allergies:"",antecedents:""}); }}
            className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all">
            Nouveau patient
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar role="medecin" activePath="/medecin"/>
      <div className="flex-1 overflow-auto">

        <div className="bg-white border-b border-gray-100 px-8 py-4 sticky top-0 z-10 shadow-sm animate-slideDown">
          <button onClick={()=>navigate("/medecin")}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-3 group transition-all">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-all"/> Retour au dashboard
          </button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600"/>
              </div>
              <div>
                <h1 className="text-xl font-black text-gray-900">Nouveau Patient</h1>
                <p className="text-gray-400 text-sm">Créer un dossier médical · Numéro généré automatiquement</p>
              </div>
            </div>
            <button onClick={handleSave} disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-sm hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-200 transition-all disabled:opacity-60">
              {loading ? (
                <><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeOpacity="0.3"/><path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round"/></svg>Enregistrement…</>
              ) : <><Save className="w-4 h-4"/> Créer le dossier</>}
            </button>
          </div>
        </div>

        <div className="p-8 max-w-4xl mx-auto space-y-6">
          {/* Alerte doublon */}
          {doublon && (
            <div className="p-4 bg-orange-50 border-2 border-orange-300 rounded-2xl flex items-start gap-3 animate-slideDown">
              <AlertCircle className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5"/>
              <div>
                <p className="font-bold text-orange-900">⚠️ Doublon détecté !</p>
                <p className="text-orange-700 text-sm mt-1">Un patient avec ce nom et prénom existe déjà dans le système. Vérifiez les dossiers existants avant de créer un doublon.</p>
                <button onClick={()=>setDoublon(false)} className="text-orange-600 text-sm font-semibold underline mt-2">Continuer quand même</button>
              </div>
            </div>
          )}

          {/* Erreur API générique */}
          {apiError && (
            <div className="p-4 bg-red-50 border-2 border-red-200 rounded-2xl flex items-start gap-3 animate-slideDown">
              <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5"/>
              <p className="text-red-700 text-sm font-medium">{apiError}</p>
            </div>
          )}

          {/* Infos personnelles */}
          <Card animated delay={100}>
            <h2 className="font-black text-gray-900 mb-5 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-500"/> Informations personnelles
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                {key:"nom",    label:"Nom",    placeholder:"DUBOIS",   required:true},
                {key:"prenom", label:"Prénom", placeholder:"Marie",    required:true},
              ].map(({key,label,placeholder,required})=>(
                <div key={key}>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">{label}{required&&<span className="text-red-500 ml-1">*</span>}</label>
                  <input value={(form as any)[key]} onChange={set(key)} placeholder={placeholder}
                    className={`w-full px-4 py-3 border rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all ${(errors as any)[key] ? "border-red-300" : "border-gray-200"}`}/>
                  {(errors as any)[key] && <p className="text-red-500 text-xs mt-1">{(errors as any)[key]}</p>}
                </div>
              ))}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Date de naissance <span className="text-red-500">*</span></label>
                <input type="date" value={form.date_naissance} onChange={set("date_naissance")}
                  className={`w-full px-4 py-3 border rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all ${errors.date_naissance ? "border-red-300" : "border-gray-200"}`}/>
                {errors.date_naissance && <p className="text-red-500 text-xs mt-1">{errors.date_naissance}</p>}
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Sexe</label>
                <select value={form.sexe} onChange={set("sexe")}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all">
                  <option value="">Sélectionner…</option>
                  <option value="F">Féminin</option>
                  <option value="M">Masculin</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Téléphone <span className="text-red-500">*</span></label>
                <input value={form.telephone} onChange={set("telephone")} placeholder="+229 97 00 00 00"
                  className={`w-full px-4 py-3 border rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all ${errors.telephone ? "border-red-300" : "border-gray-200"}`}/>
                {errors.telephone && <p className="text-red-500 text-xs mt-1">{errors.telephone}</p>}
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Email</label>
                <input type="email" value={form.email} onChange={set("email")} placeholder="patient@email.com"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all"/>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Adresse</label>
                <input value={form.adresse} onChange={set("adresse")} placeholder="Quartier, Ville"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all"/>
              </div>
            </div>
          </Card>

          {/* Infos médicales */}
          <Card animated delay={200}>
            <h2 className="font-black text-gray-900 mb-5 flex items-center gap-2">
              🩺 Informations médicales
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Groupe sanguin</label>
                <select value={form.groupe_sanguin} onChange={set("groupe_sanguin")}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                  <option value="">Inconnu</option>
                  {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(g=><option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div/>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Allergies connues</label>
                <textarea value={form.allergies} onChange={set("allergies") as any} rows={3}
                  placeholder="Ex: Pénicilline, Aspirine…"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none transition-all"/>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Antécédents médicaux</label>
                <textarea value={form.antecedents} onChange={set("antecedents") as any} rows={3}
                  placeholder="Ex: Hypertension, Diabète type 2…"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none transition-all"/>
              </div>
            </div>
          </Card>

          <div className="flex gap-3 animate-fadeInUp delay-300">
            <button onClick={handleSave} disabled={loading}
              className="flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-200 transition-all disabled:opacity-60">
              <Save className="w-5 h-5"/> Créer le dossier patient
            </button>
            <button onClick={()=>navigate("/medecin")}
              className="px-6 py-3.5 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all">
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
