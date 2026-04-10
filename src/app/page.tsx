"use client";

import Image from "next/image";
import { createClient, type PostgrestError } from "@supabase/supabase-js";
import { type ChangeEvent, type FormEvent, useEffect, useRef, useState } from "react";

type ScreenMode = "apply" | "success";
type NivelUsuario = "Estoy empezando" | "Ya vendo regularmente" | "Escalo campanas activas";
type VentasSemanales = "Aun ninguna" | "1-10" | "10-50" | "50+";
type ProveedorLocal = "Si" | "No" | "Algunos";
type InteresStockArgentina = "Si quiero acceder" | "Quiero conocer primero";
type CategoriaInteres = "Belleza" | "Fitness" | "Hogar" | "Tecnologia" | "Productos virales" | "Otros";

type FormData = {
  nombre: string;
  whatsapp: string;
  email: string;
  ciudad: string;
  dni: string;
  nivel_usuario: NivelUsuario | "";
  ventas_semanales: VentasSemanales | "";
  proveedor_local: ProveedorLocal | "";
  categorias_interes: CategoriaInteres[];
  producto_interes: string;
  interes_stock_argentina: InteresStockArgentina | "";
};

type FeedbackState = { type: "idle" | "success" | "error"; message: string };
type InsertPayload = Record<string, string | CategoriaInteres[]>;

const TOTAL_STEPS = 5;
const TABLE_NAME = "Formularios";
const FORM_FIELDS = [
  "nombre",
  "whatsapp",
  "email",
  "ciudad",
  "dni",
  "nivel_usuario",
  "ventas_semanales",
  "proveedor_local",
  "categorias_interes",
  "producto_interes",
  "interes_stock_argentina",
] as const;
const COLUMN_CANDIDATES: Record<(typeof FORM_FIELDS)[number], string[]> = {
  nombre: ["nombre"],
  whatsapp: ["whatsapp"],
  email: ["email"],
  ciudad: ["ciudad"],
  dni: ["dni"],
  nivel_usuario: ["tipo_usuario", "nivel_usuario"],
  ventas_semanales: ["ventas_semanales"],
  proveedor_local: ["proveedor_local"],
  categorias_interes: ["categorias_interes"],
  producto_interes: ["producto_interes"],
  interes_stock_argentina: ["interes_stock_argentina"],
};

const STEP_COPY = [
  {
    label: "Identidad",
    title: "Aplicacion de acceso al evento privado Ventmar Argentina",
    description: "Queremos validar tu perfil y reservar tu lugar con informacion precisa desde el inicio.",
  },
  {
    label: "Nivel actual",
    title: "Contanos en que momento estas",
    description: "Esto nos ayuda a segmentar el acceso y preparar propuestas acordes a tu etapa comercial.",
  },
  {
    label: "Actividad comercial",
    title: "Entendamos tu operacion actual",
    description: "Necesitamos una referencia simple de movimiento semanal y relacion con proveedores locales.",
  },
  {
    label: "Interes comercial",
    title: "Que categorias y productos queres trabajar",
    description: "Usamos esta informacion para conectar asistentes con oportunidades mas relevantes dentro del evento.",
  },
  {
    label: "Acceso al evento",
    title: "Ultimo paso para evaluar tu acceso",
    description: "Con esta respuesta definimos como presentarte opciones de stock y proveedores en Argentina.",
  },
] as const;

const NIVEL_OPTIONS: NivelUsuario[] = ["Estoy empezando", "Ya vendo regularmente", "Escalo campanas activas"];
const VENTAS_OPTIONS: VentasSemanales[] = ["Aun ninguna", "1-10", "10-50", "50+"];
const PROVEEDOR_OPTIONS: ProveedorLocal[] = ["Si", "No", "Algunos"];
const EVENTO_OPTIONS: InteresStockArgentina[] = ["Si quiero acceder", "Quiero conocer primero"];
const CATEGORY_OPTIONS: CategoriaInteres[] = ["Belleza", "Fitness", "Hogar", "Tecnologia", "Productos virales", "Otros"];
const SEGMENTS = [
  {
    eyebrow: "Perfil 01",
    title: "Estoy empezando",
    description: "Para quienes estan entrando al juego y necesitan productos, criterio y estructura para vender mejor.",
  },
  {
    eyebrow: "Perfil 02",
    title: "Ya vendo regularmente",
    description: "Pensado para operadores que buscan nuevos proveedores, stock local y oportunidades mas estables.",
  },
  {
    eyebrow: "Perfil 03",
    title: "Escalo campanas activas",
    description: "Ideal para quienes ya tienen volumen y quieren networking, velocidad operativa y mejor oferta.",
  },
] as const;

