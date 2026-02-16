import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogFooter,
DialogHeader, DialogTitle, } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { useAppState } from '@/hooks/useAppState';

import { cn } from '@/lib/utils';

function getStrength(password: string): { level: number; label: string; color: string } {
  if (password.length === 0) return { level: 0, label: '', color: '' };
  if (password.length < 6) return { level: 1, label: 'Weak', color: 'bg-destructive' };
  if (password.length < 10) return { level: 2, label: 'Medium', color: 'bg-yellow-500' };
  return { level: 3, label: 'Strong', color: 'bg-green-500' };
}

export function PasswordDialog() {
  const { isPasswordDialogOpen, closePasswordDialog } = useAppState();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [allowPrinting, setAllowPrinting] = useState(true);
  const [allowCopying, setAllowCopying] = useState(true);
  const [allowEditing, setAllowEditing] = useState(false);

  const strength = getStrength(password);
  const passwordsMatch = password === confirm;
  const isValid = password.length > 0 && passwordsMatch;

  const handleSetPassword = () => {
    toast.success('Password protection set');
    setPassword('');
    setConfirm('');
    closePasswordDialog();
  };

  const handleClose = () => {
    setPassword('');
    setConfirm('');
    closePasswordDialog();
  };

  return (
    <Dialog open={isPasswordDialogOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Password Protection</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="pwd">Password</Label>
            <Input
              id="pwd"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
            />
            {/* Strength bar */}
            {password.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex h-1.5 flex-1 gap-0.5">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={cn(
                        'h-full flex-1 rounded-full',
                        i <= strength.level ? strength.color : 'bg-muted'
                      )}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">{strength.label}</span>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="pwd-confirm">Confirm Password</Label>
            <Input
              id="pwd-confirm"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Confirm password"
            />
            {confirm.length > 0 && !passwordsMatch && (
              <span className="text-xs text-destructive">Passwords do not match</span>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium">Permissions</Label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={allowPrinting} onChange={(e) => setAllowPrinting(e.target.checked)} />
              Allow Printing
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={allowCopying} onChange={(e) => setAllowCopying(e.target.checked)} />
              Allow Copying Text
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={allowEditing} onChange={(e) => setAllowEditing(e.target.checked)} />
              Allow Editing
            </label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSetPassword} disabled={!isValid}>Set Password</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
