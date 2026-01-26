# BeGateway / Secure Processor answers

This document answers the requested questions based on the current project implementation.

## 1) BeGateway API details (required)

### Request auth method

- **API calls** use **Basic Auth** with `shop_id:secret_key` base64 encoded.
- **Webhook signature** is verified with **RSA-SHA256** using the `Content-Signature` header.
- In this project, signature verification is **skipped** if `SECURE_PROCESSOR_PUBLIC_KEY` is not set (test mode convenience).

### Checkout token request payload (example JSON)

The server sends a BeGateway v2 style payload under `checkout`:

```json
{
  "checkout": {
    "version": 2.1,
    "transaction_type": "payment",
    "test": true,
    "settings": {
      "return_url": "https://<backend-or-frontend>/api/payments/secure-processor/return?token=pt_..."
    },
    "order": {
      "amount": 200,
      "currency": "EUR",
      "description": "Credit purchase: 100 credits"
    },
    "customer": {
      "id": "user_123"
    },
    "metadata": {
      "payment_token_id": "paytok_123",
      "user_id": "user_123",
      "reference_id": "credits:100"
    }
  }
}
```

### Checkout token response shape

The service accepts either of these shapes:

```json
{ "token": "checkout_token" }
```

or

```json
{ "checkout": { "token": "checkout_token", "redirect_url": "..." } }
```

If no checkout token is present, the request fails.

### Return callback params

The return handler expects these **query parameters**:

- `token` — internal payment token (sent in `return_url` when creating checkout)
- `status` — gateway status string
- `uid` — gateway transaction UID

### Webhook payload + signature header + signature algorithm

- **Header**: `Content-Signature`
- **Algorithm**: RSA-SHA256
- **Payload** (minimal fields used):

```json
{
  "status": "successful",
  "uid": "gateway_uid",
  "payment_token_id": "paytok_123",
  "metadata": {
    "payment_token_id": "paytok_123",
    "user_id": "user_123"
  }
}
```

The service looks for `payment_token_id` at the root or inside `metadata`.

## 2) Correlation field

Current implementation uses **both**:

- Internal payment token ID stored in `metadata.payment_token_id` and returned in the webhook.
- Gateway transaction UID stored as `gatewayUid`.
- Return URL includes the internal **payment token string** (`token=pt_...`).

Recommendation: **C (both)** — this matches existing code and gives redundant correlation.

## 3) Pricing + currency

Based on current code:

- **Credits → cents**: `1 credit = 2 cents` (see `CENTS_PER_CREDIT = 2`).
- **Currency**: `EUR`.
- **Allowed purchase sizes**: any integer ≥ 1 (server validates `credits` as integer and > 0).

If you want different defaults (e.g., USD or fixed packs), we should update the conversion and validation logic.

## 4) Data model changes (required)

The project **already uses** a `paymentToken` model and `creditTransaction` with a status. Current behavior relies on:

- `paymentToken` with status (`CREATED | PENDING | SUCCESSFUL | FAILED | DECLINED | EXPIRED | ERROR`), `gatewayUid`, and `rawPayload`.
- `creditTransaction` with `status`, `paymentTokenId`, and `credits` fields.

So no schema changes are required if you follow the existing model. If you still want to add fields like `paymentProvider` or extra raw payloads, they can be added without changing the flow.

## 5) API response for wallet

Current wallet response includes:

- `wallet` object with `balance`, `currency`, `totalPurchased`, `totalSpent`, `pendingCredits`.
- `transactions` array (list of transactions with amounts/status).
- `total` count.

If you want a smaller payload (like just balance + count), we can add a separate endpoint or a query param to control the shape.