const INITIAL_FORM_DATA: FormData = {
  nombre: "",
  whatsapp: "",
  email: "",
  ciudad: "",
  dni: "",
  nivel_usuario: "",
  ventas_semanales: "",
  proveedor_local: "",
  categorias_interes: [],
  producto_interes: "",
  interes_stock_argentina: "",
};

const EMPTY_FEEDBACK: FeedbackState = { type: "idle", message: "" };
const fieldClass =
  "w-full rounded-2xl border border-[#D9D9D9] bg-white px-4 py-3 text-slate-950 outline-none transition duration-200 placeholder:text-slate-400 focus:border-[#F26122] focus:ring-4 focus:ring-[#F26122]/15";
const primaryButtonClass =
  "inline-flex items-center justify-center rounded-2xl bg-[#F26122] px-5 py-3 text-sm font-semibold text-white transition duration-200 hover:bg-[#D94E14] disabled:cursor-not-allowed disabled:bg-[#f5a47d]";
const secondaryDarkButtonClass =
  "inline-flex items-center justify-center rounded-2xl border border-white/14 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-100 transition duration-200 hover:border-[#2E6FD8]/45 hover:bg-[#2E6FD8]/12 disabled:cursor-not-allowed disabled:opacity-50";
const secondaryLightButtonClass =
  "inline-flex items-center justify-center rounded-2xl border border-[#D9D9D9] bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition duration-200 hover:border-[#2E6FD8]/45 hover:text-[#2E6FD8] disabled:cursor-not-allowed disabled:opacity-40";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const hasPlaceholderAnonKey = supabaseAnonKey.startsWith("process.env.");
const canUseSupabase = Boolean(supabaseUrl && supabaseAnonKey && !hasPlaceholderAnonKey);
const supabase = canUseSupabase ? createClient(supabaseUrl, supabaseAnonKey) : null;

