import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, Mail, Lock, Heart, Stethoscope, Pill, Shield, FlaskConical } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const DEMO_ACCOUNTS = [
  { role:"medecin",       email:"medecin@carnetplus.com",      label:"Dr. Alain Rousseau",  icon:"🩺", color:"from-blue-500 to-blue-700" },
  { role:"patient",       email:"patient@carnetplus.com",      label:"Marie Dubois",         icon:"👤", color:"from-emerald-500 to-emerald-700" },
  { role:"admin",         email:"admin@carnetplus.com",         label:"Admin Système",        icon:"⚙️", color:"from-slate-500 to-slate-700" },
  { role:"secretaire",    email:"secretaire@carnetplus.com",   label:"Carine Adjovi",        icon:"📋", color:"from-violet-500 to-violet-700" },
  { role:"labo",          email:"labo@carnetplus.com",          label:"Serge Hounsa",         icon:"🔬", color:"from-teal-500 to-teal-700" },
  { role:"gestionnaire",  email:"gestionnaire@carnetplus.com", label:"Lionel Kpossou",       icon:"🔄", color:"from-orange-500 to-orange-700" },
];

function EcgLine() {
  return (
    <svg viewBox="0 0 500 80" className="w-full opacity-30" xmlns="http://www.w3.org/2000/svg">
      <polyline
        points="0,40 60,40 80,40 95,10 110,65 125,5 140,55 155,40 220,40 240,30 255,50 270,40 500,40"
        stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"
        style={{strokeDasharray:800,strokeDashoffset:800,animation:"drawEcg 3s ease forwards 0.5s"}}
      />
      <style>{`@keyframes drawEcg{to{stroke-dashoffset:0}}`}</style>
    </svg>
  );
}

