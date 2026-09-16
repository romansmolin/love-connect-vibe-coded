import assert from 'node:assert/strict'
import test from 'node:test'

import { mapContact, mapDeliveredGiftToMessage, mapMessage } from '../../../lib/chat-mapper'

test('unwraps FotoChat message objects before handing them to the chat UI', () => {
    const nestedMessage = {
        id: 10,
        exp: 'sophie',
        exp_id: 42,
        message: 'See you this evening!',
    }

    const contact = mapContact({
        m_id: 42,
        pseudo: 'sophie',
        photo: { url: '//cdn.fotochat.com/sophie.jpg' },
        tab_last_msg: { message: nestedMessage },
    } as never)
    const message = mapMessage({
        id: 10,
        exp: 'sophie',
        exp_id: 42,
        message: nestedMessage,
        album_share: 'ask_opened',
    } as never)

    assert.equal(contact.lastMessagePreview, 'See you this evening!')
    assert.equal(contact.lastMessageAt, undefined)
    assert.equal(contact.avatarUrl, 'https://cdn.fotochat.com/sophie.jpg')
    assert.equal(message.text, 'See you this evening!')
    assert.equal(message.extra, undefined)
})

test('maps a delivered gift into the same timeline shape as chat messages', () => {
    const deliveredAt = new Date('2026-09-16T10:30:00.000Z')
    const message = mapDeliveredGiftToMessage({
        id: 'gift-transaction-1',
        senderId: '17',
        deliveredAt,
        createdAt: new Date('2026-09-16T10:29:00.000Z'),
        gift: {
            id: 'gift-1',
            name: 'Eternal Rose',
            emoji: '🌹',
            imageUrl: '/gifts/Eternal%20Rose.png',
        },
    } as never)

    assert.equal(message.id, 'gift:gift-transaction-1')
    assert.equal(message.senderId, 17)
    assert.equal(message.sentAt, deliveredAt.toISOString())
    assert.deepEqual(message.gift, {
        transactionId: 'gift-transaction-1',
        giftId: 'gift-1',
        name: 'Eternal Rose',
        emoji: '🌹',
        imageUrl: '/gifts/Eternal%20Rose.png',
    })
})
