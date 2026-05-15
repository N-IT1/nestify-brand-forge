import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { NavLink } from "@/components/NavLink";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import {
  LayoutDashboard,
  Users,
  Store,
  Package,
  LogOut,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";
import { Loader2 } from "lucide-react";

const items = [
  { title: "Overview", url: "/admin", icon: LayoutDashboard, end: true },
  { title: "Users", url: "/admin/users", icon: Users },
  { title: "Stores", url: "/admin/stores", icon: Store },
  { title: "Products", url: "/admin/products", icon: Package },
];

function AdminSidebar() {
  const { state } = useSidebar();
  const { user, signOut } = useAuth();
  const collapsed = state === "collapsed";

  const initials =
    user?.user_metadata?.full_name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase() || user?.email?.[0].toUpperCase() || "A";

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <Logo size={collapsed ? "sm" : "md"} showText={!collapsed} />
        </div>
        {!collapsed && (
          <div className="mt-3 inline-flex items-center gap-1.5 self-start rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
            <ShieldCheck className="w-3 h-3" /> Admin
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel
            className={`text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70 ${
              collapsed ? "sr-only" : ""
            }`}
          >
            Platform
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink
                      to={item.url}
                      end={item.end}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-primary/10 hover:text-primary transition-all"
                      activeClassName="bg-primary/15 text-primary font-medium shadow-sm"
                    >
                      <item.icon className="w-5 h-5 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Back to seller dashboard">
                  <NavLink
                    to="/dashboard"
                    className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-muted text-muted-foreground"
                  >
                    <ArrowLeft className="w-5 h-5 shrink-0" />
                    {!collapsed && <span>Back to dashboard</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border/50">
        <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
          <Avatar className="w-9 h-9 bg-gradient-accent">
            <AvatarFallback className="bg-gradient-accent text-primary-foreground text-sm font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user?.user_metadata?.full_name || "Admin"}
              </p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={signOut}
            className="shrink-0 h-9 w-9 text-muted-foreground hover:text-destructive"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
}

export function AdminLayout({ children, title }: AdminLayoutProps) {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useIsAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="max-w-md text-center space-y-4">
          <ShieldCheck className="w-12 h-12 text-muted-foreground mx-auto" />
          <h1 className="text-2xl font-display font-bold">Admins only</h1>
          <p className="text-muted-foreground">
            You don't have access to this area. If you believe this is a mistake, ask a
            platform owner to grant you the admin role.
          </p>
          <Button onClick={() => navigate("/dashboard")} className="rounded-full">
            Back to your dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background/50">
        <AdminSidebar />
        <SidebarInset className="flex-1 bg-muted/10">
          <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border/40 bg-background/60 backdrop-blur-xl px-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="-ml-2" />
              {title && (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-1 rounded-full bg-primary/80" />
                  <h1 className="text-xl font-display font-semibold text-foreground tracking-tight">{title}</h1>
                </div>
              )}
            </div>
          </header>
          <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
