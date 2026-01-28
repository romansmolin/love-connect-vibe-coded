'use client'

import { useMemo, useState } from 'react'

import { CreditCard, Crown, Landmark, Wallet as WalletIcon } from 'lucide-react'
import Link from 'next/link'

import { CreditTransaction } from '@/entities/credit'
import { useGetWalletQuery } from '@/entities/credit'
import { useBuyCredits } from '@/features/buy-credits'
import { CENTS_PER_CREDIT, centsFromCredits, creditsFromCents, formatCredits } from '@/shared/lib/credits'
import { cn } from '@/shared/lib/utils'
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Checkbox } from '@/shared/ui/checkbox'
import { Label } from '@/shared/ui/label'
import { Skeleton } from '@/shared/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'

type CreditPackage = {
    id: string
    credits: number
    label: string
    highlight?: string
}

const creditPackages: CreditPackage[] = [
    { id: 'starter', credits: 5, label: 'Starter pack' },
    { id: 'boost', credits: 25, label: 'Boost pack', highlight: 'Popular' },
    { id: 'pro', credits: 50, label: 'Pro pack', highlight: 'Best value' },
]

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
    <Card className="border-white/30 bg-white/90 text-foreground shadow-sm backdrop-blur">
        <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
            </div>
            <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{title}</p>
                <p className="text-2xl font-semibold text-primary">{value}</p>
                <p className="text-xs text-muted-foreground">{subtitle}</p>
            </div>
        </CardContent>
    </Card>
)

const TransactionRow = ({ transaction }: { transaction: CreditTransaction }) => {
    const amount = (transaction.amountCents / 100).toFixed(2)
    const isPurchase = transaction.type === 'PURCHASE'
    const badgeVariant = transaction.status === 'SUCCESSFUL' ? 'default' : 'outline'
    const statusLabel = transaction.status.toLowerCase().replace('_', ' ')

    return (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/60 bg-white/70 p-4">
            <div className="space-y-1">
                <p className="font-semibold">{transaction.description ?? 'Credit transaction'}</p>
                <p className="text-xs text-muted-foreground">
                    {new Date(transaction.createdAt).toLocaleDateString()} •{' '}
                    {isPurchase ? 'Purchase' : 'Adjustment'}
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
        <div className="mx-auto w-full max-w-6xl space-y-6">
            <section className="rounded-3xl bg-gradient-to-br from-rose-500 via-pink-500 to-purple-600 px-6 py-10 text-white shadow-lg">
                <div className="text-center">
                    <h1 className="text-3xl font-semibold text-white">Wallet</h1>
                    <p className="mt-2 text-sm text-white/80">
                        Track your credits and keep your balance ready for gifts.
                    </p>
                </div>
                <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {isLoading ? (
                        Array.from({ length: 4 }).map((_, index) => (
                            <Card key={index} className="border-white/30 bg-white/80 p-4">
                                <Skeleton className="h-16 w-full" />
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
                                subtitle={`1 credit = ${(CENTS_PER_CREDIT / 100).toFixed(2)} EUR`}
                                title="Value"
                                value={`${balanceValue.toFixed(2)} EUR`}
                            />
                        </>
                    )}
                </div>
            </section>

            <Card className="border-primary/10">
                <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <CardTitle className="text-xl">Buy credits</CardTitle>
                        <CardDescription>
                            0.10 EUR equals 5 credits. Pick a pack and checkout securely.
                        </CardDescription>
                    </div>
                    <Badge className="text-xs uppercase tracking-[0.2em]" variant="outline">
                        {creditPackages.length} packs
                    </Badge>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                        {creditPackages.map((pack) => {
                            const amountCents = centsFromCredits(pack.credits)
                            const priceLabel = (amountCents / 100).toFixed(2)
                            return (
                                <Card
                                    key={pack.id}
                                    className={cn(
                                        'border-primary/10 bg-white/80 transition hover:border-primary/40',
                                        pack.highlight && 'ring-1 ring-primary/30'
                                    )}
                                >
                                    <CardContent className="flex h-full flex-col gap-4 p-5">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="text-lg font-semibold">{pack.label}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {formatCredits(pack.credits)}
                                                </p>
                                            </div>
                                            {pack.highlight && (
                                                <Badge className="bg-primary text-primary-foreground">
                                                    {pack.highlight}
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="rounded-xl bg-primary/5 p-4">
                                            <p className="text-2xl font-semibold">{priceLabel} EUR</p>
                                            <p className="text-xs text-muted-foreground">
                                                {creditsFromCents(amountCents)} credits included
                                            </p>
                                        </div>
                                        <Button
                                            className="mt-auto w-full"
                                            disabled={isPurchasing}
                                            onClick={() => {
                                                setSelectedPackage(pack)
                                                requestConsent(pack.credits)
                                            }}
                                        >
                                            Buy credits
                                        </Button>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>

            <Card className="border-primary/10">
                <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <CardTitle className="text-xl">Transaction history</CardTitle>
                        <CardDescription>Review credit purchases and balance updates.</CardDescription>
                    </div>
                    <Badge className="text-xs uppercase tracking-[0.2em]" variant="outline">
                        {transactions.length} items
                    </Badge>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-3">
                            {Array.from({ length: 3 }).map((_, index) => (
                                <Skeleton key={index} className="h-16 w-full" />
                            ))}
                        </div>
                    ) : (
                        <Tabs defaultValue="all">
                            <TabsList className="w-full">
                                <TabsTrigger value="all">All</TabsTrigger>
                                <TabsTrigger value="purchased">Purchased</TabsTrigger>
                                <TabsTrigger value="spent">Spent</TabsTrigger>
                            </TabsList>
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
                        </Tabs>
                    )}
                </CardContent>
            </Card>

            <AlertDialog
                open={isConsentOpen && Boolean(selectedPackage)}
                onOpenChange={(open) => {
                    if (!open) {
                        closeConsent()
                        setSelectedPackage(null)
                    }
                }}
            >
                <AlertDialogContent>
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
                        <div className="flex items-start gap-2">
                            <Checkbox
                                checked={consentChecked}
                                disabled={isPurchasing}
                                id="credit-consent"
                                onCheckedChange={(value) => setConsentChecked(Boolean(value))}
                            />
                            <Label
                                className="text-sm leading-relaxed text-muted-foreground"
                                htmlFor="credit-consent"
                            >
                                I agree to the{' '}
                                <Link className="underline hover:text-primary" href="/terms-of-service">
                                    Terms of Service
                                </Link>
                                ,{' '}
                                <Link className="underline hover:text-primary" href="/privacy-policy">
                                    Privacy Policy
                                </Link>
                                , and{' '}
                                <Link className="underline hover:text-primary" href="/return-policy">
                                    Return Policy
                                </Link>
                                .
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
