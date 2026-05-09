import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/Card";
import { 
  utilisateursAPI 
} from "../services/api";
import { 
  ArrowLeft, Clock, Calendar, CheckCircle, 
  User, Info, ArrowRight, Zap, ShieldCheck, ChevronDown,
  Sparkles, Star, ChevronLeft, ChevronRight, MapPin
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function CalendrierRDV() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [motif, setMotif] = useState("Consultation générale");
  const [doctorsCount, setDoctorsCount] = useState<number>(0);

  useEffect(() => {
    utilisateursAPI.list('medecin')
      .then(doctors => setDoctorsCount(doctors.length))
      .catch(console.error);
  }, []);

  // Génération dynamique des 7 prochains jours
  const datesDisponibles = useMemo(() => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      const label = d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
      dates.push(label.charAt(0).toUpperCase() + label.slice(1).replace('.', ''));
    }
    return dates;
  }, []);

  const horairesMatin = ["08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30"];
  const horairesAprem = ["14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"];

  const handleConfirm = () => {
    if (selectedDate && selectedTime) navigate("/patient/confirmation-rdv");
  };

  return (
    <div className="flex flex-col relative bg-slate-50 min-h-screen">
        
        {/* Modern Glass Header */}
        <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-slate-200/60 px-8 py-5">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div>
                <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                  Prise de Rendez-vous
                </h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> 
                  Expertise Clinique Certifiée
                </p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-3">
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">
                 {doctorsCount > 0 ? `${doctorsCount} Médecins disponibles` : 'Chargement des médecins...'}
               </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto w-full p-8 lg:p-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Main Booking Content */}
          <div className="lg:col-span-8 space-y-10">
            
            {/* Step 1: Date Selection */}
            <section>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                   <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">1. Choisir une date</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Disponibilités en temps réel</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4">
                {datesDisponibles.map((date) => (
                  <motion.button
                    key={date}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { setSelectedDate(date); setSelectedTime(null); }}
                    className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center justify-center gap-1 ${
                      selectedDate === date 
                        ? "border-blue-600 bg-white shadow-2xl shadow-blue-100" 
                        : "border-transparent bg-white shadow-sm hover:border-slate-200"
                    }`}
                  >
                    <span className={`text-[9px] font-black uppercase tracking-widest ${selectedDate === date ? "text-blue-600" : "text-slate-400"}`}>{date.split(" ")[0]}</span>
                    <span className={`text-3xl font-black tracking-tighter ${selectedDate === date ? "text-blue-600" : "text-slate-900"}`}>{date.split(" ")[1]}</span>
                    <span className={`text-[9px] font-black uppercase tracking-widest ${selectedDate === date ? "text-blue-400" : "text-slate-300"}`}>{date.split(" ")[2]}</span>
                    {selectedDate === date && <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2" />}
                  </motion.button>
                ))}
              </div>
            </section>

            {/* Step 2: Time Selection */}
            <AnimatePresence mode="wait">
              {selectedDate && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-10"
                >
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg">
                       <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">2. Choisir l'horaire</h2>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Heure locale d'Afrique Centrale</p>
                    </div>
                  </div>

                  <div className="space-y-8 bg-white p-10 rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100">
                    <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                        <span className="w-8 h-px bg-slate-200" /> Matinée
                      </h4>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                        {horairesMatin.map((heure) => (
                          <button
                            key={heure}
                            onClick={() => setSelectedTime(heure)}
                            className={`py-4 rounded-2xl border-2 font-black text-xs uppercase tracking-widest transition-all ${
                              selectedTime === heure 
                                ? "border-blue-600 bg-blue-50 text-blue-600 shadow-md scale-105" 
                                : "border-slate-50 bg-slate-50 text-slate-500 hover:border-blue-200 hover:bg-white hover:text-blue-600"
                            }`}
                          >{heure}</button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                        <span className="w-8 h-px bg-slate-200" /> Après-midi
                      </h4>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                        {horairesAprem.map((heure) => (
                          <button
                            key={heure}
                            onClick={() => setSelectedTime(heure)}
                            className={`py-4 rounded-2xl border-2 font-black text-xs uppercase tracking-widest transition-all ${
                              selectedTime === heure 
                                ? "border-blue-600 bg-blue-50 text-blue-600 shadow-md scale-105" 
                                : "border-slate-50 bg-slate-50 text-slate-500 hover:border-blue-200 hover:bg-white hover:text-blue-600"
                            }`}
                          >{heure}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.section>
              )}
            </AnimatePresence>
          </div>

          {/* Right Sidebar: Recap Card */}
          <div className="lg:col-span-4">
            <div className="sticky top-28 space-y-6">
              <Card className="border border-slate-200 shadow-2xl shadow-slate-200/60 p-8 bg-white rounded-[2.5rem] overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 opacity-50" />
                
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-8 relative z-10 flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center"><CheckCircle className="w-5 h-5"/></div>
                  Confirmation
                </h3>
                
                <div className="space-y-5 relative z-10">
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-2"><User className="w-3 h-3 text-blue-500"/> Praticien</p>
                    <p className="font-black text-slate-900 text-sm uppercase tracking-tight">Dr. Alain Rousseau</p>
                    <p className="text-[9px] font-bold text-blue-600 uppercase tracking-widest mt-1">Médecine Générale</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-2"><Calendar className="w-3 h-3 text-emerald-500"/> Date</p>
                      <p className={`font-black text-sm uppercase tracking-tight ${selectedDate ? "text-slate-900" : "text-slate-300 italic"}`}>
                        {selectedDate || "---"}
                      </p>
                    </div>
                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-2"><Clock className="w-3 h-3 text-purple-500"/> Heure</p>
                      <p className={`font-black text-sm uppercase tracking-tight ${selectedTime ? "text-slate-900" : "text-slate-300 italic"}`}>
                        {selectedTime || "---"}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest block mb-3 ml-1">Motif de visite</label>
                    <div className="relative group">
                      <select
                        value={motif}
                        onChange={(e) => setMotif(e.target.value)}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-black text-slate-900 focus:bg-white focus:border-blue-600 transition-all outline-none appearance-none cursor-pointer uppercase tracking-tight"
                      >
                        <option>Consultation générale</option>
                        <option>Contrôle post-opératoire</option>
                        <option>Renouvellement ordonnance</option>
                        <option>Urgence (Douleur)</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none group-focus-within:rotate-180 transition-transform" />
                    </div>
                  </div>

                  <button
                    onClick={handleConfirm}
                    disabled={!selectedDate || !selectedTime}
                    className="w-full py-6 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-slate-300 hover:bg-blue-600 hover:shadow-blue-200 hover:-translate-y-1 transition-all disabled:opacity-20 disabled:pointer-events-none mt-4 flex items-center justify-center gap-3 group"
                  >
                    Confirmer <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </Card>

              <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-[2rem] flex items-start gap-4">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-emerald-600 shadow-sm shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <p className="text-[9px] font-bold text-emerald-700 uppercase tracking-widest leading-relaxed">
                  Votre rendez-vous sera synchronisé instantanément avec votre calendrier et votre assistant IA.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
  );
}
