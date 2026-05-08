import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Card } from "../components/Card";
import { 
  ArrowLeft, ChevronLeft, ChevronRight, 
  Clock, Calendar, MapPin, CheckCircle, 
  User, Info, ArrowRight, Zap, ShieldCheck, ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function CalendrierRDV() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [motif, setMotif] = useState("Consultation générale");

  const datesDisponibles = ["Lun 5 Mai", "Mar 6 Mai", "Mer 7 Mai", "Jeu 8 Mai", "Ven 9 Mai"];
  const horairesMatin = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30"];
  const horairesAprem = ["14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"];

  const handleConfirm = () => {
    if (selectedDate && selectedTime) navigate("/patient/confirmation-rdv");
  };

  return (
    <div className="overflow-auto scrollbar-hide flex flex-col relative pt-6 px-10 pb-10">
        
        {/* Compact Header */}
        <div className="max-w-6xl mx-auto w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-10">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-blue-200 border-2 border-white/20">
              <Calendar className="w-8 h-8 text-white animate-pulse"/>
            </div>
            <div>
              <div className="flex items-center gap-3">
                 <span className="w-6 h-1.5 bg-blue-500 rounded-full" />
                 <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tight">Choisir un créneau</h1>
              </div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1 opacity-80">Dr. Alain Rousseau — <span className="text-blue-600">Médecine Générale</span></p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="px-5 py-2.5 bg-blue-50 border-2 border-blue-100 rounded-2xl flex items-center gap-3 shadow-sm">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span className="text-[9px] font-black text-blue-700 uppercase tracking-widest">Créneaux Temps Réel</span>
             </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Calendar and Time Selection */}
          <div className="lg:col-span-8 space-y-8">
            <Card className="border-2 border-slate-200 shadow-2xl shadow-slate-200/50 p-12 bg-white rounded-[4rem] relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-32 -mt-32 transition-all group-hover:scale-110 opacity-50 pointer-events-none" />
              
              <div className="flex items-center justify-between mb-12 relative z-10">
                <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Mai 2026</h2>
                <div className="flex gap-4">
                  <button className="p-4 bg-slate-50 hover:bg-white border-2 border-slate-100 hover:border-blue-200 rounded-2xl transition-all shadow-sm active:scale-95"><ChevronLeft className="w-6 h-6 text-slate-400 hover:text-blue-600" /></button>
                  <button className="p-4 bg-slate-50 hover:bg-white border-2 border-slate-100 hover:border-blue-200 rounded-2xl transition-all shadow-sm active:scale-95"><ChevronRight className="w-6 h-6 text-slate-400 hover:text-blue-600" /></button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-12 relative z-10">
                {datesDisponibles.map((date) => (
                  <button
                    key={date}
                    onClick={() => { setSelectedDate(date); setSelectedTime(null); }}
                    className={`p-8 rounded-[2.5rem] border-2 transition-all group hover:scale-[1.02] flex flex-col items-center justify-center gap-2 ${
                      selectedDate === date 
                        ? "border-blue-600 bg-blue-600 text-white shadow-2xl shadow-blue-300" 
                        : "border-slate-50 bg-slate-50/50 hover:border-blue-200 hover:bg-white"
                    }`}
                  >
                    <p className={`text-[11px] font-black uppercase tracking-[0.2em] ${selectedDate === date ? "text-blue-100" : "text-slate-400"}`}>{date.split(" ")[0]}</p>
                    <p className={`text-4xl font-black tracking-tighter ${selectedDate === date ? "text-white" : "text-slate-900"}`}>{date.split(" ")[1]}</p>
                    <p className={`text-[11px] font-black uppercase tracking-[0.2em] ${selectedDate === date ? "text-blue-100" : "text-slate-400"}`}>{date.split(" ")[2]}</p>
                    {selectedDate === date && <motion.div layoutId="dot" className="w-2 h-2 bg-white rounded-full mt-2 shadow-lg" />}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {selectedDate && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-12 relative z-10 pt-10 border-t-2 border-slate-50"
                  >
                    <div>
                      <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100 shadow-sm text-blue-600">
                          <Clock className="w-7 h-7" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Matinée <span className="text-[10px] text-slate-400 ml-4 font-black uppercase tracking-widest">Avant midi</span></h3>
                      </div>
                      <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                        {horairesMatin.map((heure) => (
                          <button
                            key={heure}
                            onClick={() => setSelectedTime(heure)}
                            className={`p-5 rounded-[1.8rem] border-2 font-black text-sm uppercase tracking-widest transition-all ${
                              selectedTime === heure 
                                ? "border-blue-600 bg-blue-600 text-white shadow-xl shadow-blue-200 scale-105" 
                                : "border-slate-100 bg-slate-50/50 text-slate-500 hover:border-blue-300 hover:bg-white hover:text-blue-600"
                            }`}
                          >{heure}</button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100 shadow-sm text-indigo-600">
                          <Zap className="w-7 h-7" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Après-midi <span className="text-[10px] text-slate-400 ml-4 font-black uppercase tracking-widest">Dès 14h00</span></h3>
                      </div>
                      <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                        {horairesAprem.map((heure) => (
                          <button
                            key={heure}
                            onClick={() => setSelectedTime(heure)}
                            className={`p-5 rounded-[1.8rem] border-2 font-black text-sm uppercase tracking-widest transition-all ${
                              selectedTime === heure 
                                ? "border-indigo-600 bg-indigo-600 text-white shadow-xl shadow-indigo-200 scale-105" 
                                : "border-slate-100 bg-slate-50/50 text-slate-500 hover:border-indigo-300 hover:bg-white hover:text-indigo-600"
                            }`}
                          >{heure}</button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </div>

          {/* Right Sidebar: Recap */}
          <div className="lg:col-span-4 space-y-8">
            <Card className="border-2 border-slate-200 shadow-2xl shadow-slate-200/50 p-10 bg-white rounded-[3.5rem] sticky top-10">
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-10 flex items-center gap-4">
                 <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100 shadow-sm text-blue-600"><CheckCircle className="w-6 h-6"/></div>
                 Récapitulatif
              </h3>
              
              <div className="space-y-6">
                <div className="p-6 bg-slate-50 border-2 border-slate-50 rounded-[2rem] shadow-inner group">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><User className="w-3 h-3"/> Praticien</p>
                  <p className="font-black text-slate-900 text-lg uppercase tracking-tight group-hover:text-blue-600 transition-colors">Dr. Alain Rousseau</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Médecine Générale</p>
                </div>

                <div className="p-6 bg-slate-50 border-2 border-slate-50 rounded-[2rem] shadow-inner">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Calendar className="w-3 h-3"/> Date & Heure</p>
                  <p className={`font-black text-lg uppercase tracking-tight ${selectedDate ? "text-blue-600" : "text-slate-300 italic"}`}>
                    {selectedDate || "Non choisie"}
                  </p>
                  <p className={`font-black text-2xl tracking-tighter mt-1 ${selectedTime ? "text-indigo-600" : "text-slate-200 italic"}`}>
                    {selectedTime || "00:00"}
                  </p>
                </div>

                <div className="pt-6">
                  <label className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] block mb-4 ml-1">Motif de consultation</label>
                  <div className="relative group">
                    <select
                      value={motif}
                      onChange={(e) => setMotif(e.target.value)}
                      className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-black text-slate-900 focus:bg-white focus:border-blue-500 transition-all outline-none appearance-none cursor-pointer shadow-inner uppercase tracking-tight"
                    >
                      <option>Consultation générale</option>
                      <option>Contrôle post-opératoire</option>
                      <option>Renouvellement ordonnance</option>
                      <option>Urgence (Douleur)</option>
                    </select>
                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none group-focus-within:rotate-180 transition-transform" />
                  </div>
                </div>

                <button
                  onClick={handleConfirm}
                  disabled={!selectedDate || !selectedTime}
                  className="w-full py-7 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white rounded-[2.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/40 hover:shadow-blue-400/60 hover:-translate-y-1 transition-all border-2 border-blue-400 disabled:opacity-30 disabled:pointer-events-none mt-8 flex items-center justify-center gap-4 group"
                >
                  <span>Confirmer le RDV</span>
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                </button>
              </div>
            </Card>

            <div className="p-8 bg-blue-50/50 border-2 border-blue-100 border-dashed rounded-[3rem] flex items-center gap-6 group">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border-2 border-blue-200 shadow-sm text-blue-500 group-hover:scale-110 transition-transform">
                <Info className="w-6 h-6" />
              </div>
              <p className="text-[10px] font-bold text-blue-700 uppercase tracking-widest leading-relaxed">
                Une confirmation vous sera envoyée par email et SMS dès validation.
              </p>
            </div>
          </div>

        </div>
      </div>
  );
}
