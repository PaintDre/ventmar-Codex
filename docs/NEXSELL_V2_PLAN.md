# Nexsell V2 — Plan de Producto

> Documento de contexto para desarrollo en VS Code + Claude Code.
> Última actualización: Mayo 2026

---

## 1. Por qué hacer el rebuild

| Problema actual | Impacto |
|----------------|---------|
| Codebase generado por Lovable | Difícil de mantener, escalar o debuggear |
| No hay usuarios pagantes aún | Cero riesgo de romper clientes activos |
| Equipo: solo founder + IA | Velocidad real de rebuild es alta |
| Nueva feature principal (video) | Demasiado complejo de injertarle a la base actual |

**Conclusión:** Rebuild limpio. Timing ideal. No esperar.

---

## 2. Stack técnico definitivo

```
Frontend     Next.js 15 + TypeScript + Tailwind + shadcn/ui
Base datos   Supabase (schema diseñado desde cero, migraciones limpias)
Auth         Supabase Auth
Storage      Supabase Storage (imágenes de productos, videos generados)
Edge Fns     Supabase Edge Functions (TypeScript) — lógica de negocio
Billing      Ver sección 6 (Stripe + Mercado Pago como opciones)
Video MVP    Creatomate API → luego Kling AI (avatares)
Banners      Servicio existente portado a Edge Function limpia
Deploy       Vercel
Errores      Sentry
Analytics    PostHog
```

---

## 3. V1 — Scope acotado (lo que entra)

El V1 es lo mínimo que hace que alguien pague. Sin features extras.

| Feature | Descripción |
|---------|-------------|
| Auth completo | Login, registro, recuperar contraseña, verificación email |
| Dashboard | Créditos restantes, generaciones del mes, productos cargados |
| Gestión de productos | Subir imágenes, nombre, precio, audiencia objetivo |
| Catálogo Dropi | Buscar, filtrar, importar productos del catálogo Dropi |
| Generador de banners | Templates listos, personalización básica, export PNG/JPG |
| Video Studio MVP | Templates Creatomate, sin avatar, export MP4 |
| Billing | Planes Free/Starter/Pro + recarga de créditos extra |
| Admin panel básico | Usuarios, MRR, generaciones totales, gestión de planes |

### Lo que NO entra en V1 (fases futuras)

| Feature | Fase |
|---------|------|
| Landing page generator | V3 — fase separada |
| Email automations | V3 — fase separada |
| Videos con avatar/voz (Kling AI) | V2 del video studio |
| Shopify integration | V3 |
| Templates avanzados de video | V2 |
| Multi-idioma en la app | V2 |

---

## 4. Fases de video (roadmap interno)

```
V1 — MVP Video Studio
  └── Creatomate API (templates predefinidos)
  └── Input: imagen producto + texto CTA + colores
  └── Output: MP4 15-30 segundos
  └── Sin avatar, sin voz

V2 — Video con Avatar
  └── Kling AI API
  └── Avatar parlante con guión generado por IA
  └── Output: MP4 30-60 segundos con presentador

V3 — Viral Machine
  └── Scraper de tendencias TikTok/Reels
  └── Adaptación automática de formato
  └── Integración directa con TikTok Business API
```

---

## 5. Sistema de créditos (modelo híbrido)

**Concepto:** El usuario paga cuota mensual (créditos incluidos) y puede comprar créditos extra que no vencen.

### Costo por generación

| Tipo de generación | Créditos | Costo API estimado | Margen objetivo |
|-------------------|----------|-------------------|-----------------|
| Banner IA | 1 crédito | ~$0.05 USD | ~69% |
| Video template (Creatomate, 30s) | 3 créditos | ~$0.12 USD | ~69% |
| Video con avatar/voz (Kling, 15-30s) | 10 créditos | ~$0.42–0.84 USD | ~32–48% |

**Regla:** Créditos del plan mensual vencen a fin de mes. Créditos de recarga extra no vencen nunca.

### Análisis vs competencia

| Tool | Plan base | Créditos | Precio/video estimado |
|------|-----------|----------|----------------------|
| AdCreative.ai | $29/mo | 10 downloads | $2.90/banner |
| Creatify.ai | $39/mo | ~10 videos | $3.90/video |
| Predis.ai | $19/mo | 1,300 microcredits | $0.73–2.92/video |
| **Nexsell** | $19/mo | 100 créditos | $0.57/video template |

