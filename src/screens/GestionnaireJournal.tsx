import { useState, useEffect } from "react";
import { ShieldCheck, Clock, User, Search, Filter, CheckCircle, ShieldAlert, Lock, Zap } from "lucide-react";
import { logsAPI } from "../services/api";
import { useToast } from "../contexts/ToastContext";
import { formatDateTime } from "../utils/format";

export function GestionnaireJournal() {
  const [logs, setLogs]           = useState<any[]>([]);
  const { showToast }             = useToast();
  const [loading, setLoading]     = useState(true);
  const [searchTerm, setSearch]   = useState("");

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await logsAPI.list();
      setLogs(data);
    } catch (err) {
      showToast("Erreur lors du chargement du journal", "error");
    } finally {
      setLoading(false);
    }
  };

  const filtered = logs.filter((l) => {
    const s = searchTerm.toLowerCase();
    return (
      (l.details || "").toLowerCase().includes(s) ||
      (l.utilisateur || "").toLowerCase().includes(s) ||
      (l.action || "").toLowerCase().includes(s)
    );
  });

  return (
    <div className="animate-fadeIn bg-slate-50 min-h-screen w-full max-w-full overflow-x-hidden">
      {/* Modern FIXED Header - Premium White */}
      <div className="fixed top-0 left-0 lg:left-64 right-0 z-50 bg-white border-b-2 border-slate-200 shadow-md h-[90px] flex items-center shrink-0">
        <div className="px-6 md:px-10 flex flex-row justify-between items-center w-full gap-4">
          <div className="flex items-center gap-4">
            <div className="w-1.5 h-10 bg-slate-900 rounded-full shrink-0 shadow-sm shadow-slate-200" />
            <div>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight leading-none">Journal de Conformité</h1>
              <p className="text-slate-500 text-[9px] md:text-[10px] font-bold uppercase tracking-widest mt-1">Audit & Traçabilité des actions</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-3 px-5 py-2.5 bg-emerald-50 border-2 border-emerald-100 rounded-2xl shadow-sm">
             <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
             <span className="text-[9px] font-black text-emerald-700 uppercase tracking-widest">Actif - HDS</span>
          </div>
        </div>
      </div>

      <div className="px-6 md:px-10 pb-12 pt-[130px] md:pt-[140px] space-y-10">
        
        {/* Controls Area */}
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
            <div className="relative flex-1 max-w-md group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
              <input
                type="text"
                placeholder="Rechercher un événement..."
                value={searchTerm}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-white border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-blue-600 focus:bg-white transition-all font-bold text-slate-900 text-xs shadow-sm"
              />
            </div>
            <div className="flex items-center gap-3">
              <button className="flex-1 md:flex-none flex items-center justify-center gap-3 px-6 py-3.5 bg-white border-2 border-slate-100 text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:border-blue-600 transition-all shadow-sm active:scale-95">
                <Filter className="w-4 h-4" /> <span>Filtrer</span>
              </button>
              <button className="flex-1 md:flex-none flex items-center justify-center gap-3 px-6 py-3.5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg active:scale-95">
                <Clock className="w-4 h-4" /> <span>Exporter</span>
              </button>
            </div>
        </div>

        <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
          <div className="hidden lg:block">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-900 border-b border-slate-800">
                  <th className="px-8 py-4 text-left text-[10px] font-black text-white uppercase tracking-[0.2em]">Evenement</th>
                  <th className="px-8 py-4 text-left text-[10px] font-black text-white uppercase tracking-[0.2em]">Utilisateur / IP</th>
                  <th className="px-8 py-4 text-left text-[10px] font-black text-white uppercase tracking-[0.2em]">Horodatage</th>
                  <th className="px-8 py-4 text-left text-[10px] font-black text-white uppercase tracking-[0.2em]">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-20 text-center">
                      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                      <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Chargement...</p>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-20 text-center">
                      <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Aucun enregistrement</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/60 transition-all">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${log.statut === "ALERT" ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-blue-50 text-blue-600 border-blue-100"}`}>
                            {log.statut === "ALERT" ? <ShieldAlert className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
                          </div>
                          <div>
                            <p className="font-black text-slate-900 text-xs uppercase tracking-tight mb-0.5">{log.action}</p>
                            <p className="text-[11px] font-medium text-slate-700 max-w-sm">{log.details}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                            <User className="w-4 h-4 text-slate-600" />
                          </div>
                          <div>
                            <p className="text-xs font-black text-slate-900">{log.utilisateur}</p>
                            <p className="text-[9px] font-mono text-slate-600">{log.ip}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                          <span className="text-[11px] font-black text-slate-900">{formatDateTime(log.date)}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${log.statut === "SUCCESS" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600 border border-rose-100"}`}>
                          {log.statut === "SUCCESS" ? <CheckCircle className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                          {log.statut}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile View */}
          <div className="lg:hidden divide-y divide-slate-50">
            {loading ? (
              <div className="py-20 text-center">
                 <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                 <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Chargement...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-20 text-center">
                <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Aucun enregistrement</p>
              </div>
            ) : (
              filtered.map((log) => (
                <div key={log.id} className="p-5 active:bg-slate-50 transition-colors space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${log.statut === "ALERT" ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-blue-50 text-blue-600 border-blue-100"}`}>
                        {log.statut === "ALERT" ? <ShieldAlert className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-slate-900 text-xs uppercase tracking-tight truncate">{log.action}</p>
                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-1 mt-0.5">
                           <User className="w-3 h-3" /> {log.utilisateur}
                        </p>
                      </div>
                    </div>
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${log.statut === "SUCCESS" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600 border border-rose-100"}`}>
                      {log.statut}
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-[11px] font-medium text-slate-700 leading-relaxed">{log.details}</p>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-600" />
                      <span className="text-[10px] font-black text-slate-700">{formatDateTime(log.date)}</span>
                    </div>
                    <p className="text-[9px] font-mono text-slate-600">{log.ip}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

