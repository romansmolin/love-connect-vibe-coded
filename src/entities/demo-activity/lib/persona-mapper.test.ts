import assert from 'node:assert/strict'
import { test } from 'node:test'

import { mapCandidateToPersonaInput, mapPersonaToContactPreview, mapPersonaToMatchCandidate } from './persona-mapper'

const persona = {
    fotochatUserId: 4242,
    username: 'Nora',
    age: 29,
    location: 'Berlin',
    gender: 'woman',
    photoUrl: 'https://example.com/nora.jpg',
}

test('mapPersonaToMatchCandidate maps fotochatUserId to id and passes a valid gender through', () => {
    const candidate = mapPersonaToMatchCandidate(persona)
    assert.equal(candidate.id, 4242)
    assert.equal(candidate.username, 'Nora')
    assert.equal(candidate.gender, 'woman')
    assert.equal(candidate.location, 'Berlin')
})

test('mapPersonaToMatchCandidate drops an invalid gender value instead of passing it through', () => {
    const candidate = mapPersonaToMatchCandidate({ ...persona, gender: 'unknown' })
    assert.equal(candidate.gender, undefined)
})

test('mapPersonaToContactPreview marks the persona as an online friend with the given preview', () => {
    const contact = mapPersonaToContactPreview(persona, 'Hey there!')
    assert.equal(contact.id, 4242)
    assert.equal(contact.isFriend, true)
    assert.equal(contact.onlineStatus, 'online')
    assert.equal(contact.lastMessagePreview, 'Hey there!')
})

test('mapCandidateToPersonaInput round-trips a MatchCandidate into persona upsert fields', () => {
    const input = mapCandidateToPersonaInput({
        id: 4242,
        username: 'Nora',
        age: 29,
        gender: 'woman',
        location: 'Berlin',
        photoUrl: 'https://example.com/nora.jpg',
    })
    assert.deepEqual(input, {
        fotochatUserId: 4242,
        username: 'Nora',
        age: 29,
        location: 'Berlin',
        gender: 'woman',
        photoUrl: 'https://example.com/nora.jpg',
    })
})