**Conclusión:** Nexsell es más barato por generación Y más específico para dropshipping/Dropi. Fuerte diferenciador.

---

## 6. Planes y precios (pendiente decisión final)

### Precios en USD (moneda base internacional)

| Plan | USD/mes | Créditos/mes | Para quién |
|------|---------|-------------|------------|
| **Free** | $0 | 10 | Probar la app |
| **Starter** | $19 | 100 | Seller ocasional |
| **Pro** | $49 | 300 | Seller activo |

> **PENDIENTE:** Agregar plan Agency ($99/800 créditos) en V2 cuando haya demanda.

### Recargas de créditos extra (no vencen)

| Pack | USD | Créditos |
|------|-----|----------|
| Básico | $5 | 30 créditos |
| Estándar | $15 | 100 créditos |
| Pro | $30 | 280 créditos |

### Precios en monedas locales (LatAm)

Mostrar USD como precio base internacional. Para Argentina y Chile, mostrar equivalente referencial en moneda local (actualizado dinámicamente vía API de tipo de cambio).

```
Argentina (ARS): Cotización actualizada. Pago vía Mercado Pago.
Chile (CLP): Cotización actualizada. Pago vía Stripe o Mercado Pago.
Internacional: USD. Pago vía Stripe.
```

> **NOTA:** Los precios en ARS/CLP son referenciales. El cobro siempre es en USD o en la moneda del procesador local. No mostrar precio fijo en ARS por inflación.

---

## 7. Procesadores de pago — decisión pendiente

### Situación actual

| Procesador | Argentina | Chile | México | Brasil | Internacional |
|-----------|-----------|-------|--------|--------|---------------|
| **Stripe** | ❌ NO disponible | ✅ | ✅ | ✅ | ✅ |
| **Mercado Pago** | ✅ | ✅ | ✅ | ✅ | Limitado |

### Estrategia recomendada

**Fase 1 (V1):** Implementar solo Mercado Pago.
- Cubre Argentina (mercado principal), Chile, México, Brasil
- SDK más simple de implementar
- Suscripciones disponibles (Mercado Pago Subscriptions)
- Sin restricciones geográficas para el target principal

**Fase 2:** Agregar Stripe para usuarios de países no cubiertos por MP (USA, Europa, etc.)

> **PENDIENTE:** Confirmar si el modelo de subscriptions de Mercado Pago cubre el caso de uso de créditos mensuales + recargas. Testear en sandbox antes de decidir.

### Arquitectura de billing (abstracta)

Usar una capa de abstracción `billing-provider` que permita swapear Stripe/Mercado Pago sin tocar la lógica de negocio. El schema de Supabase no debe depender de IDs específicos de Stripe o MP.

---

## 8. Schema de base de datos (borrador)

### Tablas principales

