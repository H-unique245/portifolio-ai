// Default data — overridden by Supabase when admin updates content

export const DEFAULT_SETTINGS = {
  open_to_work: true,
  available_for_freelance: true,
  looking_for: "Senior Full Stack Developer / Team Lead",
  hero_tagline: "Building scalable enterprise platforms with a team of 8.",
};

export const DEFAULT_PROJECTS = [
  {
    id: 1,
    type: "Health & Nutrition · Group Project",
    name: "Fitfinity",
    tagline: "Cronometer-style nutrition tracking app",
    details: "Comprehensive nutrition tracking platform providing everything users need to reach their health goals — calorie logging, macro tracking, and progress visualization.",
    tech: ["JavaScript", "React.js", "Node.js", "MongoDB", "Express.js"],
    color: "#4ade80",
    deploy: "https://fitfinity.vercel.app/",
    github: "https://github.com/furqan5921/evasive-stew-6265",
    featured: true,
  },
  {
    id: 2,
    type: "Food & Hospitality · Group Project",
    name: "KFC Clone",
    tagline: "Full-stack fast-food restaurant app",
    details: "Feature-rich KFC replica with menu browsing, cart management, and order flow. Implements real-world restaurant UX with a responsive Chakra UI design and Node.js backend.",
    tech: ["JavaScript", "React.js", "Node.js", "Chakra UI", "Express.js"],
    color: "#f97316",
    deploy: "https://axiomatic-trouble-8860-38bfe.web.app/",
    github: "https://github.com/H-unique245/axiomatic-trouble-8860",
    featured: true,
  },
  {
    id: 3,
    type: "EdTech / SaaS · Hackathon Project",
    name: "School Management System",
    tagline: "Built for the Masai Hackathon",
    details: "Competitive SaaS web application for education platforms — covers student management, timetables, and academic tracking. Built with Next.js for SSR performance.",
    tech: ["JavaScript", "React.js", "Next.js", "Chakra UI", "Node.js", "MongoDB"],
    color: "#63dcff",
    deploy: "https://hackathon-sms.vercel.app/",
    github: "https://github.com/H-unique245/MindInstallers",
    featured: true,
  },
  {
    id: 4,
    type: "Food & Discovery · Individual Project",
    name: "Kindmeal Clone",
    tagline: "Malaysian food & restaurant discovery platform",
    details: "Clone of Kindmeal, a Malaysian product-based platform for discovering food items and restaurants. Focus on clean UI with intuitive browsing and filtering experiences.",
    tech: ["JavaScript", "React.js", "Chakra UI"],
    color: "#facc15",
    deploy: "https://timely-crepe-c8bf70.netlify.app/",
    github: "https://github.com/H-unique245/Kindmeal-clone",
    featured: false,
  },
  {
    id: 5,
    type: "E-Commerce · Individual Project",
    name: "Ssense Clone",
    tagline: "Luxury fashion e-commerce app",
    details: "Full-featured e-commerce shopping app modeled on Ssense — supports browsing clothes and essentials across multiple categories with a polished, modern UI.",
    tech: ["HTML", "CSS", "JavaScript", "React.js", "Chakra UI"],
    color: "#b197fc",
    deploy: "https://ssense-clone-ten.vercel.app/",
    github: "https://github.com/H-unique245/ssense-clone",
    featured: false,
  },
];

export const SKILLS = [
  { label: "Frontend", items: ["React.js", "Next.js", "TypeScript", "JavaScript (ES6+)", "HTML5 / CSS3", "Redux Toolkit"] },
  { label: "Backend", items: ["Node.js", "Java Spring Boot", "LoopBack.js", "REST APIs", "Microservices"] },
  { label: "Databases", items: ["PostgreSQL", "MongoDB", "MySQL", "Redis"] },
  { label: "DevOps & Cloud", items: ["Docker", "Jenkins CI/CD", "AWS", "Nginx", "Linux"] },
  { label: "Auth & Security", items: ["Keycloak", "JWT", "OAuth2", "RBAC"] },
  { label: "Tools & Process", items: ["Git / GitHub", "Agile / Scrum", "Jira", "Postman", "Code Review"] },
];

export const EXPERIENCE = [
  {
    period: "Jan 2025 — Present",
    role: "Team Lead",
    company: "Alphaware · Pune, India",
    current: true,
    points: [
      "Leading a cross-functional team of 8 — frontend, backend, QA & DevOps engineers.",
      "Driving architecture decisions, sprint planning, and code quality across products.",
      "Mentoring junior developers and conducting regular code reviews.",
      "Coordinating with stakeholders to deliver CBS & HRMS modules on schedule.",
    ],
    tags: ["Team Leadership", "Architecture", "Agile/Scrum", "Mentoring"],
  },
  {
    period: "Apr 2023 — Dec 2024",
    role: "Full Stack Developer",
    company: "Alphaware · Pune, India",
    current: false,
    points: [
      "Built and deployed CBS Core Banking Solution across 20+ branches serving 10,000+ customers.",
      "Developed HRMS and LMS platforms from scratch using MERN + Next.js stack.",
      "Set up CI/CD pipelines with Jenkins and containerized apps using Docker.",
      "Implemented Keycloak-based SSO & RBAC for enterprise-grade authentication.",
    ],
    tags: ["React.js", "Next.js", "Node.js", "Java Spring Boot", "Docker", "Jenkins"],
  },
];
