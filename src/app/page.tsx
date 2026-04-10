"use client";

import Image from "next/image";
import { createClient, type PostgrestError } from "@supabase/supabase-js";
import { type ChangeEvent, type FormEvent, useEffect, useRef, useState } from "react";

type InteresPrincipal =
  | "Quiero vender productos con Ventmar"
  | "Soy proveedor y quiero trabajar con Ventmar"
  | "Me interesa el agente IA para WhatsApp"
  | "Me interesa una landing de alta conversión"
  | "Me interesan banners publicitarios"
  | "Me interesa contenido para redes"
  | "Quiero conocer primero cómo funciona"
  | "Quiero asistir a un evento privado";

type NivelDropshipper = "Estoy empezando" | "Ya vendo regularmente" | "Escalo campañas activas";
type VentasMensuales = "Aún no vendo" | "1 a 10 ventas al mes" | "10 a 50 ventas al mes" | "50 a 100 ventas al mes" | "100+ ventas al mes";
type BuscaPrincipal = "Productos listos para vender" | "Mejor logística" | "Acceso a comunidad" | "Mentoría / acompañamiento" | "Participar en reunión privada";
type TipoProveedor = "Importador" | "Mayorista local" | "Fabricante" | "Marca propia";
type SituacionProveedor = "Estoy validando catálogo" | "Ya tengo stock listo para vender" | "Ya abastezco tiendas" | "Quiero una alianza comercial";
type CategoriaProveedor = "Hogar" | "Tecnología" | "Belleza" | "Cocina" | "Herramientas" | "Salud" | "Fitness" | "Otra";
type TipoNegocio = "Tienda online" | "Marca personal" | "E-commerce con WhatsApp" | "Agencia" | "Otro";
type QueLograrWhatsApp = "Responder más rápido" | "Automatizar ventas" | "Recuperar leads" | "Cerrar más ventas" | "Soporte al cliente";
type SituacionActualWhatsApp = "Atiendo manualmente" | "Tengo muchas consultas" | "Ya vendo pero quiero automatizar" | "Ya uso herramientas pero quiero algo mejor";
type QueNecesitasLanding = "Landing para un producto" | "Landing para un servicio" | "Landing para tienda / marca" | "Optimizar una landing existente";
type ObjetivoLanding = "Vender más" | "Mejorar conversión" | "Lanzar producto" | "Validar una oferta";
type TipoBanners = "Meta Ads" | "Shopify / web" | "Promociones" | "Retargeting" | "Catálogo / carrusel";
type QueBuscasBanners = "Más clics" | "Mejor imagen de marca" | "Más conversiones" | "Creatividades para campañas";
type ContenidoRedes = "Post para Instagram" | "Historias" | "Reels / ideas visuales" | "Copys" | "Calendario de contenido";
type ObjetivoContenido = "Vender más" | "Tener presencia en redes" | "Crear contenido constante" | "Escalar una marca";
type QueInteresaEvento = "Networking" | "Aprender de Ventmar" | "Conocer proveedores" | "Conocer herramientas" | "Crecer en e-commerce";
type QueConocer = "Cómo vender con Ventmar" | "Cómo funciona la comunidad" | "Qué productos manejan" | "Qué servicios ofrecen";

type FormData = {
  interes_principal: InteresPrincipal | "";
  // Dropshipper
  nivel_dropshipper: NivelDropshipper | "";
  ventas_mensuales: VentasMensuales | "";
  busca_principal: BuscaPrincipal | "";
  // Proveedor
  tipo_proveedor: TipoProveedor | "";
  situacion_proveedor: SituacionProveedor | "";
  categorias_proveedor: CategoriaProveedor[];
  interes_reunion_proveedor: "Sí" | "No" | "";
  // WhatsApp IA
  tipo_negocio_whatsapp: TipoNegocio | "";
  que_lograr_whatsapp: QueLograrWhatsApp | "";
  situacion_actual_whatsapp: SituacionActualWhatsApp | "";
  // Landing
  que_necesitas_landing: QueNecesitasLanding | "";
  objetivo_landing: ObjetivoLanding | "";
  // Banners
  tipo_banners: TipoBanners | "";
  que_buscas_banners: QueBuscasBanners | "";
  // Contenido
  contenido_redes: ContenidoRedes | "";
  objetivo_contenido: ObjetivoContenido | "";
  // Evento
  que_interesa_evento: QueInteresaEvento | "";
  // Explorador
  que_conocer: QueConocer | "";
  // Datos comunes
  nombre: string;
  whatsapp: string;
  email: string;
  ciudad: string;
  empresa_marca?: string;
  dni?: string;
};

type FeedbackState = { type: "idle" | "success" | "error"; message: string };
type InsertPayload = Record<string, string | string[]>;

const TABLE_NAME = "Formularios";
const FORM_FIELDS = [
  "interes_principal",
  "nivel_dropshipper",
  "ventas_mensuales",
  "busca_principal",
  "tipo_proveedor",
  "situacion_proveedor",
  "categorias_proveedor",
  "interes_reunion_proveedor",
  "tipo_negocio_whatsapp",
  "que_lograr_whatsapp",
  "situacion_actual_whatsapp",
  "que_necesitas_landing",
  "objetivo_landing",
  "tipo_banners",
  "que_buscas_banners",
  "contenido_redes",
  "objetivo_contenido",
  "que_interesa_evento",
  "que_conocer",
  "nombre",
  "whatsapp",
  "email",
  "ciudad",
  "empresa_marca",
  "dni",
] as const;
const COLUMN_CANDIDATES: Record<(typeof FORM_FIELDS)[number], string[]> = {
  interes_principal: ["interes_principal"],
  nivel_dropshipper: ["nivel_dropshipper"],
  ventas_mensuales: ["ventas_mensuales"],
  busca_principal: ["busca_principal"],
  tipo_proveedor: ["tipo_proveedor"],
  situacion_proveedor: ["situacion_proveedor"],
  categorias_proveedor: ["categorias_proveedor"],
  interes_reunion_proveedor: ["interes_reunion_proveedor"],
  tipo_negocio_whatsapp: ["tipo_negocio_whatsapp"],
  que_lograr_whatsapp: ["que_lograr_whatsapp"],
  situacion_actual_whatsapp: ["situacion_actual_whatsapp"],
  que_necesitas_landing: ["que_necesitas_landing"],
  objetivo_landing: ["objetivo_landing"],
  tipo_banners: ["tipo_banners"],
  que_buscas_banners: ["que_buscas_banners"],
  contenido_redes: ["contenido_redes"],
  objetivo_contenido: ["objetivo_contenido"],
  que_interesa_evento: ["que_interesa_evento"],
  que_conocer: ["que_conocer"],
  nombre: ["nombre"],
  whatsapp: ["whatsapp"],
  email: ["email"],
  ciudad: ["ciudad"],
  empresa_marca: ["empresa_marca"],
  dni: ["dni"],
};

