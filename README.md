# FrontendUfinet · Ofertas

SPA en **React + Vite + TypeScript** para crear ofertas, ver su precio (MRC) y presentarlas, consumiendo la API de `BackendUfinet`. Sin login: la aplicación abre directamente en el listado.

---

## 1. Especificaciones técnicas

| Aspecto | Tecnología |
|---|---|
| UI | React 19 + TypeScript (modo `strict`) |
| Build / dev server | Vite · puerto **5173** |
| Estado del servidor | TanStack Query v5 (caché, invalidación, mutaciones) |
| HTTP | axios (cliente único con interceptor de errores) |
| Rutas | React Router 7 |
| Estilos | CSS simple (`src/shared/styles/global.css`) |
| Pruebas | Vitest + React Testing Library + user-event + jest-dom (jsdom) |
| Calidad | ESLint (typescript-eslint, react-hooks) |

---

## 2. Instalación y ejecución

### Requisitos
- Node.js 20.19+ o 22+ y npm
- Backend en ejecución en `http://localhost:8080` (ver `../BackendUfinet`)

### Local
```bash
npm install
npm run dev            # http://localhost:5173
```

URL del backend: por defecto `http://localhost:8080`. Para cambiarla, copia `.env.example` a `.env` y edita `VITE_API_BASE_URL`.

| Script | Uso |
|---|---|
| `npm run dev` | Servidor de desarrollo (5173) |
| `npm run build` | Typecheck + build de producción en `dist/` |
| `npm run preview` | Sirve el build en 5173 |
| `npm run typecheck` | Solo verificación de tipos |
| `npm run lint` | ESLint |
| `npm test` | Pruebas unitarias |
| `npm run test:coverage` | Pruebas + reporte de cobertura (`coverage/index.html`) |

### Docker (frontend + backend)
```bash
docker compose up --build
```
Levanta el backend (`../BackendUfinet`, puerto 8080) y este frontend servido por Nginx en el puerto 5173 (el origen sigue siendo `http://localhost:5173`, el único que el backend permite por CORS).

---

## 3. Arquitectura

Arquitectura limpia organizada **por funcionalidad** (*feature-first*), con dependencias que apuntan hacia el dominio:

```
src/
├── app/                         # Composición: proveedores, QueryClient, rutas
│   ├── App.tsx  routes.tsx  queryClient.ts
│   └── providers/AppProviders.tsx
├── features/offers/             # Módulo de ofertas
│   ├── domain/                  # Tipos, reglas y validación (TS puro, sin React)
│   │   ├── offer.types.ts       # Offer, OfferSummary, enums (tipo, estado, plazo)
│   │   ├── offer.rules.ts       # Límites del modelo, canBePresented()
│   │   └── offerForm.ts         # validateOfferForm() = mismas reglas que el backend
│   ├── infrastructure/
│   │   └── offerApi.ts          # OfferRepository (puerto) + implementación HTTP
│   ├── application/             # Casos de uso como hooks de TanStack Query
│   │   ├── useOffers.ts  useOffer.ts  useCreateOffer.ts  usePresentOffer.ts
│   │   ├── useOfferForm.ts      # Estado del formulario (filas 1..5, errores)
│   │   └── queryKeys.ts
│   ├── presentation/
│   │   ├── components/          # OfferTable, OfferForm, ServiceRowFields,
│   │   │                        # ServicesTable, PresentOfferButton, OfferStatusBadge
│   │   └── pages/               # OfferListPage, OfferCreatePage, OfferDetailPage
│   └── index.ts                 # API pública del módulo
├── shared/                      # Reutilizable entre módulos
│   ├── api/                     # httpClient (axios) + ApiError/ProblemDetail
│   ├── config/env.ts
│   ├── ui/                      # LoadingState, ErrorMessage, AppLayout, NotFoundPage
│   ├── utils/formatCurrency.ts
│   └── styles/global.css
└── test/                        # Utilidades de prueba (renderApp, fixtures)
```

- **domain** no depende de React ni de axios.
- **infrastructure** es el único punto que conoce las URLs de la API.
- **application** expone hooks; las páginas no llaman a axios directamente.
- **presentation** solo pinta y delega.

