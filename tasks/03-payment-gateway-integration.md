# Secure Processor integration guide

This document explains how to integrate Secure Processor, how to initiate payments, and how to confirm successful payments. It is written to be reusable for other projects.

## Token usage summary (generic)

| Token type | Where created | Stored / used | Purpose |
| --- | --- | --- | --- |
| Internal payment token (`pt_...`) | Your backend before calling gateway | `PaymentToken.token` | Correlates return + webhook with the original payment. Sent as `token` in return URL. |
| Payment token DB id | Your backend on creation | `metadata.payment_token_id` | Reliable correlation when the gateway returns `payment_token_id` in webhook payload. |
| Secure Processor checkout token | Secure Processor API response | Stored in DB + returned to client | Token passed into the BeGateway widget. |
| Recipient card token | Secure Processor tokenization | Stored in DB | Tokenized card for payouts (optional). |
| Webhook signature | Secure Processor webhook | `Content-Signature` header | RSA signature verified server-side before processing the webhook. |

Key flows:
- Payment flow uses **two tokens**: an internal `PaymentToken.token` and the gateway checkout token.
- Confirmation uses **return URL + webhook** (webhook is the source of truth).
- Payout flow uses **recipient card tokens** when required.

## Token lifecycle (generic)

- `PaymentToken` is created first with status `CREATED`.
- The gateway checkout token is stored in `gatewayUid`.
- Return handler and webhook both update the payment status.
- Fulfillment should be **idempotent** (only execute once).
- Webhook is the **authoritative** signal for payment success.

## Payment flow (generic)

1. Client requests payment -> server creates a `PaymentToken` and a Secure Processor checkout token.
2. Client opens widget with the checkout token.
3. Secure Processor redirects to return URL + sends webhook.
4. Server updates `PaymentToken` status and fulfills payment.

## Status mapping

Gateway status -> internal `PaymentTokenStatus` (from `mapSecureProcessorStatus`):

| Gateway status | Internal status |
| --- | --- |
| successful, success, completed | SUCCESSFUL |
| failed, failure | FAILED |
| declined, rejected | DECLINED |
| expired | EXPIRED |
| error | ERROR |
| pending, (default) | PENDING |

## Widget close statuses

The BeGateway widget calls `closeWidget` with one of:

- `successful`: payment completed (still wait for webhook)
- `pending`: awaiting confirmation
- `redirected`: user sent to external page
- `failed`: payment declined
- `error`: technical failure
- `null`: user closed the widget

## Integrating Secure Processor

### 1) Data model (minimum)

If you need the same correlation + idempotency, create a PaymentToken table similar to:

