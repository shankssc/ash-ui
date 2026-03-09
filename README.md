# 🎨 Ash UI

Production-grade React component library with TypeScript + Tailwind CSS

[![npm version](https://img.shields.io/npm/v/@shankssc/ash-ui.svg?style=for-the-badge&color=007acc)](https://www.npmjs.com/package/@shankssc/ash-ui)
[![npm downloads](https://img.shields.io/npm/dm/@shankssc/ash-ui.svg?style=for-the-badge&color=007acc)](https://www.npmjs.com/package/@shankssc/ash-ui)
[![Storybook](https://img.shields.io/badge/Storybook-FF4785?style=for-the-badge&logo=storybook&logoColor=white)](https://ash-ui.netlify.app)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**@shankssc/ash-ui** — Accessible, type-safe, production-ready React components built with Tailwind CSS.

## 🚀 Installation

```bash
npm install @shankssc/ash-ui
# or
yarn add @shankssc/ash-ui
# or
pnpm add @shankssc/ash-ui
```

### ⚠️ Import Styles (Required)

```tsx
// In your root file (e.g., main.tsx or App.tsx)
import "@shankssc/ash-ui/styles.css";
```

## ✨ Features

- ✅ **TypeScript** - Full type safety with generics
- ✅ **Tailwind CSS** - Utility-first styling
- ✅ **Accessible** - WCAG 2.1 compliant, keyboard navigable
- ✅ **Responsive** - Mobile-first design
- ✅ **Tree-shakable** - Only bundle what you use

## 📦 Components

- `Button` - Multiple variants, sizes, loading states
- `Modal` - Focus trapping, ARIA compliant
- `DataTable` - Sorting, pagination, virtualization
- `DateRangePicker` - Keyboard accessible calendar

## 🚀 Try It Live

**[Interactive Storybook Demo](https://ash-ui.netlify.app/)** ← Share this!

## 📚 Documentation

Each component includes:

- Props table with types
- Usage examples
- Accessibility guidelines
- Theming support

## 🛠️ Tech Stack

- React 18 + TypeScript
- Vite + SWC
- Tailwind CSS
- Storybook 7
- Vitest + Testing Library

## 💻 Quick Example

```tsx
import { DateRangePicker } from "@shankssc/ash-ui";
import "@shankssc/ash-ui/styles.css";

function BookingForm() {
  const [range, setRange] = useState({ from: null, to: null });

  return (
    <DateRangePicker value={range} onChange={setRange} minDate={new Date()} />
  );
}
```
