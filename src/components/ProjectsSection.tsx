import React, { memo } from 'react';
import { motion, Variants } from 'framer-motion';
import { ExternalLink, Layers, Cpu, Server } from 'lucide-react';
import { CreepyButton } from './ui/creepy-button';
import project1Img from '../assets/projects_image/project_1.png';
import project2Img from '../assets/projects_image/project_2.png';
import project3Img from '../assets/projects_image/project_3.png';

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    width="16"
    height="16"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

// Stagger container for letter-by-letter heading reveal
const headingContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.045, delayChildren: 0.1 } }
};
const letterVariant: Variants = {
  hidden: { opacity: 0, y: 50, rotateX: -30, clipPath: 'inset(100% 0 0 0)', transition: { duration: 0.35, ease: 'easeIn' as const } },
  show:   { opacity: 1, y: 0,   rotateX: 0,   clipPath: 'inset(0% 0 0 0)',
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } }
};

interface Project {
  id: string;
  numberLabel: string;
  title: string;
  subtitle: string;
  techStack: string[];
  bullets: string[];
  placeholderBg: string;
  placeholderTextColor?: string;
  iconBg?: string;
  imageSrc?: string;
  githubUrl?: string;
}

const projectsData: Project[] = [
  {
    id: "project-1",
    numberLabel: "Project 1",
    title: "ERP System",
    subtitle: "Full Stack with AI",
    techStack: ["React.js", "Node.js", "TypeScript", "PostgreSQL", "Supabase", "MCP"],
    bullets: [
      "Built a production-grade ERP handling Tenant, Asset management, Helpdesk and 50,000+ tracked assets",
      "Implemented agentic AI workflows for automated task routing and management across institutional departments"
    ],
    placeholderBg: "bg-[#f3efea]", // Warm cream palette
    placeholderTextColor: "text-amber-900/70",
    imageSrc: project1Img
  },
  {
    id: "project-2",
    numberLabel: "Project 2",
    title: "Semantic Router & LLM Caching Gateway",
    subtitle: "AI & Infrastructure Gateway",
    techStack: ["Python", "FastAPI", "Redis", "Docker"],
    bullets: [
      "Built an LLM gateway with semantic caching (vector similarity, Redis-backed) and complexity-based routing across cloud and local providers, reducing repeated API calls.",
      "Added quality-gated caching, and provider failover; benchmarking, and load testing, backed by 145 automated tests."
    ],
    placeholderBg: "bg-[#2b41f7]", // Electric Royal Blue
    placeholderTextColor: "text-white",
    imageSrc: project2Img,
    githubUrl: "https://github.com/naveendha1710/LLM-Gateway_Semantic-Caching-Complexity-Based-Routing"
  },
  {
    id: "project-3",
    numberLabel: "Project 3",
    title: "LLM Quantization Pipeline",
    subtitle: "Local AI & Benchmarking Toolkit",
    techStack: ["Python", "Hugging Face", "optimum-quanto"],
    bullets: [
      "Built a pure-Python pipeline to download, quantize (INT8/INT4), benchmark, and run LLMs (Qwen2.5, Llama 3) locally on CPU, without relying on pre-quantized downloads.",
      "Designed modular CLI scripts to benchmark size, load time, and tokens/s across BF16, INT8, and INT4 quantization levels, plus an interactive chat mode."
    ],
    placeholderBg: "bg-[#f1f1f3]", // Cool gray
    placeholderTextColor: "text-slate-800",
    imageSrc: project3Img,
    githubUrl: "https://github.com/naveendha1710/quantize_llm_model"
  }
];

// Interactive Floating AAA Gamer Cursor Badge with Soft Glow (exact emilianmisera.com UI/UX)
const CursorBadge = ({
  name,
  color,
  glowColor,
  positionClass,
  delay = 0
}: {
  name: string;
  color: string;
  glowColor: string;
  positionClass: string;
  delay?: number;
}) => {
  return (
    <motion.div
      className={`absolute z-20 pointer-events-none select-none flex items-center gap-1.5 opacity-100 ${positionClass}`}
      animate={{
        y: [-6, 6, -6],
        x: [-3, 3, -3]
      }}
      transition={{
        duration: 3.8,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
        delay
      }}
    >
      {/* Soft Glowing Backdrop Circle */}
      <div
        className="absolute -inset-4 rounded-full blur-xl opacity-60 pointer-events-none"
        style={{ backgroundColor: glowColor }}
      />

      {/* SVG Mouse Cursor Pointer Arrow */}
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill={color}
        className="relative z-10 drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)] -rotate-12 transform"
      >
        <path d="M5.5 3.21a1 1 0 0 0-1.54.91V19a1 1 0 0 0 1.63.77l4.02-3.4 3.03 5.43a1 1 0 0 0 1.38.38l2.25-1.26a1 1 0 0 0 .38-1.38l-3.04-5.44 5.07-.63A1 1 0 0 0 19.3 12L5.5 3.21z" />
      </svg>
      {/* Name Pill with AAA Game Character Name */}
      <span
        className="relative z-10 px-3.5 py-1 rounded-full text-xs font-bold font-mono tracking-tight text-white shadow-md border border-white/30 uppercase"
        style={{ backgroundColor: color }}
      >
        {name}
      </span>
    </motion.div>
  );
};

