# Dchiripa Store - Marketplace de archivos editables

Stack moderno para vender archivos editables (PSD, AI, Figma, plantillas) con suscripciones recurrentes.

## 🚀 Stack Tecnológico

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: PostgreSQL (Neon/Supabase) + Prisma ORM
- **Auth**: Better Auth (email/password + OAuth)
- **Payments**: Stripe (suscripciones + compras únicas)
- **Storage**: Cloudflare R2 (archivos) + CDN gratis
- **Email**: Resend
- **Deploy**: Vercel / Cloudflare Pages

## 📦 Instalación

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# 3. Configurar base de datos
npx prisma db push

# 4. Generar cliente Prisma
npx prisma generate

# 5. Iniciar desarrollo
npm run dev
```

## 🔧 Variables de Entorno Requeridas

```env
# Database (Neon/Supabase/PostgreSQL)
DATABASE_URL="postgresql://user:pass@host:5432/db"

# Better Auth
BETTER_AUTH_SECRET="secret-min-32-chars"
BETTER_AUTH_URL="http://localhost:3000"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRICE_MONTHLY="price_..."
STRIPE_PRICE_YEARLY="price_..."

# Cloudflare R2
R2_ACCOUNT_ID="your-account-id"
R2_ACCESS_KEY_ID="your-access-key-id"
R2_SECRET_ACCESS_KEY="your-secret-access-key"
R2_BUCKET_NAME="dchiripa-files"
R2_PUBLIC_URL="https://pub-xxx.r2.dev"

# Resend (Email)
RESEND_API_KEY="re_..."
EMAIL_FROM="Dchiripa Store <noreply@tudominio.com>"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="Dchiripa Store"
```

## 🏗️ Configuración de Servicios

### 1. Base de Datos (PostgreSQL)
- **Neon** (recomendado): `https://neon.tech` - Free tier generoso
- **Supabase**: `https://supabase.com` - Incluye auth + storage
- **Railway/Render**: Alternativas económicas

```bash
# Con Neon
npx prisma db push
```

### 2. Stripe
1. Crear cuenta en `https://stripe.com`
2. Obtener keys en Dashboard > Developers > API keys
3. Crear **Products & Prices**:
   - Producto "Suscripción Mensual" → Precio recurrente mensual (ej. 19€)
   - Producto "Suscripción Anual" → Precio recurrente anual (ej. 190€)
4. Copiar Price IDs a `.env`
5. Configurar webhook: `https://tudominio.com/api/webhooks/stripe`
   - Eventos: `checkout.session.completed`, `customer.subscription.*`, `invoice.payment_failed`

```bash
# Para desarrollo local
npm run stripe:listen
```

### 3. Cloudflare R2
1. Crear cuenta en `https://cloudflare.com`
2. Ir a R2 > Create bucket
3. Crear API Token con permisos R2 (Account > R2 > Edit)
4. Configurar bucket como público o usar signed URLs (recomendado)
5. Opcional: Custom domain para `R2_PUBLIC_URL`

### 4. Better Auth (OAuth opcional)
```env
# GitHub
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."

# Google
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
```

### 5. Resend (Email)
1. `https://resend.com` - 3000 emails/mes gratis
2. Verificar dominio
3. Crear API key

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...all]/       # Better Auth endpoints
│   │   ├── checkout/            # Crear sesiones Stripe
│   │   ├── webhooks/stripe/     # Stripe webhooks
│   │   ├── download/[id]/       # Descargas con signed URLs
│   │   ├── billing/portal/      # Stripe Billing Portal
│   │   ├── products/            # Catálogo API
│   │   └── dashboard/           # APIs protegidas usuario
│   ├── auth/login|register/     # Páginas auth
│   ├── dashboard/               # Panel usuario (protegido)
│   ├── productos/               # Catálogo público
│   └── precios/                 # Página de precios
├── components/
│   ├── ui/                      # shadcn/ui components
│   └── ...
├── lib/
│   ├── auth.ts                  # Better Auth config
│   ├── auth-client.ts           # Client-side auth
│   ├── stripe.ts                # Stripe helpers
│   ├── r2.ts                    # Cloudflare R2 helpers
│   ├── prisma.ts                # Prisma client
│   ├── email.ts                 # Resend helpers
│   └── utils.ts                 # Utilidades
└── hooks/
    └── use-toast.ts             # Toast notifications
```

## 🔐 Flujo de Compra y Descarga

1. **Usuario compra** → `POST /api/checkout` → Stripe Checkout
2. **Stripe webhook** → `checkout.session.completed` → Crea `Purchase` en BD
3. **Usuario descarga** → `GET /api/download/:productId` → Verifica acceso → Genera signed URL R2 → Redirect 302

## 🛡️ Seguridad

- **Signed URLs R2**: Expiran en 24h, no exponen bucket
- **Verificación de acceso**: Compra completada O suscripción activa
- **Rate limiting**: Implementar con Upstash Redis en producción
- **CSP Headers**: Configurar en `next.config.js`

## 🚀 Deploy en Vercel

1. Push a GitHub
2. Importar en Vercel
3. Añadir Environment Variables
4. Configurar dominio custom
5. Actualizar `STRIPE_WEBHOOK_SECRET` con URL de producción

## 📝 Comandos Útiles

```bash
# Desarrollo
npm run dev

# Base de datos
npm run db:push      # Push schema changes
npm run db:studio    # Prisma Studio UI

# Stripe
npm run stripe:listen  # Webhook forwarding local

# Build
npm run build
npm run start

# Lint
npm run lint
```

## 🎯 Próximos Pasos

- [ ] Panel de administración para subir productos
- [ ] Sistema de reseñas/valoraciones
- [ ] Cupones y códigos descuento
- [ ] Afiliados/referidos
- [ ] Analytics (Plausible/PostHog)
- [ ] Tests E2E (Playwright)
- [ ] CI/CD con GitHub Actions

## 📄 Licencia

MIT - Úsalo libremente para tus proyectos.