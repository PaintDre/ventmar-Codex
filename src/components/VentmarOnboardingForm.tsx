"use client";

import { type ChangeEvent, type FormEvent, useState } from "react";

type NivelUsuario =
  | "Estoy empezando"
  | "Ya vendo regularmente"
  | "Escalo campanas activas";

type VentasSemanales = "Aun ninguna" | "1-10" | "10-50" | "50+";
type ProveedorLocal = "Si" | "No" | "Algunos";
type InteresStockArgentina = "Si quiero acceder" | "Quiero conocer primero";
type CategoriaInteres =
  | "Belleza"
  | "Fitness"
  | "Hogar"
  | "Tecnologia"
  | "Productos virales"
  | "Otros";

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

type FeedbackState = {
  type: "idle" | "success" | "error";
  message: string;
};

type StepDefinition = {
  step: number;
  label: string;
  title: string;
  description: string;
};

const TOTAL_STEPS = 5;

const STEP_DEFINITIONS: StepDefinition[] = [
  {
    step: 1,
    label: "Identidad",
    title: "Aplicacion de acceso al evento privado Ventmar Argentina",
    description:
      "Queremos validar tu perfil y reservar tu lugar con informacion precisa desde el inicio.",
  },
  {
    step: 2,
    label: "Nivel actual",
    title: "Contanos en que momento estas",
    description:
      "Esto nos ayuda a segmentar el acceso y preparar propuestas acordes a tu etapa comercial.",
  },
  {
    step: 3,
    label: "Actividad comercial",
    title: "Entendamos tu operacion actual",
    description:
      "Necesitamos una referencia simple de movimiento semanal y relacion con proveedores locales.",
  },
  {
    step: 4,
    label: "Interes comercial",
    title: "Que categorias y productos queres trabajar",
    description:
      "Usamos esta informacion para conectar asistentes con oportunidades mas relevantes dentro del evento.",
  },
  {
    step: 5,
    label: "Acceso al evento",
    title: "Ultimo paso para evaluar tu acceso",
    description:
      "Con esta respuesta definimos como presentarte opciones de stock y proveedores en Argentina.",
  },
];

const NIVEL_OPTIONS: NivelUsuario[] = [
  "Estoy empezando",
  "Ya vendo regularmente",
  "Escalo campanas activas",
];

const VENTAS_OPTIONS: VentasSemanales[] = ["Aun ninguna", "1-10", "10-50", "50+"];
const PROVEEDOR_OPTIONS: ProveedorLocal[] = ["Si", "No", "Algunos"];
const EVENTO_OPTIONS: InteresStockArgentina[] = [
  "Si quiero acceder",
  "Quiero conocer primero",
];
const CATEGORY_OPTIONS: CategoriaInteres[] = [
  "Belleza",
  "Fitness",
  "Hogar",
  "Tecnologia",
  "Productos virales",
  "Otros",
];

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

const INITIAL_FEEDBACK: FeedbackState = {
  type: "idle",
  message: "",
};

function buildFormularioInsertPayload(data: FormData) {
  return {
    ...data,
  };
}

