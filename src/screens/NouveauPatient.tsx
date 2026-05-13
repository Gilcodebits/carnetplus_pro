import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "../components/Card";
import { patientsAPI } from "../services/api";
import { ArrowLeft, Save, User, CheckCircle, AlertCircle, Phone, Mail, MapPin, Calendar, Heart, FileText, ChevronDown } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export function NouveauPatient() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const { user } = useAuth();
  const returnPath = user?.role === 'secretaire' ? '/secretaire/patients' : '/medecin';

  const [form, setForm] = useState({
    nom: "", prenom: "", date_naissance: "", sexe: "",
    email: "", telephone: "", adresse: "",
    groupe_sanguin: "", allergies: "", antecedents: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dossierNum, setDossierNum] = useState("");
  const [doublon, setDoublon] = useState(false);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    if (isEdit) {
      loadPatient(Number(id));
    }
  }, [id]);

  const loadPatient = async (pid: number) => {
    setLoading(true);
    try {
      const data = await patientsAPI.get(pid);
      setForm({
        nom: data.nom || "",
        prenom: data.prenom || "",
        date_naissance: data.date_naissance || "",
        sexe: data.sexe || "",
        email: data.email || "",
        telephone: data.telephone || "",
        adresse: data.adresse || "",
        groupe_sanguin: data.groupe_sanguin || "",
        allergies: data.allergies || "",
        antecedents: data.antecedents || ""
      });
      setDossierNum(data.numero_dossier || "");
    } catch (err) {
      setApiError("Impossible de charger les données du patient");
    } finally {
      setLoading(false);
    }
  };

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }));

  const validate = () => {
    const err: Record<string, string> = {};
    if (!form.nom.trim()) err.nom = "Nom obligatoire";
    if (!form.prenom.trim()) err.prenom = "Prénom obligatoire";
    if (!form.date_naissance) err.date_naissance = "Date de naissance obligatoire";
    if (!form.telephone.trim()) err.telephone = "Téléphone obligatoire";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setLoading(true);
    setApiError("");
    setDoublon(false);

    try {
      if (isEdit) {
        await patientsAPI.update(Number(id), form);
        setSaved(true);
      } else {
        const res = await patientsAPI.create(form);
        setDossierNum(res.numero_dossier);
        setSaved(true);
      }
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
    <div className="p-10 animate-scaleIn flex items-center justify-center min-h-[80vh] bg-slate-200">
      <Card className="max-w-md w-full p-14 rounded-[3rem] border-2 border-slate-200 shadow-2xl shadow-slate-200/50 text-center bg-white">
        <div className="w-24 h-24 bg-emerald-50 border-2 border-emerald-100 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-sm">
          <CheckCircle className="w-12 h-12 text-emerald-600" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-3 uppercase tracking-tight">Patient {isEdit ? 'Mis à jour' : 'Enregistré'} !</h2>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-10 opacity-80">Le dossier de {form.prenom} {form.nom} est {isEdit ? 'à jour' : 'ouvert et actif'}.</p>

        <div className="bg-blue-50 border-2 border-blue-100 rounded-[2rem] p-8 mb-10 shadow-sm">
          <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest mb-2">Numéro de dossier unique</p>
          <p className="text-5xl font-black text-blue-700 font-mono tracking-tighter">{dossierNum}</p>
        </div>

        <div className="flex flex-col gap-4">
          <button onClick={() => navigate(returnPath)}
            className="w-full py-5 bg-blue-600 text-white border-2 border-blue-500 rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:shadow-xl hover:shadow-blue-200 transition-all active:scale-95">
            Retour au Dashboard
          </button>
          <button onClick={() => { setSaved(false); setForm({ nom: "", prenom: "", date_naissance: "", sexe: "", email: "", telephone: "", adresse: "", groupe_sanguin: "", allergies: "", antecedents: "" }); }}
            className="w-full py-5 bg-white text-slate-600 border-2 border-slate-200 rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 hover:text-slate-900 transition-all active:scale-95">
            Ajouter un autre patient
          </button>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="animate-fadeIn bg-slate-50 min-h-screen w-full max-w-full overflow-x-hidden flex flex-col">
      {/* Modern FIXED Header - Premium White */}
      <div className="fixed top-0 left-0 lg:left-64 right-0 z-50 bg-white border-b-2 border-slate-200 shadow-md h-[90px] flex items-center shrink-0">
        <div className="px-6 md:px-10 flex flex-row justify-between items-center w-full gap-4">
          <div className="flex items-center gap-4">
            <div className="w-1.5 h-10 bg-blue-600 rounded-full shrink-0 shadow-sm shadow-blue-200" />
            <div>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight leading-none">
                {isEdit ? 'Modifier Patient' : 'Nouveau Patient'}
              </h1>
              <p className="text-slate-500 text-[9px] md:text-[10px] font-bold uppercase tracking-widest mt-1">
                {isEdit ? `Mise à jour du dossier ${dossierNum}` : 'Renseignez les informations du patient'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(returnPath)}
              className="p-3 bg-white text-slate-400 hover:text-blue-600 rounded-xl transition-all border-2 border-slate-100 hover:border-blue-200 shadow-sm active:scale-90"
              title="Retour"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center justify-center gap-3 px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-200 disabled:opacity-50"
            >
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save className="w-4 h-4" /> <span>Enregistrer</span></>}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 md:px-10 pb-12 pt-[130px] md:pt-[140px]">
        <div className="max-w-6xl mx-auto">

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 max-w-6xl mx-auto">
            <div className="lg:col-span-3 space-y-8">
              {/* Alerts */}
              {doublon && (
                <div className="p-6 md:p-8 bg-orange-50 border-2 border-orange-200 rounded-[2rem] md:rounded-[2.5rem] flex items-start gap-4 md:gap-6 animate-slideDown shadow-xl shadow-orange-100/50">
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-white border-2 border-orange-200 rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm">
                    <AlertCircle className="w-6 h-6 md:w-7 md:h-7 text-orange-500" />
                  </div>
                  <div>
                    <p className="font-black text-orange-900 text-xs md:text-sm uppercase tracking-widest mb-1 md:mb-2">⚠️ Patient déjà existant ?</p>
                    <p className="text-orange-700 text-[9px] md:text-[10px] font-bold uppercase tracking-widest mt-1">Vérifiez les dossiers avant de valider.</p>
                    <button onClick={() => setDoublon(false)} className="text-orange-600 text-[9px] md:text-[10px] font-black uppercase tracking-widest mt-3 hover:underline">Ignorer l'alerte</button>
                  </div>
                </div>
              )}

              {/* Identity Form */}
              <Card className="rounded-[2rem] md:rounded-[3rem] border-2 border-slate-200 shadow-2xl shadow-slate-200/50 bg-white p-6 md:p-10">
                <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-8 md:mb-10 flex items-center gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-50 border border-blue-100 rounded-xl md:rounded-2xl flex items-center justify-center shadow-sm">
                    <FileText className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                  </div>
                  <span className="uppercase tracking-tight">Identité</span>
                </h2>
                {/* Identity Form fields */}
                <div className="grid grid-cols-2 gap-6">
                  {[
                    { key: "nom", label: "Nom de famille", placeholder: "Ex: DUBOIS", required: true },
                    { key: "prenom", label: "Prénom(s)", placeholder: "Ex: Marie", required: true },
                  ].map(({ key, label, placeholder, required }) => (
                    <div key={key} className="col-span-2 md:col-span-1 space-y-2">
                      <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest ml-1">{label}{required && <span className="text-rose-500 ml-1">*</span>}</label>
                      <input value={(form as any)[key]} onChange={set(key)} placeholder={placeholder}
                        className={`w-full px-5 md:px-6 py-3 md:py-4 border-2 rounded-xl md:rounded-2xl bg-slate-50 focus:outline-none focus:ring-4 focus:ring-blue-500/10 text-xs md:text-sm font-bold transition-all placeholder-slate-300 ${(errors as any)[key] ? "border-rose-200 ring-rose-50" : "border-slate-200 focus:border-blue-500"}`} />
                      {(errors as any)[key] && <p className="text-rose-500 text-[9px] font-black uppercase ml-1">{(errors as any)[key]}</p>}
                    </div>
                  ))}
                  <div className="col-span-2 md:col-span-1 space-y-2">
                    <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest ml-1">Naissance <span className="text-rose-500">*</span></label>
                    <input type="date" value={form.date_naissance} onChange={set("date_naissance")}
                      className={`w-full px-5 md:px-6 py-3 md:py-4 border-2 rounded-xl md:rounded-2xl bg-slate-50 focus:outline-none focus:ring-4 focus:ring-blue-500/10 text-xs md:text-sm font-bold transition-all ${errors.date_naissance ? "border-rose-200 ring-rose-50" : "border-slate-200 focus:border-blue-500"}`} />
                  </div>
                  <div className="col-span-2 md:col-span-1 space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Sexe</label>
                    <div className="relative">
                      <select value={form.sexe} onChange={set("sexe")}
                        className="w-full px-5 md:px-6 py-3 md:py-4 border-2 border-slate-200 rounded-xl md:rounded-2xl bg-slate-50 focus:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-xs md:text-sm font-bold appearance-none cursor-pointer">
                        <option value="">Sélectionner…</option>
                        <option value="F">Féminin</option>
                        <option value="M">Masculin</option>
                        <option value="Autre">Autre</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </Card>

              {/* Contact Form */}
              <Card className="rounded-[2rem] md:rounded-[2.5rem] border-gray-100 shadow-xl shadow-gray-200/40 p-6 md:p-8">
                <h2 className="text-lg md:text-xl font-black text-gray-900 mb-8 flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                    <Phone className="w-5 h-5 text-purple-600" />
                  </div>
                  Contact
                </h2>
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2 md:col-span-1 space-y-2">
                    <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest ml-1">Téléphone <span className="text-rose-500">*</span></label>
                    <input value={form.telephone} onChange={set("telephone")} placeholder="+229 ..."
                      className={`w-full px-5 md:px-6 py-3 md:py-4 border-2 rounded-xl md:rounded-2xl bg-slate-50 focus:outline-none focus:ring-4 focus:ring-blue-500/10 text-xs md:text-sm font-bold transition-all placeholder-slate-300 ${errors.telephone ? "border-rose-200 ring-rose-50" : "border-slate-200 focus:border-blue-500"}`} />
                  </div>
                  <div className="col-span-2 md:col-span-1 space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email</label>
                    <input type="email" value={form.email} onChange={set("email")} placeholder="patient@email.com"
                      className="w-full px-5 md:px-6 py-3 md:py-4 border-2 border-slate-200 rounded-xl md:rounded-2xl bg-slate-50 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-xs md:text-sm font-bold placeholder-slate-300" />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Adresse</label>
                    <input value={form.adresse} onChange={set("adresse")} placeholder="Quartier, Ville"
                      className="w-full px-5 md:px-6 py-3 md:py-4 border-2 border-slate-200 rounded-xl md:rounded-2xl bg-slate-50 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-xs md:text-sm font-bold placeholder-slate-300" />
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Column: Medical Data */}
            <div className="lg:col-span-2 space-y-8">
              <Card className="rounded-[2rem] md:rounded-[3rem] border-2 border-slate-200 shadow-2xl shadow-slate-200/50 bg-white p-6 md:p-10">
                <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-8 md:mb-10 flex items-center gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-rose-50 border border-rose-100 rounded-xl md:rounded-2xl flex items-center justify-center shadow-sm">
                    <Heart className="w-5 h-5 md:w-6 md:h-6 text-rose-500" />
                  </div>
                  <span className="uppercase tracking-tight">Médical</span>
                </h2>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest ml-1">Groupe sanguin</label>
                    <div className="relative">
                      <select value={form.groupe_sanguin} onChange={set("groupe_sanguin")}
                        className="w-full px-5 md:px-6 py-3 md:py-4 border-2 border-slate-200 rounded-xl md:rounded-2xl bg-slate-50 focus:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-xs md:text-sm font-bold appearance-none cursor-pointer">
                        <option value="">Inconnu</option>
                        {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Allergies</label>
                    <textarea value={form.allergies} onChange={set("allergies") as any} rows={3}
                      placeholder="Ex: Pénicilline, etc."
                      className="w-full px-6 py-4 border-2 border-slate-200 rounded-2xl bg-slate-50 focus:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-sm font-bold resize-none placeholder-slate-300" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest ml-1">Antécédents</label>
                    <textarea value={form.antecedents} onChange={set("antecedents") as any} rows={3}
                      placeholder="Ex: Hypertension..."
                      className="w-full px-5 md:px-6 py-3 md:py-4 border-2 border-slate-200 rounded-xl md:rounded-2xl bg-slate-50 focus:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-xs md:text-sm font-bold resize-none placeholder-slate-300" />
                  </div>
                </div>
              </Card>

              <div className="pt-6 space-y-5">
                <p className="text-center text-[10px] text-slate-500 font-black uppercase tracking-widest">Tous les champs avec * sont obligatoires</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => navigate(returnPath)}
                    className="w-full py-3 md:py-4 bg-white text-slate-900 border-2 border-slate-900 rounded-[1.5rem] md:rounded-[2rem] font-black text-[9px] md:text-[10px] uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all active:scale-95"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="w-full py-3 md:py-4 bg-blue-600 text-white rounded-[1.5rem] md:rounded-[2rem] font-black text-[9px] md:text-[10px] uppercase tracking-widest hover:bg-blue-700 hover:shadow-2xl hover:shadow-blue-200 transition-all flex items-center justify-center gap-4 shadow-xl shadow-blue-500/20 active:scale-95"
                  >
                    {loading ? "Enregistrement..." : (isEdit ? "Enregistrer" : "Créer le dossier")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

