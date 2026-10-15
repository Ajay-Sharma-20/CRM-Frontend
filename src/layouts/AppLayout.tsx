import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth/AuthContext';
import { api } from '../lib/api/client';
import { NotificationItem } from '../types';
import {
  LayoutDashboard,
  Users,
  PhoneCall,
  CalendarCheck,
  ShieldCheck,
  BarChart2,
  Settings,
  Bell,
  LogOut,
  Menu,
  X,
  History,
  Building2,
  UserCheck,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { Badge } from '../components/Badge';

export const AppLayout: React.FC = () => {
  const { user, logout, hasPermission } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.success) {
        setNotifications(res.data.items || []);
        setUnreadCount(res.data.unread_count || 0);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (id: number) => {
    try {
      await api.post(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // ignore
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.post('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch {
      // ignore
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Build navigation items based on permissions
  const navItems = [
    {
      label: user?.role?.slug === 'telecaller' ? 'My Workspace' : 'Dashboard',
      path: user?.role?.slug === 'telecaller' ? '/telecaller' : '/dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
      show: true,
    },
    {
      label: 'Leads',
      path: '/leads',
      icon: <Users className="w-4 h-4" />,
      show: hasPermission('leads.view_assigned') || hasPermission('leads.view_all'),
    },
    {
      label: 'Calls & Outcomes',
      path: '/calls',
      icon: <PhoneCall className="w-4 h-4" />,
      show: hasPermission('calls.view_own'),
    },
    {
      label: 'Follow-ups',
      path: '/follow-ups',
      icon: <CalendarCheck className="w-4 h-4" />,
      show: hasPermission('followups.view_own'),
    },
    {
      label: 'Teams',
      path: '/teams',
      icon: <Building2 className="w-4 h-4" />,
      show: hasPermission('teams.view'),
    },
    {
      label: 'Users',
      path: '/users',
      icon: <UserCheck className="w-4 h-4" />,
      show: hasPermission('users.view'),
    },
    {
      label: 'Access Control',
      path: '/access-control',
      icon: <ShieldCheck className="w-4 h-4" />,
      show: hasPermission('permissions.view'),
    },
    {
      label: 'Reports',
      path: '/reports',
      icon: <BarChart2 className="w-4 h-4" />,
      show: hasPermission('reports.view_own') || hasPermission('reports.view_company'),
    },
    {
      label: 'Audit Trail',
      path: '/audit',
      icon: <History className="w-4 h-4" />,
      show: hasPermission('audit.view'),
    },
    {
      label: 'Settings',
      path: '/settings',
      icon: <Settings className="w-4 h-4" />,
      show: hasPermission('settings.view'),
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFC] flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-zinc-200/80 fixed inset-y-0 z-30">
        {/* Workspace Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-zinc-100">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-gradient shadow-sm flex items-center justify-center text-white">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-zinc-900 tracking-tight leading-tight">
                {user?.tenant?.name || 'CRM SaaS'}
              </div>
              <div className="text-[10px] text-zinc-400 font-medium">Multi-Tenant CRM</div>
            </div>
          </Link>
        </div>

        {/* Current User Quick Glance */}
        <div className="p-3 mx-3 my-3 bg-purple-50/50 rounded-xl border border-purple-100/60 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-gradient flex items-center justify-center text-white text-xs font-bold">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-zinc-900 truncate">{user?.name}</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Badge variant="purple" size="sm">{user?.role?.name || 'User'}</Badge>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.filter((i) => i.show).map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path + '/'));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-brand-gradient text-white shadow-sm'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/80'
                }`}
              >
                <span className={isActive ? 'text-white' : 'text-zinc-400'}>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer & Sign Out */}
        <div className="p-4 border-t border-zinc-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-4 h-4 text-rose-500" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-zinc-200/80 sticky top-0 z-20 flex items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="md:hidden p-2 rounded-lg text-zinc-500 hover:bg-zinc-100"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="text-xs font-medium text-zinc-500 hidden sm:block">
              Workspace: <span className="font-semibold text-zinc-900">{user?.tenant?.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notification Dropdown Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 relative transition-colors"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-pink-500 ring-2 ring-white" />
                )}
              </button>

              {/* Notification Popup */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-zinc-200/80 p-4 z-50">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-zinc-900 text-xs">Notifications</h4>
                      {unreadCount > 0 && <Badge variant="purple" size="sm">{unreadCount} new</Badge>}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[11px] text-purple-600 hover:text-purple-800 font-medium"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-zinc-50 py-1">
                    {notifications.length === 0 ? (
                      <div className="py-6 text-center text-xs text-zinc-400">No notifications yet</div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`p-2.5 rounded-lg text-xs transition-colors flex flex-col gap-1 ${
                            n.is_read ? 'opacity-70' : 'bg-purple-50/40 font-medium'
                          }`}
                          onClick={() => {
                            if (!n.is_read) handleMarkAsRead(n.id);
                            if (n.link) navigate(n.link);
                            setNotificationsOpen(false);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-zinc-900">{n.title}</span>
                            <span className="text-[10px] text-zinc-400">
                              {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-600 leading-normal">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Pill */}
            <div className="flex items-center gap-2 pl-2 border-l border-zinc-100">
              <div className="w-7 h-7 rounded-full bg-brand-gradient flex items-center justify-center text-white text-xs font-bold shadow-sm">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-semibold text-zinc-900 leading-tight">{user?.name}</div>
                <div className="text-[10px] text-purple-600 font-medium">{user?.role?.name}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative flex flex-col w-72 bg-white h-full shadow-2xl p-4">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-brand-gradient flex items-center justify-center text-white">
                  <PhoneCall className="w-4 h-4" />
                </div>
                <span className="font-bold text-sm text-zinc-900">{user?.tenant?.name}</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="p-1.5 text-zinc-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
              {navItems.filter((i) => i.show).map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium ${
                    location.pathname === item.path
                      ? 'bg-brand-gradient text-white shadow-sm'
                      : 'text-zinc-700 hover:bg-zinc-100'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
            <div className="pt-4 border-t border-zinc-100">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-xs font-medium text-rose-600"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