```prisma
enum PaymentTokenStatus {
  CREATED
  PENDING
  SUCCESSFUL
  FAILED
  DECLINED
  EXPIRED
  ERROR
}

model PaymentToken {
  id          String   @id @default(cuid())
  token       String   @unique
  userId      String
  itemType    String
  amountCents Int
  currency    String   @default("EUR")
  status      PaymentTokenStatus @default(CREATED)
  testMode    Boolean  @default(true)
  gatewayUid  String?
  rawPayload  Json?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

Optional: Add a balance/credits table if your product needs prepaid credits.

### 2) Environment variables

These are required by the existing integration:

```bash
SECURE_PROCESSOR_SHOP_ID=...
SECURE_PROCESSOR_SECRET_KEY=...
SECURE_PROCESSOR_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"
NEXT_PUBLIC_SECURE_PROCESSOR_TEST_MODE=true
SECURE_PROCESSOR_API_BASE_URL=https://checkout.secure-processor.com
SECURE_PROCESSOR_CHECKOUT_TOKEN_PATH=/ctp/api/checkouts
BACKEND_URL=https://api.yourdomain.com
FRONTEND_URL=https://yourdomain.com
```

Optional (frontend):

```bash
NEXT_PUBLIC_SECURE_PROCESSOR_WIDGET_SRC=https://js.secure-processor.com/widget/be_gateway.js
NEXT_PUBLIC_SECURE_PROCESSOR_CHECKOUT_URL=https://checkout.secure-processor.com
```

### 3) Server-side service (core logic)

This is the heart of the integration. It creates the internal token, calls the gateway, and later handles return + webhooks.

```ts
// Simplified version of src/entities/secure-processor/model/secure-processor.service.ts
class SecureProcessorPaymentService {
  async createCheckoutToken(params: {
    userId: string
    amountCents: number
    currency: 'EUR'
    description: string
    itemType: 'one_time' | 'order' | 'subscription'
    referenceId?: string
  }) {
    const paymentToken = await db.paymentToken.create({
      data: {
        token: `pt_${crypto.randomUUID().replace(/-/g, '')}`,
        userId: params.userId,
        itemType: params.itemType.toUpperCase(),
        amountCents: params.amountCents,
        currency: params.currency,
        description: params.description,
        status: 'CREATED',
        testMode: isTestMode(),
      },
    })

    const returnUrl = `${BACKEND_URL}/api/payments/secure-processor/return?token=${paymentToken.token}`
    const checkoutPayload = {
      shop_id: SHOP_ID,
      amount: params.amountCents,
      currency: params.currency,
      description: params.description,
      return_url: returnUrl,
      test_mode: isTestMode(),
      metadata: { payment_token_id: paymentToken.id, user_id: params.userId, reference_id: params.referenceId },
    }

    const remote = await apiClient.post('/ctp/api/checkouts', checkoutPayload, { headers: authHeaders })
    await db.paymentToken.update({
      where: { id: paymentToken.id },
      data: { gatewayUid: remote.token, rawPayload: { checkoutToken: remote.token } },
    })

    return { token: paymentToken.token, checkout: { token: remote.token } }
  }

  async handleReturn(params: { token: string; status?: string; uid?: string }) {
    const paymentToken = await db.paymentToken.findUnique({ where: { token: params.token } })
    if (!paymentToken) throw new Error('Payment token not found')
    const mapped = mapStatus(params.status)
    await db.paymentToken.update({
      where: { id: paymentToken.id },
      data: { status: mapped, gatewayUid: params.uid ?? null },
    })
    if (mapped === 'SUCCESSFUL') await fulfillPayment(paymentToken)
    return { status: mapped, redirectUrl: buildRedirectUrl(paymentToken) }
  }

  async processWebhook(raw: Buffer, headers: { authorization?: string; contentSignature?: string }) {
    verifySignature(raw, headers.contentSignature)
    verifyBasicAuth(headers.authorization)
    const payload = JSON.parse(raw.toString('utf-8'))
    const tokenId = payload.payment_token_id || payload.metadata?.payment_token_id
    const paymentToken =
      (tokenId && (await db.paymentToken.findUnique({ where: { id: tokenId } }))) ||
      (payload.uid && (await db.paymentToken.findFirst({ where: { gatewayUid: payload.uid } })))
    if (!paymentToken) throw new Error('Payment token not found in webhook payload')
    const mapped = mapStatus(payload.status)
    await db.paymentToken.update({
      where: { id: paymentToken.id },
      data: { status: mapped, gatewayUid: payload.uid ?? null, rawPayload: payload },
    })
    if (mapped === 'SUCCESSFUL') await fulfillPayment(paymentToken)
  }
}
```

### 3.1) Webhook signature verification (Node)

```ts
import crypto from 'node:crypto'

