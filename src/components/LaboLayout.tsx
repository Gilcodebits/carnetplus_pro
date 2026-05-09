import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { SearchProvider } from "../contexts/SearchContext";

export function LaboLayout() {
  const location = useLocation();
  const isHome = location.pathname === '/labo' || location.pathname === '/labo/';
  
  return (
    <SearchProvider>
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <Sidebar role="labo" activePath={location.pathname} />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {isHome && <Header />}
          <main className="flex-1 overflow-auto bg-slate-50">
            <Outlet />
          </main>
        </div>
      </div>
    </SearchProvider>
  );
}
