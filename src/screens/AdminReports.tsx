import { Card } from "../components/Card";
import { Download, TrendingUp, Calendar } from "lucide-react";

export function AdminReports() {
  return (
    <div className="p-8 animate-fadeIn bg-slate-200 min-h-screen">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tight">Rapports & Statistiques</h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Analyse des performances et de l'utilisation globale.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card className="border-slate-200 shadow-2xl shadow-slate-200/50 p-10">
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-8">Activité Mensuelle</h2>
          <div className="h-64 flex items-end justify-between gap-3 px-4 pb-4 bg-slate-50 rounded-[2rem] border-2 border-slate-100 shadow-inner">
            {[45, 60, 40, 75, 50, 90, 65, 80, 55, 70, 85, 60].map((val, i) => (
              <div key={i} className="flex-1 bg-blue-600 rounded-t-xl transition-all hover:bg-blue-400 relative group cursor-help shadow-sm border-t-2 border-blue-400" style={{ height: `${val}%` }}>
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap shadow-xl z-10 border border-slate-700">
                  Mois {i+1} : {val}%
                </div>
              </div>
            ))}
          </div>
        </Card>
        
        <div className="grid grid-cols-1 gap-6">
          <Card className="border-slate-200 shadow-2xl shadow-slate-200/50 p-8 flex items-center justify-center">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-emerald-50 border-2 border-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm">
                <TrendingUp className="w-8 h-8" />
              </div>
              <div>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Croissance Annuelle</p>
                <p className="text-4xl font-black text-slate-900 tracking-tight">+24.8%</p>
              </div>
            </div>
          </Card>
          <Card className="border-slate-200 shadow-2xl shadow-slate-200/50 p-8 flex items-center justify-center">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-purple-50 border-2 border-purple-100 rounded-2xl flex items-center justify-center text-purple-600 shadow-sm">
                <Calendar className="w-8 h-8" />
              </div>
              <div>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Moyenne quotidienne</p>
                <p className="text-4xl font-black text-slate-900 tracking-tight">152 <span className="text-sm font-bold text-slate-400">PATIENTS</span></p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