### Manejo de errores
El interceptor de axios convierte cualquier fallo en `ApiError`:
- Respuesta `ProblemDetail` → `message = detail`, `status`, `code` y `fieldErrors` (`errors[]` del backend).
- Sin respuesta (backend caído) → *"No se pudo conectar con la API. Verifica que el backend esté en ejecución e intenta de nuevo."*

Los errores de campo usan la misma ruta que el backend (`cliente`, `servicios[0].mbps`…), así un **400 de la API se muestra junto al campo correspondiente**.

---

## 4. Pantallas y reglas implementadas

| Ruta | Pantalla | Comportamiento |
|---|---|---|
| `/` | — | Redirige a `/offers` |
| `/offers` | Listado | Tabla con id, cliente, estado y MRC total; botón **"Nueva oferta"**; carga, lista vacía y mensaje si la API no responde (con "Reintentar") |
| `/offers/new` | Nueva oferta | Cliente + filas de servicio (tipo, Mbps, plazo, viable). **"Agregar servicio"** y **"Quitar"** (1 a 5 filas). Valida en el navegador lo mismo que el backend y muestra los 400 de la API. Botón "Guardando..." mientras espera. Al guardar navega al detalle |
| `/offers/:id` | Detalle | Cliente, estado, tabla de servicios con su MRC y total en USD. **"Presentar"** deshabilitado si el estado no es `BORRADOR`, texto **"Presentando..."** mientras espera, mensaje si falla (404/409). Al terminar refresca la oferta y el listado (invalidación de TanStack Query, sin recargar la página) |

Validaciones del formulario (iguales al backend): cliente obligatorio y máximo 100 caracteres; 1 a 5 servicios; tipo `INTERNET`/`CAPACIDAD`; Mbps entero entre 10 y 10.000; plazo 12, 24 o 36.

---

## 5. Endpoints consumidos

| Método y ruta | Uso en el frontend |
|---|---|
| `GET /api/offers` | `useOffers` → listado |
| `POST /api/offers` | `useCreateOffer` → nueva oferta |
| `GET /api/offers/{id}` | `useOffer` → detalle |
| `POST /api/offers/{id}/present` | `usePresentOffer` → botón "Presentar" |

---

## 6. Pruebas unitarias

```bash
npm test
npm run test:coverage
```

**Resultado:** 11 archivos, **64 pruebas** en verde. Cobertura: **100 % de líneas, sentencias y funciones; 97,6 % de ramas**. Umbrales mínimos configurados: 85 % (líneas/funciones/sentencias) y 80 % (ramas).

| Archivo | Qué verifica |
|---|---|
| `offerForm.test.ts` | Validación en navegador: cliente (obligatorio, ≤100), 1–5 servicios, Mbps (obligatorio, entero, 10–10.000), tipo y plazo; conversión al cuerpo de la API |
| `offer.rules.test.ts` | `canBePresented` solo en `BORRADOR`; límites del modelo |
| `apiError.test.ts` | Normalización de `ProblemDetail` 400/404/409, respuestas no estándar y caída de la API |
| `httpClient.test.ts` | URL base e interceptor que convierte errores en `ApiError` |
| `offerApi.test.ts` | Rutas y verbos de los 4 endpoints |
| `queryClient.test.ts` | No reintenta 4xx; reintenta una vez red/5xx |
| `OfferListPage.test.tsx` | Abre en el listado, carga, columnas, lista vacía, API caída + reintento, navegación, 404 de ruta |
| `OfferCreatePage.test.tsx` | Filas 1..5 (Agregar/Quitar), validación en navegador, "Guardando...", envío y navegación al detalle, 400 de la API en cada campo, API caída |
| `OfferDetailPage.test.tsx` | Carga, datos y total en USD, "Presentando...", refresco de oferta y listado, botón deshabilitado en `PRESENTADA`/`NO_VIABLE`, mensajes 409/404, API caída + reintento, id no válido |
| `App.test.tsx` | Arranque sin login directo en `/offers` |