const INTERES_OPTIONS: InteresPrincipal[] = [
  "Quiero vender productos con Ventmar",
  "Soy proveedor y quiero trabajar con Ventmar",
  "Me interesa el agente IA para WhatsApp",
  "Me interesa una landing de alta conversión",
  "Me interesan banners publicitarios",
  "Me interesa contenido para redes",
  "Quiero conocer primero cómo funciona",
  "Quiero asistir a un evento privado",
];

const NIVEL_DROPSHIPPER_OPTIONS: NivelDropshipper[] = ["Estoy empezando", "Ya vendo regularmente", "Escalo campañas activas"];
const VENTAS_MENSUALES_OPTIONS: VentasMensuales[] = ["Aún no vendo", "1 a 10 ventas al mes", "10 a 50 ventas al mes", "50 a 100 ventas al mes", "100+ ventas al mes"];
const BUSCA_PRINCIPAL_OPTIONS: BuscaPrincipal[] = ["Productos listos para vender", "Mejor logística", "Acceso a comunidad", "Mentoría / acompañamiento", "Participar en reunión privada"];

const TIPO_PROVEEDOR_OPTIONS: TipoProveedor[] = ["Importador", "Mayorista local", "Fabricante", "Marca propia"];
const SITUACION_PROVEEDOR_OPTIONS: SituacionProveedor[] = ["Estoy validando catálogo", "Ya tengo stock listo para vender", "Ya abastezco tiendas", "Quiero una alianza comercial"];
const CATEGORIA_PROVEEDOR_OPTIONS: CategoriaProveedor[] = ["Hogar", "Tecnología", "Belleza", "Cocina", "Herramientas", "Salud", "Fitness", "Otra"];

const SEGMENTS = [
  {
    eyebrow: "Perfil 01",
    title: "Estoy empezando",
    description: "Para quienes están entrando al juego y necesitan productos, criterio y estructura para vender mejor.",
  },
  {
    eyebrow: "Perfil 02",
    title: "Ya vendo regularmente",
    description: "Para operadores que buscan nuevos proveedores, stock local y oportunidades más estables.",
  },
  {
    eyebrow: "Perfil 03",
    title: "Escalo campañas activas",
    description: "Para quienes ya tienen volumen y quieren networking, velocidad operativa y mejor oferta.",
  },
];

const TIPO_NEGOCIO_WHATSAPP_OPTIONS: TipoNegocio[] = ["Tienda online", "Marca personal", "E-commerce con WhatsApp", "Agencia", "Otro"];
const QUE_LOGRAR_WHATSAPP_OPTIONS: QueLograrWhatsApp[] = ["Responder más rápido", "Automatizar ventas", "Recuperar leads", "Cerrar más ventas", "Soporte al cliente"];
const SITUACION_ACTUAL_WHATSAPP_OPTIONS: SituacionActualWhatsApp[] = ["Atiendo manualmente", "Tengo muchas consultas", "Ya vendo pero quiero automatizar", "Ya uso herramientas pero quiero algo mejor"];

const QUE_NECESITAS_LANDING_OPTIONS: QueNecesitasLanding[] = ["Landing para un producto", "Landing para un servicio", "Landing para tienda / marca", "Optimizar una landing existente"];
const OBJETIVO_LANDING_OPTIONS: ObjetivoLanding[] = ["Vender más", "Mejorar conversión", "Lanzar producto", "Validar una oferta"];

const TIPO_BANNERS_OPTIONS: TipoBanners[] = ["Meta Ads", "Shopify / web", "Promociones", "Retargeting", "Catálogo / carrusel"];
const QUE_BUSCAS_BANNERS_OPTIONS: QueBuscasBanners[] = ["Más clics", "Mejor imagen de marca", "Más conversiones", "Creatividades para campañas"];

const CONTENIDO_REDES_OPTIONS: ContenidoRedes[] = ["Post para Instagram", "Historias", "Reels / ideas visuales", "Copys", "Calendario de contenido"];
const OBJETIVO_CONTENIDO_OPTIONS: ObjetivoContenido[] = ["Vender más", "Tener presencia en redes", "Crear contenido constante", "Escalar una marca"];

const QUE_INTERESA_EVENTO_OPTIONS: QueInteresaEvento[] = ["Networking", "Aprender de Ventmar", "Conocer proveedores", "Conocer herramientas", "Crecer en e-commerce"];

const QUE_CONOCER_OPTIONS: QueConocer[] = ["Cómo vender con Ventmar", "Cómo funciona la comunidad", "Qué productos manejan", "Qué servicios ofrecen"];

const INITIAL_FORM_DATA: FormData = {
  interes_principal: "",
  nivel_dropshipper: "",
  ventas_mensuales: "",
  busca_principal: "",
  tipo_proveedor: "",
  situacion_proveedor: "",
  categorias_proveedor: [],
  interes_reunion_proveedor: "",
  tipo_negocio_whatsapp: "",
  que_lograr_whatsapp: "",
  situacion_actual_whatsapp: "",
  que_necesitas_landing: "",
  objetivo_landing: "",
  tipo_banners: "",
  que_buscas_banners: "",
  contenido_redes: "",
  objetivo_contenido: "",
  que_interesa_evento: "",
  que_conocer: "",
  nombre: "",
  whatsapp: "",
  email: "",
  ciudad: "",
  empresa_marca: "",
  dni: "",
};

const EMPTY_FEEDBACK: FeedbackState = { type: "idle", message: "" };
const fieldClass =
  "w-full rounded-2xl border border-[#D9D9D9] bg-white px-4 py-3 text-slate-950 outline-none transition duration-200 placeholder:text-slate-400 focus:border-[#F26122] focus:ring-4 focus:ring-[#F26122]/15";
const primaryButtonClass =
  "inline-flex items-center justify-center rounded-2xl bg-[#F26122] px-5 py-3 text-sm font-semibold text-white transition duration-200 hover:bg-[#D94E14] disabled:cursor-not-allowed disabled:bg-[#f5a47d]";
const secondaryLightButtonClass =
  "inline-flex items-center justify-center rounded-2xl border border-[#D9D9D9] bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition duration-200 hover:border-[#2E6FD8]/45 hover:text-[#2E6FD8] disabled:cursor-not-allowed disabled:opacity-40";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const hasPlaceholderAnonKey = supabaseAnonKey.startsWith("process.env.");
const canUseSupabase = Boolean(supabaseUrl && supabaseAnonKey && !hasPlaceholderAnonKey);
const supabase = canUseSupabase ? createClient(supabaseUrl, supabaseAnonKey) : null;

