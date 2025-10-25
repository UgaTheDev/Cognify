export interface CareerPath {
  id: string
  name: string
  description: string
  icon: string
  requiredSkills: string[]
  recommendedCourses: string[]
  salaryRange: string
}

export const CAREER_PATHS: CareerPath[] = [
  {
    id: 'ml-engineer',
    name: 'Machine Learning Engineer',
    description: 'Design and implement machine learning models and AI systems',
    icon: '🤖',
    requiredSkills: ['Python', 'Machine Learning', 'Data Structures', 'Algorithms', 'Statistics', 'Neural Networks'],
    recommendedCourses: ['CS 111', 'CS 112', 'CS 330', 'CS 540', 'CS 545', 'CS 585'],
    salaryRange: '$120k - $180k'
  },
  {
    id: 'software-engineer',
    name: 'Software Engineer',
    description: 'Build and maintain software applications and systems',
    icon: '��',
    requiredSkills: ['Programming', 'Data Structures', 'Algorithms', 'System Design', 'Databases', 'Testing'],
    recommendedCourses: ['CS 111', 'CS 112', 'CS 210', 'CS 330', 'CS 410', 'CS 552', 'CS 560'],
    salaryRange: '$100k - $160k'
  },
  {
    id: 'data-scientist',
    name: 'Data Scientist',
    description: 'Analyze complex data to drive business decisions',
    icon: '📊',
    requiredSkills: ['Python', 'Statistics', 'Machine Learning', 'Data Visualization', 'SQL', 'Communication'],
    recommendedCourses: ['CS 111', 'CS 112', 'CS 330', 'CS 540', 'CS 560', 'CS 585'],
    salaryRange: '$110k - $170k'
  },
  {
    id: 'cybersecurity',
    name: 'Cybersecurity Engineer',
    description: 'Protect systems and networks from security threats',
    icon: '🔒',
    requiredSkills: ['Networking', 'Cryptography', 'Security Protocols', 'System Architecture', 'Risk Analysis'],
    recommendedCourses: ['CS 111', 'CS 112', 'CS 210', 'CS 330', 'CS 538', 'CS 552', 'CS 555'],
    salaryRange: '$105k - $165k'
  },
  {
    id: 'full-stack',
    name: 'Full-Stack Developer',
    description: 'Build complete web applications from frontend to backend',
    icon: '🌐',
    requiredSkills: ['JavaScript', 'Python', 'Databases', 'APIs', 'Frontend Frameworks', 'Backend Systems'],
    recommendedCourses: ['CS 111', 'CS 112', 'CS 210', 'CS 320', 'CS 410', 'CS 560'],
    salaryRange: '$95k - $150k'
  },
  {
    id: 'systems-architect',
    name: 'Systems Architect',
    description: 'Design large-scale distributed systems and infrastructure',
    icon: '🏗️',
    requiredSkills: ['System Design', 'Distributed Systems', 'Networking', 'Databases', 'Performance', 'Scalability'],
    recommendedCourses: ['CS 111', 'CS 112', 'CS 210', 'CS 330', 'CS 420', 'CS 450', 'CS 552', 'CS 555'],
    salaryRange: '$130k - $200k'
  },
  {
    id: 'ai-researcher',
    name: 'AI Researcher',
    description: 'Conduct research in artificial intelligence and deep learning',
    icon: '🧠',
    requiredSkills: ['Mathematics', 'Machine Learning', 'Deep Learning', 'Research', 'Python', 'Theory'],
    recommendedCourses: ['CS 111', 'CS 112', 'CS 330', 'CS 332', 'CS 540', 'CS 545', 'CS 585'],
    salaryRange: '$140k - $220k'
  },
  {
    id: 'game-developer',
    name: 'Game Developer',
    description: 'Create interactive games and entertainment software',
    icon: '🎮',
    requiredSkills: ['C++', 'Graphics', 'Physics', 'Game Engines', '3D Math', 'Optimization'],
    recommendedCourses: ['CS 111', 'CS 112', 'CS 210', 'CS 330', 'CS 450', 'CS 480'],
    salaryRange: '$85k - $140k'
  }
]

export const COURSE_SKILLS: Record<string, string[]> = {
  'CS 111': ['Python', 'Programming Fundamentals', 'Problem Solving'],
  'CS 112': ['Data Structures', 'Algorithms', 'Object-Oriented Programming'],
  'CS 210': ['Computer Systems', 'Assembly', 'C Programming', 'Memory Management'],
  'CS 330': ['Algorithm Analysis', 'Complexity', 'Dynamic Programming', 'Graph Algorithms'],
  'CS 332': ['Computational Theory', 'Formal Languages', 'Automata'],
  'CS 410': ['Software Engineering', 'System Design', 'Testing', 'DevOps'],
  'CS 420': ['Parallel Computing', 'Concurrency', 'Performance Optimization'],
  'CS 450': ['Computer Architecture', 'Hardware Design', 'Pipeline Processing'],
  'CS 480': ['Computer Graphics', '3D Rendering', 'Animation', 'OpenGL'],
  'CS 520': ['Programming Language Theory', 'Compilers', 'Language Design'],
  'CS 525': ['Compiler Design', 'Code Optimization', 'Parser Theory'],
  'CS 530': ['Advanced Algorithms', 'Approximation Algorithms', 'Randomized Algorithms'],
  'CS 535': ['Complexity Theory', 'NP-Completeness', 'Computational Hardness'],
  'CS 538': ['Cryptography', 'Security', 'Encryption', 'Protocols'],
  'CS 540': ['Artificial Intelligence', 'Machine Learning', 'Search Algorithms', 'Neural Networks'],
  'CS 545': ['Natural Language Processing', 'Text Analysis', 'Language Models', 'Deep Learning'],
  'CS 552': ['Operating Systems', 'Process Management', 'File Systems', 'Virtualization'],
  'CS 555': ['Computer Networks', 'TCP/IP', 'Network Security', 'Protocols'],
  'CS 560': ['Databases', 'SQL', 'Query Optimization', 'Transactions'],
  'CS 585': ['Computer Vision', 'Image Processing', 'Pattern Recognition', 'Deep Learning']
}
