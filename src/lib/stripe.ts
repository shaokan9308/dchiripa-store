import Stripe from 'stripe'

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not configured')
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-04-10',
      typescript: true,
    })
  }
  return _stripe
}

export const stripe = {
  get subscriptions() { return getStripe().subscriptions },
  get checkout() { return getStripe().checkout },
  get billingPortal() { return getStripe().billingPortal },
  get webhooks() { return getStripe().webhooks },
} as unknown as Stripe

export const getStripeSession = async (params: {
  customerId?: string
  customerEmail?: string
  priceId: string
  successUrl: string
  cancelUrl: string
  metadata?: Record<string, string>
  mode?: 'subscription' | 'payment'
}) => {
  const session = await stripe.checkout.sessions.create({
    customer: params.customerId,
    customer_email: params.customerEmail,
    payment_method_types: ['card'],
    line_items: [
      {
        price: params.priceId,
        quantity: 1,
      },
    ],
    mode: params.mode ?? 'subscription',
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: params.metadata,
    allow_promotion_codes: true,
    billing_address_collection: 'required',
    tax_id_collection: { enabled: true },
  })

  return session
}

export const createStripePortalSession = async (customerId: string, returnUrl: string) => {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })
  return session
}

export const constructStripeEvent = (payload: string | Buffer, signature: string) => {
  return stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET!)
}