```sql
-- Usuarios (extiende Supabase auth.users)
profiles
  id uuid PK → auth.users.id
  full_name text
  avatar_url text
  country text  -- 'AR', 'CL', 'MX', etc.
  preferred_currency text  -- 'USD', 'ARS', 'CLP'
  created_at timestamptz

-- Planes disponibles
plans
  id uuid PK
  name text  -- 'free', 'starter', 'pro'
  price_usd decimal
  credits_per_month int
  is_active bool

-- Subscripciones de usuario
subscriptions
  id uuid PK
  user_id uuid → profiles.id
  plan_id uuid → plans.id
  status text  -- 'active', 'cancelled', 'past_due'
  current_period_start timestamptz
  current_period_end timestamptz
  payment_provider text  -- 'stripe', 'mercadopago'
  provider_subscription_id text  -- ID externo del proveedor
  created_at timestamptz

-- Saldo de créditos
credit_balances
  id uuid PK
  user_id uuid → profiles.id
  monthly_credits int  -- créditos del plan (se resetean)
  extra_credits int    -- créditos de recarga (no vencen)
  monthly_reset_at timestamptz
  updated_at timestamptz

-- Transacciones de créditos
credit_transactions
  id uuid PK
  user_id uuid → profiles.id
  type text  -- 'monthly_grant', 'purchase', 'consumption', 'refund'
  amount int  -- positivo = agregar, negativo = consumir
  balance_after int
  reference_id uuid  -- ID de generación o pago
  description text
  created_at timestamptz

-- Productos del usuario
products
  id uuid PK
  user_id uuid → profiles.id
  name text
  description text
  price decimal
  currency text
  target_audience text
  source text  -- 'manual', 'dropi'
  dropi_product_id text  -- si viene de Dropi
  created_at timestamptz

-- Imágenes de productos
product_images
  id uuid PK
  product_id uuid → products.id
  storage_path text  -- path en Supabase Storage
  is_primary bool
  order_index int
  created_at timestamptz

-- Generaciones (banners y videos)
generations
  id uuid PK
  user_id uuid → profiles.id
  product_id uuid → products.id (nullable)
  type text  -- 'banner', 'video_template', 'video_avatar'
  status text  -- 'pending', 'processing', 'completed', 'failed'
  credits_used int
  provider text  -- 'internal', 'creatomate', 'kling'
  provider_job_id text
  output_url text  -- URL del resultado final
  template_id text
  params jsonb  -- parámetros de la generación
  error_message text
  created_at timestamptz
  completed_at timestamptz

-- Catálogo Dropi (cache local)
dropi_products
  id uuid PK
  dropi_id text UNIQUE
  name text
  description text
  category text
  price_base decimal
  images jsonb  -- array de URLs
  specs jsonb  -- atributos del producto
  is_available bool
  last_synced_at timestamptz

-- Pagos
payments
  id uuid PK
  user_id uuid → profiles.id
  amount decimal
  currency text
  status text  -- 'pending', 'completed', 'failed', 'refunded'
  payment_provider text  -- 'stripe', 'mercadopago'
  provider_payment_id text
  type text  -- 'subscription', 'credit_pack'
  credits_granted int
  created_at timestamptz
```

### Políticas RLS (Row Level Security)

- Todos los usuarios solo ven sus propios datos
- Admin role: acceso a todas las tablas
- `dropi_products`: lectura pública (es catálogo compartido)
- `plans`: lectura pública

---

## 9. Estructura del proyecto Next.js

```
nexsell-v2/
├── CLAUDE.md                    ← contexto para Claude Code
├── src/
│   ├── app/
│   │   ├── (auth)/              ← login, registro, reset
│   │   ├── (dashboard)/         ← área autenticada
│   │   │   ├── dashboard/       ← home con stats
│   │   │   ├── products/        ← gestión de productos
│   │   │   ├── dropi/           ← catálogo Dropi
│   │   │   ├── banners/         ← generador de banners
│   │   │   ├── videos/          ← video studio
│   │   │   └── billing/         ← planes y créditos
│   │   ├── (admin)/             ← panel admin
│   │   └── api/                 ← route handlers (webhooks)
│   ├── components/
│   │   ├── ui/                  ← shadcn/ui components
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── products/
│   │   ├── banners/
│   │   ├── videos/
│   │   └── billing/
│   ├── lib/
│   │   ├── supabase/            ← client, server, middleware
│   │   ├── billing/             ← abstracción billing provider
│   │   ├── creatomate/          ← cliente API video
│   │   ├── dropi/               ← cliente API Dropi
│   │   └── credits/             ← lógica de créditos
│   └── types/
│       └── database.ts          ← tipos generados de Supabase
├── supabase/
│   ├── migrations/              ← migraciones SQL
│   ├── functions/               ← Edge Functions
│   │   ├── generate-banner/
│   │   ├── generate-video/
│   │   ├── sync-dropi/
│   │   └── billing-webhook/
│   └── seed.sql
└── public/
    └── templates/               ← thumbnails de templates
```

---

## 10. APIs externas necesarias

| API | Para qué | Documentación |
|-----|---------|--------------|
| Supabase | DB, Auth, Storage, Edge Fns | supabase.com/docs |
| Creatomate | Render de videos template | creatomate.com/docs/api |
| Kling AI | Videos con avatar (V2) | klingai.com/developer |
| Mercado Pago | Billing LatAm | mercadopago.com.ar/developers |
| Stripe | Billing internacional (V2) | stripe.com/docs |
| Dropi API | Catálogo de productos | (credenciales del cliente) |
| ExchangeRate API | Tipo de cambio para mostrar precios locales | exchangerate-api.com |

