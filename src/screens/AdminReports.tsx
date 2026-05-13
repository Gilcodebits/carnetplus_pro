import { Card } from "../components/Card";
import { Download, TrendingUp, Calendar } from "lucide-react";

export function AdminReports() {
  return (
    <div className="animate-fadeIn h-full flex flex-col bg-slate-50 w-full max-w-full overflow-x-hidden min-h-screen">
      {/* Modern FIXED Header - Premium White */}
      <div className="fixed top-0 left-0 lg:left-64 right-0 z-50 bg-white border-b-2 border-slate-200 shadow-md h-[90px] flex items-center shrink-0">
        <div className="px-6 md:px-10 flex flex-row justify-between items-center w-full gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="w-1.5 h-10 bg-blue-600 rounded-full shrink-0 shadow-sm shadow-blue-200" />
            <div>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight leading-none">Rapports & Statistiques</h1>
              <p className="text-slate-500 text-[9px] md:text-[10px] font-bold uppercase tracking-widest mt-1">Analyse des performances globales</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 md:px-10 pb-12 pt-[130px] md:pt-[140px]">

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-slate-200 shadow-2xl shadow-slate-200/50 p-6 md:p-10">
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-8">Activité Mensuelle</h2>
          <div className="h-48 md:h-64 flex items-end justify-between gap-1 md:gap-3 px-2 md:px-4 pb-4 bg-slate-50 rounded-[1.5rem] md:rounded-[2rem] border-2 border-slate-100 shadow-inner">
            {[45, 60, 40, 75, 50, 90, 65, 80, 55, 70, 85, 60].map((val, i) => (
              <div key={i} className="flex-1 bg-blue-600 rounded-t-lg md:rounded-t-xl transition-all hover:bg-blue-400 relative group cursor-help shadow-sm border-t-2 border-blue-400" style={{ height: `${val}%` }}>
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[8px] md:text-[9px] font-black uppercase tracking-widest px-2 md:px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap shadow-xl z-10 border border-slate-700">
                  M{i+1} : {val}%
                </div>
              </div>
            ))}
          </div>
        </Card>
        
        <div className="grid grid-cols-1 gap-6">
          <Card className="border-slate-200 shadow-2xl shadow-slate-200/50 p-6 md:p-8 flex items-center justify-center">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-emerald-50 border-2 border-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm">
                <TrendingUp className="w-8 h-8" />
              </div>
              <div>
                <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest mb-1">Croissance Annuelle</p>
                <p className="text-4xl font-black text-slate-900 tracking-tight">+24.8%</p>
              </div>
            </div>
          </Card>
          <Card className="border-slate-200 shadow-2xl shadow-slate-200/50 p-6 md:p-8 flex items-center justify-center">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-purple-50 border-2 border-purple-100 rounded-2xl flex items-center justify-center text-purple-600 shadow-sm">
                <Calendar className="w-8 h-8" />
              </div>
              <div>
                <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest mb-1">Moyenne quotidienne</p>
                <p className="text-4xl font-black text-slate-900 tracking-tight">152 <span className="text-sm font-bold text-slate-600">PATIENTS</span></p>
              </div>
            </div>
          </Card>
        </div>
      </div>
      </div>
    </div>
  );
}

