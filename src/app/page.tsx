import VentmarOnboardingForm from "../components/VentmarOnboardingForm";

const segments = [
  {
    eyebrow: "Perfil 01",
    title: "Estoy empezando",
    description:
      "Para quienes estan entrando al juego y necesitan productos, criterio y estructura para vender mejor.",
  },
  {
    eyebrow: "Perfil 02",
    title: "Ya vendo regularmente",
    description:
      "Pensado para operadores que buscan nuevos proveedores, stock local y oportunidades mas estables.",
  },
  {
    eyebrow: "Perfil 03",
    title: "Escalo campanas activas",
    description:
      "Ideal para quienes ya tienen volumen y quieren networking, velocidad operativa y mejor oferta.",
  },
] as const;

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(242,97,34,0.16),transparent_24%),radial-gradient(circle_at_top_right,rgba(46,111,216,0.14),transparent_28%),linear-gradient(180deg,#0F172A_0%,#111C33_50%,#0B1220_100%)] px-4 py-6 text-slate-100 sm:px-6 lg:px-10">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl flex-col gap-6 lg:grid lg:grid-cols-[0.95fr_1.05fr] lg:items-stretch">
        <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#0F172A]/92 px-6 py-8 text-white shadow-[0_20px_60px_rgba(8,15,30,0.45)] sm:px-8 sm:py-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(46,111,216,0.22),transparent_25%),radial-gradient(circle_at_bottom_left,rgba(242,97,34,0.18),transparent_28%),linear-gradient(180deg,rgba(15,23,42,0.2),rgba(2,6,23,0.65))]" />
          <div className="relative flex h-full flex-col justify-between gap-8">
            <div className="space-y-6">
              <div className="inline-flex w-fit items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white">
                VENTMAR ARGENTINA
              </div>
              <div className="space-y-4">
                <p className="text-sm font-medium uppercase tracking-[0.28em] text-[#F2D35E]">
                  Evento privado para dropshippers
                </p>
                <h1 className="max-w-xl text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
                  Onboarding de aplicacion para acceder a proveedores, stock y networking de alto nivel.
                </h1>
                <p className="max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
                  Segmentamos asistentes por nivel, interes comercial y contexto operativo para ofrecer una experiencia mas util dentro del evento privado de Ventmar en Argentina.
                </p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {segments.map((segment) => (
                <div key={segment.title} className="rounded-3xl border border-white/10 bg-white/6 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-[#F2D35E]/80">{segment.eyebrow}</p>
                  <p className="mt-2 text-lg font-semibold">{segment.title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{segment.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <VentmarOnboardingForm />
      </div>
    </main>
  );
}
