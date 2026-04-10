"use client";

import { useState } from "react";
import { isSupabaseConfigured, supabase } from "../lib/supabaseClient";

const INITIAL_FORM_DATA = {
  nombre: "",
  whatsapp: "",
  email: "",
  ciudad: "",
};

export default function Formulario() {
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [status, setStatus] = useState({
    type: "idle",
    message: "",
  });

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!isSupabaseConfigured || !supabase) {
      setStatus({
        type: "error",
        message:
          "Configura NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY para habilitar el envio.",
      });
      return;
    }

    setStatus({
      type: "loading",
      message: "Enviando datos...",
    });

    const { error } = await supabase.from("formularios").insert([formData]);

    if (error) {
      setStatus({
        type: "error",
        message: "No se pudo guardar el formulario. Revisa la tabla y la configuracion de Supabase.",
      });
      return;
    }

    setFormData(INITIAL_FORM_DATA);
    setStatus({
      type: "success",
      message: "Formulario enviado correctamente.",
    });
  }

  return (
    <section className="form-card">
      <form className="form-grid" onSubmit={handleSubmit}>
        <div className="field-group">
          <label htmlFor="nombre">Nombre</label>
          <input
            id="nombre"
            name="nombre"
            type="text"
            placeholder="Tu nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
          />
        </div>

        <div className="field-group">
          <label htmlFor="whatsapp">WhatsApp</label>
          <input
            id="whatsapp"
            name="whatsapp"
            type="tel"
            placeholder="+54 9 11 1234-5678"
            value={formData.whatsapp}
            onChange={handleChange}
            required
          />
        </div>

        <div className="field-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="tu@email.com"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="field-group">
          <label htmlFor="ciudad">Ciudad</label>
          <input
            id="ciudad"
            name="ciudad"
            type="text"
            placeholder="Tu ciudad"
            value={formData.ciudad}
            onChange={handleChange}
            required
          />
        </div>

        <p className="helper-text">
          El formulario intenta guardar los datos en la tabla <strong>formularios</strong> de Supabase.
        </p>

        {status.message ? (
          <p className="status-text" data-status={status.type}>
            {status.message}
          </p>
        ) : null}

        <button
          className="submit-button"
          type="submit"
          disabled={status.type === "loading"}
        >
          {status.type === "loading" ? "Enviando..." : "Enviar formulario"}
        </button>
      </form>
    </section>
  );
}
