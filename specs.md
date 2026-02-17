I want to build a subscription tracker

I kept getting hit with renewal charges for stuff I forgot I was paying for,
so I want a dashboard that puts all your subscriptions in one place.

You add everything manually (no bank linking, no permissions needed) and it shows you:
What you pay monthly and yearly
Breakdown by category
When things renew with alerts before you get charged
Household view so you can track what family members use

Core features you already have (keep them)

Manual subscription entry

Monthly + yearly totals

Category breakdown

Renewal calendar + alerts before charge

Household view (per person / shared)

Now: the upgrades that actually prevent pain.

1) Anti-surprise charge controls
Renewal intelligence

Billing cycle types beyond monthly/yearly: weekly, quarterly, biannual, every X months, “trial then paid”

Intro pricing support: “$0 for 7 days then $12.99/mo” or “$4.99 for 3 months then $9.99”

Auto-renew toggle with a “cancellation needed?” flag

Alert system that doesn’t suck

Configurable alert rules per sub:

14/7/3/1 days before

Same-day charge alert

“Snooze” alerts (7 days, 30 days)

Escalation option: if it’s expensive, alert earlier

2) True cost clarity (this is where people get fooled)
“Effective monthly cost”

For annual subs, show:

Annual price

Equivalent monthly (“$120/yr = $10/mo”)
This alone exposes the sneaky spend.

Price history + change detection

Track price changes over time (manual log)

Mark “price increased” and show delta vs last cycle

Taxes / add-ons

Let a sub include:

tax estimate (optional)

add-ons (extra seats, storage, premium tiers)

3) Household + sharing reality
Seats and sharing

“Who uses this?” per subscription (multiple people)

Seat count + cost per seat (useful for family plans)

“Shared” vs “Individual” tagging

Owner vs payer

In households this matters:

Payer: who’s card gets hit

Owner: whose account it is

Manager: who can cancel / login info stored?

4) Cancellation workflow (the part everyone hates)

This is a big one: if you make cancellation frictionless to track, you’ll save money.

Per subscription:

Cancel URL (or “how to cancel” notes)

Contact method (phone/chat/email)

Cancellation deadline (“must cancel 24h before renewal”)

Status: Active / Cancelled / Paused / On hold / Trial

Optional but powerful:

“Cancellation checklist” (export data, download photos, transfer emails, etc.)

Confirmation proof storage (upload screenshot or paste email reference)

5) “Do I still want this?” decision helpers
Usage + value scoring (manual, no tracking needed)

Add lightweight fields:

“Used in last 7/30/90 days?” (checkbox/dropdown)

Value score: 1–5

“Would I miss it?” yes/no

Then surface:

Low-use + high-cost subscriptions

“Subscriptions not used in 60 days”

“Top 5 spends that deliver least value”

This turns it from a list into a money coach.

6) Categories that don’t annoy you

Prebuilt categories + custom:

Streaming, Music, Gaming, Cloud Storage, Software, News, Fitness, Home, Security, Kids, Work, Other

Nice upgrade:

Tags (“entertainment”, “work”, “health”, “kid stuff”)

Multi-category allowed (or just tags so you don’t fight the taxonomy)

7) Calendar + cashflow view

Renewal calendar (month view)

Next 30/60/90 days expected charges

“Big hit month” warning (“March has $212 of renewals scheduled”)

If you want to get fancy:

“Payday alignment” view (charges between paychecks)

8) Data portability and backups (non-negotiable)

Because if you rebuild your PC or switch phones, you’ll be mad.

Export/Import CSV + JSON

Automatic local backups (if desktop) or cloud sync (optional)

Print-friendly summary

9) Security and “household sharing” safety

Since you might store notes like login URLs:

“Sensitive notes” field that can be hidden behind a PIN/biometric

Role-based access in household:

Admin can see everything

Family members can only see their own subs (or only shared)

10) Smart “cleanup” features

Detect duplicates (you accidentally entered Netflix twice)

“Similar subscriptions” warnings (three streaming services, one household)

“Bundle suggestion” notes (you manually mark: “this comes with Verizon”)

11) Optional nice-to-haves (don’t lead with these)

Receipt upload (PDF/image)

Vendor logo + link

Multi-currency (if you ever get billed in CAD/EUR)

“Subscription inventory” by device (what services are on what TV/console)

A solid MVP vs “Phase 2”
MVP (ship fast, immediately useful)

Manual entry

Monthly + yearly totals (effective monthly included)

Categories + tags

Renewal dates + alert rules

Household: payer + users + shared flag

Export/Import

Phase 2 (makes it feel premium)

Trials/intro pricing

Cancellation workflow + proof

Usage/value scoring + recommendations

Price history + increase alerts

Cashflow forecast calendar

Common traps to avoid (these bite hard)

Time zones / charge day drift: subscriptions sometimes charge a day early depending on vendor/time zone. Your alerts should account for that (alert at least 2–3 days out by default).

Annual renewals hidden in “monthly” totals: always show effective monthly cost.

Ambiguous renewal date: some renew on “last day of month” or “next business day”. Let users pick rules or add a note.