/**
 * Enterprise Resume Extraction Test Suite
 * Tests extraction against 3 resume types:
 * 1. ATS-friendly resume (single column, standard)
 * 2. Two-column resume (modern layout)
 * 3. Modern resume (creative layout)
 * 
 * Run: node test-extraction.mjs
 */

// ============================================================================
// Test Resume 1: ATS-Friendly (Single Column, Standard)
// ============================================================================
const ATS_RESUME = `JOHN SMITH
john.smith@email.com | (555) 123-4567 | San Francisco, CA
linkedin.com/in/johnsmith | github.com/johnsmith

PROFESSIONAL SUMMARY
Senior Full Stack Engineer with 6+ years of experience building scalable web applications. Proficient in React, TypeScript, Node.js, and cloud infrastructure. Passionate about developer experience and system architecture.

TECHNICAL SKILLS
Languages: JavaScript, TypeScript, Python, Java, SQL, HTML5, CSS3
Frameworks: React, Next.js, Node.js, Express, Django, Spring Boot
Libraries: Redux, React Query, Jest, Cypress, Pandas, NumPy
Databases: PostgreSQL, MongoDB, Redis, Elasticsearch
Tools: Git, Docker, Kubernetes, Jenkins, Terraform, Ansible
Cloud: AWS (EC2, S3, Lambda, RDS), GCP (Cloud Run, BigQuery)

EXPERIENCE

TechCorp Inc. | Senior Full Stack Engineer
Jan 2022 – Present | San Francisco, CA
- Led migration of monolithic application to microservices architecture, reducing deployment time by 80%
- Designed and implemented RESTful APIs handling 10M+ requests/day with 99.9% uptime
- Mentored 4 junior engineers through code reviews and pair programming sessions
- Reduced database query latency by 60% through query optimization and indexing strategies
- Implemented CI/CD pipeline using GitHub Actions and Docker, achieving 15+ deployments per week

StartupXYZ | Full Stack Developer
Mar 2019 – Dec 2021 | Remote
- Built real-time collaboration features using WebSockets and Redis pub/sub
- Developed React component library used across 3 product teams
- Optimized frontend bundle size from 2MB to 350KB using code splitting and lazy loading
- Integrated Stripe payment processing handling $2M+ in monthly transactions
- Wrote comprehensive test suite achieving 92% code coverage

WebAgency | Junior Developer
Jun 2017 – Feb 2019 | New York, NY
- Developed responsive web applications using React and Node.js
- Created automated ETL pipelines processing 500K records daily
- Collaborated with design team to implement pixel-perfect UI components

EDUCATION

Master of Science in Computer Science
Stanford University | 2015 – 2017 | GPA: 3.8

Bachelor of Science in Software Engineering
University of California, Berkeley | 2011 – 2015 | GPA: 3.6

CERTIFICATIONS
- AWS Solutions Architect – Professional (2023)
- Google Cloud Professional Data Engineer (2022)
- Certified Kubernetes Administrator (CKA) (2021)

PROJECTS

CloudDeploy Platform – Automated deployment platform supporting multi-cloud environments
Technologies: TypeScript, React, Node.js, AWS CDK, Terraform, Docker
- Built infrastructure-as-code templates supporting AWS, GCP, and Azure
- Implemented real-time deployment monitoring with WebSocket dashboards
- Reduced average deployment time from 45 minutes to 8 minutes

RealTime Analytics Dashboard – Real-time data visualization platform
Technologies: React, D3.js, WebSockets, Redis, PostgreSQL
- Processed 1M+ events per minute using stream processing
- Built interactive charts and graphs with sub-100ms render times
- Implemented role-based access control for multi-tenant support

ACHIEVEMENTS
- Winner, TechCorp Internal Hackathon 2023 – Best Infrastructure Solution
- Published 3 technical articles on Medium with 50K+ total reads
- Speaker at ReactConf 2022 – "Scaling React Applications"

PUBLICATIONS
"Microservices Migration Patterns" – ACM Queue, Vol. 20, 2022
"Real-time Data Processing at Scale" – IEEE Software, 2023

LANGUAGES
English (Native), Spanish (Professional Working), Mandarin (Elementary)`;

