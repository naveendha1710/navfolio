# Navfolio — Modern Interactive Portfolio

A high-performance, developer and AI/ML portfolio website built with modern web technologies. Features 3D physics (Rapier), interactive custom shaders (OGL), procedural canvas animations, smooth inertia scrolling (Lenis), and refined typography.

- **Live Demo**: [https://navfolio.pages.dev](https://navfolio.pages.dev)
- **Deployment Platform**: Cloudflare Pages

---

## Tech Stack

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite 8](https://vitejs.dev/) with Rolldown / OXC minification
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **3D Graphics & Physics**: [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber), [@react-three/drei](https://github.com/pmndrs/drei), [@react-three/rapier](https://github.com/pmndrs/react-three-rapier), [Three.js](https://threejs.org/)
- **Shaders & WebGL**: [OGL](https://github.com/oframe/ogl) (FaultyTerminal background shader)
- **Animation**: [Framer Motion](https://www.framer.com/motion/), [GSAP](https://gsap.com/) (ScrollTrigger)
- **Smooth Scroll**: [Lenis](https://lenis.darkroom.engineering/)
- **Backend / Serverless**: [Cloudflare Pages Functions](https://developers.cloudflare.com/pages/platform/functions/) (TypeScript runtime at `/api/contact`)

---

## Project Structure

```text
├── functions/
│   └── api/
│       └── contact.ts          # Cloudflare Pages Function (form submission API)
├── public/
│   ├── _headers                # Cloudflare caching headers
│   ├── resume.pdf              # Publicly served resume file
│   └── favicon*                # Icons and site manifest
├── src/
│   ├── assets/                 # WebP/PNG images, 3D card textures
│   ├── components/             # UI components and interactive sections
│   │   ├── ui/                 # Reusable buttons, book, accordion components
│   │   ├── HeroHeader.tsx      # Typewriter greeting and magnetic CTA
│   │   ├── Lanyard.tsx         # 3D interactive physics lanyard card
│   │   ├── FaultyTerminal.tsx  # Interactive WebGL CRT shader
│   │   ├── ProjectsSection.tsx # Projects showcase grid
│   │   └── ConnectSection.tsx  # Email connect input with animated feedback
│   ├── data/
│   │   ├── profile.tsx         # Portfolio data layer (personal info, projects, links)
│   │   └── profile.example.tsx # Contributor template with sample data
│   ├── App.tsx                 # Main layout and section orchestration
│   ├── main.tsx                # React application root
│   └── index.css               # Tailwind CSS imports & global theme
├── .env.example                # Sample environment variables template
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/naveendha1710/navfolio.git
   cd navfolio
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. (Optional) Set up environment variables:
   ```bash
   cp .env.example .dev.vars
   ```

### Running Locally

Start the Vite development server:
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Customizing Portfolio Content

All personal data, projects, social links, story pages, and credentials are centralized in:

```text
src/data/profile.tsx
```

To customize for your own portfolio:
1. Refer to `src/data/profile.example.tsx` for the expected schema.
2. Edit `src/data/profile.tsx` with your personal information:
   - `personalInfo`: name, title, bio, email, resume filename
   - `socialLinks`: GitHub, LinkedIn, Instagram, Discord
   - `sampleBookPages`: interactive book chapters
   - `projectsData`: project titles, descriptions, tech stacks, and links
   - `faqItemsData`: education, experience, and certificates
3. Replace `public/resume.pdf` with your own resume PDF.

---

## Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts local development server with Hot Module Replacement |
| `npm run build` | Runs TypeScript type checking (`tsc`) and bundles for production (`vite build`) |
| `npm run preview` | Previews the production build locally |

---

## Deployment (Cloudflare Pages)

1. Connect your GitHub repository to **Cloudflare Pages**.
2. Set the build configuration:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Build Output Directory**: `dist`
3. (Optional) In **Cloudflare Pages Dashboard -> Settings -> Environment Variables**, configure:
   - `SHEETS_WEBHOOK_URL`: Your Google Apps Script webhook URL for lead logging.
   - `CONTACT_TO_EMAIL`: Your notification email.

---

## License

This project is open-source under the [MIT License](LICENSE).
