'use client'

import { useMemo, useState } from 'react'

import { CreditCard, Crown, Landmark, Wallet as WalletIcon } from 'lucide-react'
import Link from 'next/link'

import { CREDIT_PACKAGES, CreditTransaction, useGetWalletQuery } from '@/entities/credit'
import { useBuyCredits } from '@/features/buy-credits'
import { CENTS_PER_CREDIT, centsFromCredits, creditsFromCents, formatCredits } from '@/shared/lib/credits'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/shared/ui/alert-dialog'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { Checkbox } from '@/shared/ui/checkbox'
import { Label } from '@/shared/ui/label'
import { Skeleton } from '@/shared/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'

type CreditPackage = (typeof CREDIT_PACKAGES)[number]

const creditPackages = CREDIT_PACKAGES

const SummaryCard = ({
    title,
    value,
    subtitle,
    icon: Icon,
}: {
    title: string
    value: string
    subtitle: string
    icon: typeof WalletIcon
}) => (
    <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-background px-4 py-3">
        <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
            </div>
            <div className="space-y-0.5">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{title}</p>
                <p className="text-sm text-muted-foreground">{subtitle}</p>
            </div>
        </div>
        <p className="text-lg font-semibold text-foreground">{value}</p>
    </div>
)

const TransactionRow = ({ transaction }: { transaction: CreditTransaction }) => {
    const amount = (transaction.amountCents / 100).toFixed(2)
    const typeLabel =
        transaction.type === 'PURCHASE' ? 'Purchase' : transaction.type === 'SPEND' ? 'Spend' : 'Adjustment'
    const badgeVariant = transaction.status === 'SUCCESSFUL' ? 'default' : 'outline'
    const statusLabel = transaction.status.toLowerCase().replace('_', ' ')

    return (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/70 bg-background p-4">
            <div className="space-y-1">
                <p className="font-semibold">{transaction.description ?? 'Credit transaction'}</p>
                <p className="text-xs text-muted-foreground">
                    {new Date(transaction.createdAt).toLocaleDateString()} • {typeLabel}
                </p>
            </div>
            <div className="flex items-center gap-3">
                <div className="text-right">
                    <p className="text-sm font-semibold">{formatCredits(transaction.credits)}</p>
                    <p className="text-xs text-muted-foreground">
                        {amount} {transaction.currency}
                    </p>
                </div>
                <Badge variant={badgeVariant}>{statusLabel}</Badge>
            </div>
        </div>
    )
}