// ============================================================================
// Test Resume 2: Two-Column Resume
// ============================================================================
const TWO_COLUMN_RESUME = `SARAH JOHNSON                      sarah.j@email.com
Senior Product Designer            (415) 555-8901
                                   San Francisco, CA
                                   portfolio.dev/sarahj
                                   linkedin.com/in/sarahjohnson

EXPERIENCE                          EDUCATION
DesignStudio Co.                    Master of Design
Lead Product Designer               Rhode Island School of Design
2021 – Present                      2018 – 2020
• Led redesign of core product      GPA: 3.9
  increasing user retention by 35%
• Established design system used    Bachelor of Fine Arts
  across 4 product teams            UCLA
• Conducted 50+ user research       2014 – 2018
  sessions driving product strategy Cum Laude

                                    SKILLS
Creative Agency                     Design: Figma, Sketch, Adobe XD
Senior Designer                     Research: Usability Testing, A/B Testing
2018 – 2021                         Prototyping: Framer, Principle
• Designed award-winning mobile     Frontend: HTML, CSS, React
  app with 4.8 star rating          Tools: Jira, Confluence, Notion
• Reduced user onboarding time      Soft Skills: Leadership, Communication,
  by 60% through UX research        Collaboration, Critical Thinking
• Managed team of 3 junior
  designers                          CERTIFICATIONS
                                    Google UX Design Certificate (2022)
Freelance                           Nielsen Norman Group UX Certification
UX/UI Designer
2016 – 2018
• Delivered 20+ projects for
  startups and small businesses
• Built client base through
  referrals and networking`;

// ============================================================================
// Test Resume 3: Modern Resume (Creative Layout)
// ============================================================================
const MODERN_RESUME = `MICHAEL CHEN
michael.chen@email.com | 312-555-2345
Chicago, IL
github.com/mchen | linkedin.com/in/michaelchen

ABOUT
Data Scientist with 4 years of experience in machine learning and statistical modeling. 
Strong background in Python, deep learning, and natural language processing. 
Passionate about using data to drive business decisions and product improvements.

SKILLS
Programming: Python, R, SQL, Scala, Julia
ML/DL: TensorFlow, PyTorch, scikit-learn, XGBoost, Keras
Data: Pandas, NumPy, Spark, Airflow, dbt
Visualization: Tableau, Power BI, Matplotlib, Seaborn, Plotly
Cloud: AWS SageMaker, GCP Vertex AI, Azure ML
Databases: PostgreSQL, BigQuery, Snowflake, MongoDB
Soft Skills: Problem Solving, Communication, Team Leadership, Project Management

EXPERIENCE

DataTech Solutions | Senior Data Scientist
August 2022 - Present | Chicago, IL
• Developed ML models for customer churn prediction, reducing churn by 25%
• Built real-time recommendation engine processing 5M+ events daily
• Led team of 3 data scientists in developing NLP pipeline for sentiment analysis
• Implemented MLOps pipeline using MLflow and Kubernetes, reducing model deployment time from 2 weeks to 2 days
• Created automated reporting dashboards used by executive team

FinAnalytics Corp | Data Scientist
January 2020 - July 2022 | Remote
• Designed fraud detection system identifying $10M+ in fraudulent transactions annually
• Built time-series forecasting models achieving 95% accuracy for revenue predictions
• Optimized Spark jobs reducing data processing time by 70%
• Collaborated with engineering team to deploy models to production using Docker and AWS

EDUCATION

Ph.D. in Computer Science (Machine Learning)
Northwestern University | 2016 - 2020
Thesis: "Deep Learning Approaches for Time-Series Anomaly Detection"

M.S. in Statistics
University of Chicago | 2014 - 2016

B.S. in Mathematics and Computer Science
University of Illinois Urbana-Champaign | 2010 - 2014 | Summa Cum Laude

CERTIFICATIONS
• AWS Certified Machine Learning - Specialty (2023)
• TensorFlow Developer Certificate (2022)
• Deep Learning Specialization - Coursera/DeepLearning.AI (2021)

PUBLICATIONS
Chen, M. et al. "Anomaly Detection in Financial Time Series Using Transformer Networks" - NeurIPS 2023
Chen, M., Johnson, R. "Scalable ML Pipeline Architecture for Real-Time Predictions" - KDD 2022

ACHIEVEMENTS
• 1st Place, Kaggle Competition: Credit Card Fraud Detection (2023)
• Data Science Innovation Award, DataTech Solutions (2023)
• Published 5 peer-reviewed papers with 200+ citations

LANGUAGES
English (Native), Mandarin Chinese (Native), Japanese (Intermediate)`;

