'use client'

import { useMemo, useState } from 'react'

import { skipToken } from '@reduxjs/toolkit/query/react'
import { Loader2, RefreshCw, Send, Users } from 'lucide-react'

import type { ContactPreview } from '@/entities/chat'
import { useGetContactsQuery, useGetMessagesQuery, useSendMessageMutation } from '@/entities/chat'
import { cn } from '@/shared/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { ScrollArea } from '@/shared/ui/scroll-area'
import { Separator } from '@/shared/ui/separator'
import { Skeleton } from '@/shared/ui/skeleton'

const initials = (name?: string) => (name ? name.slice(0, 2).toUpperCase() : '??')

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
                    <p className="truncate text-sm font-semibold text-foreground">{contact.username}</p>
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
    const { data, isLoading, refetch, error, isFetching } = useGetContactsQuery()
    const contacts = data?.contacts ?? []

    return (
        <Card className="h-full border-primary/10">
            <CardHeader className="space-y-3">
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
                    <ScrollArea className="max-h-[calc(100vh-220px)] px-3 pb-3">
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
    const { data, isLoading, refetch, isFetching } = useGetMessagesQuery(
        contact ? { contactId: contact.id, contact: contact.username } : skipToken
    )
    const [sendMessage, { isLoading: isSending }] = useSendMessageMutation()

    const messages = data?.messages ?? []

    const handleSend = async () => {
        if (!contact || !message.trim()) return
        await sendMessage({ contactId: contact.id, contact: contact.username, message }).unwrap()
        setMessage('')
        refetch()
    }

    return (
        <Card className="h-full border-primary/10">
            <CardHeader className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                            {contact?.avatarUrl ? (
                                <AvatarImage alt={contact.username} src={contact.avatarUrl} />
                            ) : null}
                            <AvatarFallback>{initials(contact?.username)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-base">
                                {contact?.username ?? 'Select a conversation'}
                            </CardTitle>
                            {contact ? (
                                <CardDescription>Chat safely via BFF proxy</CardDescription>
                            ) : (
                                <CardDescription>Pick a contact from the left to start</CardDescription>
                            )}
                        </div>
                    </div>
                    {contact ? (
                        <Button size="icon" variant="ghost" onClick={() => refetch()}>
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
                <ScrollArea className="flex-1 px-4 py-4">
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
                    ) : messages.length === 0 ? (
                        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                            No messages yet. Say hi!
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={cn(
                                        'max-w-[70%] rounded-lg border px-3 py-2 text-sm',
                                        msg.senderId === contact.id
                                            ? 'bg-primary/5 border-primary/10 self-start'
                                            : 'bg-muted/50 border-border self-end'
                                    )}
                                >
                                    <p className="whitespace-pre-wrap text-foreground">
                                        {msg.text ?? '[no content]'}
                                    </p>
                                    {msg.sentAt ? (
                                        <p className="pt-1 text-xs text-muted-foreground">{msg.sentAt}</p>
                                    ) : null}
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
                <Separator />
                <div className="flex items-center gap-2 p-4">
                    <Input
                        disabled={!contact || isSending}
                        placeholder={contact ? 'Type your message…' : 'Select a conversation first'}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault()
                                handleSend()
                            }
                        }}
                    />
                    <Button disabled={!contact || isSending || !message.trim()} onClick={handleSend}>
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

export const ChatPage = () => {
    const [selected, setSelected] = useState<ContactPreview | undefined>(undefined)

    const selectedId = selected?.id

    const sideBySide = useMemo(
        () => (
            <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
                <ContactsPane selectedId={selectedId} onSelect={setSelected} />
                <ChatWindow contact={selected} />
            </div>
        ),
        [selected, selectedId]
    )

    return (
        <div className="mx-auto w-full max-w-6xl space-y-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-semibold">Messages</h1>
                <p className="text-sm text-muted-foreground">View your conversations and reply directly.</p>
            </div>
            {sideBySide}
        </div>
    )
}
