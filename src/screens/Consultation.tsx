import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "../components/Card";
import { consultationsAPI, patientsAPI } from "../services/api";
import {
  ArrowLeft, Save, Pill, TestTube, User, Stethoscope,
  Thermometer, Activity, Weight, Ruler, CheckCircle, ChevronLeft, Info
} from "lucide-react";

export function Consultation() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [form, setForm] = useState({
    motif: "", symptomes: "", diagnostic: "", traitement: "",
    observations: "", tension: "", temperature: "", poids: "", taille: ""
  });
  const [patient, setPatient] = useState<any>(null);
  const [newConsultationId, setNewConsultationId] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (id) {
      setFetching(true);
      patientsAPI.get(Number(id))
        .then(res => {
          setPatient(res);
          setFetching(false);
        })
        .catch(err => {
          console.error(err);
          setFetching(false);
        });
    }
  }, [id]);

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }));

  const validate = () => {
    const err: Record<string, string> = {};
    if (!form.motif?.trim()) err.motif = "Le motif est obligatoire";
    if (!form.diagnostic?.trim()) err.diagnostic = "Le diagnostic est obligatoire";
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

  if (fetching) return (
    <div className="p-8 text-center py-40 bg-slate-200 min-h-screen flex items-center justify-center">
      <div className="bg-white p-16 rounded-[3rem] border-2 border-slate-200 shadow-2xl shadow-slate-200/50">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-8" />
        <p className="text-slate-900 font-black uppercase tracking-widest text-xs">Ouverture du dossier sécurisé...</p>
      </div>
    </div>
  );

  if (saved) return (
    <div className="p-8 animate-scaleIn flex items-center justify-center min-h-[80vh] bg-slate-200">
      <Card className="max-w-md w-full p-12 rounded-[3rem] border-2 border-slate-200 shadow-2xl shadow-slate-200/50 text-center bg-white">
        <div className="w-24 h-24 bg-emerald-50 border-2 border-emerald-100 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-sm">
          <CheckCircle className="w-12 h-12 text-emerald-600" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-3 uppercase tracking-tight">Consultation Validée !</h2>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-10 opacity-80">Le dossier médical a été synchronisé avec succès.</p>

        <div className="flex flex-col gap-4">
          <button onClick={() => navigate(`/medecin/prescription/${id}?consultation_id=${newConsultationId}`)}
            className="w-full py-5 bg-emerald-600 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest hover:shadow-2xl hover:shadow-emerald-200 transition-all flex items-center justify-center gap-4 shadow-xl shadow-emerald-500/20 border-2 border-emerald-400"
          >
            <Pill className="w-6 h-6" />
            <span>Rédiger une ordonnance</span>
          </button>
          <button onClick={() => navigate(`/medecin/examen/${id}?consultation_id=${newConsultationId}`)}
            className="w-full py-5 bg-purple-600 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest hover:shadow-2xl hover:shadow-purple-200 transition-all flex items-center justify-center gap-4 shadow-xl shadow-purple-500/20 border-2 border-purple-400"
          >
            <TestTube className="w-6 h-6" />
            <span>Demander un examen labo</span>
          </button>
          <button onClick={() => navigate(`/medecin/dossier/${id}`)}
            className="w-full py-5 bg-slate-50 text-slate-600 border-2 border-slate-100 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-white hover:text-slate-900 transition-all mt-6 shadow-sm"
          >
            Retour au dossier patient
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
              <h1 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight leading-none">Consultation Médicale</h1>
              <p className="text-slate-500 text-[9px] md:text-[10px] font-bold uppercase tracking-widest mt-1">
                {patient ? `${patient.prenom} ${patient.nom} · N° ${patient.numero_dossier}` : 'Chargement...'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
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
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save className="w-4 h-4" /> <span>Terminer</span></>}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 md:px-10 pb-12 pt-[130px] md:pt-[140px]">

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 flex-1 min-h-0">
          <div className="lg:col-span-3 space-y-6 md:space-y-8 overflow-y-auto pr-0 md:pr-2 scrollbar-hide">
            {/* Motif & Symptômes */}
            <Card className="rounded-[2rem] md:rounded-[3rem] border-2 border-slate-200 shadow-2xl shadow-slate-200/50 p-6 md:p-10 bg-white">
              <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-6 md:mb-10 flex items-center gap-4 uppercase tracking-tight">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-50 rounded-xl md:rounded-2xl flex items-center justify-center border border-blue-100 shadow-sm">
                  <Info className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                </div>
                Motif & Symptômes
              </h2>
              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">Motif principal de visite <span className="text-rose-500 text-lg">*</span></label>
                  <input value={form.motif} onChange={set("motif")} placeholder="Saisissez le motif principal..."
                    className={`w-full px-6 py-5 border-2 rounded-[1.5rem] bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 text-sm font-bold transition-all placeholder-slate-300 shadow-inner ${errors.motif ? "border-rose-400 ring-rose-100" : "border-slate-200 focus:border-blue-500"}`} />
                  {errors.motif && <p className="text-rose-500 text-[10px] font-black uppercase ml-1 tracking-widest">{errors.motif}</p>}
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">Tableau clinique détaillé</label>
                  <textarea value={form.symptomes} onChange={set("symptomes")} rows={4}
                    placeholder="Notes sur les symptômes observés..."
                    className="w-full px-6 py-5 border-2 border-slate-200 rounded-[1.5rem] bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-sm font-bold resize-none transition-all placeholder-slate-300 shadow-inner" />
                </div>
              </div>
            </Card>

            <Card className="rounded-[2rem] md:rounded-[3rem] border-2 border-slate-200 shadow-2xl shadow-slate-200/50 p-6 md:p-10 bg-white">
              <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-6 md:mb-10 flex items-center gap-4 uppercase tracking-tight">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-50 rounded-xl md:rounded-2xl flex items-center justify-center border border-emerald-100 shadow-sm">
                  <Stethoscope className="w-5 h-5 md:w-6 md:h-6 text-emerald-600" />
                </div>
                Diagnostic & Traitement
              </h2>
              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">Conclusion médicale <span className="text-rose-500 text-lg">*</span></label>
                  <textarea value={form.diagnostic} onChange={set("diagnostic")} rows={3}
                    placeholder="Diagnostic établi par le praticien..."
                    className={`w-full px-6 py-5 border-2 rounded-[1.5rem] bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 text-sm font-bold resize-none transition-all placeholder-slate-300 shadow-inner ${errors.diagnostic ? "border-rose-400 ring-rose-100" : "border-slate-200 focus:border-blue-500"}`} />
                  {errors.diagnostic && <p className="text-rose-500 text-[10px] font-black uppercase ml-1 tracking-widest">{errors.diagnostic}</p>}
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">Protocole thérapeutique</label>
                  <textarea value={form.traitement} onChange={set("traitement")} rows={4}
                    placeholder="Prescriptions, conseils et prochaines étapes..."
                    className="w-full px-6 py-5 border-2 border-slate-200 rounded-[1.5rem] bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-sm font-bold resize-none transition-all placeholder-slate-300 shadow-inner" />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">Observations libres</label>
                  <textarea value={form.observations} onChange={set("observations")} rows={3}
                    placeholder="Notes confidentielles ou complémentaires..."
                    className="w-full px-6 py-5 border-2 border-slate-200 rounded-[1.5rem] bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-sm font-bold resize-none transition-all placeholder-slate-300 shadow-inner" />
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column: Vitals */}
          <div className="lg:col-span-2 space-y-6 md:space-y-8 overflow-y-auto pr-0 md:pr-2 scrollbar-hide">
            <Card className="rounded-[2rem] md:rounded-[3rem] border-2 border-slate-200 shadow-2xl shadow-slate-200/50 p-6 md:p-10 bg-white">
              <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-6 md:mb-10 flex items-center gap-4 uppercase tracking-tight">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-rose-50 rounded-xl md:rounded-2xl flex items-center justify-center border border-rose-100 shadow-sm">
                  <Activity className="w-5 h-5 md:w-6 md:h-6 text-rose-500" />
                </div>
                Constantes Vitales
              </h2>
              <div className="grid grid-cols-1 gap-6">
                {[
                  { key: "tension", label: "Pression Artérielle", icon: Activity, placeholder: "120/80", unit: "mmHg", colorClass: "bg-blue-50 text-blue-500" },
                  { key: "temperature", label: "Température Corporelle", icon: Thermometer, placeholder: "37.2", unit: "°C", colorClass: "bg-rose-50 text-rose-500" },
                  { key: "poids", label: "Masse Corporelle", icon: Weight, placeholder: "65", unit: "kg", colorClass: "bg-emerald-50 text-emerald-500" },
                  { key: "taille", label: "Taille Patient", icon: Ruler, placeholder: "168", unit: "cm", colorClass: "bg-purple-50 text-purple-500" },
                ].map(({ key, label, icon: Icon, placeholder, unit, colorClass }) => (
                  <div key={key} className="p-6 md:p-8 bg-slate-50 border-2 border-slate-100 rounded-[2rem] md:rounded-[2.5rem] hover:bg-white hover:border-blue-400 transition-all group shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 ${colorClass} bg-white border-2 border-current rounded-2xl flex items-center justify-center shadow-sm`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <span className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">{label}</span>
                      </div>
                      <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest bg-white px-3 py-1.5 rounded-xl border-2 border-slate-100 shadow-inner">{unit}</span>
                    </div>
                    <div className="relative">
                      <input type="text" value={(form as any)[key]} onChange={set(key)} placeholder={placeholder}
                        className="w-full bg-transparent text-4xl font-black text-slate-900 focus:outline-none placeholder-slate-300 tracking-tighter transition-all" />
                      <div className="absolute bottom-0 left-0 w-12 h-1 bg-slate-200 group-hover:w-full group-hover:bg-blue-500 transition-all duration-500 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <div className="pt-6 space-y-6">
              <button onClick={handleSave} disabled={loading}
                className="w-full py-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest hover:shadow-2xl hover:shadow-blue-300 transition-all flex items-center justify-center gap-4 shadow-xl shadow-blue-500/30 border-2 border-blue-400 active:scale-95"
              >
                {loading ? (
                  <div className="w-7 h-7 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                ) : <><Save className="w-6 h-6" /> VALIDER LA CONSULTATION</>}
              </button>

              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => navigate(`/medecin/prescription/${id}`)}
                  className="py-5 bg-white text-emerald-600 border-2 border-slate-100 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-emerald-50 hover:border-emerald-300 transition-all shadow-sm active:scale-95"
                >
                  Ordonnance
                </button>
                <button onClick={() => navigate(`/medecin/examen/${id}`)}
                  className="py-5 bg-white text-purple-600 border-2 border-slate-100 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-purple-50 hover:border-purple-300 transition-all shadow-sm active:scale-95"
                >
                  Laboratoire
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

