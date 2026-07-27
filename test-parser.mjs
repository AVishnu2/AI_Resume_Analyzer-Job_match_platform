import { parseResumeFromText } from './services/resume-parser.ts';

const ATS_RESUME = `JOHN SMITH
john.smith@email.com | (555) 123-4567 | San Francisco, CA
linkedin.com/in/johnsmith | github.com/johnsmith

PROFESSIONAL SUMMARY
Senior Full Stack Engineer with 6+ years of experience building scalable web applications.

TECHNICAL SKILLS
Languages: JavaScript, TypeScript, Python, Java, SQL
Frameworks: React, Next.js, Node.js, Express, Django
Databases: PostgreSQL, MongoDB, Redis
Tools: Git, Docker, Kubernetes, Jenkins, Terraform
Cloud: AWS, GCP

EXPERIENCE

TechCorp Inc. | Senior Full Stack Engineer
Jan 2022 – Present | San Francisco, CA
- Led migration of monolithic application to microservices architecture
- Designed and implemented RESTful APIs handling 10M+ requests/day

StartupXYZ | Full Stack Developer
Mar 2019 – Dec 2021 | Remote
- Built real-time collaboration features using WebSockets and Redis pub/sub

EDUCATION

Master of Science in Computer Science
Stanford University | 2015 – 2017 | GPA: 3.8

Bachelor of Science in Software Engineering
University of California, Berkeley | 2011 – 2015

CERTIFICATIONS
- AWS Solutions Architect – Professional (2023)
- Google Cloud Professional Data Engineer (2022)

PROJECTS

CloudDeploy Platform – Automated deployment platform
Technologies: TypeScript, React, Node.js, AWS CDK, Terraform, Docker
- Built infrastructure-as-code templates supporting AWS, GCP, and Azure

ACHIEVEMENTS
- Winner, TechCorp Internal Hackathon 2023
- Speaker at ReactConf 2022

PUBLICATIONS
"Microservices Migration Patterns" – ACM Queue, Vol. 20, 2022

LANGUAGES
English (Native), Spanish (Professional Working)`;

const result = parseResumeFromText(ATS_RESUME);
console.log('Name:', result.personalInfo.name);
console.log('Email:', result.personalInfo.email);
console.log('Experience count:', result.experience.length);
console.log('Education count:', result.education.length);
console.log('Skills languages:', result.skills.languages.length);
console.log('Projects count:', result.projects.length);
console.log('Certifications:', result.certifications.length);
console.log('Languages known:', result.languagesKnown.length);

const checks = [
  result.personalInfo.name.includes('JOHN') || result.personalInfo.name.includes('John'),
  result.personalInfo.email.includes('john.smith'),
  result.experience.length >= 2,
  result.education.length >= 1,
  result.skills.languages.length >= 3,
  result.projects.length >= 1,
  result.certifications.length >= 1,
];

const passed = checks.filter(Boolean).length;
console.log(`\nParser score: ${passed}/${checks.length}`);
process.exit(passed >= 6 ? 0 : 1);
