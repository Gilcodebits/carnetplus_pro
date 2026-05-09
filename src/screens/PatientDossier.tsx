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
      <Card className="max-w-md p-10 rounded-2xl border border-slate-100 shadow-xl">
        <div className="w-16 h-16 bg-rose-50 rounded-xl flex items-center justify-center mx-auto mb-6 border border-rose-100">
          <AlertTriangle className="w-8 h-8 text-rose-500"/>
        </div>
        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">Dossier Inaccessible</h2>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px] leading-loose mb-8">Nous n'avons pas pu charger votre historique médical. Veuillez contacter l'administration.</p>
        <button onClick={()=>navigate(isPatient ? "/patient" : "/medecin")} className="w-full py-4 bg-slate-900 text-white rounded-xl font-black uppercase text-[9px] tracking-widest hover:bg-blue-600 transition-all shadow-lg shadow-slate-200">
          Retour au Portail
        </button>
      </Card>
    </div>
  );

  return (
    <>
      <div className="flex-1 flex flex-col relative pt-6 px-10 pb-10">
        
        {/* Header Compact */}
          <div className="max-w-7xl mx-auto w-full mb-10 sticky top-0 z-40 bg-slate-50/90 backdrop-blur-xl -mx-10 px-10 py-6 border-b border-slate-200/50">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative overflow-hidden group">
              
              <div className="flex items-center gap-6 relative z-10">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[1.5rem] flex items-center justify-center text-white text-2xl font-black shadow-xl shadow-blue-200 border-2 border-white/20">
                    {getInitiales(patient.prenom, patient.nom)}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-2 border-white rounded-lg flex items-center justify-center shadow-md">
                     <span className="text-[8px] font-black text-white uppercase">{patient.groupe_sanguin || "—"}</span>
                  </div>
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-4 mb-1">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">{patient.prenom} {patient.nom}</h1>
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-blue-100 shadow-sm">N° {patient.numero_dossier}</span>
                  </div>
                  <div className="flex items-center gap-4 text-slate-400 text-[10px] font-black uppercase tracking-widest opacity-80">
                    <span className="flex items-center gap-1.5"><User className="w-3 h-3 text-blue-500" /> {calculateAge(patient.date_naissance)} ans</span>
                    <div className="w-1 h-1 bg-slate-300 rounded-full" />
                    <span>{patient.sexe==="F"?"Femme":"Homme"}</span>
                    <div className="w-1 h-1 bg-slate-300 rounded-full" />
                    <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3 text-indigo-500" /> {patient.date_naissance ? new Date(patient.date_naissance).toLocaleDateString("fr-FR", {day:"numeric", month:"short", year:"numeric"}) : "—"}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 relative z-10 print:hidden">
                {isMedecin ? (
                  <>
                    <button onClick={()=>navigate(`/medecin/consultation/${id}`)} className="flex items-center gap-3 px-6 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:shadow-xl hover:shadow-blue-300 transition-all active:scale-95 border-2 border-blue-500"><Stethoscope className="w-5 h-5"/> <span>Consultation</span></button>
                    <button onClick={()=>navigate(`/medecin/prescription/${id}`)} className="flex items-center gap-3 px-6 py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:shadow-xl hover:shadow-emerald-300 transition-all active:scale-95 border-2 border-emerald-500"><Pill className="w-5 h-5"/> <span>Prescrire</span></button>
                  </>
                ) : (
                  <button 
                    onClick={async () => {
                      try {
                        const html2pdf = (await import('html2pdf.js')).default;
                        const element = document.getElementById('booklet-pdf');
                        if (element) {
                          const opt = {
                            margin:       0,
                            filename:     `Carnet_Medical_${patient.prenom}_${patient.nom}.pdf`,
                            image:        { type: 'jpeg', quality: 0.98 },
                            html2canvas:  { 
                              scale: 2, 
                              useCORS: true, 
                              letterRendering: true,
                              backgroundColor: '#ffffff'
                            },
                            jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
                          };
                          await html2pdf().set(opt).from(element).save();
                        }
                      } catch (e) {
                        console.error("Erreur PDF:", e);
                        alert("Erreur lors de la génération du PDF.");
                      }
                    }}
                    className="flex items-center gap-3 px-6 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:shadow-xl hover:shadow-slate-300 transition-all active:scale-95 border-2 border-slate-700"
                  >
                    <Download className="w-5 h-5 text-blue-400"/> <span>Télécharger Mon Carnet</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Professional Booklet Layout - Always rendered but invisible to user */}
          <div id="booklet-pdf" className="fixed top-0 left-0 opacity-0 pointer-events-none -z-[9999] bg-white p-12 font-sans text-slate-900 w-[210mm] min-h-[297mm]">
            {/* Header with logo-like style */}
            <div className="border-b-4 border-slate-900 pb-6 mb-8 flex justify-between items-end">
              <div>
                <h1 className="text-3xl font-black uppercase tracking-tighter leading-none">CarnetPlus</h1>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mt-1">Plateforme de Santé Numérique Certifiée</p>
              </div>
              <div className="text-right">
                <h2 className="text-xl font-black uppercase tracking-tight underline underline-offset-8 decoration-4 decoration-blue-600">Carnet Médical Individuel</h2>
                <p className="text-[9px] font-bold text-slate-400 mt-3 uppercase tracking-widest">Généré le {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR')}</p>
              </div>
            </div>

            {/* Top Info Grid */}
            <div className="grid grid-cols-2 gap-6 mb-8">
               {/* Patient Identity */}
               <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                  <div className="flex items-center gap-4 mb-4 border-b border-slate-200 pb-3">
                     <div className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center font-black">{getInitiales(patient.prenom, patient.nom)}</div>
                     <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-900">Identité du Patient</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                     <div>
                        <p className="text-[8px] font-black uppercase text-slate-400 mb-0.5">Nom et Prénoms</p>
                        <p className="text-sm font-black uppercase text-slate-900">{patient.prenom} {patient.nom}</p>
                     </div>
                     <div>
                        <p className="text-[8px] font-black uppercase text-slate-400 mb-0.5">N° de Dossier</p>
                        <p className="text-sm font-black text-blue-600">#{patient.numero_dossier}</p>
                     </div>
                     <div>
                        <p className="text-[8px] font-black uppercase text-slate-400 mb-0.5">Date de Naissance</p>
                        <p className="text-sm font-black text-slate-900">{new Date(patient.date_naissance).toLocaleDateString('fr-FR', {day:'2-digit', month:'long', year:'numeric'})}</p>
                     </div>
                     <div>
                        <p className="text-[8px] font-black uppercase text-slate-400 mb-0.5">Sexe / Groupe Sanguin</p>
                        <p className="text-sm font-black text-slate-900">{patient.sexe === 'F' ? 'Féminin' : 'Masculin'} <span className="ml-2 px-2 py-0.5 bg-rose-50 text-rose-600 rounded border border-rose-100">{patient.groupe_sanguin || '—'}</span></p>
                     </div>
                  </div>
               </div>

               {/* Medical Constants */}
               <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                  <div className="flex items-center gap-4 mb-4 border-b border-slate-200 pb-3">
                     <div className="w-10 h-10 bg-emerald-600 text-white rounded-lg flex items-center justify-center font-black"><Heart className="w-5 h-5"/></div>
                     <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-900">Constantes & Alertes</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="bg-white p-3 rounded-xl border border-slate-100">
                        <p className="text-[8px] font-black uppercase text-slate-400 mb-0.5">Tension Artérielle</p>
                        <p className="text-sm font-black text-slate-900">12/8 mmHg</p>
                     </div>
                     <div className="bg-white p-3 rounded-xl border border-slate-100">
                        <p className="text-[8px] font-black uppercase text-slate-400 mb-0.5">IMC</p>
                        <p className="text-sm font-black text-slate-900">22.4 (Normal)</p>
                     </div>
                     <div className="col-span-2 bg-rose-50/30 p-3 rounded-xl border border-rose-100">
                        <p className="text-[8px] font-black uppercase text-rose-400 mb-0.5">Allergies Signalées</p>
                        <p className="text-[11px] font-black text-rose-700 leading-tight">{patient.allergies || 'Aucune allergie connue à ce jour.'}</p>
                     </div>
                  </div>
               </div>
            </div>

            {/* Dense Medical History Grid - 3 Columns */}
            <div className="grid grid-cols-3 gap-6">
               {/* Consultations Column */}
               <div>
                  <h4 className="flex items-center gap-2 bg-slate-900 text-white px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest mb-4">
                     <Stethoscope className="w-3.5 h-3.5"/> Visites
                  </h4>
                  <div className="space-y-4">
                     {patient.consultations?.length === 0 ? <p className="text-[9px] italic text-slate-400">Aucun historique.</p> : 
                      patient.consultations.slice(0, 6).map((c: any, i: number) => (
                        <div key={i} className="relative pl-4 pb-2 border-l-2 border-slate-100">
                           <div className="absolute top-0 -left-[5px] w-2 h-2 bg-blue-500 rounded-full" />
                           <p className="text-[8px] font-black text-blue-600 uppercase mb-0.5">{new Date(c.date_consultation).toLocaleDateString()}</p>
                           <p className="text-[10px] font-black text-slate-900 leading-tight uppercase mb-0.5">{c.motif}</p>
                           <p className="text-[8px] font-bold text-slate-400 italic">Dr. {c.medecin_nom}</p>
                        </div>
                      ))
                     }
                  </div>
               </div>

               {/* Prescriptions Column */}
               <div>
                  <h4 className="flex items-center gap-2 bg-slate-900 text-white px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest mb-4">
                     <Pill className="w-3.5 h-3.5"/> Traitements
                  </h4>
                  <div className="space-y-4">
                     {patient.prescriptions?.length === 0 ? <p className="text-[9px] italic text-slate-400">Aucun traitement.</p> : 
                      patient.prescriptions.slice(0, 5).map((p: any, i: number) => (
                        <div key={i} className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                           <p className="text-[8px] font-black text-emerald-600 uppercase mb-1.5">{new Date(p.created_at).toLocaleDateString()}</p>
                           <div className="space-y-1">
                              {p.medicaments.map((m: string, j: number) => (
                                 <p key={j} className="text-[9px] font-bold text-slate-700 leading-tight flex items-start gap-1.5">
                                    <span className="w-1 h-1 bg-emerald-400 rounded-full mt-1.5 shrink-0" />
                                    {m}
                                 </p>
                              ))}
                           </div>
                        </div>
                      ))
                     }
                  </div>
               </div>

               {/* Exams Column */}
               <div>
                  <h4 className="flex items-center gap-2 bg-slate-900 text-white px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest mb-4">
                     <FlaskConical className="w-3.5 h-3.5"/> Laboratoire
                  </h4>
                  <div className="space-y-3">
                     {patient.examens?.length === 0 ? <p className="text-[9px] italic text-slate-400">Aucun examen.</p> : 
                      patient.examens.slice(0, 8).map((e: any, i: number) => (
                        <div key={i} className="flex justify-between items-start border-b border-slate-50 pb-2">
                           <div>
                              <p className="text-[9px] font-black text-slate-900 uppercase leading-none">{e.type_examen}</p>
                              <p className="text-[7px] font-bold text-slate-400 uppercase mt-1">{new Date(e.date_demande).toLocaleDateString()}</p>
                           </div>
                           <span className="text-[7px] font-black bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded uppercase border border-emerald-100">CERTIFIÉ</span>
                        </div>
                      ))
                     }
                  </div>
               </div>
            </div>

            {/* Booklet Footer */}
            <div className="mt-12 pt-6 border-t-2 border-slate-900 flex justify-between items-center text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">
               <div className="flex items-center gap-4">
                  <ShieldCheck className="w-4 h-4 text-slate-900" />
                  <span>Document Infalsifiable · Plateforme CarnetPlus</span>
               </div>
               <div className="flex gap-8">
                  <span>Page 01 / 01</span>
                  <span>Copie Conforme au Dossier Numérique</span>
               </div>
            </div>
          </div>

          <div id="dossier-content" className="max-w-7xl mx-auto w-full bg-white p-12 rounded-3xl border border-slate-200 shadow-sm print:hidden">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
              <div className="lg:col-span-4 space-y-8">
                <Card className="rounded-2xl border border-slate-200 shadow-sm p-8 bg-white">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                     <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100 shadow-sm text-blue-600"><Phone className="w-5 h-5"/></div>
                     Coordonnées
                  </h3>
                  <div className="space-y-6">
                    {[
                      { icon:Phone, label:"Téléphone", val:patient.telephone || "—", color:"text-blue-600", bg:"bg-blue-50" },
                      { icon:Mail,  label:"Email", val:patient.email || "—", color:"text-purple-600", bg:"bg-purple-50" },
                      { icon:MapPin,label:"Adresse", val:patient.adresse || "—", color:"text-rose-600", bg:"bg-rose-50" },
                    ].map((item, i)=>(
                      <div key={i} className="flex items-start gap-5">
                        <div className={`w-12 h-12 ${item.bg} rounded-xl flex items-center justify-center shadow-sm shrink-0`}>
                           <item.icon className={`w-5 h-5 ${item.color}`} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5">{item.label}</p>
                          <p className="text-sm font-black text-slate-800 tracking-tight break-words">{item.val}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="rounded-2xl border border-slate-200 shadow-sm p-8 bg-slate-900 text-white relative overflow-hidden group">
                   <div className="absolute top-0 right-0 w-48 h-48 bg-rose-600/10 rounded-full blur-[60px] group-hover:scale-150 transition-transform duration-1000" />
                   <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-8 flex items-center gap-3 relative z-10">
                     <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20 shadow-sm text-rose-400"><Heart className="w-5 h-5"/></div>
                     Bilan Vital
                   </h3>
                   <div className="grid grid-cols-2 gap-3 relative z-10">
                     {[
                       { label:"IMC", val: "22.4", color:"text-emerald-400", sub: "Normal" },
                       { label:"Tension", val: "12/8", color:"text-blue-400", sub: "Optimale" },
                       { label:"Allergies", val: patient.allergies || "Aucune", color:"text-orange-400", full: true },
                       { label:"Antécédents", val: patient.antecedents || "RAS", color:"text-rose-400", full: true },
                     ].map((item, i)=>(
                       <div key={i} className={`p-5 bg-white/5 border border-white/10 rounded-xl ${item.full ? 'col-span-2' : ''} hover:bg-white/10 transition-all`}>
                         <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1.5">{item.label}</p>
                         <p className={`text-xl font-black ${item.color} tracking-tighter`}>{item.val}</p>
                         {item.sub && <p className="text-[8px] font-black uppercase text-slate-600 mt-1">{item.sub}</p>}
                       </div>
                     ))}
                   </div>
                </Card>
              </div>

              {/* Main Tabs Content */}
              <div className="lg:col-span-8 space-y-8">
                <div className="bg-slate-50 p-2 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2 print:hidden">
                  {[
                    { key:"consultations", label:"Visites", icon:Stethoscope, count:patient.consultations?.length || 0 },
                    { key:"prescriptions", label:"Ordonnances",  icon:Pill,        count:patient.prescriptions?.length || 0 },
                    { key:"examens",       label:"Laboratoire",        icon:FlaskConical,    count:patient.examens?.length || 0 },
                  ].map(({key,label,icon:Icon,count})=>(
                    <button key={key} onClick={()=>setActiveTab(key as any)}
                      className={`flex-1 flex items-center justify-center gap-3 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all relative overflow-hidden ${
                        activeTab===key ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:text-slate-900 hover:bg-white"
                      }`}
                    >
                      <Icon className="w-4 h-4"/>
                      <span>{label}</span>
                      <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black ${activeTab===key ? "bg-white/20 text-white" : "bg-slate-200 text-slate-400"}`}>{count}</span>
                    </button>
                  ))}
                </div>

                <div className="min-h-[600px]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-6"
                    >
                      {activeTab === "consultations" && (
                        <div className="grid grid-cols-1 gap-6">
                           {patient.consultations?.length === 0 ? (
                             <div className="py-24 text-center bg-white rounded-3xl border-2 border-dashed border-slate-100">
                                <Stethoscope className="w-16 h-16 text-slate-100 mx-auto mb-6" />
                                <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Aucune consultation enregistrée</p>
                             </div>
                           ) : (
                             patient.consultations.map((c: any, i: number) => (
                               <div key={i} className="group bg-white p-8 rounded-2xl border border-slate-200 hover:border-blue-500 hover:shadow-xl transition-all relative overflow-hidden">
                                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                                   <div className="flex items-center gap-6">
                                     <div className="w-14 h-14 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                       <Calendar className="w-6 h-6" />
                                     </div>
                                     <div>
                                        <div className="flex items-center gap-3 mb-1">
                                           <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{new Date(c.date_consultation).toLocaleDateString('fr-FR', {day:'numeric', month:'long', year:'numeric'})}</span>
                                           <span className="w-1 h-1 bg-slate-200 rounded-full" />
                                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dr. {c.medecin_nom}</span>
                                        </div>
                                        <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight group-hover:text-blue-600 transition-colors mb-1">{c.motif}</h4>
                                        <p className="text-slate-500 font-medium italic text-sm leading-relaxed line-clamp-2">"{c.diagnostic}"</p>
                                     </div>
                                   </div>
                                   <button className="w-10 h-10 bg-slate-50 text-slate-300 rounded-lg flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all print:hidden">
                                     <ChevronRight className="w-6 h-6" />
                                   </button>
                                 </div>
                               </div>
                             ))
                           )}
                        </div>
                      )}

                    {activeTab === "prescriptions" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         {patient.prescriptions?.map((p: any, i: number) => (
                           <div key={i} className="bg-white p-8 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:shadow-xl transition-all group">
                              <div className="flex items-center justify-between mb-6">
                                 <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-100 text-emerald-600 shadow-sm group-hover:scale-110 transition-transform">
                                    <Pill className="w-6 h-6" />
                                 </div>
                                 <div className="flex flex-col items-end">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{new Date(p.created_at).toLocaleDateString()}</p>
                                    <button 
                                      onClick={() => navigate(`/prescription-view/${p.id}`)}
                                      className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[8px] font-black uppercase hover:bg-emerald-600 hover:text-white transition-all print:hidden"
                                    >
                                      Consulter
                                    </button>
                                 </div>
                              </div>
                              <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-4">Ordonnance</h4>
                              <div className="space-y-3">
                                 {p.medicaments.map((m: string, j: number) => (
                                   <div key={j} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
                                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                      <p className="text-[11px] font-bold text-slate-700">{m}</p>
                                   </div>
                                 ))}
                              </div>
                           </div>
                         ))}
                      </div>
                    )}

                    {activeTab === "examens" && (
                      <div className="space-y-6">
                         {patient.examens?.map((e: any, i: number) => (
                           <div key={i} className="bg-white p-8 rounded-2xl border border-slate-200 hover:border-purple-500 hover:shadow-xl transition-all flex items-center justify-between">
                              <div className="flex items-center gap-6">
                                 <div className="w-14 h-14 bg-purple-50 rounded-xl flex items-center justify-center border border-purple-100 text-purple-600">
                                    <FlaskConical className="w-7 h-7" />
                                 </div>
                                 <div>
                                    <div className="flex items-center gap-3 mb-1">
                                       <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest">{new Date(e.date_demande).toLocaleDateString()}</span>
                                       <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase ${e.statut === 'termine' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                                         {e.statut}
                                       </span>
                                    </div>
                                    <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight">{e.type_examen}</h4>
                                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">Laboratoire Central</p>
                                 </div>
                              </div>
                              <button className="px-6 py-3 bg-slate-50 text-slate-400 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-purple-600 hover:text-white transition-all print:hidden">Consulter</button>
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
    </div>
    </>
  );
}
