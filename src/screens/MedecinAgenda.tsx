import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/Card";
import { dashboardAPI, rdvAPI, patientsAPI } from "../services/api";
import { Calendar, Clock, ChevronRight, Filter, ChevronLeft, Plus, User, MapPin, MoreHorizontal, CalendarDays, Activity, Download, X, Search, CheckCircle, AlertCircle } from "lucide-react";
import { formatDate } from "../utils/format";

const statutRdvStyle: Record<string,string> = {
  confirme:   "border-emerald-100 bg-emerald-50/30 text-emerald-700",
  planifie:   "border-blue-100 bg-blue-50/30 text-blue-700",
  en_attente: "border-orange-100 bg-orange-50/30 text-orange-700",
  annule:     "border-rose-100 bg-rose-50/30 text-rose-700",
};

const statutBulletStyle: Record<string,string> = {
  confirme:   "bg-emerald-500",
  planifie:   "bg-blue-500",
  en_attente: "bg-orange-500",
  annule:     "bg-rose-500",
};

export function MedecinAgenda() {
  const navigate = useNavigate();
  const [allRdvs, setAllRdvs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [searchPatient, setSearchPatient] = useState("");
  const [newRdv, setNewRdv] = useState({ 
    patient_id: "", 
    date_rdv: new Date().toISOString().split('T')[0], 
    heure_rdv: "09:00", 
    motif: "" 
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
    loadPatients();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, rdvData] = await Promise.all([
        dashboardAPI.stats(),
        rdvAPI.list()
      ]);
      setStats(statsData);
      setAllRdvs(rdvData || []);
    } catch (err) {
      console.error("Erreur chargement agenda:", err);
    } finally {
      setLoading(false);
    }
  };

  const rdvs = allRdvs.filter(r => {
    if (!r.date_rdv) return false;
    const d = new Date(r.date_rdv);
    return d.getDate() === selectedDate.getDate() && 
           d.getMonth() === selectedDate.getMonth() && 
           d.getFullYear() === selectedDate.getFullYear();
  });

  const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const loadPatients = async () => {
    try {
      const data = await patientsAPI.list();
      setPatients(data);
    } catch (err) { console.error(err); }
  };

  const handleCreateRdv = async () => {
    if (!newRdv.patient_id || !newRdv.date_rdv || !newRdv.heure_rdv) return;
    setSubmitting(true);
    try {
      await rdvAPI.create({ ...newRdv, statut: 'planifie' });
      setShowModal(false);
      loadData();
      setNewRdv({ patient_id: "", date_rdv: "2026-05-06", heure_rdv: "09:00", motif: "" });
      setSearchPatient("");
    } catch (err: any) {
      const errorMsg = err.message || "Erreur lors de la création du rendez-vous";
      alert(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredPatients = patients.filter(p => 
    `${p.nom} ${p.prenom}`.toLowerCase().includes(searchPatient.toLowerCase()) ||
    p.numero_dossier.toLowerCase().includes(searchPatient.toLowerCase())
  ).slice(0, 5);

  if (loading) {
    return (
      <div className="flex h-screen bg-slate-200 items-center justify-center p-8">
        <div className="bg-white p-14 rounded-[3rem] border-2 border-slate-200 shadow-2xl shadow-slate-200/50 text-center animate-scaleIn">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <p className="text-slate-900 font-black uppercase tracking-widest text-[10px]">Synchronisation de l'agenda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn bg-slate-50 min-h-screen w-full max-w-full overflow-x-hidden flex flex-col">
      {/* Modern FIXED Header - Premium White */}
      <div className="fixed top-0 left-0 lg:left-64 right-0 z-50 bg-white border-b-2 border-slate-200 shadow-md h-[90px] flex items-center shrink-0">
        <div className="px-6 md:px-10 flex flex-row justify-between items-center w-full gap-4">
          <div className="flex items-center gap-4">
            <div className="w-1.5 h-10 bg-blue-600 rounded-full shrink-0 shadow-sm shadow-blue-200" />
            <div>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight leading-none">Agenda Médical</h1>
              <p className="text-slate-500 text-[9px] md:text-[10px] font-bold uppercase tracking-widest mt-1">Planification des consultations</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-10 pb-10 flex-1 pt-[130px] md:pt-[140px]">

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 flex-1 min-h-0">
        <div className="lg:col-span-1 space-y-6 overflow-y-auto lg:pr-2">
           <Card className="rounded-[2rem] md:rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/40 p-5 md:p-8 bg-white">
              <div className="flex items-center justify-between mb-8">
                  <h3 className="font-black text-slate-900 text-lg uppercase tracking-tight">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
                  <div className="flex gap-2">
                     <button onClick={prevMonth} className="p-2.5 hover:bg-slate-50 rounded-xl transition-all border border-slate-100 shadow-sm text-slate-600 hover:text-blue-600"><ChevronLeft className="w-5 h-5" /></button>
                     <button onClick={nextMonth} className="p-2.5 hover:bg-slate-50 rounded-xl transition-all border border-slate-100 shadow-sm text-slate-600 hover:text-blue-600"><ChevronRight className="w-5 h-5" /></button>
                  </div>
              </div>
              <div className="grid grid-cols-7 gap-2 text-center mb-6">
                 {['L','M','M','J','V','S','D'].map(d => (
                    <span key={d} className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{d}</span>
                 ))}
              </div>
              <div className="grid grid-cols-7 gap-2 text-center">
                 {Array.from({length: startOffset}).map((_, i) => <div key={`empty-${i}`} />)}
                 {Array.from({length: daysInMonth}).map((_, i) => {
                    const day = i + 1;
                    const isSelected = selectedDate.getDate() === day && selectedDate.getMonth() === currentDate.getMonth() && selectedDate.getFullYear() === currentDate.getFullYear();
                    const hasRDV = allRdvs.some(r => {
                       if (!r.date_rdv) return false;
                       const d = new Date(r.date_rdv);
                       return d.getDate() === day && d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
                    });
                    return (
                       <button 
                          key={i} 
                          onClick={() => setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
                          className={`relative w-9 h-9 mx-auto flex items-center justify-center rounded-full text-xs font-black transition-all border-2 ${isSelected ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200/50 scale-110' : 'text-slate-600 bg-transparent border-transparent hover:bg-blue-50 hover:border-blue-100 hover:text-blue-600'}`}
                       >
                          {day}
                          {hasRDV && !isSelected && <span className="absolute bottom-1 w-1 h-1 bg-blue-500 rounded-full" />}
                       </button>
                    );
                 })}
              </div>
           </Card>

            <div className="space-y-4">
               <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-2 md:ml-4">Statistiques du jour</p>
               <div className="grid grid-cols-2 gap-3 md:gap-4">
                   <div className="bg-white p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border border-slate-200 shadow-lg shadow-slate-200/30 hover:border-blue-300 transition-all group flex flex-col justify-center items-center text-center">
                      <p className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mb-0.5 group-hover:text-blue-600 transition-colors">{rdvs.length}</p>
                      <p className="text-[8px] md:text-[9px] font-black text-slate-600 uppercase tracking-widest">Total</p>
                   </div>
                  <div className="bg-emerald-50 p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border border-emerald-100 shadow-lg shadow-emerald-200/30 hover:border-emerald-300 transition-all group flex flex-col justify-center items-center text-center">
                     <p className="text-2xl md:text-3xl font-black text-emerald-600 tracking-tight mb-0.5">{rdvs.filter(r => r.statut === 'confirme' || r.statut === 'termine').length}</p>
                     <p className="text-[8px] md:text-[9px] font-black text-emerald-500 uppercase tracking-widest">OK</p>
                  </div>
              </div>
            </div>
        </div>

        <div className="lg:col-span-3 flex flex-col min-h-0">
           <Card noPadding className="rounded-[2rem] md:rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden bg-white flex-1 flex flex-col">
                <div className="p-4 md:p-6 border-b border-slate-100 flex justify-between items-center bg-white/90 backdrop-blur-md sticky top-0 z-20">
                   <div className="flex items-center gap-3 md:gap-6 w-full md:w-auto overflow-x-auto scrollbar-hide">
                      <div className="flex items-center gap-2 shrink-0">
                         <button onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() - 1))} className="p-2 hover:bg-slate-50 rounded-lg transition-all border border-slate-100 shadow-sm text-slate-600 hover:text-blue-600 shrink-0"><ChevronLeft className="w-4 h-4 md:w-5 md:h-5" /></button>
                         <h2 className="text-sm md:text-xl font-black text-slate-900 tracking-tight uppercase mx-1 md:mx-2 whitespace-nowrap">{formatDate(selectedDate)}</h2>
                         <button onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() + 1))} className="p-2 hover:bg-slate-50 rounded-lg transition-all border border-slate-100 shadow-sm text-slate-600 hover:text-blue-600 shrink-0"><ChevronRight className="w-4 h-4 md:w-5 md:h-5" /></button>
                      </div>
                     <div className="hidden md:block h-6 w-px bg-slate-200" />
                     <p className="text-[8px] md:text-[9px] text-emerald-600 font-black uppercase tracking-widest flex items-center gap-2 bg-emerald-50 px-2 md:px-3 py-1 md:py-1.5 rounded-lg border border-emerald-100 whitespace-nowrap">
                        <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" /> Aujourd'hui
                     </p>
                  </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 relative">
                 <div className="absolute left-20 top-0 bottom-0 w-px bg-slate-100 z-0" />
                 
                 <div className="absolute left-0 right-0 top-[300px] border-t border-dashed border-blue-400/40 z-0 flex items-center">
                    <span className="bg-blue-600 text-white text-[8px] font-black px-2 py-1 rounded absolute left-8 shadow-md">10:30</span>
                 </div>

                 <div className="space-y-6 relative z-10">
                    {rdvs.length > 0 ? (
                       rdvs.map((rdv, index) => (
                           <div key={rdv.id} className="group flex gap-3 md:gap-8 items-start animate-fadeInUp" style={{animationDelay: `${index * 50}ms`}}>
                             <div className="flex flex-col items-center gap-1 md:gap-2 pt-4 w-14 md:w-20 flex-shrink-0 relative">
                                <span className="text-sm md:text-xl font-black text-slate-900 font-mono tracking-tighter leading-none group-hover:text-blue-600 transition-colors bg-white px-1 md:px-2">{rdv.heure_rdv?.substring(0,5)}</span>
                                <div className="text-[7px] md:text-[9px] font-black text-slate-600 uppercase tracking-widest bg-white px-1 md:px-2">{parseInt(rdv.heure_rdv?.split(':')[0] || '0') >= 12 ? 'PM' : 'AM'}</div>
                                <div className="absolute top-6 -right-1 w-2 md:w-2.5 h-2 md:h-2.5 rounded-full bg-slate-300 border-2 border-white group-hover:bg-blue-500 transition-colors" />
                             </div>
                             
                             <div onClick={() => navigate(`/medecin/consultation/${rdv.patient_id}`)} className={`flex-1 p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border transition-all cursor-pointer flex items-center justify-between hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-200/40 group/card ${index % 2 === 0 ? 'bg-white border-slate-200' : 'bg-blue-50/10 border-blue-100'} ${statutRdvStyle[rdv.statut] || ''}`}>
                                <div className="flex items-center gap-3 md:gap-6 min-w-0">
                                   <div className="relative shrink-0">
                                      <div className="w-10 md:w-14 h-10 md:h-14 bg-white rounded-lg md:rounded-[1.2rem] flex items-center justify-center shadow-md text-blue-600 font-black text-sm md:text-xl border border-slate-100 group-hover/card:bg-blue-600 group-hover/card:text-white transition-colors duration-300 uppercase">{rdv.patient_nom?.charAt(0)}</div>
                                      <div className={`absolute -bottom-1 -right-1 w-4 md:w-5 h-4 md:h-5 rounded-full border-2 border-white shadow-sm ${statutBulletStyle[rdv.statut] || 'bg-slate-300'}`} />
                                   </div>
                                    <div className="min-w-0">
                                       <p className="font-black text-slate-900 text-sm md:text-lg leading-none uppercase tracking-tight mb-1.5 md:mb-2 group-hover/card:text-blue-600 transition-colors truncate">{rdv.patient_nom}</p>
                                       <div className="flex flex-wrap items-center gap-2 md:gap-4">
                                          <span className="flex items-center gap-1.5 md:gap-2 text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest truncate"><Activity className="w-3 md:w-3.5 h-3 md:h-3.5 text-blue-500" /> {rdv.motif || 'Consultation'}</span>
                                       </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 md:gap-6">
                                   <div className={`px-3 md:px-4 py-1 md:py-1.5 rounded-full text-[7px] md:text-[9px] font-black uppercase tracking-widest hidden sm:block border ${statutRdvStyle[rdv.statut]} shadow-sm`}>{rdv.statut}</div>
                                   <button className="w-10 md:w-12 h-10 md:h-12 bg-white rounded-lg md:rounded-[1rem] text-slate-500 group-hover/card:bg-blue-600 group-hover/card:text-white transition-all shadow-md border border-slate-100 group-hover/card:border-blue-400 flex items-center justify-center shrink-0"><ChevronRight className="w-5 md:w-6 h-5 md:h-6" /></button>
                                </div>
                             </div>
                          </div>
                       ))
                    ) : (
                       <div className="py-24 text-center">
                          <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6"><Calendar className="w-10 h-10 text-slate-500" /></div>
                          <h3 className="text-slate-900 font-black text-lg uppercase tracking-tight">Agenda Libre</h3>
                          <p className="text-slate-600 text-xs font-bold uppercase tracking-widest mt-2">Aucun rendez-vous n'est programmé.</p>
                       </div>
                    )}
                 </div>
              </div>
           </Card>
        </div>
      </div>

      {/* RDV Modal removed as per user request (Doctor doesn't schedule) */}
      </div>
    </div>
  );
}