function validateStep(step: number, data: FormData) {
  if (step === 1) {
    if (!data.nombre || !data.whatsapp || !data.email || !data.ciudad || !data.dni) {
      return "Completa nombre, WhatsApp, email, ciudad y DNI para continuar.";
    }
  }

  if (step === 2 && !data.nivel_usuario) {
    return "Selecciona tu nivel actual para continuar.";
  }

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

export default function VentmarOnboardingForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [feedback, setFeedback] = useState<FeedbackState>(INITIAL_FEEDBACK);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSupabaseReady = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
  const progressPercentage = (currentStep / TOTAL_STEPS) * 100;
  const currentStepDefinition = STEP_DEFINITIONS[currentStep - 1];

  function handleChange(
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    const key = event.target.name as keyof FormData;
    const value = event.target.value;

    setFormData((currentData) => ({
      ...currentData,
      [key]: value,
    }) as FormData);
  }

  function handleCategoryToggle(category: CategoriaInteres) {
    setFormData((currentData) => {
      const categorias_interes = currentData.categorias_interes.includes(category)
        ? currentData.categorias_interes.filter((item) => item !== category)
        : [...currentData.categorias_interes, category];

      return {
        ...currentData,
        categorias_interes,
      };
    });
  }

  function handleNextStep() {
    const validationMessage = validateStep(currentStep, formData);

    if (validationMessage) {
      setFeedback({
        type: "error",
        message: validationMessage,
      });
      return;
    }

    setFeedback(INITIAL_FEEDBACK);
    setCurrentStep((step) => Math.min(step + 1, TOTAL_STEPS));
  }

  function handlePreviousStep() {
    setFeedback(INITIAL_FEEDBACK);
    setCurrentStep((step) => Math.max(step - 1, 1));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationMessage = validateStep(currentStep, formData);

    if (validationMessage) {
      setFeedback({
        type: "error",
        message: validationMessage,
      });
      return;
    }

    if (!isSupabaseReady) {
      setFeedback({
        type: "error",
        message:
          "Configura NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY para habilitar el envio.",
      });
      return;
    }

    setIsSubmitting(true);
    setFeedback(INITIAL_FEEDBACK);

    try {
      const { getSupabaseClient } = await import("../lib/supabaseClient");
      const supabase = getSupabaseClient();
      const payload = buildFormularioInsertPayload(formData);
      const { error } = await supabase.from("Formularios").insert([payload]);

      if (error) {
        throw error;
      }

      setFormData(INITIAL_FORM_DATA);
      setCurrentStep(1);
      setFeedback({
        type: "success",
        message: "Tu aplicacion fue enviada correctamente",
      });
    } catch {
      setFeedback({
        type: "error",
        message:
          "No pudimos registrar tu acceso todavia. Estamos verificando tu conexion con el sistema. Intenta nuevamente en unos segundos.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="rounded-[2rem] border border-white/70 bg-white p-5 shadow-[0_20px_50px_rgba(15,23,42,0.08)] sm:p-7 lg:p-8">
      <div className="mb-6 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
              Paso {currentStep} de {TOTAL_STEPS}
            </p>
            <p className="mt-1 text-sm text-slate-500">{currentStepDefinition.label}</p>
          </div>
          <p className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            {Math.round(progressPercentage)}%
          </p>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,#0f766e_0%,#10b981_100%)] transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-slate-950">
            {currentStepDefinition.title}
          </h2>
          <p className="text-sm leading-6 text-slate-600">
            {currentStepDefinition.description}
          </p>
        </div>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        {currentStep === 1 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium text-slate-800" htmlFor="nombre">
                Nombre
              </label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Tu nombre completo"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-800" htmlFor="whatsapp">
                WhatsApp
              </label>
              <input
                id="whatsapp"
                name="whatsapp"
                type="tel"
                value={formData.whatsapp}
                onChange={handleChange}
                placeholder="+54 9 11 1234 5678"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-800" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="tu@email.com"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-800" htmlFor="ciudad">
                Ciudad
              </label>
              <input
                id="ciudad"
                name="ciudad"
                type="text"
                value={formData.ciudad}
                onChange={handleChange}
                placeholder="Tu ciudad"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-800" htmlFor="dni">
                DNI
              </label>
              <input
                id="dni"
                name="dni"
                type="text"
                inputMode="numeric"
                value={formData.dni}
                onChange={handleChange}
                placeholder="Tu DNI"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                required
              />
            </div>
          </div>
        ) : null}

        {currentStep === 2 ? (
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-800" htmlFor="nivel_usuario">
              Nivel de usuario
            </label>
            <select
              id="nivel_usuario"
              name="nivel_usuario"
              value={formData.nivel_usuario}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              required
            >
              <option value="">Selecciona una opcion</option>
              {NIVEL_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        {currentStep === 3 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-800" htmlFor="ventas_semanales">
                Ventas semanales
              </label>
              <select
                id="ventas_semanales"
                name="ventas_semanales"
                value={formData.ventas_semanales}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                required
              >
                <option value="">Selecciona una opcion</option>
                {VENTAS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-800" htmlFor="proveedor_local">
                Proveedor local
              </label>
              <select
                id="proveedor_local"
                name="proveedor_local"
                value={formData.proveedor_local}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                required
              >
                <option value="">Selecciona una opcion</option>
                {PROVEEDOR_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : null}

        {currentStep === 4 ? (
          <div className="space-y-5">
            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-800">Categorias de interes</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {CATEGORY_OPTIONS.map((category) => {
                  const isSelected = formData.categorias_interes.includes(category);

                  return (
                    <label
                      key={category}
                      className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 transition ${
                        isSelected
                          ? "border-emerald-500 bg-emerald-50 text-emerald-900"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleCategoryToggle(category)}
                        className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-sm font-medium">{category}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-800" htmlFor="producto_interes">
                Producto de interes
              </label>
              <input
                id="producto_interes"
                name="producto_interes"
                type="text"
                value={formData.producto_interes}
                onChange={handleChange}
                placeholder="Ejemplo: serum facial, masajeador, gadget viral"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>
          </div>
        ) : null}

        {currentStep === 5 ? (
          <div className="space-y-5">
            <div className="space-y-2">
              <label
                className="text-sm font-medium text-slate-800"
                htmlFor="interes_stock_argentina"
              >
                Interes en stock en Argentina
              </label>
              <select
                id="interes_stock_argentina"
                name="interes_stock_argentina"
                value={formData.interes_stock_argentina}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                required
              >
                <option value="">Selecciona una opcion</option>
                {EVENTO_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-3xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm leading-6 text-amber-900">
              Esta aplicacion nos permite priorizar asistentes con mayor afinidad comercial para el evento
              privado de Ventmar Argentina.
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
            onClick={handlePreviousStep}
            disabled={currentStep === 1 || isSubmitting}
            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Volver
          </button>

          {currentStep < TOTAL_STEPS ? (
            <button
              type="button"
              onClick={handleNextStep}
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
    </section>
  );
}
