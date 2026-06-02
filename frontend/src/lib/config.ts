// src/lib/config.ts
//
// Central place for every external URL the app talks to.
// Values come from Vite env vars (see .env.example) and fall back to
// localhost so the app "just works" in local development.

export const API_URL =
  import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

export const KEYCLOAK_URL =
  import.meta.env.VITE_KEYCLOAK_URL ?? 'http://localhost:8081'

export const KEYCLOAK_REALM =
  import.meta.env.VITE_KEYCLOAK_REALM ?? 'xambook'

export const KEYCLOAK_CLIENT =
  import.meta.env.VITE_KEYCLOAK_CLIENT ?? 'xambook-frontend'

// When true the frontend skips Keycloak entirely and assumes a logged-in
// dev user. Pair this with DEV_MODE=true on the backend for local work.
export const AUTH_DISABLED =
  (import.meta.env.VITE_AUTH_DISABLED ?? 'false') === 'true'
