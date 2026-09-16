'use client'

import { useEffect, useRef, useState } from 'react'

import { skipToken } from '@reduxjs/toolkit/query/react'
import { Coins, Gift, Loader2, Lock, RefreshCw, Send, Users } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useDispatch } from 'react-redux'
import { toast } from 'sonner'

import type { ContactPreview, ConversationSummary } from '@/entities/chat'
import {
    chatApi,
    useGetContactsQuery,
    useGetConversationMessagesQuery,
    useGetConversationsQuery,
    useGetMessagesQuery,
    useMarkConversationReadMutation,
    useSendConversationGiftMutation,
    useSendConversationMessageMutation,
    useSendGiftInChatMutation,
    useSendMessageMutation,
    useUnlockConversationMutation,
} from '@/entities/chat'
import { creditApi } from '@/entities/credit'
import { useGetMemberProfileQuery, useGetUserProfileQuery } from '@/entities/user'
import { cn } from '@/shared/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'
import { ScrollArea } from '@/shared/ui/scroll-area'
import { Separator } from '@/shared/ui/separator'
import { Skeleton } from '@/shared/ui/skeleton'

import { ChatGiftPicker } from './ChatGiftPicker'

const initials = (name?: string) => (name ? name.slice(0, 2).toUpperCase() : '??')
const UNLOCK_COST = 300

