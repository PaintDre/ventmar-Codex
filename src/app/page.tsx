"use client";

import Image from "next/image";
import { createClient, type PostgrestError } from "@supabase/supabase-js";
import { type ChangeEvent, type FormEvent, useEffect, useState } from "react";

type ScreenMode = "landing" | "info" | "apply" | "success";
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
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10";

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
  const [screenMode, setScreenMode] = useState<ScreenMode>("landing");
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [feedback, setFeedback] = useState<FeedbackState>(EMPTY_FEEDBACK);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableColumns, setAvailableColumns] = useState<Set<string>>(new Set());

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

  function goToLanding() {
    setFeedback(EMPTY_FEEDBACK);
    setScreenMode("landing");
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
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
                Paso {currentStep} de {TOTAL_STEPS}
              </p>
              <p className="mt-1 text-sm text-slate-500">{stepCopy.label}</p>
            </div>
            <p className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              {Math.round(progress)}%
            </p>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,#0f766e_0%,#10b981_100%)] transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-slate-950">{stepCopy.title}</h2>
            <p className="text-sm leading-6 text-slate-600">{stepCopy.description}</p>
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
                            ? "border-emerald-500 bg-emerald-50 text-emerald-900"
                            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={active}
                          onChange={() => handleCategoryToggle(category)}
                          className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
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
              <div className="rounded-3xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm leading-6 text-amber-900">
                Esta aplicacion nos permite priorizar asistentes con mayor afinidad comercial para el evento privado de Ventmar Argentina.
              </div>
            </div>
          ) : null}

          {feedback.message ? (
            <p
              aria-live="polite"
              className={
                feedback.type === "success"
                  ? "rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"
                  : "rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700"
              }
            >
              {feedback.message}
            </p>
          ) : null}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={currentStep === 1 ? goToLanding : previousStep}
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {currentStep === 1 ? "Volver al inicio" : "Volver"}
            </button>

            {currentStep < TOTAL_STEPS ? (
              <button
                type="button"
                onClick={nextStep}
                className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Continuar
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
              >
                {isSubmitting ? "Enviando..." : "Finalizar aplicacion"}
              </button>
            )}
          </div>
        </form>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.14),transparent_25%),linear-gradient(180deg,#030712_0%,#08111f_45%,#020617_100%)] px-4 py-6 text-slate-100 sm:px-6 lg:px-10">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl flex-col gap-6 lg:grid lg:grid-cols-[0.95fr_1.05fr] lg:items-stretch">
        <section className="relative overflow-hidden rounded-[2rem] border border-cyan-400/15 bg-slate-950/85 px-6 py-8 text-white shadow-[0_20px_60px_rgba(8,15,30,0.45)] backdrop-blur sm:px-8 sm:py-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.22),transparent_25%),radial-gradient(circle_at_bottom_left,rgba(45,212,191,0.16),transparent_28%),linear-gradient(180deg,rgba(15,23,42,0.2),rgba(2,6,23,0.65))]" />
          <div className="relative flex h-full flex-col justify-between gap-8">
            <div className="space-y-6">
              <div className="inline-flex w-fit items-center rounded-full border border-cyan-300/15 bg-cyan-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100">
                VENTMAR ARGENTINA
              </div>
              <div className="space-y-4">
                <p className="text-sm font-medium uppercase tracking-[0.28em] text-cyan-100/70">
                  Evento privado para dropshippers
                </p>
                <h1 className="max-w-xl text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
                  Una experiencia de acceso pensada para dropshippers que quieren vender, escalar y operar con mas ventaja.
                </h1>
                <p className="max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
                  Este entorno filtra por etapa comercial, necesidad operativa e interes real en stock y proveedores para que cada perfil entre al evento con mas contexto y mas claridad.
                </p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {SEGMENTS.map((segment) => (
                <div key={segment.title} className="rounded-3xl border border-white/10 bg-white/6 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/55">{segment.eyebrow}</p>
                  <p className="mt-2 text-lg font-semibold">{segment.title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{segment.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-cyan-400/15 bg-slate-950/70 p-5 shadow-[0_20px_60px_rgba(8,15,30,0.35)] backdrop-blur sm:p-7 lg:p-8">
          <div className="mb-6 flex flex-col items-center gap-3 text-center">
            <Image
              src="/logo-ventmar.png"
              alt="Ventmar"
              width={168}
              height={56}
              className="h-auto w-36 object-contain sm:w-40"
              priority
            />
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-300">
                VENTMAR ARGENTINA
              </p>
              <p className="text-sm text-slate-400">Evento privado para dropshippers</p>
            </div>
          </div>

          {screenMode === "landing" ? (
            <div className="space-y-6">
              <div className="space-y-3">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">Acceso privado</p>
                <h2 className="text-2xl font-semibold text-white sm:text-3xl">Elegi tu camino de entrada</h2>
                <p className="text-sm leading-7 text-slate-300">
                  Podes aplicar ahora si ya queres entrar al filtro privado o explorar primero el enfoque del evento para decidir con mas informacion.
                </p>
              </div>

              {feedback.message ? (
                <p
                  aria-live="polite"
                  className={
                    feedback.type === "success"
                      ? "rounded-2xl border border-emerald-400/25 bg-emerald-400/10 px-4 py-3 text-sm font-medium text-emerald-200"
                      : "rounded-2xl border border-rose-400/25 bg-rose-400/10 px-4 py-3 text-sm font-medium text-rose-200"
                  }
                >
                  {feedback.message}
                </p>
              ) : null}

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Calificacion real</p>
                  <p className="mt-2 text-base font-semibold text-white">Segmentamos por etapa</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Matching</p>
                  <p className="mt-2 text-base font-semibold text-white">Proveedores y stock</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Resultado</p>
                  <p className="mt-2 text-base font-semibold text-white">Acceso mas util</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setScreenMode("apply")}
                  className="inline-flex min-h-14 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#06b6d4_0%,#0891b2_100%)] px-5 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110"
                >
                  Aplicar ahora
                </button>
                <button
                  type="button"
                  onClick={() => setScreenMode("info")}
                  className="inline-flex min-h-14 items-center justify-center rounded-2xl border border-cyan-300/15 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-cyan-300/35 hover:bg-white/5"
                >
                  Obtener informacion primero
                </button>
              </div>
            </div>
          ) : null}

          {screenMode === "info" ? (
            <div className="space-y-6">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Resumen del evento</p>
                <h2 className="mt-3 text-2xl font-semibold text-white">
                  Acceso privado para operadores que quieren escalar en Argentina
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  Vas a encontrar proveedores, opciones de stock local, conexiones entre operadores y una segmentacion enfocada en performance real.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <p className="text-sm font-semibold text-white">Que evaluamos</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Nivel actual, movimiento comercial, categorias de interes y afinidad con stock en Argentina.
                  </p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <p className="text-sm font-semibold text-white">Para que sirve</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Ordenar accesos y acercarte contactos, proveedores y oportunidades mas utiles para tu etapa.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setScreenMode("apply")}
                  className="inline-flex items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#06b6d4_0%,#0891b2_100%)] px-5 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110"
                >
                  Aplicar ahora
                </button>
                <button
                  type="button"
                  onClick={goToLanding}
                  className="inline-flex items-center justify-center rounded-2xl border border-cyan-300/15 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-cyan-300/35 hover:bg-white/5"
                >
                  Volver al inicio
                </button>
              </div>
            </div>
          ) : null}

          {screenMode === "success" ? (
            <div className="space-y-6">
              <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">Aplicacion enviada</p>
                <h2 className="mt-3 text-2xl font-semibold text-white">
                  Tu acceso fue enviado correctamente
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  Recibimos tus datos y ahora el equipo de Ventmar puede revisar tu perfil comercial para ubicarte en el circuito mas adecuado del evento.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Paso 1</p>
                  <p className="mt-2 text-base font-semibold text-white">Perfil recibido</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Paso 2</p>
                  <p className="mt-2 text-base font-semibold text-white">Revision comercial</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Paso 3</p>
                  <p className="mt-2 text-base font-semibold text-white">Acceso y contacto</p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={goToLanding}
                  className="inline-flex items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#06b6d4_0%,#0891b2_100%)] px-5 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110"
                >
                  Volver al inicio
                </button>
                <button
                  type="button"
                  onClick={() => setScreenMode("info")}
                  className="inline-flex items-center justify-center rounded-2xl border border-cyan-300/15 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-cyan-300/35 hover:bg-white/5"
                >
                  Ver resumen del evento
                </button>
              </div>
            </div>
          ) : null}

          {screenMode === "apply" ? renderOnboarding() : null}
        </section>
      </div>
    </main>
  );
}
