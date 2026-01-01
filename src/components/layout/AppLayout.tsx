import { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { Loader2 } from 'lucide-react';

const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const SESSION_KEY = 'admin_session_timestamp';

export function AppLayout() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sessionValid, setSessionValid] = useState(false);
  const [checking, setChecking] = useState(true);

  // Check and validate admin session
  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate('/admin');
      return;
    }

    // Check if session is still valid (within timeout)
    const lastActivity = sessionStorage.getItem(SESSION_KEY);
    const now = Date.now();

    if (!lastActivity) {
      // No session - require fresh login
      sessionStorage.removeItem(SESSION_KEY);
      signOut();
      navigate('/admin', { state: { requireReauth: true } });
      return;
    }

    const lastActivityTime = parseInt(lastActivity, 10);
    if (now - lastActivityTime > SESSION_TIMEOUT_MS) {
      // Session expired - require fresh login
      sessionStorage.removeItem(SESSION_KEY);
      signOut();
      navigate('/admin', { state: { sessionExpired: true } });
      return;
    }

    // Session is valid - update timestamp
    sessionStorage.setItem(SESSION_KEY, now.toString());
    setSessionValid(true);
    setChecking(false);
  }, [user, loading, navigate, signOut]);

  // Update session timestamp on user activity
  useEffect(() => {
    if (!sessionValid) return;

    const updateActivity = () => {
      sessionStorage.setItem(SESSION_KEY, Date.now().toString());
    };

    // Update on route changes
    updateActivity();

    // Update on user interactions
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => {
      window.addEventListener(event, updateActivity, { passive: true });
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, updateActivity);
      });
    };
  }, [sessionValid, location.pathname]);

  // Check session periodically
  useEffect(() => {
    if (!sessionValid) return;

    const interval = setInterval(() => {
      const lastActivity = sessionStorage.getItem(SESSION_KEY);
      if (!lastActivity) return;

      const now = Date.now();
      const lastActivityTime = parseInt(lastActivity, 10);
      
      if (now - lastActivityTime > SESSION_TIMEOUT_MS) {
        sessionStorage.removeItem(SESSION_KEY);
        signOut();
        navigate('/admin', { state: { sessionExpired: true } });
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [sessionValid, navigate, signOut]);

  if (loading || checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !sessionValid) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          <div className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 lg:px-6">
            <SidebarTrigger className="lg:hidden" />
            <div className="flex-1" />
          </div>
          <div className="p-4 lg:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
