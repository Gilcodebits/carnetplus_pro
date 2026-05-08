import { useNavigate } from "react-router-dom";

import { Card } from "../components/Card";
import { CheckCircle, Calendar, Clock, MapPin, User, ArrowRight, Share2, Printer, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export function ConfirmationRDV() {
  const navigate = useNavigate();
  return (
    <div className="flex-1 overflow-auto p-12 flex items-center justify-center bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent)] relative min-h-[calc(100vh-80px)]">
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
           <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100/30 rounded-full blur-[120px]" />
           <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-100/30 rounded-full blur-[120px]" />
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="max-w-3xl w-full relative z-10"
        >
          <Card className="border-2 border-slate-100 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] p-16 bg-white rounded-[5rem] relative overflow-hidden group">
            {/* Inner Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full -mr-32 -mt-32 transition-all group-hover:scale-110 opacity-60" />
            
            <div className="text-center mb-16 relative z-10">
              <div className="relative w-32 h-32 mx-auto mb-10">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 12, stiffness: 200 }}
                  className="relative w-32 h-32 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[3rem] flex items-center justify-center shadow-2xl shadow-emerald-200 border-4 border-white"
                >
                  <CheckCircle className="w-16 h-16 text-white"/>
                </motion.div>
                <motion.div 
                  animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0, 0.2] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-emerald-400 rounded-[3rem] -z-10"
                />
              </div>
              <div className="flex items-center justify-center gap-3 mb-4">
                 <Sparkles className="w-5 h-5 text-emerald-500" />
                 <span className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.4em]">Succès de Réservation</span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-black text-slate-900 uppercase tracking-tighter mb-4">Rendez-vous <br/> Confirmé !</h1>
              <p className="text-slate-400 text-sm font-bold uppercase tracking-widest max-w-md mx-auto opacity-80 leading-relaxed">Votre consultation a été synchronisée avec le planning du praticien et votre carnet numérique.</p>
            </div>

            <div className="bg-slate-50/50 border-2 border-slate-100 rounded-[4rem] p-12 mb-12 relative z-10 shadow-inner group/details">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {[
                  { icon:User, label:"Praticien", value:"Dr. Alain Rousseau", sub:"Médecine Générale", color: "text-blue-600", bg: "bg-blue-50" },
                  { icon:Calendar, label:"Date", value:"Lundi 5 Mai 2026", sub: "Semaine Prochaine", color: "text-purple-600", bg: "bg-purple-50" },
                  { icon:Clock, label:"Horaire", value:"10:30", sub: "Matinée", color: "text-indigo-600", bg: "bg-indigo-50" },
                  { icon:MapPin, label:"Lieu", value:"Hôpital Central", sub: "Secteur A, Bureau 204", color: "text-rose-600", bg: "bg-rose-50" },
                ].map(({icon:Icon,label,value,sub,color,bg},i)=>(
                  <motion.div 
                    key={label} 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + (i * 0.1) }}
                    className="flex items-start gap-6 group/item"
                  >
                    <div className={`w-16 h-16 ${bg} border-2 border-white rounded-[1.8rem] flex items-center justify-center shadow-sm group-hover/item:scale-110 transition-all duration-500`}>
                      <Icon className={`w-8 h-8 ${color}`}/>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1.5">{label}</p>
                      <p className="font-black text-slate-900 text-lg uppercase tracking-tight leading-none mb-1 group-hover/item:text-blue-600 transition-colors">{value}</p>
                      <p className={`text-[9px] font-black uppercase tracking-widest opacity-60 ${color}`}>{sub}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 relative z-10">
              <button 
                onClick={()=>navigate("/patient")} 
                className="flex-1 py-7 bg-slate-900 text-white rounded-[2.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-slate-300 hover:bg-blue-600 hover:shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-4 group"
              >
                <span>RETOUR PORTAIL</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </button>
              <div className="flex gap-4">
                 <button className="w-20 h-20 bg-white border-2 border-slate-100 text-slate-400 rounded-[2rem] flex items-center justify-center hover:bg-slate-50 hover:text-blue-600 transition-all shadow-sm active:scale-95">
                    <Printer className="w-7 h-7" />
                 </button>
                 <button className="w-20 h-20 bg-white border-2 border-slate-100 text-slate-400 rounded-[2rem] flex items-center justify-center hover:bg-slate-50 hover:text-indigo-600 transition-all shadow-sm active:scale-95">
                    <Share2 className="w-7 h-7" />
                 </button>
              </div>
            </div>

            <div className="mt-12 flex items-center justify-center gap-3 text-slate-300 text-[10px] font-black uppercase tracking-[0.3em]">
               <ShieldCheck className="w-4 h-4" /> TRANSACTION SÉCURISÉE SSL 256-BIT
            </div>
          </Card>
        </motion.div>
      </div>
  );
}
