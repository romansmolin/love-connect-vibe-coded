'use client'

import { useMemo, useState } from 'react'

import { CheckCircle2, Send, ShoppingCart } from 'lucide-react'
import Link from 'next/link'

import { useGetWalletQuery } from '@/entities/credit'
import type { Gift } from '@/entities/gift'
import { GiftInventoryItem, PurchaseGiftResponse, useGetCatalogQuery, useGetInventoryQuery } from '@/entities/gift'
import { useBuyGift } from '@/features/buy-gift'
import { useMatchesList } from '@/features/matches'
import { useSendGift } from '@/features/send-gift'
import { creditsFromCents, formatCredits } from '@/shared/lib/credits'
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/shared/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Skeleton } from '@/shared/ui/skeleton'

const GiftCardSkeleton = () => (
    <Card className="border-primary/10">
        <CardContent className="flex flex-col gap-4 p-5">
            <div className="flex items-center justify-between">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-5 w-16" />
            </div>
            <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-36" />
            </div>
            <Skeleton className="h-9 w-full" />
        </CardContent>
    </Card>
)

const InventorySkeleton = () => (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
            <GiftCardSkeleton key={index} />
        ))}
    </div>
)

const GiftVisual = ({ gift, className }: { gift: Gift; className?: string }) => {
    if (gift.imageUrl) {
        return (
            <img
                alt={gift.name}
                className={cn('h-12 w-12 rounded-xl border border-border bg-muted/40 object-cover', className)}
                loading="lazy"
                src={gift.imageUrl}
            />
        )
    }

    return <div className={cn('text-3xl', className)}>{gift.emoji}</div>
}

const InventoryCard = ({
    item,
    onSend,
}: {
    item: GiftInventoryItem
    onSend: (item: GiftInventoryItem) => void
}) => (
    <Card className="border-border/70 bg-background">
        <CardContent className="flex h-full flex-col gap-3 p-4">
            <div className="flex items-start justify-between">
                <GiftVisual gift={item.gift} />
                <Badge variant="outline">Available</Badge>
            </div>
            <div className="space-y-1">
                <p className="text-base font-semibold">{item.gift.name}</p>
                <p className="text-sm text-muted-foreground">
                    Purchased on {new Date(item.createdAt).toLocaleDateString()}
                </p>
            </div>
            <Button className="mt-auto w-full" variant="default" onClick={() => onSend(item)}>
                <Send className="mr-2 h-4 w-4" />
                Send gift
            </Button>
        </CardContent>
    </Card>
)

