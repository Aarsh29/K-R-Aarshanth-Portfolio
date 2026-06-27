import { ExperienceCard, SkillCategory, ProjectItem, TimelineItem } from "./types";

export const experiences: ExperienceCard[] = [
  {
    role: "Cybersecurity Intern (Red Teaming)",
    organization: "Cyart Tech LLP",
    period: "2026 – Present  ·  Gujarat, India (Remote - Offensive & Adversarial Simulation)",
    points: [
      "Simulating advanced persistent threat (APT) attack vectors, crafting custom payload delivery vectors, and analyzing defensive alert signatures.",
      "Developing automated high-speed web vulnerability scanner utilities to discover OWASP Top 10 exploits on external targets.",
      "Conducting active network and server penetration tests, using scanning pipelines to identify and exploit misconfigured credentials and exposures."
    ],
    color: "#FF3333"
  },
  {
    role: "Documentation Archivist (CSE Department)",
    organization: "Kalvium × AMET University",
    period: "2025 – 2026  ·  Chennai, India",
    points: [
      "Structured and indexed departmental archives, technical logs, academic records, and project assets.",
      "Established strict access controls, optimized documentation hierarchies, and coordinated secure file shares.",
      "Maintained transparency and structural integrity across university level cybersecurity department systems."
    ],
    color: "#00E5FF"
  }
];

export const skillCategories: SkillCategory[] = [
  {
    title: "Cybersecurity & Recon",
    skills: [
      { name: "Linux System Administration", level: 90 },
      { name: "Network Recon (Nmap, Wireshark)", level: 88 },
      { name: "Vulnerability Scanning", level: 85 },
      { name: "Authentication Security & Access Controls", level: 82 },
      { name: "OWASP Top 10 Web Security Auditing", level: 80 }
    ],
    tools: ["Linux", "Nmap", "Wireshark", "Bash Scripting", "Recon Workflows"]
  },
  {
    title: "Software & Core Programming",
    skills: [
      { name: "Web Development (HTML, CSS, JavaScript)", level: 90 },
      { name: "Database Engineering (MySQL, SQL)", level: 85 },
      { name: "Object-Oriented Programming (C++, Java)", level: 85 },
      { name: "Backend Architecture (Node.js, Express)", level: 80 }
    ],
    tools: ["HTML", "CSS", "JavaScript", "C++", "Java", "MySQL", "Git", "VS Code", "Python"]
  }
];

export const projects: ProjectItem[] = [
  {
    icon: "🤝",
    name: "Zero Hunger Connect",
    sub: "Smart Food Redistribution Ecosystem",
    desc: "A social impact platform connecting food donors, NGOs, and volunteers with live tracking and resource optimization.",
    backDesc: "Features live maps, real-time tracking, demand predictions, and secure backend workflows. Highly praised at hackathons.",
    tags: ["Node.js", "Express", "MySQL", "Google Maps API"],
    githubUrl: "https://github.com/Aarsh29"
  },
  {
    icon: "🛡️",
    name: "Phishing Email Detection Model v1",
    sub: "Phishing-Email-Detection-Model-v1",
    desc: "An intelligent security classifier analyzing email keywords, behavioral patterns, and header metadata to detect malicious lures.",
    backDesc: "Leverages natural language processing (NLP) to proactively filter phishing links and prevent social engineering threats.",
    tags: ["Python", "Machine Learning", "NLP", "AI Security"],
    githubUrl: "https://github.com/Aarsh29"
  },
  {
    icon: "🔍",
    name: "Vulnerability Scanner Mini Project V1",
    sub: "Vulnerability-Scanner-Mini-Project-V1",
    desc: "A custom web assessment utility checking targets for missing security headers, configurations, and injection possibilities.",
    backDesc: "Developed to automate first-pass security posture scans of web applications for easier risk prioritization.",
    tags: ["Python", "Requests", "Recon", "Offensive Tool"],
    githubUrl: "https://github.com/Aarsh29"
  },
  {
    icon: "🔑",
    name: "Secure Login System V1",
    sub: "Secure-Login-System-V1",
    desc: "A complete custom secure gatekeeper implementing modern password hashing, session tokens, and input validation.",
    backDesc: "Replaces weak authorization templates with hard credential safeguards, protecting against brute-force and token reuse.",
    tags: ["Auth", "Hashing", "Sessions", "Validation"],
    githubUrl: "https://github.com/Aarsh29"
  },
  {
    icon: "🔑",
    name: "Password Strength Checker v2",
    sub: "Password-Strength-Checker-version-2",
    desc: "A custom security tool built in JavaScript that evaluates password entropy, complexity, and common patterns to prevent weak credential vulnerabilities.",
    backDesc: "Features active client-side entropy scanning, real-time visual alerts, password length/character verification to guard against brute-force attacks.",
    tags: ["JavaScript", "Regex", "Security tool", "Client-Side"],
    githubUrl: "https://github.com/Aarsh29"
  },
  {
    icon: "💻",
    name: "LapSparks",
    sub: "Premium Laptop Marketplace",
    desc: "One of my earliest major frontend eCommerce systems, featuring product categories, custom state carts, and responsive checkouts.",
    backDesc: "Built from scratch to master fluid responsiveness, intuitive user navigation, and complex UI state handling.",
    tags: ["HTML", "CSS", "JavaScript", "eCommerce"],
    githubUrl: "https://github.com/Aarsh29"
  }
];

export const timelineItems: TimelineItem[] = [
  {
    year: "2024",
    title: "Started Cybersecurity CSE",
    desc: "Stepped into computer science and cybersecurity engineering at Kalvium × AMET University, building deep programming and systems foundations."
  },
  {
    year: "2024",
    title: "First Real Software Projects",
    desc: "Bridged theory with practical application, designing LapSparks and multiple responsive web experiences to master application logic."
  },
  {
    year: "2025",
    title: "Entering Cybersecurity & Labs",
    desc: "Dived into offensive & defensive security. Set up Linux research labs, practicing Wireshark network tracing, and vulnerability enumeration."
  },
  {
    year: "2025",
    title: "VIT Makathon & Zero Hunger Connect",
    desc: "Secured 12th place at VIT Makathon. Later created Zero Hunger Connect at KCG College Hackathon, bridging code with positive human impact."
  },
  {
    year: "2026",
    title: "Real Systems, Real Security",
    desc: "Joined Cyart Tech LLP as a Cybersecurity Intern (Red Teaming), designing custom vulnerability scanners, secure credential systems, and AI-driven phishing detection models. Merging Red Teaming, AI, and Software Engineering."
  }
];
