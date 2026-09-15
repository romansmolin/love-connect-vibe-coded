'use client'

import { useMemo, useState } from 'react'

import { CreditCard, Crown, Landmark, Wallet as WalletIcon } from 'lucide-react'
import Link from 'next/link'

import {
    CREDIT_PACKAGES,
    CreditTransaction,
    MAX_CUSTOM_CREDITS,
    MIN_CUSTOM_CREDITS,
    useGetWalletQuery,
} from '@/entities/credit'
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Checkbox } from '@/shared/ui/checkbox'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Separator } from '@/shared/ui/separator'
import { Skeleton } from '@/shared/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'

type SelectedAmount = { credits: number; label: string }

const creditPackages = CREDIT_PACKAGES

const StatRow = ({
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
    <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground">{title}</p>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
        <p className="shrink-0 text-lg font-semibold text-foreground">{value}</p>
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
                <p className="font-semibold">{transaction.description ?? typeLabel}</p>
                <p className="text-xs text-muted-foreground">
                    {typeLabel} on {new Date(transaction.createdAt).toLocaleDateString()}
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

    const [selectedPackage, setSelectedPackage] = useState<SelectedAmount | null>(null)
    const [customAmount, setCustomAmount] = useState('')

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

    const customCredits = Number(customAmount)
    const isCustomAmountValid =
        customAmount.length > 0 &&
        Number.isInteger(customCredits) &&
        customCredits >= MIN_CUSTOM_CREDITS &&
        customCredits <= MAX_CUSTOM_CREDITS

    const handlePurchaseConfirm = async () => {
        if (!selectedPackage) return
        await confirmConsent()
        setSelectedPackage(null)
        setCustomAmount('')
    }

    return (
        <div className="mx-auto w-full max-w-2xl space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-foreground">Wallet</h1>
                <p className="text-sm text-muted-foreground">
                    1 credit = {(CENTS_PER_CREDIT / 100).toFixed(2)} EUR. Use credits to buy and send gifts.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Balance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {isLoading ? (
                        <div className="space-y-4">
                            {Array.from({ length: 4 }).map((_, index) => (
                                <Skeleton key={index} className="h-10 w-full" />
                            ))}
                        </div>
                    ) : (
                        <>
                            <StatRow
                                icon={WalletIcon}
                                subtitle="Ready to spend"
                                title="Balance"
                                value={wallet ? formatCredits(wallet.balance) : '0 credits'}
                            />
                            <Separator />
                            <StatRow
                                icon={CreditCard}
                                subtitle="All-time purchases"
                                title="Purchased"
                                value={wallet ? formatCredits(wallet.totalPurchased) : '0 credits'}
                            />
                            <Separator />
                            <StatRow
                                icon={Crown}
                                subtitle="Used on gifts"
                                title="Spent"
                                value={wallet ? formatCredits(wallet.totalSpent) : '0 credits'}
                            />
                            <Separator />
                            <StatRow
                                icon={Landmark}
                                subtitle="Value in EUR"
                                title="Balance value"
                                value={`${balanceValue.toFixed(2)} EUR`}
                            />
                        </>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Buy credits</CardTitle>
                    <CardDescription>Pick an amount and check out securely.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {creditPackages.map((pack) => {
                        const amountCents = centsFromCredits(pack.credits)
                        const priceLabel = (amountCents / 100).toFixed(2)
                        return (
                            <div
                                key={pack.id}
                                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/70 px-4 py-3"
                            >
                                <div>
                                    <p className="text-base font-semibold text-foreground">
                                        {formatCredits(pack.credits)}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {creditsFromCents(amountCents)} credits included
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <p className="text-lg font-semibold">{priceLabel} EUR</p>
                                    <Button
                                        disabled={isPurchasing}
                                        onClick={() => {
                                            setSelectedPackage(pack)
                                            requestConsent(pack.credits)
                                        }}
                                    >
                                        Buy
                                    </Button>
                                </div>
                            </div>
                        )
                    })}

                    <Separator />

                    <div className="space-y-2">
                        <p className="text-sm font-medium text-foreground">Or choose a custom amount</p>
                        <p className="text-xs text-muted-foreground">
                            Between {formatCredits(MIN_CUSTOM_CREDITS)} and {formatCredits(MAX_CUSTOM_CREDITS)}.
                        </p>
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                            <Input
                                className="w-32"
                                inputMode="numeric"
                                placeholder="e.g. 150"
                                value={customAmount}
                                onChange={(event) => setCustomAmount(event.target.value.replace(/\D/g, ''))}
                            />
                            <span className="text-sm text-muted-foreground">credits</span>
                            {isCustomAmountValid ? (
                                <span className="text-sm text-muted-foreground">
                                    = {(centsFromCredits(customCredits) / 100).toFixed(2)} EUR
                                </span>
                            ) : null}
                            <Button
                                className="ml-auto"
                                disabled={isPurchasing || !isCustomAmountValid}
                                onClick={() => {
                                    setSelectedPackage({ credits: customCredits, label: 'Custom amount' })
                                    requestConsent(customCredits)
                                }}
                            >
                                Buy
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Transaction history</CardTitle>
                    <CardDescription>Your credit purchases and balance updates.</CardDescription>
                </CardHeader>
                <CardContent>
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
                </CardContent>
            </Card>

            <AlertDialog
                open={isConsentOpen && Boolean(selectedPackage)}
                onOpenChange={(open) => {
                    if (!open) {
                        closeConsent()
                        setSelectedPackage(null)
                        setCustomAmount('')
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
