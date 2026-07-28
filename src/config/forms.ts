/**
 * Definiciones de campos y mensajes de formularios.
 * Los schemas Zod y los formularios deben consumir estas fuentes.
 * El diseño visual de los inputs vive en YAML 01 — no tocar.
 */
import { z } from "zod";

export const formMessages = {
  required: "Este campo es obligatorio.",
  invalidEmail: "Introduce un correo electrónico válido.",
  invalidDate: "Introduce una fecha válida.",
  minimumLength: "El contenido es demasiado corto.",
  maximumLength: "El contenido supera el máximo permitido.",
  genericError: "Revisa este campo antes de continuar.",
} as const;

export const formFields = {
  email: {
    name: "email",
    type: "email",
    label: "Correo electrónico",
    autoComplete: "email",
    maxLength: 255,
  },
  password: {
    name: "password",
    type: "password",
    label: "Contraseña",
    autoComplete: "current-password",
    minLength: 8,
    maxLength: 128,
  },
  birthDate: {
    name: "birthDate",
    type: "date",
    label: "Fecha de nacimiento",
    autoComplete: "bday",
  },
  birthTime: {
    name: "birthTime",
    type: "time",
    label: "Hora de nacimiento",
  },
  birthPlace: {
    name: "birthPlace",
    type: "text",
    label: "Lugar de nacimiento",
    maxLength: 120,
  },
  zodiacSign: {
    name: "zodiacSign",
    type: "select",
    label: "Tu signo",
  },
} as const;

/** Validadores reutilizables — no duplicar reglas en cada schema. */
export const validators = {
  email: () =>
    z
      .string({ required_error: formMessages.required })
      .trim()
      .min(1, formMessages.required)
      .max(formFields.email.maxLength, formMessages.maximumLength)
      .email(formMessages.invalidEmail),
  password: () =>
    z
      .string({ required_error: formMessages.required })
      .min(formFields.password.minLength, formMessages.minimumLength)
      .max(formFields.password.maxLength, formMessages.maximumLength),
  requiredText: (max = 500) =>
    z
      .string({ required_error: formMessages.required })
      .trim()
      .min(1, formMessages.required)
      .max(max, formMessages.maximumLength),
  isoDate: () =>
    z
      .string({ required_error: formMessages.required })
      .regex(/^\d{4}-\d{2}-\d{2}$/, formMessages.invalidDate),
};

/** Esquemas comunes reutilizables. */
export const schemas = {
  newsletter: z.object({ email: validators.email() }),
  login: z.object({
    email: validators.email(),
    password: validators.password(),
  }),
  contact: z.object({
    email: validators.email(),
    message: validators.requiredText(1000),
  }),
} as const;

export type FieldKey = keyof typeof formFields;