function validateStep(step: number, data: FormData) {
  if (step === 1 && !data.interes_principal) {
    return "Selecciona qué te interesa de Ventmar para continuar.";
  }

  // Validation for dropshipper path
  if (data.interes_principal === "Quiero vender productos con Ventmar") {
    if (step === 2 && !data.nivel_dropshipper) {
      return "Selecciona tu nivel de experiencia.";
    }
    if (step === 3 && !data.ventas_mensuales) {
      return "Selecciona tus ventas mensuales aproximadas.";
    }
    if (step === 4 && !data.busca_principal) {
      return "Selecciona qué buscas principalmente.";
    }
    if (step === 5) {
      if (!data.nombre.trim()) return "Ingresa tu nombre completo.";
      if (!data.whatsapp.trim()) return "Ingresa tu número de WhatsApp.";
      if (!data.email.trim()) return "Ingresa tu email.";
      if (!data.ciudad.trim()) return "Ingresa tu ciudad.";
      if (data.busca_principal === "Participar en reunión privada" && !data.dni?.trim()) {
        return "Ingresa tu DNI para el evento privado.";
      }
    }
  }

  // Validation for provider path
  if (data.interes_principal === "Soy proveedor y quiero trabajar con Ventmar") {
    if (step === 2 && !data.tipo_proveedor) {
      return "Selecciona qué tipo de proveedor sos.";
    }
    if (step === 3 && !data.situacion_proveedor) {
      return "Selecciona tu situación actual.";
    }
    if (step === 4 && data.categorias_proveedor.length === 0) {
      return "Selecciona al menos una categoría que manejas.";
    }
    if (step === 5 && !data.interes_reunion_proveedor) {
      return "Selecciona si te interesa participar en una reunión privada.";
    }
    if (step === 6) {
      if (!data.nombre.trim()) return "Ingresa tu nombre completo.";
      if (!data.whatsapp.trim()) return "Ingresa tu número de WhatsApp.";
      if (!data.email.trim()) return "Ingresa tu email.";
      if (!data.ciudad.trim()) return "Ingresa tu ciudad.";
      if (!data.empresa_marca?.trim()) return "Ingresa el nombre de tu empresa o marca.";
    }
  }

  // Validation for WhatsApp IA path
  if (data.interes_principal === "Me interesa el agente IA para WhatsApp") {
    if (step === 2 && !data.tipo_negocio_whatsapp) {
      return "Selecciona qué tipo de negocio tienes.";
    }
    if (step === 3 && !data.que_lograr_whatsapp) {
      return "Selecciona qué quieres lograr con WhatsApp.";
    }
    if (step === 4 && !data.situacion_actual_whatsapp) {
      return "Selecciona tu situación actual.";
    }
    if (step === 5) {
      if (!data.nombre.trim()) return "Ingresa tu nombre completo.";
      if (!data.whatsapp.trim()) return "Ingresa tu número de WhatsApp.";
      if (!data.email.trim()) return "Ingresa tu email.";
      if (!data.ciudad.trim()) return "Ingresa tu ciudad.";
    }
  }

  // Validation for landing path
  if (data.interes_principal === "Me interesa una landing de alta conversión") {
    if (step === 2 && !data.que_necesitas_landing) {
      return "Selecciona qué necesitas.";
    }
    if (step === 3 && !data.objetivo_landing) {
      return "Selecciona cuál es tu objetivo.";
    }
    if (step === 4) {
      if (!data.nombre.trim()) return "Ingresa tu nombre completo.";
      if (!data.whatsapp.trim()) return "Ingresa tu número de WhatsApp.";
      if (!data.email.trim()) return "Ingresa tu email.";
      if (!data.ciudad.trim()) return "Ingresa tu ciudad.";
    }
  }

  // Validation for banners path
  if (data.interes_principal === "Me interesan banners publicitarios") {
    if (step === 2 && !data.tipo_banners) {
      return "Selecciona qué tipo de banners necesitas.";
    }
    if (step === 3 && !data.que_buscas_banners) {
      return "Selecciona qué buscas.";
    }
    if (step === 4) {
      if (!data.nombre.trim()) return "Ingresa tu nombre completo.";
      if (!data.whatsapp.trim()) return "Ingresa tu número de WhatsApp.";
      if (!data.email.trim()) return "Ingresa tu email.";
      if (!data.ciudad.trim()) return "Ingresa tu ciudad.";
    }
  }

  // Validation for content path
  if (data.interes_principal === "Me interesa contenido para redes") {
    if (step === 2 && !data.contenido_redes) {
      return "Selecciona qué contenido necesitas.";
    }
    if (step === 3 && !data.objetivo_contenido) {
      return "Selecciona cuál es tu objetivo.";
    }
    if (step === 4) {
      if (!data.nombre.trim()) return "Ingresa tu nombre completo.";
      if (!data.whatsapp.trim()) return "Ingresa tu número de WhatsApp.";
      if (!data.email.trim()) return "Ingresa tu email.";
      if (!data.ciudad.trim()) return "Ingresa tu ciudad.";
    }
  }

  // Validation for event path
  if (data.interes_principal === "Quiero asistir a un evento privado") {
    if (step === 2 && !data.que_interesa_evento) {
      return "Selecciona qué te interesa del evento.";
    }
    if (step === 3) {
      if (!data.nombre.trim()) return "Ingresa tu nombre completo.";
      if (!data.whatsapp.trim()) return "Ingresa tu número de WhatsApp.";
      if (!data.email.trim()) return "Ingresa tu email.";
      if (!data.ciudad.trim()) return "Ingresa tu ciudad.";
      if (!data.dni?.trim()) return "Ingresa tu DNI para validar el acceso.";
    }
  }

  // Validation for explorer path
  if (data.interes_principal === "Quiero conocer primero cómo funciona") {
    if (step === 2 && !data.que_conocer) {
      return "Selecciona qué te interesa conocer.";
    }
    if (step === 3) {
      if (!data.nombre.trim()) return "Ingresa tu nombre completo.";
      if (!data.whatsapp.trim()) return "Ingresa tu número de WhatsApp.";
      if (!data.email.trim()) return "Ingresa tu email.";
      if (!data.ciudad.trim()) return "Ingresa tu ciudad.";
    }
  }

  return "";
}

function logSupabaseDiagnostics(error: PostgrestError | null, payload: InsertPayload) {
  if (!error) return;
  console.error("Supabase insert error:", error);
  if (error.message.includes(`relation "${TABLE_NAME}" does not exist`)) {
    console.warn(`Warning: verifica que la tabla "${TABLE_NAME}" exista en Supabase.`);
  }
  if (error.message.includes("Could not find the")) {
    const column = error.message.match(/'([^']+)' column/)?.[1];
    if (column) console.warn(`Warning: la columna "${column}" no existe en la tabla ${TABLE_NAME}.`);
  }
  FORM_FIELDS.forEach((field) => {
    if (!COLUMN_CANDIDATES[field].some((candidate) => candidate in payload)) {
      console.warn(`Warning: el campo "${field}" no esta presente en el payload de insert.`);
    }
  });
}

function getMissingColumnFromError(error: PostgrestError | null) {
  if (!error || error.code !== "PGRST204") return null;
  return error.message.match(/'([^']+)' column/)?.[1] ?? null;
}

function isRlsError(error: PostgrestError | null) {
  return Boolean(
    error &&
      (error.code === "42501" ||
        error.message.toLowerCase().includes("row-level security")),
  );
}

