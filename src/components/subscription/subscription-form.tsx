'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, X } from 'lucide-react';

import type {
  Subscription,
  Category,
  HouseholdMember,
  BillingCycle,
  SubStatus,
  AlertTiming,
  RenewalDayRule,
} from '@/types';

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

import {
  BILLING_CYCLE_LABELS,
  ALERT_TIMING_OPTIONS,
  STATUS_LABELS,
} from '@/lib/constants';

// ---------- Zod schema ----------

const subscriptionFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  logoUrl: z.string().optional(),
  categoryId: z.string().min(1, 'Category is required'),
  tags: z.array(z.string()),

  billingCycle: z.enum([
    'weekly',
    'monthly',
    'quarterly',
    'biannual',
    'annual',
    'custom',
  ] as const),
  customCycleDays: z.number().int().positive().optional(),
  amount: z.number().min(0, 'Amount must be 0 or more'),
  currency: z.string(),
  taxAmount: z.number().min(0).optional(),

  hasIntroPricing: z.boolean(),
  introPrice: z.number().min(0).optional(),
  introDurationDays: z.number().int().positive().optional(),
  introEndDate: z.string().optional(),

  startDate: z.string().min(1, 'Start date is required'),
  nextRenewalDate: z.string().min(1, 'Next renewal date is required'),
  renewalDayRule: z.enum([
    'exact',
    'lastDayOfMonth',
    'nextBusinessDay',
  ] as const),

  status: z.enum([
    'active',
    'trial',
    'paused',
    'on_hold',
    'cancelled',
  ] as const),
  autoRenew: z.boolean(),
  cancellationNeeded: z.boolean(),

  alertDaysBefore: z.array(
    z.union([
      z.literal(1),
      z.literal(3),
      z.literal(7),
      z.literal(14),
      z.literal(30),
    ])
  ),

  payerId: z.string().min(1, 'Payer is required'),
  ownerId: z.string().min(1, 'Owner is required'),
  managerId: z.string().optional(),
  userIds: z.array(z.string()),
  isShared: z.boolean(),
  seatCount: z.number().int().positive().optional(),
  costPerSeat: z.number().min(0).optional(),

  addOns: z.array(z.any()),
  priceHistory: z.array(z.any()),

  notes: z.string().optional(),
  sensitiveNotes: z.string().optional(),
});

type SubscriptionFormValues = z.infer<typeof subscriptionFormSchema>;

// ---------- Props ----------

interface SubscriptionFormProps {
  initialData?: Subscription;
  onSubmit: (
    data: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<void>;
  categories: Category[];
  members: HouseholdMember[];
}

// ---------- Component ----------

export function SubscriptionForm({
  initialData,
  onSubmit,
  categories,
  members,
}: SubscriptionFormProps) {
  const router = useRouter();
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!initialData;

  const form = useForm<SubscriptionFormValues>({
    resolver: zodResolver(subscriptionFormSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          logoUrl: initialData.logoUrl ?? '',
          categoryId: initialData.categoryId,
          tags: initialData.tags,
          billingCycle: initialData.billingCycle,
          customCycleDays: initialData.customCycleDays,
          amount: initialData.amount,
          currency: initialData.currency,
          taxAmount: initialData.taxAmount,
          hasIntroPricing: initialData.hasIntroPricing,
          introPrice: initialData.introPrice,
          introDurationDays: initialData.introDurationDays,
          introEndDate: initialData.introEndDate,
          startDate: initialData.startDate,
          nextRenewalDate: initialData.nextRenewalDate,
          renewalDayRule: initialData.renewalDayRule,
          status: initialData.status,
          autoRenew: initialData.autoRenew,
          cancellationNeeded: initialData.cancellationNeeded,
          alertDaysBefore: initialData.alertDaysBefore,
          payerId: initialData.payerId,
          ownerId: initialData.ownerId,
          managerId: initialData.managerId,
          userIds: initialData.userIds,
          isShared: initialData.isShared,
          seatCount: initialData.seatCount,
          costPerSeat: initialData.costPerSeat,
          addOns: initialData.addOns,
          priceHistory: initialData.priceHistory,
          notes: initialData.notes ?? '',
          sensitiveNotes: initialData.sensitiveNotes ?? '',
        }
      : {
          name: '',
          categoryId: categories[0]?.id ?? '',
          tags: [],
          billingCycle: 'monthly' as BillingCycle,
          amount: 0,
          currency: 'USD',
          hasIntroPricing: false,
          startDate: new Date().toISOString().split('T')[0],
          nextRenewalDate: new Date().toISOString().split('T')[0],
          renewalDayRule: 'exact' as RenewalDayRule,
          status: 'active' as SubStatus,
          autoRenew: true,
          cancellationNeeded: false,
          alertDaysBefore: [7, 3, 1] as AlertTiming[],
          payerId: members[0]?.id ?? '',
          ownerId: members[0]?.id ?? '',
          userIds: [],
          isShared: false,
          addOns: [],
          priceHistory: [],
          notes: '',
        },
  });

  const billingCycle = form.watch('billingCycle');
  const hasIntroPricing = form.watch('hasIntroPricing');
  const tags = form.watch('tags');
  const alertDaysBefore = form.watch('alertDaysBefore');

  function handleAddTag(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      const value = tagInput.trim();
      if (value && !tags.includes(value)) {
        form.setValue('tags', [...tags, value]);
      }
      setTagInput('');
    }
  }

