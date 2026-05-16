import {
  Store,
  Package,
  LayoutDashboard,
  Settings,
  LogOut,
  FolderOpen,
  BarChart3,
  ShoppingBag,
  Users,
  Tag,
  Megaphone,
  HelpCircle,
  ShieldCheck,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import {
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
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const menuGroups = [
  {
    label: "Workspace",
    items: [
      { title: "Overview", url: "/dashboard", icon: LayoutDashboard },
      { title: "Analytics", url: "/dashboard/analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Catalog",
    items: [
      { title: "My Stores", url: "/dashboard/stores", icon: Store },
      { title: "Products", url: "/dashboard/products", icon: Package },
      { title: "Categories", url: "/dashboard/categories", icon: FolderOpen },
    ],
  },
  {
    label: "Sales",
    items: [
      { title: "Orders", url: "/dashboard/orders", icon: ShoppingBag },
      { title: "Customers", url: "/dashboard/customers", icon: Users },
      { title: "Discounts", url: "/dashboard/discounts", icon: Tag },
      { title: "Marketing", url: "/dashboard/marketing", icon: Megaphone },
    ],
  },
  {
    label: "Account",
    items: [
      { title: "Settings", url: "/dashboard/settings", icon: Settings },
      { title: "Help & Support", url: "/dashboard/help", icon: HelpCircle },
    ],
  },
];

export function DashboardSidebar() {
  const { state } = useSidebar();
  const { user, signOut } = useAuth();
  const { isAdmin } = useIsAdmin();
  const collapsed = state === "collapsed";

  const initials =
    user?.user_metadata?.full_name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase() || user?.email?.[0].toUpperCase() || "U";

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50">
      <SidebarHeader className="p-4">
        <Logo size={collapsed ? "sm" : "md"} showText={!collapsed} />
      </SidebarHeader>

      <SidebarContent className="gap-1">
        {menuGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel
              className={`text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70 ${
                collapsed ? "sr-only" : ""
              }`}
            >
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <NavLink
                        to={item.url}
                        end={item.url === "/dashboard"}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-primary/10 hover:text-primary transition-all duration-200"
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
        ))}

        {isAdmin && (
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
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Admin">
                    <NavLink
                      to="/admin"
                      className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-primary/10 hover:text-primary transition-all"
                      activeClassName="bg-primary/15 text-primary font-medium shadow-sm"
                    >
                      <ShieldCheck className="w-5 h-5 shrink-0" />
                      {!collapsed && <span>Admin</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {!collapsed && (
          <div className="mx-3 mt-4 mb-2 rounded-2xl border border-border/50 bg-gradient-to-br from-primary/10 via-accent/5 to-transparent p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-background flex items-center justify-center border border-border/40">
                <Logo size="sm" showText={false} className="[&>div]:w-5 [&>div]:h-5" />
              </div>
              <span className="text-sm font-display font-semibold">Upgrade to Pro</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">
              Unlock advanced analytics, custom domains, and more.
            </p>
            <Button
              size="sm"
              className="w-full rounded-full text-xs h-8"
              asChild
            >
              <a
                href="https://recurrra.com/plans-hub/887b47d5-47fc-4b97-ad3e-5b380c1b0174"
                target="_blank"
                rel="noopener noreferrer"
              >
                View plans
              </a>
            </Button>
          </div>
        )}
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
                {user?.user_metadata?.full_name || "User"}
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