async function insertWithFallback(payload: InsertPayload) {
  if (!supabase) {
    throw new Error("Supabase no inicializado.");
  }

  let nextPayload: Partial<InsertPayload> = { ...payload };

  for (let attempt = 0; attempt < FORM_FIELDS.length; attempt += 1) {
    const { error } = await supabase.from(TABLE_NAME).insert([nextPayload]);

    if (!error) {
      return;
    }

    logSupabaseDiagnostics(error, nextPayload as InsertPayload);

    const missingColumn = getMissingColumnFromError(error);
    if (!missingColumn || !(missingColumn in nextPayload)) {
      throw error;
    }

    console.warn(
      `Warning: reintentando insert sin la columna "${missingColumn}" porque no existe en la tabla ${TABLE_NAME}.`,
    );
    delete nextPayload[missingColumn as keyof InsertPayload];
  }

  throw new Error("No fue posible insertar el formulario tras varios reintentos.");
}

async function probeColumn(fieldName: string) {
  const response = await fetch(
    `${supabaseUrl}/rest/v1/${TABLE_NAME}?select=${encodeURIComponent(fieldName)}&limit=1`,
    {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
    },
  );

  return response.ok;
}

function buildInsertPayload(data: FormData, availableColumns: Set<string>) {
  const payload: InsertPayload = {};

  FORM_FIELDS.forEach((field) => {
    const targetColumn = COLUMN_CANDIDATES[field].find((candidate) =>
      availableColumns.has(candidate),
    );

    if (!targetColumn) {
      return;
    }

    if (field === "categorias_proveedor") {
      payload[targetColumn] = data.categorias_proveedor;
      return;
    }

    const value = data[field];
    if (value === undefined) {
      return;
    }

    payload[targetColumn] = value as string | string[];
  });

  return payload;
}

function InputField(props: {
  id: keyof FormData;
  label: string;
  type?: string;
  value: string;
  placeholder: string;
  required?: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  autoComplete?: string;
  className?: string;
}) {
  return (
    <div className={props.className ?? "space-y-2"}>
      <label className="text-sm font-medium text-slate-800" htmlFor={props.id}>
        {props.label}
      </label>
      <input
        id={props.id}
        name={props.id}
        type={props.type ?? "text"}
        value={props.value}
        onChange={props.onChange}
        placeholder={props.placeholder}
        className={fieldClass}
        required={props.required}
        inputMode={props.inputMode}
        autoComplete={props.autoComplete}
      />
    </div>
  );
}