function validateStep(step: number, data: FormData) {
  if (step === 1 && (!data.nombre || !data.whatsapp || !data.email || !data.ciudad || !data.dni)) {
    return "Completa nombre, WhatsApp, email, ciudad y DNI para continuar.";
  }
  if (step === 2 && !data.nivel_usuario) return "Selecciona tu nivel actual para continuar.";
  if (step === 3 && (!data.ventas_semanales || !data.proveedor_local)) {
    return "Indica tus ventas semanales y si ya trabajas con proveedor local.";
  }
  if (step === 4 && data.categorias_interes.length === 0) {
    return "Selecciona al menos una categoria de interes para continuar.";
  }
  if (step === 5 && !data.interes_stock_argentina) {
    return "Selecciona tu interes sobre stock en Argentina para finalizar.";
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
    if (field === "nivel_usuario") {
      if (availableColumns.has("tipo_usuario")) {
        payload.tipo_usuario = data.nivel_usuario;
      }

      if (availableColumns.has("nivel_usuario")) {
        payload.nivel_usuario = data.nivel_usuario;
      }

      return;
    }

    const targetColumn = COLUMN_CANDIDATES[field].find((candidate) =>
      availableColumns.has(candidate),
    );

    if (!targetColumn) {
      return;
    }

    if (field === "categorias_interes") {
      payload[targetColumn] = data.categorias_interes;
      return;
    }

    payload[targetColumn] = data[field];
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
        <option value="">Selecciona una opcion</option>
        {props.options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function HomePage() {
  const [screenMode, setScreenMode] = useState<ScreenMode>("apply");
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

      if (nextColumns.has("tipo_usuario") && !nextColumns.has("nivel_usuario")) {
        console.warn(
          `Warning: la tabla ${TABLE_NAME} usa "tipo_usuario". Se mapeara automaticamente desde "nivel_usuario".`,
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

  const progress = (currentStep / TOTAL_STEPS) * 100;
  const stepCopy = STEP_COPY[currentStep - 1];

  function scrollToForm() {
    formSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
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

  function handleSelectChange(event: ChangeEvent<HTMLSelectElement>) {
    const key = event.target.name as keyof FormData;
    setFormData((current) => ({ ...current, [key]: event.target.value }) as FormData);
  }

  function handleCategoryToggle(category: CategoriaInteres) {
    setFormData((current) => ({
      ...current,
      categorias_interes: current.categorias_interes.includes(category)
        ? current.categorias_interes.filter((item) => item !== category)
        : [...current.categorias_interes, category],
    }));
  }

  function nextStep() {
    const message = validateStep(currentStep, formData);
    if (message) return setFeedback({ type: "error", message });
    setFeedback(EMPTY_FEEDBACK);
    setCurrentStep((step) => Math.min(step + 1, TOTAL_STEPS));
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
    return (
      <div className="space-y-8">
        <div className="space-y-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <div className="inline-flex w-fit items-center rounded-full bg-[#2E6FD8]/12 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#2E6FD8]">
                Paso {currentStep} de {TOTAL_STEPS}
              </div>
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">{stepCopy.label}</p>
            </div>
            <div className="rounded-full bg-[#F2D35E]/30 px-4 py-2 text-sm font-semibold text-[#8A6500]">
              {Math.round(progress)}% completado
            </div>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,#F2D35E_0%,#F26122_100%)] transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="space-y-3">
            <h2 className="text-3xl font-semibold text-[#0F172A] sm:text-[2.2rem]">{stepCopy.title}</h2>
            <p className="max-w-2xl text-base leading-8 text-slate-600">{stepCopy.description}</p>
          </div>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {currentStep === 1 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <InputField
                id="nombre"
                label="Nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                placeholder="Tu nombre completo"
                required
                className="space-y-2 sm:col-span-2"
              />
              <InputField
                id="whatsapp"
                label="WhatsApp"
                value={formData.whatsapp}
                onChange={handleInputChange}
                placeholder="+54 9 11 1234 5678"
                type="tel"
                required
              />
              <InputField
                id="email"
                label="Email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="tu@email.com"
                type="email"
                required
              />
              <InputField
                id="ciudad"
                label="Ciudad"
                value={formData.ciudad}
                onChange={handleInputChange}
                placeholder="Tu ciudad"
                required
              />
              <InputField
                id="dni"
                label="DNI"
                value={formData.dni}
                onChange={handleInputChange}
                placeholder="Tu DNI"
                required
                inputMode="numeric"
              />
            </div>
          ) : null}

          {currentStep === 2 ? (
            <SelectField
              id="nivel_usuario"
              label="Nivel de usuario"
              value={formData.nivel_usuario}
              options={NIVEL_OPTIONS}
              required
              onChange={handleSelectChange}
            />
          ) : null}

          {currentStep === 3 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <SelectField
                id="ventas_semanales"
                label="Ventas semanales"
                value={formData.ventas_semanales}
                options={VENTAS_OPTIONS}
                required
                onChange={handleSelectChange}
              />
              <SelectField
                id="proveedor_local"
                label="Proveedor local"
                value={formData.proveedor_local}
                options={PROVEEDOR_OPTIONS}
                required
                onChange={handleSelectChange}
              />
            </div>
          ) : null}

          {currentStep === 4 ? (
            <div className="space-y-5">
              <div className="space-y-3">
                <p className="text-sm font-medium text-slate-800">Categorias de interes</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {CATEGORY_OPTIONS.map((category) => {
                    const active = formData.categorias_interes.includes(category);
                    return (
                      <label
                        key={category}
                        className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 transition ${
                          active
                            ? "border-[#F26122] bg-[#F26122]/10 text-[#B94818]"
                            : "border-[#D9D9D9] bg-white text-slate-700 hover:border-[#2E6FD8]/35"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={active}
                          onChange={() => handleCategoryToggle(category)}
                          className="h-4 w-4 rounded border-slate-300 text-[#F26122] focus:ring-[#F26122]"
                        />
                        <span className="text-sm font-medium">{category}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <InputField
                id="producto_interes"
                label="Producto de interes"
                value={formData.producto_interes}
                onChange={handleInputChange}
                placeholder="Ejemplo: serum facial, masajeador, gadget viral"
              />
            </div>
          ) : null}

          {currentStep === 5 ? (
            <div className="space-y-5">
              <SelectField
                id="interes_stock_argentina"
                label="Interes en stock en Argentina"
                value={formData.interes_stock_argentina}
                options={EVENTO_OPTIONS}
                required
                onChange={handleSelectChange}
              />
              <div className="rounded-3xl border border-[#F2D35E]/70 bg-[#F2D35E]/20 px-4 py-4 text-sm leading-7 text-[#7A5A00]">
                Esta aplicacion nos permite priorizar asistentes con mayor afinidad comercial para el evento privado de Ventmar Argentina.
              </div>
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

            {currentStep < TOTAL_STEPS ? (
              <button type="button" onClick={nextStep} className={primaryButtonClass}>
                Continuar
              </button>
            ) : (
              <button type="submit" disabled={isSubmitting} className={primaryButtonClass}>
                {isSubmitting ? "Enviando..." : "Finalizar aplicacion"}
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
              <button type="button" onClick={scrollToTop} className={secondaryDarkButtonClass}>
                Ver presentacion
              </button>
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
          className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(248,250,252,0.98)_0%,rgba(241,245,249,0.98)_100%)] p-5 text-slate-950 shadow-[0_24px_70px_rgba(2,6,23,0.2)] sm:p-7 lg:p-8"
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
