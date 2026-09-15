import { FOTOCHAT_API_KEY, fotochatHttpClient } from '@/shared/api/fotochat'

export type EclairBlock = {
    id?: number
    date?: string
    // Upstream's real payload uses "message" for the text; "msg" is kept for
    // whatever shape the swagger spec describes, in case that's ever what
    // comes back instead.
    message?: string
    msg?: string
    exp?: string
    exp_id?: number
    exp_prenom?: string
    dest?: string
    dest_id?: number
    etat?: string
    typo?: string
    id_extra?: string
    p_extra?: string
    album_share?: string
    state?: string
}

export type ContactBlock = {
    m_id?: number
    pseudo?: string
    photo?: string
    nb_new?: number
    online?: string
    is_friend?: number
    tab_last_msg?: string | string[] | EclairBlock[] | null
}

export type LoadContactsResponse = {
    contacts?: ContactBlock[]
}

export type LoadMessagesResponse = {
    credits_counter?: number
    eclairs?: EclairBlock[]
}

export type SendMessageResponse = {
    notification?: string
    msg?: string
    p_extra?: string
    date?: string
    id?: number
}

const LOAD_CONTACTS_ENDPOINT = '/ajax_api/load_contacts'
const LOAD_MESSAGES_ENDPOINT = '/ajax_api/load_messages'
const SEND_MESSAGE_ENDPOINT = '/ajax_api/send_message'

export const chatRepo = {
    loadContacts(sessionId: string) {
        return fotochatHttpClient.get<LoadContactsResponse>(LOAD_CONTACTS_ENDPOINT, {
            params: {
                session_id: sessionId,
                filter: 1,
                api_key: FOTOCHAT_API_KEY,
            },
        })
    },
    loadMessages(sessionId: string, contactId: number, contact?: string) {
        return fotochatHttpClient.get<LoadMessagesResponse>(LOAD_MESSAGES_ENDPOINT, {
            params: {
                'api-key': FOTOCHAT_API_KEY,
                session_id: sessionId,
                contact_id: contactId,
                contact,
            },
        })
    },
    sendMessage(sessionId: string, payload: { contact: string; message: string }) {
        return fotochatHttpClient.get<SendMessageResponse>(SEND_MESSAGE_ENDPOINT, {
            params: {
                session_id: sessionId,
                dest: payload.contact,
                msg: payload.message,
            },
        })
    },
}