  function handleRemoveTag(tag: string) {
    form.setValue(
      'tags',
      tags.filter((t) => t !== tag)
    );
  }

  function toggleAlertDay(day: AlertTiming) {
    const current = form.getValues('alertDaysBefore');
    if (current.includes(day)) {
      form.setValue(
        'alertDaysBefore',
        current.filter((d) => d !== day)
      );
    } else {
      form.setValue('alertDaysBefore', [...current, day]);
    }
  }

  async function handleFormSubmit(values: SubscriptionFormValues) {
    setIsSubmitting(true);
    try {
      const cleaned = {
        ...values,
        managerId: values.managerId === 'none' ? undefined : values.managerId,
      };
      await onSubmit(cleaned as Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>);
      router.push('/subscriptions');
    } catch {
      // Error is handled by the parent
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="space-y-6"
      >
        {/* ====== Section 1: Basic Info ====== */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Netflix" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="logoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logo (optional)</FormLabel>
                  <div className="flex items-center gap-3">
                    {field.value && (
                      <div className="relative w-10 h-10 rounded-md overflow-hidden border bg-muted shrink-0">
                        <img
                          src={field.value}
                          alt="Logo"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}
                    <div className="flex-1 flex items-center gap-2">
                      <FormControl>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            if (file.size > 512 * 1024) {
                              alert('Image must be under 512KB');
                              return;
                            }
                            const reader = new FileReader();
                            reader.onload = () => {
                              field.onChange(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }}
                        />
                      </FormControl>
                      {field.value && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0"
                          onClick={() => field.onChange('')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tags */}
            <div className="space-y-2">
              <FormLabel>Tags</FormLabel>
              <div className="flex flex-wrap items-center gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 rounded-full hover:bg-muted-foreground/20"
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <Input
                placeholder="Type a tag and press Enter"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
              />
            </div>
          </CardContent>
        </Card>

        {/* ====== Section 2: Billing ====== */}
        <Card>
          <CardHeader>
            <CardTitle>Billing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="billingCycle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Billing Cycle</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select cycle" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(
                          Object.entries(BILLING_CYCLE_LABELS) as [
                            BillingCycle,
                            string,
                          ][]
                        ).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {billingCycle === 'custom' && (
                <FormField
                  control={form.control}
                  name="customCycleDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Custom Cycle (days)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          placeholder="e.g. 45"
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ''
                                ? undefined
                                : Number(e.target.value)
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ''
                              ? 0
                              : Number(e.target.value)
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (&euro;)</SelectItem>
                        <SelectItem value="GBP">GBP (&pound;)</SelectItem>
                        <SelectItem value="CAD">CAD (C$)</SelectItem>
                        <SelectItem value="AUD">AUD (A$)</SelectItem>
                        <SelectItem value="JPY">JPY (&yen;)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="taxAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tax (optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ''
                              ? undefined
                              : Number(e.target.value)
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* ====== Section 3: Intro Pricing ====== */}
        <Card>
          <CardHeader>
            <CardTitle>Intro Pricing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="hasIntroPricing"
              render={({ field }) => (
                <FormItem className="flex items-center gap-3">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="!mt-0">
                    Has intro / promotional pricing
                  </FormLabel>
                  <FormMessage />
                </FormItem>
              )}
            />

            {hasIntroPricing && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="introPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Intro Price</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ''
                                ? undefined
                                : Number(e.target.value)
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="introDurationDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (days)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          placeholder="e.g. 30"
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ''
                                ? undefined
                                : Number(e.target.value)
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="introEndDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* ====== Section 4: Dates & Renewal ====== */}
        <Card>
          <CardHeader>
            <CardTitle>Dates & Renewal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nextRenewalDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Next Renewal Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="renewalDayRule"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Renewal Day Rule</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select rule" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="exact">Exact day</SelectItem>
                        <SelectItem value="lastDayOfMonth">
                          Last day of month
                        </SelectItem>
                        <SelectItem value="nextBusinessDay">
                          Next business day
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* ====== Section 5: Status ====== */}
        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(
                          Object.entries(STATUS_LABELS) as [
                            SubStatus,
                            string,
                          ][]
                        ).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            <div className="flex flex-col gap-4 sm:flex-row sm:gap-8">
              <FormField
                control={form.control}
                name="autoRenew"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-3">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="!mt-0">Auto Renew</FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cancellationNeeded"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-3">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="!mt-0">
                      Cancellation Needed
                    </FormLabel>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* ====== Section 6: Alerts ====== */}
        <Card>
          <CardHeader>
            <CardTitle>Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Select how many days before renewal you want to be alerted.
            </p>
            <div className="flex flex-wrap gap-2">
              {ALERT_TIMING_OPTIONS.map((option) => {
                const isSelected = alertDaysBefore.includes(option.value);
                return (
                  <Badge
                    key={option.value}
                    variant={isSelected ? 'default' : 'outline'}
                    className="cursor-pointer select-none"
                    onClick={() => toggleAlertDay(option.value)}
                  >
                    {option.label}
                  </Badge>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* ====== Section 7: Household ====== */}
        <Card>
          <CardHeader>
            <CardTitle>Household</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="payerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payer</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select payer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {members.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ownerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Owner</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select owner" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {members.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="managerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Manager (optional)</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value ?? ''}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="None" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {members.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* User IDs - multi-select checkboxes */}
            <div className="space-y-2">
              <FormLabel>Users</FormLabel>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                {members.map((member) => (
                  <FormField
                    key={member.id}
                    control={form.control}
                    name="userIds"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(member.id)}
                            onCheckedChange={(checked) => {
                              const current = field.value ?? [];
                              if (checked) {
                                field.onChange([...current, member.id]);
                              } else {
                                field.onChange(
                                  current.filter(
                                    (id: string) => id !== member.id
                                  )
                                );
                              }
                            }}
                          />
                        </FormControl>
                        <FormLabel className="!mt-0 font-normal">
                          {member.name}
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </div>

            <Separator />

            <FormField
              control={form.control}
              name="isShared"
              render={({ field }) => (
                <FormItem className="flex items-center gap-3">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="!mt-0">
                    Shared subscription
                  </FormLabel>
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="seatCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Seat Count (optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        placeholder="e.g. 5"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ''
                              ? undefined
                              : Number(e.target.value)
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="costPerSeat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cost Per Seat (optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ''
                              ? undefined
                              : Number(e.target.value)
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* ====== Section 8: Notes ====== */}
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any notes about this subscription..."
                      rows={3}
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sensitiveNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sensitive Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Credentials, account details, etc."
                      rows={3}
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Protected by PIN
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* ====== Submit ====== */}
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting} className="min-w-[160px]">
            {isSubmitting ? (
              <span className="flex items-center gap-2">Saving...</span>
            ) : isEditing ? (
              'Save Changes'
            ) : (
              <span className="flex items-center gap-2">
                <Plus className="size-4" />
                Add Subscription
              </span>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