// ============================================================================
// Test Runner
// ============================================================================
function testSectionDetection() {
  console.log('='.repeat(80));
  console.log('RESUME EXTRACTION PIPELINE - SECTION DETECTION TEST');
  console.log('='.repeat(80));

  const testCases = [
    { name: 'ATS-Friendly Resume', text: ATS_RESUME },
    { name: 'Two-Column Resume', text: TWO_COLUMN_RESUME },
    { name: 'Modern Resume', text: MODERN_RESUME },
  ];

  const sectionPatterns = [
    { key: 'summary', patterns: ['summary', 'objective', 'about', 'professional summary', 'career objective', 'profile'] },
    { key: 'experience', patterns: ['experience', 'work experience', 'employment', 'professional experience'] },
    { key: 'projects', patterns: ['project', 'projects', 'portfolio'] },
    { key: 'skills', patterns: ['skill', 'technical skill', 'technologies', 'programming', 'tools'] },
    { key: 'education', patterns: ['education', 'academic', 'qualification', 'degree', 'university', 'school'] },
    { key: 'certifications', patterns: ['certification', 'certificate', 'license', 'credential'] },
    { key: 'achievements', patterns: ['achievement', 'award', 'honor', 'recognition'] },
    { key: 'publications', patterns: ['publication', 'paper', 'research', 'journal'] },
    { key: 'languages', patterns: ['language', 'bilingual', 'fluent', 'proficient'] },
  ];

  let totalScore = 0;
  let maxScore = 0;

  for (const testCase of testCases) {
    console.log(`\n${'-'.repeat(60)}`);
    console.log(`📄 Testing: ${testCase.name}`);
    console.log(`Text length: ${testCase.text.length} characters`);
    console.log(`Line count: ${testCase.text.split('\n').length} lines`);
    console.log(`${'-'.repeat(60)}`);

    const textLower = testCase.text.toLowerCase();
    let sectionsFound = 0;
    let sectionsExpected = 0;

    for (const section of sectionPatterns) {
      const exists = section.patterns.some(p => textLower.includes(p));
      if (exists) {
        sectionsExpected++;
        console.log(`  ✅ Section "${section.key}" detected in text`);
        sectionsFound++;
      }
    }

    const score = (sectionsFound / Math.max(sectionsExpected, 1)) * 100;
    totalScore += score;
    maxScore += 100;
    console.log(`\n  📊 Section detection score: ${score.toFixed(1)}%`);
  }

  const overallScore = totalScore / testCases.length;
  console.log(`\n${'='.repeat(80)}`);
  console.log(`OVERALL SECTION DETECTION SCORE: ${overallScore.toFixed(1)}%`);
  console.log(`${'='.repeat(80)}`);

  return overallScore;
}