const createIdempotencyKey = () =>
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`

const formatMessageTime = (value?: string) => {
    if (!value) return undefined
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const ContactItem = ({
    contact,
    isActive,
    onSelect,
}: {
    contact: ContactPreview
    isActive: boolean
    onSelect: () => void
}) => {
    const statusColor =
        contact.onlineStatus === 'online'
            ? 'bg-emerald-500'
            : contact.onlineStatus === 'recent'
              ? 'bg-amber-400'
              : 'bg-muted-foreground/40'
    return (
        <button
            className={cn(
                'w-full rounded-lg border border-transparent p-3 text-left transition hover:border-primary/30 hover:bg-primary/5',
                isActive && 'border-primary bg-primary/5'
            )}
            onClick={onSelect}
        >
            <div className="flex items-center gap-3">
                <div className="relative">
                    <Avatar className="h-10 w-10">
                        {contact.avatarUrl ? <AvatarImage alt={contact.username} src={contact.avatarUrl} /> : null}
                        <AvatarFallback>{initials(contact.username)}</AvatarFallback>
                    </Avatar>
                    <span
                        className={cn('absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full', statusColor)}
                    />
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-semibold text-foreground">{contact.username}</p>
                    </div>
                    {contact.lastMessagePreview ? (
                        <p className="truncate text-xs text-muted-foreground">{contact.lastMessagePreview}</p>
                    ) : (
                        <p className="text-xs text-muted-foreground">No messages yet</p>
                    )}
                </div>
                {contact.unreadCount ? (
                    <Badge className="bg-primary text-primary-foreground" variant="secondary">
                        {contact.unreadCount}
                    </Badge>
                ) : null}
            </div>
        </button>
    )
}

const ContactsPane = ({
    selectedId,
    onSelect,
}: {
    selectedId?: number
    onSelect: (contact: ContactPreview) => void
}) => {
    const { data, isLoading, refetch, error, isFetching } = useGetContactsQuery(undefined, {
        pollingInterval: 15000,
        refetchOnFocus: true,
    })
    const contacts = data?.contacts ?? []

    return (
        <Card className="h-full border-border/70">
            <CardHeader className="space-y-2 pb-3 w-full">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Users className="h-4 w-4 text-primary" />
                            Conversations
                        </CardTitle>
                        <CardDescription>Your contacts</CardDescription>
                    </div>
                    <Button size="icon" variant="ghost" onClick={() => refetch()}>
                        {isFetching ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <RefreshCw className="h-4 w-4" />
                        )}
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {isLoading ? (
                    <div className="space-y-2 p-3">
                        {Array.from({ length: 6 }).map((_, idx) => (
                            <Skeleton key={idx} className="h-12 w-full rounded-lg" />
                        ))}
                    </div>
                ) : error ? (
                    <div className="p-4 text-sm text-destructive">Unable to load contacts.</div>
                ) : contacts.length === 0 ? (
                    <div className="p-6 text-center text-sm text-muted-foreground">No conversations yet.</div>
                ) : (
                    <ScrollArea className="max-h-[calc(100vh-200px)] px-3 pb-3">
                        <div className="space-y-2">
                            {contacts.map((contact) => (
                                <ContactItem
                                    key={contact.id}
                                    contact={contact}
                                    isActive={selectedId === contact.id}
                                    onSelect={() => onSelect(contact)}
                                />
                            ))}
                        </div>
                    </ScrollArea>
                )}
            </CardContent>
        </Card>
    )
}

const ChatWindow = ({ contact }: { contact?: ContactPreview }) => {
    const [message, setMessage] = useState('')
    const [isGiftPickerOpen, setIsGiftPickerOpen] = useState(false)
    const [isWaitingForReply, setIsWaitingForReply] = useState(false)
    const incomingMessageCountAtSend = useRef(0)
    const bottomRef = useRef<HTMLDivElement>(null)
    const dispatch = useDispatch()
    const { data, isError, isLoading, refetch, isFetching } = useGetMessagesQuery(
        contact ? { contactId: contact.id, contact: contact.username } : skipToken,
        {
            // Simulated replies are deliberately delayed to feel natural. Polling makes them
            // appear in the open conversation without requiring a full page refresh.
            pollingInterval: contact ? 4000 : 0,
            refetchOnFocus: true,
        }
    )
    const [sendMessage, { isLoading: isSending }] = useSendMessageMutation()
    const [sendGift, { isLoading: isSendingGift }] = useSendGiftInChatMutation()
    const { data: myProfile } = useGetUserProfileQuery()
    const { data: memberProfile } = useGetMemberProfileQuery(
        contact && !contact.avatarUrl ? contact.id : skipToken
    )
    const me = myProfile?.user
    const activeContact = contact
        ? { ...contact, avatarUrl: contact.avatarUrl ?? memberProfile?.user.avatarUrl }
        : undefined

    const messages = data?.messages ?? []
    const incomingMessageCount = messages.filter(
        (msg) =>
            msg.senderId === activeContact?.id ||
            msg.senderUsername?.toLowerCase() === activeContact?.username.toLowerCase()
    ).length

    useEffect(() => {
        setIsWaitingForReply(false)
        setIsGiftPickerOpen(false)
    }, [activeContact?.id])

    useEffect(() => {
        if (isWaitingForReply && incomingMessageCount > incomingMessageCountAtSend.current) {
            setIsWaitingForReply(false)
        }
    }, [incomingMessageCount, isWaitingForReply])

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages.length])

    const handleSend = async () => {
        if (!activeContact || !message.trim()) return
        try {
            await sendMessage({
                contactId: activeContact.id,
                contact: activeContact.username,
                message: message.trim(),
                idempotencyKey: createIdempotencyKey(),
            }).unwrap()
            setMessage('')
            if (activeContact.source === 'ai') {
                incomingMessageCountAtSend.current = incomingMessageCount
                setIsWaitingForReply(true)
            }
            refetch()
        } catch (error) {
            const errorMessage =
                (error as { data?: { message?: string } })?.data?.message ?? 'Unable to send message.'
            toast.error(errorMessage)
        }
    }

    const handleSendGift = async (giftId: string) => {
        if (!activeContact) return

        const response = await sendGift({
            contactId: activeContact.id,
            giftId,
            idempotencyKey: createIdempotencyKey(),
        }).unwrap()
        dispatch(creditApi.util.invalidateTags(['CreditWallet']))
        toast.success(`${response.message.gift?.name ?? 'Gift'} sent successfully.`)
        if (activeContact.source === 'ai') {
            incomingMessageCountAtSend.current = incomingMessageCount
            setIsWaitingForReply(true)
        }
        refetch()
    }

    return (
        <Card className="h-full border-border/70">
            <CardHeader className="flex flex-col gap-2 pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                            {activeContact?.avatarUrl ? (
                                <AvatarImage alt={activeContact.username} src={activeContact.avatarUrl} />
                            ) : null}
                            <AvatarFallback>{initials(activeContact?.username)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-base">
                                {activeContact?.username ?? 'Select a conversation'}
                            </CardTitle>
                        </div>
                    </div>
                    {contact ? (
                        <Button className="shrink-0" size="icon" variant="ghost" onClick={() => refetch()}>
                            {isFetching ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <RefreshCw className="h-4 w-4" />
                            )}
                        </Button>
                    ) : null}
                </div>
            </CardHeader>
            <Separator />
            <CardContent className="flex h-[520px] flex-col p-0">
                <ScrollArea className="flex-1 px-3 py-3">
                    {isLoading ? (
                        <div className="space-y-3">
                            {Array.from({ length: 5 }).map((_, idx) => (
                                <Skeleton key={idx} className="h-12 w-1/2" />
                            ))}
                        </div>
                    ) : !contact ? (
                        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                            Select a conversation to view messages.
                        </div>
                    ) : isError ? (
                        <div className="flex h-full items-center justify-center text-sm text-destructive">
                            Unable to load messages.
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                            No messages yet. Say hi!
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {messages.map((msg) => {
                                const isFromContact =
                                    msg.senderId === activeContact?.id ||
                                    msg.senderUsername?.toLowerCase() === activeContact?.username.toLowerCase()
                                const attachmentUrl = msg.extra?.startsWith('http') ? msg.extra : undefined
                                return (
                                    <div
                                        key={msg.id}
                                        className={cn(
                                            'flex items-end gap-2',
                                            isFromContact ? 'self-start' : 'flex-row-reverse self-end'
                                        )}
                                    >
                                        <Avatar className="size-8 shrink-0">
                                            {isFromContact ? (
                                                activeContact?.avatarUrl ? (
                                                    <AvatarImage
                                                        alt={activeContact.username}
                                                        src={activeContact.avatarUrl}
                                                    />
                                                ) : null
                                            ) : me?.avatarUrl ? (
                                                <AvatarImage alt={me.username} src={me.avatarUrl} />
                                            ) : null}
                                            <AvatarFallback className="text-[10px]">
                                                {isFromContact
                                                    ? initials(activeContact?.username)
                                                    : initials(me?.username)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div
                                            className={cn(
                                                'max-w-[70%] rounded-lg border px-3 py-2 text-sm',
                                                msg.gift
                                                    ? 'border-primary/20 bg-linear-to-br from-primary/5 to-amber-50'
                                                    : isFromContact
                                                      ? 'bg-primary/5 border-primary/10'
                                                      : 'bg-muted/50 border-border'
                                            )}
                                        >
                                            {msg.gift ? (
                                                <div className="flex items-center gap-3">
                                                    {msg.gift.imageUrl ? (
                                                        <img
                                                            alt={msg.gift.name}
                                                            className="h-14 w-14 shrink-0 object-contain"
                                                            loading="lazy"
                                                            src={msg.gift.imageUrl}
                                                        />
                                                    ) : (
                                                        <span className="text-4xl">{msg.gift.emoji}</span>
                                                    )}
                                                    <div className="min-w-0">
                                                        <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                                                            {isFromContact ? 'Gift received' : 'You sent a gift'}
                                                        </p>
                                                        <p className="truncate font-semibold text-foreground">
                                                            {msg.gift.name}
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : msg.text ? (
                                                <p className="whitespace-pre-wrap text-foreground">{msg.text}</p>
                                            ) : attachmentUrl ? (
                                                <p className="text-foreground">Photo</p>
                                            ) : (
                                                <p className="text-muted-foreground">Message unavailable</p>
                                            )}
                                            {attachmentUrl ? (
                                                <a
                                                    className="mt-2 block overflow-hidden rounded-md border border-border/70"
                                                    href={attachmentUrl}
                                                    rel="noreferrer"
                                                    target="_blank"
                                                >
                                                    <img
                                                        alt="Shared photo"
                                                        className="max-h-64 w-full object-cover"
                                                        loading="lazy"
                                                        src={attachmentUrl}
                                                    />
                                                </a>
                                            ) : null}
                                            {msg.sentAt ? (
                                                <p className="pt-1 text-xs text-muted-foreground">
                                                    {formatMessageTime(msg.sentAt)}
                                                </p>
                                            ) : null}
                                        </div>
                                    </div>
                                )
                            })}
                            {isWaitingForReply && activeContact?.source === 'ai' ? (
                                <div className="flex items-center gap-2 self-start text-xs text-muted-foreground">
                                    <Avatar className="size-10">
                                        {activeContact.avatarUrl ? (
                                            <AvatarImage
                                                alt={activeContact.username}
                                                src={activeContact.avatarUrl}
                                            />
                                        ) : null}
                                        <AvatarFallback className="text-[10px]">
                                            {initials(activeContact.username)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="animate-pulse">{activeContact.username} is typing…</span>
                                </div>
                            ) : null}
                            <div ref={bottomRef} />
                        </div>
                    )}
                </ScrollArea>
                <Separator />
                <div className="flex items-center gap-2 p-3">
                    <Popover open={isGiftPickerOpen} onOpenChange={setIsGiftPickerOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                aria-label="Send a gift"
                                disabled={!activeContact || isSendingGift}
                                size="icon"
                                type="button"
                                variant="outline"
                            >
                                {isSendingGift ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Gift className="h-4 w-4" />
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent align="start" className="w-auto p-3" side="top">
                            <ChatGiftPicker
                                disabled={!activeContact || isSendingGift}
                                onPick={handleSendGift}
                                onSent={() => setIsGiftPickerOpen(false)}
                            />
                        </PopoverContent>
                    </Popover>
                    <Input
                        disabled={!activeContact || isSending}
                        placeholder={activeContact ? 'Type your message…' : 'Select a conversation first'}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault()
                                handleSend()
                            }
                        }}
                    />
                    <Button disabled={!activeContact || isSending || !message.trim()} onClick={handleSend}>
                        {isSending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="mr-2 h-4 w-4" />
                        )}
                        Send
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

const _LegacyChatPage = () => {
    const searchParams = useSearchParams()
    const [selected, setSelected] = useState<ContactPreview | undefined>(undefined)
    const { data: contactsData } = useGetContactsQuery()

    useEffect(() => {
        const contactId = Number(searchParams.get('contactId'))
        const contact = searchParams.get('contact')
        const avatarUrl = searchParams.get('avatarUrl') ?? undefined
        if (contact && Number.isFinite(contactId) && contactId > 0) {
            setSelected({ id: contactId, username: contact, avatarUrl })
        }
    }, [searchParams])

    useEffect(() => {
        const contacts = contactsData?.contacts ?? []
        if (contacts.length === 0) return

        setSelected((current) => {
            if (!current) return contacts[0]

            const fullContact = contacts.find((contact) => contact.id === current.id)
            return fullContact ? { ...current, ...fullContact } : current
        })
    }, [contactsData])

    const selectedId = selected?.id

    return (
        <div className="mx-auto w-full space-y-4">
            <div className="space-y-1">
                <h1 className="text-2xl font-semibold">Messages</h1>
                <p className="text-sm text-muted-foreground">View your conversations and reply directly.</p>
            </div>
            <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
                <ContactsPane selectedId={selectedId} onSelect={setSelected} />
                <ChatWindow contact={selected} />
            </div>
        </div>
    )
}

const ConversationListItem = ({
    conversation,
    selected,
    onSelect,
}: {
    conversation: ConversationSummary
    selected: boolean
    onSelect: () => void
}) => (
    <button
        className={cn(
            'w-full rounded-lg border border-transparent p-3 text-left transition hover:border-primary/30 hover:bg-primary/5',
            selected && 'border-primary bg-primary/5'
        )}
        onClick={onSelect}
    >
        <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
                {conversation.peerProfile?.avatarUrl ? (
                    <AvatarImage
                        alt={conversation.peerProfile.username}
                        src={conversation.peerProfile.avatarUrl}
                    />
                ) : null}
                <AvatarFallback>{initials(conversation.peerProfile?.username)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">
                    {conversation.peerProfile?.username ?? `Member ${conversation.peerDatingId}`}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                    {conversation.lastPreview ?? 'No messages yet'}
                </p>
            </div>
            {conversation.unreadCount ? <Badge>{conversation.unreadCount}</Badge> : null}
        </div>
    </button>
)

const LocalConversationThread = ({ peerDatingId }: { peerDatingId?: number }) => {
    const [draft, setDraft] = useState('')
    const [pickerOpen, setPickerOpen] = useState(false)
    const bottomRef = useRef<HTMLDivElement>(null)
    const dispatch = useDispatch()
    const { data: me } = useGetUserProfileQuery()
    const { data: profile } = useGetMemberProfileQuery(peerDatingId ?? skipToken)
    const { data, isError, isLoading } = useGetConversationMessagesQuery(
        peerDatingId ? { peerDatingId, limit: 50 } : skipToken,
        { pollingInterval: peerDatingId ? 4000 : 0, refetchOnFocus: true }
    )
    const [sendMessage, { isLoading: isSending }] = useSendConversationMessageMutation()
    const [sendGift, { isLoading: isSendingGift }] = useSendConversationGiftMutation()
    const [markRead] = useMarkConversationReadMutation()
    const [unlock, { isLoading: isUnlocking }] = useUnlockConversationMutation()
    const messages = [...(data?.messages ?? [])].reverse()
    const actorId = Number(me?.user.id)
    const canSendText = Boolean(data?.unlocked || data?.peerIsAdmirer)

    useEffect(() => {
        if (peerDatingId && messages.length) markRead({ peerDatingId })
    }, [markRead, messages.length, peerDatingId])
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages.length])

    const send = async () => {
        if (!peerDatingId || !draft.trim() || !canSendText) return
        try {
            await sendMessage({
                peerDatingId,
                body: draft.trim(),
                idempotencyKey: createIdempotencyKey(),
            }).unwrap()
            setDraft('')
        } catch (error) {
            toast.error((error as { data?: { message?: string } })?.data?.message ?? 'Unable to send message.')
        }
    }
    const sendGiftFromPicker = async (giftId: string) => {
        if (!peerDatingId) return
        const result = await sendGift({ peerDatingId, giftId, idempotencyKey: createIdempotencyKey() }).unwrap()
        dispatch(creditApi.util.invalidateTags(['CreditWallet']))
        toast.success(`${result.message.gift?.name ?? 'Gift'} sent successfully.`)
    }
    const unlockThread = async () => {
        if (!peerDatingId) return
        try {
            await unlock({ peerDatingId }).unwrap()
            dispatch(creditApi.util.invalidateTags(['CreditWallet']))
        } catch (error) {
            toast.error((error as { data?: { message?: string } })?.data?.message ?? 'Unable to unlock chat.')
        }
    }

    return (
        <Card className="h-full border-border/70">
            <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                        {profile?.user.avatarUrl ? (
                            <AvatarImage alt={profile.user.username} src={profile.user.avatarUrl} />
                        ) : null}
                        <AvatarFallback>{initials(profile?.user.username)}</AvatarFallback>
                    </Avatar>
                    <CardTitle className="text-base">
                        {peerDatingId
                            ? (profile?.user.username ?? `Member ${peerDatingId}`)
                            : 'Select a conversation'}
                    </CardTitle>
                </div>
            </CardHeader>
            <Separator />
            <CardContent className="flex h-[520px] flex-col p-0">
                <ScrollArea className="flex-1 px-3 py-3">
                    {isLoading ? <Skeleton className="h-16 w-2/3" /> : null}
                    {isError ? <p className="text-sm text-destructive">Unable to load messages.</p> : null}
                    {!peerDatingId ? (
                        <p className="text-center text-sm text-muted-foreground">Select a conversation.</p>
                    ) : null}
                    {peerDatingId && !isLoading && !isError && messages.length === 0 ? (
                        <p className="text-center text-sm text-muted-foreground">No messages yet. Say hello!</p>
                    ) : null}
                    <div className="flex flex-col gap-3">
                        {messages.map((message) => {
                            const mine = message.senderDatingId === actorId
                            return (
                                <div
                                    key={message.id}
                                    className={cn('flex', mine ? 'justify-end' : 'justify-start')}
                                >
                                    <div
                                        className={cn(
                                            'max-w-[70%] rounded-lg border px-3 py-2 text-sm',
                                            message.gift
                                                ? 'border-primary/20 bg-linear-to-br from-primary/5 to-amber-50'
                                                : mine
                                                  ? 'bg-muted/50'
                                                  : 'bg-primary/5'
                                        )}
                                    >
                                        {message.gift ? (
                                            <div className="flex items-center gap-3">
                                                {message.gift.imageUrl ? (
                                                    <img
                                                        alt={message.gift.name}
                                                        className="h-12 w-12 object-contain"
                                                        src={message.gift.imageUrl}
                                                    />
                                                ) : (
                                                    <span className="text-3xl">{message.gift.emoji}</span>
                                                )}
                                                <div>
                                                    <p className="text-[10px] font-semibold uppercase text-primary">
                                                        {mine ? 'You sent a gift' : 'Gift received'}
                                                    </p>
                                                    <p className="font-semibold">{message.gift.name}</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="whitespace-pre-wrap">{message.body}</p>
                                        )}
                                        <p className="mt-1 text-[10px] text-muted-foreground">
                                            {formatMessageTime(message.createdAt)}
                                        </p>
                                    </div>
                                </div>
                            )
                        })}
                        <div ref={bottomRef} />
                    </div>
                </ScrollArea>
                <Separator />
                <div className="p-3">
                    {!peerDatingId ? null : !canSendText ? (
                        <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-center">
                            <Lock className="mx-auto h-4 w-4 text-primary" />
                            <p className="mt-1 text-sm font-medium">Unlock this chat to send messages</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Spend {UNLOCK_COST} credits to start the conversation. Gifts are available now.
                            </p>
                            <div className="mt-3 flex justify-center gap-2">
                                <Button disabled={isUnlocking} size="sm" onClick={unlockThread}>
                                    <Coins className="mr-1 h-3.5 w-3.5" /> Unlock for {UNLOCK_COST}
                                </Button>
                                <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
                                    <PopoverTrigger asChild>
                                        <Button size="sm" variant="outline">
                                            <Gift className="mr-1 h-3.5 w-3.5" />
                                            Send a gift
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-3" side="top">
                                        <ChatGiftPicker
                                            disabled={isSendingGift}
                                            onPick={sendGiftFromPicker}
                                            onSent={() => setPickerOpen(false)}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
                                <PopoverTrigger asChild>
                                    <Button disabled={isSendingGift} size="icon" variant="outline">
                                        <Gift className="h-4 w-4" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent align="start" className="w-auto p-3" side="top">
                                    <ChatGiftPicker
                                        disabled={isSendingGift}
                                        onPick={sendGiftFromPicker}
                                        onSent={() => setPickerOpen(false)}
                                    />
                                </PopoverContent>
                            </Popover>
                            <Input
                                disabled={isSending}
                                placeholder="Type a message..."
                                value={draft}
                                onChange={(event) => setDraft(event.target.value)}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter' && !event.shiftKey) {
                                        event.preventDefault()
                                        send()
                                    }
                                }}
                            />
                            <Button disabled={!draft.trim() || isSending} onClick={send}>
                                {isSending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Send className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

export const ChatPage = () => {
    const searchParams = useSearchParams()
    const dispatch = useDispatch()
    const { data, isError, isLoading } = useGetConversationsQuery(undefined, {
        pollingInterval: 15000,
        refetchOnFocus: true,
    })
    const [selectedPeerId, setSelectedPeerId] = useState<number | undefined>()
    const deepLinkedPeerId = Number(searchParams.get('contactId'))

    useEffect(() => {
        if (Number.isInteger(deepLinkedPeerId) && deepLinkedPeerId > 0) setSelectedPeerId(deepLinkedPeerId)
    }, [deepLinkedPeerId])
    useEffect(() => {
        if (!selectedPeerId && data?.items[0]) setSelectedPeerId(data.items[0].peerDatingId)
    }, [data?.items, selectedPeerId])
    useEffect(() => {
        const stream = new EventSource('/api/chat/stream')
        const onChatEvent = (event: Event) => {
            const payload = JSON.parse((event as MessageEvent<string>).data) as { peerDatingId?: number }
            dispatch(
                chatApi.util.invalidateTags([
                    'Contacts',
                    ...(payload.peerDatingId ? [{ type: 'Messages' as const, id: payload.peerDatingId }] : []),
                ])
            )
        }
        stream.addEventListener('chat', onChatEvent)
        return () => {
            stream.removeEventListener('chat', onChatEvent)
            stream.close()
        }
    }, [dispatch])

    return (
        <div className="mx-auto w-full space-y-4">
            <div>
                <h1 className="text-2xl font-semibold">Messages</h1>
                <p className="text-sm text-muted-foreground">View your conversations and reply directly.</p>
            </div>
            <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
                <Card className="h-full border-border/70">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Users className="h-4 w-4" />
                            Conversations
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3">
                        {isLoading ? <Skeleton className="h-14 w-full" /> : null}
                        {isError ? (
                            <p className="text-sm text-destructive">Unable to load conversations.</p>
                        ) : null}
                        {!isLoading && !isError && !data?.items.length ? (
                            <p className="text-sm text-muted-foreground">No conversations yet.</p>
                        ) : null}
                        <div className="space-y-2">
                            {data?.items.map((conversation) => (
                                <ConversationListItem
                                    key={conversation.peerDatingId}
                                    conversation={conversation}
                                    selected={selectedPeerId === conversation.peerDatingId}
                                    onSelect={() => setSelectedPeerId(conversation.peerDatingId)}
                                />
                            ))}
                        </div>
                    </CardContent>
                </Card>
                <LocalConversationThread peerDatingId={selectedPeerId} />
            </div>
        </div>
    )
}
