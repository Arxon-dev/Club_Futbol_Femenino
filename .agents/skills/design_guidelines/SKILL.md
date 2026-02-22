---
name: Design and Architectural Guidelines - OpoMelilla
description: Guía de estilo y arquitectura para mantener la consistencia visual y técnica en todas las plataformas (React, Node, Android). Llama a este skill antes de empezar a desarrollar UI o estructura de datos.
---

# Design & Architectural Guidelines (OpoMelilla Ecosystem)

Estas reglas aplican para todo el desarrollo del club de Fútbol Sala Femenino.

## 1. Principios de Diseño Visual (Premium Feel)

- **Colores**: Evita colores primarios básicos. Usa paletas dinámicas basadas en HSL (ej. _Slate_ para grises, azul eléctrico para acciones, toques morados o violetas si encaja con la temática del deporte femenino).
- **Contraste (WCAG AA)**: Garantizado en todos los temas (`Color.kt` en Android, `tailwind.config.js` en React).
- **Tipografía**: Usa Google Fonts modernas como `Inter`, `Outfit` o `Roboto`.
- **Micro-animaciones**: Usa animaciones sutiles en hover, botones que se pulsan, menús desplegables. La interfaz debe sentirse viva (framer-motion en Web, Compose Animations en Android).
- **Iconografía**: Usa siempre **Lucide React** para la web y Material Icons / compose-icons en Android.

## 2. Arquitectura Frontend Web (React + Vite)

- Ubicación: `web/`
- Framework: React con TypeScript (recomendado) o JavaScript + Vite.
- Estilos: Tailwind CSS.
- Estructura: Componentes pequeños y reutilizables.
- Estado: Context API o Zustand.
- Routing: React Router.

## 3. Arquitectura Backend (Node.js + Express)

- Ubicación: `api/`
- ORM: Sequelize (conectado a Supabase PostgreSQL).
- Validación: Joi o Zod.
- Seguridad: Helmet, CORS, JWT (JSON Web Tokens). Rutas protegidas según rol (ADMIN, COACH, PLAYER).

### Convenciones de Base de Datos (PostgreSQL / Sequelize)

- **Tablas**: `snake_case` y en minúsculas, siempre en **plural** (ej. `users`, `teams`, `players_teams`).
- **Columnas**: `snake_case` y en minúsculas (ej. `first_name`, `created_at`, `team_id`).
- **Tipos de Datos**: Usar UUID (`uuidv4`) para claves primarias en lugar de enteros autoincrementables. UUID aporta seguridad y escalabilidad global.
- **Timestamps**: Todas las tablas deben tener `created_at` y `updated_at`. Sequelize lo manejará automáticamente con la configuración de `underscored: true`.

## 4. Arquitectura Móvil (Android Nativo)

- Ubicación: `app/src/main/java/com/opomelilla/`
- UI: Jetpack Compose 100%. No uses XML.
- Arquitectura: MVVM + Clean Architecture.
- Inyección de Dependencias: Dagger Hilt.
- Networking: Retrofit + OkHttp. Configurado para manejar estados de Carga, Éxito y Error.

## 5. Integración Continua (Mentalidad)

- Valida siempre que la API responda lo que las pantallas esperan.
- Navega por el "Happy Path" pero ten manejadores de error visuales siempre listos (Toasts, Snackbars, Alerts).
- Si agregas un campo a la base de datos, agrégalo a la interfaz de Android y a la Web de inmediato.
