
import React from 'react';
import { Page } from '../types';
import { DashboardIcon, ToolsIcon, VideosIcon, NotesIcon, StudyIcon, ResourcesIcon, SettingsIcon } from './Icons';

interface SidebarProps {
  activePage: Page;
  setActivePage: (page: Page) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage }) => {
  const navItems = [
    { page: Page.Dashboard, label: 'Dashboard', icon: DashboardIcon },
    { page: Page.Ferramentas, label: 'Ferramentas', icon: ToolsIcon },
    { page: Page.Videos, label: 'Vídeos', icon: VideosIcon },
    { page: Page.Notas, label: 'Notas', icon: NotesIcon },
    { page: Page.Estudo, label: 'Estudo', icon: StudyIcon },
    { page: Page.Recursos, label: 'Recursos', icon: ResourcesIcon },
    { page: Page.Configuracoes, label: 'Configurações', icon: SettingsIcon },
  ];

  return (
    <aside className="w-64 bg-white flex flex-col border-r border-gray-200">
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg"></div>
            <div>
                <h1 className="text-lg font-bold text-brand-dark">Designali Hub</h1>
                <p className="text-xs text-gray-500">Creative Suite</p>
            </div>
        </div>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => (
          <a
            key={item.page}
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setActivePage(item.page);
            }}
            className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
              activePage === item.page
                ? 'bg-brand-dark text-white'
                : 'text-brand-gray hover:bg-gray-100'
            }`}
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.label}
          </a>
        ))}
      </nav>
      <div className="px-6 py-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">&copy; 2025 Designali Hub</p>
      </div>
    </aside>
  );
};

export default Sidebar;
