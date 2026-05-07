import { Card } from "../components/Card";
import { Shield, Globe, Save } from "lucide-react";

export function AdminSettings() {
  return (
    <div className="p-8 animate-fadeIn bg-slate-200 min-h-screen">
      <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tight mb-10">Paramètres Système</h1>

      <div className="max-w-4xl space-y-6">
        <Card className="border-slate-200 shadow-2xl shadow-slate-200/50 p-10">
          <div className="flex items-center gap-4 mb-8 pb-6 border-b-2 border-slate-100">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100">
               <Globe className="w-6 h-6 text-blue-600" />
            </div>
            <div>
               <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Général</h2>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Identité de la plateforme</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nom de la plateforme</label>
              <input type="text" defaultValue="CarnetPlus" className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:bg-slate-50 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold text-slate-900" />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Langue par défaut</label>
              <select className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:bg-slate-50 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold text-slate-900 appearance-none cursor-pointer">
                <option>Français (FR)</option>
                <option>English (US)</option>
              </select>
            </div>
          </div>
        </Card>

        <Card className="border-slate-200 shadow-2xl shadow-slate-200/50 p-10">
          <div className="flex items-center gap-4 mb-8 pb-6 border-b-2 border-slate-100">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100">
               <Shield className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
               <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Sécurité & Accès</h2>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Protection des données</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] shadow-sm hover:border-blue-200 transition-all group">
              <div>
                <p className="font-black text-slate-900 text-sm uppercase tracking-tight">Authentification à deux facteurs</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1 opacity-80">Renforcez la sécurité des comptes administrateurs.</p>
              </div>
              <div className="w-14 h-7 bg-blue-600 rounded-full relative cursor-pointer border-2 border-blue-400 shadow-lg shadow-blue-200 transition-all">
                <div className="absolute right-1 top-0.5 w-5 h-5 bg-white rounded-full shadow-md" />
              </div>
            </div>
            <div className="flex items-center justify-between p-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] shadow-sm hover:border-slate-300 transition-all">
              <div>
                <p className="font-black text-slate-900 text-sm uppercase tracking-tight">Expiration des sessions</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1 opacity-80">Déconnexion après 30 minutes d'inactivité.</p>
              </div>
              <div className="w-14 h-7 bg-slate-200 rounded-full relative cursor-pointer border-2 border-slate-300 transition-all">
                <div className="absolute left-1 top-0.5 w-5 h-5 bg-white rounded-full shadow-md" />
              </div>
            </div>
          </div>
        </Card>

        <div className="flex justify-end pt-8">
          <button className="flex items-center gap-4 bg-blue-600 text-white px-10 py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-blue-700 hover:shadow-2xl hover:shadow-blue-300 transition-all shadow-xl shadow-blue-200 active:scale-95 border-2 border-blue-500">
            <Save className="w-5 h-5" />
            <span>Enregistrer les modifications</span>
          </button>
        </div>
      </div>
    </div>
  );
}
