'use client';

import { useState, useRef } from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Download, Upload, Trash2, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { useSettings } from '@/hooks/use-settings';
import { useTheme } from 'next-themes';
import { CURRENCIES, ALERT_TIMING_OPTIONS } from '@/lib/constants';
import { exportJSON, importJSON, exportCSV, importCSV, downloadFile } from '@/lib/export-import';
import { createPinVerification, verifyPin } from '@/lib/encryption';
import { useStore } from '@/lib/store';
import { db } from '@/lib/db';
import type { AlertTiming } from '@/types';

export default function SettingsPage() {
  const { settings, updateSettings } = useSettings();
  const { theme, setTheme } = useTheme();
  const setEncryptionKey = useStore((s) => s.setEncryptionKey);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importType, setImportType] = useState<'json' | 'csv'>('json');
  const [pinInput, setPinInput] = useState('');

  const handleExportJSON = async () => {
    const json = await exportJSON();
    const date = new Date().toISOString().split('T')[0];
    downloadFile(json, `subtracker-backup-${date}.json`, 'application/json');
    toast.success('JSON backup exported');
  };

  const handleExportCSV = async () => {
    const csv = await exportCSV();
    const date = new Date().toISOString().split('T')[0];
    downloadFile(csv, `subtracker-export-${date}.csv`, 'text/csv');
    toast.success('CSV exported');
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const result = importType === 'json' ? await importJSON(text) : await importCSV(text);

    if (result.success) {
      toast.success(
        `Imported ${result.subscriptionsImported} subscriptions` +
        (result.membersImported ? `, ${result.membersImported} members` : '') +
        (result.errors.length ? ` (${result.errors.length} warnings)` : '')
      );
    } else {
      toast.error(`Import failed: ${result.errors.join(', ')}`);
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSetPin = async () => {
    if (pinInput.length < 4) {
      toast.error('PIN must be at least 4 digits');
      return;
    }
    const verification = await createPinVerification(pinInput);
    await updateSettings(verification);
    setPinInput('');

    toast.success('PIN set successfully');
  };

  const handleRemovePin = async () => {
    if (!settings.pinVerifyHash || !settings.pinVerifySalt) return;
    const isValid = await verifyPin(pinInput, settings.pinVerifyHash, settings.pinVerifySalt);
    if (!isValid) {
      toast.error('Incorrect PIN');
      return;
    }
    await updateSettings({
      pinVerifyHash: undefined,
      pinVerifySalt: undefined,
      pinEncryptSalt: undefined,
    });
    setEncryptionKey(null);
    setPinInput('');

    toast.success('PIN removed');
  };

  const handleResetAll = async () => {
    await db.subscriptions.clear();
    await db.householdMembers.clear();
    await db.categories.clear();
    await db.settings.clear();
    await db.alertRecords.clear();
    setEncryptionKey(null);
    window.location.reload();
  };

  const toggleAlertDay = async (day: AlertTiming) => {
    const current = settings.defaultAlertDays;
    const updated = current.includes(day)
      ? current.filter((d) => d !== day)
      : [...current, day].sort((a, b) => b - a);
    await updateSettings({ defaultAlertDays: updated });
  };

  const hasPin = !!settings.pinVerifyHash;

  return (
    <>
      <Header title="Settings" />

      <div className="space-y-6 max-w-2xl">
        {/* General */}
        <Card>
          <CardHeader><CardTitle className="text-sm">General</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Currency</Label>
              <Select value={settings.defaultCurrency} onValueChange={(v) => updateSettings({ defaultCurrency: v })}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label>Theme</Label>
              <Select value={theme ?? 'system'} onValueChange={setTheme}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card>
          <CardHeader><CardTitle className="text-sm">Default Alert Timing</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              New subscriptions will use these alert timings by default.
            </p>
            <div className="flex flex-wrap gap-2">
              {ALERT_TIMING_OPTIONS.map((opt) => (
                <Badge
                  key={opt.value}
                  variant={settings.defaultAlertDays.includes(opt.value) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => toggleAlertDay(opt.value)}
                >
                  {opt.label}
                </Badge>
              ))}
            </div>
            <Separator className="my-4" />
            <div className="flex items-center justify-between">
              <div>
                <Label>Escalation Threshold</Label>
                <p className="text-xs text-muted-foreground">
                  Subs above this monthly cost get an extra 30-day alert
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">$</span>
                <Input
                  type="number"
                  value={settings.escalationThreshold}
                  onChange={(e) => updateSettings({ escalationThreshold: parseFloat(e.target.value) || 50 })}
                  className="w-20"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <CardTitle className="text-sm">Security</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Set a PIN to encrypt sensitive notes on your subscriptions.
            </p>
            {hasPin ? (
              <div className="space-y-3">
                <Badge variant="default">PIN is set</Badge>
                <div className="flex items-center gap-2">
                  <Input
                    type="password"
                    placeholder="Enter current PIN to remove"
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    className="max-w-xs"
                  />
                  <Button variant="destructive" onClick={handleRemovePin}>Remove PIN</Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Input
                  type="password"
                  placeholder="Set a PIN (4+ digits)"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  className="max-w-xs"
                />
                <Button onClick={handleSetPin}>Set PIN</Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader><CardTitle className="text-sm">Data Management</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button variant="outline" onClick={handleExportJSON}>
                <Download className="h-4 w-4 mr-2" />
                Export JSON (Full Backup)
              </Button>
              <Button variant="outline" onClick={handleExportCSV}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>

            <Separator />

            <div>
              <Label className="mb-2 block">Import Data</Label>
              <div className="flex items-center gap-3">
                <Select value={importType} onValueChange={(v) => setImportType(v as 'json' | 'csv')}>
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="h-4 w-4 mr-2" />
                  Choose File
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={importType === 'json' ? '.json' : '.csv'}
                  onChange={handleImport}
                  className="hidden"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                JSON import replaces all existing data. CSV import adds to existing subscriptions.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-sm text-destructive">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Reset All Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all your subscriptions, household members, categories, and settings.
                    This action cannot be undone. Export your data first if you want a backup.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleResetAll} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Yes, delete everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