export function Login() {
  const navigate = useNavigate();
  const { login, error } = useAuth();
  const [email, setEmail]     = useState("medecin@carnetplus.com");
  const [password, setPassword] = useState("password123");
  const [loading, setLoading]   = useState(false);
  const [localError, setLocalError] = useState("");
  const [selectedDemo, setSelectedDemo] = useState(0);

  const ROUTES: Record<string,string> = {
    admin:"admin", medecin:"medecin", secretaire:"secretaire",
    labo:"labo", patient:"patient", gestionnaire:"gestionnaire"
  };

  const handleLogin = async () => {
    if (!email || !password) { setLocalError("Email et mot de passe requis"); return; }
    setLocalError(""); setLoading(true);
    try {
      await login(email, password);
      // navigate handled by App router after user is set
    } catch(e:any) {
      setLocalError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSelect = (idx: number) => {
    setSelectedDemo(idx);
    setEmail(DEMO_ACCOUNTS[idx].email);
    setPassword("password123");
    setLocalError("");
  };

  const handleDemoLogin = async () => {
    setLocalError(""); setLoading(true);
    try {
      await login(DEMO_ACCOUNTS[selectedDemo].email, "password123");
    } catch(e:any) {
      setLocalError("Erreur : Impossible de se connecter au serveur. Vérifiez que votre backend PHP est lancé.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left Panel ── */}
      <div className="hidden lg:flex flex-col w-[55%] bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 relative overflow-hidden">
        {/* Blobs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2"/>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-400/10 rounded-full translate-x-1/2 translate-y-1/2"/>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-400/10 rounded-full -translate-x-1/2 -translate-y-1/2 animate-float"/>

        {/* Top logo */}
        <div className="p-8 flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <Activity className="w-6 h-6 text-white"/>
          </div>
          <span className="text-white font-bold text-xl tracking-widest">CARNETPLUS</span>
        </div>

        {/* Main illustration */}
        <div className="flex-1 flex flex-col items-center justify-center px-16 relative z-10">
          {/* Medical illustration SVG */}
          <svg viewBox="0 0 420 320" fill="none" className="w-full max-w-lg animate-fadeIn delay-300" xmlns="http://www.w3.org/2000/svg">
            {/* Hospital building */}
            <rect x="80" y="120" width="260" height="170" rx="8" fill="white" fillOpacity="0.1" stroke="white" strokeWidth="1.5" strokeOpacity="0.4"/>
            <rect x="120" y="100" width="180" height="190" rx="8" fill="white" fillOpacity="0.15" stroke="white" strokeWidth="1.5" strokeOpacity="0.5"/>
            {/* Cross on building */}
            <rect x="192" y="118" width="36" height="12" rx="6" fill="white" fillOpacity="0.8"/>
            <rect x="202" y="108" width="16" height="32" rx="6" fill="white" fillOpacity="0.8"/>
            {/* Windows */}
            {[140,185,230,275].map((x,i)=>(
              <rect key={i} x={x} y="160" width="28" height="28" rx="4" fill="white" fillOpacity={i%2===0?0.4:0.25}/>
            ))}
            {[140,185,230,275].map((x,i)=>(
              <rect key={i+4} x={x} y="205" width="28" height="28" rx="4" fill="white" fillOpacity={i%2===0?0.25:0.4}/>
            ))}
            {/* Door */}
            <rect x="186" y="250" width="48" height="40" rx="4" fill="white" fillOpacity="0.3"/>
            <circle cx="228" cy="270" r="3" fill="white" fillOpacity="0.8"/>

            {/* Doctor figure */}
            <g className="animate-float" style={{animationDelay:"0s"}}>
              <circle cx="330" cy="185" r="22" fill="white" fillOpacity="0.2"/>
              <circle cx="330" cy="178" r="14" fill="white" fillOpacity="0.5"/>
              <rect x="314" y="190" width="32" height="40" rx="8" fill="white" fillOpacity="0.35"/>
              <rect x="319" y="198" width="22" height="2.5" rx="1" fill="white" fillOpacity="0.6"/>
              <path d="M322 215 Q316 224 320 230" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
              <circle cx="320" cy="231" r="4" fill="white" fillOpacity="0.5"/>
            </g>

            {/* Floating stats cards */}
            <g className="animate-float" style={{animationDelay:"0.7s"}}>
              <rect x="20" y="140" width="80" height="55" rx="8" fill="white" fillOpacity="0.18" stroke="white" strokeWidth="1" strokeOpacity="0.4"/>
              <text x="32" y="160" fill="white" fontSize="8" fontFamily="sans-serif" fillOpacity="0.7">Patients</text>
              <text x="32" y="176" fill="white" fontSize="18" fontWeight="bold" fontFamily="sans-serif">1,247</text>
              <text x="32" y="188" fill="#86efac" fontSize="8" fontFamily="sans-serif">+87 ce mois</text>
            </g>
            <g className="animate-float" style={{animationDelay:"1.3s"}}>
              <rect x="20" y="215" width="80" height="55" rx="8" fill="white" fillOpacity="0.18" stroke="white" strokeWidth="1" strokeOpacity="0.4"/>
              <text x="32" y="235" fill="white" fontSize="8" fontFamily="sans-serif" fillOpacity="0.7">Consultations</text>
              <text x="32" y="251" fill="white" fontSize="18" fontWeight="bold" fontFamily="sans-serif">342</text>
              <text x="32" y="263" fill="#86efac" fontSize="8" fontFamily="sans-serif">Cette semaine</text>
            </g>

            {/* Heart */}
            <g className="animate-heartbeat" style={{transformOrigin:"75px 80px"}}>
              <path d="M63 80 C63 70 73 65 78 72 C83 65 93 70 93 80 C93 91 78 101 78 101 C78 101 63 91 63 80Z" fill="#fca5a5"/>
            </g>

            {/* Floating pills */}
            <g className="animate-float" style={{animationDelay:"1.8s"}}>
              <rect x="340" y="130" width="52" height="22" rx="11" fill="white" fillOpacity="0.3"/>
              <line x1="366" y1="130" x2="366" y2="152" stroke="white" strokeWidth="1.5" strokeOpacity="0.5"/>
            </g>
            <g className="animate-float" style={{animationDelay:"0.4s"}}>
              <rect x="355" y="240" width="46" height="20" rx="10" fill="white" fillOpacity="0.25"/>
              <line x1="378" y1="240" x2="378" y2="260" stroke="white" strokeWidth="1.5" strokeOpacity="0.5"/>
            </g>

            {/* ECG overlay */}
            <g transform="translate(80,60)">
              <polyline
                points="0,20 30,20 45,5 58,32 70,2 82,25 95,20 260,20"
                stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeOpacity="0.6"
                style={{strokeDasharray:500,strokeDashoffset:500,animation:"drawEcg2 2.5s ease forwards 0.8s"}}
              />
            </g>
            <style>{`@keyframes drawEcg2{to{stroke-dashoffset:0}}`}</style>
          </svg>

          <div className="text-center mt-6 animate-fadeInUp delay-500">
            <h2 className="text-4xl font-black text-white mb-2 tracking-tight">Plateforme de Santé</h2>
            <p className="text-blue-200 text-lg">Connectée · Sécurisée · Interopérable</p>
          </div>

          {/* Feature pills */}
          <div className="flex gap-3 mt-6 flex-wrap justify-center animate-fadeInUp delay-700">
            {[
              {icon:Heart,label:"Suivi patient"},{icon:Stethoscope,label:"Consultations"},
              {icon:Pill,label:"Prescriptions"},{icon:FlaskConical,label:"Labo"},{icon:Shield,label:"Sécurisé"}
            ].map(({icon:Icon,label},i)=>(
              <div key={label} className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full backdrop-blur-sm border border-white/20">
                <Icon className="w-3.5 h-3.5 text-blue-200"/>
                <span className="text-white/80 text-xs font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom ECG */}
        <div className="p-6 relative z-10"><EcgLine/></div>
      </div>

      {/* ── Right Panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 to-blue-50 overflow-auto">
        <div className="w-full max-w-md animate-scaleIn">
          {/* Logo mobile */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl mx-auto mb-3 flex items-center justify-center shadow-xl shadow-blue-200">
              <Activity className="w-8 h-8 text-white"/>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">CarnetPlus</h1>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl shadow-blue-100/50 p-8 border border-gray-100">
            <div className="mb-7 animate-fadeInUp">
              <h2 className="text-2xl font-black text-gray-900">Connexion</h2>
              <p className="text-gray-400 text-sm mt-1">Accédez à votre espace sécurisé</p>
            </div>

            {/* Error */}
            {(localError || error) && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 animate-slideDown">
                <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
                <p className="text-red-700 text-sm">{localError || error}</p>
              </div>
            )}

            {/* Form */}
            <div className="space-y-4 animate-fadeInUp delay-100">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400 w-5 h-5"/>
                  <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-sm transition-all"
                    placeholder="votre@email.com"/>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mot de passe</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5"/>
                  <input type="password" value={password} onChange={e=>setPassword(e.target.value)}
                    onKeyDown={e=>e.key==='Enter'&&handleLogin()}
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-sm transition-all"
                    placeholder="••••••••"/>
                </div>
              </div>

              <button onClick={handleLogin} disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-sm hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-200 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 flex items-center justify-center gap-2">
                {loading ? (
                  <><svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeOpacity="0.3"/><path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round"/></svg>Connexion…</>
                ) : "Se connecter →"}
              </button>
            </div>

            {/* Demo accounts */}
            <div className="mt-7 pt-6 border-t border-gray-100 animate-fadeInUp delay-300">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Comptes de démonstration</p>
              <div className="grid grid-cols-3 gap-2">
                {DEMO_ACCOUNTS.map((acc,i)=>(
                  <button key={acc.role} onClick={()=>handleDemoSelect(i)}
                    className={`p-2.5 rounded-xl border-2 transition-all text-left ${selectedDemo===i ? 'border-blue-500 bg-blue-50' : 'border-gray-100 hover:border-blue-200 hover:bg-gray-50'}`}>
                    <span className="text-lg">{acc.icon}</span>
                    <p className="text-xs font-semibold text-gray-900 mt-1 truncate">{acc.label.split(' ')[0]}</p>
                    <p className="text-xs text-gray-400 capitalize">{acc.role}</p>
                  </button>
                ))}
              </div>
              <button onClick={handleDemoLogin} disabled={loading}
                className="w-full mt-3 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-all">
                Connexion démo rapide →
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-4">
            CarnetPlus v2.0 — Plateforme de santé interopérable FHIR R4
          </p>
        </div>
      </div>
    </div>
  );
}
