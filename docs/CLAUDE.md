# CLAUDE.md — Nexsell V2

> Copiar este archivo como `CLAUDE.md` en la raíz del proyecto Nexsell V2 en VS Code.
> Claude Code lo leerá automáticamente al iniciar sesiones.

---

## Qué es este proyecto

**Nexsell** es un SaaS para dropshippers latinoamericanos que integra:
- Catálogo de productos Dropi (importar y gestionar productos)
- Generador de banners con IA
- Video Studio con templates (Creatomate) y futuramente avatares (Kling AI)
- Sistema de créditos con planes de suscripción

El V2 es un rebuild completo desde cero. La versión anterior fue generada con Lovable y tiene deuda técnica alta.

## Stack

- **Frontend:** Next.js 15, TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Video:** Creatomate API (MVP), Kling AI (V2)
- **Billing:** Mercado Pago (V1), Stripe (V2)
- **Deploy:** Vercel
- **Errores:** Sentry
- **Analytics:** PostHog

## Reglas de desarrollo

- TypeScript estricto. Sin `any`.
- shadcn/ui para todos los componentes UI. No crear componentes UI custom si shadcn lo tiene.
- Supabase Edge Functions para toda la lógica de negocio que toca APIs externas.
- RLS habilitado en todas las tablas. Nunca usar `service_role` key en el frontend.
- Cada operación que genera contenido primero verifica créditos disponibles antes de llamar a la API externa.
- Generación de videos es asíncrona. Nunca hacer el usuario esperar una respuesta en tiempo real.
- El billing es abstracto — no hardcodear lógica de Mercado Pago o Stripe en la UI.

## Comandos útiles

```bash
# Dev
npm run dev

# Type check
npm run type-check

# Supabase local
npx supabase start
npx supabase db reset

# Generar tipos de Supabase
npx supabase gen types typescript --local > src/types/database.ts

# Deploy Edge Functions
npx supabase functions deploy <function-name>
```

## Variables de entorno requeridas

Ver `.env.example` en la raíz del proyecto.

## Contexto completo del plan

Ver `docs/NEXSELL_V2_PLAN.md` para el plan completo, schema de DB, decisiones pendientes y roadmap.

## Lo que NO entra en V1

- Landing page generator (V3)
- Email automations (V3)
- Videos con avatar/voz (V2)
- Shopify integration (V3)
- Plan Agency (V2)
- Multi-idioma de la app (V2)
