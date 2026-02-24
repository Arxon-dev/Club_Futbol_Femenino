---
name: Elite Design System - Fútbol Femenino
description: Sistema de diseño premium y de élite para las aplicaciones (Web y Android) del Club de Fútbol Femenino. Define paletas de colores vibrantes, tipografía moderna, y estilos de componentes para lograr un acabado profesional y "Wow factor".
---

# Elite Design System - Club de Fútbol Femenino

Este documento establece las bases de diseño visual y de experiencia de usuario (UX/UI) para garantizar un aspecto moderno, enérgico, premium y consistente en todas las plataformas (React Web y Android Compose).

## 1. Filosofía y "Vibe"

El diseño debe transmitir **velocidad, élite, profesionalidad y energía**. Alejarse de los colores planos corporativos aburridos.

- **Deportivo pero Premium**: Uso de fondos oscuros profundos (no negro puro) con acentos de color neón/vibrantes.
- **Micro-interacciones**: La aplicación debe sentirse viva. Efectos hover suaves, transiciones fluidas, animaciones al pulsar botones.
- **Glassmorphism**: Componentes con fondos semitransparentes y desenfoque (blur) superpuestos sobre fondos texturizados o gradientes.

## 2. Paleta de Colores (Los "Elite Colors")

### 2.1 Tema Oscuro (Recomendado por defecto para apps deportivas)

- **Background**: `#0F172A` (Slate 900) - Azul marino muy oscuro, elegante.
- **Surface (Cards, Modals)**: `#1E293B` (Slate 800) - Ligeramente más claro para separar del fondo.
- **Primary**: `#8B5CF6` (Violet 500) a `#6D28D9` (Violet 700) - Identidad fuerte, premium, femenina y poderosa.
- **Secondary (Accents/Action)**: `#06B6D4` (Cyan 500) - Contraste vibrante y eléctrico para llamadas a la acción (CTAs).
- **Tertiary / Alerts**: `#F43F5E` (Rose 500) - Para notificaciones, errores o acentos intensos.
- **Text Primary**: `#F8FAFC` (Slate 50) - Blanco roto para legibilidad.
- **Text Secondary**: `#94A3B8` (Slate 400) - Gris azulado para textos secundarios.

### 2.2 Tema Claro

- **Background**: `#F8FAFC` (Slate 50)
- **Surface**: `#FFFFFF`
- **Primary**: `#6D28D9` (Violet 700)
- **Secondary**: `#0891B2` (Cyan 600)
- **Text Primary**: `#0F172A`
- **Text Secondary**: `#475569`

## 3. Tipografía (Google Fonts)

- **Titulares y Destacados (Headers)**: `Outfit` (Tipografía geométrica, moderna, altamente legible e ideal para branding deportivo y tecnológico).
- **Cuerpo de Texto y UI (Body)**: `Inter` o `Roboto` (Tipografía neutra, perfecta para lectura de datos, tablas y listas).

## 4. Estilo de Componentes

### Botones

- Bordes redondeados modernos: `12px` (o `rounded-xl` en Tailwind).
- Botones primarios: Gradiente sutil (ej. de Violet 500 a Violet 600) con texto en blanco. Efecto _glow_ (sombra difuminada del mismo color del botón) al hacer hover o enfocar.

### Tarjetas (Cards)

- Radios más amplios: `16px` o `24px` (`rounded-2xl`).
- En tema oscuro: Borde sutil transparente (ej. `border-white/10`) para destacar sobre el fondo `Slate 900`.
- Sombra: Suave (`shadow-lg` o `shadow-xl` de Tailwind) adaptada al color de fondo para dar profundidad.

### Inputs / Formularios

- Estilo "Filled" o fondo semi-transparente en dark mode (`bg-slate-800/50`).
- Anillos de enfoque (Focus Rings) prominentes en color Secondary (Cyan) o Primary (Violet).

## 5. Implementación en Plataformas

### 5.1 Web (React + Tailwind CSS)

- Extender `tailwind.config.js` para añadir estos colores de marca bajo el bloque `theme.extend.colors`.
- Añadir directiva `@import url(...)` en `index.css` para cargar `Outfit` e `Inter`.
- Crear utilidades CSS personalizadas en `index.css` si se necesitan gradientes complejos o animaciones (ej. `animate-fade-in-up`).

### 5.2 Android (Jetpack Compose)

- Actualizar `ui/theme/Color.kt` con las constantes exactas de los colores mencionados.
- Actualizar `ui/theme/Theme.kt` para usar nuestras paletas en `DarkColorScheme` y `LightColorScheme`.
- **Desactivar Dynamic Colors** o hacer que nuestra paleta tenga prioridad total para asegurar el _Look & Feel_ élite, ya que los colores extraídos del fondo de pantalla del usuario podrían romper el diseño deportivo.
- Descargar e integrar los Downloadable Fonts de `Outfit` en `ui/theme/Type.kt`.
