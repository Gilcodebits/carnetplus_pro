import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "../components/Card";
import { patientsAPI } from "../services/api";
import {
  ArrowLeft, Calendar, FileText, Pill, Activity,
  Stethoscope, TestTube, Phone, Mail, MapPin,
  AlertTriangle, ChevronRight, Plus, User, 
  ChevronLeft, Info, Heart
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

/* ── Helpers ──────────────────────────────────────────────── */
const getInitiales = (prenom: string, nom: string) => 
  `${prenom?.charAt(0) || ""}${nom?.charAt(0) || ""}`.toUpperCase();

const calculateAge = (date_naissance: string) => {
  if (!date_naissance) return "—";
  try {
    const birthDate = new Date(date_naissance);
    const difference = Date.now() - birthDate.getTime();
    const age = new Date(difference);
    return Math.abs(age.getUTCFullYear() - 1970);
  } catch (e) { return "—"; }
};

export function PatientDossier() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { id }   = useParams();
  const isMedecin = user?.role === 'medecin';
  const returnPath = user?.role === 'secretaire' ? '/secretaire/patients' : '/medecin';
  const [patient, setPatient]   = useState<any>(null);
  const [loading, setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState<"consultations"|"prescriptions"|"examens">("consultations");

  useEffect(() => {
    if (id) loadPatient(Number(id));
  }, [id]);

  const loadPatient = async (pid: number) => {
    setLoading(true);
    try {
      const data = await patientsAPI.get(pid);
      if (!data) throw new Error("Dossier vide");

      // Sécurité sur les tableaux
      const rawPrescriptions = Array.isArray(data.prescriptions) ? data.prescriptions : [];
      const rawConsultations = Array.isArray(data.consultations) ? data.consultations : [];
      const rawExamens = Array.isArray(data.examens) ? data.examens : [];

      // Grouper les médicaments par prescription_id
      const groupedPrescriptions = rawPrescriptions.reduce((acc: any[], curr: any) => {
        const existing = acc.find(p => p.id === curr.id);
        const med = `${curr.nom_medicament} (${curr.posologie || ""} - ${curr.duree || ""})`;
        if (existing) {
          existing.medicaments.push(med);
        } else {
          acc.push({
            ...curr,
            medicaments: [med]
          });
        }
        return acc;
      }, []);

      setPatient({
        ...data,
        consultations: rawConsultations,
        prescriptions: groupedPrescriptions,
        examens: rawExamens
      });
    } catch (err) {
      console.error("Erreur chargement dossier:", err);
      setPatient(null);
    } finally {
      setLoading(false);
    }
  };

  const statutPrescription: Record<string,string> = {
    active:   "bg-emerald-50 text-emerald-700",
    terminee: "bg-gray-50 text-gray-400",
    annulee:  "bg-rose-50 text-rose-600",
  };
  const statutExamen: Record<string,string> = {
    demande:  "bg-orange-50 text-orange-700",
    en_cours: "bg-blue-50 text-blue-700",
    termine:  "bg-emerald-50 text-emerald-700",
    transmis: "bg-purple-50 text-purple-700",
  };

  if (loading) return (
    <div className="flex h-screen bg-slate-200 items-center justify-center p-8">
      <div className="bg-white p-14 rounded-[3rem] border-2 border-slate-200 shadow-2xl shadow-slate-200/50 text-center animate-scaleIn">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
        <p className="text-slate-900 font-black uppercase tracking-widest text-[10px]">Extraction du dossier médical...</p>
      </div>
    </div>
  );

  if (!patient) return (
    <div className="p-8 text-center py-40">
      <div className="w-20 h-20 bg-rose-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6">
        <AlertTriangle className="w-10 h-10 text-rose-500"/>
      </div>
      <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-2">Dossier introuvable</h2>
      <p className="text-gray-400 font-medium italic mb-8">Le patient demandé n'existe pas ou le dossier est inaccessible.</p>
      <button onClick={()=>navigate(returnPath)} className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black flex items-center gap-2 mx-auto hover:shadow-xl transition-all uppercase text-xs tracking-widest">
        <ChevronLeft className="w-4 h-4"/> Retour au Dashboard
      </button>
    </div>
  );

  return (
    <div className="p-10 animate-fadeIn bg-slate-200 min-h-screen flex flex-col">
      {/* Patient Header Card */}
      <div className="flex items-center gap-4 text-slate-400 hover:text-blue-600 transition-all mb-8 cursor-pointer group w-fit" onClick={()=>navigate(returnPath)}>
        <div className="p-3 bg-white rounded-2xl border-2 border-slate-100 shadow-sm group-hover:bg-blue-50 group-hover:border-blue-100 transition-all">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-all"/>
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest">Retour Dashboard</span>
      </div>

      <div className="bg-white p-12 rounded-[3rem] shadow-2xl shadow-slate-200/50 border-2 border-slate-200 mb-10 flex flex-col lg:flex-row items-center justify-between gap-10 flex-shrink-0">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-[2rem] flex items-center justify-center text-white text-2xl font-black shadow-xl shadow-blue-200">
              {getInitiales(patient.prenom, patient.nom)}
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-xl shadow-md flex items-center justify-center border border-gray-50">
              <span className="text-[10px] font-black text-blue-600 uppercase">{patient.groupe_sanguin || "—"}</span>
            </div>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-4 mb-3">
              <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none uppercase">{patient.prenom} {patient.nom}</h1>
              <span className="text-[11px] font-black bg-blue-50 text-blue-600 px-4 py-2 rounded-xl border-2 border-blue-100 uppercase tracking-widest shadow-sm">{patient.numero_dossier}</span>
              {(patient.antecedents || "").includes("Diabète") || (patient.antecedents || "").includes("Hypertension") ? (
                <span className="flex items-center gap-1.5 text-[10px] font-black bg-rose-50 text-rose-600 px-3 py-1.5 rounded-xl border border-rose-100 uppercase tracking-widest animate-pulse">
                  <AlertTriangle className="w-3.5 h-3.5"/> Vigilance
                </span>
              ) : null}
            </div>
            <p className="text-slate-400 text-xs font-black uppercase tracking-widest mt-2 flex items-center gap-4">
              <span>{calculateAge(patient.date_naissance)} ans</span>
              <span className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
              <span>{patient.sexe==="F"?"Femme":"Homme"}</span>
              <span className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
              <span>Né(e) le {patient.date_naissance ? new Date(patient.date_naissance).toLocaleDateString("fr-FR", {day:"numeric", month:"long", year:"numeric"}) : "—"}</span>
            </p>
          </div>
        </div>

        {isMedecin && (
          <div className="flex flex-wrap gap-4">
            <button onClick={()=>navigate(`/medecin/consultation/${id}`)}
              className="flex items-center gap-4 px-8 py-5 bg-blue-600 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest hover:shadow-2xl hover:shadow-blue-300 transition-all active:scale-95 shadow-xl shadow-blue-500/20 border-2 border-blue-500"
            >
              <Stethoscope className="w-6 h-6"/> <span>Consultation</span>
            </button>
            <button onClick={()=>navigate(`/medecin/prescription/${id}`)}
              className="flex items-center gap-4 px-8 py-5 bg-emerald-600 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest hover:shadow-2xl hover:shadow-emerald-300 transition-all active:scale-95 shadow-xl shadow-emerald-500/20 border-2 border-emerald-500"
            >
              <Pill className="w-6 h-6"/> <span>Prescrire</span>
            </button>
            <button onClick={()=>navigate(`/medecin/examen/${id}`)}
              className="flex items-center gap-4 px-8 py-5 bg-purple-600 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest hover:shadow-2xl hover:shadow-purple-300 transition-all active:scale-95 shadow-xl shadow-purple-500/20 border-2 border-purple-500"
            >
              <TestTube className="w-6 h-6"/> <span>Examen Labo</span>
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 flex-1 min-h-0">
        <div className="lg:col-span-2 space-y-8 overflow-y-auto pr-2 scrollbar-hide">
          <Card className="rounded-[3rem] border-2 border-slate-200 shadow-2xl shadow-slate-200/50 p-10 bg-white">
            <h3 className="font-black text-slate-900 mb-6 flex items-center gap-3 uppercase tracking-tight text-sm">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100">
                <User className="w-5 h-5 text-blue-600"/>
              </div>
              Coordonnées
            </h3>
            <div className="space-y-4">
              {[
                { icon:Phone, label:"Téléphone", val:patient.telephone || "Non renseigné", color:"bg-blue-50 text-blue-600", b:"border-blue-100" },
                { icon:Mail,  label:"Email", val:patient.email || "Non renseigné", color:"bg-purple-50 text-purple-600", b:"border-purple-100" },
                { icon:MapPin,label:"Adresse", val:patient.adresse || "Non renseigné", color:"bg-emerald-50 text-emerald-600", b:"border-emerald-100" },
              ].map(({icon:Icon, label, val, color, b}, i)=>(
                <div key={i} className="flex items-start gap-4 p-5 rounded-3xl hover:bg-blue-50/30 transition-all border border-slate-100 hover:border-blue-100 group">
                  <div className={`w-10 h-10 ${color} ${b} border rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-5 h-5"/>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
                    <p className="text-sm font-black text-slate-800">{val}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="rounded-[3rem] border-2 border-slate-200 shadow-2xl shadow-slate-200/50 p-10 bg-white">
            <h3 className="font-black text-slate-900 mb-8 flex items-center gap-4 uppercase tracking-tight text-base">
              <div className="w-12 h-12 bg-rose-50 rounded-[1.2rem] flex items-center justify-center border-2 border-rose-100 shadow-sm">
                <Heart className="w-6 h-6 text-rose-500"/>
              </div>
              Bilan Médical Global
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label:"Groupe", val:patient.groupe_sanguin || "—", color:"text-rose-600", bg:"bg-rose-50/50", border:"border-rose-100" },
                { label:"Taille/Poids", val:`${patient.taille || "—"} / ${patient.poids || "—"}`, color:"text-blue-600", bg:"bg-blue-50/50", border:"border-blue-100" },
                { label:"Allergies", val:patient.allergies || "Aucune", color:"text-orange-600", bg:"bg-orange-50/50", border:"border-orange-100", full:true },
                { label:"Antécédents", val:patient.antecedents || "Aucun", color:"text-purple-600", bg:"bg-purple-50/50", border:"border-purple-100", full:true },
              ].map((item)=>(
                <div key={item.label} className={`p-5 ${item.bg} ${item.border} border-2 rounded-3xl ${item.full ? 'col-span-2' : ''} hover:scale-[1.02] transition-transform`}>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{item.label}</p>
                  <p className={`font-black text-base ${item.color}`}>{item.val}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-3 flex flex-col min-h-0">
          <Card noPadding className="rounded-[3rem] border-2 border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden bg-white flex-1 flex flex-col">
            <div className="p-3 bg-slate-50/50 border-b-2 border-slate-100 flex-shrink-0">
              <div className="flex items-center gap-1">
                {[
                  { key:"consultations", label:"Visites", icon:Stethoscope, count:patient.consultations?.length || 0 },
                  { key:"prescriptions", label:"Soins",  icon:Pill,        count:patient.prescriptions?.length || 0 },
                  { key:"examens",       label:"Labo",        icon:TestTube,    count:patient.examens?.length || 0 },
                ].map(({key,label,icon:Icon,count})=>(
                  <button key={key} onClick={()=>setActiveTab(key as any)}
                    className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all ${activeTab===key ? "bg-white text-blue-600 shadow-lg shadow-gray-200" : "text-gray-400 hover:text-gray-600 hover:bg-white/50"}`}>
                    <Icon className="w-4 h-4"/>
                    {label}
                    <span className={`px-2 py-0.5 rounded-lg text-[9px] ${activeTab===key ? "bg-blue-50 text-blue-600" : "bg-gray-200 text-gray-500"}`}>{count}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-8 overflow-y-auto flex-1 scrollbar-hide">
              {activeTab==="consultations" && (
                <div className="space-y-6">
                  {patient.consultations?.length===0 ? (
                    <div className="py-20 text-center">
                      <Stethoscope className="w-16 h-16 text-gray-100 mx-auto mb-4" />
                      <p className="text-gray-400 font-black uppercase tracking-widest text-xs italic">Historique de visites vierge</p>
                    </div>
                  ) : (
                    patient.consultations?.map((c: any, i: number)=>(
                      <div key={c.id} onClick={()=>isMedecin && navigate(`/medecin/consultation/${id}`)}
                        className={`p-8 border-2 transition-all ${isMedecin ? 'cursor-pointer hover:scale-[1.01] hover:shadow-2xl hover:shadow-blue-200/50' : ''} group animate-fadeInUp rounded-[2rem] ${i % 2 === 0 ? 'bg-white border-slate-200' : 'bg-blue-50/30 border-blue-100'}`}>
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-1 group-hover:text-blue-700 transition-colors">{c.motif}</h4>
                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                              <Calendar className="w-3.5 h-3.5"/> {c.date_consultation ? new Date(c.date_consultation).toLocaleDateString("fr-FR", {day:"numeric", month:"long", year:"numeric"}) : "—"}
                            </div>
                          </div>
                          <div className="w-10 h-10 bg-white rounded-xl border border-slate-100 flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                            <ChevronRight className="w-6 h-6"/>
                          </div>
                        </div>
                        <p className="text-sm text-slate-600 font-medium leading-relaxed mb-6 italic">"{c.diagnostic}"</p>
                        <div className="flex flex-wrap gap-4 pt-6 border-t border-slate-100">
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50/50 rounded-xl border border-blue-100">
                            <User className="w-3.5 h-3.5 text-blue-500"/>
                            <span className="text-[10px] font-black text-slate-700 uppercase">Dr. {c.medecin_nom}</span>
                          </div>
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50/50 rounded-xl border border-emerald-100">
                            <Activity className="w-3.5 h-3.5 text-emerald-600"/>
                            <span className="text-[10px] font-black text-emerald-700 uppercase">{c.tension || "—"}</span>
                          </div>
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-50/50 rounded-xl border border-rose-100">
                            <div className="w-1.5 h-1.5 bg-rose-500 rounded-full"/>
                            <span className="text-[10px] font-black text-rose-700 uppercase">{c.temperature || "—"}°C</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab==="prescriptions" && (
                <div className="space-y-6">
                  {patient.prescriptions?.length===0 ? (
                    <div className="py-20 text-center">
                      <Pill className="w-16 h-16 text-gray-100 mx-auto mb-4" />
                      <p className="text-gray-400 font-black uppercase tracking-widest text-xs italic">Aucune ordonnance délivrée</p>
                    </div>
                  ) : (
                    patient.prescriptions?.map((p: any, i: number)=>(
                      <div key={p.id} className="p-8 bg-white border border-gray-100 rounded-[2rem] hover:border-emerald-100 transition-all group animate-fadeInUp">
                        <div className="flex justify-between items-start mb-6">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                              <Pill className="w-6 h-6 text-emerald-600"/>
                            </div>
                            <div>
                              <p className="text-sm font-black text-gray-900 uppercase">{p.created_at ? new Date(p.created_at).toLocaleDateString("fr-FR", {day:"numeric", month:"long", year:"numeric"}) : "—"}</p>
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Dr. {p.medecin_nom}</p>
                            </div>
                          </div>
                          <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${statutPrescription[p.statut] || "bg-gray-100 text-gray-500"}`}>
                            {p.statut}
                          </span>
                        </div>
                        <div className="space-y-3 pl-2">
                          {p.medicaments?.map((m: string, j: number)=>(
                            <div key={j} className="flex items-center gap-4 p-4 bg-gray-50/50 rounded-2xl border border-transparent hover:border-emerald-100 transition-all">
                              <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-sm shadow-emerald-200"/>
                              <p className="text-sm text-gray-700 font-bold">{m}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab==="examens" && (
                <div className="space-y-6">
                  {patient.examens?.length===0 ? (
                    <div className="py-20 text-center">
                      <TestTube className="w-16 h-16 text-gray-100 mx-auto mb-4" />
                      <p className="text-gray-400 font-black uppercase tracking-widest text-xs italic">Aucun examen de laboratoire</p>
                    </div>
                  ) : (
                    patient.examens?.map((e: any, i: number)=>(
                      <div key={e.id} className="p-8 bg-white border border-gray-100 rounded-[2rem] hover:border-purple-100 transition-all group animate-fadeInUp">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                              <TestTube className="w-6 h-6 text-purple-600"/>
                            </div>
                            <div>
                              <p className="text-sm font-black text-gray-900 uppercase tracking-tight">{e.type_examen}</p>
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{e.date_demande ? new Date(e.date_demande).toLocaleDateString() : "—"}</p>
                            </div>
                          </div>
                          <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${statutExamen[e.statut] || "bg-gray-100"}`}>
                            {e.statut}
                          </span>
                        </div>
                        {e.resultat && (
                          <div className="p-5 bg-purple-50/30 rounded-2xl border border-purple-100">
                            <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-2">Résultat transmis</p>
                            <p className="text-sm text-purple-900 font-bold leading-relaxed">{e.resultat}</p>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
