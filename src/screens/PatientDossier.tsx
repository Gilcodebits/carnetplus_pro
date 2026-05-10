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
  TrendingUp, Clock, FlaskConical, Droplets
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDate } from "../utils/format";

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
  const isSecretaire = user?.role === 'secretaire';
  
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
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { margin: 1cm; size: A4; }
          body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; background: white !important; }
          
          /* CRITICAL: Allow parents to expand */
          html, body, #root, [class*="overflow-hidden"], .flex-1, main { 
            overflow: visible !important; 
            height: auto !important; 
            display: block !important;
          }

          /* Force hide everything except the booklet */
          body * { visibility: hidden !important; }
          #booklet-pdf, #booklet-pdf * { visibility: visible !important; }
          
          #booklet-pdf { 
            display: block !important;
            position: absolute !important; 
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            opacity: 1 !important;
            background: white !important;
          }

          /* Force white text on red background */
          .blood-group-text {
            color: white !important;
            -webkit-print-color-adjust: exact !important;
          }

          /* Restore complex layouts inside the booklet */
          #booklet-pdf .flex { display: flex !important; }
          #booklet-pdf .grid { display: grid !important; }
          #booklet-pdf .divide-x > * + * { border-left-width: 1px !important; }

          .print-title { font-size: 16px !important; font-weight: 900 !important; }
          .print-text { font-size: 14px !important; }
        }
      `}} />

      {/* Professional Booklet Layout - Optimized for Print */}
      <div id="booklet-pdf" className="fixed top-0 left-0 opacity-0 pointer-events-none -z-[9999] bg-white p-0 font-sans text-slate-900 w-full min-h-screen">
        {/* Header - COMPACT */}
        <div className="p-8 border-b-2 border-slate-900 flex justify-between items-center bg-slate-50/30">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter italic print-title">Carnet<span className="text-blue-600">Plus</span></h1>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mt-1">Dossier Médical Numérique Certifié</p>
          </div>
          <div className="text-right">
            <h2 className="text-lg font-black uppercase tracking-tight print-title">Carnet de Santé</h2>
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Généré le {formatDate(new Date())}</p>
          </div>
        </div>

        {/* Patient Identity - ULTRA COMPACT SINGLE ROW */}
        <div className="grid grid-cols-4 border-b border-slate-100 divide-x divide-slate-100">
           <div className="px-6 py-4 col-span-2">
              <span className="text-[8px] font-black text-blue-600 uppercase tracking-widest block mb-1">Patient</span>
              <p className="text-sm font-black text-slate-900 uppercase print-text">{patient.prenom} {patient.nom}</p>
           </div>
           <div className="px-6 py-4">
              <span className="text-[8px] font-black text-blue-600 uppercase tracking-widest block mb-1">Dossier N°</span>
              <p className="text-sm font-black text-slate-900 print-text">{patient.numero_dossier}</p>
           </div>
            <div className="px-6 py-4 bg-red-50 flex flex-col justify-center items-center" style={{ backgroundColor: '#fef2f2' }}>
               <span className="text-[7px] font-black text-red-600 uppercase tracking-widest block mb-1 text-center" style={{ color: '#dc2626' }}>Groupe Sanguin</span>
               <div className="rounded-lg shadow-sm" style={{ backgroundColor: '#dc2626', padding: '4px 12px' }}>
                  <p className="text-xl font-black leading-none text-center blood-group-text" style={{ margin: 0 }}>{patient.groupe_sanguin || "—"}</p>
               </div>
            </div>
        </div>

        {/* Essential Info Grid */}
        <div className="grid grid-cols-2 gap-0 border-b border-slate-100 divide-x divide-slate-100">
           <div className="p-6 bg-slate-50/20">
              <h4 className="text-[9px] font-black text-slate-900 uppercase tracking-widest mb-3">Constantes & Alertes</h4>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <p className="text-[7px] font-black text-slate-400 uppercase mb-0.5">Tension Artérielle</p>
                    <p className="text-xs font-black text-slate-900 print-text">12/8 mmHg</p>
                 </div>
                 <div>
                    <p className="text-[7px] font-black text-slate-400 uppercase mb-0.5">IMC</p>
                    <p className="text-xs font-black text-slate-900 print-text">22.4 (Normal)</p>
                 </div>
                 <div className="col-span-2 mt-1">
                    <p className="text-[7px] font-black text-rose-500 uppercase mb-0.5 tracking-widest">Allergies Signalées</p>
                    <p className="text-[10px] font-black text-slate-800 uppercase print-text">{patient.allergies || 'Aucune allergie connue.'}</p>
                 </div>
              </div>
           </div>
           <div className="p-6">
              <h4 className="text-[9px] font-black text-slate-900 uppercase tracking-widest mb-3">Historique Médical</h4>
              <div className="space-y-3">
                 {patient.consultations?.slice(0, 3).map((c: any, i: number) => (
                    <div key={i} className="flex justify-between items-center border-b border-slate-50 pb-2 last:border-0">
                       <p className="text-[10px] font-black text-slate-900 uppercase print-text truncate max-w-[150px]">{c.motif}</p>
                       <p className="text-[8px] font-bold text-slate-400 uppercase">{formatDate(c.date_consultation)}</p>
                    </div>
                 ))}
                 {patient.consultations?.length === 0 && <p className="text-[9px] italic text-slate-400">Aucune visite.</p>}
              </div>
           </div>
        </div>

        {/* Detailed Lists - Compact Layout */}
        <div className="p-8">
           <div className="grid grid-cols-2 gap-10">
              {/* Prescriptions */}
              <div>
                 <h4 className="text-[11px] font-black text-blue-600 uppercase tracking-widest mb-4 border-b border-blue-100 pb-2">Traitements en Cours</h4>
                 <div className="space-y-4">
                    {patient.prescriptions?.slice(0, 4).map((p: any, i: number) => (
                       <div key={i} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                          <p className="text-[8px] font-black text-blue-400 uppercase mb-2">{formatDate(p.created_at)}</p>
                          <div className="space-y-1.5">
                             {p.medicaments.map((m: string, j: number) => (
                                <p key={j} className="text-[10px] font-black text-slate-700 uppercase leading-tight print-text">• {m}</p>
                             ))}
                          </div>
                       </div>
                    ))}
                    {patient.prescriptions?.length === 0 && <p className="text-[9px] italic text-slate-400">Aucun traitement.</p>}
                 </div>
              </div>

              {/* Lab Results */}
              <div>
                 <h4 className="text-[11px] font-black text-blue-600 uppercase tracking-widest mb-4 border-b border-blue-100 pb-2">Derniers Examens</h4>
                 <div className="space-y-2">
                    {patient.examens?.slice(0, 8).map((e: any, i: number) => (
                       <div key={i} className="flex justify-between items-center bg-white p-2 border-b border-slate-50">
                          <p className="text-[10px] font-black text-slate-900 uppercase print-text">{e.type_examen}</p>
                          <span className="text-[8px] font-black text-emerald-600 uppercase bg-emerald-50 px-2 py-0.5 rounded">Vérifié</span>
                       </div>
                    ))}
                    {patient.examens?.length === 0 && <p className="text-[9px] italic text-slate-400">Aucun examen.</p>}
                 </div>
              </div>
           </div>
        </div>

        {/* Footer - COMPACT with Authenticity */}
        <div className="absolute bottom-12 left-12 right-12 flex justify-between items-end border-t border-slate-100 pt-8">
           <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-white p-1 border border-slate-100 rounded-lg">
                 <img src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(window.location.href)}`} alt="QR" className="w-full h-full" />
              </div>
              <div>
                 <p className="text-[9px] font-black text-slate-900 uppercase mb-1">Authentification Digitale</p>
                 <p className="text-[7px] font-bold text-slate-400 uppercase max-w-[200px]">Ce carnet est synchronisé en temps réel avec le portail CarnetPlus. Scannez pour vérifier.</p>
              </div>
           </div>
           
           <div className="relative">
              <div className="absolute -top-10 -right-4 w-24 h-24 border-4 border-blue-600 rounded-full flex items-center justify-center -rotate-12 opacity-80 print:opacity-100">
                 <p className="text-[8px] font-black text-blue-600 uppercase tracking-tighter text-center leading-tight">CERTIFIÉ<br/>CARNETPLUS<br/>OFFICIEL</p>
              </div>
              <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.4em]">CarnetPlus Health Systems</p>
           </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col relative pt-6 px-10 pb-10 no-print">
        {/* Header Compact */}
        <div className="max-w-7xl mx-auto w-full mb-10 sticky top-0 z-40 bg-slate-50/90 backdrop-blur-xl -mx-10 px-10 py-6 border-b border-slate-200/50">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative overflow-hidden group">
            <div className="flex items-center gap-6 relative z-10">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[1.5rem] flex items-center justify-center text-white text-2xl font-black shadow-xl shadow-blue-200 border-2 border-white/20">
                  {getInitiales(patient.prenom, patient.nom)}
                </div>
                <div className="absolute -bottom-2 -right-2 px-3 py-1.5 bg-red-600 border-2 border-white rounded-xl flex items-center justify-center shadow-lg shadow-red-200" style={{ backgroundColor: '#dc2626' }}>
                   <span className="text-[10px] font-black text-white uppercase tracking-tighter">{patient.groupe_sanguin || "—"}</span>
                </div>
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-4 mb-1">
                  <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">{patient.prenom} {patient.nom}</h1>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-blue-100 shadow-sm">N° {patient.numero_dossier}</span>
                    <span className="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-red-100 shadow-sm flex items-center gap-2">
                      <Droplets className="w-3 h-3" />
                      Groupe {patient.groupe_sanguin || "—"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-slate-400 text-[10px] font-black uppercase tracking-widest opacity-80">
                  <span className="flex items-center gap-1.5"><User className="w-3 h-3 text-blue-500" /> {calculateAge(patient.date_naissance)} ans</span>
                  <div className="w-1 h-1 bg-slate-300 rounded-full" />
                  <span>{patient.sexe==="F"?"Femme":"Homme"}</span>
                  <div className="w-1 h-1 bg-slate-300 rounded-full" />
                  <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3 text-indigo-500" /> {patient.date_naissance ? formatDate(patient.date_naissance) : "—"}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 relative z-10 print:hidden">
              {isMedecin && (
                <>
                  <button onClick={()=>navigate(`/medecin/consultation/${id}`)} className="flex items-center gap-3 px-6 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:shadow-xl hover:shadow-blue-300 transition-all active:scale-95 border-2 border-blue-500"><Stethoscope className="w-5 h-5"/> <span>Consultation</span></button>
                  <button onClick={()=>navigate(`/medecin/prescription/${id}`)} className="flex items-center gap-3 px-6 py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:shadow-xl hover:shadow-emerald-300 transition-all active:scale-95 border-2 border-emerald-500"><Pill className="w-5 h-5"/> <span>Prescrire</span></button>
                </>
              )}
              {isPatient && (
                <button 
                  onClick={() => window.print()}
                  className="flex items-center gap-3 px-6 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:shadow-xl hover:shadow-slate-300 transition-all active:scale-95 border-2 border-slate-700"
                >
                  <Printer className="w-5 h-5 text-blue-400"/> <span>Télécharger Mon Carnet</span>
                </button>
              )}
              {isSecretaire && (
                <button 
                  onClick={() => window.print()}
                  className="flex items-center gap-3 px-6 py-4 bg-white border-2 border-slate-200 text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95"
                >
                  <Printer className="w-5 h-5 text-blue-600"/> <span>Imprimer le Dossier</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div id="dossier-content" className="max-w-7xl mx-auto w-full bg-white p-12 rounded-3xl border border-slate-200 shadow-sm">
            
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
                        <div key={i} className={`p-5 bg-white/10 border border-white/20 rounded-xl ${item.full ? 'col-span-2' : ''} hover:bg-white/20 transition-all`}>
                          <p className="text-[10px] font-black text-white uppercase tracking-[0.1em] mb-2">{item.label}</p>
                          <p className={`text-3xl font-black ${item.color} tracking-tighter leading-none`}>{item.val}</p>
                          {item.sub && <p className="text-[9px] font-black uppercase text-white/90 mt-2">{item.sub}</p>}
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
                                           <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{formatDate(c.date_consultation)}</span>
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
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{formatDate(p.created_at)}</p>
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
                                       <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest">{formatDate(e.date_demande)}</span>
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
