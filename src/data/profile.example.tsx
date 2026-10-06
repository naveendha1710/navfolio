import React from 'react';
import project1Img from '../assets/projects_image/project_1.webp';
import project2Img from '../assets/projects_image/project_2.webp';
import project3Img from '../assets/projects_image/project_3.webp';

export interface SocialLink {
  label: string;
  url: string;
  username: string;
}

export interface ProfileData {
  personalInfo: {
    name: string;
    shortName: string;
    nickname: string;
    title: string;
    description: string;
    email: string;
    resumeDownloadName: string;
    resumeUrl: string;
  };
  socialLinks: {
    github: SocialLink;
    linkedin: SocialLink;
    instagram: SocialLink;
    discord: {
      label: string;
      username: string;
    };
  };
}

export const profile: ProfileData = {
  personalInfo: {
    name: "Alex Rivera",
    shortName: "Alex",
    nickname: "Alex",
    title: "Full Stack & AI Engineer",
    description: "Portfolio of Alex Rivera — Full Stack Developer & AI Engineer.",
    email: "alex.rivera@example.com",
    resumeDownloadName: "Resume.pdf",
    resumeUrl: "/resume.pdf",
  },
  socialLinks: {
    github: {
      label: "GitHub / your-github",
      url: "https://github.com/your-github",
      username: "your-github",
    },
    linkedin: {
      label: "LinkedIn / your-linkedin",
      url: "https://www.linkedin.com/in/your-linkedin/",
      username: "your-linkedin",
    },
    instagram: {
      label: "Instagram / @your-instagram",
      url: "https://www.instagram.com/your-instagram",
      username: "@your-instagram",
    },
    discord: {
      label: "Discord: your_handle",
      username: "your_handle",
    },
  },
};

export const sampleBookPages = [
  {
    pageNumber: 1,
    title: "The Beginning",
    content: (
      <div className="space-y-3 pt-1 text-neutral-800 font-serif leading-relaxed text-xs sm:text-sm select-none">
        <p>
          This is where your journey begins. Describe the spark that made you passionate about software and engineering.
        </p>
        <p>
          Write about your first coding projects, challenges you faced, and how your curiosity drove you to learn more.
        </p>
      </div>
    ),
    backContent: (
      <div className="space-y-3 pt-1 text-neutral-800 font-serif leading-relaxed text-xs sm:text-sm select-none">
        <h3 className="text-lg font-medium text-center mb-4 text-neutral-900 tracking-tight font-serif">
          The Challenge
        </h3>
        <p>
          Explain the hurdles you navigated and what pushed you to master modern development tools and architectures.
        </p>
      </div>
    ),
  },
  {
    pageNumber: 2,
    title: "Deep Dive",
    content: (
      <div className="space-y-3 pt-1 text-neutral-800 font-serif leading-relaxed text-xs sm:text-sm select-none">
        <p>
          Describe your favorite stack, areas of expertise, and how you approach system design and optimization.
        </p>
      </div>
    ),
    backContent: (
      <div className="space-y-3 pt-1 text-neutral-800 font-serif leading-relaxed text-xs sm:text-sm select-none">
        <h3 className="text-lg font-medium text-center mb-4 text-neutral-900 tracking-tight font-serif">
          The Vision
        </h3>
        <p>
          Share your future goals, projects you are eager to build, and technologies you are exploring next.
        </p>
      </div>
    ),
  },
];

export interface ProjectItem {
  id: string;
  numberLabel: string;
  title: string;
  subtitle: string;
  techStack: string[];
  bullets: string[];
  placeholderBg: string;
  placeholderTextColor: string;
  imageSrc: string;
  githubUrl?: string;
}

export const projectsData: ProjectItem[] = [
  {
    id: "project-1",
    numberLabel: "Project 1",
    title: "Example Project One",
    subtitle: "Full Stack Web Application",
    techStack: ["React.js", "Node.js", "TypeScript", "Tailwind CSS"],
    bullets: [
      "Built a high-performance web application with real-time responsive updates",
      "Designed clean modular interfaces and optimized state management",
    ],
    placeholderBg: "bg-[#f3efea]",
    placeholderTextColor: "text-amber-900/70",
    imageSrc: project1Img,
    githubUrl: "https://github.com/your-github/project-one",
  },
  {
    id: "project-2",
    numberLabel: "Project 2",
    title: "Example Project Two",
    subtitle: "AI & Backend Service",
    techStack: ["Python", "FastAPI", "Redis", "Docker"],
    bullets: [
      "Engineered microservices with efficient caching and message queues",
      "Wrote comprehensive unit and integration tests with continuous deployment",
    ],
    placeholderBg: "bg-[#2b41f7]",
    placeholderTextColor: "text-white",
    imageSrc: project2Img,
    githubUrl: "https://github.com/your-github/project-two",
  },
  {
    id: "project-3",
    numberLabel: "Project 3",
    title: "Example Project Three",
    subtitle: "Developer Tool & CLI",
    techStack: ["TypeScript", "Vite", "Node.js"],
    bullets: [
      "Created an open-source CLI toolkit to streamline local developer setup",
      "Published npm package with zero external runtime dependencies",
    ],
    placeholderBg: "bg-[#f1f1f3]",
    placeholderTextColor: "text-slate-800",
    imageSrc: project3Img,
    githubUrl: "https://github.com/your-github/project-three",
  },
];

export interface FaqItemData {
  question: string;
  answer: React.ReactNode;
}

export const faqItemsData: FaqItemData[] = [
  {
    question: "Education & Qualifications",
    answer: (
      <div className="space-y-1.5 font-sans">
        <h4 className="font-bold text-slate-900 text-base sm:text-lg">
          B.S. in Computer Science
        </h4>
        <p className="text-slate-600 text-sm">
          University of Technology
        </p>
        <div className="text-xs font-mono text-slate-500 mt-1">
          2022 – 2026
        </div>
      </div>
    ),
  },
  {
    question: "Software Engineer Intern",
    answer: (
      <div className="space-y-2 font-sans text-sm sm:text-base leading-relaxed text-slate-700">
        <div className="text-xs font-mono text-slate-500 mb-2">2025 – 2026</div>
        <ul className="space-y-1.5 list-disc pl-4">
          <li>
            Contributed to production web applications and improved pipeline efficiency.
          </li>
        </ul>
      </div>
    ),
  },
];
