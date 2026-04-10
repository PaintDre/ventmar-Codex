# Ventmar Codex

Landing y sistema de onboarding inteligente para el ecosistema Ventmar Argentina. Formulario multi-paso que filtra usuarios por perfil comercial y los conecta con las herramientas y servicios adecuados.

## 🚀 Características

- **Onboarding Inteligente**: Formulario adaptativo con 8 rutas especializadas
- **Filtrado por Perfil**: Dropshippers, proveedores, servicios, eventos
- **Integración Supabase**: Base de datos para almacenamiento de leads
- **Responsive Design**: Optimizado para móvil y desktop
- **TypeScript**: Código tipado para mayor robustez

## 🛠️ Stack Tecnológico

- **Framework**: Next.js 16.2.2 (App Router)
- **UI**: React 19, Tailwind CSS 4
- **Base de Datos**: Supabase
- **Lenguaje**: TypeScript
- **Despliegue**: Vercel

## 📋 Rutas del Formulario

1. **Dropshipper** (5 pasos): Nivel → Ventas → Necesidades → Contacto
2. **Proveedor** (6 pasos): Tipo → Situación → Categorías → Reunión → Contacto
3. **WhatsApp IA** (5 pasos): Negocio → Objetivos → Situación → Contacto
4. **Landing Conversión** (4 pasos): Necesidad → Objetivo → Contacto
5. **Banners Publicitarios** (4 pasos): Tipo → Objetivo → Contacto
6. **Contenido Redes** (4 pasos): Tipo → Objetivo → Contacto
7. **Evento Privado** (3 pasos): Interés → Contacto + DNI
8. **Explorador** (3 pasos): Qué conocer → Contacto

## ⚙️ Configuración

### Variables de Entorno

Crea un archivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-publica-anonima
```

### Instalación y Desarrollo

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Build para producción
npm run build

# Ejecutar en producción
npm run start
```

## 🚀 Despliegue en Vercel

### Opción 1: Deploy Automático (Recomendado)

1. Conecta tu repositorio de GitHub a Vercel
2. Vercel detectará automáticamente la configuración de Next.js
3. Configura las variables de entorno en el dashboard de Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Opción 2: CLI de Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Configurar variables de entorno
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
```

## 📊 Base de Datos Supabase

### Tabla Requerida: `Formularios`

Campos necesarios (puedes agregar más según necesites):

```sql
CREATE TABLE Formularios (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP DEFAULT NOW(),
  interes_principal TEXT,
  -- Campos de dropshipper
  nivel_dropshipper TEXT,
  ventas_mensuales TEXT,
  busca_principal TEXT,
  -- Campos de proveedor
  tipo_proveedor TEXT,
  situacion_proveedor TEXT,
  categorias_proveedor TEXT[],
  interes_reunion_proveedor TEXT,
  -- Campos WhatsApp
  tipo_negocio_whatsapp TEXT,
  que_lograr_whatsapp TEXT,
  situacion_actual_whatsapp TEXT,
  -- Campos landing
  que_necesitas_landing TEXT,
  objetivo_landing TEXT,
  -- Campos banners
  tipo_banners TEXT,
  que_buscas_banners TEXT,
  -- Campos contenido
  contenido_redes TEXT,
  objetivo_contenido TEXT,
  -- Campos evento
  que_interesa_evento TEXT,
  -- Campos explorador
  que_conocer TEXT,
  -- Datos comunes
  nombre TEXT,
  whatsapp TEXT,
  email TEXT,
  ciudad TEXT,
  empresa_marca TEXT,
  dni TEXT
);
```

## 🎯 Próximos Pasos

- [ ] Configurar políticas RLS en Supabase
- [ ] Agregar validaciones adicionales
- [ ] Implementar analytics
- [ ] Optimizar performance
- [ ] Agregar tests automatizados

## 📝 Licencia

Privado - Ventmar Argentina