function SelectField(props: {
  id: keyof FormData;
  label: string;
  value: string;
  options: readonly string[];
  required?: boolean;
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-800" htmlFor={props.id}>
        {props.label}
      </label>
      <select
        id={props.id}
        name={props.id}
        value={props.value}
        onChange={props.onChange}
        className={fieldClass}
        required={props.required}
      >
        <option value="">Selecciona una opción</option>
        {props.options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function CheckboxGroup(props: {
  label: string;
  options: readonly string[];
  selected: string[];
  onToggle: (option: string) => void;
}) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-slate-800">{props.label}</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {props.options.map((option) => {
          const active = props.selected.includes(option);
          return (
            <label
              key={option}
              className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 transition ${
                active
                  ? "border-[#F26122] bg-[#F26122]/10 text-[#B94818]"
                  : "border-[#D9D9D9] bg-white text-slate-700 hover:border-[#2E6FD8]/35"
              }`}
            >
              <input
                type="checkbox"
                checked={active}
                onChange={() => props.onToggle(option)}
                className="h-4 w-4 rounded border-slate-300 text-[#F26122] focus:ring-[#F26122]"
              />
              <span className="text-sm font-medium">{option}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

export default function HomePage() {
  const [screenMode, setScreenMode] = useState<"apply" | "success">("apply");
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [feedback, setFeedback] = useState<FeedbackState>(EMPTY_FEEDBACK);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableColumns, setAvailableColumns] = useState<Set<string>>(new Set());
  const formSectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!supabaseUrl) console.warn("Warning: falta NEXT_PUBLIC_SUPABASE_URL.");
    if (!supabaseAnonKey) console.warn("Warning: falta NEXT_PUBLIC_SUPABASE_ANON_KEY.");
    if (hasPlaceholderAnonKey) {
      console.warn(
        "Warning: NEXT_PUBLIC_SUPABASE_ANON_KEY tiene un placeholder literal. Debe contener la anon key real de Supabase.",
      );
    }
  }, []);

  useEffect(() => {
    if (!canUseSupabase) {
      return;
    }

    let isActive = true;

    async function loadAvailableColumns() {
      const checks = await Promise.all(
        Object.values(COLUMN_CANDIDATES)
          .flat()
          .filter((value, index, array) => array.indexOf(value) === index)
          .map(async (column) => ({
            column,
            exists: await probeColumn(column),
          })),
      );

      if (!isActive) {
        return;
      }

      const nextColumns = new Set(
        checks.filter((check) => check.exists).map((check) => check.column),
      );

      setAvailableColumns(nextColumns);

      const missingFields = FORM_FIELDS.filter(
        (field) =>
          !COLUMN_CANDIDATES[field].some((candidate) => nextColumns.has(candidate)),
      );

      if (missingFields.length > 0) {
        console.warn(
          `Warning: la tabla ${TABLE_NAME} no tiene estas columnas del onboarding: ${missingFields.join(", ")}.`,
        );
      }
    }

    loadAvailableColumns().catch((error) => {
      console.error("Supabase schema probe error:", error);
    });

    return () => {
      isActive = false;
    };
  }, []);

  const getTotalSteps = () => {
    if (!formData.interes_principal) return 1;
    switch (formData.interes_principal) {
      case "Quiero vender productos con Ventmar":
        return 5;
      case "Soy proveedor y quiero trabajar con Ventmar":
        return 6;
      case "Me interesa el agente IA para WhatsApp":
        return 5;
      case "Me interesa una landing de alta conversión":
        return 4;
      case "Me interesan banners publicitarios":
        return 4;
      case "Me interesa contenido para redes":
        return 4;
      case "Quiero conocer primero cómo funciona":
        return 3;
      case "Quiero asistir a un evento privado":
        return 3;
      default:
        return 1;
    }
  };

  const progress = (currentStep / getTotalSteps()) * 100;

  function scrollToForm() {
    formSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    requestAnimationFrame(() => {
      formSectionRef.current?.focus();
    });
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetApplication() {
    setFeedback(EMPTY_FEEDBACK);
    setFormData(INITIAL_FORM_DATA);
    setCurrentStep(1);
    setScreenMode("apply");
    requestAnimationFrame(() => {
      scrollToForm();
    });
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const key = event.target.name as keyof FormData;
    setFormData((current) => ({ ...current, [key]: event.target.value }) as FormData);
  }

  function handleSelectChange(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const key = event.target.name as keyof FormData;
    setFormData((current) => ({ ...current, [key]: event.target.value }) as FormData);
  }

  function handleCategoryToggle(category: CategoriaProveedor) {
    setFormData((current) => ({
      ...current,
      categorias_proveedor: current.categorias_proveedor.includes(category)
        ? current.categorias_proveedor.filter((item) => item !== category)
        : [...current.categorias_proveedor, category],
    }));
  }

  function nextStep() {
    const message = validateStep(currentStep, formData);
    if (message) return setFeedback({ type: "error", message });
    setFeedback(EMPTY_FEEDBACK);
    setCurrentStep((step) => Math.min(step + 1, getTotalSteps()));
  }

  function previousStep() {
    setFeedback(EMPTY_FEEDBACK);
    setCurrentStep((step) => Math.max(step - 1, 1));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const message = validateStep(currentStep, formData);
    if (message) return setFeedback({ type: "error", message });

    if (!canUseSupabase || !supabase) {
      console.warn("Warning: la conexion a Supabase no esta lista. Revisa tus variables NEXT_PUBLIC.");
      return setFeedback({
        type: "error",
        message:
          "No pudimos registrar tu acceso todavia. Estamos verificando tu conexion con el sistema. Intenta nuevamente en unos segundos.",
      });
    }

    setIsSubmitting(true);
    setFeedback(EMPTY_FEEDBACK);

    try {
      const payload = buildInsertPayload(formData, availableColumns);

      if (Object.keys(payload).length === 0) {
        throw new Error("No hay columnas compatibles disponibles para insertar.");
      }

      await insertWithFallback(payload);

      setFormData(INITIAL_FORM_DATA);
      setCurrentStep(1);
      setScreenMode("success");
      setFeedback({ type: "success", message: "Tu aplicacion fue enviada correctamente" });
      requestAnimationFrame(() => {
        formSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    } catch (error) {
      if (isRlsError(error as PostgrestError)) {
        console.warn(
          `Warning: Supabase esta bloqueando el insert por RLS en la tabla ${TABLE_NAME}. Debes crear una policy INSERT para anon/authenticated o usar una service role del lado servidor.`,
        );
      }

      setFeedback({
        type: "error",
        message:
          "No pudimos registrar tu acceso todavia. Estamos verificando tu conexion con el sistema. Intenta nuevamente en unos segundos.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  function renderOnboarding() {
    const totalSteps = getTotalSteps();
    const stepTitles: Record<number, { title: string; description: string }> = {
      1: {
        title: "¿Qué te interesa de Ventmar?",
        description: "Selecciona la opción que mejor describe tu interés para personalizar tu experiencia.",
      },
    };

    // Dynamic step titles based on interest
    if (formData.interes_principal === "Quiero vender productos con Ventmar") {
      stepTitles[2] = { title: "¿En qué nivel estás?", description: "Esto nos ayuda a entender tu experiencia." };
      stepTitles[3] = { title: "¿Cuánto vendes al mes?", description: "Referencia aproximada de tu actividad comercial." };
      stepTitles[4] = { title: "¿Qué buscas principalmente?", description: "Selecciona lo que más te interesa." };
      stepTitles[5] = { title: "Datos de contacto", description: "Información necesaria para contactarte." };
    } else if (formData.interes_principal === "Soy proveedor y quiero trabajar con Ventmar") {
      stepTitles[2] = { title: "¿Qué tipo de proveedor sos?", description: "Clasifica tu tipo de negocio." };
      stepTitles[3] = { title: "¿Cuál es tu capacidad o situación actual?", description: "Describe tu operación actual." };
      stepTitles[4] = { title: "¿Qué categorías manejas?", description: "Selecciona las categorías de productos." };
      stepTitles[5] = { title: "¿Te interesa participar en una reunión privada?", description: "Opcional para networking." };
      stepTitles[6] = { title: "Datos de contacto", description: "Información necesaria para contactarte." };
    } else if (formData.interes_principal === "Me interesa el agente IA para WhatsApp") {
      stepTitles[2] = { title: "¿Qué tipo de negocio tienes?", description: "Clasifica tu tipo de operación." };
      stepTitles[3] = { title: "¿Qué quieres lograr con tu WhatsApp?", description: "Objetivos principales." };
      stepTitles[4] = { title: "¿Cuál es tu situación actual?", description: "Estado actual de tu atención." };
      stepTitles[5] = { title: "Datos de contacto", description: "Información necesaria para contactarte." };
    } else if (formData.interes_principal === "Me interesa una landing de alta conversión") {
      stepTitles[2] = { title: "¿Qué necesitas?", description: "Tipo de landing requerida." };
      stepTitles[3] = { title: "¿Cuál es tu objetivo?", description: "Resultado esperado." };
      stepTitles[4] = { title: "Datos de contacto", description: "Información necesaria para contactarte." };
    } else if (formData.interes_principal === "Me interesan banners publicitarios") {
      stepTitles[2] = { title: "¿Qué tipo de banners necesitas?", description: "Plataformas y formatos." };
      stepTitles[3] = { title: "¿Qué buscas?", description: "Objetivos de los banners." };
      stepTitles[4] = { title: "Datos de contacto", description: "Información necesaria para contactarte." };
    } else if (formData.interes_principal === "Me interesa contenido para redes") {
      stepTitles[2] = { title: "¿Qué contenido necesitas?", description: "Tipos de contenido." };
      stepTitles[3] = { title: "¿Cuál es tu objetivo?", description: "Resultado esperado." };
      stepTitles[4] = { title: "Datos de contacto", description: "Información necesaria para contactarte." };
    } else if (formData.interes_principal === "Quiero asistir a un evento privado") {
      stepTitles[2] = { title: "¿Qué te interesa del evento?", description: "Razones para asistir." };
      stepTitles[3] = { title: "Datos de contacto", description: "Información necesaria para validar acceso." };
    } else if (formData.interes_principal === "Quiero conocer primero cómo funciona") {
      stepTitles[2] = { title: "¿Qué te interesa conocer?", description: "Aspectos específicos." };
      stepTitles[3] = { title: "Datos de contacto", description: "Información necesaria para contactarte." };
    }

    const currentStepInfo = stepTitles[currentStep] || stepTitles[1];

    return (
      <div className="space-y-8">
        <div className="space-y-5">
          <div className="inline-flex w-fit items-center rounded-full bg-[#0F172A]/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
            Aplicación personalizada
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <div className="inline-flex w-fit items-center rounded-full bg-[#2E6FD8]/12 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#2E6FD8]">
                Paso {currentStep} de {totalSteps}
              </div>
            </div>
            <div className="rounded-full bg-[#F2D35E]/30 px-4 py-2 text-sm font-semibold text-[#8A6500]">
              {Math.round(progress)}% completado
            </div>
          </div>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,#F2D35E_0%,#F26122_100%)] transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="space-y-3">
          <h2 className="text-3xl font-semibold text-[#0F172A] sm:text-[2.2rem]">{currentStepInfo.title}</h2>
          <p className="max-w-2xl text-base leading-8 text-slate-600">{currentStepInfo.description}</p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {currentStep === 1 ? (
            <div className="space-y-4">
              {INTERES_OPTIONS.map((option) => (
                <label
                  key={option}
                  className={`flex cursor-pointer items-center gap-4 rounded-2xl border p-4 transition ${
                    formData.interes_principal === option
                      ? "border-[#F26122] bg-[#F26122]/10 text-[#B94818]"
                      : "border-[#D9D9D9] bg-white text-slate-700 hover:border-[#2E6FD8]/35"
                  }`}
                >
                  <input
                    type="radio"
                    name="interes_principal"
                    value={option}
                    checked={formData.interes_principal === option}
                    onChange={handleSelectChange}
                    className="h-4 w-4 text-[#F26122] focus:ring-[#F26122]"
                  />
                  <span className="text-base font-medium">{option}</span>
                </label>
              ))}
            </div>
          ) : null}

          {/* Dynamic steps based on interest */}
          {formData.interes_principal === "Quiero vender productos con Ventmar" && currentStep === 2 ? (
            <SelectField
              id="nivel_dropshipper"
              label="Nivel de experiencia"
              value={formData.nivel_dropshipper}
              options={NIVEL_DROPSHIPPER_OPTIONS}
              required
              onChange={handleSelectChange}
            />
          ) : null}

          {formData.interes_principal === "Quiero vender productos con Ventmar" && currentStep === 3 ? (
            <SelectField
              id="ventas_mensuales"
              label="Ventas mensuales aproximadas"
              value={formData.ventas_mensuales}
              options={VENTAS_MENSUALES_OPTIONS}
              required
              onChange={handleSelectChange}
            />
          ) : null}

          {formData.interes_principal === "Quiero vender productos con Ventmar" && currentStep === 4 ? (
            <SelectField
              id="busca_principal"
              label="Lo que buscas principalmente"
              value={formData.busca_principal}
              options={BUSCA_PRINCIPAL_OPTIONS}
              required
              onChange={handleSelectChange}
            />
          ) : null}

          {formData.interes_principal === "Quiero vender productos con Ventmar" && currentStep === 5 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <InputField
                id="nombre"
                label="Nombre completo"
                value={formData.nombre}
                onChange={handleInputChange}
                placeholder="Tu nombre completo"
                autoComplete="name"
                required
              />
              <InputField
                id="whatsapp"
                label="WhatsApp"
                value={formData.whatsapp}
                onChange={handleInputChange}
                placeholder="+54 9 11 1234 5678"
                type="tel"
                autoComplete="tel"
                required
              />
              <InputField
                id="email"
                label="Email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="tu@email.com"
                type="email"
                autoComplete="email"
                required
              />
              <InputField
                id="ciudad"
                label="Ciudad"
                value={formData.ciudad}
                onChange={handleInputChange}
                placeholder="Tu ciudad"
                autoComplete="address-level2"
                required
              />
              {formData.busca_principal === "Participar en reunión privada" ? (
                <InputField
                  id="dni"
                  label="DNI (solo para evento privado)"
                  value={formData.dni || ""}
                  onChange={handleInputChange}
                  placeholder="Tu DNI"
                  required
                  inputMode="numeric"
                />
              ) : null}
            </div>
          ) : null}

          {/* Provider path */}
          {formData.interes_principal === "Soy proveedor y quiero trabajar con Ventmar" && currentStep === 2 ? (
            <SelectField
              id="tipo_proveedor"
              label="Tipo de proveedor"
              value={formData.tipo_proveedor}
              options={TIPO_PROVEEDOR_OPTIONS}
              required
              onChange={handleSelectChange}
            />
          ) : null}

          {formData.interes_principal === "Soy proveedor y quiero trabajar con Ventmar" && currentStep === 3 ? (
            <SelectField
              id="situacion_proveedor"
              label="Situación actual"
              value={formData.situacion_proveedor}
              options={SITUACION_PROVEEDOR_OPTIONS}
              required
              onChange={handleSelectChange}
            />
          ) : null}

          {formData.interes_principal === "Soy proveedor y quiero trabajar con Ventmar" && currentStep === 4 ? (
            <CheckboxGroup
              label="Categorías que manejas"
              options={CATEGORIA_PROVEEDOR_OPTIONS}
              selected={formData.categorias_proveedor}
              onToggle={handleCategoryToggle as (option: string) => void}
            />
          ) : null}

          {formData.interes_principal === "Soy proveedor y quiero trabajar con Ventmar" && currentStep === 5 ? (
            <div className="space-y-4">
              <p className="text-sm font-medium text-slate-800">¿Te interesa participar en una reunión privada con el equipo de Ventmar?</p>
              <div className="flex gap-6">
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="radio"
                    name="interes_reunion_proveedor"
                    value="Sí"
                    checked={formData.interes_reunion_proveedor === "Sí"}
                    onChange={handleSelectChange}
                    className="h-4 w-4 text-[#F26122] focus:ring-[#F26122]"
                  />
                  <span className="text-sm font-medium">Sí</span>
                </label>
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="radio"
                    name="interes_reunion_proveedor"
                    value="No"
                    checked={formData.interes_reunion_proveedor === "No"}
                    onChange={handleSelectChange}
                    className="h-4 w-4 text-[#F26122] focus:ring-[#F26122]"
                  />
                  <span className="text-sm font-medium">No</span>
                </label>
              </div>
            </div>
          ) : null}

          {formData.interes_principal === "Soy proveedor y quiero trabajar con Ventmar" && currentStep === 6 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <InputField
                id="nombre"
                label="Nombre completo"
                value={formData.nombre}
                onChange={handleInputChange}
                placeholder="Tu nombre completo"
                autoComplete="name"
                required
              />
              <InputField
                id="whatsapp"
                label="WhatsApp"
                value={formData.whatsapp}
                onChange={handleInputChange}
                placeholder="+54 9 11 1234 5678"
                type="tel"
                autoComplete="tel"
                required
              />
              <InputField
                id="email"
                label="Email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="tu@email.com"
                type="email"
                autoComplete="email"
                required
              />
              <InputField
                id="ciudad"
                label="Ciudad"
                value={formData.ciudad}
                onChange={handleInputChange}
                placeholder="Tu ciudad"
                autoComplete="address-level2"
                required
              />
              <InputField
                id="empresa_marca"
                label="Empresa o marca"
                value={formData.empresa_marca || ""}
                onChange={handleInputChange}
                placeholder="Nombre de tu empresa o marca"
                required
              />
            </div>
          ) : null}

          {/* WhatsApp IA path */}
          {formData.interes_principal === "Me interesa el agente IA para WhatsApp" && currentStep === 2 ? (
            <SelectField
              id="tipo_negocio_whatsapp"
              label="Tipo de negocio"
              value={formData.tipo_negocio_whatsapp}
              options={TIPO_NEGOCIO_WHATSAPP_OPTIONS}
              required
              onChange={handleSelectChange}
            />
          ) : null}

          {formData.interes_principal === "Me interesa el agente IA para WhatsApp" && currentStep === 3 ? (
            <SelectField
              id="que_lograr_whatsapp"
              label="Qué quieres lograr"
              value={formData.que_lograr_whatsapp}
              options={QUE_LOGRAR_WHATSAPP_OPTIONS}
              required
              onChange={handleSelectChange}
            />
          ) : null}

          {formData.interes_principal === "Me interesa el agente IA para WhatsApp" && currentStep === 4 ? (
            <SelectField
              id="situacion_actual_whatsapp"
              label="Situación actual"
              value={formData.situacion_actual_whatsapp}
              options={SITUACION_ACTUAL_WHATSAPP_OPTIONS}
              required
              onChange={handleSelectChange}
            />
          ) : null}

          {formData.interes_principal === "Me interesa el agente IA para WhatsApp" && currentStep === 5 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <InputField
                id="nombre"
                label="Nombre completo"
                value={formData.nombre}
                onChange={handleInputChange}
                placeholder="Tu nombre completo"
                autoComplete="name"
                required
              />
              <InputField
                id="whatsapp"
                label="WhatsApp"
                value={formData.whatsapp}
                onChange={handleInputChange}
                placeholder="+54 9 11 1234 5678"
                type="tel"
                autoComplete="tel"
                required
              />
              <InputField
                id="email"
                label="Email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="tu@email.com"
                type="email"
                autoComplete="email"
                required
              />
              <InputField
                id="ciudad"
                label="Ciudad"
                value={formData.ciudad}
                onChange={handleInputChange}
                placeholder="Tu ciudad"
                autoComplete="address-level2"
                required
              />
            </div>
          ) : null}

          {/* Landing path */}
          {formData.interes_principal === "Me interesa una landing de alta conversión" && currentStep === 2 ? (
            <SelectField
              id="que_necesitas_landing"
              label="Qué necesitas"
              value={formData.que_necesitas_landing}
              options={QUE_NECESITAS_LANDING_OPTIONS}
              required
              onChange={handleSelectChange}
            />
          ) : null}

          {formData.interes_principal === "Me interesa una landing de alta conversión" && currentStep === 3 ? (
            <SelectField
              id="objetivo_landing"
              label="Objetivo principal"
              value={formData.objetivo_landing}
              options={OBJETIVO_LANDING_OPTIONS}
              required
              onChange={handleSelectChange}
            />
          ) : null}

          {formData.interes_principal === "Me interesa una landing de alta conversión" && currentStep === 4 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <InputField
                id="nombre"
                label="Nombre completo"
                value={formData.nombre}
                onChange={handleInputChange}
                placeholder="Tu nombre completo"
                autoComplete="name"
                required
              />
              <InputField
                id="whatsapp"
                label="WhatsApp"
                value={formData.whatsapp}
                onChange={handleInputChange}
                placeholder="+54 9 11 1234 5678"
                type="tel"
                autoComplete="tel"
                required
              />
              <InputField
                id="email"
                label="Email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="tu@email.com"
                type="email"
                autoComplete="email"
                required
              />
              <InputField
                id="ciudad"
                label="Ciudad"
                value={formData.ciudad}
                onChange={handleInputChange}
                placeholder="Tu ciudad"
                autoComplete="address-level2"
                required
              />
            </div>
          ) : null}

          {/* Banners path */}
          {formData.interes_principal === "Me interesan banners publicitarios" && currentStep === 2 ? (
            <SelectField
              id="tipo_banners"
              label="Tipo de banners"
              value={formData.tipo_banners}
              options={TIPO_BANNERS_OPTIONS}
              required
              onChange={handleSelectChange}
            />
          ) : null}

          {formData.interes_principal === "Me interesan banners publicitarios" && currentStep === 3 ? (
            <SelectField
              id="que_buscas_banners"
              label="Qué buscas"
              value={formData.que_buscas_banners}
              options={QUE_BUSCAS_BANNERS_OPTIONS}
              required
              onChange={handleSelectChange}
            />
          ) : null}

          {formData.interes_principal === "Me interesan banners publicitarios" && currentStep === 4 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <InputField
                id="nombre"
                label="Nombre completo"
                value={formData.nombre}
                onChange={handleInputChange}
                placeholder="Tu nombre completo"
                autoComplete="name"
                required
              />
              <InputField
                id="whatsapp"
                label="WhatsApp"
                value={formData.whatsapp}
                onChange={handleInputChange}
                placeholder="+54 9 11 1234 5678"
                type="tel"
                autoComplete="tel"
                required
              />
              <InputField
                id="email"
                label="Email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="tu@email.com"
                type="email"
                autoComplete="email"
                required
              />
              <InputField
                id="ciudad"
                label="Ciudad"
                value={formData.ciudad}
                onChange={handleInputChange}
                placeholder="Tu ciudad"
                autoComplete="address-level2"
                required
              />
            </div>
          ) : null}

          {/* Content path */}
          {formData.interes_principal === "Me interesa contenido para redes" && currentStep === 2 ? (
            <SelectField
              id="contenido_redes"
              label="Tipo de contenido"
              value={formData.contenido_redes}
              options={CONTENIDO_REDES_OPTIONS}
              required
              onChange={handleSelectChange}
            />
          ) : null}

          {formData.interes_principal === "Me interesa contenido para redes" && currentStep === 3 ? (
            <SelectField
              id="objetivo_contenido"
              label="Objetivo principal"
              value={formData.objetivo_contenido}
              options={OBJETIVO_CONTENIDO_OPTIONS}
              required
              onChange={handleSelectChange}
            />
          ) : null}

          {formData.interes_principal === "Me interesa contenido para redes" && currentStep === 4 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <InputField
                id="nombre"
                label="Nombre completo"
                value={formData.nombre}
                onChange={handleInputChange}
                placeholder="Tu nombre completo"
                autoComplete="name"
                required
              />
              <InputField
                id="whatsapp"
                label="WhatsApp"
                value={formData.whatsapp}
                onChange={handleInputChange}
                placeholder="+54 9 11 1234 5678"
                type="tel"
                autoComplete="tel"
                required
              />
              <InputField
                id="email"
                label="Email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="tu@email.com"
                type="email"
                autoComplete="email"
                required
              />
              <InputField
                id="ciudad"
                label="Ciudad"
                value={formData.ciudad}
                onChange={handleInputChange}
                placeholder="Tu ciudad"
                autoComplete="address-level2"
                required
              />
            </div>
          ) : null}

          {/* Event path */}
          {formData.interes_principal === "Quiero asistir a un evento privado" && currentStep === 2 ? (
            <SelectField
              id="que_interesa_evento"
              label="Qué te interesa del evento"
              value={formData.que_interesa_evento}
              options={QUE_INTERESA_EVENTO_OPTIONS}
              required
              onChange={handleSelectChange}
            />
          ) : null}

          {formData.interes_principal === "Quiero asistir a un evento privado" && currentStep === 3 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <InputField
                id="nombre"
                label="Nombre completo"
                value={formData.nombre}
                onChange={handleInputChange}
                placeholder="Tu nombre completo"
                autoComplete="name"
                required
              />
              <InputField
                id="whatsapp"
                label="WhatsApp"
                value={formData.whatsapp}
                onChange={handleInputChange}
                placeholder="+54 9 11 1234 5678"
                type="tel"
                autoComplete="tel"
                required
              />
              <InputField
                id="email"
                label="Email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="tu@email.com"
                type="email"
                autoComplete="email"
                required
              />
              <InputField
                id="ciudad"
                label="Ciudad"
                value={formData.ciudad}
                onChange={handleInputChange}
                placeholder="Tu ciudad"
                autoComplete="address-level2"
                required
              />
              <InputField
                id="dni"
                label="DNI (requerido para evento privado)"
                value={formData.dni || ""}
                onChange={handleInputChange}
                placeholder="Tu DNI"
                required
                inputMode="numeric"
              />
            </div>
          ) : null}

          {/* Explorer path */}
          {formData.interes_principal === "Quiero conocer primero cómo funciona" && currentStep === 2 ? (
            <SelectField
              id="que_conocer"
              label="Qué te interesa conocer"
              value={formData.que_conocer}
              options={QUE_CONOCER_OPTIONS}
              required
              onChange={handleSelectChange}
            />
          ) : null}

          {formData.interes_principal === "Quiero conocer primero cómo funciona" && currentStep === 3 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <InputField
                id="nombre"
                label="Nombre completo"
                value={formData.nombre}
                onChange={handleInputChange}
                placeholder="Tu nombre completo"
                autoComplete="name"
                required
              />
              <InputField
                id="whatsapp"
                label="WhatsApp"
                value={formData.whatsapp}
                onChange={handleInputChange}
                placeholder="+54 9 11 1234 5678"
                type="tel"
                autoComplete="tel"
                required
              />
              <InputField
                id="email"
                label="Email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="tu@email.com"
                type="email"
                autoComplete="email"
                required
              />
              <InputField
                id="ciudad"
                label="Ciudad"
                value={formData.ciudad}
                onChange={handleInputChange}
                placeholder="Tu ciudad"
                autoComplete="address-level2"
                required
              />
            </div>
          ) : null}

          {feedback.message ? (
            <p
              aria-live="polite"
              className={
                feedback.type === "success"
                  ? "rounded-2xl border border-[#2E6FD8]/25 bg-[#2E6FD8]/8 px-4 py-3 text-sm font-medium text-[#2458ad]"
                  : "rounded-2xl border border-[#F26122]/25 bg-[#F26122]/10 px-4 py-3 text-sm font-medium text-[#A93F12]"
              }
            >
              {feedback.message}
            </p>
          ) : null}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={currentStep === 1 ? scrollToTop : previousStep}
              disabled={isSubmitting}
              className={secondaryLightButtonClass}
            >
              {currentStep === 1 ? "Volver arriba" : "Volver"}
            </button>

            {currentStep < totalSteps ? (
              <button type="button" onClick={nextStep} className={primaryButtonClass}>
                Continuar
              </button>
            ) : (
              <button type="submit" disabled={isSubmitting} className={primaryButtonClass}>
                {isSubmitting ? "Enviando..." : "Finalizar aplicación"}
              </button>
            )}
          </div>
        </form>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0F172A] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(46,111,216,0.18),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(242,97,34,0.18),transparent_28%),linear-gradient(180deg,#0F172A_0%,#081120_58%,#050B16_100%)]" />
      <div className="relative mx-auto flex max-w-6xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
        <section className="overflow-hidden rounded-[2.25rem] border border-[#2E6FD8]/25 bg-[linear-gradient(180deg,rgba(16,32,55,0.95)_0%,rgba(6,10,28,0.98)_100%)] shadow-[0_30px_80px_rgba(3,7,18,0.45)]">
          <div className="bg-[radial-gradient(circle_at_top_left,rgba(46,111,216,0.18),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(242,97,34,0.12),transparent_28%)] px-6 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
            <div className="mb-8 flex items-center justify-between gap-4">
              <Image
                src="/logo-ventmar.png"
                alt="Ventmar"
                width={184}
                height={64}
                className="h-auto w-36 object-contain sm:w-44"
                priority
              />
              <div className="hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-slate-300 sm:block">
                Ecosistema ecommerce profesional
              </div>
            </div>

            <div className="space-y-5">
              <div className="inline-flex w-fit items-center rounded-full border border-[#2E6FD8]/35 bg-[#2E6FD8]/12 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-[#DCE8FF]">
                Ventmar Argentina
              </div>
              <p className="text-sm font-semibold uppercase tracking-[0.34em] text-slate-400">
                Evento privado para dropshippers
              </p>
              <h1 className="max-w-4xl text-4xl font-semibold leading-[1.08] text-white sm:text-5xl lg:text-[4rem]">
                Una experiencia de acceso pensada para dropshippers que quieren vender, escalar y operar con mas ventaja.
              </h1>
              <p className="max-w-3xl text-base leading-8 text-slate-300">
                Este entorno filtra por etapa comercial, necesidad operativa e interes real en stock y proveedores para que cada perfil entre al evento con mas contexto y mas claridad.
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={scrollToForm} className={primaryButtonClass}>
                Aplicar ahora
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-400">
              <span>Aplicacion breve</span>
              <span className="hidden text-slate-600 sm:inline">•</span>
              <span>Filtro real por etapa</span>
              <span className="hidden text-slate-600 sm:inline">•</span>
              <span>Proveedores, stock y networking</span>
            </div>

            <div className="mt-10 grid gap-4 lg:grid-cols-3">
              {SEGMENTS.map((segment) => (
                <article
                  key={segment.title}
                  className="rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0.02)_100%)] p-5"
                >
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{segment.eyebrow}</p>
                  <h2 className="mt-3 text-2xl font-semibold text-white">{segment.title}</h2>
                  <p className="mt-4 text-base leading-8 text-slate-300">{segment.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          id="onboarding"
          ref={formSectionRef}
          tabIndex={-1}
          className="scroll-mt-6 rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(248,250,252,0.98)_0%,rgba(241,245,249,0.98)_100%)] p-5 text-slate-950 shadow-[0_24px_70px_rgba(2,6,23,0.2)] outline-none sm:p-7 lg:p-8"
        >
          {screenMode === "success" ? (
          <div className="space-y-6">
              <div className="inline-flex w-fit items-center rounded-full bg-[#2E6FD8]/12 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#2E6FD8]">
                Aplicacion enviada
              </div>
              <div className="space-y-3">
                <h2 className="text-3xl font-semibold text-[#0F172A] sm:text-4xl">
                  Tu aplicacion fue enviada correctamente
                </h2>
                <p className="max-w-2xl text-base leading-8 text-slate-600">
                  Recibimos tus datos y ahora el equipo de Ventmar puede revisar tu perfil comercial para ubicarte en el circuito mas adecuado del evento.
                </p>
                <p className="max-w-2xl text-sm leading-7 text-slate-500">
                  Si tu perfil encaja con la disponibilidad del evento, el siguiente contacto va a llegar por los datos que acabas de dejar.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-3xl border border-[#D9D9D9] bg-white p-5">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Paso 1</p>
                  <p className="mt-2 text-lg font-semibold text-[#0F172A]">Perfil recibido</p>
                </div>
                <div className="rounded-3xl border border-[#D9D9D9] bg-white p-5">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Paso 2</p>
                  <p className="mt-2 text-lg font-semibold text-[#0F172A]">Revision comercial</p>
                </div>
                <div className="rounded-3xl border border-[#D9D9D9] bg-white p-5">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Paso 3</p>
                  <p className="mt-2 text-lg font-semibold text-[#0F172A]">Acceso y contacto</p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button type="button" onClick={resetApplication} className={primaryButtonClass}>
                  Enviar otra aplicacion
                </button>
                <button type="button" onClick={scrollToTop} className={secondaryLightButtonClass}>
                  Volver arriba
                </button>
              </div>
            </div>
          ) : (
            renderOnboarding()
          )}
        </section>
      </div>
    </main>
  );
}
