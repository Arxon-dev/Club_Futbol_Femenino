---
name: Elite Design System - Fútbol Femenino
description: Sistema de diseño premium y de élite para las aplicaciones (Web y Android) del Club de Fútbol Femenino. Define paletas de colores vibrantes, tipografía moderna, y estilos de componentes para lograr un acabado profesional y "Wow factor".
---

# Elite Design System — Club de Fútbol Femenino

Este documento establece las bases de diseño visual y de UX/UI. Transmite **velocidad, élite, profesionalidad y energía**. Deportivo pero Premium, con micro-interacciones y glassmorphism sutil.

## 1. Paleta de Colores

| Token Tailwind            | Hex       | Uso                                       |
| ------------------------- | --------- | ----------------------------------------- |
| `elite-bg`                | `#0F172A` | Fondo principal de la app                 |
| `elite-surface`           | `#1E293B` | Cards, sidebar, modales                   |
| `elite-primary`           | `#6D28D9` | Botones primarios, links activos, acentos |
| `elite-primary-hover`     | `#7C3AED` | Hover de botones primarios                |
| `elite-secondary`         | `#06B6D4` | CTAs secundarios, iconos de acción        |
| `elite-accent`            | `#F43F5E` | Errores, alertas, botones destructivos    |
| `text-white` / `slate-50` | `#F8FAFC` | Texto principal                           |
| `text-slate-400`          | `#94A3B8` | Texto secundario, labels                  |
| `text-slate-500`          | `#64748B` | Texto terciario, placeholders             |

### ❌ NO USAR

- `bg-white`, `bg-gray-50`, `bg-gray-100` (rompen el dark theme)
- `text-gray-900`, `text-gray-700`, `text-gray-500` (invisibles en dark)
- `text-indigo-*`, `bg-indigo-*` (fuera de paleta)
- `#ED1C24` o cualquier rojo hardcodeado (usar `elite-accent`)
- `border-gray-200`, `border-gray-300` (usar `border-white/5` o `border-white/10`)

## 2. Tipografía

- **Headings**: `font-heading` (Outfit) — `text-white`, `font-bold`, `tracking-tight`
- **Body**: `font-sans` (Inter) — `text-slate-300` o `text-slate-400`
- **Labels**: `text-sm font-medium text-slate-400`
- **Captions**: `text-xs text-slate-500`

## 3. Componentes Reutilizables

### Layout (`components/layout/Layout.tsx`)

```tsx
import Layout from "./components/layout/Layout";
// Envuelve TODA la app (App.tsx lo aplica automáticamente)
```

- Sidebar con nav items, indicador activo (barra violeta izquierda)
- Responsive: hamburger en mobile, sidebar fija en desktop

### PageHeader (`components/ui/PageHeader.tsx`)

```tsx
<PageHeader
  title="Dashboard"
  subtitle="Resumen financiero."
  actions={<EliteButton>Acción</EliteButton>}
/>
```

### EliteCard (`components/ui/EliteCard.tsx`)

```tsx
<EliteCard>Contenido</EliteCard>
<EliteCard padding="p-0">Para tablas sin padding</EliteCard>
```

Genera: `bg-elite-surface border border-white/[0.06] rounded-2xl`

### EliteButton (`components/ui/EliteButton.tsx`)

```tsx
<EliteButton variant="primary" icon={<Plus />}>Crear</EliteButton>
<EliteButton variant="secondary">Editar</EliteButton>
<EliteButton variant="danger">Eliminar</EliteButton>
<EliteButton variant="ghost">Cancelar</EliteButton>
<EliteButton loading>Guardando...</EliteButton>
```

### EliteInput, EliteTextarea, EliteSelect (`components/ui/EliteInput.tsx`)

```tsx
<EliteInput label="Nombre" value={val} onChange={...} />
<EliteTextarea label="Notas" rows={3} />
<EliteSelect label="Rol"><option>ADMIN</option></EliteSelect>
```

Genera: `bg-elite-bg/80 border-white/10 rounded-xl focus:ring-elite-primary/60`

### EliteModal (`components/ui/EliteModal.tsx`)

```tsx
<EliteModal isOpen={open} onClose={close} title="Título">
  <form>...</form>
</EliteModal>
```

Genera: backdrop-blur + slide-up animation

### EliteTable (`components/ui/EliteTable.tsx`)

```tsx
<EliteTable
  columns={[{ key: "name", header: "Nombre", render: (item) => item.name }]}
  data={items}
  keyExtractor={(i) => i.id}
/>
```

## 4. Recetas Comunes

### Stat Cards (Dashboard / Treasury)

```tsx
<EliteCard className="flex items-center gap-4">
  <div className="w-11 h-11 rounded-xl bg-elite-primary/15 text-elite-primary-hover flex items-center justify-center">
    <Icon />
  </div>
  <div>
    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
      Label
    </p>
    <p className="text-xl font-bold text-emerald-400">+1,200€</p>
  </div>
</EliteCard>
```

### Role Badges

```tsx
const roleBadge = {
  ADMIN: "bg-elite-accent/15 text-elite-accent border-elite-accent/20",
  COACH: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  PLAYER:
    "bg-elite-secondary/15 text-elite-secondary border-elite-secondary/20",
};
<span
  className={`px-2 py-0.5 text-xs font-medium rounded-full border ${roleBadge[role]}`}
>
  {role}
</span>;
```

### Loading Spinner

```tsx
<div className="flex justify-center items-center min-h-[60vh]">
  <Loader2 className="w-8 h-8 animate-spin text-elite-primary" />
</div>
```

### Error Alert

```tsx
<div className="bg-elite-accent/10 border border-elite-accent/20 text-elite-accent p-3 rounded-xl text-sm">
  {error}
</div>
```

### Empty State

```tsx
<EliteCard className="text-center py-16">
  <Icon className="w-14 h-14 text-slate-700 mx-auto mb-4" />
  <p className="text-slate-500">No hay datos.</p>
</EliteCard>
```

## 5. Android (Jetpack Compose)

- Actualizar `ui/theme/Color.kt` con los mismos hex.
- `DarkColorScheme` con `primary = Violet700`, `background = Slate900`, `surface = Slate800`.
- **Desactivar Dynamic Colors** — nuestra paleta tiene prioridad total.
- Fuente `Outfit` para headings, `Inter` para body.
