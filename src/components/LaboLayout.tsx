import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { SearchProvider } from "../contexts/SearchContext";

export function LaboLayout() {
  const location = useLocation();
  const isHome = location.pathname === '/labo' || location.pathname === '/labo/';
  
  return (
    <SearchProvider>
      <div className="fixed inset-0 flex h-screen w-screen bg-slate-100 overflow-hidden scrollbar-hide">
        <Sidebar role="labo" activePath={location.pathname} />
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden scrollbar-hide">
          {isHome && <Header />}
          <main className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide">
            <Outlet />
          </main>
        </div>
      </div>
    </SearchProvider>
  );
}