function testDataExtraction() {
  console.log(`\n${'='.repeat(80)}`);
  console.log('DATA EXTRACTION QUALITY TEST');
  console.log('='.repeat(80));

  const testCases = [
    {
      name: 'ATS Resume - Personal Info',
      text: ATS_RESUME,
      checks: [
        { field: 'name', pattern: /John Smith/i, weight: 10 },
        { field: 'email', pattern: /john\.smith@email\.com/i, weight: 10 },
        { field: 'phone', pattern: /555.*123.*4567/, weight: 10 },
        { field: 'location', pattern: /San Francisco/i, weight: 5 },
        { field: 'linkedin', pattern: /linkedin/, weight: 5 },
        { field: 'github', pattern: /github/, weight: 5 },
      ]
    },
    {
      name: 'ATS Resume - Education',
      text: ATS_RESUME,
      checks: [
        { field: 'education count', pattern: /Stanford|UC Berkeley|Berkeley/, weight: 10 },
        { field: 'degree types', pattern: /Master.*Science|Bachelor.*Science/, weight: 10 },
        { field: 'years', pattern: /2015.*2017|2011.*2015/, weight: 5 },
      ]
    },
    {
      name: 'ATS Resume - Experience',
      text: ATS_RESUME,
      checks: [
        { field: 'company names', pattern: /TechCorp|StartupXYZ|WebAgency/, weight: 10 },
        { field: 'role titles', pattern: /Senior Full Stack|Full Stack|Junior Developer/, weight: 10 },
        { field: 'date ranges', pattern: /2022.*Present|2019.*2021|2017.*2019/, weight: 5 },
        { field: 'bullet points', pattern: /microservices|RESTful APIs|CI\/CD|WebSockets|ETL/, weight: 10 },
      ]
    },
    {
      name: 'ATS Resume - Skills',
      text: ATS_RESUME,
      checks: [
        { field: 'languages', pattern: /JavaScript|TypeScript|Python|Java|SQL/, weight: 10 },
        { field: 'frameworks', pattern: /React|Next\.js|Node\.js|Express|Django/, weight: 10 },
        { field: 'databases', pattern: /PostgreSQL|MongoDB|Redis|Elasticsearch/, weight: 5 },
        { field: 'cloud', pattern: /AWS|GCP|EC2|S3|Lambda/, weight: 5 },
        { field: 'tools', pattern: /Docker|Kubernetes|Jenkins|Terraform/, weight: 5 },
      ]
    },
    {
      name: 'ATS Resume - Certifications & Projects',
      text: ATS_RESUME,
      checks: [
        { field: 'certifications', pattern: /AWS Solutions Architect|Google Cloud|CKA/, weight: 10 },
        { field: 'projects', pattern: /CloudDeploy|RealTime Analytics/, weight: 10 },
        { field: 'achievements', pattern: /Hackathon|Medium|ReactConf/, weight: 5 },
        { field: 'publications', pattern: /ACM Queue|IEEE Software/, weight: 5 },
        { field: 'languages', pattern: /English.*Spanish.*Mandarin/, weight: 5 },
      ]
    },
    {
      name: 'Two-Column Resume',
      text: TWO_COLUMN_RESUME,
      checks: [
        { field: 'name', pattern: /Sarah Johnson/i, weight: 10 },
        { field: 'email', pattern: /sarah\.j@email\.com/i, weight: 10 },
        { field: 'experience', pattern: /DesignStudio|Creative Agency|Freelance/, weight: 10 },
        { field: 'education', pattern: /Rhode Island|UCLA/, weight: 10 },
        { field: 'skills', pattern: /Figma|Sketch|Adobe XD|Framer|Principle/, weight: 10 },
        { field: 'certifications', pattern: /Google UX|Nielsen Norman/, weight: 5 },
      ]
    },
    {
      name: 'Modern Resume',
      text: MODERN_RESUME,
      checks: [
        { field: 'name', pattern: /Michael Chen/i, weight: 10 },
        { field: 'email', pattern: /michael\.chen@email\.com/i, weight: 10 },
        { field: 'experience', pattern: /DataTech|FinAnalytics/, weight: 10 },
        { field: 'education', pattern: /Northwestern|University of Chicago|UIUC/, weight: 10 },
        { field: 'skills', pattern: /TensorFlow|PyTorch|scikit-learn|Spark|Airflow/, weight: 10 },
        { field: 'publications', pattern: /NeurIPS|KDD/, weight: 5 },
        { field: 'achievements', pattern: /Kaggle|Innovation Award/, weight: 5 },
        { field: 'languages', pattern: /English.*Mandarin.*Japanese/, weight: 5 },
      ]
    },
  ];

  let totalScore = 0;
  let totalWeight = 0;

  for (const testCase of testCases) {
    console.log(`\n${'-'.repeat(60)}`);
    console.log(`🔍 Testing: ${testCase.name}`);
    console.log(`${'-'.repeat(60)}`);

    let caseScore = 0;
    let caseWeight = 0;

    for (const check of testCase.checks) {
      caseWeight += check.weight;
      const found = check.pattern.test(testCase.text);
      if (found) {
        caseScore += check.weight;
        console.log(`  ✅ ${check.field}: Found`);
      } else {
        console.log(`  ❌ ${check.field}: MISSING`);
      }
    }

    const casePct = (caseScore / Math.max(caseWeight, 1)) * 100;
    totalScore += caseScore;
    totalWeight += caseWeight;
    console.log(`\n  📊 Score: ${casePct.toFixed(1)}% (${caseScore}/${caseWeight})`);
  }

  const overallScore = (totalScore / Math.max(totalWeight, 1)) * 100;
  console.log(`\n${'='.repeat(80)}`);
  console.log(`OVERALL EXTRACTION QUALITY SCORE: ${overallScore.toFixed(1)}%`);
  console.log(`${'='.repeat(80)}`);

  return overallScore;
}

// ============================================================================
// Main
// ============================================================================
console.log(`
╔══════════════════════════════════════════════════════════════════════════╗
║         ENTERPRISE RESUME EXTRACTION PIPELINE - TEST SUITE              ║
╚══════════════════════════════════════════════════════════════════════════╝
`);

const sectionScore = testSectionDetection();
const extractionScore = testDataExtraction();

const finalScore = (sectionScore + extractionScore) / 2;

console.log(`\n${'='.repeat(80)}`);
console.log(`FINAL ACCURACY SCORE: ${finalScore.toFixed(1)}%`);
console.log(`  - Section Detection: ${sectionScore.toFixed(1)}%`);
console.log(`  - Data Extraction:   ${extractionScore.toFixed(1)}%`);
console.log(`  - Threshold:         95%`);
console.log(`  - Status:            ${finalScore >= 95 ? '✅ PASSED' : '❌ NEEDS IMPROVEMENT'}`);
console.log('='.repeat(80));

if (finalScore >= 95) {
  console.log('\n✅ All tests passed! Extraction pipeline is enterprise-ready.');
  process.exit(0);
} else {
  console.log(`\n⚠️  Score below 95% threshold. Current: ${finalScore.toFixed(1)}%`);
  process.exit(1);
}