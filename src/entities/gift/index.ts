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
