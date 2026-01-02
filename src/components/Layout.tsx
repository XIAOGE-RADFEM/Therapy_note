
import React from 'react';
import { Home, Users, Calendar, Plus, Languages, Settings, PanelLeft, PanelLeftClose, LogOut } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onNewClient: () => void;
  lang: Language;
  onLangToggle: () => void;
  isSidebarOpen: boolean;
  onSidebarToggle: () => void;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange, onNewClient, lang, onLangToggle, isSidebarOpen, onSidebarToggle, onLogout }) => {
  const t = TRANSLATIONS[lang];

  const DesktopNavItem = ({ id, icon: Icon, label }: { id: string, icon: any, label: string }) => (
    <button
      onClick={() => onTabChange(id)}
      className={`flex items-center transition-all rounded-lg group relative ${
        isSidebarOpen 
          ? 'w-full px-5 py-3 justify-start' 
          : 'w-10 h-10 justify-center mx-auto'
      } ${
        activeTab === id 
          ? 'bg-white text-brand-orange font-semibold shadow-sm' 
          : 'text-brand-text hover:bg-white/60'
      }`}
    >
      <Icon className={`w-5 h-5 ${isSidebarOpen ? 'mr-3' : ''}`} />
      
      {/* Label for Open State */}
      <span className={`text-sm whitespace-nowrap overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
        {label}
      </span>

      {/* Tooltip for Collapsed State */}
      {!isSidebarOpen && (
        <span className="absolute left-14 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-lg">
          {label}
        </span>
      )}
    </button>
  );

  const MobileNavItem = ({ id, icon: Icon, label }: { id: string, icon: any, label: string }) => (
    <button 
      onClick={() => onTabChange(id)}
      className={`flex flex-col items-center justify-center w-full h-full py-1 ${
        activeTab === id ? 'text-brand-orange' : 'text-gray-400 hover:text-brand-text'
      }`}
    >
      <Icon className={`w-6 h-6 ${activeTab === id ? 'stroke-[2.5px]' : 'stroke-2'}`} />
      <span className="text-[10px] mt-1 font-medium">{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-beige overflow-hidden">
      {/* Desktop Sidebar - Hidden on small screens */}
      <aside 
        className={`hidden md:flex bg-beige-soft border-r border-brand-border flex-col z-10 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'w-64 px-4 py-4' : 'w-20 py-4 items-center'
        }`}
      >
        {/* Logo Area */}
       <div className={`flex items-center h-16 shrink-0 transition-all duration-300 ${isSidebarOpen ? 'px-2' : 'justify-center'}`}>
           {/* CUSTOM LOGO: Replace the src below with your own image URL */}
           <img 
             src="/log.svg" 
             alt="Logo" 
             className="w-10 h-10 shrink-0 object-contain"
           />
           <span className={`text-xl font-bold text-brand-text tracking-tight ml-3 whitespace-nowrap overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
             therapyLog
           </span>
        </div>

        <nav className="flex-1 mt-6 space-y-2 w-full">
           {/* Desktop New Client Button */}
           <button 
             onClick={onNewClient}
             className={`flex items-center justify-center text-sm font-semibold text-white bg-brand-orange shadow-sm hover:bg-brand-orange/90 transition-all mb-6 group relative ${
               isSidebarOpen ? 'w-full px-4 py-3 rounded-lg' : 'w-10 h-10 rounded-lg mx-auto'
             }`}
            >
              <Plus className={`w-5 h-5 ${isSidebarOpen ? 'mr-2' : ''}`} />
              <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
                {t.newClient}
              </span>

              {!isSidebarOpen && (
                <span className="absolute left-14 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-lg">
                  {t.newClient}
                </span>
              )}
           </button>

          <DesktopNavItem id="dashboard" icon={Home} label={t.dashboard} />
          <DesktopNavItem id="clients" icon={Users} label={t.clients} />
          <DesktopNavItem id="calendar" icon={Calendar} label={t.calendar} />
          <DesktopNavItem id="settings" icon={Settings} label={t.settings} />
        </nav>

        {/* Bottom Actions */}
        <div className={`shrink-0 w-full flex flex-col gap-1 ${isSidebarOpen ? 'px-2' : 'items-center'}`}>
           <button
              onClick={onLogout}
              className={`flex items-center justify-center text-xs font-medium rounded-lg text-brand-text-light hover:text-red-600 hover:bg-red-50 transition-colors group relative ${
                isSidebarOpen ? 'w-full p-2 justify-start' : 'w-10 h-10'
              }`}
              title={t.logOut}
           >
              <LogOut className={`w-4 h-4 ${isSidebarOpen ? 'mr-2' : ''}`} />
              <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
                {t.logOut}
              </span>
              
               {!isSidebarOpen && (
                <span className="absolute left-14 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-lg">
                  {t.logOut}
                </span>
              )}
           </button>

           <button
              onClick={onLangToggle}
              className={`flex items-center justify-center text-xs font-medium rounded-lg text-brand-text-light hover:bg-white/60 transition-colors group relative ${
                isSidebarOpen ? 'w-full p-2 justify-start' : 'w-10 h-10'
              }`}
            >
              <Languages className={`w-4 h-4 ${isSidebarOpen ? 'mr-2' : ''}`} />
              <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
                {lang === 'en' ? '中文' : 'English'}
              </span>

              {!isSidebarOpen && (
                <span className="absolute left-14 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-lg">
                  {lang === 'en' ? 'Switch to 中文' : 'Switch to English'}
                </span>
              )}
            </button>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <main className="flex-1 flex flex-col overflow-hidden transition-all duration-300 relative">
        
        {/* Desktop Header */}
        <header className="hidden md:flex bg-beige h-20 md:h-24 items-center justify-between px-4 md:px-8 shrink-0">
          <div className="flex items-center gap-2 md:gap-4">
            <button 
              onClick={onSidebarToggle} 
              className="p-2 text-brand-text-light hover:text-brand-orange hover:bg-beige-soft rounded-full transition-colors"
              title={t.toggleSidebar}
            >
              {isSidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeft className="w-5 h-5" />}
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-brand-text whitespace-nowrap">
              {activeTab === 'dashboard' && t.dashboard}
              {activeTab === 'clients' && t.clients}
              {activeTab === 'calendar' && t.calendar}
              {activeTab === 'settings' && t.settings}
            </h1>
          </div>
        </header>

        {/* Mobile Header (Top Bar) */}
        <header className="md:hidden h-16 bg-beige flex items-center justify-between px-4 border-b border-brand-border shrink-0 z-20">
           <div className="flex items-center">
             <svg className="w-6 h-6 text-brand-orange shrink-0 mr-2" viewBox="0 0 24 24" fill="currentColor">
               <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/><path d="M12 11.5c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2 2-.9 2-2-.9-2-2-2z"/><path d="M12 13.5c-2.67 0-8 1.34-8 4v1.5h16v-1.5c0-2.66-5.33-4-8-4zm0 1.5c1.16 0 2.53.25 3.96.75H8.04c1.43-.5 2.8-..75 3.96-.75z"/>
             </svg>
             <span className="text-lg font-bold text-brand-text tracking-tight">TherapyLog</span>
           </div>
           <div className="flex items-center gap-2">
             <button onClick={onLangToggle} className="p-2 rounded-full text-brand-text-light hover:bg-beige-soft">
                <Languages className="w-5 h-5" />
             </button>
             <button onClick={onLogout} className="p-2 rounded-full text-brand-text-light hover:bg-red-50 hover:text-red-500">
                <LogOut className="w-5 h-5" />
             </button>
           </div>
        </header>

        {/* Scrollable Content Area */}
        {/* pb-36 on mobile ensures content isn't hidden behind the bottom tab bar and FAB */}
        <div className="flex-1 overflow-auto px-4 md:px-8 pb-36 md:pb-8 custom-scrollbar">
          <div className="w-full h-full md:pt-0 pt-4"> 
             {/* Note: pt-4 removed on mobile to let views like Calendar handle their own top spacing if needed, 
                 or re-added here if generic padding is desired. 
                 Current: pt-4 generic mobile padding re-enabled but controlled. */}
            {children}
          </div>
        </div>

        {/* Mobile Bottom Navigation Bar */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-brand-border flex items-center justify-around px-2 z-40 safe-area-bottom shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
           <MobileNavItem id="dashboard" icon={Home} label={t.home} />
           <MobileNavItem id="clients" icon={Users} label={t.clients} />
           
           {/* Central Floating Action Button */}
           <div className="relative -top-6">
             <button 
               onClick={onNewClient} 
               className="w-14 h-14 rounded-full bg-brand-orange text-white shadow-lg shadow-brand-orange/30 flex items-center justify-center transform transition-transform active:scale-95"
             >
               <Plus className="w-7 h-7" />
             </button>
           </div>

           <MobileNavItem id="calendar" icon={Calendar} label={t.calendar} />
           <MobileNavItem id="settings" icon={Settings} label={t.settings} />
        </nav>
      </main>
    </div>
  );
};
