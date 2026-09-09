import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { prisma } from './prisma'
import { sendEmail } from './email'

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async (user, url) => {
      await sendEmail({
        to: user.email,
        subject: 'Restablece tu contraseña',
        html: `
          <p>Hola ${user.name || 'usuario'},</p>
          <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
          <p><a href="${url}">${url}</a></p>
          <p>Este enlace expira en 1 hora.</p>
        `,
      })
    },
  },
  emailVerification: {
    sendVerificationEmail: async (user, url) => {
      await sendEmail({
        to: user.email,
        subject: 'Verifica tu email en Dchiripa Store',
        html: `
          <p>Hola ${user.name || 'usuario'},</p>
          <p>Gracias por registrarte. Verifica tu email haciendo clic aquí:</p>
          <p><a href="${url}">${url}</a></p>
        `,
      })
    },
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    },
  },
  advanced: {
    crossSubDomainCookies: {
      enabled: false,
    },
  },
})

export type Session = typeof auth.$Infer.Session
export type User = typeof auth.$Infer.Session.user