export const WalletPage = () => {
    const { data, isLoading } = useGetWalletQuery()
    const {
        isConsentOpen,
        consentChecked,
        setConsentChecked,
        requestConsent,
        closeConsent,
        confirmConsent,
        isLoading: isPurchasing,
    } = useBuyCredits()

    const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(null)

    const wallet = data?.wallet
    const transactions = data?.transactions ?? []

    const balanceValue = wallet ? (wallet.balance * CENTS_PER_CREDIT) / 100 : 0

    const filteredTransactions = useMemo(() => {
        return {
            all: transactions,
            purchased: transactions.filter((transaction) => transaction.type === 'PURCHASE'),
            spent: transactions.filter((transaction) => transaction.type === 'SPEND'),
        }
    }, [transactions])

    const handlePurchaseConfirm = async () => {
        if (!selectedPackage) return
        await confirmConsent()
        setSelectedPackage(null)
    }

    return (
        <div className="mx-auto w-full space-y-6">
            <section className="rounded-3xl border border-border/70 bg-background p-4 sm:p-5">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                        <Badge className="w-fit rounded-full border border-border px-3 py-1 text-xs uppercase tracking-[0.2em]">
                            Wallet
                        </Badge>
                        <h1 className="text-3xl font-semibold text-foreground">Credits overview</h1>
                        <p className="text-sm text-muted-foreground">
                            Track your credits and keep your balance ready for gifts.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <span className="rounded-full bg-muted/60 px-3 py-1">
                            1 credit = {(CENTS_PER_CREDIT / 100).toFixed(2)} EUR
                        </span>
                        <span className="rounded-full bg-muted/60 px-3 py-1">Secure checkout</span>
                        <span className="rounded-full bg-muted/60 px-3 py-1">Instant balance</span>
                    </div>
                </div>

                <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1.4fr]">
                    <div className="space-y-2">
                        {isLoading ? (
                            Array.from({ length: 4 }).map((_, index) => (
                                <Card key={index} className="border-border/70">
                                    <CardContent className="p-4">
                                        <Skeleton className="h-12 w-full" />
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <>
                                <SummaryCard
                                    icon={WalletIcon}
                                    subtitle="Ready to spend"
                                    title="Balance"
                                    value={wallet ? formatCredits(wallet.balance) : '0 credits'}
                                />
                                <SummaryCard
                                    icon={CreditCard}
                                    subtitle="All-time purchases"
                                    title="Purchased"
                                    value={wallet ? formatCredits(wallet.totalPurchased) : '0 credits'}
                                />
                                <SummaryCard
                                    icon={Crown}
                                    subtitle="Used on gifts"
                                    title="Spent"
                                    value={wallet ? formatCredits(wallet.totalSpent) : '0 credits'}
                                />
                                <SummaryCard
                                    icon={Landmark}
                                    subtitle="Value in EUR"
                                    title="Balance value"
                                    value={`${balanceValue.toFixed(2)} EUR`}
                                />
                            </>
                        )}
                    </div>

                    <div className="rounded-2xl border border-border/70 bg-background p-4">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                                <h2 className="text-xl font-semibold text-foreground">Buy credits</h2>
                                <p className="text-sm text-muted-foreground">
                                    1 credit = 0.10 EUR. Pick a pack and checkout securely.
                                </p>
                            </div>
                            <Badge className="text-xs uppercase tracking-[0.2em]" variant="outline">
                                {creditPackages.length} packs
                            </Badge>
                        </div>
                        <div className="mt-3 space-y-2">
                            {creditPackages.map((pack) => {
                                const amountCents = centsFromCredits(pack.credits)
                                const priceLabel = (amountCents / 100).toFixed(2)
                                return (
                                    <div
                                        key={pack.id}
                                        className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/70 px-3 py-3"
                                    >
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <p className="text-lg font-semibold text-foreground">
                                                    {pack.label}
                                                </p>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {formatCredits(pack.credits)}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="text-right">
                                                <p className="text-lg font-semibold">{priceLabel} EUR</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {creditsFromCents(amountCents)} credits included
                                                </p>
                                            </div>
                                            <Button
                                                disabled={isPurchasing}
                                                onClick={() => {
                                                    setSelectedPackage(pack)
                                                    requestConsent(pack.credits)
                                                }}
                                            >
                                                Buy credits
                                            </Button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </section>

            <section className="rounded-3xl border border-border/70 bg-background p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                        <h2 className="text-xl font-semibold text-foreground">Transaction history</h2>
                        <p className="text-sm text-muted-foreground">
                            Review credit purchases and balance updates.
                        </p>
                    </div>
                    <Badge className="text-xs uppercase tracking-[0.2em]" variant="outline">
                        {transactions.length} items
                    </Badge>
                </div>
                <div className="mt-4">
                    {isLoading ? (
                        <div className="space-y-3">
                            {Array.from({ length: 3 }).map((_, index) => (
                                <Skeleton key={index} className="h-16 w-full" />
                            ))}
                        </div>
                    ) : (
                        <Tabs className="space-y-3" defaultValue="all">
                            <TabsList className="w-full rounded-2xl border border-border p-1">
                                <TabsTrigger value="all">All</TabsTrigger>
                                <TabsTrigger value="purchased">Purchased</TabsTrigger>
                                <TabsTrigger value="spent">Spent</TabsTrigger>
                            </TabsList>
                            <div className="space-y-2">
                                <TabsContent className="space-y-3" value="all">
                                    {filteredTransactions.all.length === 0 ? (
                                        <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                                            No transactions yet.
                                        </div>
                                    ) : (
                                        filteredTransactions.all.map((transaction) => (
                                            <TransactionRow key={transaction.id} transaction={transaction} />
                                        ))
                                    )}
                                </TabsContent>
                                <TabsContent className="space-y-3" value="purchased">
                                    {filteredTransactions.purchased.length === 0 ? (
                                        <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                                            No purchases yet.
                                        </div>
                                    ) : (
                                        filteredTransactions.purchased.map((transaction) => (
                                            <TransactionRow key={transaction.id} transaction={transaction} />
                                        ))
                                    )}
                                </TabsContent>
                                <TabsContent className="space-y-3" value="spent">
                                    {filteredTransactions.spent.length === 0 ? (
                                        <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                                            No credits spent yet.
                                        </div>
                                    ) : (
                                        filteredTransactions.spent.map((transaction) => (
                                            <TransactionRow key={transaction.id} transaction={transaction} />
                                        ))
                                    )}
                                </TabsContent>
                            </div>
                        </Tabs>
                    )}
                </div>
            </section>

            <AlertDialog
                open={isConsentOpen && Boolean(selectedPackage)}
                onOpenChange={(open) => {
                    if (!open) {
                        closeConsent()
                        setSelectedPackage(null)
                    }
                }}
            >
                <AlertDialogContent className="max-w-xl w-full">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm credit purchase</AlertDialogTitle>
                        <AlertDialogDescription>
                            {selectedPackage
                                ? `Buy ${formatCredits(selectedPackage.credits)} for ${(
                                      centsFromCredits(selectedPackage.credits) / 100
                                  ).toFixed(2)} EUR?`
                                : 'Confirm credit purchase.'}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-3">
                        <div className="flex items-start gap-3">
                            <Checkbox
                                checked={consentChecked}
                                disabled={isPurchasing}
                                id="credit-consent"
                                onCheckedChange={(value) => setConsentChecked(Boolean(value))}
                            />
                            <Label className="text-sm leading-5 text-muted-foreground" htmlFor="credit-consent">
                                I agree to the{' '}
                                <span className="whitespace-nowrap">
                                    <Link
                                        className="underline underline-offset-2 hover:text-primary"
                                        href="/terms-of-service"
                                    >
                                        Terms of Service
                                    </Link>
                                    ,
                                </span>{' '}
                                <span className="whitespace-nowrap">
                                    <Link
                                        className="underline underline-offset-2 hover:text-primary"
                                        href="/privacy-policy"
                                    >
                                        Privacy Policy
                                    </Link>
                                    ,
                                </span>{' '}
                                <span className="whitespace-nowrap">
                                    and{' '}
                                    <Link
                                        className="underline underline-offset-2 hover:text-primary"
                                        href="/return-policy"
                                    >
                                        Return Policy
                                    </Link>
                                    .
                                </span>
                            </Label>
                        </div>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPurchasing}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            disabled={isPurchasing || !consentChecked}
                            onClick={handlePurchaseConfirm}
                        >
                            Continue to payment
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
