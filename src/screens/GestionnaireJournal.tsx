import { useState, useEffect } from "react";
import { ShieldCheck, Clock, User, Search, Filter, CheckCircle, ShieldAlert, Lock, Zap } from "lucide-react";
import { logsAPI } from "../services/api";
import { useToast } from "../contexts/ToastContext";

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

  const filtered = logs.filter((l) =>
    l.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.utilisateur.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.action.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-full bg-slate-50/50">

      {/* HEADER STICKY */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="px-6 lg:px-10 pt-5 pb-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">

          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-slate-900 text-white rounded-[2rem] flex items-center justify-center shadow-xl">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-none mb-1">
                Journal de <span className="text-blue-600">Conformite</span>
              </h1>
              <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <Lock className="w-3 h-3 text-emerald-500" />
                Tracabilite integrale et immuable des flux
              </p>
            </div>
          </div>

          <div className="flex bg-slate-50 p-2 rounded-2xl border border-slate-100">
            <div className="px-4 py-2 border-r border-slate-200">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Standard</p>
              <p className="text-[10px] font-black text-slate-900">RGPD / AES-256</p>
            </div>
            <div className="px-4 py-2">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Statut</p>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <p className="text-[10px] font-black text-emerald-600 uppercase">Actif</p>
              </div>
            </div>
          </div>

        </div>

        <div className="px-6 lg:px-10 pb-4 flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher une action, utilisateur ou dossier..."
              value={searchTerm}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:bg-white focus:border-blue-500 font-bold text-slate-900 text-sm transition-all"
            />
          </div>
          <button className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center gap-2 shadow-lg active:scale-95">
            <Filter className="w-4 h-4" /> Filtrer
          </button>
        </div>
      </div>

      {/* CONTENU */}
      <div className="p-6 lg:p-10 space-y-8">

        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-900 uppercase tracking-widest">Evenement</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-900 uppercase tracking-widest">Utilisateur / IP</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-900 uppercase tracking-widest">Horodatage</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-900 uppercase tracking-widest">Statut</th>
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
                            <p className="text-[11px] font-medium text-slate-500 max-w-sm">{log.details}</p>
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
                            <p className="text-[9px] font-mono text-slate-400">{log.ip}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                          <span className="text-[11px] font-black text-slate-900">{log.date}</span>
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
        </div>
      </div>
    </div>
  );
}
