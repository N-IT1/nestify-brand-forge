import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User, Mail, Calendar } from "lucide-react";

export default function Settings() {
  const { user } = useAuth();

  const initials = user?.user_metadata?.full_name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase() || user?.email?.[0].toUpperCase() || "U";

  return (
    <DashboardLayout title="Settings">
      <div className="max-w-2xl space-y-6">
        <Card className="bg-card/80 border-border/50 rounded-2xl">
          <CardHeader>
            <CardTitle className="font-display">Profile</CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
              <Avatar className="w-20 h-20 bg-gradient-accent">
                <AvatarFallback className="bg-gradient-accent text-primary-foreground text-2xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-display font-bold">
                  {user?.user_metadata?.full_name || "User"}
                </h3>
                <p className="text-muted-foreground">Store Owner</p>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-border/50">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium">{user?.user_metadata?.full_name || "Not set"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{user?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Member Since</p>
                  <p className="font-medium">
                    {user?.created_at
                      ? new Date(user.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "Unknown"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/80 border-border/50 rounded-2xl">
          <CardHeader>
            <CardTitle className="font-display">Account</CardTitle>
            <CardDescription>Manage your account settings</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm mb-4">
              More settings coming soon! We're working on features like password change, profile updates, and notification preferences.
            </p>
            <Button variant="outline" className="rounded-full" disabled>
              Coming Soon
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