const ProjectsSection = memo(function ProjectsSection() {
  return (
    <section
      id="projects"
      className="relative z-30 w-full min-h-screen bg-[#f6f6f8] px-6 sm:px-12 lg:px-16 py-24 sm:py-32 overflow-hidden border-t border-slate-200/80"
    >
      {/* Floating AAA Game Character Cursors — randomized positions across section */}
      <CursorBadge name="Kratos"  color="#d946ef" glowColor="#e879f9" positionClass="top-[8%]  left-[14%]"  delay={0.1} />
      <CursorBadge name="Geralt"  color="#10b981" glowColor="#34d399" positionClass="top-[18%] left-[72%]"  delay={0.4} />
      <CursorBadge name="Vaas"    color="#06b6d4" glowColor="#38bdf8" positionClass="top-[35%] left-[5%]"   delay={0.7} />
      <CursorBadge name="Arthur"  color="#3b82f6" glowColor="#60a5fa" positionClass="top-[55%] left-[83%]"  delay={1.0} />
      <CursorBadge name="Ezio"    color="#f97316" glowColor="#fb923c" positionClass="top-[72%] left-[12%]"  delay={1.3} />
      <CursorBadge name="Chief"   color="#8b5cf6" glowColor="#c084fc" positionClass="top-[85%] left-[60%]"  delay={1.6} />
      {/* Main Container */}
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Header — letter-by-letter stagger reveal */}
        <div className="flex flex-col items-center justify-center text-center mb-20 sm:mb-28">
          <motion.div
            className="overflow-hidden flex items-end gap-[0.01em] perspective-[800px]"
            variants={headingContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ amount: 0.3 }}
          >
            {'Projects'.split('').map((char, i) => (
              <motion.span
                key={i}
                variants={letterVariant}
                style={{ display: 'inline-block', transformOrigin: 'bottom center' }}
                className="text-6xl sm:text-7xl lg:text-8xl font-black text-[#0a0a0c] tracking-tight font-sans select-none"
              >
                {char}
              </motion.span>
            ))}
          </motion.div>
          {/* Animated underline that sweeps in after letters */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            whileInView={{ scaleX: 1, opacity: 1 }}
            viewport={{ amount: 0.5 }}
            transition={{ duration: 0.7, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
            style={{ originX: 0 }}
            className="mt-3 h-[3px] w-32 bg-gradient-to-r from-[#b15382] to-transparent rounded-full"
          />
        </div>

        {/* Asymmetrical Staggered Project Cards Grid (emilianmisera.com style) */}
        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">

          {/* Left Column (Project 1 & Project 3) */}
          <div className="flex flex-col gap-16 lg:gap-24 w-full">
            {/* Project 1 Card */}
            <ProjectCard project={projectsData[0]} delay={0.1} />

            {/* Project 3 Card */}
            <ProjectCard project={projectsData[2]} delay={0.3} />
          </div>

          {/* Right Column (Project 2 - Offset down vertically for staggered layout) */}
          <div className="flex flex-col gap-16 lg:gap-24 w-full lg:pt-28">
            {/* Project 2 Card */}
            <ProjectCard project={projectsData[1]} delay={0.2} />
          </div>
        </div>
      </div>

      {/* Absolute Bottom Right Corner GitHub CreepyButton with Animated Black Arrow */}
      <div className="absolute bottom-6 right-6 sm:bottom-10 sm:right-12 z-40 flex items-center gap-3">
        {/* Animated Curved Black Arrow pointing towards GitHub button */}
        <motion.div
          animate={{ x: [-4, 4, -4], y: [-2, 2, -2] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          className="flex items-center gap-2 pointer-events-none select-none hidden sm:flex"
        >
          <span className="relative -top-3 inline-block font-mono text-xs font-bold tracking-tight text-slate-800 uppercase">
            Repos
          </span>
          <svg
            width="42"
            height="30"
            viewBox="0 0 42 30"
            fill="none"
            stroke="#0a0a0c"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="drop-shadow-sm"
          >
            {/* Smooth curved path pointing right towards the button */}
            <path d="M 3 6 Q 22 2 34 18" />
            <path d="M 24 18 L 34 18 L 34 8" />
          </svg>
        </motion.div>

        <CreepyButton
          onClick={() => window.open('https://github.com/naveendha1710', '_blank', 'noopener,noreferrer')}
          className="bg-black translate-y-3 shadow-none"
          coverClassName="bg-[#0a0a0c] text-white hover:bg-slate-900 border border-slate-800 shadow-none"
        >
          <span className="flex items-center gap-2 font-mono text-xs sm:text-sm font-bold tracking-wider">
            <GithubIcon className="w-4 h-4" />
            <span>GitHub</span>
          </span>
        </CreepyButton>
      </div>
    </section>
  );
});

// Single Project Card Component (Pure White Card matching emilianmisera.com)
const ProjectCard = memo(function ProjectCard({
  project,
  delay = 0
}: {
  project: Project;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 60, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ amount: 0.15 }}
      transition={{ duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex flex-col w-full"
    >
      {/* Small Label above Card — slides in from left */}
      <motion.span
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ amount: 0.5 }}
        transition={{ duration: 0.5, delay: delay + 0.15, ease: 'easeOut' }}
        className="font-mono text-xs sm:text-sm font-medium tracking-wide text-slate-400 mb-2.5 px-1 block"
      >
        {project.numberLabel}
      </motion.span>

      {/* Main White Card Container — Completely Rectangular (rounded-none) */}
      <motion.div
        whileHover={{ y: -6, boxShadow: '0 30px 70px rgba(0,0,0,0.13)' }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        className="relative w-full rounded-none bg-white border border-slate-200/70 p-5 sm:p-6 shadow-[0_15px_40px_rgba(0,0,0,0.06)] overflow-hidden"
      >
        {/* Top Image Box (Completely Rectangular) */}
        <div className={`relative w-full h-64 sm:h-72 rounded-none overflow-hidden ${project.placeholderBg} border border-black/5`}>
          {project.imageSrc ? (
            <img
              src={project.imageSrc}
              alt={project.title}
              className="w-full h-full object-cover object-top group-hover:scale-[1.03] transition-transform duration-500 ease-out select-none"
              loading="lazy"
            />
          ) : (
            <div className={`relative z-10 flex flex-col items-center justify-center text-center space-y-3 p-6 h-full ${project.placeholderTextColor}`}>
              <div className="w-16 h-16 rounded-none flex items-center justify-center bg-white/20 backdrop-blur-md shadow-sm border border-white/30">
                {project.id === "project-1" && <Layers className="w-8 h-8" />}
                {project.id === "project-2" && <Server className="w-8 h-8" />}
                {project.id === "project-3" && <Cpu className="w-8 h-8" />}
              </div>
              <span className="font-sans text-sm sm:text-base font-bold tracking-tight">
                {project.title}
              </span>
            </div>
          )}
        </div>

        {/* Content Section below image */}
        <div className="pt-5 flex flex-col justify-between flex-grow">
          <div>
            {/* Title & Subtitle */}
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0a0a0c] font-sans tracking-tight mb-1">
              {project.title}
            </h3>
            <p className="text-sm sm:text-base text-slate-500 font-sans mb-4">
              {project.subtitle}
            </p>

            {/* Bullets Description List */}
            <ul className="space-y-2 mb-6 text-slate-600 font-sans text-xs sm:text-sm leading-relaxed">
              {project.bullets.map((bullet, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 flex-shrink-0" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Bottom Action Bar: Tech Pills & External Link Icon */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
            {/* Tech Stack Tag Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {project.techStack.map((tech, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-none text-[11px] font-mono text-slate-600 bg-slate-50 border border-slate-200/80"
                >
                  {tech}
                </span>
              ))}
            </div>

            {/* External Link Outline Icon (rendered only if githubUrl exists) */}
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 w-9 h-9 rounded-none border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:border-slate-900 hover:bg-slate-50 transition-all cursor-pointer"
                title="Open Repository"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
});

export default ProjectsSection;
