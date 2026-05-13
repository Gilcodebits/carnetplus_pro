import { useLocation, useNavigate } from "react-router-dom";
import { formatDate } from "../utils/format";

import { Card } from "../components/Card";
import { CheckCircle, Calendar, Clock, MapPin, User, ArrowRight, Share2, Printer, Sparkles, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export function ConfirmationRDV() {
  const navigate = useNavigate();
  const location = useLocation();
  const { date, time, medecin } = location.state || {};
  
  return (
    <div className="animate-fadeIn bg-slate-50 min-h-screen w-full max-w-full overflow-x-hidden">
      {/* Modern FIXED Header - Premium White */}
      <div className="fixed top-0 left-0 lg:left-64 right-0 z-50 bg-white border-b-2 border-slate-200 shadow-md h-[90px] flex items-center shrink-0">
        <div className="px-6 md:px-10 flex flex-row justify-between items-center w-full gap-4">
          <div className="flex items-center gap-4">
            <div className="w-1.5 h-10 bg-emerald-500 rounded-full shrink-0 shadow-sm shadow-emerald-200" />
            <div>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight leading-none">Confirmation</h1>
              <p className="text-slate-500 text-[9px] md:text-[10px] font-bold uppercase tracking-widest mt-1">Détails de votre rendez-vous</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 md:p-12 flex items-center justify-center bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent)] relative min-h-screen w-full max-w-full overflow-x-hidden pt-[130px] md:pt-[140px]">
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
           <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100/30 rounded-full blur-[120px]" />
           <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-100/30 rounded-full blur-[120px]" />
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="max-w-xl w-full relative z-10"
        >
          <Card className="border-2 border-slate-100 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] p-6 md:p-10 bg-white rounded-[2rem] md:rounded-[3rem] relative overflow-hidden group">
            {/* Inner Glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-50 rounded-full -mr-24 -mt-24 transition-all group-hover:scale-110 opacity-90" />
            
            <div className="text-center mb-10 relative z-10">
              <div className="relative w-20 h-20 mx-auto mb-8">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 12, stiffness: 200 }}
                  className="relative w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-200 border-4 border-white"
                >
                  <CheckCircle className="w-10 h-10 text-white"/>
                </motion.div>
                <motion.div 
                  animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0, 0.2] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-emerald-400 rounded-2xl -z-10"
                />
              </div>
              <div className="flex items-center justify-center gap-2 mb-3">
                 <Sparkles className="w-4 h-4 text-emerald-500" />
                 <span className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.4em]">Demande Transmise</span>
              </div>
              <h1 className="text-2xl md:text-4xl font-black text-slate-900 uppercase tracking-tighter mb-4 leading-tight">Demande de RDV <br/> Envoyée !</h1>
              <p className="text-slate-600 text-[10px] md:text-[11px] font-bold uppercase tracking-widest max-w-sm mx-auto opacity-80 leading-relaxed px-4 md:px-0">Votre demande est en cours de traitement. Vous recevrez une notification dès que le secrétariat l'aura validée.</p>
            </div>
 
            <div className="bg-slate-50/50 border-2 border-slate-100 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 mb-8 relative z-10 shadow-inner group/details">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {([
                  { icon: User, label: "Praticien", value: medecin || "Dr. Alain Rousseau", sub: "Médecine Générale", color: "text-blue-600", bg: "bg-blue-50" },
                  { icon: Calendar, label: "Date", value: date ? formatDate(date) : "10/05/2026", sub: "Confirmation en cours", color: "text-purple-600", bg: "bg-purple-50" },
                  { icon: Clock, label: "Horaire", value: time || "10:30", sub: "Matinée", color: "text-indigo-600", bg: "bg-indigo-50" },
                  { icon: MapPin, label: "Lieu", value: "Clinique CarnetPlus", sub: "Secteur A, Accueil", color: "text-rose-600", bg: "bg-rose-50" },
                ]).map(({ icon: Icon, label, value, sub, color, bg }, i) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + (i * 0.1) }}
                    className="flex items-start gap-4 group/item"
                  >
                    <div className={`w-12 h-12 ${bg} border-2 border-white rounded-xl flex items-center justify-center shadow-sm group-hover/item:scale-110 transition-all duration-500`}>
                      <Icon className={`w-6 h-6 ${color}`} />
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest mb-1">{label}</p>
                      <p className="font-black text-slate-900 text-sm uppercase tracking-tight leading-none mb-1 group-hover/item:text-blue-600 transition-colors">{value}</p>
                      <p className={`text-[8px] font-black uppercase tracking-widest opacity-90 ${color}`}>{sub}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
 
            <div className="flex justify-center relative z-10">
              <button 
                onClick={()=>navigate("/patient")} 
                className="w-full max-w-xs py-5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-slate-300 hover:bg-blue-600 hover:shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-3 group"
              >
                <span>RETOUR PORTAIL</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
              </button>
            </div>
 
            <div className="mt-10 flex items-center justify-center gap-2 text-slate-500 text-[8px] font-black uppercase tracking-[0.3em]">
               <ShieldCheck className="w-3 h-3" /> TRANSACTION SÉCURISÉE SSL 256-BIT
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

