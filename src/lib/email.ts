import { Resend } from 'resend'

let resend: Resend | null = null

function getResend() {
  if (!resend && process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY)
  }
  return resend
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

interface SendEmailParams {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail({ to, subject, html, text }: SendEmailParams) {
  if (!process.env.RESEND_API_KEY) {
    return
  }

  try {
    const client = getResend()
    if (!client) return
    await client.emails.send({
      from: process.env.EMAIL_FROM!,
      to,
      subject,
      html,
      text,
    })
  } catch (error) {
    throw error
  }
}

export async function sendPurchaseConfirmationEmail(
  email: string,
  productName: string,
  downloadUrl: string
) {
  await sendEmail({
    to: email,
    subject: `Tu compra de "${productName}" en Dchiripa Store`,
    html: `
      <h1>¡Gracias por tu compra!</h1>
      <p>Has adquirido <strong>${escapeHtml(productName)}</strong>.</p>
      <p><a href="${downloadUrl}" style="background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Descargar archivo</a></p>
      <p>El enlace de descarga expira en 24 horas. Puedes acceder a tus compras desde tu <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard">panel de usuario</a>.</p>
    `,
  })
}

export async function sendSubscriptionConfirmationEmail(
  email: string,
  planName: string,
  portalUrl: string
) {
  await sendEmail({
    to: email,
    subject: `Suscripción a ${planName} activada en Dchiripa Store`,
    html: `
      <h1>¡Suscripción activada!</h1>
      <p>Tu suscripción a <strong>${escapeHtml(planName)}</strong> está ahora activa.</p>
      <p><a href="${portalUrl}" style="background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Gestionar suscripción</a></p>
      <p>Desde el portal puedes actualizar tu método de pago, cambiar de plan o cancelar.</p>
    `,
  })
}