---

## 11. Variables de entorno necesarias

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Creatomate
CREATOMATE_API_KEY=

# Kling AI (V2)
KLING_API_KEY=

# Mercado Pago
MP_ACCESS_TOKEN=
MP_PUBLIC_KEY=
MP_WEBHOOK_SECRET=

# Stripe (V2)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Dropi
DROPI_API_KEY=
DROPI_API_URL=

# Exchange Rate
EXCHANGE_RATE_API_KEY=

# App
NEXT_PUBLIC_APP_URL=
```

---

## 12. Decisiones pendientes (para resolver antes de codear)

- [ ] **Pricing final:** ¿Agregar plan Agency ($99) desde el inicio o solo en V2?
- [ ] **Billing V1:** ¿Solo Mercado Pago en V1 o también Stripe?
- [ ] **Reset de créditos:** ¿Se resetean el día 1 de cada mes o en el aniversario de suscripción?
- [ ] **Rollover:** ¿Los créditos mensuales no usados desaparecen o se traslada un % (ej: 20%)?
- [ ] **Dropi sync:** ¿Catálogo sincroniza automático (cron) o manual (botón)?
- [ ] **Templates de video:** ¿Cuántos templates en el MVP? ¿Quién los crea?
- [ ] **Límites del free:** ¿Los 10 créditos free son por siempre o solo el primer mes?
- [ ] **Admin:** ¿Quién puede ser admin? ¿Solo hardcoded en ENV o tabla en DB?

---

## 13. Orden de construcción sugerido (para Claude Code)

```
Semana 1 — Fundación
  1. Init proyecto Next.js 15 + Tailwind + shadcn/ui
  2. Supabase: crear proyecto, schema completo, migraciones
  3. Auth: login, registro, reset password, middleware
  4. Layouts base: auth layout, dashboard layout
  5. Dashboard básico (placeholder stats)

Semana 2 — Core features
  6. Gestión de productos (CRUD + upload imágenes)
  7. Catálogo Dropi (browse + importar)
  8. Créditos: mostrar balance, historial

Semana 3 — Generación
  9. Generador de banners (Edge Function + UI)
  10. Video Studio MVP (Creatomate API + UI)
  11. Galería de generaciones del usuario

Semana 4 — Billing
  12. Integración Mercado Pago (suscripciones)
  13. Recargas de créditos extra
  14. Webhooks de pago

Semana 5 — Admin y pulido
  15. Panel admin (usuarios, revenue, generaciones)
  16. Sentry + PostHog
  17. Testing end-to-end
  18. Deploy a Vercel
```

---

## 14. Notas de arquitectura importantes

### Abstracción del billing

```typescript
// lib/billing/types.ts
interface BillingProvider {
  createSubscription(params: CreateSubscriptionParams): Promise<Subscription>
  cancelSubscription(subscriptionId: string): Promise<void>
  createPaymentLink(params: CreatePaymentLinkParams): Promise<string>
  handleWebhook(payload: unknown, signature: string): Promise<BillingEvent>
}

// lib/billing/mercadopago.ts
export class MercadoPagoBilling implements BillingProvider { ... }

// lib/billing/stripe.ts
export class StripeBilling implements BillingProvider { ... }

// lib/billing/index.ts — selecciona el provider según ENV
export const billing = process.env.BILLING_PROVIDER === 'stripe'
  ? new StripeBilling()
  : new MercadoPagoBilling()
```

### Generación asíncrona de videos

Los videos no se generan en tiempo real — el usuario hace la petición y espera notificación.

```
Usuario → Edge Function (crea registro en generations, descuenta créditos)
         → llama Creatomate API en background
         → webhook de Creatomate cuando termina
         → actualiza generations.status = 'completed', guarda output_url
         → notifica al usuario (Supabase Realtime)
```

### Dropi catalog

El catálogo Dropi se sincroniza en background cada X horas (cron en Supabase) y se cachea en la tabla `dropi_products`. El usuario busca contra el caché local, no contra la API de Dropi en tiempo real.

---

*Este documento es el contexto de planificación del proyecto. Mantenerlo actualizado a medida que se toman decisiones.*
