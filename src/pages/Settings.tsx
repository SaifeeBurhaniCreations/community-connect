import { Layout } from '@/components/Layout';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { 
  Database,
  Trash2,
  Download,
  Upload,
  Info,
  Shield
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

export function Settings() {
  const { toast } = useToast();
  const { members, groups, occasions, attendance } = useStore();

  const handleExportData = () => {
    const data = {
      members,
      groups,
      occasions,
      attendance,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `majlis-manager-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Data Exported',
      description: 'Your data has been downloaded as a JSON file.',
    });
  };

  const handleClearAllData = () => {
    localStorage.removeItem('majlis-manager-storage');
    window.location.reload();
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

        {/* Data Stats */}
        <div className="card-elevated p-4">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Database className="w-4 h-4 text-primary" />
            Data Overview
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-secondary/50">
              <p className="text-2xl font-bold text-foreground">{members.length}</p>
              <p className="text-xs text-muted-foreground">Members</p>
            </div>
            <div className="p-3 rounded-lg bg-secondary/50">
              <p className="text-2xl font-bold text-foreground">{groups.length}</p>
              <p className="text-xs text-muted-foreground">Groups</p>
            </div>
            <div className="p-3 rounded-lg bg-secondary/50">
              <p className="text-2xl font-bold text-foreground">{occasions.length}</p>
              <p className="text-xs text-muted-foreground">Occasions</p>
            </div>
            <div className="p-3 rounded-lg bg-secondary/50">
              <p className="text-2xl font-bold text-foreground">{attendance.length}</p>
              <p className="text-xs text-muted-foreground">Records</p>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="space-y-3">
          <h3 className="font-semibold text-foreground">Data Management</h3>
          
          <Button
            variant="outline"
            className="w-full justify-start h-14"
            onClick={handleExportData}
          >
            <Download className="w-5 h-5 mr-3" />
            <div className="text-left">
              <p className="font-medium">Export Data</p>
              <p className="text-xs text-muted-foreground">Download all data as JSON</p>
            </div>
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start h-14 text-destructive border-destructive/30 hover:bg-destructive/10"
              >
                <Trash2 className="w-5 h-5 mr-3" />
                <div className="text-left">
                  <p className="font-medium">Clear All Data</p>
                  <p className="text-xs text-muted-foreground">Delete all stored data</p>
                </div>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear All Data?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all members, groups, occasions, and attendance records. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleClearAllData}
                  className="bg-destructive text-destructive-foreground"
                >
                  Delete Everything
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* About */}
        <div className="card-elevated p-4">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Info className="w-4 h-4 text-primary" />
            About
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Majlis Manager is a member management system designed for tracking attendance, 
            managing groups, and organizing occasions with Kalam assignments. Built for 
            daily mobile use with a focus on simplicity and reliability.
          </p>
        </div>

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
