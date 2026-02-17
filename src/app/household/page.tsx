'use client';

import { useState, useRef } from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, User, X, Camera } from 'lucide-react';
import { useHousehold } from '@/hooks/use-household';
import { useSubscriptions } from '@/hooks/use-subscriptions';
import { useSettings } from '@/hooks/use-settings';
import { getCurrentEffectiveMonthly, formatCurrency } from '@/lib/calculations';
import { AVATAR_COLORS } from '@/lib/constants';
import type { HouseholdRole } from '@/types';

export default function HouseholdPage() {
  const { members, addMember, updateMember, deleteMember } = useHousehold();
  const { subscriptions } = useSubscriptions();
  const { settings } = useSettings();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<HouseholdRole>('member');
  const [newAvatarUrl, setNewAvatarUrl] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const editAvatarRef = useRef<HTMLInputElement>(null);

  const handleEditAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedMemberId) return;
    if (file.size > 512 * 1024) {
      alert('Image must be under 512KB');
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      await updateMember(selectedMemberId, { avatarUrl: reader.result as string });
    };
    reader.readAsDataURL(file);
    if (editAvatarRef.current) editAvatarRef.current.value = '';
  };

  const handleRemoveAvatar = async () => {
    if (!selectedMemberId) return;
    await updateMember(selectedMemberId, { avatarUrl: undefined });
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 512 * 1024) {
      alert('Image must be under 512KB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setNewAvatarUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleAdd = async () => {
    if (!newName.trim()) return;
    const color = AVATAR_COLORS[members.length % AVATAR_COLORS.length];
    await addMember({
      name: newName.trim(),
      role: newRole,
      avatarColor: color,
      avatarUrl: newAvatarUrl || undefined,
    });
    setNewName('');
    setNewRole('member');
    setNewAvatarUrl('');
    setDialogOpen(false);
  };

  const getMemberCost = (memberId: string) => {
    return subscriptions
      .filter((s) => (s.status === 'active' || s.status === 'trial') && s.payerId === memberId)
      .reduce((sum, s) => sum + getCurrentEffectiveMonthly(s), 0);
  };

  const getMemberSubs = (memberId: string) => {
    return subscriptions.filter(
      (s) => s.userIds.includes(memberId) || s.payerId === memberId || s.ownerId === memberId
    );
  };

  const selectedMember = members.find((m) => m.id === selectedMemberId);
  const selectedMemberSubs = selectedMemberId ? getMemberSubs(selectedMemberId) : [];

  return (
    <>
      <Header title="Household" description={`${members.length} member${members.length !== 1 ? 's' : ''}`} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Member List */}
        <div className="lg:col-span-1 space-y-4">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Household Member</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="flex flex-col items-center gap-3">
                  <Label>Profile Picture (optional)</Label>
                  {newAvatarUrl ? (
                    <div className="relative">
                      <img src={newAvatarUrl} alt="" className="w-16 h-16 rounded-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setNewAvatarUrl('')}
                        className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                      <User className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="max-w-[200px]"
                  />
                </div>
                <div>
                  <Label>Name</Label>
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Name"
                    onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                  />
                </div>
                <div>
                  <Label>Role</Label>
                  <Select value={newRole} onValueChange={(v) => setNewRole(v as HouseholdRole)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="member">Member</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAdd} className="w-full">Add</Button>
              </div>
            </DialogContent>
          </Dialog>

          {members.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Add household members to track who uses what
            </div>
          ) : (
            <div className="space-y-2">
              {members.map((member) => {
                const cost = getMemberCost(member.id);
                const isSelected = selectedMemberId === member.id;
                return (
                  <Card
                    key={member.id}
                    className={`cursor-pointer transition-colors ${isSelected ? 'ring-1 ring-primary' : ''}`}
                    onClick={() => setSelectedMemberId(isSelected ? null : member.id)}
                  >
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {member.avatarUrl ? (
                            <img src={member.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
                          ) : (
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                              style={{ backgroundColor: member.avatarColor }}
                            >
                              {member.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-sm">{member.name}</div>
                            <Badge variant="outline" className="text-xs">{member.role}</Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {formatCurrency(cost, settings.defaultCurrency)}/mo
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`Remove ${member.name}?`)) deleteMember(member.id);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Member Detail */}
        <div className="lg:col-span-2">
          {selectedMember ? (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="relative group">
                    <button
                      type="button"
                      onClick={() => editAvatarRef.current?.click()}
                      className="relative rounded-full overflow-hidden"
                    >
                      {selectedMember.avatarUrl ? (
                        <img src={selectedMember.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg font-bold"
                          style={{ backgroundColor: selectedMember.avatarColor }}
                        >
                          {selectedMember.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                        <Camera className="h-4 w-4 text-white" />
                      </div>
                    </button>
                    {selectedMember.avatarUrl && (
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                  <input
                    ref={editAvatarRef}
                    type="file"
                    accept="image/*"
                    onChange={handleEditAvatar}
                    className="hidden"
                  />
                  <CardTitle>{selectedMember.name}&apos;s Subscriptions</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {selectedMemberSubs.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No subscriptions linked to this member</p>
                ) : (
                  <div className="space-y-3">
                    {selectedMemberSubs.map((sub) => (
                      <div key={sub.id} className="flex items-center justify-between text-sm border-b pb-2">
                        <div>
                          <span className="font-medium">{sub.name}</span>
                          <div className="text-xs text-muted-foreground">
                            {sub.payerId === selectedMember.id && <Badge variant="outline" className="mr-1">Payer</Badge>}
                            {sub.ownerId === selectedMember.id && <Badge variant="outline" className="mr-1">Owner</Badge>}
                            {sub.userIds.includes(selectedMember.id) && <Badge variant="outline">User</Badge>}
                          </div>
                        </div>
                        <span className="font-medium">
                          {formatCurrency(getCurrentEffectiveMonthly(sub), sub.currency)}/mo
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              <div className="text-center">
                <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a member to see their subscriptions</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
