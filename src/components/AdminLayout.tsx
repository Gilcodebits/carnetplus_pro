import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { SearchProvider } from "../contexts/SearchContext";

export function AdminLayout() {
  const location = useLocation();
  const isHome = location.pathname === '/admin' || location.pathname === '/admin/';
  
  return (
    <SearchProvider>
      <div className="flex h-screen bg-slate-100 overflow-hidden">
        <Sidebar role="admin" activePath={location.pathname} />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {isHome && <Header />}
          <main className="flex-1 overflow-y-auto bg-slate-100 scrollbar-hide">
            <Outlet />
          </main>
        </div>
      </div>
    </SearchProvider>
  );
}
