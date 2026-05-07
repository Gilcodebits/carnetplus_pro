import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/Card";
import { dashboardAPI, rdvAPI, patientsAPI } from "../services/api";
import { Calendar, Clock, ChevronRight, Filter, ChevronLeft, Plus, User, MapPin, MoreHorizontal, CalendarDays, Activity, Download, X, Search, CheckCircle, AlertCircle } from "lucide-react";

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
  const [rdvs, setRdvs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(6);
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
      const statsData = await dashboardAPI.stats();
      setRdvs(statsData.rdv_liste || []);
    } catch (err) {
      console.error("Erreur chargement agenda:", err);
    } finally {
      setLoading(false);
    }
  };

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
    <div className="p-10 animate-fadeIn bg-slate-200 min-h-screen flex flex-col relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-blue-200 border-2 border-white/20">
             <Calendar className="w-8 h-8 text-white"/>
           </div>
           <div>
             <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tight">Agenda Médical</h1>
             <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1 opacity-80">Gérez vos rendez-vous et votre temps de consultation.</p>
           </div>
        </div>
        <div className="flex gap-4">
            <button className="flex items-center gap-4 bg-white border-2 border-slate-200 text-slate-400 px-8 py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 transition-all shadow-sm active:scale-95">
                <CalendarDays className="w-6 h-6" />
                <span>Vue Mensuelle</span>
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 flex-1 min-h-0">
        <div className="lg:col-span-1 space-y-8 overflow-y-auto pr-2">
           <Card className="rounded-[3rem] border-2 border-slate-200 shadow-2xl shadow-slate-200/50 p-10 bg-white">
              <div className="flex items-center justify-between mb-10">
                  <h3 className="font-black text-slate-900 text-xl uppercase tracking-tight">Mai 2026</h3>
                  <div className="flex gap-3">
                     <button className="p-3 hover:bg-slate-50 rounded-xl transition-all border-2 border-slate-100 hover:border-slate-200 shadow-sm"><ChevronLeft className="w-5 h-5 text-slate-500" /></button>
                     <button className="p-3 hover:bg-slate-50 rounded-xl transition-all border-2 border-slate-100 hover:border-slate-200 shadow-sm"><ChevronRight className="w-5 h-5 text-slate-500" /></button>
                  </div>
              </div>
              <div className="grid grid-cols-7 gap-3 text-center mb-8">
                 {['L','M','M','J','V','S','D'].map(d => (
                    <span key={d} className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{d}</span>
                 ))}
              </div>
              <div className="grid grid-cols-7 gap-3 text-center">
                 {Array.from({length: 31}).map((_, i) => {
                    const day = i + 1;
                    const isSelected = selectedDay === day;
                    const hasRDV = [1, 6, 12, 15, 20].includes(day);
                    return (
                       <button 
                          key={i} 
                          onClick={() => setSelectedDay(day)}
                          className={`relative w-11 h-11 flex items-center justify-center rounded-2xl text-sm font-black transition-all group border-2 ${isSelected ? 'bg-blue-600 border-blue-500 text-white shadow-xl shadow-blue-200' : 'text-slate-600 bg-white border-transparent hover:bg-blue-50 hover:border-blue-100 hover:text-blue-600'}`}
                       >
                          {day}
                          {hasRDV && !isSelected && <span className="absolute bottom-1.5 w-1.5 h-1.5 bg-blue-600 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.4)]" />}
                       </button>
                    );
                 })}
              </div>
           </Card>

            <div className="space-y-5">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-4">Statistiques du jour</p>
               <div className="grid grid-cols-2 gap-6">
                   <div className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-200 shadow-2xl shadow-slate-200/50 hover:border-blue-300 transition-all group">
                      <p className="text-4xl font-black text-slate-900 tracking-tighter mb-2 group-hover:text-blue-600 transition-colors">{rdvs.length}</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total RDV</p>
                   </div>
                  <div className="bg-emerald-50 p-8 rounded-[2.5rem] border-2 border-emerald-100 shadow-2xl shadow-emerald-200/30 hover:border-emerald-300 transition-all group">
                     <p className="text-4xl font-black text-emerald-600 tracking-tighter mb-2">3</p>
                     <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Terminés</p>
                  </div>
              </div>
           </div>

           <Card className="rounded-[3rem] border-2 border-slate-200 shadow-2xl shadow-slate-200/50 p-10 bg-gradient-to-br from-blue-600 to-indigo-700 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10">
                 <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 bg-white/20 rounded-[1.5rem] flex items-center justify-center border-2 border-white/20 shadow-lg">
                       <Clock className="w-7 h-7 text-white" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-100">Statut Cabinet</span>
                 </div>
                 <p className="text-3xl font-black mb-2 uppercase tracking-tighter">08:00 - 18:30</p>
                 <p className="text-[10px] text-blue-100 font-black uppercase tracking-widest opacity-80 flex items-center gap-2">
                   <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" /> Ouvert • Prochain RDV 10:45
                 </p>
              </div>
           </Card>
        </div>

        <div className="lg:col-span-3 flex flex-col min-h-0">
           <Card noPadding className="rounded-[3rem] border-2 border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden bg-white flex-1 flex flex-col">
               <div className="p-8 border-b-2 border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                  <div className="flex items-center gap-8">
                     <div className="flex items-center gap-4">
                        <button className="p-3 hover:bg-slate-50 rounded-2xl transition-all border-2 border-slate-100 shadow-sm"><ChevronLeft className="w-5 h-5 text-slate-500" /></button>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase mx-2">{selectedDay} Mai 2026</h2>
                        <button className="p-3 hover:bg-slate-50 rounded-2xl transition-all border-2 border-slate-100 shadow-sm"><ChevronRight className="w-5 h-5 text-slate-500" /></button>
                     </div>
                    <div className="h-8 w-px bg-slate-100" />
                    <p className="text-[10px] text-emerald-500 font-black uppercase tracking-[0.2em] flex items-center gap-3 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">
                       <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" /> Aujourd'hui
                    </p>
                 </div>
                 <div className="flex items-center gap-4">
                    <button className="p-4 text-slate-400 hover:text-blue-600 transition-all border-2 border-slate-100 rounded-2xl shadow-sm hover:border-blue-200"><Download className="w-6 h-6" /></button>
                    <button className="p-4 text-slate-400 hover:text-blue-600 transition-all border-2 border-slate-100 rounded-2xl shadow-sm hover:border-blue-200"><MoreHorizontal className="w-6 h-6" /></button>
                 </div>
              </div>

              <div className="flex-1 overflow-y-auto p-10 relative">
                 <div className="absolute left-0 right-0 top-[400px] border-t-2 border-dashed border-blue-400/30 z-0 flex items-center">
                    <span className="bg-blue-600 text-white text-[9px] font-black px-2 py-1 rounded-full absolute left-10 shadow-lg">10:30 MAINTENANT</span>
                 </div>
                 <div className="space-y-10 relative z-10">
                    {rdvs.length > 0 ? (
                       rdvs.map((rdv, index) => (
                          <div key={rdv.id} className="group flex gap-12 items-start animate-fadeInUp" style={{animationDelay: `${index * 100}ms`}}>
                             <div className="flex flex-col items-center gap-4 pt-3 w-20 flex-shrink-0">
                                <span className="text-2xl font-black text-slate-900 font-mono tracking-tighter leading-none group-hover:text-blue-600 transition-colors">{rdv.heure_rdv?.substring(0,5)}</span>
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{parseInt(rdv.heure_rdv?.split(':')[0] || '0') >= 12 ? 'PM' : 'AM'}</div>
                             </div>
                             <div onClick={() => navigate(`/medecin/consultation/${rdv.patient_id}`)} className={`flex-1 p-10 rounded-[3rem] border-2 transition-all cursor-pointer flex items-center justify-between hover:scale-[1.01] hover:shadow-2xl hover:shadow-blue-200/50 shadow-sm group/card ${index % 2 === 0 ? 'bg-white border-slate-200' : 'bg-blue-50/20 border-blue-50'} ${statutRdvStyle[rdv.statut] || ''}`}>
                                <div className="flex items-center gap-8">
                                   <div className="relative">
                                      <div className="w-20 h-20 bg-white rounded-[1.5rem] flex items-center justify-center shadow-xl text-blue-600 font-black text-2xl border-2 border-slate-100 group-hover/card:bg-blue-600 group-hover/card:text-white transition-all duration-500 uppercase">{rdv.patient_nom?.charAt(0)}</div>
                                      <div className={`absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full border-4 border-white shadow-lg ${statutBulletStyle[rdv.statut] || 'bg-slate-300'}`} />
                                   </div>
                                    <div>
                                       <p className="font-black text-slate-900 text-2xl leading-none uppercase tracking-tight mb-3 group-hover/card:text-blue-600 transition-colors">{rdv.patient_nom}</p>
                                       <div className="flex flex-wrap items-center gap-6">
                                          <span className="flex items-center gap-3 text-[11px] font-black text-slate-500 uppercase tracking-widest"><Activity className="w-4 h-4 text-blue-500" /> {rdv.motif || 'Consultation générale'}</span>
                                          <span className="flex items-center gap-3 text-[11px] font-black text-slate-500 uppercase tracking-widest"><MapPin className="w-4 h-4 text-rose-500" /> Salle Clinique 04</span>
                                       </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-8">
                                   <div className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hidden xl:block border-2 ${statutRdvStyle[rdv.statut]} shadow-sm`}>{rdv.statut}</div>
                                   <button className="w-16 h-16 bg-white rounded-[1.5rem] text-slate-300 group-hover/card:bg-blue-600 group-hover/card:text-white transition-all shadow-xl border-2 border-slate-100 group-hover/card:border-blue-400 flex items-center justify-center active:scale-90"><ChevronRight className="w-8 h-8" /></button>
                                </div>
                             </div>
                          </div>
                       ))
                    ) : (
                       <div className="py-32 text-center">
                          <div className="w-24 h-24 bg-gray-50 rounded-[3rem] flex items-center justify-center mx-auto mb-8"><Calendar className="w-12 h-12 text-gray-200" /></div>
                          <h3 className="text-gray-900 font-black text-xl uppercase tracking-tight">Agenda Libre</h3>
                          <p className="text-gray-400 text-sm font-medium italic mt-2">Aucun rendez-vous n'est programmé pour cette journée.</p>
                       </div>
                    )}
                 </div>
              </div>
           </Card>
        </div>
      </div>

      {/* RDV Modal removed as per user request (Doctor doesn't schedule) */}
    </div>
  );
}
