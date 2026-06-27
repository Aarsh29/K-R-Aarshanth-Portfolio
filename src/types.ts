export interface ExperienceCard {
  role: string;
  organization: string;
  period: string;
  points: string[];
  color: string;
}

export interface SkillItem {
  name: string;
  level: number;
}

export interface SkillCategory {
  title: string;
  skills: SkillItem[];
  tools: string[];
}

export interface ProjectItem {
  icon: string;
  name: string;
  sub: string;
  desc: string;
  backDesc: string;
  tags: string[];
  githubUrl: string;
}

export interface TimelineItem {
  year: string;
  title: string;
  desc: string;
}
