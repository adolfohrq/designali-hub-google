
import React, { useState, useEffect } from 'react';
import { SearchIcon, BellIcon, UserIcon, SunIcon } from './Icons';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../services/supabase';
import { Tool, Video, Note, Course, Tutorial, Resource, Page, Notification } from '../types';
// @ts-ignore
import { toast } from 'react-hot-toast';
import { debug } from '../utils/debug';

interface HeaderProps {
  title: string;
  setActivePage?: (page: Page) => void;
}

interface SearchResult {
  id: string;
  type: 'tool' | 'video' | 'note' | 'course' | 'tutorial' | 'resource';
  title: string;
  description?: string;
  page: Page;
}

const Header: React.FC<HeaderProps> = ({ title, setActivePage }) => {
  const { user, signOut } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load notifications
  useEffect(() => {
    if (!user) return;

    const loadNotifications = async () => {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20);

        if (error) throw error;
        if (data) {
          setNotifications(data);
          setUnreadCount(data.filter(n => !n.is_read).length);
        }
      } catch (error) {
        debug.error('Error loading notifications:', error);
      }
    };

    loadNotifications();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setNotifications(prev => [payload.new as Notification, ...prev]);
          setUnreadCount(prev => prev + 1);
          toast.success('Nova notificação recebida!');
        } else if (payload.eventType === 'UPDATE') {
          setNotifications(prev => prev.map(n =>
            n.id === payload.new.id ? payload.new as Notification : n
          ));
          setUnreadCount(prev => {
            const oldNotif = notifications.find(n => n.id === payload.new.id);
            if (oldNotif && !oldNotif.is_read && (payload.new as Notification).is_read) {
              return Math.max(0, prev - 1);
            }
            return prev;
          });
        } else if (payload.eventType === 'DELETE') {
          setNotifications(prev => prev.filter(n => n.id !== payload.old.id));
          const deletedNotif = notifications.find(n => n.id === payload.old.id);
          if (deletedNotif && !deletedNotif.is_read) {
            setUnreadCount(prev => Math.max(0, prev - 1));
          }
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logout realizado com sucesso!');
    } catch (error) {
      debug.error('Error signing out:', error);
      toast.error('Erro ao fazer logout');
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;
    } catch (error) {
      debug.error('Error marking notification as read:', error);
      toast.error('Erro ao marcar como lida');
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;
      toast.success('Todas notificações marcadas como lidas');
    } catch (error) {
      debug.error('Error marking all as read:', error);
      toast.error('Erro ao marcar todas como lidas');
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;
      toast.success('Notificação removida');
    } catch (error) {
      debug.error('Error deleting notification:', error);
      toast.error('Erro ao remover notificação');
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }

    if (notification.link && setActivePage) {
      const pageMap: Record<string, Page> = {
        'ferramentas': Page.Ferramentas,
        'videos': Page.Videos,
        'notas': Page.Notas,
        'estudo': Page.Estudo,
        'recursos': Page.Recursos,
        'configuracoes': Page.Configuracoes,
      };

      const page = pageMap[notification.link];
      if (page) {
        setActivePage(page);
        setShowNotifications(false);
      }
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      default:
        return 'ℹ️';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const formatNotificationTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `${diffMins}m atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays < 7) return `${diffDays}d atrás`;
    return date.toLocaleDateString('pt-BR');
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  // Global search functionality
  useEffect(() => {
    if (!searchQuery.trim() || !user) {
      setSearchResults([]);
      return;
    }

    const searchTimeout = setTimeout(async () => {
      setIsSearching(true);
      try {
        const query = searchQuery.toLowerCase();
        const results: SearchResult[] = [];

        // Search Tools
        const { data: tools } = await supabase
          .from('tools')
          .select('*')
          .eq('user_id', user.id)
          .or(`name.ilike.%${query}%,category.ilike.%${query}%,description.ilike.%${query}%`);

        if (tools) {
          tools.forEach((tool: Tool) => {
            results.push({
              id: tool.id,
              type: 'tool',
              title: tool.name,
              description: tool.description,
              page: Page.Ferramentas,
            });
          });
        }

        // Search Videos
        const { data: videos } = await supabase
          .from('videos')
          .select('*')
          .eq('user_id', user.id)
          .or(`title.ilike.%${query}%,channel.ilike.%${query}%,description.ilike.%${query}%`);

        if (videos) {
          videos.forEach((video: Video) => {
            results.push({
              id: video.id,
              type: 'video',
              title: video.title,
              description: video.description,
              page: Page.Videos,
            });
          });
        }

        // Search Notes
        const { data: notes } = await supabase
          .from('notes')
          .select('*')
          .eq('user_id', user.id)
          .or(`title.ilike.%${query}%,content.ilike.%${query}%`);

        if (notes) {
          notes.forEach((note: Note) => {
            results.push({
              id: note.id,
              type: 'note',
              title: note.title,
              description: note.content?.substring(0, 100),
              page: Page.Notas,
            });
          });
        }

        // Search Courses
        const { data: courses } = await supabase
          .from('courses')
          .select('*')
          .eq('user_id', user.id)
          .or(`title.ilike.%${query}%,platform.ilike.%${query}%,description.ilike.%${query}%`);

        if (courses) {
          courses.forEach((course: Course) => {
            results.push({
              id: course.id,
              type: 'course',
              title: course.title,
              description: course.description,
              page: Page.Estudo,
            });
          });
        }

        // Search Tutorials
        const { data: tutorials } = await supabase
          .from('tutorials')
          .select('*')
          .eq('user_id', user.id)
          .or(`title.ilike.%${query}%,source.ilike.%${query}%,description.ilike.%${query}%`);

        if (tutorials) {
          tutorials.forEach((tutorial: Tutorial) => {
            results.push({
              id: tutorial.id,
              type: 'tutorial',
              title: tutorial.title,
              description: tutorial.description,
              page: Page.Estudo,
            });
          });
        }

        // Search Resources
        const { data: resources } = await supabase
          .from('resources')
          .select('*')
          .eq('user_id', user.id)
          .or(`title.ilike.%${query}%,author.ilike.%${query}%,description.ilike.%${query}%`);

        if (resources) {
          resources.forEach((resource: Resource) => {
            results.push({
              id: resource.id,
              type: 'resource',
              title: resource.title,
              description: resource.description,
              page: Page.Recursos,
            });
          });
        }

        setSearchResults(results);
      } catch (error) {
        debug.error('Error searching:', error);
        toast.error('Erro ao buscar');
      } finally {
        setIsSearching(false);
      }
    }, 300); // Debounce 300ms

    return () => clearTimeout(searchTimeout);
  }, [searchQuery, user]);

  const handleResultClick = (result: SearchResult) => {
    if (setActivePage) {
      setActivePage(result.page);
    }
    setShowSearchModal(false);
    setSearchQuery('');
    toast.success(`Navegando para ${result.title}`);
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'tool':
        return '🛠️';
      case 'video':
        return '🎥';
      case 'note':
        return '📝';
      case 'course':
        return '📚';
      case 'tutorial':
        return '🎓';
      case 'resource':
        return '📖';
      default:
        return '📄';
    }
  };

  const getResultTypeLabel = (type: string) => {
    switch (type) {
      case 'tool':
        return 'Ferramenta';
      case 'video':
        return 'Vídeo';
      case 'note':
        return 'Nota';
      case 'course':
        return 'Curso';
      case 'tutorial':
        return 'Tutorial';
      case 'resource':
        return 'Recurso';
      default:
        return 'Item';
    }
  };

  // Keyboard shortcut: Ctrl/Cmd + K to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearchModal(true);
      }
      if (e.key === 'Escape') {
        setShowSearchModal(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <header className="h-16 bg-white flex items-center justify-between px-8 border-b border-gray-200">
        <div>
          <h1 className="text-xl font-semibold text-brand-dark">{title}</h1>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowSearchModal(true)}
            className="text-brand-gray hover:text-brand-dark transition"
            title="Buscar (Ctrl/Cmd + K)"
          >
            <SearchIcon className="w-5 h-5" />
          </button>
        {/* Dark mode toggle */}
        <button
          onClick={toggleDarkMode}
          className="text-brand-gray hover:text-brand-dark transition"
          title={isDarkMode ? 'Modo claro' : 'Modo escuro'}
        >
          {isDarkMode ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>

        {/* Notifications button */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="text-brand-gray hover:text-brand-dark relative"
          >
            <BellIcon className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications dropdown */}
          {showNotifications && (
            <>
              {/* Overlay */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowNotifications(false)}
              />

              {/* Dropdown */}
              <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-20 max-h-[32rem] flex flex-col">
                {/* Header */}
                <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="font-semibold text-brand-dark">Notificações</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      Marcar todas como lidas
                    </button>
                  )}
                </div>

                {/* Notifications list */}
                <div className="overflow-y-auto flex-1">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-brand-gray">
                      <BellIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">Nenhuma notificação</p>
                      <p className="text-xs mt-1 opacity-70">Você está em dia!</p>
                    </div>
                  ) : (
                    <div>
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition cursor-pointer ${
                            !notification.is_read ? 'bg-blue-50' : ''
                          }`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-xl mt-0.5 flex-shrink-0">
                              {getNotificationIcon(notification.type)}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <p className={`text-sm font-medium text-brand-dark ${
                                  !notification.is_read ? 'font-semibold' : ''
                                }`}>
                                  {notification.title}
                                </p>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteNotification(notification.id);
                                  }}
                                  className="text-gray-400 hover:text-red-500 transition flex-shrink-0"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                              <p className="text-xs text-brand-gray mb-2">
                                {notification.message}
                              </p>
                              <p className="text-xs text-brand-gray opacity-70">
                                {formatNotificationTime(notification.created_at)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold text-sm hover:bg-indigo-700 transition"
          >
            {getUserInitials()}
          </button>

          {showUserMenu && (
            <>
              {/* Overlay */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowUserMenu(false)}
              />

              {/* Dropdown menu */}
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-20">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-brand-dark">Conta</p>
                  <p className="text-xs text-brand-gray mt-1 truncate">{user?.email}</p>
                </div>

                <button
                  className="w-full px-4 py-2 text-left text-sm text-brand-gray hover:bg-gray-50 flex items-center gap-2"
                  onClick={() => {
                    setShowUserMenu(false);
                    // Navigate to settings would go here
                  }}
                >
                  <UserIcon className="w-4 h-4" />
                  Perfil
                </button>

                <div className="border-t border-gray-100 my-1"></div>

                <button
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  onClick={() => {
                    setShowUserMenu(false);
                    handleLogout();
                  }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sair
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>

    {/* Search Modal */}
    {showSearchModal && (
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black bg-opacity-50">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden">
          {/* Search Input */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <SearchIcon className="w-5 h-5 text-brand-gray" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar em tudo... (ferramentas, vídeos, notas, cursos, recursos)"
                className="flex-1 outline-none text-brand-dark placeholder-brand-gray"
                autoFocus
              />
              {isSearching && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
              )}
              <button
                onClick={() => {
                  setShowSearchModal(false);
                  setSearchQuery('');
                }}
                className="text-xs text-brand-gray hover:text-brand-dark bg-gray-100 px-2 py-1 rounded"
              >
                ESC
              </button>
            </div>
          </div>

          {/* Search Results */}
          <div className="max-h-96 overflow-y-auto">
            {searchQuery.trim() === '' ? (
              <div className="p-8 text-center text-brand-gray">
                <SearchIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Digite para buscar em todas suas ferramentas, vídeos, notas, cursos e recursos</p>
                <p className="text-xs mt-2 opacity-70">Atalho: Ctrl/Cmd + K</p>
              </div>
            ) : searchResults.length === 0 && !isSearching ? (
              <div className="p-8 text-center text-brand-gray">
                <p className="text-sm">Nenhum resultado encontrado para "{searchQuery}"</p>
                <p className="text-xs mt-2 opacity-70">Tente buscar com outros termos</p>
              </div>
            ) : (
              <div className="py-2">
                {searchResults.map((result) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleResultClick(result)}
                    className="w-full px-4 py-3 hover:bg-gray-50 transition text-left flex items-start gap-3 group"
                  >
                    <span className="text-2xl mt-0.5">{getResultIcon(result.type)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-brand-dark group-hover:text-indigo-600 transition truncate">
                          {result.title}
                        </p>
                        <span className="text-xs bg-gray-100 text-brand-gray px-2 py-0.5 rounded-full whitespace-nowrap">
                          {getResultTypeLabel(result.type)}
                        </span>
                      </div>
                      {result.description && (
                        <p className="text-sm text-brand-gray line-clamp-2">
                          {result.description}
                        </p>
                      )}
                    </div>
                    <svg
                      className="w-4 h-4 text-brand-gray opacity-0 group-hover:opacity-100 transition mt-1 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer with tips */}
          {searchResults.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50 text-xs text-brand-gray flex items-center justify-between">
              <span>{searchResults.length} resultado(s) encontrado(s)</span>
              <span>Clique para navegar</span>
            </div>
          )}
        </div>
      </div>
    )}
  </>
  );
};

export default Header;
