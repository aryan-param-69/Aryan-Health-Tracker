import { Link, useLocation } from "wouter";
import { Activity, PlusCircle, History, Target, Server } from "lucide-react";
import { cn } from "@/lib/utils";
import { useHealthCheck, getHealthCheckQueryKey } from "@workspace/api-client-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const { data: healthStatus } = useHealthCheck({
    query: { queryKey: getHealthCheckQueryKey(), refetchInterval: 60000 }
  });

  const navItems = [
    { href: "/", icon: Activity, label: "Dashboard" },
    { href: "/log", icon: PlusCircle, label: "Log Entry" },
    { href: "/history", icon: History, label: "History" },
    { href: "/goals", icon: Target, label: "Goals" },
  ];

  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex flex-col md:flex-row overflow-hidden relative">
      <div className="fixed inset-0 pointer-events-none opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 50% 0%, hsl(188 86% 53% / 0.15) 0%, transparent 60%)' }} />
      <div className="fixed inset-0 pointer-events-none opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 100% 100%, hsl(158 64% 52% / 0.1) 0%, transparent 50%)' }} />
      
      {/* Mobile Top Nav */}
      <header className="md:hidden flex items-center justify-between p-4 glass-card border-b border-white/5 sticky top-0 z-50">
        <div className="flex items-center gap-2 text-primary">
          <Activity className="w-6 h-6" />
          <span className="font-bold tracking-widest text-lg">VITALIZE</span>
        </div>
        {healthStatus && (
          <div className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_var(--color-secondary)]" title="System Online" />
        )}
      </header>

      {/* Sidebar Nav */}
      <aside className="hidden md:flex flex-col w-64 glass-card border-r border-white/5 relative z-10">
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3 text-primary">
            <Activity className="w-8 h-8" />
            <span className="font-bold tracking-widest text-xl">VITALIZE</span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const isActive = location === item.href || (location.startsWith('/edit/') && item.href === '/history');
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative group overflow-hidden",
                  isActive 
                    ? "text-primary bg-primary/10 font-medium" 
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                )}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full shadow-[0_0_10px_var(--color-primary)]" />
                )}
                <item.icon className="w-5 h-5 relative z-10" />
                <span className="relative z-10">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-6">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Server className="w-3 h-3" />
            <span>System {healthStatus ? 'Online' : 'Checking...'}</span>
            <div className={cn("w-1.5 h-1.5 rounded-full ml-auto", healthStatus ? "bg-secondary shadow-[0_0_5px_var(--color-secondary)]" : "bg-muted")} />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative z-10 p-4 md:p-8">
        <div className="max-w-5xl mx-auto w-full">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden flex items-center justify-around p-4 glass-card border-t border-white/5 sticky bottom-0 z-50">
        {navItems.map((item) => {
          const isActive = location === item.href || (location.startsWith('/edit/') && item.href === '/history');
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-lg transition-all",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}