export function verifySecureProcessorSignature(payload: Buffer, signature: string, publicKey: string) {
  const verifier = crypto.createVerify('RSA-SHA256')
  verifier.update(payload)
  verifier.end()
  return verifier.verify(publicKey, signature, 'base64')
}
```

Also verify Basic Auth:

```ts
const expected = `Basic ${Buffer.from(`${SHOP_ID}:${SECRET_KEY}`).toString('base64')}`
if (authorizationHeader !== expected) throw new Error('Invalid webhook authorization')
```

### 4) API routes (Next.js example)

Create thin route handlers that delegate to the service:

```ts
// POST /api/payments/secure-processor/token
export async function POST(req: Request) {
  const user = await requireSession()
  const body = await req.json()
  // Validate whatever you are charging for (order, invoice, subscription, etc.)
  const item = await db.item.findUnique({ where: { id: body.referenceId } })
  if (!item || item.userId !== user.id) return jsonError(...)
  const paymentService = new SecureProcessorPaymentService()
  return NextResponse.json(
    await paymentService.createCheckoutToken({
      itemType: 'one_time',
      userId: user.id,
      referenceId: item.id,
      amountCents: item.amountCents,
      currency: 'EUR',
      description: `Payment for ${item.title}`,
    })
  )
}
```

```ts
// GET /api/payments/secure-processor/return
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')
  const status = searchParams.get('status')
  const uid = searchParams.get('uid')
  const paymentService = new SecureProcessorPaymentService()
  const result = await paymentService.handleReturn({ token: token || '', status, uid })
  return NextResponse.redirect(result.redirectUrl)
}
```

```ts
// POST /api/payments/secure-processor/webhook
export async function POST(request: Request) {
  const rawPayload = Buffer.from(await request.arrayBuffer())
  const paymentService = new SecureProcessorPaymentService()
  await paymentService.processWebhook(rawPayload, {
    authorization: request.headers.get('authorization') ?? undefined,
    contentSignature: request.headers.get('content-signature') ?? undefined,
  })
  return NextResponse.json({ received: true })
}
```

### 4.1) Request/response examples

Create checkout token:

```http
POST /api/payments/secure-processor/token
Content-Type: application/json

{ "itemType": "document_translation", "documentId": "doc_123" }
```

```json
{ "token": "pt_abc123", "checkout": { "token": "chk_456" } }
```

Return URL (redirect only):

```
GET /api/payments/secure-processor/return?token=pt_abc123&status=successful&uid=gateway_uid
```

Webhook (raw body):

```json
{
  "payment_token_id": "paytok_123",
  "status": "successful",
  "uid": "gateway_uid",
  "metadata": { "payment_token_id": "paytok_123", "user_id": "user_1" }
}
```

### 5) Frontend widget integration

Create the checkout token on your backend, then open the BeGateway widget with that token.

```tsx
import { openSecureProcessorWidget } from '@/shared/lib/secure-processor-widget'
import { createCheckoutToken } from '@/entities/secure-processor/api'

async function onPay(referenceId: string) {
  const { checkout } = await createCheckoutToken({ referenceId })
  await openSecureProcessorWidget({
    checkoutToken: checkout.token,
    onClose: async (status) => {
      if (status === 'successful') {
        // refetch order/invoice status or poll
      }
    },
  })
}
```


### 7) Webhook security notes

- Verify RSA signature with `SECURE_PROCESSOR_PUBLIC_KEY` (`Content-Signature` header).
- Verify Basic Auth with `shop_id:secret_key` base64.
- In test mode, this project allows missing signatures.

## Gateway-specific gotchas

- `SECURE_PROCESSOR_CHECKOUT_TOKEN_PATH` must match your dashboard docs. The service tries several paths but will fail if none match.
- EUR-only setup: if your account supports one currency, convert before calling the gateway.
- `BACKEND_URL` must be HTTPS in production for callbacks to work securely.

## Quick checklist (porting)

- [ ] Define PaymentToken model
- [ ] Implement service (checkout token, return handler, webhook)
- [ ] Configure env vars + return/webhook URLs
- [ ] Add frontend widget integration
- [ ] Add fulfillment logic (mark paid / deliver product / unlock access)
- [ ] Configure webhook with signature + Basic Auth
