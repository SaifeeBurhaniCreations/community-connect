import { Layout } from '@/components/Layout';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { 
  LogOut,
  Shield,
  User
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function Settings() {
  const { toast } = useToast();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: 'Signed Out',
      description: 'You have been signed out successfully.',
    });
  };

  return (
    <Layout title="Settings">
      <div className="p-4 space-y-6">
        {/* App Info */}
        <div className="card-elevated p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center">
              <Shield className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Majlis Manager</h2>
              <p className="text-sm text-muted-foreground">Version 1.0.0</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="card-elevated p-4">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            Account
          </h3>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Logged in as</p>
            <p className="font-medium text-foreground">{user?.email}</p>
          </div>
        </div>

        {/* Sign Out */}
        <Button
          variant="outline"
          className="w-full justify-start h-14 text-destructive border-destructive/30 hover:bg-destructive/10"
          onClick={handleSignOut}
        >
          <LogOut className="w-5 h-5 mr-3" />
          <div className="text-left">
            <p className="font-medium">Sign Out</p>
            <p className="text-xs text-muted-foreground">Log out of your account</p>
          </div>
        </Button>

        {/* Footer */}
        <div className="text-center py-4">
          <p className="text-xs text-muted-foreground">
            © 2024 Majlis Manager. All rights reserved.
          </p>
        </div>
      </div>
    </Layout>
  );
}
