# Credits purchase via Secure Processor

This document explains how credits are purchased in this project using the existing Secure Processor (BeGateway) integration. It focuses on the flow and responsibilities and lists the API routes that trigger payments, without referencing code identifiers.

## Overview

Credits are purchased through a Secure Processor checkout token and confirmed via return + webhook callbacks. The flow is split across:

- **Client**: starts the purchase and opens the Secure Processor widget.
- **API layer**: validates the request and delegates to server services.
- **Credits domain**: creates the purchase transaction and ties it to a payment token.
- **Payments domain**: creates the checkout token and processes callbacks.
- **Persistence**: updates wallet balance and transaction status.

## High-level flow

1. Client requests a credit purchase.
2. Server creates an internal payment token and Secure Processor checkout token.
3. Client opens the Secure Processor widget using the checkout token.
4. Gateway triggers a return callback and a webhook callback.
5. Server maps payment status and fulfills the credit transaction.

## Step-by-step integration

1. Configure environment variables and confirm gateway access.
2. Ensure a payment token model exists to correlate gateway callbacks.
3. Implement a server-side payment service to:
    - create an internal payment token,
    - call the gateway API for a checkout token,
    - store the gateway token and raw payload.
4. Implement a credit purchase service to:
    - validate the credit amount,
    - convert credits to cents,
    - create a pending credit transaction linked to the payment token.
5. Expose the purchase API route that returns a checkout token.
6. Integrate the frontend widget to open with the checkout token.
7. Implement return callback handling to update payment status.
8. Implement webhook handling with signature verification and idempotent fulfillment.
9. On successful webhook processing, increment wallet balance.
10. Add monitoring/logging and test with gateway test mode.

## API routes used for credit purchases

- `POST /api/credits/purchase` — creates a credit purchase and returns a checkout token.
- `GET /api/credits/wallet` — returns wallet balance and transaction summary.
- `GET /api/payments/secure-processor/return` — return callback for immediate UI feedback.
- `POST /api/payments/secure-processor/webhook` — webhook callback, authoritative payment status.

## Client flow

- Calls the purchase route with the number of credits.
- Receives a checkout token and opens the Secure Processor widget.
- On widget close, refreshes wallet state and shows UI feedback.

Important: widget close status **is not** authoritative. Webhook is the source of truth.

## Server flow (credits + payments)

### 1) Create purchase

- Ensure a wallet exists for the user.
- Convert credits to the billing amount in cents.
- Create a checkout token with the gateway.
- Create a pending credit transaction tied to the payment token.

### 2) Fulfill purchase

- Load the transaction and payment token.
- Map payment status to the credit transaction status.
- If successful, increment the wallet balance.

### 3) Payment handling

- Create checkout tokens and persist gateway identifiers.
- Handle return callback updates.
- Handle webhook updates and fulfillment.

## Status mapping

- Gateway status maps to internal payment status.
- Internal payment status maps to credit transaction status.

## Environment variables

These are required for Secure Processor integration:

```bash
SECURE_PROCESSOR_SHOP_ID=...
SECURE_PROCESSOR_SECRET_KEY=...
SECURE_PROCESSOR_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"
SECURE_PROCESSOR_API_BASE_URL=https://checkout.secure-processor.com
SECURE_PROCESSOR_CHECKOUT_TOKEN_PATH=/ctp/api/checkouts
NEXT_PUBLIC_SECURE_PROCESSOR_TEST_MODE=true
BACKEND_URL=https://api.yourdomain.com
FRONTEND_URL=https://yourdomain.com
```

Optional (frontend widget):

```bash
NEXT_PUBLIC_SECURE_PROCESSOR_WIDGET_SRC=https://js.secure-processor.com/widget/be_gateway.js
NEXT_PUBLIC_SECURE_PROCESSOR_CHECKOUT_URL=https://checkout.secure-processor.com
```

## Customization points

- Pricing: update the credits-to-cents conversion rate.
- Currency: update the configured currency and ensure gateway support.
- Metadata: adjust purchase descriptions and reference metadata.
- Client UX: update UI feedback and wallet refresh behavior.

## Safety + idempotency

- Fulfillment is idempotent: if a transaction is already `SUCCESSFUL`, it returns early.
- Webhook is authoritative; the widget close status only informs UI.
- Webhook signature is verified when `SECURE_PROCESSOR_PUBLIC_KEY` is present.

## Quick checklist

- [ ] Secure Processor env vars configured
- [ ] Return + webhook URLs configured in the gateway dashboard
- [ ] Wallet exists for user
- [ ] Credit transaction created with `PENDING`
- [ ] Webhook updates PaymentToken status
- [ ] Wallet balance increments on `SUCCESSFUL`
