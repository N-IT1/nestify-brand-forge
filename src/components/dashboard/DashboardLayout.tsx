import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardMobileNav } from "./DashboardMobileNav";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { Logo } from "@/components/Logo";

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
}

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        {/* Desktop sidebar */}
        <div className="hidden md:block">
          <DashboardSidebar />
        </div>

        <SidebarInset className="flex-1 min-w-0">
          {/* Desktop header */}
          <header className="hidden md:flex sticky top-0 z-40 h-16 items-center gap-4 border-b border-border/50 bg-background/80 backdrop-blur-md px-6">
            <SidebarTrigger className="-ml-2" />
            {title && (
              <h1 className="text-xl font-display font-bold text-foreground">{title}</h1>
            )}
          </header>

          {/* Mobile header */}
          <header className="md:hidden sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border/40 bg-background/85 backdrop-blur-xl px-4">
            <Logo size="sm" />
            {title && (
              <h1 className="text-sm font-display font-semibold text-foreground/80 truncate">
                {title}
              </h1>
            )}
          </header>

          <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6">{children}</main>
        </SidebarInset>

        {/* Mobile bottom nav */}
        <DashboardMobileNav />
      </div>
    </SidebarProvider>
  );
}
