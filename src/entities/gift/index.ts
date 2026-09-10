export {
    giftApi,
    useGetCatalogQuery,
    useGetInventoryQuery,
    usePurchaseGiftMutation,
    useSendGiftMutation,
} from './api/client/gift.api'
export type {
    Gift,
    GiftCatalogResponse,
    GiftInventoryItem,
    GiftInventoryResponse,
    GiftStatus,
    GiftTransaction,
    GiftTransactionStatus,
    PurchaseGiftRequest,
    PurchaseGiftResponse,
    SendGiftRequest,
    SendGiftResponse,
} from './model/types'

export { GIFT_PRICE_CREDITS } from './model/pricing'
export type { GiftPriceCredits } from './model/pricing'
