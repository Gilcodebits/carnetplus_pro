import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Card } from "../components/Card";
import { patientsAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import {
  Calendar, FileText, Pill, Activity,
  Stethoscope, TestTube, Phone, Mail, MapPin,
  AlertTriangle, ChevronRight, User, 
  ChevronLeft, Info, Heart, Download, 
  Printer, Share2, Sparkles, ShieldCheck,
  TrendingUp, Clock, FlaskConical
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
  const isPatient = user?.role === 'patient';
  const isMedecin = user?.role === 'medecin';
  
  const [patient, setPatient]   = useState<any>(null);
  const [loading, setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState<"consultations"|"prescriptions"|"examens">("consultations");

  useEffect(() => {
    if (id) {
      loadPatient(Number(id));
    } else if (user?.role === 'patient') {
      loadPatient(0); // 0 triggers the "me" logic in the backend
    }
  }, [id, user]);

  const loadPatient = async (pid: number) => {
    setLoading(true);
    try {
      const data = await patientsAPI.get(pid);
      if (!data) throw new Error("Dossier vide");

      const rawPrescriptions = Array.isArray(data.prescriptions) ? data.prescriptions : [];
      const rawConsultations = Array.isArray(data.consultations) ? data.consultations : [];
      const rawExamens = Array.isArray(data.examens) ? data.examens : [];

      const groupedPrescriptions = rawPrescriptions.reduce((acc: any[], curr: any) => {
        const existing = acc.find(p => p.id === curr.id);
        const med = `${curr.nom_medicament} (${curr.posologie || ""} - ${curr.duree || ""})`;
        if (existing) {
          existing.medicaments.push(med);
        } else {
          acc.push({ ...curr, medicaments: [med] });
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

  if (loading) return (
    <div className="flex h-screen bg-slate-50 items-center justify-center font-sans">
      <div className="text-center animate-pulse">
        <div className="w-20 h-20 bg-blue-600 rounded-[2.5rem] flex items-center justify-center mb-8 mx-auto shadow-2xl shadow-blue-200">
           <FileText className="w-10 h-10 text-white animate-bounce" />
        </div>
        <p className="text-slate-900 font-black uppercase tracking-[0.3em] text-[10px]">Ouverture de votre Carnet de Santé...</p>
      </div>
    </div>
  );

  if (!patient) return (
    <div className="flex h-screen bg-slate-50 items-center justify-center p-12 text-center">
      <Card className="max-w-md p-16 rounded-[4rem] border-2 border-slate-100 shadow-2xl">
        <div className="w-24 h-24 bg-rose-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 border-2 border-rose-100">
          <AlertTriangle className="w-12 h-12 text-rose-500"/>
        </div>
        <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight mb-4">Dossier Inaccessible</h2>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] leading-loose mb-10">Nous n'avons pas pu charger votre historique médical. Veuillez contacter l'administration.</p>
        <button onClick={()=>navigate(isPatient ? "/patient" : "/medecin")} className="w-full py-6 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-200">
          Retour au Portail
        </button>
      </Card>
    </div>
  );

  return (
    <div className="flex-1 overflow-auto scrollbar-hide flex flex-col relative pt-6 px-10 pb-10">
      
      {/* Header Premium */}
        <div className="max-w-7xl mx-auto w-full mb-10">
          <div className="bg-white p-12 rounded-[4rem] shadow-2xl shadow-slate-200/50 border-2 border-slate-100 flex flex-col lg:flex-row items-center justify-between gap-12 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-32 -mt-32 transition-all group-hover:scale-110 opacity-50" />
            
            <div className="flex items-center gap-10 relative z-10">
              <div className="relative">
                <div className="w-28 h-28 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[3rem] flex items-center justify-center text-white text-4xl font-black shadow-2xl shadow-blue-200 border-4 border-white">
                  {getInitiales(patient.prenom, patient.nom)}
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 border-4 border-white rounded-2xl flex items-center justify-center shadow-lg">
                   <span className="text-[11px] font-black text-white uppercase">{patient.groupe_sanguin || "—"}</span>
                </div>
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-6 mb-4">
                  <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase">{patient.prenom} {patient.nom}</h1>
                  <span className="px-5 py-2 bg-blue-50 text-blue-600 rounded-2xl text-[11px] font-black uppercase tracking-widest border border-blue-100 shadow-sm">{patient.numero_dossier}</span>
                </div>
                <div className="flex items-center gap-6 text-slate-400 text-[11px] font-black uppercase tracking-[0.2em] opacity-80">
                  <span className="flex items-center gap-2"><User className="w-4 h-4 text-blue-500" /> {calculateAge(patient.date_naissance)} ans</span>
                  <div className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
                  <span>{patient.sexe==="F"?"Femme":"Homme"}</span>
                  <div className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
                  <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-indigo-500" /> {patient.date_naissance ? new Date(patient.date_naissance).toLocaleDateString("fr-FR", {day:"numeric", month:"long", year:"numeric"}) : "—"}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 relative z-10">
              {isMedecin ? (
                <>
                  <button onClick={()=>navigate(`/medecin/consultation/${id}`)} className="flex items-center gap-4 px-8 py-5 bg-blue-600 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:shadow-2xl hover:shadow-blue-300 transition-all active:scale-95 border-2 border-blue-500"><Stethoscope className="w-6 h-6"/> <span>Consultation</span></button>
                  <button onClick={()=>navigate(`/medecin/prescription/${id}`)} className="flex items-center gap-4 px-8 py-5 bg-emerald-600 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:shadow-2xl hover:shadow-emerald-300 transition-all active:scale-95 border-2 border-emerald-500"><Pill className="w-6 h-6"/> <span>Prescrire</span></button>
                </>
              ) : (
                <>
                  <button className="flex items-center gap-4 px-8 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:shadow-2xl hover:shadow-slate-300 transition-all active:scale-95 border-2 border-slate-700"><Download className="w-6 h-6 text-blue-400"/> <span>Télécharger Mon Carnet</span></button>
                  <button className="w-16 h-16 bg-white border-2 border-slate-100 text-slate-400 rounded-[1.5rem] flex items-center justify-center hover:bg-slate-50 hover:text-blue-600 transition-all shadow-sm"><Printer className="w-7 h-7" /></button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Sidebar Info */}
          <div className="lg:col-span-4 space-y-10">
            <Card className="rounded-[4rem] border-2 border-slate-100 shadow-2xl shadow-slate-200/50 p-12 bg-white">
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-10 flex items-center gap-4">
                 <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100 shadow-sm text-blue-600"><Phone className="w-6 h-6"/></div>
                 Coordonnées
              </h3>
              <div className="space-y-6">
                {[
                  { icon:Phone, label:"Téléphone", val:patient.telephone || "—", color:"text-blue-600", bg:"bg-blue-50" },
                  { icon:Mail,  label:"Email Personnel", val:patient.email || "—", color:"text-purple-600", bg:"bg-purple-50" },
                  { icon:MapPin,label:"Adresse de Résidence", val:patient.adresse || "—", color:"text-rose-600", bg:"bg-rose-50" },
                ].map((item, i)=>(
                  <div key={i} className="flex items-start gap-6 group">
                    <div className={`w-14 h-14 ${item.bg} rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                       <item.icon className={`w-7 h-7 ${item.color}`} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{item.label}</p>
                      <p className="text-base font-black text-slate-800 tracking-tight">{item.val}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="rounded-[4rem] border-2 border-slate-100 shadow-2xl shadow-slate-200/50 p-12 bg-slate-900 text-white relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-64 h-64 bg-rose-600/10 rounded-full blur-[80px] group-hover:scale-150 transition-transform duration-1000" />
               <h3 className="text-xl font-black uppercase tracking-tight mb-10 flex items-center gap-4 relative z-10">
                 <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 shadow-sm text-rose-400"><Heart className="w-6 h-6"/></div>
                 Bilan Vital
               </h3>
               <div className="grid grid-cols-2 gap-4 relative z-10">
                 {[
                   { label:"IMC", val: "22.4", color:"text-emerald-400", sub: "Normal" },
                   { label:"Tension", val: "12/8", color:"text-blue-400", sub: "Optimale" },
                   { label:"Allergies", val: patient.allergies || "Aucune", color:"text-orange-400", full: true },
                   { label:"Antécédents", val: patient.antecedents || "RAS", color:"text-rose-400", full: true },
                 ].map((item, i)=>(
                   <div key={i} className={`p-6 bg-white/5 border border-white/10 rounded-[2rem] ${item.full ? 'col-span-2' : ''} hover:bg-white/10 transition-all`}>
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{item.label}</p>
                     <p className={`text-2xl font-black ${item.color} tracking-tighter`}>{item.val}</p>
                     {item.sub && <p className="text-[9px] font-black uppercase text-slate-600 mt-1">{item.sub}</p>}
                   </div>
                 ))}
               </div>
            </Card>
          </div>

          {/* Main Tabs Content */}
          <div className="lg:col-span-8 space-y-10">
            <div className="bg-white p-4 rounded-[3rem] border-2 border-slate-100 shadow-xl shadow-slate-200/50 flex items-center gap-4">
              {[
                { key:"consultations", label:"Visites Médicales", icon:Stethoscope, count:patient.consultations?.length || 0 },
                { key:"prescriptions", label:"Ordonnances",  icon:Pill,        count:patient.prescriptions?.length || 0 },
                { key:"examens",       label:"Laboratoire",        icon:FlaskConical,    count:patient.examens?.length || 0 },
              ].map(({key,label,icon:Icon,count})=>(
                <button key={key} onClick={()=>setActiveTab(key as any)}
                  className={`flex-1 flex items-center justify-center gap-4 py-5 rounded-[2.5rem] font-black text-xs uppercase tracking-widest transition-all relative overflow-hidden group ${
                    activeTab===key ? "bg-blue-600 text-white shadow-2xl shadow-blue-200 scale-105" : "text-slate-400 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="w-5 h-5"/>
                  <span>{label}</span>
                  <span className={`px-3 py-1 rounded-xl text-[10px] font-black ${activeTab===key ? "bg-white/20 text-white" : "bg-slate-100 text-slate-400"}`}>{count}</span>
                </button>
              ))}
            </div>

            <div className="min-h-[600px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  {activeTab === "consultations" && (
                    <div className="grid grid-cols-1 gap-8">
                       {patient.consultations?.length === 0 ? (
                         <div className="py-32 text-center bg-white rounded-[4rem] border-4 border-dashed border-slate-100 shadow-inner">
                            <Stethoscope className="w-20 h-20 text-slate-100 mx-auto mb-8" />
                            <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-xs">Aucune consultation enregistrée</p>
                         </div>
                       ) : (
                         patient.consultations.map((c: any, i: number) => (
                           <div key={i} className="group bg-white p-10 rounded-[4rem] border-2 border-slate-100 hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-200/50 transition-all relative overflow-hidden">
                             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
                               <div className="flex items-center gap-8">
                                 <div className="w-20 h-20 bg-blue-50 rounded-[2rem] flex flex-col items-center justify-center border-2 border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
                                   <Calendar className="w-8 h-8 group-hover:scale-110 transition-transform" />
                                 </div>
                                 <div>
                                    <div className="flex items-center gap-4 mb-2">
                                       <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{new Date(c.date_consultation).toLocaleDateString('fr-FR', {day:'numeric', month:'long', year:'numeric'})}</span>
                                       <span className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
                                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dr. {c.medecin_nom}</span>
                                    </div>
                                    <h4 className="text-3xl font-black text-slate-900 uppercase tracking-tight group-hover:text-blue-600 transition-colors mb-2">{c.motif}</h4>
                                    <p className="text-slate-500 font-medium italic text-base leading-relaxed line-clamp-2">"{c.diagnostic}"</p>
                                 </div>
                               </div>
                               <button className="w-14 h-14 bg-slate-50 text-slate-300 rounded-[1.5rem] flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-sm group-hover:translate-x-2">
                                 <ChevronRight className="w-8 h-8" />
                               </button>
                             </div>
                           </div>
                         ))
                       )}
                    </div>
                  )}

                  {activeTab === "prescriptions" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       {patient.prescriptions?.map((p: any, i: number) => (
                         <div key={i} className="bg-white p-10 rounded-[4rem] border-2 border-slate-100 hover:border-emerald-500 hover:shadow-2xl hover:shadow-emerald-200/50 transition-all group">
                            <div className="flex items-center justify-between mb-8">
                               <div className="w-14 h-14 bg-emerald-50 rounded-[1.5rem] flex items-center justify-center border-2 border-emerald-100 text-emerald-600 shadow-sm group-hover:scale-110 transition-transform">
                                  <Pill className="w-8 h-8" />
                               </div>
                               <div className="flex flex-col items-end">
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{new Date(p.created_at).toLocaleDateString()}</p>
                                  <button 
                                    onClick={() => navigate(`/prescription-view/${p.id}`)}
                                    className="px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-black uppercase hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                                  >
                                    Consulter
                                  </button>
                               </div>
                            </div>
                            <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-6">Ordonnance Médicale</h4>
                            <div className="space-y-4">
                               {p.medicaments.map((m: string, j: number) => (
                                 <div key={j} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                                    <p className="text-xs font-bold text-slate-700">{m}</p>
                                 </div>
                               ))}
                            </div>
                         </div>
                       ))}
                    </div>
                  )}

                  {activeTab === "examens" && (
                    <div className="space-y-8">
                       {patient.examens?.map((e: any, i: number) => (
                         <div key={i} className="bg-white p-10 rounded-[4rem] border-2 border-slate-100 hover:border-purple-500 hover:shadow-2xl hover:shadow-purple-200/50 transition-all flex items-center justify-between">
                            <div className="flex items-center gap-8">
                               <div className="w-20 h-20 bg-purple-50 rounded-[2rem] flex items-center justify-center border-2 border-purple-100 text-purple-600 shadow-inner">
                                  <FlaskConical className="w-10 h-10" />
                               </div>
                               <div>
                                  <div className="flex items-center gap-3 mb-2">
                                     <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest">{new Date(e.date_demande).toLocaleDateString()}</span>
                                     <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase ${e.statut === 'termine' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                                       {e.statut}
                                     </span>
                                  </div>
                                  <h4 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{e.type_examen}</h4>
                                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Laboratoire Central · Résultat en attente</p>
                               </div>
                            </div>
                            <button className="px-10 py-5 bg-slate-50 text-slate-400 rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-purple-600 hover:text-white transition-all shadow-sm">Consulter</button>
                         </div>
                       ))}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
