import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { SearchProvider } from "../contexts/SearchContext";
import { Bot } from "lucide-react";
import { motion } from "framer-motion";

export function PatientLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/patient' || location.pathname === '/patient/';
  
  return (
    <SearchProvider>
      <div className="flex h-screen bg-slate-100 overflow-hidden relative">
        <Sidebar role="patient" activePath={location.pathname} />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {isHome && <Header />}
          <main className="flex-1 overflow-auto bg-slate-100 scrollbar-hide">
            <Outlet />
          </main>
        </div>

        {/* Global Floating AI Bubble */}
        <div className="fixed bottom-8 right-8 z-[100] no-print">
           <motion.button 
             whileHover={{ scale: 1.1 }}
             whileTap={{ scale: 0.9 }}
             onClick={()=>navigate("/patient/assistant-ia")}
             className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center text-blue-500 shadow-2xl border-4 border-white group relative"
           >
              <Bot className="w-8 h-8 group-hover:rotate-12 transition-transform" />
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 border-2 border-white rounded-full flex items-center justify-center animate-pulse">
                <div className="w-1.5 h-1.5 bg-white rounded-full" />
              </div>
           </motion.button>
        </div>
      </div>
    </SearchProvider>
  );
}