export const GiftsPage = () => {
    const { data: catalog, isLoading: isCatalogLoading } = useGetCatalogQuery()
    const {
        data: inventory,
        isLoading: isInventoryLoading,
        isFetching: isInventoryFetching,
        refetch: refetchInventory,
    } = useGetInventoryQuery()
    const { data: walletData } = useGetWalletQuery()
    const { users: matches, isLoading: isMatchesLoading } = useMatchesList()
    const { buyGift, isLoading: isPurchasing } = useBuyGift()
    const { sendGift, isLoading: isSending } = useSendGift()

    const [purchaseGiftId, setPurchaseGiftId] = useState<string | null>(null)
    const [sendGiftId, setSendGiftId] = useState<string | null>(null)
    const [recipientId, setRecipientId] = useState('')
    const [lastPurchase, setLastPurchase] = useState<PurchaseGiftResponse | null>(null)

    const gifts = catalog?.items ?? []
    const inventoryItems = inventory?.items ?? []

    const selectedGift = useMemo(
        () => (purchaseGiftId ? (gifts.find((gift) => gift.id === purchaseGiftId) ?? null) : null),
        [gifts, purchaseGiftId]
    )

    const selectedInventoryItem = useMemo(
        () => (sendGiftId ? (inventoryItems.find((item) => item.id === sendGiftId) ?? null) : null),
        [inventoryItems, sendGiftId]
    )

    const closeSendDialog = () => {
        setSendGiftId(null)
        setRecipientId('')
    }

    const walletBalance = walletData?.wallet.balance ?? 0
    const creditsNeeded = selectedGift ? creditsFromCents(selectedGift.priceCents) : 0
    const canPayWithCredits = Boolean(selectedGift && walletBalance >= creditsNeeded)

    const handlePurchaseConfirm = async () => {
        if (!selectedGift) return
        const paymentMode = canPayWithCredits ? 'credits' : 'payment'
        const response = await buyGift(selectedGift, paymentMode)
        setLastPurchase(response)
        setPurchaseGiftId(null)
    }

    const handleSendConfirm = async () => {
        if (!selectedInventoryItem || !recipientId) return
        await sendGift({
            transactionId: selectedInventoryItem.id,
            recipientId,
            giftName: selectedInventoryItem.gift.name,
        })
        closeSendDialog()
    }

    return (
        <div className="mx-auto w-full max-w-4xl space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-foreground">Gifts</h1>
                <p className="text-sm text-muted-foreground">
                    Buy a gift now, then send it to a match whenever you&apos;re ready.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Gift shop</CardTitle>
                    <CardDescription>Pick something and complete payment to add it to your gifts.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isCatalogLoading ? (
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {Array.from({ length: 6 }).map((_, index) => (
                                <GiftCardSkeleton key={index} />
                            ))}
                        </div>
                    ) : gifts.length === 0 ? (
                        <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                            No gifts available yet.
                        </div>
                    ) : (
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {gifts.map((gift) => (
                                <Card
                                    key={gift.id}
                                    className={cn('border-border/70 transition hover:border-primary/40')}
                                >
                                    <CardContent className="flex h-full flex-col gap-3 p-4">
                                        <div className="flex items-start justify-between">
                                            <GiftVisual gift={gift} />
                                            <div className="text-lg font-semibold">
                                                {(gift.priceCents / 100).toFixed(2)} {gift.currency}
                                                <p className="text-xs text-muted-foreground">
                                                    {formatCredits(creditsFromCents(gift.priceCents))}
                                                </p>
                                            </div>
                                        </div>
                                        <p className="text-base font-semibold">{gift.name}</p>
                                        <Button
                                            className="mt-auto w-full"
                                            disabled={isPurchasing}
                                            variant="default"
                                            onClick={() => setPurchaseGiftId(gift.id)}
                                        >
                                            <ShoppingCart className="mr-2 h-4 w-4" />
                                            {isPurchasing && purchaseGiftId === gift.id
                                                ? 'Processing...'
                                                : 'Buy gift'}
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {lastPurchase ? (
                <Card className="flex-row items-center gap-3 border-primary/20 bg-primary/5 p-4 text-sm">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
                    <p className="text-foreground">
                        {lastPurchase.paymentMode === 'credits'
                            ? 'Purchase complete — your gift is ready to send.'
                            : "Payment started — your gift will show up below once it's confirmed."}
                    </p>
                </Card>
            ) : null}

            <Card>
                <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <CardTitle className="text-lg">Your gifts</CardTitle>
                        <CardDescription>Ready to send to one of your matches.</CardDescription>
                    </div>
                    <Button
                        disabled={isInventoryLoading || isInventoryFetching}
                        size="sm"
                        variant="outline"
                        onClick={refetchInventory}
                    >
                        Refresh
                    </Button>
                </CardHeader>
                <CardContent>
                    {isInventoryLoading ? (
                        <InventorySkeleton />
                    ) : inventoryItems.length === 0 ? (
                        <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                            Nothing here yet — buy a gift above to get started.
                        </div>
                    ) : (
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {inventoryItems.map((item) => (
                                <InventoryCard key={item.id} item={item} onSend={() => setSendGiftId(item.id)} />
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <AlertDialog
                open={Boolean(purchaseGiftId)}
                onOpenChange={(open) => (!open ? setPurchaseGiftId(null) : null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm purchase</AlertDialogTitle>
                        <AlertDialogDescription>
                            {selectedGift
                                ? canPayWithCredits
                                    ? `Buy ${selectedGift.name} using ${formatCredits(creditsNeeded)} from your wallet?`
                                    : `Buy ${selectedGift.name} for ${(selectedGift.priceCents / 100).toFixed(2)} ${
                                          selectedGift.currency
                                      } (${formatCredits(
                                          creditsFromCents(selectedGift.priceCents)
                                      )})? Payment is required before the gift can be sent.`
                                : 'Confirm gift purchase.'}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPurchasing}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            disabled={isPurchasing || !selectedGift}
                            onClick={handlePurchaseConfirm}
                        >
                            Continue to payment
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <Dialog open={Boolean(sendGiftId)} onOpenChange={(open) => (!open ? closeSendDialog() : null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Send gift</DialogTitle>
                        <DialogDescription>
                            {selectedInventoryItem
                                ? `Send ${selectedInventoryItem.gift.name} to a mutual match.`
                                : 'Select a gift to send.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 rounded-lg border border-primary/10 bg-primary/5 p-3">
                            {selectedInventoryItem ? (
                                <GiftVisual className="h-14 w-14" gift={selectedInventoryItem.gift} />
                            ) : (
                                <div className="h-14 w-14 rounded-xl border border-dashed border-border bg-muted/40" />
                            )}
                            <div>
                                <p className="font-semibold">{selectedInventoryItem?.gift.name ?? 'Gift'}</p>
                                <p className="text-xs text-muted-foreground">Available to send</p>
                            </div>
                        </div>
                        {matches.length === 0 && !isMatchesLoading ? (
                            <div className="space-y-2 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                                <p>You don&apos;t have any matches to send this to yet.</p>
                                <Link className="font-medium text-primary hover:underline" href="/matching">
                                    Start discovering people
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                                    Choose recipient
                                </p>
                                <Select value={recipientId} onValueChange={setRecipientId}>
                                    <SelectTrigger>
                                        <SelectValue
                                            placeholder={
                                                isMatchesLoading ? 'Loading matches...' : 'Select a match'
                                            }
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {matches.map((match) => (
                                            <SelectItem key={match.id} value={String(match.id)}>
                                                {match.username} {match.age ? `• ${match.age}` : ''}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button disabled={isSending} variant="outline" onClick={closeSendDialog}>
                            Cancel
                        </Button>
                        <Button
                            disabled={isSending || !recipientId || matches.length === 0}
                            onClick={handleSendConfirm}
                        >
                            Send gift
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
