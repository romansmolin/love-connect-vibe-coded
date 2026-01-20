'use client'

import { useMemo, useState } from 'react'

import { Gift as GiftIcon, Send, ShoppingCart, Sparkles } from 'lucide-react'

import { GiftInventoryItem, PurchaseGiftResponse } from '@/entities/gift'
import { useGetCatalogQuery, useGetInventoryQuery } from '@/entities/gift'
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

const InventoryCard = ({
    item,
    onSend,
}: {
    item: GiftInventoryItem
    onSend: (item: GiftInventoryItem) => void
}) => (
    <Card className="border-primary/10 bg-white/70">
        <CardContent className="flex h-full flex-col gap-4 p-5">
            <div className="flex items-start justify-between">
                <div className="text-3xl">{item.gift.emoji}</div>
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

    const handlePurchaseConfirm = async () => {
        if (!selectedGift) return
        const response = await buyGift(selectedGift)
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
        <div className="mx-auto w-full max-w-6xl space-y-6">
            <Card className="border-primary/10 bg-primary/5">
                <CardHeader>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-2">
                            <CardTitle className="flex items-center gap-2 text-3xl font-semibold">
                                <GiftIcon className="h-6 w-6 text-primary" />
                                Buy gifts
                            </CardTitle>
                            <CardDescription>
                                Pick a gift, complete the Secure Processor checkout, then send it later to a mutual
                                match.
                            </CardDescription>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Badge className="bg-white/70 text-primary">Payment required</Badge>
                            <Badge variant="outline">Send later</Badge>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            <Card>
                <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <CardTitle className="text-xl">Gift gallery</CardTitle>
                        <CardDescription>Emoji gifts you can purchase now.</CardDescription>
                    </div>
                    <Badge variant="outline" className="text-xs uppercase tracking-[0.2em]">
                        {gifts.length} items
                    </Badge>
                </CardHeader>
                <CardContent>
                    {isCatalogLoading ? (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {Array.from({ length: 6 }).map((_, index) => (
                                <GiftCardSkeleton key={index} />
                            ))}
                        </div>
                    ) : gifts.length === 0 ? (
                        <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                            No gifts available yet.
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {gifts.map((gift) => (
                                <Card
                                    key={gift.id}
                                    className={cn('border-primary/10 transition hover:border-primary/40')}
                                >
                                    <CardContent className="flex h-full flex-col gap-4 p-5">
                                        <div className="flex items-start justify-between">
                                            <div className="text-3xl">{gift.emoji}</div>
                                            <div className="text-lg font-semibold">
                                                {(gift.priceCents / 100).toFixed(2)} {gift.currency}
                                                <p className="text-xs text-muted-foreground">
                                                    {formatCredits(creditsFromCents(gift.priceCents))}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-base font-semibold">{gift.name}</p>
                                            <CardDescription>
                                                Digital gift • Instant delivery after payment
                                            </CardDescription>
                                        </div>
                                        <Button
                                            className="mt-auto w-full"
                                            variant="default"
                                            onClick={() => setPurchaseGiftId(gift.id)}
                                            disabled={isPurchasing}
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

            <Card className="bg-primary/5">
                <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <CardTitle className="text-xl">Your gifts</CardTitle>
                        <CardDescription>Purchased gifts ready to send to a match.</CardDescription>
                    </div>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={refetchInventory}
                        disabled={isInventoryLoading || isInventoryFetching}
                    >
                        Refresh
                    </Button>
                </CardHeader>
                <CardContent>
                    {isInventoryLoading ? (
                        <InventorySkeleton />
                    ) : inventoryItems.length === 0 ? (
                        <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                            You don&apos;t have any gifts yet. Purchase one from the gallery above.
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {inventoryItems.map((item) => (
                                <InventoryCard key={item.id} item={item} onSend={() => setSendGiftId(item.id)} />
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {lastPurchase && (
                <Card className="border-primary/10">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <Sparkles className="h-5 w-5 text-primary" />
                            Latest purchase
                        </CardTitle>
                        <CardDescription>
                            Complete checkout with the gateway widget. Your gift appears in inventory once payment
                            is confirmed.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 text-sm sm:grid-cols-2">
                        <div className="space-y-1">
                            <p className="text-xs uppercase text-muted-foreground tracking-[0.2em]">Transaction</p>
                            <p className="font-medium">{lastPurchase.transactionId}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs uppercase text-muted-foreground tracking-[0.2em]">Status</p>
                            <p className="font-medium">{lastPurchase.status}</p>
                        </div>
                        <div className="space-y-1 sm:col-span-2">
                            <p className="text-xs uppercase text-muted-foreground tracking-[0.2em]">
                                Checkout token
                            </p>
                            <p className="font-medium break-all">{lastPurchase.checkoutToken ?? 'Pending'}</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            <AlertDialog
                open={Boolean(purchaseGiftId)}
                onOpenChange={(open) => (!open ? setPurchaseGiftId(null) : null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm purchase</AlertDialogTitle>
                        <AlertDialogDescription>
                            {selectedGift
                                ? `Buy ${selectedGift.name} for ${(selectedGift.priceCents / 100).toFixed(2)} ${
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
                            onClick={handlePurchaseConfirm}
                            disabled={isPurchasing || !selectedGift}
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
                            <div className="text-3xl">{selectedInventoryItem?.gift.emoji}</div>
                            <div>
                                <p className="font-semibold">{selectedInventoryItem?.gift.name ?? 'Gift'}</p>
                                <p className="text-xs text-muted-foreground">Available to send</p>
                            </div>
                        </div>
                        {matches.length === 0 && !isMatchesLoading ? (
                            <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                                You need a mutual match before sending gifts.
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
                        <Button variant="outline" onClick={closeSendDialog} disabled={isSending}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSendConfirm}
                            disabled={isSending || !recipientId || matches.length === 0}
                        >
                            Send gift
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
