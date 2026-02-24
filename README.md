# 261253_poomthai_promkote

Playtorium - Take Home Assignment For Developer

This project is a [Next.js](https://nextjs.org) application built with **TypeScript**, **Tailwind CSS**, and the **App Router**.

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- npm (comes with Node.js)

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

### 3. Build for production

```bash
npm run build
```

### 4. Start the production server

```bash
npm run start
```

## Project Structure

```
.
├── src/
│   ├── app/                  # Next.js App Router pages and layouts
│   │   ├── layout.tsx        # Root layout
│   │   ├── page.tsx          # Discount playground UI
│   │   └── globals.css       # Global styles (Tailwind entry)
│   └── lib/                  # Domain logic and types
│       ├── discount-types.ts # Shared types/constants
│       └── discounts.ts      # Discount engine calculations
├── public/                   # Static assets
├── next.config.ts            # Next.js configuration
├── tsconfig.json             # TypeScript configuration
├── postcss.config.mjs        # PostCSS configuration (Tailwind CSS)
├── eslint.config.mjs         # ESLint configuration
└── package.json
```

## Available Scripts

| Command         | Description                              |
| --------------- | ---------------------------------------- |
| `npm run dev`   | Start development server with hot reload |
| `npm run build` | Build the application for production     |
| `npm run start` | Start the production server              |
| `npm run lint`  | Run ESLint to check code quality         |

## Tech Stack

- **[Next.js](https://nextjs.org/)** – React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** – Type-safe JavaScript
- **[Tailwind CSS](https://tailwindcss.com/)** – Utility-first CSS framework
- **[ESLint](https://eslint.org/)** – Code linting

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

## Deploy on Vercel

The easiest way to deploy this app is via the [Vercel Platform](https://vercel.com/new). See the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
