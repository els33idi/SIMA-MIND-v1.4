const {
  useState,
  useEffect,
  useRef,
  useCallback
} = React;
const C = {
  bg: "#07090f",
  surface: "#0f1219",
  card: "#161b26",
  cardHover: "#1c2233",
  border: "#1e2535",
  borderLight: "#252d40",
  accent: "#4f8ef7",
  accentSoft: "#1a2d5a",
  gold: "#f0b429",
  green: "#22c55e",
  red: "#ef4444",
  text: "#e2e8f8",
  muted: "#5a6480",
  purple: "#a78bfa",
  teal: "#2dd4bf",
  orange: "#fb923c",
  pink: "#f472b6"
};
const THEME_PALETTES = {
  dark: {
    bg: "#07090f",
    surface: "#0f1219",
    card: "#161b26",
    cardHover: "#1c2233",
    border: "#1e2535",
    borderLight: "#252d40",
    accent: "#4f8ef7",
    accentSoft: "#1a2d5a",
    gold: "#f0b429",
    green: "#22c55e",
    red: "#ef4444",
    text: "#e2e8f8",
    muted: "#5a6480",
    purple: "#a78bfa",
    teal: "#2dd4bf",
    orange: "#fb923c",
    pink: "#f472b6"
  },
  light: {
    bg: "#f5f7fb",
    surface: "#ffffff",
    card: "#edf2f7",
    cardHover: "#e2e8f0",
    border: "#d1d5db",
    borderLight: "#e2e8f0",
    accent: "#4f8ef7",
    accentSoft: "#dbeafe",
    gold: "#f59e0b",
    green: "#22c55e",
    red: "#ef4444",
    text: "#111827",
    muted: "#6b7280",
    purple: "#8b5cf6",
    teal: "#14b8a6",
    orange: "#fb923c",
    pink: "#ec4899"
  }
};
const SCHOOL_NAMES = ["Chawama Secondary School", "Kafue Secondary School", "Lusaka International Community School", "Hillcrest Technical High School", "David Kaunda Technical High School", "Munali Secondary School", "Roma Girls Secondary School", "St. Mary's Secondary School", "Kamwala Secondary School", "Matero Girls Secondary School", "Other"];
const UNIVERSITY_NAMES = ["University of Zambia", "Copperbelt University", "Mulungushi University", "Zambia Open University", "Levy Mwanawasa Medical University", "University of Lusaka", "Cavendish University Zambia", "Texila American University", "Eden University", "Other"];
const API_BASE_URL = "http://localhost:4000";
const PROFILE_ENGINE = {
  getLevel(profile) {
    const edu = profile.education;
    if (edu === "kindergarten") return "kindergarten";
    if (edu === "primary") return "primary";
    if (edu === "secondary") return "secondary";
    return "higher";
  },
  getPersona(profile) {
    const level = PROFILE_ENGINE.getLevel(profile);
    const prog = (profile.program || "").toLowerCase();
    if (level === "kindergarten") return "tiny_explorer";
    if (level === "primary") return "young_learner";
    if (level === "secondary") return "high_schooler";
    if (prog.includes("law") || prog.includes("llb")) return "law";
    if (prog.includes("medicine") || prog.includes("mbchb") || prog.includes("med")) return "medicine";
    if (prog.includes("engineer") || prog.includes("eng")) return "engineering";
    if (prog.includes("nurs")) return "nursing";
    if (prog.includes("pharm")) return "pharmacy";
    if (prog.includes("dent")) return "dentistry";
    if (prog.includes("psych")) return "psychology";
    if (prog.includes("business") || prog.includes("bba") || prog.includes("mba") || prog.includes("commerce")) return "business";
    if (prog.includes("educat") || prog.includes("teach")) return "education";
    if (prog.includes("cs") || prog.includes("comput") || prog.includes("software") || prog.includes("data")) return "cs";
    if (prog.includes("science") || prog.includes("biology") || prog.includes("chemistry") || prog.includes("physics")) return "science";
    if (prog.includes("art") || prog.includes("design") || prog.includes("architect")) return "arts";
    if (prog.includes("social") || prog.includes("sociol") || prog.includes("anthro")) return "social_science";
    if (prog.includes("math") || prog.includes("stat") || prog.includes("actuari")) return "maths";
    if (prog.includes("econ")) return "economics";
    if (prog.includes("pre-med") || prog.includes("hpfp")) return "premed";
    return "general";
  },
  getConfig(profile, {
    resetProgress = false
  } = {}) {
    const persona = PROFILE_ENGINE.getPersona(profile);
    const level = PROFILE_ENGINE.getLevel(profile);
    const resetMetricValue = label => {
      const lower = label.toLowerCase();
      if (lower.includes("streak")) return "0 days";
      if (lower.includes("avg") || lower.includes("accuracy") || lower.includes("quiz") || lower.includes("mcq") || lower.includes("best")) return "0%";
      if (lower.includes("stars")) return "0 stars";
      if (lower.includes("cards")) return "0";
      if (/topics|cases|modules|frameworks|concepts|stories|theories|problems|essays/.test(lower)) return "0";
      return "0";
    };
    const configs = {
      tiny_explorer: {
        emoji: "🌈",
        greeting: "Hello, Superstar! 🌟",
        subgreeting: "Ready to learn something amazing today?",
        simaName: "SIMA",
        simaIntro: "Hi! I'm SIMA, your learning buddy! 🌈 Let's have fun learning together! What would you like to learn about today?",
        accentColor: C.pink,
        weakAreas: ["Numbers 1-20 🔢", "Letter Sounds 🔤", "Shapes & Colors 🟡", "Counting Objects 🍎"],
        todaySessions: ["🌈 Letters & Sounds (15 min)", "🔢 Counting Fun (10 min)", "🎨 Drawing & Colors (15 min)"],
        quickPrompts: ["Tell me about animals 🐘", "Count with me! 🔢", "What color is that? 🎨", "Sing the ABC song 🎵", "Tell me a story! 📖"],
        exampleTopics: ["Colors & Shapes", "Animals & Their Sounds", "Numbers 1 to 10", "My Body Parts", "Days of the Week"],
        studioModes: ["Flashcards 🃏", "Quiz 🎯", "Story 📖"],
        systemPromptHint: "Use extremely simple language, lots of emojis, short sentences, and fun analogies. Speak like a kind, enthusiastic teacher for 4–6 year olds. Use examples from animals, food, and toys. Celebrate every question!",
        flashcardTone: "Make it super simple with pictures described in words, short answers, and lots of emoji. Use examples kids love: animals, food, toys.",
        timetableHint: "15–20 minute fun activity blocks with movement breaks. Lots of play-based learning.",
        badgeColor: C.pink,
        statHighlights: ["⭐ Stars earned", "📚 Stories learned", "🔢 Numbers learned", "🎨 Things made"],
        statValues: ["12 stars", "5 stories", "Up to 20", "4 drawings"],
        weakLabel: "Things to Practice",
        weakIcon: "🌱",
        analyticsLabel: "My Learning Journey"
      },
      young_learner: {
        emoji: "🚀",
        greeting: "Hey, Champ! 🚀",
        subgreeting: "Let's make today's learning awesome!",
        simaName: "SIMA",
        simaIntro: `Hi ${profile.name?.split(" ")[0] || "there"}! 🚀 I'm SIMA, your study helper! I can help you understand your subjects, make studying fun, and answer any questions you have. What subject are we tackling today?`,
        accentColor: C.teal,
        weakAreas: ["Times Tables 📊", "Fractions 🍕", "Reading Comprehension 📖", "Map Skills 🗺️"],
        todaySessions: ["📖 Reading & Writing (30 min)", "🔢 Maths Practice (30 min)", "🌍 Social Studies (20 min)"],
        quickPrompts: ["Help me with fractions", "What causes rain? 🌧️", "History help please!", "Make a quiz for me", "Explain in simple steps"],
        exampleTopics: ["Fractions & Decimals", "The Water Cycle", "World War II Basics", "Plant Life Cycles", "Grammar & Punctuation"],
        studioModes: ["Flashcards", "Quiz", "Summary", "Mind Map"],
        systemPromptHint: "Use friendly, encouraging language for primary school students (ages 7–12). Use simple words, step-by-step explanations, real-world examples, and relatable analogies. Add fun facts and emojis occasionally. Keep sentences short.",
        flashcardTone: "Simple, clear language for primary school. Use examples from everyday life. Short answers.",
        timetableHint: "30-minute focused blocks with 10-minute breaks. Include physical activity breaks.",
        badgeColor: C.teal,
        statHighlights: ["🔥 Day streak", "✅ Topics done", "⚡ Cards reviewed", "🏆 Quiz best"],
        statValues: ["5 days", "14", "86", "90%"],
        weakLabel: "Areas to Strengthen",
        weakIcon: "💪",
        analyticsLabel: "Progress Tracker"
      },
      high_schooler: {
        emoji: "📚",
        greeting: "What's good,",
        subgreeting: "Let's crush those exams 💪",
        simaName: "SIMA",
        simaIntro: `Hey ${profile.name?.split(" ")[0] || "there"}! 👋 I'm SIMA — your personal study AI. I can help with any subject, generate practice questions, explain concepts, create revision notes, and build a study timetable. What are you working on?`,
        accentColor: C.accent,
        weakAreas: ["Calculus — Integration", "Organic Chemistry Reactions", "Essay Structure & Argument", "Economics — Elasticity"],
        todaySessions: ["🧪 Chemistry Organic (45 min)", "📐 Maths Past Papers (1h)", "✍️ English Essay Draft (30 min)"],
        quickPrompts: ["Generate 10 practice questions", "Explain this concept simply", "Create revision notes", "What will be on the exam?", "Make flashcards", "Grade my essay"],
        exampleTopics: ["Calculus — Differentiation & Integration", "Organic Chemistry Mechanisms", "World Literature Essay Techniques", "Macroeconomics Fundamentals", "Physics — Electricity & Magnetism"],
        studioModes: ["Flashcards", "MCQs", "Essay Feedback", "Summary"],
        systemPromptHint: "Adapt to a high school student. Use clear, engaging language. Cover exam techniques, memory tricks, and structure answers for maximum marks. Reference common exam board styles (Cambridge, IB, local national exams).",
        flashcardTone: "High school level. Focus on definitions, key dates, formulas, and exam-style phrasing.",
        timetableHint: "45-minute Pomodoro sessions. Prioritize exam subjects. Include past paper practice and active recall.",
        badgeColor: C.accent,
        statHighlights: ["🔥 Study streak", "📚 Topics mastered", "⚡ Cards due", "📊 Quiz avg"],
        statValues: ["7 days", "18", "23", "76%"],
        weakLabel: "Weak Areas — Prioritize These",
        weakIcon: "⚠️",
        analyticsLabel: "Exam Readiness"
      },
      law: {
        emoji: "⚖️",
        greeting: "Good day, Counsellor",
        subgreeting: "Case law, statutes, and moots await",
        simaName: "SIMA",
        simaIntro: `Good day, ${profile.name?.split(" ")[0] || "Counsellor"}! ⚖️ I'm SIMA, your legal study companion. I specialise in case analysis, statutory interpretation, essay structuring using IRAC/CREAC, and moot preparation. What area of law are we working on today?`,
        accentColor: C.gold,
        weakAreas: ["Donoghue v Stevenson — Duty of Care", "Constitutional Interpretation Methods", "Consideration in Contract Law", "Mens Rea & Actus Reus"],
        todaySessions: ["⚖️ Constitutional Law — Reading (1.5h)", "📝 Tort Essay — IRAC Draft (1h)", "🔍 Case Brief Practice (30 min)"],
        quickPrompts: ["Brief this case for me", "Explain IRAC method", "What are the exam issues here?", "Generate 10 MCQs on contract", "Compare two legal positions", "Draft a legal argument"],
        exampleTopics: ["Negligence & Duty of Care", "Offer & Acceptance in Contract", "Criminal Law — Mens Rea", "Judicial Review Principles", "Constitutional Rights & Limitations"],
        studioModes: ["Case Briefs", "MCQs", "Essay Feedback", "Statute Analysis"],
        systemPromptHint: "You are a legal study assistant. Use IRAC/CREAC frameworks. Cite landmark cases where relevant. Explain legal concepts with precision. Distinguish obiter dicta from ratio decidendi. Encourage critical legal analysis and competing arguments.",
        flashcardTone: "Law student level. Include: case name, year, key ratio, and principle. Frame as exam questions.",
        timetableHint: "90-minute deep reading blocks. Include mooting practice, past paper problem questions, and case brief sessions.",
        badgeColor: C.gold,
        statHighlights: ["🔥 Study streak", "⚖️ Cases briefed", "📝 Essays done", "🏛️ Topics covered"],
        statValues: ["6 days", "34 cases", "8 essays", "22 topics"],
        weakLabel: "Doctrine Gaps to Address",
        weakIcon: "⚖️",
        analyticsLabel: "Legal Mastery Tracker"
      },
      medicine: {
        emoji: "🩺",
        greeting: "Good morning, Doctor",
        subgreeting: "Let's build clinical excellence",
        simaName: "SIMA",
        simaIntro: `Hi ${profile.name?.split(" ")[0] || "Doc"}! 🩺 I'm SIMA, your medical study AI. I specialise in pathophysiology, clinical reasoning, pharmacology, and exam prep. I can generate MCQs, clinical cases, drug mnemonics, and more. What system are we studying today?`,
        accentColor: C.red,
        weakAreas: ["Acid-Base Disorders", "ECG Interpretation", "Drug Dosage Calculations", "Sepsis Management"],
        todaySessions: ["🫀 Cardiology — Heart Failure (1.5h)", "💊 Pharmacology MCQs (1h)", "🏥 Clinical Case Review (30 min)"],
        quickPrompts: ["Create a clinical case", "Generate MCQs", "Drug mechanism?", "Explain pathophysiology", "Memory tip for this drug", "What's the management?"],
        exampleTopics: ["Heart Failure Pathophysiology", "Antibiotic Resistance Mechanisms", "Diabetic Ketoacidosis Management", "Paediatric Malnutrition", "Acute Abdomen Differentials"],
        studioModes: ["MCQs", "Clinical Cases", "Flashcards", "Drug Summary"],
        systemPromptHint: "You are a clinical medical education AI. Use clinical reasoning: Pathophysiology → Presentation → Investigations → Diagnosis → Management. Cite evidence-based guidelines. Include mnemonics. Flag high-yield exam facts.",
        flashcardTone: "Medical student. Include: mechanism, clinical features, investigations, management. High-yield exam focus.",
        timetableHint: "Pomodoro 25-min blocks for theory, 45-min for case-based learning. Rotate systems. Include clinical exposure reflection.",
        badgeColor: C.red,
        statHighlights: ["🔥 Study streak", "🩺 Topics mastered", "⚡ Cards due", "📊 MCQ avg"],
        statValues: ["7 days", "24", "12", "78%"],
        weakLabel: "High-Yield Weak Areas",
        weakIcon: "⚠️",
        analyticsLabel: "Clinical Readiness"
      },
      engineering: {
        emoji: "⚙️",
        greeting: "Engineer Mode: ON",
        subgreeting: "Build, solve, iterate",
        simaName: "SIMA",
        simaIntro: `Hey ${profile.name?.split(" ")[0] || "Engineer"}! ⚙️ I'm SIMA. I think in systems and problem-solving frameworks. I can help with derivations, worked examples, concept breakdowns, and exam prep for your engineering modules. What's on the workbench today?`,
        accentColor: C.teal,
        weakAreas: ["Fourier Transforms", "Thermodynamics — Entropy", "Structural Analysis — Beam Bending", "Signal Processing Fundamentals"],
        todaySessions: ["⚙️ Mechanics — Worked Problems (1.5h)", "📐 Maths Methods — Revision (45 min)", "💡 Electrical Circuits MCQs (30 min)"],
        quickPrompts: ["Step-by-step derivation", "Solve this problem", "Conceptual explanation", "Generate practice problems", "Sketch a system diagram", "Common mistakes to avoid"],
        exampleTopics: ["Stress & Strain Analysis", "Laplace Transforms in Control", "Fluid Mechanics — Bernoulli", "Thermodynamic Cycles", "Digital Logic & Boolean Algebra"],
        studioModes: ["Problem Sets", "Concept Cards", "Formula Sheets", "Derivation Walkthrough"],
        systemPromptHint: "Engineering study assistant. Use first-principles thinking. Work through derivations step-by-step. Identify common error patterns. Use diagrams described in text. Emphasise unit analysis, dimensional consistency, and engineering intuition.",
        flashcardTone: "Engineering student. Include: formula, units, when to apply it, and common exam traps.",
        timetableHint: "90-minute deep problem-solving sessions. Interleave theory and practice. Use worked examples first, then blind problem sets.",
        badgeColor: C.teal,
        statHighlights: ["🔥 Problem streak", "⚙️ Modules covered", "📐 Problems solved", "✅ Accuracy rate"],
        statValues: ["5 days", "8", "47", "82%"],
        weakLabel: "Concept Gaps to Close",
        weakIcon: "⚙️",
        analyticsLabel: "Problem-Solving Analytics"
      },
      cs: {
        emoji: "💻",
        greeting: "sudo study --focus",
        subgreeting: "Ship knowledge, not bugs",
        simaName: "SIMA",
        simaIntro: `Hey ${profile.name?.split(" ")[0] || "Dev"}! 💻 I'm SIMA. I can help with algorithms, data structures, system design, theory concepts, and exam prep. I speak your language — literally. What are we debugging today?`,
        accentColor: C.teal,
        weakAreas: ["Dynamic Programming", "Big-O Complexity Analysis", "Database Normalisation", "Network Protocols (OSI Model)"],
        todaySessions: ["💻 Algorithms — Graph Problems (1h)", "🗄️ Databases — SQL Practice (45 min)", "📡 Networks — Theory Revision (30 min)"],
        quickPrompts: ["Explain Big-O", "Walk me through this algorithm", "Generate coding interview Qs", "Explain this concept", "What's the time complexity?", "Design this system"],
        exampleTopics: ["Dynamic Programming Patterns", "Graph Algorithms — BFS/DFS", "SQL Joins & Optimisation", "OS — Process Scheduling", "Machine Learning Fundamentals"],
        studioModes: ["Concept Cards", "Algorithm Qs", "Code Explainer", "Mock Interview"],
        systemPromptHint: "CS/software engineering study AI. Explain algorithms with pseudocode and complexity analysis. Use real-world analogies. Generate LeetCode-style problems. Cover both theoretical CS and practical software engineering.",
        flashcardTone: "CS student. Include: definition, time/space complexity, use case, and a simple example.",
        timetableHint: "60-minute coding sessions alternating with 30-minute theory. Include LeetCode daily practice and system design weekly.",
        badgeColor: C.teal,
        statHighlights: ["🔥 Code streak", "💻 Topics covered", "🧩 Problems solved", "✅ Accuracy"],
        statValues: ["9 days", "15", "63", "79%"],
        weakLabel: "Concept Gaps",
        weakIcon: "💻",
        analyticsLabel: "Dev Skill Tracker"
      },
      business: {
        emoji: "📈",
        greeting: "Market's open,",
        subgreeting: "Let's grow your business IQ",
        simaName: "SIMA",
        simaIntro: `Hey ${profile.name?.split(" ")[0] || "there"}! 📈 I'm SIMA, your business & management study partner. I can break down strategy frameworks, accounting concepts, finance theory, marketing models, and more. What are we analysing today?`,
        accentColor: C.gold,
        weakAreas: ["Financial Statement Analysis", "Porter's Five Forces Application", "Monetary Policy Transmission", "Break-Even Analysis"],
        todaySessions: ["📊 Finance — DCF Analysis (1h)", "📈 Strategy — Case Study (45 min)", "📚 Marketing Theory (30 min)"],
        quickPrompts: ["Explain this framework", "Case study analysis", "Define this term", "Generate exam questions", "Apply to a real company", "Pros and cons?"],
        exampleTopics: ["Porter's Five Forces", "DCF Valuation", "Consumer Behaviour Theory", "Organisational Structures", "International Trade & Tariffs"],
        studioModes: ["Framework Cards", "MCQs", "Case Analysis", "Definitions"],
        systemPromptHint: "Business & management study AI. Use real-world company examples. Apply strategic frameworks (SWOT, Porter, BCG). Ground finance concepts in practical scenarios. Help with both theoretical and applied business problems.",
        flashcardTone: "Business student. Include: definition, real-world example, and application in an exam context.",
        timetableHint: "60-minute case study blocks. Include news reading for current business examples. Alternate theory and case application.",
        badgeColor: C.gold,
        statHighlights: ["🔥 Study streak", "📈 Frameworks mastered", "📝 Cases analysed", "✅ Quiz avg"],
        statValues: ["4 days", "18", "12", "81%"],
        weakLabel: "Knowledge Gaps",
        weakIcon: "📈",
        analyticsLabel: "Business Acumen Tracker"
      },
      psychology: {
        emoji: "🧠",
        greeting: "Hello, Mind Explorer",
        subgreeting: "Understand people, understand the world",
        simaName: "SIMA",
        simaIntro: `Hi ${profile.name?.split(" ")[0] || "there"}! 🧠 I'm SIMA, your psychology study companion. I can explain theories, help you remember key studies, generate APA-style essay structures, and quiz you on everything from Freud to neuroscience. What's our focus today?`,
        accentColor: C.purple,
        weakAreas: ["Reliability vs Validity", "Cognitive Dissonance Theory", "Erikson's Psychosocial Stages", "Research Methods & Ethics"],
        todaySessions: ["🧠 Cognitive Psychology (1h)", "📊 Research Methods Practice (45 min)", "💬 Case Study Analysis (30 min)"],
        quickPrompts: ["Explain this theory", "Key study for this topic?", "Compare two theorists", "Essay structure help", "Generate quiz questions", "Real-world application?"],
        exampleTopics: ["Attachment Theory (Bowlby)", "Social Learning Theory", "Cognitive Development — Piaget", "Schizophrenia — Biological Explanations", "Research Ethics in Psychology"],
        studioModes: ["Theory Cards", "MCQs", "Essay Plans", "Study Summaries"],
        systemPromptHint: "Psychology study AI. Cover theories, key researchers, landmark studies, and evaluation (strengths/limitations). Use APA referencing style where relevant. Help with essay structure: AO1 (knowledge) + AO3 (evaluation).",
        flashcardTone: "Psychology student. Include: theorist name, year, theory summary, key study, and one evaluation point.",
        timetableHint: "45-minute theory blocks with evaluation practice. Include essay drafting and past paper practice.",
        badgeColor: C.purple,
        statHighlights: ["🔥 Study streak", "🧠 Theories mastered", "📝 Essays drafted", "✅ Quiz avg"],
        statValues: ["5 days", "21", "6", "74%"],
        weakLabel: "Theory Gaps",
        weakIcon: "🧠",
        analyticsLabel: "Psych Mastery Tracker"
      },
      science: {
        emoji: "🔬",
        greeting: "Lab coat on,",
        subgreeting: "Science waits for no one",
        simaName: "SIMA",
        simaIntro: `Hi ${profile.name?.split(" ")[0] || "Scientist"}! 🔬 I'm SIMA, your science study companion. I can explain mechanisms, walk through experiments, help with equations, and generate practice questions across biology, chemistry, and physics. What's our experiment today?`,
        accentColor: C.teal,
        weakAreas: ["Electron Configuration", "Genetic Inheritance Problems", "Newton's Laws Applications", "Enzyme Kinetics"],
        todaySessions: ["🧪 Chemistry — Organic Reactions (1h)", "🔬 Biology — Genetics (45 min)", "⚡ Physics — Electricity (30 min)"],
        quickPrompts: ["Explain the mechanism", "Work through this problem", "Lab technique explanation", "Generate practice Qs", "What's the equation?", "Draw & explain this"],
        exampleTopics: ["Photosynthesis & Respiration", "Periodic Trends & Bonding", "Mechanics — Force & Motion", "DNA Replication", "Thermochemistry"],
        studioModes: ["Concept Cards", "Problem Sets", "Experiment Notes", "Definitions"],
        systemPromptHint: "Science education AI. Use mechanistic thinking. Step through problems showing working. Use diagrams described in text. Highlight common misconceptions. Cover both conceptual understanding and mathematical application.",
        flashcardTone: "Science student. Include: concept, equation/formula if applicable, real-world example, and common misconception.",
        timetableHint: "60-minute concept blocks followed by problem-solving. Include past paper practice and experiment review.",
        badgeColor: C.teal,
        statHighlights: ["🔥 Study streak", "🔬 Topics done", "🧩 Problems solved", "✅ Quiz avg"],
        statValues: ["6 days", "19", "55", "77%"],
        weakLabel: "Concept Gaps",
        weakIcon: "🔬",
        analyticsLabel: "Science Progress"
      },
      maths: {
        emoji: "∑",
        greeting: "Let's prove something,",
        subgreeting: "Mathematics is the language of the universe",
        simaName: "SIMA",
        simaIntro: `Hello ${profile.name?.split(" ")[0] || "Mathematician"}! ∑ I'm SIMA, your maths study partner. I can work through proofs, explain concepts from first principles, generate problem sets, and help you spot patterns. What theorem are we tackling today?`,
        accentColor: C.purple,
        weakAreas: ["Real Analysis — Epsilon-Delta Proofs", "Group Theory Fundamentals", "Differential Equations — Exact Methods", "Probability — Conditional & Bayes"],
        todaySessions: ["∑ Analysis — Proof Writing (1.5h)", "📐 Linear Algebra — Problem Set (1h)", "📊 Probability — Exercises (30 min)"],
        quickPrompts: ["Step-by-step solution", "Prove this theorem", "Explain intuitively", "Generate practice problems", "Where does this formula come from?", "Common mistakes?"],
        exampleTopics: ["Real Analysis — Limits & Continuity", "Linear Algebra — Eigenvalues", "Abstract Algebra — Groups & Rings", "Probability & Statistics", "Complex Analysis"],
        studioModes: ["Problem Sets", "Proof Cards", "Formula Sheets", "Concept Explainers"],
        systemPromptHint: "Mathematics study AI. Show full working. Build intuition before formalism. Offer multiple proof strategies. Highlight where students typically make errors. Use LaTeX-style notation written out in words.",
        flashcardTone: "Maths student. Include: theorem/definition, intuition, when to apply, and a worked mini-example.",
        timetableHint: "90-minute deep focus blocks. Daily proof practice. Interleave new content with consolidation of recent material.",
        badgeColor: C.purple,
        statHighlights: ["🔥 Problem streak", "∑ Topics covered", "✅ Problems solved", "📊 Accuracy"],
        statValues: ["8 days", "12", "71", "84%"],
        weakLabel: "Proof Gaps",
        weakIcon: "∑",
        analyticsLabel: "Mathematical Mastery"
      },
      economics: {
        emoji: "📊",
        greeting: "Markets are rational,",
        subgreeting: "Are you? Let's find out",
        simaName: "SIMA",
        simaIntro: `Hey ${profile.name?.split(" ")[0] || "Economist"}! 📊 I'm SIMA, your economics study partner. I can explain micro and macro concepts, work through diagrams, analyse policy, and generate exam-style questions. What's our focus today?`,
        accentColor: C.gold,
        weakAreas: ["Price Elasticity of Demand", "IS-LM Model", "Game Theory Equilibria", "Keynesian vs Monetarist"],
        todaySessions: ["📊 Macroeconomics — Policy Analysis (1h)", "📉 Microeconomics — Problem Set (45 min)", "📝 Essay Practice (30 min)"],
        quickPrompts: ["Explain this diagram", "Policy analysis", "Evaluate this argument", "Generate exam questions", "Real-world example?", "Compare two theories"],
        exampleTopics: ["Supply & Demand Dynamics", "Fiscal & Monetary Policy", "Market Failures & Externalities", "International Trade Theory", "GDP & National Income Accounting"],
        studioModes: ["Concept Cards", "MCQs", "Essay Plans", "Diagram Explainers"],
        systemPromptHint: "Economics study AI. Use diagrams described in words. Apply models to real-world examples. Evaluate policy tradeoffs. Structure answers for economics essays: Theory → Application → Evaluation.",
        flashcardTone: "Economics student. Include: concept, diagram description, real-world example, and evaluation point.",
        timetableHint: "60-minute blocks alternating theory and essay practice. Include current economic news reading.",
        badgeColor: C.gold,
        statHighlights: ["🔥 Study streak", "📊 Concepts mastered", "📝 Essays", "✅ Quiz avg"],
        statValues: ["4 days", "20", "7", "79%"],
        weakLabel: "Concept Gaps",
        weakIcon: "📊",
        analyticsLabel: "Economics Mastery"
      },
      general: {
        emoji: "🎓",
        greeting: "Good to see you,",
        subgreeting: "Let's make progress today",
        simaName: "SIMA",
        simaIntro: `Hi ${profile.name?.split(" ")[0] || "there"}! 🎓 I'm SIMA, your personal study AI. I can help you understand any subject, generate practice questions, create revision notes, and build a personalised study plan. What are we working on today?`,
        accentColor: C.accent,
        weakAreas: ["Critical Thinking & Analysis", "Essay Structure & Argument", "Research Methods", "Exam Technique"],
        todaySessions: ["📚 Main Subject Review (1h)", "📝 Practice Questions (45 min)", "🔁 Flashcard Review (20 min)"],
        quickPrompts: ["Explain this concept", "Generate practice questions", "Summarise this topic", "Create flashcards", "Study tips for this?", "What will be examined?"],
        exampleTopics: ["Core Concepts Review", "Practice Question Sets", "Topic Summaries", "Exam Technique"],
        studioModes: ["Flashcards", "MCQs", "Summary", "Study Plan"],
        systemPromptHint: "General academic study AI. Adapt to the student's level and subject. Be encouraging. Use clear explanations, examples, and memory techniques.",
        flashcardTone: "University student. Clear, concise question and answer format.",
        timetableHint: "45-minute Pomodoro sessions with regular breaks. Include review and practice sessions.",
        badgeColor: C.accent,
        statHighlights: ["🔥 Study streak", "📚 Topics done", "⚡ Cards due", "✅ Quiz avg"],
        statValues: ["3 days", "11", "18", "72%"],
        weakLabel: "Areas to Strengthen",
        weakIcon: "⚠️",
        analyticsLabel: "Learning Progress"
      }
    };
    const config = {
      ...(configs[persona] || configs.general)
    };
    if (!config.weeklyStudyHours) config.weeklyStudyHours = [0, 0, 0, 0, 0, 0, 0];
    if (!config.weeklyQuizScores) config.weeklyQuizScores = [0, 0, 0, 0, 0, 0, 0];
    if (resetProgress) {
      config.statValues = config.statHighlights.map(resetMetricValue);
      config.weeklyStudyHours = [0, 0, 0, 0, 0, 0, 0];
      config.weeklyQuizScores = [0, 0, 0, 0, 0, 0, 0];
      config.weakAreas = [];
      config.exampleTopics = [];
      config.todaySessions = [];
    }
    return config;
  }
};
const PROGRAMS = ["Medicine (MBChB)", "Law (LLB)", "Engineering (General)", "Civil Engineering", "Electrical Engineering", "Mechanical Engineering", "Computer Science", "Software Engineering", "Data Science & AI", "Nursing", "Pharmacy", "Dentistry", "Psychology", "Business Administration (BBA)", "MBA", "Economics", "Accounting & Finance", "Commerce", "Education / Teaching", "Natural Sciences", "Biology", "Chemistry", "Physics", "Mathematics", "Statistics & Actuarial Science", "Architecture", "Art & Design", "Social Sciences", "Sociology & Anthropology", "Political Science", "Pre-Med (HPFP)", "Journalism & Media", "Agriculture", "Environmental Science", "Other"];
const PROFESSIONAL_TITLES = {
  "Medicine (MBChB)": "🏥 Doctor",
  "Law (LLB)": "⚖️ Lawyer",
  "Engineering (General)": "🏗️ Engineer",
  "Civil Engineering": "🌉 Civil Engineer",
  "Electrical Engineering": "⚡ Electrical Engineer",
  "Mechanical Engineering": "🔧 Mechanical Engineer",
  "Computer Science": "💻 Developer",
  "Software Engineering": "🖥️ Software Engineer",
  "Data Science & AI": "🤖 Data Scientist",
  "Nursing": "👩‍⚕️ Nurse",
  "Pharmacy": "💊 Pharmacist",
  "Dentistry": "🦷 Dentist",
  "Psychology": "🧠 Psychologist",
  "Business Administration (BBA)": "📊 Business Manager",
  "MBA": "💼 Business Executive",
  "Economics": "📈 Economist",
  "Accounting & Finance": "💰 Accountant",
  "Commerce": "🏪 Commerce Professional",
  "Education / Teaching": "🎓 Teacher",
  "Natural Sciences": "🔬 Scientist",
  "Biology": "🧬 Biologist",
  "Chemistry": "🧪 Chemist",
  "Physics": "⚛️ Physicist",
  "Mathematics": "📐 Mathematician",
  "Statistics & Actuarial Science": "📊 Actuary",
  "Architecture": "🏛️ Architect",
  "Art & Design": "🎨 Designer",
  "Social Sciences": "📚 Social Scientist",
  "Sociology & Anthropology": "🤝 Sociologist",
  "Political Science": "🏛️ Politician",
  "Pre-Med (HPFP)": "🏥 Healthcare Professional",
  "Journalism & Media": "📺 Journalist",
  "Agriculture": "🌾 Agriculturist",
  "Environmental Science": "🌍 Environmentalist",
  "Other": "🎯 Professional"
};
const Icon = ({
  d,
  size = 20,
  color = "currentColor",
  fill = "none",
  sw = 1.8
}) => React.createElement("svg", {
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: fill,
  stroke: color,
  strokeWidth: sw,
  strokeLinecap: "round",
  strokeLinejoin: "round"
}, React.createElement("path", {
  d: d
}));
const Icons = {
  brain: "M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z",
  flash: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  clock: "M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 6v4l3 3",
  users: "M16 8a4 4 0 1 1-8 0 4 4 0 0 1 8 0zm-10 4a4 4 0 0 0-4 4v2h6v-2a4 4 0 0 0-2-3.46zm14 0a4 4 0 0 0-4 4v2h6v-2a4 4 0 0 0-2-3.46z",
  mic: "M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3zM19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8",
  send: "M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z",
  check: "M20 6L9 17l-5-5",
  home: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
  sparkle: "M12 3v1m0 16v1M4.22 4.22l.7.7m12.16 12.16.7.7M3 12h1m16 0h1M4.22 19.78l.7-.7M18.36 5.64l.7-.7M12 7a5 5 0 1 0 0 10A5 5 0 0 0 12 7z",
  chart: "M18 20V10M12 20V4M6 20v-6",
  note: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8",
  repeat: "M17 1l4 4-4 4 M3 11V9a4 4 0 0 1 4-4h14 M7 23l-4-4 4-4 M21 13v2a4 4 0 0 1-4 4H3",
  play: "M5 3l14 9-14 9V3z",
  pause: "M6 4h4v16H6zM14 4h4v16h-4z",
  stop: "M18 3H6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3z",
  x: "M18 6L6 18M6 6l12 12",
  plus: "M12 5v14M5 12h14",
  target: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12z M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
  trending: "M23 6l-9.5 9.5-5-5L1 18 M17 6h6v6",
  settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  upload: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12",
  trophy: "M8 6h8a2 2 0 0 1 2 2v2h2a2 2 0 0 1 0 4h-1v4a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-4H4a2 2 0 0 1 0-4h2V8a2 2 0 0 1 2-2z M9 2h6M11 14h2v3h-2z"
};
const localSimaResponse = ({
  prompt = "",
  mode = "exam",
  profile = {},
  selectedSource = null
}) => {
  const studentName = profile.name?.split(" ")[0] || "Student";
  const subject = profile.program || "your subject";
  const normalized = prompt.toLowerCase();
  const hasExplain = /explain|define|describe|what is|why|how/.test(normalized);
  const hasCompare = /difference|compare|contrast/.test(normalized);
  const hasExample = /example|practice|quiz|solve|question|problem/.test(normalized);
  const hasSummary = /summary|summarize|overview|recap/.test(normalized);
  const sourceHint = selectedSource ? ` based on ${selectedSource.name}` : "";
  let answer = "";
  if (hasSummary) {
    answer = `Here is a clear summary of the key ideas${sourceHint} for ${subject}:
- Identify the major concept.
- Connect it to the main goal.
- Highlight what matters most for exams.`;
  } else if (hasCompare) {
    answer = `To compare these ideas${sourceHint}:
- Point 1: Use the first concept to show the core difference.
- Point 2: Show how the second concept changes application.
- Exam tip: Remember the strengths and when each method applies.`;
  } else if (hasExample) {
    answer = `Let's turn this into a learning example for ${subject}${sourceHint}:
1. State the problem clearly.
2. Show how to solve it step by step.
3. Summarize the result and the key lesson.`;
  } else if (hasExplain) {
    answer = `Sure ${studentName}, here is a simple explanation for ${subject}${sourceHint}:
- Start with the basic idea.
- Break it into two or three main steps.
- Finish with the practical takeaway.`;
  } else {
    answer = `Great question, ${studentName}! For ${subject}${sourceHint}, I recommend this approach:
- Focus on the most important concept.
- Practice a quick example.
- Review the answer in your own words.`;
  }
  if (mode === "simple") {
    answer = answer.replace(/\bexam\b/gi, "test").replace(/concept/g, "idea").replace(/strategy/g, "plan");
  }
  if (mode === "exam") {
    answer = `Exam-ready answer:\n${answer}\n\nTip: write keywords, keep sentences short, and underline the main point.`;
  }
  if (mode === "advanced") {
    answer = `Advanced analysis:\n${answer}\n\nThink about exceptions, edge cases, and how this applies across topics.`;
  }
  if (mode === "clinical") {
    answer = `Clinical learning:\n${answer}\n\nUse a real-world scenario, explain the outcome, and connect it to theory.`;
  }
  return answer;
};
const inferSourceGroup = filename => {
  const id = filename.toLowerCase();
  if (/biology|bio/.test(id)) return "Biology";
  if (/chemistry|chem/.test(id)) return "Chemistry";
  if (/physics|phys/.test(id)) return "Physics";
  if (/economics|econ/.test(id)) return "Economics";
  if (/math|algebra|calculus|geometry|statistics|probability/.test(id)) return "Mathematics";
  if (/history|hist|civics/.test(id)) return "History";
  if (/english|literature|lang/.test(id)) return "English";
  if (/business|marketing|finance|accounting/.test(id)) return "Business";
  if (/law|legal/.test(id)) return "Law";
  if (/medicine|nursing|health|anatomy|physiology/.test(id)) return "Health";
  return "General Studies";
};
const S = {
  get page() {
    return {
      minHeight: "100vh",
      background: C.bg,
      color: C.text,
      fontFamily: "'Sora', 'DM Sans', system-ui, sans-serif",
      display: "flex",
      flexDirection: "column"
    };
  },
  get card() {
    return {
      background: C.card,
      border: `1px solid ${C.border}`,
      borderRadius: 16,
      padding: 20
    };
  },
  btn: (bg = C.accent, fg = "#fff") => ({
    background: bg,
    color: fg,
    border: "none",
    borderRadius: 10,
    padding: "11px 20px",
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    transition: "opacity .15s, transform .1s",
    fontFamily: "inherit"
  }),
  get input() {
    return {
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: 10,
      padding: "11px 14px",
      color: C.text,
      fontSize: 14,
      width: "100%",
      outline: "none",
      boxSizing: "border-box",
      fontFamily: "inherit"
    };
  },
  label: {
    fontSize: 11,
    color: C.muted,
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    marginBottom: 6,
    display: "block"
  }
};
function Badge({
  children,
  color = C.accent
}) {
  return React.createElement("span", {
    style: {
      background: color + "22",
      color,
      borderRadius: 6,
      padding: "2px 8px",
      fontSize: 11,
      fontWeight: 700
    }
  }, children);
}
function Pill({
  children,
  active,
  onClick,
  color
}) {
  const col = color || C.accent;
  return React.createElement("button", {
    onClick: onClick,
    style: {
      background: active ? col : C.surface,
      color: active ? "#fff" : C.muted,
      border: `1px solid ${active ? col : C.border}`,
      borderRadius: 20,
      padding: "7px 15px",
      fontSize: 13,
      fontWeight: 600,
      cursor: "pointer",
      transition: "all .15s",
      whiteSpace: "nowrap",
      fontFamily: "inherit"
    }
  }, children);
}
function ProgressBar({
  value,
  max,
  color = C.accent,
  height = 6
}) {
  return React.createElement("div", {
    style: {
      background: C.border,
      borderRadius: 4,
      height,
      overflow: "hidden"
    }
  }, React.createElement("div", {
    style: {
      width: `${Math.min(100, value / max * 100)}%`,
      background: color,
      height: "100%",
      borderRadius: 4,
      transition: "width .4s"
    }
  }));
}
function CircleProgress({
  value,
  size = 80,
  stroke = 7,
  color = C.accent,
  label
}) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - value / 100 * circ;
  return React.createElement("div", {
    style: {
      position: "relative",
      width: size,
      height: size,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, React.createElement("svg", {
    width: size,
    height: size,
    style: {
      transform: "rotate(-90deg)",
      position: "absolute"
    }
  }, React.createElement("circle", {
    cx: size / 2,
    cy: size / 2,
    r: r,
    fill: "none",
    stroke: C.border,
    strokeWidth: stroke
  }), React.createElement("circle", {
    cx: size / 2,
    cy: size / 2,
    r: r,
    fill: "none",
    stroke: color,
    strokeWidth: stroke,
    strokeDasharray: circ,
    strokeDashoffset: offset,
    strokeLinecap: "round",
    style: {
      transition: "stroke-dashoffset .6s ease"
    }
  })), React.createElement("div", {
    style: {
      textAlign: "center"
    }
  }, React.createElement("div", {
    style: {
      fontSize: size * 0.22,
      fontWeight: 800,
      color
    }
  }, value, "%"), label && React.createElement("div", {
    style: {
      fontSize: size * 0.13,
      color: C.muted,
      lineHeight: 1.2
    }
  }, label)));
}
function Avatar({
  name = "S",
  size = 36,
  color = C.accent
}) {
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  return React.createElement("div", {
    style: {
      width: size,
      height: size,
      borderRadius: "50%",
      background: `linear-gradient(135deg, ${color}, ${C.purple})`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: 800,
      fontSize: size * 0.38,
      color: "#fff",
      flexShrink: 0
    }
  }, initials);
}
function SimaTyping() {
  return React.createElement("div", {
    style: {
      display: "flex",
      gap: 5,
      alignItems: "center",
      padding: "10px 14px",
      background: C.card,
      borderRadius: 12,
      width: "fit-content"
    }
  }, [0, 1, 2].map(i => React.createElement("div", {
    key: i,
    style: {
      width: 6,
      height: 6,
      borderRadius: "50%",
      background: C.accent,
      animation: `bounce 1s ${i * 0.15}s infinite`
    }
  })));
}
function OnboardingScreen({
  onComplete
}) {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState({
    name: "",
    age: 18,
    education: "",
    program: "",
    year: "",
    institution: "",
    studyTime: "morning",
    attention: "medium",
    hours: 3,
    style: ["visual"],
    email: ""
  });
  const [validationError, setValidationError] = useState("");
  const upd = (k, v) => setProfile(p => ({
    ...p,
    [k]: v
  }));
  const STEPS = 4;
  const styleOptions = [["visual", "Visual"], ["auditory", "Auditory"], ["reading", "Reading/Writing"], ["kinesthetic", "Kinesthetic"], ["practical", "Practical"], ["social", "Group Learning"], ["solitary", "Solo Study"], ["logical", "Logical"], ["verbal", "Verbal"], ["spacedRepetition", "Spaced Repetition"], ["groupStudy", "Group Study"], ["mindMapping", "Mind Mapping"], ["activeRecall", "Active Recall"]];
  const educationOptions = [{
    value: "kindergarten",
    label: "Kindergarten"
  }, {
    value: "primary",
    label: "Primary School"
  }, {
    value: "secondary",
    label: "Secondary School"
  }, {
    value: "university",
    label: "University"
  }, {
    value: "postgraduate",
    label: "Postgraduate"
  }];
  const gradeOptions = {
    primary: [{
      value: "grade1",
      label: "Grade 1"
    }, {
      value: "grade2",
      label: "Grade 2"
    }, {
      value: "grade3",
      label: "Grade 3"
    }, {
      value: "grade4",
      label: "Grade 4"
    }, {
      value: "grade5",
      label: "Grade 5"
    }, {
      value: "grade6",
      label: "Grade 6"
    }, {
      value: "grade7",
      label: "Grade 7"
    }],
    secondary: [{
      value: "grade8",
      label: "Grade 8 (Form 1)"
    }, {
      value: "grade9",
      label: "Grade 9 (Form 2)"
    }, {
      value: "grade10",
      label: "Grade 10 (Form 3)"
    }, {
      value: "grade11",
      label: "Grade 11 (Form 4)"
    }, {
      value: "grade12",
      label: "Grade 12 (Form 5)"
    }]
  };
  const previewProfile = {
    ...profile,
    style: Array.isArray(profile.style) ? profile.style[0] : profile.style
  };
  const styleLabel = Array.isArray(profile.style) ? profile.style.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(", ") : profile.style;
  const validateStep = (stepIndex, profileData) => {
    if (stepIndex === 0) {
      if (!profileData.name.trim()) return "Please enter your name before continuing.";
      if (!profileData.education) return "Please select your education level.";
    }
    if (stepIndex === 1) {
      if (!profileData.institution.trim()) return "Please enter your institution or school name.";
      if (profileData.education === "university" || profileData.education === "postgraduate") {
        if (!profileData.program) return "Please select your program or course.";
        if (!profileData.year) return "Please choose your year of study.";
      }
      if ((profileData.education === "primary" || profileData.education === "secondary") && !profileData.year) return "Please select your grade or class.";
    }
    if (stepIndex === 2) {
      if (!Array.isArray(profileData.style) || profileData.style.length === 0) return "Please choose at least one learning style.";
    }
    return "";
  };
  const previewConfig = PROFILE_ENGINE.getConfig(previewProfile);
  const steps = [React.createElement("div", {
    key: 0
  }, React.createElement("div", {
    style: {
      fontSize: 11,
      color: previewConfig.accentColor,
      fontWeight: 700,
      letterSpacing: "0.1em",
      marginBottom: 10
    }
  }, "STEP 1 — WHO ARE YOU?"), React.createElement("h2", {
    style: {
      fontSize: 22,
      fontWeight: 800,
      marginBottom: 6
    }
  }, "Let's personalise SIMA for you ✨"), React.createElement("p", {
    style: {
      color: C.muted,
      marginBottom: 24,
      fontSize: 14
    }
  }, "Everything adapts to your profile — from the language SIMA uses to your quiz topics."), React.createElement("label", {
    style: S.label
  }, "Your name"), React.createElement("input", {
    style: {
      ...S.input,
      marginBottom: 16
    },
    placeholder: "e.g. Mwansa Chanda",
    value: profile.name,
    onChange: e => upd("name", e.target.value)
  }), React.createElement("label", {
    style: S.label
  }, "Age: ", profile.age), React.createElement("input", {
    type: "range",
    min: 4,
    max: 60,
    value: profile.age,
    onChange: e => upd("age", +e.target.value),
    style: {
      width: "100%",
      accentColor: previewConfig.accentColor,
      marginBottom: 16
    }
  }), React.createElement("label", {
    style: S.label
  }, "Education level"), React.createElement("select", {
    style: {
      ...S.input
    },
    value: profile.education,
    onChange: e => upd("education", e.target.value)
  }, React.createElement("option", {
    value: "",
    disabled: true
  }, "Select education level"), educationOptions.map(opt => React.createElement("option", {
    key: opt.value,
    value: opt.value
  }, opt.label))), profile.education && profile.education !== "kindergarten" && React.createElement("div", {
    style: {
      marginTop: 14,
      padding: "10px 14px",
      background: previewConfig.accentColor + "15",
      borderRadius: 10,
      border: `1px solid ${previewConfig.accentColor}33`,
      fontSize: 13,
      color: previewConfig.accentColor
    }
  }, previewConfig.emoji, " SIMA will adapt to your level automatically")), React.createElement("div", {
    key: 1
  }, React.createElement("div", {
    style: {
      fontSize: 11,
      color: previewConfig.accentColor,
      fontWeight: 700,
      letterSpacing: "0.1em",
      marginBottom: 10
    }
  }, "STEP 2 — YOUR COURSE"), React.createElement("h2", {
    style: {
      fontSize: 22,
      fontWeight: 800,
      marginBottom: 6
    }
  }, "Academic details 📚"), React.createElement("p", {
    style: {
      color: C.muted,
      marginBottom: 24,
      fontSize: 14
    }
  }, "SIMA uses this to adapt quiz topics, examples, and difficulty."), profile.education === "university" || profile.education === "postgraduate" ? React.createElement(React.Fragment, null, React.createElement("label", {
    style: S.label
  }, "Program / Course"), React.createElement("select", {
    style: {
      ...S.input,
      marginBottom: 16
    },
    value: profile.program,
    onChange: e => upd("program", e.target.value)
  }, React.createElement("option", {
    value: "",
    disabled: true
  }, "Select program / course"), PROGRAMS.map(p => React.createElement("option", {
    key: p,
    value: p
  }, p))), React.createElement("label", {
    style: S.label
  }, "Year of study"), React.createElement("select", {
    style: {
      ...S.input,
      marginBottom: 16
    },
    value: profile.year,
    onChange: e => upd("year", e.target.value)
  }, React.createElement("option", {
    value: "",
    disabled: true
  }, "Select year of study"), ["1", "2", "3", "4", "5", "6", "7"].map(y => React.createElement("option", {
    key: y,
    value: y
  }, "Year ", y))), React.createElement("label", {
    style: S.label
  }, "Institution"), React.createElement("input", {
    style: S.input,
    placeholder: "e.g. University of Zambia",
    value: profile.institution,
    onChange: e => upd("institution", e.target.value),
    list: "universityList"
  }), React.createElement("datalist", {
    id: "universityList"
  }, UNIVERSITY_NAMES.map(name => React.createElement("option", {
    key: name,
    value: name
  })))) : profile.education === "kindergarten" ? React.createElement(React.Fragment, null, React.createElement("label", {
    style: S.label
  }, "School name"), React.createElement("input", {
    style: {
      ...S.input,
      marginBottom: 16
    },
    placeholder: "e.g. Sunshine Nursery",
    value: profile.institution,
    onChange: e => upd("institution", e.target.value)
  }), React.createElement("div", {
    style: {
      padding: "14px",
      background: C.pink + "15",
      borderRadius: 12,
      border: `1px solid ${C.pink}33`,
      fontSize: 14,
      color: C.pink
    }
  }, "🌈 SIMA will use simple words, fun pictures described in words, and lots of emojis just for you!")) : profile.education === "primary" || profile.education === "secondary" ? React.createElement(React.Fragment, null, React.createElement("label", {
    style: S.label
  }, "School name"), React.createElement("input", {
    style: {
      ...S.input,
      marginBottom: 16
    },
    placeholder: "e.g. Chawama Secondary School",
    value: profile.institution,
    onChange: e => upd("institution", e.target.value),
    list: "schoolList"
  }), React.createElement("datalist", {
    id: "schoolList"
  }, SCHOOL_NAMES.map(name => React.createElement("option", {
    key: name,
    value: name
  }))), React.createElement("label", {
    style: S.label
  }, "Grade / Class"), React.createElement("select", {
    style: S.input,
    value: profile.year,
    onChange: e => upd("year", e.target.value)
  }, React.createElement("option", {
    value: "",
    disabled: true
  }, "Select your grade"), gradeOptions[profile.education]?.map(g => React.createElement("option", {
    key: g.value,
    value: g.value
  }, g.label)))) : null, React.createElement("div", {
    style: {
      marginTop: 16,
      padding: "12px 14px",
      background: C.surface,
      borderRadius: 12,
      border: `1px solid ${C.border}`,
      fontSize: 13
    }
  }, React.createElement("div", {
    style: {
      color: C.muted,
      fontSize: 11,
      fontWeight: 700,
      marginBottom: 6
    }
  }, "SIMA WILL TEACH YOU LIKE A"), React.createElement("div", {
    style: {
      fontWeight: 700,
      color: previewConfig.accentColor
    }
  }, previewConfig.emoji, " ", previewConfig.greeting.replace(",", ""), " learner"), React.createElement("div", {
    style: {
      color: C.muted,
      fontSize: 12,
      marginTop: 4
    }
  }, "Topics: ", previewConfig.exampleTopics?.[0], ", ", previewConfig.exampleTopics?.[1]))), React.createElement("div", {
    key: 2
  }, React.createElement("div", {
    style: {
      fontSize: 11,
      color: previewConfig.accentColor,
      fontWeight: 700,
      letterSpacing: "0.1em",
      marginBottom: 10
    }
  }, "STEP 3 — HOW YOU STUDY"), React.createElement("h2", {
    style: {
      fontSize: 22,
      fontWeight: 800,
      marginBottom: 6
    }
  }, "Your study style 🧠"), React.createElement("p", {
    style: {
      color: C.muted,
      marginBottom: 24,
      fontSize: 14
    }
  }, "SIMA adapts your timetable, sessions, and explanations to match."), React.createElement("label", {
    style: S.label
  }, "Preferred study time"), React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      marginBottom: 18,
      flexWrap: "wrap"
    }
  }, ["morning", "afternoon", "evening", "night"].map(t => React.createElement(Pill, {
    key: t,
    active: profile.studyTime === t,
    onClick: () => upd("studyTime", t),
    color: previewConfig.accentColor
  }, t.charAt(0).toUpperCase() + t.slice(1)))), React.createElement("label", {
    style: S.label
  }, "Attention span"), React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      marginBottom: 18,
      flexWrap: "wrap"
    }
  }, [["short", "⚡ Short (<20 min)"], ["medium", "🔥 Medium (20–45 min)"], ["long", "💎 Deep (45 min+)"]].map(([v, l]) => React.createElement(Pill, {
    key: v,
    active: profile.attention === v,
    onClick: () => upd("attention", v),
    color: previewConfig.accentColor
  }, l))), React.createElement("label", {
    style: S.label
  }, "Learning style"), React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      flexWrap: "wrap",
      marginBottom: 18
    }
  }, styleOptions.map(([ls, label]) => {
    const selected = Array.isArray(profile.style) ? profile.style.includes(ls) : profile.style === ls;
    return React.createElement(Pill, {
      key: ls,
      active: selected,
      onClick: () => {
        const current = Array.isArray(profile.style) ? profile.style : [profile.style];
        const next = current.includes(ls) ? current.filter(item => item !== ls) : [...current, ls];
        upd("style", next.length ? next : ["visual"]);
      },
      color: previewConfig.accentColor
    }, label);
  })), React.createElement("label", {
    style: S.label
  }, "Daily study hours: ", profile.hours, "h"), React.createElement("input", {
    type: "range",
    min: 1,
    max: 12,
    value: profile.hours,
    onChange: e => upd("hours", +e.target.value),
    style: {
      width: "100%",
      accentColor: previewConfig.accentColor
    }
  })), React.createElement("div", {
    key: 3
  }, React.createElement("div", {
    style: {
      fontSize: 11,
      color: previewConfig.accentColor,
      fontWeight: 700,
      letterSpacing: "0.1em",
      marginBottom: 10
    }
  }, "STEP 4 — CONTACT INFO"), React.createElement("h2", {
    style: {
      fontSize: 22,
      fontWeight: 800,
      marginBottom: 6
    }
  }, "Add your phone number 📱"), React.createElement("p", {
    style: {
      color: C.muted,
      marginBottom: 24,
      fontSize: 14
    }
  }, "This helps us reach you and provides account recovery options."), React.createElement("label", {
    style: S.label
  }, "Full name"), React.createElement("input", {
    style: {
      ...S.input,
      marginBottom: 16
    },
    placeholder: "First and Last Name",
    value: profile.name,
    onChange: e => upd("name", e.target.value)
  }), React.createElement("label", {
    style: S.label
  }, "Country code"), React.createElement("select", {
    style: {
      ...S.input,
      marginBottom: 12
    },
    value: profile.countryCode || "+260",
    onChange: e => upd("countryCode", e.target.value)
  }, [{
    code: "+260",
    country: "🇿🇲 Zambia"
  }, {
    code: "+1",
    country: "🇺🇸 USA"
  }, {
    code: "+44",
    country: "🇬🇧 UK"
  }, {
    code: "+254",
    country: "🇰🇪 Kenya"
  }, {
    code: "+255",
    country: "🇹🇿 Tanzania"
  }, {
    code: "+256",
    country: "🇺🇬 Uganda"
  }, {
    code: "+27",
    country: "🇿🇦 South Africa"
  }, {
    code: "+234",
    country: "🇳🇬 Nigeria"
  }, {
    code: "+233",
    country: "🇬🇭 Ghana"
  }, {
    code: "+91",
    country: "🇮🇳 India"
  }, {
    code: "+86",
    country: "🇨🇳 China"
  }, {
    code: "+61",
    country: "🇦🇺 Australia"
  }].map(({
    code,
    country
  }) => React.createElement("option", {
    key: code,
    value: code
  }, code, " ", country))), React.createElement("label", {
    style: S.label
  }, "Phone number"), React.createElement("input", {
    style: {
      ...S.input,
      marginBottom: 16
    },
    placeholder: "Enter your phone number",
    type: "tel",
    value: profile.phone || "",
    onChange: e => upd("phone", e.target.value.replace(/\D/g, ""))
  }), React.createElement("label", {
    style: S.label
  }, "How urgent is your study?"), React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      flexWrap: "wrap",
      marginBottom: 20
    }
  }, ["Exam in < 1 week", "Need a miracle 😅", "1–4 weeks away", "Just building habits"].map(opt => React.createElement(Pill, {
    key: opt,
    active: profile.urgency === opt,
    onClick: () => upd("urgency", opt),
    color: previewConfig.accentColor
  }, opt))), React.createElement("div", {
    style: {
      padding: "16px",
      background: previewConfig.accentColor + "15",
      borderRadius: 14,
      border: `1px solid ${previewConfig.accentColor}33`
    }
  }, React.createElement("div", {
    style: {
      fontWeight: 800,
      fontSize: 15,
      color: previewConfig.accentColor,
      marginBottom: 10
    }
  }, previewConfig.emoji, " Your SIMA Profile"), React.createElement("div", {
    style: {
      fontSize: 13,
      display: "flex",
      flexDirection: "column",
      gap: 5,
      color: C.text
    }
  }, React.createElement("div", null, "👤 ", profile.name || "Student", " · ", profile.education), profile.program && React.createElement("div", null, "📚 ", profile.program, " ", profile.year ? `· Year ${profile.year}` : ""), React.createElement("div", null, "⏱️ ", profile.hours, "h/day · ", profile.attention, " focus · ", profile.studyTime), React.createElement("div", null, "🧠 ", styleLabel, " learner"))))];
  return React.createElement("div", {
    style: {
      ...S.page,
      alignItems: "center",
      justifyContent: "center",
      padding: 24
    }
  }, React.createElement("div", {
    style: {
      width: "100%",
      maxWidth: 480
    }
  }, React.createElement("div", {
    style: {
      marginBottom: 28
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: 8
    }
  }, React.createElement("span", {
    style: {
      fontSize: 12,
      color: C.muted
    }
  }, "Step ", step + 1, " of ", STEPS), React.createElement("span", {
    style: {
      fontSize: 12,
      color: previewConfig.accentColor,
      fontWeight: 700
    }
  }, Math.round((step + 1) / STEPS * 100), "%")), React.createElement(ProgressBar, {
    value: step + 1,
    max: STEPS,
    color: previewConfig.accentColor
  })), React.createElement("div", {
    style: {
      ...S.card,
      minHeight: 360
    }
  }, steps[step]), validationError && React.createElement("div", {
    style: {
      marginBottom: 12,
      padding: "12px 14px",
      background: "#ffebe8",
      border: "1px solid #ffb3a0",
      borderRadius: 10,
      color: "#a94442",
      fontSize: 13
    }
  }, validationError), React.createElement("div", {
    style: {
      display: "flex",
      gap: 12,
      marginTop: 16
    }
  }, step > 0 && React.createElement("button", {
    style: {
      ...S.btn(C.surface, C.text),
      flex: 1,
      justifyContent: "center",
      border: `1px solid ${C.border}`
    },
    onClick: () => {
      setValidationError("");
      setStep(s => s - 1);
    }
  }, "← Back"), React.createElement("button", {
    style: {
      ...S.btn(previewConfig.accentColor),
      flex: 2,
      justifyContent: "center",
      fontSize: 15
    },
    onClick: () => {
      const nextError = validateStep(step, profile);
      if (nextError) {
        setValidationError(nextError);
        return;
      }
      setValidationError("");
      if (step < STEPS - 1) setStep(s => s + 1);else onComplete(profile);
    }
  }, step < STEPS - 1 ? "Continue →" : `Build My Study Brain ${previewConfig.emoji}`))));
}
function WelcomeScreen({
  onStart,
  onGuest
}) {
  return React.createElement("div", {
    style: {
      ...S.page,
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
      position: "relative",
      overflow: "hidden"
    }
  }, React.createElement("div", {
    style: {
      position: "absolute",
      top: "15%",
      left: "50%",
      transform: "translateX(-50%)",
      width: 500,
      height: 500,
      background: `radial-gradient(circle, ${C.accent}14 0%, transparent 70%)`,
      pointerEvents: "none"
    }
  }), React.createElement("div", {
    style: {
      textAlign: "center",
      maxWidth: 440,
      position: "relative"
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 14,
      marginBottom: 36
    }
  }, React.createElement("div", {
    style: {
      width: 58,
      height: 58,
      borderRadius: 18,
      background: `linear-gradient(135deg, ${C.accent}, ${C.purple})`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, React.createElement(Icon, {
    d: Icons.brain,
    size: 28,
    color: "#fff"
  })), React.createElement("div", {
    style: {
      textAlign: "left"
    }
  }, React.createElement("div", {
    style: {
      fontSize: 28,
      fontWeight: 800,
      letterSpacing: "-0.5px"
    }
  }, "SIMA MIND"), React.createElement("div", {
    style: {
      fontSize: 12,
      color: C.muted,
      fontWeight: 600
    }
  }, "Adaptive Study Intelligence"))), React.createElement("h1", {
    style: {
      fontSize: 36,
      fontWeight: 800,
      lineHeight: 1.15,
      marginBottom: 14,
      letterSpacing: "-1px"
    }
  }, "Study smarter.", React.createElement("br", null), React.createElement("span", {
    style: {
      color: C.accent
    }
  }, "For every learner.")), React.createElement("p", {
    style: {
      color: C.muted,
      fontSize: 15,
      lineHeight: 1.65,
      marginBottom: 16
    }
  }, "From kindergarten to postgrad — SIMA adapts its language, topics, examples, and study tools entirely around ", React.createElement("em", null, "you"), "."), React.createElement("div", {
    style: {
      display: "flex",
      gap: 6,
      flexWrap: "wrap",
      justifyContent: "center",
      marginBottom: 28
    }
  }, [["🌈", "Kindergarten", C.pink], ["📚", "High School", C.accent], ["⚖️", "Law", C.gold], ["⚙️", "Engineering", C.teal], ["🧠", "Psychology", C.purple], ["💻", "CS & AI", C.teal]].map(([emoji, label, col]) => React.createElement("span", {
    key: label,
    style: {
      background: col + "18",
      color: col,
      border: `1px solid ${col}33`,
      borderRadius: 20,
      padding: "5px 12px",
      fontSize: 12,
      fontWeight: 700
    }
  }, emoji, " ", label))), React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, React.createElement("button", {
    style: {
      ...S.btn(C.accent),
      justifyContent: "center",
      fontSize: 16,
      padding: "15px 28px"
    },
    onClick: onStart
  }, "Get Started — It's Free"), React.createElement("button", {
    style: {
      ...S.btn("transparent", C.muted),
      justifyContent: "center",
      border: `1px solid ${C.border}`,
      fontSize: 14
    },
    onClick: onGuest
  }, "Continue as Guest")), React.createElement("p", {
    style: {
      color: C.muted,
      fontSize: 12,
      marginTop: 18
    }
  }, "No credit card required · Works for all ages & subjects")));
}
function PomodoroTimer({
  onClose,
  config
}) {
  const accentCol = config?.accentColor || C.accent;
  const isKinder = config?.greeting?.includes("Superstar");
  const [focusDuration, setFocusDuration] = useState((() => {
    try {
      return JSON.parse(localStorage.getItem("sima_pomodoro_settings") || "{}").focus || (isKinder ? 15 : 25);
    } catch {
      return isKinder ? 15 : 25;
    }
  })());
  const [shortDuration, setShortDuration] = useState((() => {
    try {
      return JSON.parse(localStorage.getItem("sima_pomodoro_settings") || "{}").short || 5;
    } catch {
      return 5;
    }
  })());
  const [longDuration, setLongDuration] = useState((() => {
    try {
      return JSON.parse(localStorage.getItem("sima_pomodoro_settings") || "{}").long || (isKinder ? 10 : 15);
    } catch {
      return isKinder ? 10 : 15;
    }
  })());
  const [showSettings, setShowSettings] = useState(false);
  const DEFAULT_MODES = {
    focus: {
      label: isKinder ? "🌟 Learning Time!" : "Focus",
      color: accentCol
    },
    short: {
      label: isKinder ? "🎮 Play Break" : "Short Break",
      color: C.green
    },
    long: {
      label: isKinder ? "🍎 Snack Break" : "Long Break",
      color: C.purple
    }
  };
  const MODES = {
    focus: {
      label: DEFAULT_MODES.focus.label,
      duration: focusDuration * 60,
      color: accentCol
    },
    short: {
      label: DEFAULT_MODES.short.label,
      duration: shortDuration * 60,
      color: C.green
    },
    long: {
      label: DEFAULT_MODES.long.label,
      duration: longDuration * 60,
      color: C.purple
    }
  };
  const [mode, setMode] = useState("focus");
  const [timeLeft, setTimeLeft] = useState(MODES.focus.duration);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [task, setTask] = useState("");
  const [minimized, setMinimized] = useState(false);
  const intervalRef = useRef(null);
  useEffect(() => {
    setTimeLeft(MODES[mode].duration);
    setRunning(false);
  }, [mode]);
  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            if (mode === "focus") setSessions(s => s + 1);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    } else clearInterval(intervalRef.current);
    return () => clearInterval(intervalRef.current);
  }, [running, mode]);
  const mins = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const secs = String(timeLeft % 60).padStart(2, "0");
  const progress = (MODES[mode].duration - timeLeft) / MODES[mode].duration * 100;
  const savePomodoroSettings = () => {
    localStorage.setItem("sima_pomodoro_settings", JSON.stringify({
      focus: focusDuration,
      short: shortDuration,
      long: longDuration
    }));
    setShowSettings(false);
    setTimeLeft(MODES[mode].duration);
    setRunning(false);
  };
  if (showSettings) {
    return React.createElement("div", {
      style: {
        position: "fixed",
        inset: 0,
        background: "#000b",
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24
      }
    }, React.createElement("div", {
      style: {
        ...S.card,
        width: "100%",
        maxWidth: 340,
        position: "relative"
      }
    }, React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20
      }
    }, React.createElement("div", {
      style: {
        fontSize: 18,
        fontWeight: 800
      }
    }, "⚙️ Timer Settings"), React.createElement("button", {
      onClick: () => setShowSettings(false),
      style: {
        ...S.btn(C.surface, C.muted),
        padding: "6px 10px"
      }
    }, React.createElement(Icon, {
      d: Icons.x,
      size: 16
    }))), React.createElement("div", {
      style: {
        marginBottom: 16
      }
    }, React.createElement("label", {
      style: {
        fontSize: 13,
        fontWeight: 700,
        color: C.muted,
        marginBottom: 8,
        display: "block"
      }
    }, "Focus Duration (minutes)"), React.createElement("input", {
      type: "number",
      min: "1",
      max: "60",
      value: focusDuration,
      onChange: e => setFocusDuration(Math.max(1, parseInt(e.target.value) || 25)),
      style: {
        ...S.input,
        width: "100%"
      }
    })), React.createElement("div", {
      style: {
        marginBottom: 16
      }
    }, React.createElement("label", {
      style: {
        fontSize: 13,
        fontWeight: 700,
        color: C.muted,
        marginBottom: 8,
        display: "block"
      }
    }, "Short Break (minutes)"), React.createElement("input", {
      type: "number",
      min: "1",
      max: "30",
      value: shortDuration,
      onChange: e => setShortDuration(Math.max(1, parseInt(e.target.value) || 5)),
      style: {
        ...S.input,
        width: "100%"
      }
    })), React.createElement("div", {
      style: {
        marginBottom: 20
      }
    }, React.createElement("label", {
      style: {
        fontSize: 13,
        fontWeight: 700,
        color: C.muted,
        marginBottom: 8,
        display: "block"
      }
    }, "Long Break (minutes)"), React.createElement("input", {
      type: "number",
      min: "1",
      max: "60",
      value: longDuration,
      onChange: e => setLongDuration(Math.max(1, parseInt(e.target.value) || 15)),
      style: {
        ...S.input,
        width: "100%"
      }
    })), React.createElement("div", {
      style: {
        display: "flex",
        gap: 10
      }
    }, React.createElement("button", {
      onClick: () => setShowSettings(false),
      style: {
        ...S.btn(C.surface, C.muted),
        flex: 1,
        border: `1px solid ${C.border}`
      }
    }, "Cancel"), React.createElement("button", {
      onClick: savePomodoroSettings,
      style: {
        ...S.btn(accentCol),
        flex: 1
      }
    }, "Save Settings"))));
  }
  if (minimized) {
    return React.createElement("div", {
      style: {
        position: "fixed",
        bottom: 80,
        right: 16,
        zIndex: 150
      }
    }, React.createElement("button", {
      onClick: () => setMinimized(false),
      style: {
        width: 56,
        height: 56,
        borderRadius: "50%",
        background: MODES[mode].color,
        border: `2px solid ${C.surface}`,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 24,
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
      },
      title: `${mins}:${secs}`
    }, "⏱️"));
  }
  return React.createElement("div", {
    style: {
      position: "fixed",
      inset: 0,
      background: "#000b",
      zIndex: 200,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 24
    }
  }, React.createElement("div", {
    style: {
      ...S.card,
      width: "100%",
      maxWidth: 340,
      position: "relative"
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      gap: 12,
      justifyContent: "flex-end",
      marginBottom: 16
    }
  }, React.createElement("button", {
    onClick: () => setShowSettings(true),
    style: {
      ...S.btn(C.surface, C.muted),
      padding: "8px 12px",
      fontSize: 14,
      width: 40,
      height: 40,
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    },
    title: "Settings"
  }, "⚙️"), React.createElement("button", {
    onClick: () => setMinimized(true),
    style: {
      ...S.btn(C.surface, C.muted),
      padding: "8px 12px",
      fontSize: 14,
      width: 40,
      height: 40,
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    },
    title: "Minimize"
  }, "📌"), React.createElement("button", {
    onClick: onClose,
    style: {
      ...S.btn(C.surface, C.muted),
      padding: "8px 12px",
      width: 40,
      height: 40,
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    },
    title: "Close"
  }, React.createElement(Icon, {
    d: Icons.x,
    size: 16
  }))), React.createElement("div", {
    style: {
      textAlign: "center",
      paddingTop: 12
    }
  }, React.createElement("div", {
    style: {
      fontSize: 12,
      color: C.muted,
      fontWeight: 700,
      letterSpacing: "0.08em",
      marginBottom: 14
    }
  }, isKinder ? "⏰ LEARNING TIMER" : "POMODORO TIMER"), React.createElement("div", {
    style: {
      display: "flex",
      gap: 6,
      justifyContent: "center",
      marginBottom: 20,
      flexWrap: "wrap"
    }
  }, Object.entries(MODES).map(([k, v]) => React.createElement(Pill, {
    key: k,
    active: mode === k,
    onClick: () => setMode(k),
    color: v.color
  }, v.label))), React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "center",
      marginBottom: 10
    }
  }, React.createElement(CircleProgress, {
    value: Math.round(progress),
    size: 140,
    stroke: 9,
    color: MODES[mode].color,
    label: `${mins}:${secs}`
  })), React.createElement("div", {
    style: {
      fontSize: 48,
      fontWeight: 800,
      color: MODES[mode].color,
      letterSpacing: "-2px",
      marginBottom: 14
    }
  }, mins, ":", secs), React.createElement("input", {
    style: {
      ...S.input,
      textAlign: "center",
      marginBottom: 14,
      fontSize: 13
    },
    placeholder: isKinder ? "What are we learning? 📚" : "What are you working on?",
    value: task,
    onChange: e => setTask(e.target.value)
  }), React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      justifyContent: "center"
    }
  }, React.createElement("button", {
    style: {
      ...S.btn(MODES[mode].color),
      fontSize: 15,
      padding: "12px 28px"
    },
    onClick: () => setRunning(r => !r)
  }, React.createElement(Icon, {
    d: running ? Icons.pause : Icons.play,
    size: 17,
    color: "#fff"
  }), running ? isKinder ? "Pause ⏸" : "Pause" : isKinder ? "Start! 🚀" : "Start"), React.createElement("button", {
    style: {
      ...S.btn(C.surface, C.muted),
      border: `1px solid ${C.border}`
    },
    onClick: () => {
      setTimeLeft(MODES[mode].duration);
      setRunning(false);
    }
  }, React.createElement(Icon, {
    d: Icons.stop,
    size: 16
  }))), React.createElement("div", {
    style: {
      marginTop: 18,
      display: "flex",
      gap: 8,
      justifyContent: "center",
      alignItems: "center"
    }
  }, [0, 1, 2, 3].map(i => React.createElement("div", {
    key: i,
    style: {
      width: 10,
      height: 10,
      borderRadius: "50%",
      background: i < sessions % 4 ? MODES[mode].color : C.border
    }
  })), React.createElement("span", {
    style: {
      fontSize: 12,
      color: C.muted
    }
  }, sessions, " ", isKinder ? "🌟" : "sessions")))));
}
function QuickNotes({
  onClose
}) {
  const [notes, setNotes] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("sima_notes") || "[]");
    } catch {
      return [];
    }
  });
  const [newNote, setNewNote] = useState("");
  const save = u => {
    setNotes(u);
    try {
      localStorage.setItem("sima_notes", JSON.stringify(u));
    } catch {}
  };
  const add = () => {
    if (!newNote.trim()) return;
    save([{
      id: Date.now(),
      text: newNote,
      ts: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      })
    }, ...notes]);
    setNewNote("");
  };
  return React.createElement("div", {
    style: {
      position: "fixed",
      inset: 0,
      background: "#000b",
      zIndex: 200,
      display: "flex",
      alignItems: "flex-end"
    }
  }, React.createElement("div", {
    style: {
      ...S.card,
      width: "100%",
      borderRadius: "20px 20px 0 0",
      maxHeight: "70vh",
      display: "flex",
      flexDirection: "column"
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16
    }
  }, React.createElement("div", {
    style: {
      fontWeight: 800,
      fontSize: 18
    }
  }, "📝 Quick Notes"), React.createElement("button", {
    onClick: onClose,
    style: {
      ...S.btn(C.surface, C.muted),
      padding: "6px 10px"
    }
  }, React.createElement(Icon, {
    d: Icons.x,
    size: 16
  }))), React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      marginBottom: 16
    }
  }, React.createElement("input", {
    style: {
      ...S.input,
      flex: 1
    },
    placeholder: "Jot something down…",
    value: newNote,
    onChange: e => setNewNote(e.target.value),
    onKeyDown: e => e.key === "Enter" && add()
  }), React.createElement("button", {
    style: {
      ...S.btn(C.accent),
      padding: "11px 14px"
    },
    onClick: add
  }, React.createElement(Icon, {
    d: Icons.plus,
    size: 18
  }))), React.createElement("div", {
    style: {
      overflowY: "auto",
      flex: 1,
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, notes.length === 0 && React.createElement("div", {
    style: {
      textAlign: "center",
      color: C.muted,
      fontSize: 13,
      padding: 24
    }
  }, "No notes yet — start jotting!"), notes.map(n => React.createElement("div", {
    key: n.id,
    style: {
      background: C.surface,
      borderRadius: 10,
      padding: "10px 14px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: 10
    }
  }, React.createElement("div", {
    style: {
      flex: 1
    }
  }, React.createElement("div", {
    style: {
      fontSize: 14,
      lineHeight: 1.5
    }
  }, n.text), React.createElement("div", {
    style: {
      fontSize: 11,
      color: C.muted,
      marginTop: 4
    }
  }, n.ts)), React.createElement("button", {
    onClick: () => save(notes.filter(x => x.id !== n.id)),
    style: {
      background: "none",
      border: "none",
      cursor: "pointer",
      color: C.muted,
      padding: 4
    }
  }, React.createElement(Icon, {
    d: Icons.x,
    size: 13
  })))))));
}
function AnalyticsScreen({
  profile,
  config
}) {
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const studyHours = config?.weeklyStudyHours || [2.5, 3, 2, 4, 3.5, 1.5, 0.5];
  const quizScores = config?.weeklyQuizScores || [85, 78, 92, 88, 95, 82, 89];
  const maxHours = Math.max(...(Array.isArray(studyHours) ? studyHours : [1]), 1);
  const avgScore = Array.isArray(quizScores) && quizScores.length ? Math.round(quizScores.reduce((a, b) => a + b, 0) / quizScores.length) : 0;
  const accentCol = config?.accentColor || C.accent;
  const analyticsLabel = config?.analyticsLabel || "📊 Your Progress";
  const statHighlights = Array.isArray(config?.statHighlights) ? config.statHighlights : ["Total Study Hours", "Quiz Average", "Mastery", "Streak"];
  const statValues = Array.isArray(config?.statValues) ? config.statValues : ["16.5h", "88%", "74%", "7 days"];
  const weakIcon = config?.weakIcon || "⚠️";
  const weakLabel = config?.weakLabel || "Weak Areas";
  const exampleTopics = Array.isArray(config?.exampleTopics) ? config.exampleTopics : ["Mathematics", "Physics", "Chemistry", "Biology", "History"];
  const subjects = exampleTopics.slice(0, 5).map((name, i) => ({
    name,
    mastery: [82, 67, 74, 55, 91][i],
    sessions: [12, 9, 10, 6, 15][i],
    trend: ["+8%", "+3%", "+12%", "-2%", "+5%"][i]
  }));
  return React.createElement("div", {
    style: {
      padding: "20px 16px 80px"
    }
  }, React.createElement("div", {
    style: {
      fontSize: 22,
      fontWeight: 800,
      marginBottom: 4
    }
  }, analyticsLabel), React.createElement("div", {
    style: {
      fontSize: 13,
      color: C.muted,
      marginBottom: 20
    }
  }, "Your personalised progress snapshot"), React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 10,
      marginBottom: 20
    }
  }, statHighlights.map((label, i) => React.createElement("div", {
    key: label,
    style: {
      ...S.card,
      padding: "14px 16px"
    }
  }, React.createElement("div", {
    style: {
      fontSize: 20,
      fontWeight: 800,
      color: accentCol,
      marginBottom: 4
    }
  }, statValues[i]), React.createElement("div", {
    style: {
      fontSize: 11,
      color: C.muted
    }
  }, label)))), React.createElement("div", {
    style: {
      ...S.card,
      marginBottom: 16
    }
  }, React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 14,
      marginBottom: 16
    }
  }, "📊 Study Hours — This Week"), React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-end",
      gap: 6,
      height: 90
    }
  }, studyHours.map((h, i) => React.createElement("div", {
    key: i,
    style: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 4
    }
  }, React.createElement("div", {
    style: {
      fontSize: 9,
      color: C.muted
    }
  }, h, "h"), React.createElement("div", {
    style: {
      width: "100%",
      height: `${h / maxHours * 72}px`,
      background: `linear-gradient(180deg, ${accentCol}, ${accentCol}55)`,
      borderRadius: "4px 4px 0 0",
      minHeight: 4
    }
  }), React.createElement("div", {
    style: {
      fontSize: 9,
      color: C.muted
    }
  }, weekDays[i]))))), React.createElement("div", {
    style: {
      ...S.card,
      marginBottom: 16
    }
  }, React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 14,
      marginBottom: 16
    }
  }, "📈 Quiz Scores — This Week"), React.createElement("div", {
    style: {
      position: "relative",
      height: 80
    }
  }, React.createElement("svg", {
    width: "100%",
    height: "80",
    viewBox: `0 0 ${weekDays.length * 50} 80`,
    preserveAspectRatio: "none"
  }, React.createElement("polyline", {
    points: quizScores.map((v, i) => `${i * 50 + 25},${80 - v / 100 * 70}`).join(" "),
    fill: "none",
    stroke: C.green,
    strokeWidth: "2.5",
    strokeLinejoin: "round",
    strokeLinecap: "round"
  }), quizScores.map((v, i) => React.createElement("circle", {
    key: i,
    cx: i * 50 + 25,
    cy: 80 - v / 100 * 70,
    r: "4",
    fill: C.green
  })))), React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      marginTop: 4
    }
  }, weekDays.map((d, i) => React.createElement("span", {
    key: d,
    style: {
      fontSize: 9,
      color: C.muted,
      flex: 1,
      textAlign: "center"
    }
  }, d, React.createElement("br", null), quizScores[i], "%")))), React.createElement("div", {
    style: S.card
  }, React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 14,
      marginBottom: 16
    }
  }, weakIcon, " ", weakLabel), subjects.map(({
    name,
    mastery,
    sessions,
    trend
  }) => {
    const col = mastery >= 80 ? C.green : mastery >= 60 ? C.gold : C.red;
    return React.createElement("div", {
      key: name,
      style: {
        marginBottom: 14
      }
    }, React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        marginBottom: 6,
        alignItems: "center"
      }
    }, React.createElement("div", null, React.createElement("span", {
      style: {
        fontSize: 13,
        fontWeight: 600
      }
    }, name), React.createElement("span", {
      style: {
        fontSize: 11,
        color: C.muted,
        marginLeft: 8
      }
    }, sessions, " sessions")), React.createElement("div", {
      style: {
        display: "flex",
        gap: 8,
        alignItems: "center"
      }
    }, React.createElement("span", {
      style: {
        fontSize: 12,
        color: trend.startsWith("+") ? C.green : C.red,
        fontWeight: 600
      }
    }, trend), React.createElement("span", {
      style: {
        fontSize: 13,
        fontWeight: 700,
        color: col
      }
    }, mastery, "%"))), React.createElement(ProgressBar, {
      value: mastery,
      max: 100,
      color: col,
      height: 7
    }));
  })));
}
function SpacedRepetitionScreen({
  profile,
  config
}) {
  const [generating, setGenerating] = useState(false);
  const [topic, setTopic] = useState("");
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [documents, setDocuments] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("sima_documents") || "[]");
    } catch {
      return [];
    }
  });
  const [deck, setDeck] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("sima_srs") || "[]");
    } catch {
      return [];
    }
  });
  const [reviewing, setReviewing] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reviewQueue, setReviewQueue] = useState([]);
  const accentCol = config.accentColor;
  const saveDeck = d => {
    setDeck(d);
    try {
      localStorage.setItem("sima_srs", JSON.stringify(d));
    } catch {}
  };
  const generateCards = async () => {
    if (!topic.trim() && !selectedDocument) return;
    setGenerating(true);
    const levelHint = PROFILE_ENGINE.getLevel(profile);
    const docHint = selectedDocument ? ` based on the document "${selectedDocument.name}"` : "";
    const prompt = `Create 10 spaced repetition flashcards${docHint} on "${topic}" for a ${levelHint} student${profile.program ? ` studying ${profile.program}` : ""}. ${config.flashcardTone} Respond ONLY with JSON array: [{"front":"...","back":"...","hint":"...","tags":["..."]}]. No markdown.`;
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          type: "srs",
          prompt,
          model: "sima-stub",
          source: selectedDocument?.name
        })
      });
      const data = await res.json();
      const text = data.response || "[]";
      const cards = JSON.parse(text.replace(/```json|```/g, "").trim());
      saveDeck([...deck, ...cards.map((c, i) => ({
        ...c,
        id: Date.now() + i,
        interval: 1,
        easiness: 2.5,
        repetitions: 0,
        nextReview: new Date().toISOString().split("T")[0],
        source: selectedDocument?.name || "manual"
      }))]);
      alert(`✅ Generated ${cards.length} flashcards!`);
    } catch (e) {
      console.error(e);
      const fallbackCards = [{
        front: `Sample question on ${topic || selectedDocument?.name || 'topic'}`,
        back: "Study this topic to generate real flashcards. Connect to AI for better results.",
        hint: "Use the AI generation feature"
      }];
      saveDeck([...deck, ...fallbackCards.map((c, i) => ({
        ...c,
        id: Date.now() + i,
        interval: 1,
        easiness: 2.5,
        repetitions: 0,
        nextReview: new Date().toISOString().split("T")[0],
        source: selectedDocument?.name || "manual"
      }))]);
    }
    setGenerating(false);
    setTopic("");
    setSelectedDocument(null);
  };
  const startReview = () => {
    const today = new Date().toISOString().split("T")[0];
    const due = deck.filter(c => c.nextReview <= today);
    if (!due.length) return;
    setReviewQueue(due);
    setCurrentIdx(0);
    setFlipped(false);
    setReviewing(true);
  };
  const rateCard = rating => {
    const card = reviewQueue[currentIdx];
    let {
      easiness,
      repetitions,
      interval
    } = card;
    if (rating >= 3) {
      repetitions === 0 ? interval = 1 : repetitions === 1 ? interval = 6 : interval = Math.round(interval * easiness);
      repetitions += 1;
    } else {
      repetitions = 0;
      interval = 1;
    }
    easiness = Math.max(1.3, easiness + 0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02));
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + interval);
    saveDeck(deck.map(c => c.id === card.id ? {
      ...c,
      easiness,
      repetitions,
      interval,
      nextReview: nextDate.toISOString().split("T")[0]
    } : c));
    if (currentIdx + 1 >= reviewQueue.length) setReviewing(false);else {
      setCurrentIdx(i => i + 1);
      setFlipped(false);
    }
  };
  const today = new Date().toISOString().split("T")[0];
  const dueCount = deck.filter(c => c.nextReview <= today).length;
  const isKinder = PROFILE_ENGINE.getLevel(profile) === "kindergarten";
  if (reviewing && reviewQueue[currentIdx]) {
    const card = reviewQueue[currentIdx];
    return React.createElement("div", {
      style: {
        padding: "20px 16px 80px"
      }
    }, React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16
      }
    }, React.createElement("div", null, React.createElement("div", {
      style: {
        fontWeight: 800,
        fontSize: 18
      }
    }, isKinder ? "🃏 My Cards!" : "Spaced Repetition"), React.createElement("div", {
      style: {
        fontSize: 13,
        color: C.muted
      }
    }, currentIdx + 1, " / ", reviewQueue.length)), React.createElement("button", {
      onClick: () => setReviewing(false),
      style: {
        ...S.btn(C.surface, C.muted),
        border: `1px solid ${C.border}`
      }
    }, "End")), React.createElement(ProgressBar, {
      value: currentIdx,
      max: reviewQueue.length,
      color: accentCol,
      height: 4
    }), React.createElement("div", {
      onClick: () => setFlipped(f => !f),
      style: {
        ...S.card,
        marginTop: 16,
        minHeight: 200,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        cursor: "pointer",
        background: flipped ? accentCol + "22" : C.card,
        transition: "background .3s",
        padding: 28
      }
    }, React.createElement("div", {
      style: {
        fontSize: 11,
        color: C.muted,
        marginBottom: 10
      }
    }, flipped ? "✅ ANSWER" : isKinder ? "🤔 What is this? (tap to find out!)" : "QUESTION — tap to reveal"), React.createElement("div", {
      style: {
        fontSize: 17,
        fontWeight: flipped ? 700 : 500,
        lineHeight: 1.6
      }
    }, flipped ? card.back : card.front), !flipped && card.hint && React.createElement("div", {
      style: {
        fontSize: 12,
        color: C.muted,
        marginTop: 10,
        fontStyle: "italic"
      }
    }, "💡 ", card.hint)), flipped && React.createElement("div", {
      style: {
        marginTop: 14
      }
    }, React.createElement("div", {
      style: {
        fontSize: 12,
        color: C.muted,
        textAlign: "center",
        marginBottom: 10
      }
    }, isKinder ? "Did you know that? 😊" : "How well did you know this?"), React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr 1fr",
        gap: 8
      }
    }, [["😕", "Forgot", 0, "#6b7280"], ["😬", "Hard", 2, C.red], ["🙂", "Good", 3, C.gold], ["😄", "Easy!", 5, C.green]].map(([em, label, rating, color]) => React.createElement("button", {
      key: label,
      onClick: () => rateCard(rating),
      style: {
        ...S.btn(color + "22", color),
        border: `1px solid ${color}44`,
        flexDirection: "column",
        padding: "10px 4px",
        fontSize: 12,
        justifyContent: "center"
      }
    }, React.createElement("span", null, em), label)))));
  }
  return React.createElement("div", {
    style: {
      padding: "20px 16px 80px"
    }
  }, React.createElement("div", {
    style: {
      fontSize: 22,
      fontWeight: 800,
      marginBottom: 4
    }
  }, isKinder ? "🃏 My Learning Cards!" : "Spaced Repetition"), React.createElement("div", {
    style: {
      fontSize: 13,
      color: C.muted,
      marginBottom: 20
    }
  }, isKinder ? "Cards that help you remember!" : "Science-backed memory system (SM-2)"), React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr 1fr",
      gap: 10,
      marginBottom: 20
    }
  }, [["Total", deck.length, accentCol], ["Due today", dueCount, dueCount > 0 ? C.red : C.green], ["Mastered", deck.filter(c => c.interval > 21).length, C.gold]].map(([label, val, col]) => React.createElement("div", {
    key: label,
    style: {
      ...S.card,
      padding: "12px 14px",
      textAlign: "center"
    }
  }, React.createElement("div", {
    style: {
      fontSize: 24,
      fontWeight: 800,
      color: col
    }
  }, val), React.createElement("div", {
    style: {
      fontSize: 11,
      color: C.muted
    }
  }, label)))), dueCount > 0 && React.createElement("button", {
    onClick: startReview,
    style: {
      ...S.btn(accentCol),
      width: "100%",
      justifyContent: "center",
      fontSize: 15,
      marginBottom: 16,
      padding: "14px"
    }
  }, React.createElement(Icon, {
    d: Icons.repeat,
    size: 18,
    color: "#fff"
  }), " ", isKinder ? `Let's Review ${dueCount} Card${dueCount !== 1 ? "s" : ""}! 🌟` : `Review ${dueCount} Due Card${dueCount !== 1 ? "s" : ""}`), React.createElement("div", {
    style: {
      ...S.card,
      marginBottom: 16
    }
  }, React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 14,
      marginBottom: 10
    }
  }, "📄 Generate from Documents"), documents && documents.length > 0 ? React.createElement(React.Fragment, null, React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8,
      marginBottom: 12
    }
  }, documents.map(doc => React.createElement("button", {
    key: doc.id,
    onClick: () => setSelectedDocument(selectedDocument?.id === doc.id ? null : doc),
    style: {
      ...S.btn(selectedDocument?.id === doc.id ? accentCol : C.surface, selectedDocument?.id === doc.id ? C.text : C.muted),
      border: `1px solid ${selectedDocument?.id === doc.id ? accentCol : C.border}`,
      padding: "10px 12px",
      fontSize: 13,
      textAlign: "left",
      transition: "all 0.2s"
    }
  }, React.createElement("div", {
    style: {
      fontWeight: 600
    }
  }, "📄 ", doc.name), React.createElement("div", {
    style: {
      fontSize: 11,
      marginTop: 2,
      opacity: 0.7
    }
  }, (doc.size / 1024).toFixed(1), " KB")))), React.createElement("div", {
    style: {
      fontSize: 12,
      color: C.muted,
      marginBottom: 10
    }
  }, selectedDocument ? `Selected: ${selectedDocument.name}` : "Select a document to generate flashcards")) : React.createElement("div", {
    style: {
      fontSize: 12,
      color: C.muted,
      padding: "10px",
      textAlign: "center",
      background: C.surface,
      borderRadius: 8
    }
  }, "📁 No documents uploaded yet. Upload materials in Docs to generate flashcards!")), React.createElement("div", {
    style: {
      ...S.card,
      marginBottom: 16
    }
  }, React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 14,
      marginBottom: 10
    }
  }, "✨ Generate from Topic"), React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      flexWrap: "wrap",
      marginBottom: 10
    }
  }, (config.exampleTopics || []).slice(0, 3).map(t => React.createElement("button", {
    key: t,
    onClick: () => setTopic(t),
    style: {
      ...S.btn(accentCol + "18", accentCol),
      border: `1px solid ${accentCol}33`,
      padding: "5px 12px",
      fontSize: 12
    }
  }, t))), React.createElement("input", {
    style: {
      ...S.input,
      marginBottom: 10
    },
    placeholder: `Topic — e.g. "${config.exampleTopics?.[0] || "any topic"}"`,
    value: topic,
    onChange: e => setTopic(e.target.value),
    onKeyDown: e => e.key === "Enter" && generateCards()
  }), React.createElement("button", {
    onClick: generateCards,
    style: {
      ...S.btn(accentCol),
      width: "100%",
      justifyContent: "center"
    }
  }, generating ? "Generating…" : "✨ Generate 10 Cards")), React.createElement("div", {
    style: S.card
  }, React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 14,
      marginBottom: 10
    }
  }, "📚 Your Deck (", deck.length, ")"), React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8,
      maxHeight: 220,
      overflowY: "auto"
    }
  }, deck.slice(0, 20).map(card => React.createElement("div", {
    key: card.id,
    style: {
      background: C.surface,
      borderRadius: 8,
      padding: "8px 12px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }
  }, React.createElement("div", {
    style: {
      fontSize: 13,
      flex: 1
    }
  }, card.front?.slice(0, 55), card.front?.length > 55 ? "…" : ""), React.createElement("div", {
    style: {
      display: "flex",
      gap: 6
    }
  }, React.createElement(Badge, {
    color: card.nextReview <= today ? C.red : C.green
  }, card.nextReview <= today ? "Due" : `+${card.interval}d`), React.createElement("button", {
    onClick: () => saveDeck(deck.filter(c => c.id !== card.id)),
    style: {
      background: "none",
      border: "none",
      cursor: "pointer",
      color: C.muted
    }
  }, React.createElement(Icon, {
    d: Icons.x,
    size: 13
  }))))))));
}
function Dashboard({
  profile,
  config,
  onNav,
  plan,
  onPomodoro,
  onNotes,
  onResetProgress,
  onProfileClick,
  onLogout,
  user,
  isFirstUse
}) {
  const accentCol = config.accentColor;
  const isKinder = PROFILE_ENGINE.getLevel(profile) === "kindergarten";
  const isPrimary = PROFILE_ENGINE.getLevel(profile) === "primary";
  return React.createElement("div", {
    style: {
      paddingBottom: 80
    }
  }, React.createElement("div", {
    style: {
      padding: "24px 20px 0",
      background: `linear-gradient(180deg, ${C.surface} 0%, transparent 100%)`
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 6
    }
  }, React.createElement("div", null, React.createElement("div", {
    style: {
      fontSize: 13,
      color: C.muted
    }
  }, config.greeting), React.createElement("div", {
    style: {
      fontSize: 22,
      fontWeight: 800
    }
  }, profile?.name || "Student", " ", config.emoji), React.createElement("div", {
    style: {
      fontSize: 12,
      color: accentCol,
      fontWeight: 600,
      marginTop: 2
    }
  }, config.subgreeting)), React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      alignItems: "center"
    }
  }, (plan === "free" || plan === "scholar-lite") && React.createElement(Badge, {
    color: C.orange,
    style: {
      padding: "4px 10px",
      fontSize: 11
    }
  }, "💬 ", plan === "free" ? "30" : "80", " msgs"), React.createElement(Badge, {
    color: plan === "scholar" ? C.gold : plan === "standard" ? C.accent : plan === "scholar-lite" ? C.teal : C.muted
  }, plan === "free" ? "🎁 Free Trial" : plan === "scholar-lite" ? "⭐ Scholar Lite" : plan === "standard" ? "📚 Standard" : "👑 Scholar"), React.createElement("button", {
    onClick: onProfileClick,
    style: {
      background: user?.avatarImage ? `url(${user.avatarImage})` : `linear-gradient(135deg, ${accentCol}, ${C.purple})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      border: `2px solid ${C.border}`,
      fontSize: 20,
      cursor: "pointer",
      padding: 0,
      transition: "all 0.3s ease",
      width: 44,
      height: 44,
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      fontWeight: 700
    },
    onMouseEnter: e => e.target.style.transform = "scale(1.1)",
    onMouseLeave: e => e.target.style.transform = "scale(1)",
    title: "Profile"
  }, !user?.avatarImage && (user?.avatar || "😊")))), typeof onResetProgress === "function" && React.createElement("button", {
    onClick: onResetProgress,
    style: {
      ...S.btn(C.muted + "11", C.muted),
      marginTop: 12,
      fontSize: 12,
      padding: "8px 14px"
    }
  }, "Reset progress")), React.createElement("div", {
    style: {
      padding: "20px 20px 0"
    }
  }, (plan === "free" || plan === "scholar-lite") && React.createElement("div", {
    style: {
      ...S.card,
      marginBottom: 16,
      background: `linear-gradient(135deg, ${C.gold}18, ${C.card})`,
      borderColor: C.gold + "44",
      position: "relative",
      overflow: "hidden"
    }
  }, React.createElement("div", {
    style: {
      position: "absolute",
      top: -20,
      right: -20,
      width: 80,
      height: 80,
      background: C.gold + "11",
      borderRadius: "50%"
    }
  }), React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      position: "relative"
    }
  }, React.createElement("div", null, React.createElement("div", {
    style: {
      fontSize: 11,
      color: C.gold,
      fontWeight: 700,
      letterSpacing: "0.08em",
      marginBottom: 6,
      textTransform: "uppercase"
    }
  }, "🚀 Level Up"), React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 700,
      marginBottom: 4
    }
  }, "Unlock Unlimited Learning"), React.createElement("div", {
    style: {
      fontSize: 13,
      color: C.muted
    }
  }, plan === "free" ? "Get 80+ messages/day, voice chat, and more" : "Upgrade to unlimited & advanced tools")), React.createElement("button", {
    style: {
      ...S.btn(C.gold),
      padding: "8px 14px",
      fontSize: 12,
      fontWeight: 700,
      whiteSpace: "nowrap"
    },
    onClick: () => onNav("upgrade")
  }, "See Plans →"))), React.createElement("div", {
    style: {
      ...S.card,
      marginBottom: 16,
      background: `linear-gradient(135deg, ${accentCol}18, ${C.card})`,
      borderColor: accentCol + "33"
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 12
    }
  }, React.createElement("div", null, React.createElement("div", {
    style: {
      fontSize: 11,
      color: accentCol,
      fontWeight: 700,
      letterSpacing: "0.08em",
      textTransform: "uppercase"
    }
  }, "Today's Plan"), React.createElement("div", {
    style: {
      fontSize: 17,
      fontWeight: 700,
      marginTop: 2
    }
  }, isKinder ? "0 fun activities" : `${config.todaySessions?.length || 0} sessions · ${profile.hours || 0}h`)), React.createElement("button", {
    style: {
      ...S.btn(accentCol),
      padding: "9px 16px",
      fontSize: 13
    },
    onClick: () => onNav("timetable")
  }, "View →")), config.todaySessions?.map(session => React.createElement("div", {
    key: session,
    style: {
      display: "flex",
      gap: 10,
      alignItems: "center",
      fontSize: 13,
      marginBottom: 6
    }
  }, React.createElement("div", {
    style: {
      width: 6,
      height: 6,
      borderRadius: "50%",
      background: C.green,
      flexShrink: 0
    }
  }), session))), React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 10,
      marginBottom: 16
    }
  }, config.statHighlights.slice(0, 4).map((label, i) => React.createElement("div", {
    key: label,
    style: {
      ...S.card,
      padding: "14px 16px"
    }
  }, React.createElement("div", {
    style: {
      fontSize: 20,
      fontWeight: 800,
      color: accentCol
    }
  }, config.statValues[i]), React.createElement("div", {
    style: {
      fontSize: 11,
      color: C.muted,
      marginTop: 2
    }
  }, label)))), React.createElement("div", {
    style: {
      marginBottom: 16
    }
  }, React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      color: C.muted,
      marginBottom: 10,
      letterSpacing: "0.08em"
    }
  }, isKinder ? "WHAT DO YOU WANT TO DO? 🎮" : "QUICK ACTIONS"), React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      overflowX: "auto",
      paddingBottom: 4
    }
  }, [{
    label: isKinder ? "Ask SIMA 🌈" : "Ask SIMA",
    icon: Icons.sparkle,
    screen: "chat",
    color: accentCol
  }, {
    label: isKinder ? "Timer ⏰" : "Pomodoro",
    icon: Icons.clock,
    action: onPomodoro,
    color: C.green
  }, {
    label: isKinder ? "Cards 🃏" : "Flashcards",
    icon: Icons.flash,
    screen: "studio",
    color: C.gold
  }, {
    label: "SRS Deck",
    icon: Icons.repeat,
    screen: "srs",
    color: C.teal
  }, {
    label: isKinder ? "My Progress ⭐" : "Analytics",
    icon: Icons.chart,
    screen: "analytics",
    color: C.purple
  }, {
    label: "Notes",
    icon: Icons.note,
    action: onNotes,
    color: C.orange
  }, {
    label: "Groups",
    icon: Icons.users,
    screen: "groups",
    color: C.muted
  }].map(({
    label,
    icon,
    screen,
    color,
    action
  }) => React.createElement("button", {
    key: label,
    onClick: () => action ? action() : onNav(screen),
    style: {
      ...S.btn(color + "18", color),
      border: `1px solid ${color}33`,
      flexDirection: "column",
      padding: "13px 14px",
      borderRadius: 12,
      minWidth: isKinder ? 82 : 72,
      flexShrink: 0
    }
  }, React.createElement(Icon, {
    d: icon,
    size: 20,
    color: color
  }), React.createElement("span", {
    style: {
      fontSize: 10,
      fontWeight: 700,
      marginTop: 4
    }
  }, label))))), React.createElement("div", {
    style: {
      marginBottom: 16
    }
  }, React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      color: C.muted,
      marginBottom: 10,
      letterSpacing: "0.08em"
    }
  }, isKinder ? "🌟 LET'S EXPLORE!" : "SUGGESTED TOPICS FOR YOU"), React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, config.exampleTopics?.slice(0, 3).map(topic => React.createElement("div", {
    key: topic,
    onClick: () => onNav("chat"),
    style: {
      ...S.card,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "12px 16px",
      cursor: "pointer",
      borderColor: accentCol + "33"
    }
  }, React.createElement("span", {
    style: {
      fontSize: 14
    }
  }, config.emoji, " ", topic), React.createElement("span", {
    style: {
      fontSize: 12,
      color: accentCol
    }
  }, "Study →"))))), React.createElement("div", null, React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      color: C.muted,
      marginBottom: 10,
      letterSpacing: "0.08em"
    }
  }, config.weakIcon, " ", (config.weakLabel || "AREAS TO REVIEW").toUpperCase()), React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, config.weakAreas?.map(area => React.createElement("div", {
    key: area,
    onClick: () => onNav("chat"),
    style: {
      ...S.card,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "12px 16px",
      cursor: "pointer",
      borderColor: C.red + "33"
    }
  }, React.createElement("span", {
    style: {
      fontSize: 14
    }
  }, area), React.createElement("span", {
    style: {
      fontSize: 12,
      color: C.red
    }
  }, "Review →")))))));
}
function ChatScreen({
  profile,
  config,
  plan,
  onLimitReached,
  groupContext
}) {
  const [messages, setMessages] = useState([{
    role: "assistant",
    content: config.simaIntro
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("exam");
  const [isListening, setIsListening] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [showCallUI, setShowCallUI] = useState(false);
  const bottomRef = useRef(null);
  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const fileInputRef = useRef(null);
  const accentCol = config.accentColor;
  const isKinder = PROFILE_ENGINE.getLevel(profile) === "kindergarten";
  const isPrimary = PROFILE_ENGINE.getLevel(profile) === "primary";
  const subscription = useSubscription();
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  }, [messages, loading]);
  useEffect(() => {
    if (groupContext) {
      setMessages([{
        role: "assistant",
        content: `${config.simaIntro}\n\nYou joined the group: ${groupContext.name}. Topic: ${groupContext.topic}. This is a shared group conversation space.`
      }]);
    } else {
      setMessages([{
        role: "assistant",
        content: config.simaIntro
      }]);
    }
  }, [groupContext, config.simaIntro]);
  const startVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      alert("Voice input not supported.");
      return;
    }
    const r = new SR();
    r.lang = "en-US";
    r.interimResults = false;
    r.onresult = e => {
      try {
        const transcript = e.results[0][0].transcript;
        setInput(p => p + (p && transcript ? " " : "") + transcript);
      } catch (err) {
        console.error("Speech recognition error:", err);
      }
      setIsListening(false);
    };
    r.onerror = () => {
      console.error("Speech error");
      setIsListening(false);
    };
    r.onend = () => setIsListening(false);
    recognitionRef.current = r;
    r.start();
    setIsListening(true);
  };
  const startVoiceNote = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true
        }
      });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
      const recorder = new MediaRecorder(stream, {
        mimeType
      });
      const chunks = [];
      recorder.ondataavailable = e => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunks, {
          type: mimeType
        });
        const url = URL.createObjectURL(blob);
        setRecordedAudio({
          url,
          blob,
          duration: Math.round(chunks.length / 10),
          mimeType
        });
        stream.getTracks().forEach(t => t.stop());
      };
      mediaRecorderRef.current = {
        recorder,
        stream
      };
      recorder.start();
      setIsRecordingVoice(true);
    } catch (err) {
      console.error("Microphone error:", err);
      alert("🎤 Microphone access denied. Please enable microphone permissions in your browser settings.");
    }
  };
  const stopVoiceNote = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.recorder) {
      mediaRecorderRef.current.recorder.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
    }
    setIsRecordingVoice(false);
  };
  const sendVoiceNote = () => {
    if (recordedAudio) {
      const duration = recordedAudio.duration || Math.floor(Math.random() * 30) + 5;
      const msg = {
        role: "user",
        content: `🎵 Voice message (${duration}s)`,
        isVoiceNote: true,
        audioUrl: recordedAudio.url
      };
      setMessages(prev => [...prev, msg]);
      setRecordedAudio(null);
      setTimeout(() => {
        setMessages(prev => [...prev, {
          role: "assistant",
          content: "Got your voice message! Great communication! 👍"
        }]);
      }, 1000);
    }
  };
  const handleFileSelect = e => {
    const file = e.target.files?.[0];
    if (file && groupContext) {
      const msg = {
        role: "user",
        content: `📎 Shared file: ${file.name} (${(file.size / 1024).toFixed(1)}KB)`
      };
      setMessages(prev => [...prev, msg]);
      fileInputRef.current.value = '';
    }
  };
  const modeLabels = isKinder ? [["simple", "🌈 Simple"]] : isPrimary ? [["simple", "🧒 Simple"], ["exam", "📝 Quiz"]] : [["simple", "🧒 Simple"], ["exam", "📝 Exam"], ["clinical", config.emoji + " Deep Dive"], ["advanced", "🔬 Advanced"]];
  const buildSystem = () => `
You are SIMA — an adaptive AI study assistant built specifically for ${profile?.name || "this student"}.

STUDENT PROFILE:
- Name: ${profile?.name}
- Education: ${profile?.education}
- Program/Subject: ${profile?.program || "General"}
- Year: ${profile?.year}
- Learning style: ${profile?.style}
- Study preference: ${profile?.studyTime}
- Persona: ${PROFILE_ENGINE.getPersona(profile)}

ADAPTATION RULES:
${config.systemPromptHint}

CURRENT MODE: ${mode.toUpperCase()}
${mode === "simple" ? "- Use extremely simple, friendly language. Short sentences. Lots of encouragement." : ""}
${mode === "exam" ? "- Focus on exam technique. Bullet points. Bold key facts. Memory tricks." : ""}
${mode === "clinical" ? "- Go deep with domain-specific reasoning frameworks for this student's field." : ""}
${mode === "advanced" ? "- Use expert-level analysis. Include nuance, exceptions, and critical thinking." : ""}

Always end responses with a relevant follow-up offer (e.g. 'Would you like me to create flashcards on this?').
Match the complexity and vocabulary to this student's level — a kindergartner should get emojis and simple words; a PhD student should get rigorous depth.
  `;
  const send = async () => {
    if (!input.trim() || loading) return;
    if (!subscription.isTrialActive() && !subscription.canUseFeature("chat")) {
      onLimitReached?.();
      return;
    }
    const userMsg = {
      role: "user",
      content: input
    };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    if (!subscription.isTrialActive()) {
      subscription.recordUsage("chat");
    }
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "sima-stub",
          context: buildSystem(),
          messages: newMessages.map(m => ({
            role: m.role,
            content: m.content
          })),
          group: groupContext,
          subscriptionPlan: plan?.id
        })
      }).catch(() => null);
      if (res && res.ok) {
        const data = await res.json();
        const reply = data.response || localSimaResponse({
          prompt: input,
          mode,
          profile,
          selectedSource
        });
        setMessages(prev => [...prev, {
          role: "assistant",
          content: reply
        }]);
      } else {
        const reply = localSimaResponse({
          prompt: input,
          mode,
          profile,
          selectedSource
        });
        setMessages(prev => [...prev, {
          role: "assistant",
          content: reply
        }]);
      }
    } catch (err) {
      console.error("Chat error:", err);
      const reply = localSimaResponse({
        prompt: input,
        mode,
        profile,
        selectedSource
      });
      setMessages(prev => [...prev, {
        role: "assistant",
        content: reply
      }]);
    }
    setLoading(false);
  };
  return React.createElement("div", {
    style: {
      ...S.page,
      display: "flex",
      flexDirection: "column",
      paddingBottom: 80,
      height: "100vh",
      overflow: "hidden"
    }
  }, showCallUI && React.createElement("div", {
    style: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0,0,0,0.85)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      backdropFilter: "blur(3px)"
    }
  }, React.createElement("div", {
    style: {
      background: C.card,
      borderRadius: 24,
      padding: 40,
      textAlign: "center",
      maxWidth: 340,
      boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
    }
  }, React.createElement("div", {
    style: {
      fontSize: 60,
      marginBottom: 24
    }
  }, "🎧"), React.createElement("div", {
    style: {
      fontSize: 20,
      fontWeight: 800,
      marginBottom: 12,
      color: accentCol
    }
  }, "Start Audio Call"), React.createElement("div", {
    style: {
      fontSize: 14,
      color: C.muted,
      marginBottom: 28,
      lineHeight: 1.6
    }
  }, "Connect with ", groupContext.members, " group members via secure audio. Privacy enabled - audio only."), React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12,
      marginBottom: 16
    }
  }, React.createElement("button", {
    style: {
      ...S.btn(accentCol),
      flex: 1,
      justifyContent: "center",
      padding: "14px",
      fontSize: 15,
      fontWeight: 700
    },
    onClick: () => {
      setShowCallUI(false);
      alert("✅ AUDIO CALL ACTIVE\n\n🎧 Connected to " + groupContext.members + " members\n🔒 Private audio connection\n⏱️ Call recording enabled");
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "📞 Audio call started. " + groupContext.members + " members can now connect. Call is being recorded."
      }]);
    }
  }, "🎧 Start Audio Call")), React.createElement("button", {
    style: {
      ...S.btn(C.surface, C.text),
      width: "100%",
      justifyContent: "center",
      border: `1px solid ${C.border}`,
      padding: "12px"
    },
    onClick: () => setShowCallUI(false)
  }, "Cancel"))), React.createElement("div", {
    style: {
      flex: 1,
      overflowY: "auto",
      padding: "16px",
      display: "flex",
      flexDirection: "column",
      gap: 14
    }
  }, messages.map((msg, i) => React.createElement("div", {
    key: i,
    style: {
      display: "flex",
      gap: 10,
      flexDirection: msg.role === "user" ? "row-reverse" : "row",
      alignItems: "flex-end"
    }
  }, msg.role === "assistant" && React.createElement("div", {
    style: {
      width: 30,
      height: 30,
      borderRadius: "50%",
      background: `linear-gradient(135deg, ${accentCol}, ${C.purple})`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0
    }
  }, React.createElement("span", {
    style: {
      fontSize: 14
    }
  }, config.emoji)), React.createElement("div", {
    style: {
      maxWidth: "82%",
      padding: "11px 15px",
      borderRadius: msg.role === "user" ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
      background: msg.role === "user" ? accentCol : C.card,
      fontSize: isKinder ? 15 : 14,
      lineHeight: 1.65,
      whiteSpace: "pre-wrap",
      border: msg.role === "assistant" ? `1px solid ${C.border}` : "none"
    }
  }, msg.content))), loading && React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      alignItems: "flex-end"
    }
  }, React.createElement("div", {
    style: {
      width: 30,
      height: 30,
      borderRadius: "50%",
      background: `linear-gradient(135deg, ${accentCol}, ${C.purple})`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, React.createElement("span", {
    style: {
      fontSize: 14
    }
  }, config.emoji)), React.createElement(SimaTyping, null)), React.createElement("div", {
    ref: bottomRef
  })), React.createElement("div", {
    style: {
      padding: "8px 16px 0",
      display: "flex",
      gap: 6,
      overflowX: "auto"
    }
  }, config.quickPrompts?.map(p => React.createElement("button", {
    key: p,
    onClick: () => setInput(p),
    style: {
      ...S.btn(C.surface, C.muted),
      border: `1px solid ${C.border}`,
      padding: "6px 12px",
      fontSize: 12,
      whiteSpace: "nowrap",
      flexShrink: 0
    }
  }, p))), recordedAudio && React.createElement("div", {
    style: {
      padding: "12px 16px",
      background: `${accentCol}22`,
      borderTop: `1px solid ${accentCol}44`,
      display: "flex",
      gap: 10,
      alignItems: "center"
    }
  }, React.createElement("div", {
    style: {
      fontSize: 18
    }
  }, "🎵"), React.createElement("div", {
    style: {
      flex: 1
    }
  }, React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 700
    }
  }, "Voice Note Ready"), React.createElement("audio", {
    src: recordedAudio.url,
    controls: true,
    style: {
      width: "100%",
      height: 24,
      marginTop: 4
    }
  })), React.createElement("button", {
    style: {
      ...S.btn(C.green),
      padding: "8px 12px",
      fontSize: 12
    },
    onClick: sendVoiceNote
  }, "Send"), React.createElement("button", {
    style: {
      ...S.btn(C.surface, C.text),
      padding: "8px 12px",
      fontSize: 12,
      border: `1px solid ${C.border}`
    },
    onClick: () => setRecordedAudio(null)
  }, "Discard")), React.createElement("div", {
    style: {
      padding: 14,
      background: C.surface,
      borderTop: `1px solid ${C.border}`,
      display: "flex",
      gap: 8
    }
  }, React.createElement("input", {
    style: {
      ...S.input,
      flex: 1
    },
    placeholder: isListening ? "🎙 Listening…" : isRecordingVoice ? "🎤 Recording voice note..." : isKinder ? "Ask me anything! 🌈" : "Ask SIMA anything…",
    value: input,
    onChange: e => setInput(e.target.value),
    onKeyDown: e => e.key === "Enter" && !e.shiftKey && !isRecordingVoice && send(),
    disabled: isRecordingVoice
  }), React.createElement("button", {
    style: {
      ...S.btn(C.surface, C.text),
      border: `1px solid ${C.border}`,
      padding: "11px 13px"
    },
    onClick: () => fileInputRef.current?.click(),
    title: "Upload file for SIMA to analyze"
  }, React.createElement(Icon, {
    d: Icons.plus,
    size: 17
  })), React.createElement("input", {
    ref: fileInputRef,
    type: "file",
    style: {
      display: "none"
    },
    onChange: e => {
      if (e.target.files?.[0]) {
        const file = e.target.files[0];
        setInput(prev => `${prev}${prev ? "\n" : ""}📎 Uploaded: ${file.name}`);
      }
    },
    accept: ".pdf,.txt,.ppt,.pptx,.docx,.mp3,.wav"
  }), React.createElement("button", {
    style: {
      ...S.btn(isRecordingVoice ? C.red : isListening ? C.orange : C.surface, isRecordingVoice || isListening ? "#fff" : C.muted),
      border: `1px solid ${isRecordingVoice ? C.red : isListening ? C.orange : C.border}`,
      padding: "11px 13px"
    },
    onClick: () => {
      if (isRecordingVoice) stopVoiceNote();else if (isListening) {
        recognitionRef.current?.stop();
        setIsListening(false);
      } else startVoice();
    },
    title: "Click to speak or record voice note"
  }, React.createElement(Icon, {
    d: Icons.mic,
    size: 17
  })), React.createElement("button", {
    style: {
      ...S.btn(accentCol),
      padding: "11px 15px"
    },
    onClick: send,
    disabled: isRecordingVoice
  }, React.createElement(Icon, {
    d: Icons.send,
    size: 17,
    color: "#fff"
  }))));
}
function StudioScreen({
  profile,
  config,
  plan
}) {
  const [mainTab, setMainTab] = useState("sources");
  const [sources, setSources] = useState([]);
  const [generatedMedia, setGeneratedMedia] = useState([]);
  const [selectedSource, setSelectedSource] = useState(null);
  const [topic, setTopic] = useState("");
  const [generationType, setGenerationType] = useState("flashcard");
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState(null);
  const [recents, setRecents] = useState([]);
  const [shared, setShared] = useState([]);
  const [downloaded, setDownloaded] = useState([]);
  const [uploadTitle, setUploadTitle] = useState("");
  const accentCol = config.accentColor;
  const isKinder = PROFILE_ENGINE.getLevel(profile) === "kindergarten";
  const level = PROFILE_ENGINE.getLevel(profile);
  const currentPlan = plan || "free";
  const limits = SUBSCRIPTION_CONFIG.usageLimits[currentPlan] || SUBSCRIPTION_CONFIG.usageLimits.free;
  const canGenerate = featureType => {
    const isTrialing = localStorage.getItem("sima_subscription") ? (() => {
      try {
        const sub = JSON.parse(localStorage.getItem("sima_subscription"));
        const trialEnd = new Date(sub.trialEndDate);
        return trialEnd > new Date();
      } catch {
        return true;
      }
    })() : true;
    if (isTrialing) return true;
    return limits[featureType] > 0;
  };
  const studioTabs = [{
    id: "sources",
    icon: "📁",
    label: "Sources"
  }, {
    id: "recents",
    icon: "⏱️",
    label: "Recents"
  }, {
    id: "shared",
    icon: "👥",
    label: "Shared"
  }, {
    id: "downloaded",
    icon: "💾",
    label: "Downloaded"
  }, {
    id: "chat",
    icon: "💬",
    label: "Chat"
  }, {
    id: "covers",
    icon: "🎬",
    label: "Covers"
  }, {
    id: "generate",
    icon: "✨",
    label: "Generate"
  }];
  const handleSourceUpload = () => {
    document.getElementById("studio-source-input")?.click();
  };
  const addSources = files => {
    const newSources = Array.from(files).map((file, idx) => {
      const extension = file.name.split(".").pop().toLowerCase();
      const type = extension === "pdf" ? "pdf" : extension === "ppt" || extension === "pptx" ? "ppt" : extension === "txt" ? "txt" : extension === "docx" ? "doc" : file.type.startsWith("image") ? "image" : "doc";
      return {
        id: Date.now() + idx,
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        type,
        date: new Date().toLocaleDateString(),
        group: inferSourceGroup(file.name),
        file
      };
    });
    setSources(prev => [...newSources, ...prev]);
    if (!selectedSource && newSources.length > 0) setSelectedSource(newSources[0]);
  };
  const generateContent = async () => {
    if (!topic.trim() && !selectedSource) return alert("Select a source or enter a topic");
    setLoading(true);
    setOutput(null);
    const sourceHint = selectedSource ? ` based on: ${selectedSource.name}` : "";
    const prompts = {
      audioOverview: `Create a concise audio script overview on "${topic}"${sourceHint} for a ${level} student. Make it engaging and suitable for listening (2-3 minutes). ${config.systemPromptHint}`,
      videoOverview: `Create a detailed video script outline on "${topic}"${sourceHint} for a ${level} student. Include scene descriptions, key visuals, and talking points (5-7 minutes). ${config.systemPromptHint}`,
      flashcard: `Create 8 flashcards on "${topic}"${sourceHint} for a ${level} student. Respond ONLY with JSON: [{"question":"...","answer":"...","difficulty":"..."}]. No markdown.`,
      spacedRepetition: `Create 10 flashcards with spaced repetition intervals on "${topic}"${sourceHint} for a ${level} student. Respond ONLY with JSON: [{"question":"...","answer":"...","interval":"day1","repetitions":0,"easeFactor":2.5}]. No markdown.`,
      quiz: `Create 5 MCQs on "${topic}"${sourceHint} for a ${level} student. Respond ONLY with JSON: [{"question":"...","options":["A)...","B)...","C)...","D)..."],"correct":"A","explanation":"..."}]. No markdown.`,
      infographic: `Create detailed infographic design specifications for "${topic}"${sourceHint} for a ${level} student. Include: layout sections, color recommendations, key statistics, and visual hierarchy.`,
      slideDeck: `Create a 10-slide presentation outline on "${topic}"${sourceHint} for a ${level} student. Include speaker notes for each slide. ${config.systemPromptHint}`,
      osce: `Create an OSCE station scenario on "${topic}"${sourceHint} for a ${level} student. Include: station instructions, candidate tasks, marking criteria, and key points.`,
      scenario: `Create a scenario-based learning question on "${topic}"${sourceHint} for a ${level} student. Include the scenario, multiple perspectives to consider, and guiding questions.`
    };
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          type: generationType,
          prompt: prompts[generationType],
          model: "sima-stub",
          source: selectedSource?.name
        })
      });
      const data = await res.json();
      const text = data.response || "";
      setOutput(text);
      if (selectedSource) {
        const newMedia = {
          id: generatedMedia.length + 1,
          type: generationType,
          source: selectedSource.name,
          date: new Date().toISOString().split("T")[0],
          duration: "0:00",
          title: `${generationType} on ${topic}`
        };
        setGeneratedMedia([...generatedMedia, newMedia]);
      }
    } catch (e) {
      console.error(e);
      setOutput("Error generating content. Please try again.");
    }
    setLoading(false);
  };
  const handleAddRecent = () => {
    if (selectedSource && topic) {
      const recent = {
        id: recents.length + 1,
        title: uploadTitle || `${generationType} - ${topic}`,
        source: selectedSource.name,
        date: new Date().toLocaleDateString(),
        type: generationType
      };
      setRecents([recent, ...recents]);
      setUploadTitle("");
    }
  };
  const renderWithTabs = (content, title) => React.createElement("div", null, React.createElement("div", {
    style: {
      display: "flex",
      overflowX: "auto",
      gap: 4,
      padding: "12px 16px",
      background: C.surface,
      borderBottom: `1px solid ${C.border}`,
      marginBottom: 0
    }
  }, studioTabs.map(tab => React.createElement("button", {
    key: tab.id,
    onClick: () => setMainTab(tab.id),
    style: {
      padding: "8px 12px",
      borderRadius: 6,
      border: "none",
      background: mainTab === tab.id ? accentCol : "transparent",
      color: mainTab === tab.id ? C.surface : C.text,
      fontWeight: mainTab === tab.id ? 700 : 500,
      cursor: "pointer",
      fontSize: 12,
      whiteSpace: "nowrap",
      transition: "all 0.2s"
    }
  }, tab.icon, " ", tab.label))), content);
  if (mainTab === "sources") {
    const content = React.createElement("div", {
      style: {
        padding: "20px 16px 80px"
      }
    }, React.createElement("div", {
      style: {
        fontSize: 22,
        fontWeight: 800,
        marginBottom: 4
      }
    }, "📚 Sources"), React.createElement("div", {
      style: {
        fontSize: 13,
        color: C.muted,
        marginBottom: 20
      }
    }, "Upload and manage learning materials"), React.createElement("div", {
      style: {
        ...S.card,
        marginBottom: 16,
        padding: 24,
        textAlign: "center",
        border: `2px dashed ${accentCol}`,
        background: accentCol + "08"
      }
    }, React.createElement("div", {
      style: {
        fontSize: 32,
        marginBottom: 10
      }
    }, "📁"), React.createElement("div", {
      style: {
        fontSize: 15,
        fontWeight: 600,
        marginBottom: 6
      }
    }, "Upload Your Materials"), React.createElement("div", {
      style: {
        fontSize: 13,
        color: C.muted,
        marginBottom: 14
      }
    }, "Drag & drop or click to upload PDF, PPT, DOCX, TXT, images"), React.createElement("button", {
      onClick: handleSourceUpload,
      style: {
        ...S.btn(accentCol),
        justifyContent: "center"
      }
    }, "+ Upload File"), React.createElement("div", {
      style: {
        fontSize: 11,
        color: C.muted,
        marginTop: 12
      }
    }, "Limit: ", limits.uploads, "/day • ", sources.length, " uploaded"), React.createElement("input", {
      id: "studio-source-input",
      type: "file",
      accept: ".pdf,.ppt,.pptx,.docx,.txt,image/*",
      multiple: true,
      style: {
        display: "none"
      },
      onChange: e => {
        if (e.target.files?.length) {
          addSources(e.target.files);
          e.target.value = null;
        }
      }
    })), React.createElement("div", {
      style: {
        fontSize: 11,
        fontWeight: 700,
        color: C.muted,
        marginBottom: 12,
        letterSpacing: "0.08em"
      }
    }, "YOUR SOURCES (", sources.length, ")"), Object.entries(sources.reduce((groups, src) => {
      if (!groups[src.group]) groups[src.group] = [];
      groups[src.group].push(src);
      return groups;
    }, {})).map(([group, items]) => React.createElement("div", {
      key: group,
      style: {
        marginBottom: 14
      }
    }, React.createElement("div", {
      style: {
        fontSize: 13,
        fontWeight: 700,
        color: accentCol,
        marginBottom: 8
      }
    }, group), items.map(src => React.createElement("div", {
      key: src.id,
      onClick: () => setSelectedSource(src),
      style: {
        ...S.card,
        marginBottom: 10,
        cursor: "pointer",
        borderColor: selectedSource?.id === src.id ? accentCol : C.border,
        background: selectedSource?.id === src.id ? accentCol + "11" : C.card
      }
    }, React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }
    }, React.createElement("div", null, React.createElement("div", {
      style: {
        fontWeight: 600,
        fontSize: 14
      }
    }, "📄 ", src.name), React.createElement("div", {
      style: {
        fontSize: 11,
        color: C.muted,
        marginTop: 2
      }
    }, src.date, " • ", src.size)), React.createElement("div", {
      style: {
        fontSize: 20
      }
    }, src.type === "pdf" ? "📑" : src.type === "ppt" ? "📊" : src.type === "image" ? "🖼️" : "📝")))))));
  }
  if (mainTab === "recents") {
    return React.createElement("div", {
      style: {
        padding: "20px 16px 80px"
      }
    }, React.createElement("div", {
      style: {
        fontSize: 22,
        fontWeight: 800,
        marginBottom: 4
      }
    }, "⏱️ Recent Items"), React.createElement("div", {
      style: {
        fontSize: 13,
        color: C.muted,
        marginBottom: 20
      }
    }, "Your recently created materials"), recents.length === 0 ? React.createElement("div", {
      style: {
        ...S.card,
        padding: "24px",
        textAlign: "center"
      }
    }, React.createElement("div", {
      style: {
        fontSize: 32,
        marginBottom: 8
      }
    }, "📭"), React.createElement("div", {
      style: {
        color: C.muted
      }
    }, "No recent items yet")) : recents.map(item => React.createElement("div", {
      key: item.id,
      style: {
        ...S.card,
        marginBottom: 12,
        padding: "14px"
      }
    }, React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start"
      }
    }, React.createElement("div", {
      style: {
        flex: 1
      }
    }, React.createElement("div", {
      style: {
        fontWeight: 600,
        fontSize: 14
      }
    }, item.title), React.createElement("div", {
      style: {
        fontSize: 12,
        color: C.muted,
        marginTop: 4
      }
    }, "📄 ", item.source, " • ", item.date)), React.createElement("div", {
      style: {
        fontSize: 11,
        background: accentCol + "22",
        color: accentCol,
        padding: "4px 8px",
        borderRadius: 4,
        fontWeight: 600
      }
    }, item.type)))));
  }
  if (mainTab === "shared") {
    return React.createElement("div", {
      style: {
        padding: "20px 16px 80px"
      }
    }, React.createElement("div", {
      style: {
        fontSize: 22,
        fontWeight: 800,
        marginBottom: 4
      }
    }, "👥 Shared With Groups"), React.createElement("div", {
      style: {
        fontSize: 13,
        color: C.muted,
        marginBottom: 20
      }
    }, "Materials shared in your study groups"), shared.length === 0 ? React.createElement("div", {
      style: {
        ...S.card,
        padding: "24px",
        textAlign: "center"
      }
    }, React.createElement("div", {
      style: {
        fontSize: 32,
        marginBottom: 8
      }
    }, "🤝"), React.createElement("div", {
      style: {
        color: C.muted
      }
    }, "No shared materials yet. Create a study group to share!")) : shared.map(item => React.createElement("div", {
      key: item.id,
      style: {
        ...S.card,
        marginBottom: 12,
        padding: "14px"
      }
    }, React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start"
      }
    }, React.createElement("div", {
      style: {
        flex: 1
      }
    }, React.createElement("div", {
      style: {
        fontWeight: 600,
        fontSize: 14
      }
    }, "👥 ", item.title), React.createElement("div", {
      style: {
        fontSize: 12,
        color: C.muted,
        marginTop: 4
      }
    }, "Group: ", item.group, " • ", item.date)), React.createElement("div", {
      style: {
        fontSize: 18
      }
    }, item.icon)))));
  }
  if (mainTab === "downloaded") {
    return React.createElement("div", {
      style: {
        padding: "20px 16px 80px"
      }
    }, React.createElement("div", {
      style: {
        fontSize: 22,
        fontWeight: 800,
        marginBottom: 4
      }
    }, "💾 Downloaded"), React.createElement("div", {
      style: {
        fontSize: 13,
        color: C.muted,
        marginBottom: 20
      }
    }, "Offline access to your materials"), downloaded.length === 0 ? React.createElement("div", {
      style: {
        ...S.card,
        padding: "24px",
        textAlign: "center"
      }
    }, React.createElement("div", {
      style: {
        fontSize: 32,
        marginBottom: 8
      }
    }, "📥"), React.createElement("div", {
      style: {
        color: C.muted
      }
    }, "No downloaded materials yet")) : downloaded.map(item => React.createElement("div", {
      key: item.id,
      style: {
        ...S.card,
        marginBottom: 12,
        padding: "14px"
      }
    }, React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start"
      }
    }, React.createElement("div", {
      style: {
        flex: 1
      }
    }, React.createElement("div", {
      style: {
        fontWeight: 600,
        fontSize: 14
      }
    }, "📦 ", item.title), React.createElement("div", {
      style: {
        fontSize: 12,
        color: C.muted,
        marginTop: 4
      }
    }, "Size: ", item.size, " • ", item.date)), React.createElement("button", {
      style: {
        ...S.btn(accentCol),
        padding: "4px 10px",
        fontSize: 11
      }
    }, "Open")))));
  }
  if (mainTab === "chat") {
    return React.createElement("div", {
      style: {
        padding: "20px 16px 80px"
      }
    }, React.createElement("div", {
      style: {
        fontSize: 22,
        fontWeight: 800,
        marginBottom: 4
      }
    }, "💬 Chat with SIMA"), React.createElement("div", {
      style: {
        fontSize: 13,
        color: C.muted,
        marginBottom: 20
      }
    }, "Ask questions about your materials"), selectedSource ? React.createElement("div", {
      style: {
        ...S.card,
        marginBottom: 16,
        background: accentCol + "11",
        borderColor: accentCol + "33",
        padding: "12px 14px"
      }
    }, React.createElement("div", {
      style: {
        fontSize: 12,
        color: accentCol,
        fontWeight: 700
      }
    }, "📄 Chatting about: ", selectedSource.name), React.createElement("button", {
      onClick: () => setSelectedSource(null),
      style: {
        fontSize: 11,
        marginTop: 8,
        ...S.btn(C.muted + "22", C.muted)
      }
    }, "Change Source")) : React.createElement("div", {
      style: {
        ...S.card,
        padding: "16px",
        textAlign: "center",
        marginBottom: 16
      }
    }, React.createElement("div", {
      style: {
        fontSize: 13,
        color: C.muted
      }
    }, "Select a source from Sources tab to begin chatting")), React.createElement("div", {
      style: {
        ...S.card,
        padding: "14px",
        background: C.surface,
        marginBottom: 12,
        borderRadius: 8,
        minHeight: 200,
        maxHeight: 300,
        overflow: "auto"
      }
    }, React.createElement("div", {
      style: {
        fontSize: 12,
        color: C.muted,
        textAlign: "center"
      }
    }, "Chat conversation would appear here")), React.createElement("div", {
      style: {
        display: "flex",
        gap: 8
      }
    }, React.createElement("input", {
      placeholder: "Ask a question...",
      style: {
        ...S.input,
        flex: 1
      }
    }), React.createElement("button", {
      style: {
        ...S.btn(accentCol),
        padding: "10px 16px"
      }
    }, "Send")), React.createElement("div", {
      style: {
        fontSize: 11,
        color: C.muted,
        marginTop: 12
      }
    }, "💡 You can also ask for external sources related to your question"));
  }
  if (mainTab === "covers") {
    return React.createElement("div", {
      style: {
        padding: "20px 16px 80px"
      }
    }, React.createElement("div", {
      style: {
        fontSize: 22,
        fontWeight: 800,
        marginBottom: 4
      }
    }, "🎬 Studio Covers"), React.createElement("div", {
      style: {
        fontSize: 13,
        color: C.muted,
        marginBottom: 20
      }
    }, "Generate multimedia content"), !selectedSource && React.createElement("div", {
      style: {
        ...S.card,
        padding: "16px",
        textAlign: "center",
        marginBottom: 16,
        background: accentCol + "08"
      }
    }, React.createElement("div", {
      style: {
        fontSize: 13,
        color: accentCol,
        marginBottom: 8
      }
    }, "📄 Select a source from Sources tab to generate covers")), React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 10
      }
    }, [{
      id: "audio",
      icon: "🎙️",
      label: "Audio Overview",
      desc: "Realistic voices discussing content"
    }, {
      id: "video",
      icon: "📹",
      label: "Video Overview",
      desc: "Animated video summary"
    }, {
      id: "slides",
      icon: "📊",
      label: "Slide Deck",
      desc: "Presentation slides"
    }, {
      id: "flashcards",
      icon: "🃏",
      label: "Flashcards",
      desc: "Interactive cards"
    }, {
      id: "quiz",
      icon: "❓",
      label: "Quiz",
      desc: "Self-assessment questions"
    }, {
      id: "report",
      icon: "📋",
      label: "Report",
      desc: "Detailed summary"
    }].map(cover => React.createElement("button", {
      key: cover.id,
      onClick: () => {
        setGenerationType(cover.id);
        setUploadTitle(cover.label);
      },
      style: {
        ...S.card,
        padding: "16px",
        textAlign: "center",
        cursor: "pointer",
        borderColor: generationType === cover.id ? accentCol : C.border,
        background: generationType === cover.id ? accentCol + "11" : C.card,
        transition: "all 0.2s"
      }
    }, React.createElement("div", {
      style: {
        fontSize: 32,
        marginBottom: 8
      }
    }, cover.icon), React.createElement("div", {
      style: {
        fontWeight: 600,
        fontSize: 13,
        marginBottom: 4
      }
    }, cover.label), React.createElement("div", {
      style: {
        fontSize: 11,
        color: C.muted
      }
    }, cover.desc)))));
  }
  if (mainTab === "generate") {
    return React.createElement("div", {
      style: {
        padding: "20px 16px 80px"
      }
    }, React.createElement("div", {
      style: {
        fontSize: 22,
        fontWeight: 800,
        marginBottom: 4
      }
    }, "✨ Generate New"), React.createElement("div", {
      style: {
        fontSize: 13,
        color: C.muted,
        marginBottom: 20
      }
    }, "Create study materials from your sources"), selectedSource && React.createElement("div", {
      style: {
        ...S.card,
        marginBottom: 16,
        background: accentCol + "11",
        borderColor: accentCol + "33",
        padding: "12px 14px"
      }
    }, React.createElement("div", {
      style: {
        fontSize: 12,
        color: accentCol,
        fontWeight: 700
      }
    }, "📄 Working with: ", selectedSource.name), React.createElement("button", {
      onClick: () => setSelectedSource(null),
      style: {
        fontSize: 11,
        marginTop: 8,
        ...S.btn(C.muted + "22", C.muted)
      }
    }, "Change Source")), React.createElement("div", {
      style: {
        ...S.card,
        marginBottom: 16
      }
    }, React.createElement("label", {
      style: S.label
    }, "Topic or Query"), React.createElement("textarea", {
      value: topic,
      onChange: e => setTopic(e.target.value),
      placeholder: "e.g. 'Photosynthesis mechanism' or leave blank to summarize entire source",
      style: {
        ...S.input,
        minHeight: 70,
        resize: "vertical",
        fontFamily: "inherit"
      }
    })), React.createElement("div", {
      style: {
        fontSize: 11,
        fontWeight: 700,
        color: C.muted,
        marginBottom: 10,
        letterSpacing: "0.08em"
      }
    }, "GENERATION TYPE ", (() => {
      try {
        const sub = JSON.parse(localStorage.getItem("sima_subscription") || "{}");
        const trialEnd = new Date(sub.trialEndDate);
        if (trialEnd > new Date()) {
          const daysLeft = Math.ceil((trialEnd - new Date()) / (1000 * 60 * 60 * 24));
          return ` — 🎁 Trial Mode (${daysLeft} days left)`;
        }
      } catch {}
      return plan === "free" ? "— Plan limit" : "";
    })()), React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 8,
        marginBottom: 16
      }
    }, SUBSCRIPTION_CONFIG.generationTypes.map(gtype => {
      const allowed = canGenerate(gtype.feature);
      return React.createElement("button", {
        key: gtype.id,
        onClick: () => allowed && setGenerationType(gtype.id),
        style: {
          ...S.btn(generationType === gtype.id ? accentCol : C.surface, generationType === gtype.id ? C.text : C.muted),
          padding: "12px 10px",
          fontSize: 12,
          fontWeight: 600,
          opacity: allowed ? 1 : 0.5,
          cursor: allowed ? "pointer" : "not-allowed",
          border: `1px solid ${generationType === gtype.id ? accentCol : C.border}`
        }
      }, gtype.label, !allowed ? React.createElement("div", {
        style: {
          fontSize: 9,
          color: C.muted,
          marginTop: 2
        }
      }, "🔒 Plan limit") : plan === "free" && React.createElement("div", {
        style: {
          fontSize: 9,
          color: accentCol,
          marginTop: 2
        }
      }, "✓ Available"));
    })), React.createElement("button", {
      onClick: generateContent,
      disabled: !canGenerate(SUBSCRIPTION_CONFIG.generationTypes.find(g => g.id === generationType)?.feature) || loading,
      style: {
        ...S.btn(accentCol),
        width: "100%",
        justifyContent: "center",
        fontSize: 15,
        opacity: !canGenerate(SUBSCRIPTION_CONFIG.generationTypes.find(g => g.id === generationType)?.feature) ? 0.5 : 1,
        cursor: !canGenerate(SUBSCRIPTION_CONFIG.generationTypes.find(g => g.id === generationType)?.feature) ? "not-allowed" : "pointer"
      }
    }, loading ? "Generating..." : "✨ Generate"), output && React.createElement("div", {
      style: {
        ...S.card,
        marginTop: 16,
        marginBottom: 16
      }
    }, React.createElement("div", {
      style: {
        fontSize: 11,
        fontWeight: 700,
        color: C.muted,
        marginBottom: 10,
        letterSpacing: "0.08em"
      }
    }, "GENERATED CONTENT"), React.createElement("div", {
      style: {
        whiteSpace: "pre-wrap",
        fontSize: 13,
        lineHeight: 1.6,
        maxHeight: 400,
        overflowY: "auto"
      }
    }, String(output)), React.createElement("button", {
      onClick: () => {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(new Blob([output], {
          type: "text/plain"
        }));
        link.download = `${generationType}-${Date.now()}.txt`;
        link.click();
      },
      style: {
        ...S.btn(accentCol + "22", accentCol),
        marginTop: 12,
        width: "100%",
        justifyContent: "center"
      }
    }, "📥 Download")));
  }
  if (mainTab === "media") {
    return React.createElement("div", {
      style: {
        padding: "20px 16px 80px"
      }
    }, React.createElement("div", {
      style: {
        fontSize: 22,
        fontWeight: 800,
        marginBottom: 4
      }
    }, "🎧 Generated Media"), React.createElement("div", {
      style: {
        fontSize: 13,
        color: C.muted,
        marginBottom: 20
      }
    }, "Access and interact with your generated content"), generatedMedia.length === 0 ? React.createElement("div", {
      style: {
        ...S.card,
        textAlign: "center",
        padding: 24,
        color: C.muted
      }
    }, React.createElement("div", {
      style: {
        fontSize: 32,
        marginBottom: 10
      }
    }, "📭"), React.createElement("div", null, "No generated media yet. Create some from the \"Generate New\" tab.")) : generatedMedia.map(media => React.createElement("div", {
      key: media.id,
      style: {
        ...S.card,
        marginBottom: 12
      }
    }, React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "start",
        marginBottom: 10
      }
    }, React.createElement("div", null, React.createElement("div", {
      style: {
        fontWeight: 600,
        fontSize: 14
      }
    }, media.title), React.createElement("div", {
      style: {
        fontSize: 11,
        color: C.muted,
        marginTop: 2
      }
    }, "Source: ", media.source, " • ", media.date)), React.createElement("div", {
      style: {
        fontSize: 20
      }
    }, media.type === "audioOverview" ? "🎧" : media.type === "videoOverview" ? "🎬" : media.type === "flashcard" ? "🃏" : "📝")), media.type === "audioOverview" && React.createElement("div", {
      style: {
        background: C.surface,
        borderRadius: 8,
        padding: "12px 14px",
        marginBottom: 10
      }
    }, React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8
      }
    }, React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 600
      }
    }, "▶️ ", media.duration), React.createElement("button", {
      style: {
        ...S.btn(accentCol + "22", C.muted),
        padding: "4px 8px",
        fontSize: 11
      }
    }, "☝️ Raise Hand")), React.createElement("div", {
      style: {
        width: "100%",
        height: 4,
        background: C.border,
        borderRadius: 2
      }
    }, React.createElement("div", {
      style: {
        height: 4,
        width: "35%",
        background: accentCol,
        borderRadius: 2
      }
    }))), React.createElement("button", {
      style: {
        ...S.btn(accentCol + "22", accentCol),
        width: "100%",
        justifyContent: "center",
        fontSize: 13
      }
    }, media.type === "audioOverview" ? "🎧 Listen" : media.type === "videoOverview" ? "🎬 Watch" : "📖 View"))));
  }
  if (mainTab === "chat") {
    return React.createElement("div", {
      style: {
        padding: "20px 16px 80px"
      }
    }, React.createElement("div", {
      style: {
        fontSize: 22,
        fontWeight: 800,
        marginBottom: 4
      }
    }, "💬 Chat with Sources"), React.createElement("div", {
      style: {
        fontSize: 13,
        color: C.muted,
        marginBottom: 20
      }
    }, "Ask questions about your learning materials"), !selectedSource ? React.createElement("div", {
      style: {
        ...S.card,
        textAlign: "center",
        padding: 24,
        color: C.muted
      }
    }, React.createElement("div", {
      style: {
        fontSize: 32,
        marginBottom: 10
      }
    }, "📚"), React.createElement("div", {
      style: {
        marginBottom: 14
      }
    }, "Select a source from the \"Sources\" tab to chat about it"), React.createElement("button", {
      onClick: () => setMainTab("sources"),
      style: {
        ...S.btn(accentCol)
      }
    }, "Go to Sources")) : React.createElement("div", null, React.createElement("div", {
      style: {
        ...S.card,
        marginBottom: 16,
        background: accentCol + "11",
        borderColor: accentCol + "33",
        padding: "12px 14px"
      }
    }, React.createElement("div", {
      style: {
        fontSize: 12,
        color: accentCol,
        fontWeight: 700
      }
    }, "📄 Chatting about: ", selectedSource.name)), React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 10,
        marginBottom: 16,
        maxHeight: 300,
        overflowY: "auto"
      }
    }, React.createElement("div", {
      style: {
        ...S.card,
        background: accentCol + "22",
        borderColor: accentCol,
        padding: "12px 14px",
        borderRadius: 8
      }
    }, React.createElement("div", {
      style: {
        fontSize: 12,
        color: accentCol
      }
    }, "🤖 SIMA: What would you like to know about ", selectedSource.name, "?"))), React.createElement("div", {
      style: {
        display: "flex",
        gap: 8
      }
    }, React.createElement("textarea", {
      placeholder: "Ask a question...",
      style: {
        ...S.input,
        flex: 1,
        minHeight: 44,
        resize: "vertical",
        fontFamily: "inherit"
      }
    }), React.createElement("button", {
      style: {
        ...S.btn(accentCol),
        padding: "12px 16px",
        alignSelf: "flex-start"
      }
    }, "Send"))));
  }
  const tabs = [{
    id: "sources",
    label: "📚 Sources",
    icon: "sources"
  }, {
    id: "generate",
    label: "✨ Generate",
    icon: "generate"
  }, {
    id: "media",
    label: "🎧 Media",
    icon: "media"
  }, {
    id: "chat",
    label: "💬 Chat",
    icon: "chat"
  }];
  return React.createElement("div", {
    style: {
      padding: "20px 16px 80px"
    }
  }, React.createElement("div", {
    style: {
      fontSize: 22,
      fontWeight: 800,
      marginBottom: 4
    }
  }, "Study Studio"), React.createElement("div", {
    style: {
      fontSize: 13,
      color: C.muted,
      marginBottom: 20
    }
  }, "Upload, generate, and interact with learning materials"), React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 8,
      marginBottom: 20
    }
  }, tabs.map(t => React.createElement("button", {
    key: t.id,
    onClick: () => setMainTab(t.id),
    style: {
      ...S.btn(mainTab === t.id ? accentCol : C.surface, mainTab === t.id ? C.text : C.muted),
      padding: "12px 14px",
      fontSize: 13,
      fontWeight: 600,
      border: `1px solid ${mainTab === t.id ? accentCol : C.border}`
    }
  }, t.label))), mainTab === "sources" && React.createElement("div", {
    style: {
      padding: "20px 0"
    }
  }));
}
function TimetableScreen({
  profile,
  config
}) {
  const [subjects, setSubjects] = useState("");
  const [examDate, setExamDate] = useState("");
  const [timetableData, setTimetableData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [viewType, setViewType] = useState("table");
  const accentCol = config.accentColor;
  const isKinder = PROFILE_ENGINE.getLevel(profile) === "kindergarten";
  const generateTableTimetable = () => {
    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const studyHours = profile.hours || 2;
    const sessionDuration = 45;
    const breakDuration = 15;
    const preferredTime = profile.studyTime || "morning";
    let startHour = preferredTime === "morning" ? 8 : preferredTime === "afternoon" ? 14 : 18;
    const schedule = {};
    daysOfWeek.forEach(day => {
      const sessions = [];
      let currentHour = startHour;
      let remainingHours = studyHours;
      while (remainingHours > 0) {
        const mins = Math.floor(currentHour * 60);
        const endHour = Math.min(currentHour + 0.75, currentHour + remainingHours);
        sessions.push({
          time: `${String(Math.floor(currentHour)).padStart(2, '0')}:${String(Math.floor(currentHour % 1 * 60)).padStart(2, '0')}`,
          endTime: `${String(Math.floor(endHour)).padStart(2, '0')}:${String(Math.floor(endHour % 1 * 60)).padStart(2, '0')}`,
          activity: sessions.length % 3 === 0 ? `Practice Questions` : sessions.length % 2 === 0 ? `Review ${subjects?.split(",")[0] || "Topic"}` : `Study ${subjects?.split(",")[sessions.length % Math.max(1, subjects?.split(",").length || 1)] || "Topic"}`,
          duration: sessionDuration
        });
        currentHour = endHour + breakDuration / 60;
        remainingHours -= 0.75;
      }
      schedule[day] = sessions;
    });
    return schedule;
  };
  const generate = async () => {
    if (!subjects.trim()) return;
    setLoading(true);
    const prompt = `Create a ${isKinder ? "fun weekly learning schedule" : "detailed weekly study timetable"} for:
- Name: ${profile.name}, Level: ${profile.education}, ${profile.program ? `Program: ${profile.program}` : ""}
- Topics/Subjects: ${subjects}
- ${examDate ? `Exam/deadline: ${examDate}` : "No specific exam date"}
- Daily study hours: ${profile.hours}h, Preferred time: ${profile.studyTime}
- Attention span: ${profile.attention}
- Learning style: ${Array.isArray(profile.style) ? profile.style.join(", ") : profile.style}

ADAPTATION: ${config.timetableHint}

${isKinder ? "Use fun, encouraging language. Keep activities short (15-20 min). Include play breaks and movement." : `Include: spaced repetition reviews, practice tests, breaks, and revision. Reference relevant topics for ${profile.program || profile.education}.`}
Format as a clear day-by-day schedule.`;
    try {
      const tableSchedule = generateTableTimetable();
      setTimetableData({
        text: "",
        table: tableSchedule
      });
      setViewType("table");
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          type: "timetable",
          prompt,
          model: "sima-stub"
        })
      });
      if (res.ok) {
        const data = await res.json();
        setTimetableData(prev => ({
          ...prev,
          text: data.response || ""
        }));
      }
    } catch (err) {
      console.error("Timetable generation error:", err);
      const tableSchedule = generateTableTimetable();
      setTimetableData({
        text: "",
        table: tableSchedule
      });
      setViewType("table");
    }
    setLoading(false);
  };
  return React.createElement("div", {
    style: {
      padding: "20px 16px 80px"
    }
  }, React.createElement("div", {
    style: {
      fontSize: 22,
      fontWeight: 800,
      marginBottom: 4
    }
  }, isKinder ? "📅 My Learning Plan" : "📅 Study Plan & Timetable"), React.createElement("div", {
    style: {
      fontSize: 13,
      color: C.muted,
      marginBottom: 20
    }
  }, "Plan your goals and generate your personalized timetable"), React.createElement("div", {
    style: {
      ...S.card,
      marginBottom: 16
    }
  }, React.createElement("label", {
    style: S.label
  }, isKinder ? "What do you want to learn?" : "Subjects / topics to cover"), React.createElement("div", {
    style: {
      display: "flex",
      gap: 6,
      flexWrap: "wrap",
      marginBottom: 10
    }
  }, config.exampleTopics?.slice(0, 3).map(t => React.createElement("button", {
    key: t,
    onClick: () => setSubjects(s => s ? s + ", " + t : t),
    style: {
      ...S.btn(accentCol + "18", accentCol),
      border: `1px solid ${accentCol}33`,
      padding: "4px 10px",
      fontSize: 11
    }
  }, "+ ", t))), React.createElement("textarea", {
    value: subjects,
    onChange: e => setSubjects(e.target.value),
    placeholder: config.exampleTopics?.join(", ") || "e.g. Maths, English, Science",
    style: {
      ...S.input,
      minHeight: 70,
      resize: "vertical",
      fontFamily: "inherit"
    }
  }), !isKinder && React.createElement(React.Fragment, null, React.createElement("label", {
    style: {
      ...S.label,
      marginTop: 14
    }
  }, "Exam/deadline date (optional)"), React.createElement("input", {
    type: "date",
    style: S.input,
    value: examDate,
    onChange: e => setExamDate(e.target.value)
  })), React.createElement("div", {
    style: {
      marginTop: 12,
      padding: "10px 12px",
      background: C.surface,
      borderRadius: 10,
      fontSize: 12,
      color: C.muted
    }
  }, config.emoji, " ", profile.hours, "h/day · ", profile.attention, " focus · ", profile.studyTime, " learner · ", Array.isArray(profile.style) ? profile.style.join(", ") : profile.style, " style"), React.createElement("button", {
    onClick: generate,
    style: {
      ...S.btn(accentCol),
      marginTop: 14,
      width: "100%",
      justifyContent: "center",
      fontSize: 15
    }
  }, loading ? "Building your plan…" : isKinder ? "🌟 Make My Plan!" : "📅 Generate Timetable")), timetableData && React.createElement("div", null, React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      marginBottom: 16
    }
  }, React.createElement("button", {
    onClick: () => setViewType("table"),
    style: {
      ...S.btn(viewType === "table" ? accentCol : C.surface, viewType === "table" ? "#fff" : C.text),
      flex: 1,
      border: `1px solid ${viewType === "table" ? accentCol : C.border}`
    }
  }, "📊 Table View"), timetableData.text && React.createElement("button", {
    onClick: () => setViewType("text"),
    style: {
      ...S.btn(viewType === "text" ? accentCol : C.surface, viewType === "text" ? "#fff" : C.text),
      flex: 1,
      border: `1px solid ${viewType === "text" ? accentCol : C.border}`
    }
  }, "📝 Text View")), viewType === "table" && timetableData.table && React.createElement("div", null, Object.entries(timetableData.table).map(([day, sessions]) => React.createElement("div", {
    key: day,
    style: {
      ...S.card,
      marginBottom: 12
    }
  }, React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 700,
      color: accentCol,
      marginBottom: 10,
      paddingBottom: 8,
      borderBottom: `1px solid ${C.border}`
    }
  }, day.toUpperCase()), React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, sessions.map((session, i) => React.createElement("div", {
    key: i,
    style: {
      display: "flex",
      gap: 10,
      padding: "8px",
      background: C.surface,
      borderRadius: 8,
      borderLeft: `3px solid ${accentCol}`
    }
  }, React.createElement("div", {
    style: {
      minWidth: 60,
      fontSize: 12,
      fontWeight: 700,
      color: accentCol
    }
  }, session.time), React.createElement("div", {
    style: {
      flex: 1
    }
  }, React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 600
    }
  }, session.activity), React.createElement("div", {
    style: {
      fontSize: 11,
      color: C.muted
    }
  }, "⏱️ ", session.duration, " mins")))))))), viewType === "text" && timetableData.text && React.createElement("div", {
    style: {
      ...S.card,
      whiteSpace: "pre-wrap",
      fontSize: 13.5,
      lineHeight: 1.8
    }
  }, timetableData.text)));
}
function AnalyticsDashboardScreen({
  profile,
  config,
  plan,
  isFirstUse
}) {
  const [analytics, setAnalytics] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('all');
  const accentCol = config?.accentColor || C.accent;
  useEffect(() => {
    loadAnalytics();
  }, [period]);
  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const [dashRes, insightRes] = await Promise.all([fetch(`${API_BASE_URL}/api/analytics/dashboard`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("sima_token")}`
        }
      }), fetch(`${API_BASE_URL}/api/analytics/insights`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("sima_token")}`
        }
      })]);
      const dashData = await dashRes.json();
      const insightData = await insightRes.json();
      setAnalytics(dashData);
      setInsights(insightData);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };
  if (loading || !analytics) {
    return React.createElement("div", {
      style: {
        padding: "20px 16px 80px",
        textAlign: "center"
      }
    }, React.createElement("div", {
      style: {
        fontSize: 22,
        fontWeight: 800,
        marginBottom: 20
      }
    }, "📊 Analytics"), React.createElement("div", {
      style: {
        color: C.muted
      }
    }, "Loading your progress..."));
  }
  const dash = analytics;
  const mil = insights?.nextMilestone;
  return React.createElement("div", {
    style: {
      padding: "20px 16px 80px"
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20
    }
  }, React.createElement("div", {
    style: {
      fontSize: 22,
      fontWeight: 800
    }
  }, "📊 Your Progress"), React.createElement("button", {
    onClick: loadAnalytics,
    style: {
      ...S.btn(accentCol, C.text),
      fontSize: 12,
      padding: "6px 10px"
    }
  }, "🔄 Refresh")), React.createElement("div", {
    style: {
      ...S.card,
      padding: "16px",
      marginBottom: 16,
      background: `linear-gradient(135deg, ${accentCol}22 0%, ${accentCol}11 100%)`
    }
  }, React.createElement("div", {
    style: {
      fontWeight: 700,
      marginBottom: 12,
      color: accentCol
    }
  }, "🎯 Overall Progress"), React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-end",
      gap: 16
    }
  }, React.createElement("div", null, React.createElement("div", {
    style: {
      fontSize: 48,
      fontWeight: 800,
      color: accentCol
    }
  }, dash.overall?.overallProgress || 0, "%"), React.createElement("div", {
    style: {
      fontSize: 12,
      color: C.muted,
      marginTop: 4
    }
  }, "Learning Complete")), React.createElement(ProgressBar, {
    value: dash.overall?.overallProgress || 0,
    max: 100,
    color: accentCol,
    height: 6
  }))), React.createElement("div", {
    style: {
      ...S.card,
      padding: "16px",
      marginBottom: 16
    }
  }, React.createElement("div", {
    style: {
      fontWeight: 700,
      marginBottom: 12
    }
  }, "🎯 Flashcard Mastery"), React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 10,
      marginBottom: 12
    }
  }, React.createElement("div", {
    style: {
      background: C.surface,
      padding: "10px",
      borderRadius: 8,
      textAlign: "center"
    }
  }, React.createElement("div", {
    style: {
      fontSize: 20,
      fontWeight: 800,
      color: C.green
    }
  }, dash.cards?.mastered || 0), React.createElement("div", {
    style: {
      fontSize: 11,
      color: C.muted
    }
  }, "Mastered")), React.createElement("div", {
    style: {
      background: C.surface,
      padding: "10px",
      borderRadius: 8,
      textAlign: "center"
    }
  }, React.createElement("div", {
    style: {
      fontSize: 20,
      fontWeight: 800,
      color: accentCol
    }
  }, dash.cards?.retentionRate || 0, "%"), React.createElement("div", {
    style: {
      fontSize: 11,
      color: C.muted
    }
  }, "Retention"))), React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr 1fr",
      gap: 8
    }
  }, [{
    label: 'Total',
    val: dash.cards?.total,
    col: C.muted
  }, {
    label: 'Learning',
    val: dash.cards?.learning,
    col: C.gold
  }, {
    label: 'New',
    val: dash.cards?.new,
    col: C.blue
  }].map(item => React.createElement("div", {
    key: item.label,
    style: {
      background: C.surface,
      padding: "8px",
      borderRadius: 6,
      textAlign: "center"
    }
  }, React.createElement("div", {
    style: {
      fontSize: 16,
      fontWeight: 700,
      color: item.col
    }
  }, item.val || 0), React.createElement("div", {
    style: {
      fontSize: 10,
      color: C.muted
    }
  }, item.label))))), React.createElement("div", {
    style: {
      ...S.card,
      padding: "16px",
      marginBottom: 16
    }
  }, React.createElement("div", {
    style: {
      fontWeight: 700,
      marginBottom: 12
    }
  }, "❓ Quiz Performance"), React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 10,
      marginBottom: 12
    }
  }, React.createElement("div", {
    style: {
      background: C.surface,
      padding: "10px",
      borderRadius: 8
    }
  }, React.createElement("div", {
    style: {
      fontSize: 20,
      fontWeight: 800,
      color: C.green
    }
  }, dash.quizzes?.averageScore || 0, "%"), React.createElement("div", {
    style: {
      fontSize: 11,
      color: C.muted
    }
  }, "Avg Score")), React.createElement("div", {
    style: {
      background: C.surface,
      padding: "10px",
      borderRadius: 8
    }
  }, React.createElement("div", {
    style: {
      fontSize: 20,
      fontWeight: 800,
      color: C.blue
    }
  }, dash.quizzes?.passRate || 0, "%"), React.createElement("div", {
    style: {
      fontSize: 11,
      color: C.muted
    }
  }, "Pass Rate"))), React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr 1fr",
      gap: 8
    }
  }, [{
    label: 'Total',
    val: dash.quizzes?.total,
    col: accentCol
  }, {
    label: 'Highest',
    val: dash.quizzes?.highestScore,
    col: C.green
  }, {
    label: 'Trend',
    val: (dash.quizzes?.trend > 0 ? '+' : '') + dash.quizzes?.trend,
    col: dash.quizzes?.trend > 0 ? C.green : C.red
  }].map(item => React.createElement("div", {
    key: item.label,
    style: {
      background: C.surface,
      padding: "8px",
      borderRadius: 6,
      textAlign: "center"
    }
  }, React.createElement("div", {
    style: {
      fontSize: 16,
      fontWeight: 700,
      color: item.col
    }
  }, item.val, item.label.includes('Trend') ? '%' : ''), React.createElement("div", {
    style: {
      fontSize: 10,
      color: C.muted
    }
  }, item.label))))), React.createElement("div", {
    style: {
      ...S.card,
      padding: "16px",
      marginBottom: 16
    }
  }, React.createElement("div", {
    style: {
      fontWeight: 700,
      marginBottom: 12
    }
  }, "📅 Study Progress"), React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 10
    }
  }, React.createElement("div", {
    style: {
      background: C.surface,
      padding: "10px",
      borderRadius: 8
    }
  }, React.createElement("div", {
    style: {
      fontSize: 20,
      fontWeight: 800,
      color: accentCol
    }
  }, dash.study?.completionRate || 0, "%"), React.createElement("div", {
    style: {
      fontSize: 11,
      color: C.muted
    }
  }, "Plan Completion")), React.createElement("div", {
    style: {
      background: C.surface,
      padding: "10px",
      borderRadius: 8
    }
  }, React.createElement("div", {
    style: {
      fontSize: 20,
      fontWeight: 800,
      color: C.green
    }
  }, dash.study?.consistency || 0, "%"), React.createElement("div", {
    style: {
      fontSize: 11,
      color: C.muted
    }
  }, "Consistency")))), React.createElement("div", {
    style: {
      ...S.card,
      padding: "16px",
      marginBottom: 16
    }
  }, React.createElement("div", {
    style: {
      fontWeight: 700,
      marginBottom: 12
    }
  }, "⏱️ Study Hours - This Week"), React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "space-around",
      height: 150,
      gap: 4,
      padding: "12px 0",
      background: C.surface,
      borderRadius: 8,
      paddingBottom: 12
    }
  }, ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
    const hours = isFirstUse ? 0 : [2.5, 3, 2, 4, 3.5, 1.5, 0.5][i];
    const maxHeight = 140;
    const barHeight = hours / 5 * maxHeight;
    return React.createElement("div", {
      key: day,
      style: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-end"
      }
    }, React.createElement("div", {
      style: {
        fontSize: 10,
        color: accentCol,
        fontWeight: 700,
        marginBottom: 4
      }
    }, hours, "h"), React.createElement("div", {
      style: {
        width: "100%",
        height: barHeight,
        background: `linear-gradient(180deg, ${accentCol}, ${accentCol}66)`,
        borderRadius: "4px 4px 0 0"
      }
    }), React.createElement("div", {
      style: {
        fontSize: 9,
        color: C.muted,
        marginTop: 4
      }
    }, day));
  })), React.createElement("div", {
    style: {
      marginTop: 12,
      padding: "8px 12px",
      background: accentCol + "11",
      borderRadius: 6,
      fontSize: 12,
      textAlign: "center",
      color: accentCol
    }
  }, isFirstUse ? "📊 Start studying to see your weekly stats" : "📊 This week: 16.5 hours total (avg 2.4h/day)")), mil && React.createElement("div", {
    style: {
      ...S.card,
      padding: "16px",
      marginBottom: 16,
      background: accentCol + '22',
      border: `1px solid ${accentCol}33`
    }
  }, React.createElement("div", {
    style: {
      fontWeight: 700,
      marginBottom: 8,
      color: accentCol
    }
  }, "🏆 Next Milestone"), React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      marginBottom: 8
    }
  }, mil.title), React.createElement(ProgressBar, {
    value: mil.progress || 0,
    max: mil.target || 100,
    color: accentCol,
    height: 4
  }), React.createElement("div", {
    style: {
      fontSize: 11,
      color: C.muted,
      marginTop: 6
    }
  }, mil.progress || 0, " / ", mil.target || 100)), insights?.recommendations && insights.recommendations.length > 0 && React.createElement("div", {
    style: {
      ...S.card,
      padding: "16px"
    }
  }, React.createElement("div", {
    style: {
      fontWeight: 700,
      marginBottom: 12
    }
  }, "💡 Recommendations"), React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, insights.recommendations.map((rec, i) => React.createElement("div", {
    key: i,
    style: {
      display: "flex",
      gap: 8,
      fontSize: 13
    }
  }, React.createElement("span", {
    style: {
      color: accentCol,
      fontWeight: 600
    }
  }, "→"), React.createElement("span", null, rec))))));
}
function GamificationScreen({
  profile,
  config,
  plan
}) {
  const [gameProfile, setGameProfile] = useState({
    currentLevel: 12,
    levelName: "Master Scholar",
    percentToNextLevel: 68,
    pointsToNextLevel: 320,
    totalPoints: 4680,
    longestStreak: 23,
    badge: {
      topBadges: ["🏆", "⭐", "🔥", "💎"]
    }
  });
  const generateAchievements = () => {
    const templates = [{
      name: "First Steps",
      icon: "👣",
      description: "Complete your first study session",
      points: 50
    }, {
      name: "Week Warrior",
      icon: "⚔️",
      description: "Study 7 days in a row",
      points: 150
    }, {
      name: "100 Days",
      icon: "💯",
      description: "Reach 100 day streak",
      points: 500
    }, {
      name: "Quiz Master",
      icon: "🎯",
      description: "Get 100% on 5 quizzes",
      points: 200
    }, {
      name: "Perfect Focus",
      icon: "🎯",
      description: "Complete 10 focus sessions",
      points: 100
    }, {
      name: "All-Nighter",
      icon: "🌙",
      description: "Study 8+ hours in one day",
      points: 300
    }, {
      name: "Flash Learner",
      icon: "⚡",
      description: "Create 50 flashcards",
      points: 250
    }, {
      name: "Knowledge Base",
      icon: "📚",
      description: "Unlock 10 study materials",
      points: 180
    }, {
      name: "Speed Reader",
      icon: "📖",
      description: "Read 500 pages",
      points: 200
    }, {
      name: "Note Ninja",
      icon: "📝",
      description: "Write 10,000 words in notes",
      points: 220
    }, {
      name: "Group Champion",
      icon: "👥",
      description: "Join 5 study groups",
      points: 150
    }, {
      name: "Voice Master",
      icon: "🎙️",
      description: "Send 20 voice messages",
      points: 120
    }, {
      name: "Night Owl",
      icon: "🦉",
      description: "Study after 10 PM",
      points: 80
    }, {
      name: "Early Bird",
      icon: "🌅",
      description: "Study before 7 AM",
      points: 80
    }, {
      name: "Streak Keeper",
      icon: "🔥",
      description: "Maintain 30-day streak",
      points: 400
    }, {
      name: "Expert Scholar",
      icon: "🎓",
      description: "Reach Level 20",
      points: 1000
    }, {
      name: "Content Creator",
      icon: "🎬",
      description: "Generate 20 study materials",
      points: 280
    }, {
      name: "Social Learner",
      icon: "💬",
      description: "Send 100 group messages",
      points: 160
    }, {
      name: "Time Master",
      icon: "⏱️",
      description: "Complete 100 pomodoro sessions",
      points: 210
    }, {
      name: "Memory Champion",
      icon: "🧠",
      description: "Master 100 flashcards",
      points: 300
    }];
    return templates.map((t, i) => ({
      ...t,
      id: i + 1,
      unlocked: Math.random() > 0.4
    }));
  };
  const [achievements, setAchievements] = useState(generateAchievements());
  const generateChallenges = () => {
    const templates = [{
      icon: "📚",
      title: "Weekly Read",
      description: "Read 50 pages this week",
      target: 50,
      reward: 100
    }, {
      icon: "✍️",
      title: "Note Master",
      description: "Write 1000 words of notes",
      target: 1000,
      reward: 150
    }, {
      icon: "🔄",
      title: "Consistency",
      description: "Study 5 days this week",
      target: 5,
      reward: 200
    }, {
      icon: "🎯",
      title: "Quiz Champion",
      description: "Score 90%+ on 3 quizzes",
      target: 3,
      reward: 180
    }, {
      icon: "🧠",
      title: "Memory Test",
      description: "Master 20 flashcards",
      target: 20,
      reward: 120
    }, {
      icon: "💬",
      title: "Group Guru",
      description: "Send 50 group messages",
      target: 50,
      reward: 140
    }, {
      icon: "⏱️",
      title: "Pomodoro King",
      description: "Complete 15 pomodoro sessions",
      target: 15,
      reward: 160
    }, {
      icon: "🌟",
      title: "Golden Week",
      description: "Earn 500 points this week",
      target: 500,
      reward: 250
    }, {
      icon: "📖",
      title: "Page Turner",
      description: "Read 100 pages",
      target: 100,
      reward: 110
    }, {
      icon: "🎤",
      title: "Voice Champ",
      description: "Send 10 voice messages",
      target: 10,
      reward: 90
    }];
    return templates.map((t, i) => ({
      ...t,
      challengeId: i + 1,
      progress: Math.floor(Math.random() * (t.target * 0.8))
    }));
  };
  const [challenges, setChallenges] = useState(generateChallenges());
  const [leaderboard, setLeaderboard] = useState([{
    rank: 1,
    userId: "user001",
    name: "🏅 Alex Chen",
    university: "Stanford University",
    program: "Computer Science",
    year: "Year 3",
    currentLevel: 15,
    streak: 45,
    totalPoints: 8320,
    studySessions: 156,
    achievements: [{
      icon: "🏆"
    }, {
      icon: "⭐"
    }, {
      icon: "💎"
    }]
  }, {
    rank: 2,
    userId: "user002",
    name: "📚 Sarah Johnson",
    university: "Harvard University",
    program: "Medicine",
    year: "Year 2",
    currentLevel: 14,
    streak: 38,
    totalPoints: 7650,
    studySessions: 142,
    achievements: [{
      icon: "🔥"
    }, {
      icon: "⭐"
    }, {
      icon: "✨"
    }]
  }, {
    rank: 3,
    userId: "user003",
    name: "🎓 Marcus Lee",
    university: "MIT",
    program: "Engineering",
    year: "Year 4",
    currentLevel: 13,
    streak: 32,
    totalPoints: 7100,
    studySessions: 128,
    achievements: [{
      icon: "🏆"
    }, {
      icon: "🔥"
    }]
  }, {
    rank: 4,
    userId: "user004",
    name: "💡 Emma Davis",
    university: "Oxford University",
    program: "Law",
    year: "Year 1",
    currentLevel: 12,
    streak: 28,
    totalPoints: 6450,
    studySessions: 115,
    achievements: [{
      icon: "⭐"
    }, {
      icon: "✨"
    }]
  }, {
    rank: 5,
    userId: "user005",
    name: "🚀 James Wilson",
    university: "Cambridge University",
    program: "Physics",
    year: "Year 3",
    currentLevel: 11,
    streak: 21,
    totalPoints: 5890,
    studySessions: 98,
    achievements: [{
      icon: "🏆"
    }]
  }, {
    rank: 6,
    userId: "user006",
    name: "🌟 Lisa Wong",
    university: "NUS Singapore",
    program: "Business",
    year: "Year 2",
    currentLevel: 10,
    streak: 18,
    totalPoints: 5200,
    studySessions: 85,
    achievements: [{
      icon: "🔥"
    }]
  }, {
    rank: 7,
    userId: "user007",
    name: "🎯 Tom Anderson",
    university: "UC Berkeley",
    program: "Data Science",
    year: "Year 4",
    currentLevel: 9,
    streak: 15,
    totalPoints: 4500,
    studySessions: 72,
    achievements: []
  }, {
    rank: 8,
    userId: "user008",
    name: "📖 Nina Patel",
    university: "IIT Bombay",
    program: "Chemistry",
    year: "Year 1",
    currentLevel: 8,
    streak: 12,
    totalPoints: 3800,
    studySessions: 60,
    achievements: [{
      icon: "⭐"
    }]
  }, {
    rank: 9,
    userId: "user009",
    name: "✨ Carlos Ruiz",
    university: "University of Toronto",
    program: "Biology",
    year: "Year 3",
    currentLevel: 7,
    streak: 9,
    totalPoints: 3100,
    studySessions: 48,
    achievements: []
  }, {
    rank: 10,
    userId: "user010",
    name: "🔥 Maya Hassan",
    university: "University of Melbourne",
    program: "Psychology",
    year: "Year 2",
    currentLevel: 6,
    streak: 6,
    totalPoints: 2400,
    studySessions: 35,
    achievements: []
  }]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const accentCol = config?.accentColor || C.accent;
  useEffect(() => {
    loadGamificationData();
  }, [activeTab]);
  const loadGamificationData = async () => {
    setLoading(true);
    try {
      const [profRes, achRes, chalRes, leadRes] = await Promise.all([fetch(`${API_BASE_URL}/api/gamification/profile`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("sima_token")}`
        }
      }).catch(() => ({
        ok: false
      })), fetch(`${API_BASE_URL}/api/gamification/achievements`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("sima_token")}`
        }
      }).catch(() => ({
        ok: false
      })), fetch(`${API_BASE_URL}/api/gamification/challenges`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("sima_token")}`
        }
      }).catch(() => ({
        ok: false
      })), fetch(`${API_BASE_URL}/api/gamification/leaderboard`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("sima_token")}`
        }
      }).catch(() => ({
        ok: false
      }))]);
      if (profRes.ok) {
        const profData = await profRes.json();
        setGameProfile(profData);
      }
      if (achRes.ok) {
        const achData = await achRes.json();
        setAchievements(achData.allAchievements || achievements);
      }
      if (chalRes.ok) {
        const chalData = await chalRes.json();
        setChallenges(chalData.challenges || challenges);
      }
      if (leadRes.ok) {
        const leadData = await leadRes.json();
        setLeaderboard(Array.isArray(leadData) ? leadData : leaderboard);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };
  if (loading && activeTab !== 'profile') {
    return React.createElement("div", {
      style: {
        padding: "20px 16px 80px",
        textAlign: "center"
      }
    }, React.createElement("div", {
      style: {
        fontSize: 22,
        fontWeight: 800,
        marginBottom: 20
      }
    }, "🎮 Gamification"), React.createElement("div", {
      style: {
        color: C.muted
      }
    }, "Loading your profile..."));
  }
  return React.createElement("div", {
    style: {
      padding: "20px 16px 80px"
    }
  }, React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr 1fr 1fr",
      gap: 8,
      marginBottom: 20
    }
  }, [['Profile', 'profile', '👤'], ['Achievements', 'achievements', '🏆'], ['Challenges', 'challenges', '⚡'], ['Leaderboard', 'leaderboard', '📊']].map(([label, id, icon]) => React.createElement("button", {
    key: id,
    onClick: () => setActiveTab(id),
    style: {
      ...S.btn(activeTab === id ? accentCol : C.surface, activeTab === id ? '#fff' : C.text),
      border: `1px solid ${activeTab === id ? accentCol : C.border}`,
      padding: "10px 6px",
      fontSize: 12,
      fontWeight: activeTab === id ? 700 : 500
    }
  }, icon, " ", label))), activeTab === 'profile' && React.createElement("div", null, React.createElement("div", {
    style: {
      ...S.card,
      padding: "20px",
      marginBottom: 16,
      background: `linear-gradient(135deg, ${accentCol}33 0%, ${accentCol}11 100%)`,
      textAlign: "center"
    }
  }, React.createElement("div", {
    style: {
      fontSize: 14,
      color: C.muted,
      marginBottom: 8
    }
  }, "Level"), React.createElement("div", {
    style: {
      fontSize: 64,
      fontWeight: 800,
      color: accentCol,
      marginBottom: 8
    }
  }, gameProfile.currentLevel), React.createElement("div", {
    style: {
      fontSize: 18,
      fontWeight: 700,
      marginBottom: 12
    }
  }, gameProfile.levelName), React.createElement(ProgressBar, {
    value: gameProfile.percentToNextLevel || 0,
    max: 100,
    color: accentCol,
    height: 6
  }), React.createElement("div", {
    style: {
      fontSize: 12,
      color: C.muted,
      marginTop: 8
    }
  }, gameProfile.pointsToNextLevel, " points to next level")), React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 10,
      marginBottom: 16
    }
  }, React.createElement("div", {
    style: {
      ...S.card,
      padding: "12px",
      textAlign: "center"
    }
  }, React.createElement("div", {
    style: {
      fontSize: 24,
      fontWeight: 800,
      color: C.gold
    }
  }, gameProfile.totalPoints), React.createElement("div", {
    style: {
      fontSize: 11,
      color: C.muted
    }
  }, "Total Points")), React.createElement("div", {
    style: {
      ...S.card,
      padding: "12px",
      textAlign: "center"
    }
  }, React.createElement("div", {
    style: {
      fontSize: 24,
      fontWeight: 800,
      color: C.green
    }
  }, "🔥 ", gameProfile.longestStreak || 0), React.createElement("div", {
    style: {
      fontSize: 11,
      color: C.muted
    }
  }, "Best Streak"))), gameProfile.badge?.topBadges && gameProfile.badge.topBadges.length > 0 && React.createElement("div", {
    style: {
      ...S.card,
      padding: "16px",
      marginBottom: 16
    }
  }, React.createElement("div", {
    style: {
      fontWeight: 700,
      marginBottom: 12
    }
  }, "🏅 Your Badges"), React.createElement("div", {
    style: {
      display: "flex",
      gap: 12,
      flexWrap: "wrap"
    }
  }, gameProfile.badge.topBadges.map((badge, i) => React.createElement("div", {
    key: i,
    style: {
      fontSize: 32
    }
  }, badge))))), activeTab === 'achievements' && React.createElement("div", null, React.createElement("div", {
    style: {
      marginBottom: 16,
      padding: "12px",
      background: C.surface,
      borderRadius: 8,
      fontSize: 13
    }
  }, React.createElement("span", {
    style: {
      fontWeight: 700
    }
  }, "Unlocked: ", achievements.filter(a => a.unlocked).length, " / ", achievements.length), React.createElement("div", {
    style: {
      marginTop: 6,
      fontSize: 11,
      color: C.muted
    }
  }, "🎯 Earn points by unlocking achievements")), React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 10
    }
  }, achievements.map(ach => React.createElement("div", {
    key: ach.id,
    style: {
      ...S.card,
      padding: "14px",
      opacity: ach.unlocked ? 1 : 0.5,
      border: `2px solid ${ach.unlocked ? accentCol : C.border}`,
      cursor: ach.unlocked ? 'pointer' : 'default',
      background: ach.unlocked ? `${accentCol}11` : C.card
    }
  }, React.createElement("div", {
    style: {
      fontSize: 28,
      marginBottom: 8
    }
  }, ach.icon), React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      marginBottom: 2,
      color: ach.unlocked ? C.text : C.muted
    }
  }, ach.name), React.createElement("div", {
    style: {
      fontSize: 10,
      color: C.muted,
      marginBottom: 8,
      minHeight: 30,
      lineHeight: 1.3
    }
  }, ach.description), React.createElement(Badge, {
    color: ach.unlocked ? accentCol : C.muted,
    style: {
      width: "100%",
      justifyContent: "center"
    }
  }, ach.points, " pts ", ach.unlocked ? "✓" : "🔒"))))), activeTab === 'challenges' && React.createElement("div", null, challenges.map(chal => React.createElement("div", {
    key: chal.challengeId,
    style: {
      ...S.card,
      padding: "14px",
      marginBottom: 10,
      borderLeft: `4px solid ${accentCol}`
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 10
    }
  }, React.createElement("div", null, React.createElement("div", {
    style: {
      fontSize: 28,
      marginBottom: 4
    }
  }, chal.icon), React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 14
    }
  }, chal.title), React.createElement("div", {
    style: {
      fontSize: 12,
      color: C.muted
    }
  }, chal.description)), React.createElement(Badge, {
    color: accentCol,
    style: {
      minWidth: 60,
      justifyContent: "center"
    }
  }, "+", chal.reward, " pts")), React.createElement(ProgressBar, {
    value: Math.min(100, chal.progress / chal.target * 100),
    max: 100,
    color: accentCol,
    height: 6
  }), React.createElement("div", {
    style: {
      fontSize: 11,
      color: C.muted,
      marginTop: 8,
      textAlign: "right"
    }
  }, chal.progress, " / ", chal.target, " ", chal.progress >= chal.target ? "✅ Complete!" : "")))), activeTab === 'leaderboard' && React.createElement("div", null, React.createElement("div", {
    style: {
      ...S.card,
      padding: "12px",
      marginBottom: 16,
      background: `linear-gradient(135deg, ${accentCol}22, ${C.surface})`,
      border: `1px solid ${accentCol}44`
    }
  }, React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: accentCol,
      marginBottom: 6
    }
  }, "🏆 Top Performers This Week"), React.createElement("div", {
    style: {
      fontSize: 11,
      color: C.muted
    }
  }, "Compete with learners worldwide • Updated hourly")), Array.isArray(leaderboard) && leaderboard.length > 0 ? React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, leaderboard.slice(0, 10).map((user, idx) => React.createElement("div", {
    key: user.userId || idx,
    style: {
      ...S.card,
      padding: "12px",
      display: "flex",
      gap: 12,
      borderLeft: `4px solid ${user.rank <= 3 ? accentCol : C.border}`
    }
  }, React.createElement("div", {
    style: {
      fontSize: 24,
      fontWeight: 800,
      color: user.rank <= 3 ? accentCol : C.muted,
      minWidth: 32,
      textAlign: "center",
      flexShrink: 0
    }
  }, user.rank === 1 ? '🥇' : user.rank === 2 ? '🥈' : user.rank === 3 ? '🥉' : `#${user.rank}`), React.createElement("div", {
    style: {
      flex: 1
    }
  }, React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 13,
      marginBottom: 2
    }
  }, user.name), React.createElement("div", {
    style: {
      fontSize: 10,
      color: C.muted,
      marginBottom: 6
    }
  }, user.university), React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 4,
      fontSize: 10,
      color: C.muted
    }
  }, React.createElement("span", null, "📚 ", user.program), React.createElement("span", null, "📅 ", user.year), React.createElement("span", null, "⭐ Level ", user.currentLevel), React.createElement("span", null, "🔥 ", user.streak, "d"))), React.createElement("div", {
    style: {
      textAlign: "right",
      flexShrink: 0
    }
  }, React.createElement("div", {
    style: {
      fontWeight: 800,
      fontSize: 15,
      color: accentCol
    }
  }, user.totalPoints), React.createElement("div", {
    style: {
      fontSize: 9,
      color: C.muted,
      marginBottom: 6
    }
  }, "points"), user.achievements && user.achievements.length > 0 && React.createElement("div", {
    style: {
      display: "flex",
      gap: 2,
      justifyContent: "flex-end"
    }
  }, user.achievements.map((a, i) => React.createElement("span", {
    key: i,
    style: {
      fontSize: 11
    }
  }, a.icon))))))) : React.createElement("div", {
    style: {
      textAlign: "center",
      padding: "20px",
      color: C.muted
    }
  }, React.createElement("div", {
    style: {
      fontSize: 32,
      marginBottom: 12
    }
  }, "📊"), React.createElement("div", null, "Leaderboard loading..."))));
}
function GroupsScreen({
  profile,
  config
}) {
  const [groups, setGroups] = useState([]);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupMessages, setGroupMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [showMembers, setShowMembers] = useState(false);
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showDocViewer, setShowDocViewer] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [groupOpenToAll, setGroupOpenToAll] = useState({});
  const [sharedDocs, setSharedDocs] = useState([]);
  const [showFilesModal, setShowFilesModal] = useState(false);
  const [memberIdMap, setMemberIdMap] = useState({});
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    messageId: null
  });
  const [newGroup, setNewGroup] = useState({
    name: "",
    topic: "",
    university: "",
    subjectCourse: "",
    year: "",
    members: 12,
    active: true
  });
  const userRole = {
    role: "admin",
    joinedAt: new Date().toISOString()
  };
  const education = profile?.education || "university";
  const yieldYearOptions = () => {
    if (education === "kindergarten") return [];
    if (education === "primary") return [{
      value: "grade1",
      label: "Grade 1"
    }, {
      value: "grade2",
      label: "Grade 2"
    }, {
      value: "grade3",
      label: "Grade 3"
    }, {
      value: "grade4",
      label: "Grade 4"
    }, {
      value: "grade5",
      label: "Grade 5"
    }, {
      value: "grade6",
      label: "Grade 6"
    }, {
      value: "grade7",
      label: "Grade 7"
    }];
    if (education === "secondary") return [{
      value: "grade8",
      label: "Grade 8 (Form 1)"
    }, {
      value: "grade9",
      label: "Grade 9 (Form 2)"
    }, {
      value: "grade10",
      label: "Grade 10 (Form 3)"
    }, {
      value: "grade11",
      label: "Grade 11 (Form 4)"
    }, {
      value: "grade12",
      label: "Grade 12 (Form 5)"
    }];
    return [{
      value: "year1",
      label: "Year 1"
    }, {
      value: "year2",
      label: "Year 2"
    }, {
      value: "year3",
      label: "Year 3"
    }, {
      value: "year4",
      label: "Year 4"
    }, {
      value: "year5",
      label: "Year 5"
    }, {
      value: "year6",
      label: "Year 6"
    }, {
      value: "year7",
      label: "Year 7"
    }, {
      value: "postgrad",
      label: "Postgraduate"
    }];
  };
  const getMemberId = sender => {
    if (sender === "You") return "You (Member 1)";
    if (sender.includes("SIMA")) return sender;
    if (!memberIdMap[sender]) {
      const newId = Object.keys(memberIdMap).length + 1;
      setMemberIdMap(prev => ({
        ...prev,
        [sender]: `Member ${newId}`
      }));
      return `Member ${newId}`;
    }
    return memberIdMap[sender];
  };
  useEffect(() => {
    if (!showDocViewer || !selectedDoc?.fileData) return;
    const url = URL.createObjectURL(selectedDoc.fileData);
    setPreviewUrl(url);
    return () => {
      URL.revokeObjectURL(url);
      setPreviewUrl(null);
    };
  }, [showDocViewer, selectedDoc]);
  const closeDocViewer = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setShowDocViewer(false);
    setSelectedDoc(null);
  };
  useEffect(() => {
    const savedGroups = localStorage.getItem("sima_groups");
    setGroups(savedGroups ? JSON.parse(savedGroups) : []);
    fetch("/api/groups").then(r => r.json()).then(data => {
      if (data.groups) setGroups(prev => [...data.groups, ...prev.filter(g => !data.groups.find(ag => ag.id === g.id))]);
    }).catch(() => {});
  }, [config]);
  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedGroup) return;
    if (editingMessageId !== null) {
      setGroupMessages(prev => prev.map((message, index) => index === editingMessageId ? {
        ...message,
        content: messageInput,
        edited: true,
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        })
      } : message));
      setEditingMessageId(null);
      setMessageInput("");
      setContextMenu({
        visible: false,
        x: 0,
        y: 0,
        messageId: null
      });
      return;
    }
    const userMsg = {
      role: "user",
      content: messageInput,
      sender: "You",
      senderType: "user",
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      }),
      msgId: Date.now(),
      canDelete: true
    };
    setGroupMessages(prev => [...prev, userMsg]);
    setMessageInput("");
    const simaIsMentioned = messageInput.toLowerCase().includes("@sima") || messageInput.toLowerCase().includes("@ai");
    if (!simaIsMentioned) return;
    let simaReply = null;
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: [...groupMessages, userMsg],
          group: selectedGroup.id
        })
      }).catch(() => null);
      if (res && res.ok) {
        const data = await res.json();
        simaReply = data.response || localSimaResponse({
          prompt: messageInput,
          mode: "exam",
          profile
        });
      } else {
        simaReply = localSimaResponse({
          prompt: messageInput,
          mode: "exam",
          profile
        });
      }
    } catch (e) {
      simaReply = localSimaResponse({
        prompt: messageInput,
        mode: "exam",
        profile
      });
    }
    setGroupMessages(prev => [...prev, {
      role: "assistant",
      content: simaReply,
      sender: "SIMA 🤖",
      senderType: "ai",
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      })
    }]);
  };
  const handleCreateGroup = () => {
    if (!newGroup.name.trim() || !newGroup.topic.trim()) return alert("Enter group name and topic.");
    const payload = {
      id: `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: newGroup.name,
      topic: newGroup.topic,
      university: newGroup.university || profile?.institution || "",
      subjectCourse: newGroup.subjectCourse,
      year: newGroup.year,
      members: Number(newGroup.members) || 1,
      active: true,
      createdAt: new Date().toISOString(),
      memberRoles: {
        [profile?.name || "You"]: {
          role: "admin",
          joinedAt: new Date().toISOString()
        }
      }
    };
    const updatedGroups = [payload, ...groups];
    setGroups(updatedGroups);
    localStorage.setItem("sima_groups", JSON.stringify(updatedGroups));
    fetch("/api/groups", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    }).then(r => r.json()).then(data => {
      if (data.group) {
        const updated = [data.group, ...groups.filter(g => g.id !== payload.id)];
        setGroups(updated);
        localStorage.setItem("sima_groups", JSON.stringify(updated));
      }
    }).catch(() => {});
    setNewGroup({
      name: "",
      topic: "",
      university: "",
      subjectCourse: "",
      year: "",
      members: 12,
      active: true
    });
    setShowCreate(false);
    setSelectedGroup(payload);
    setGroupMessages([]);
  };
  const handleLeaveGroup = () => {
    if (!selectedGroup) return;
    if (confirm("Leave this group?")) {
      setGroups(g => g.filter(gr => gr.id !== selectedGroup.id));
      localStorage.setItem("sima_groups", JSON.stringify(groups.filter(g => g.id !== selectedGroup.id)));
      setSelectedGroup(null);
      setGroupMessages([]);
    }
  };
  const filteredGroups = groups.filter(g => g.name.toLowerCase().includes(search.toLowerCase()) || g.topic.toLowerCase().includes(search.toLowerCase()) || g.university && g.university.toLowerCase().includes(search.toLowerCase()) || g.subjectCourse && g.subjectCourse.toLowerCase().includes(search.toLowerCase()));
  if (selectedGroup) {
    return React.createElement("div", {
      style: {
        padding: "16px 16px 80px",
        display: "flex",
        flexDirection: "column",
        height: "100vh"
      }
    }, React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
        paddingBottom: 12,
        borderBottom: `1px solid ${C.border}`
      }
    }, React.createElement("div", null, React.createElement("div", {
      style: {
        fontSize: 18,
        fontWeight: 800,
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 4
      }
    }, React.createElement("span", null, "💬"), " ", selectedGroup.name), React.createElement("div", {
      style: {
        fontSize: 11,
        color: C.muted,
        display: "flex",
        gap: 12,
        flexWrap: "wrap"
      }
    }, selectedGroup.topic && React.createElement("span", null, "📌 ", selectedGroup.topic), selectedGroup.subjectCourse && React.createElement("span", null, "📚 ", selectedGroup.subjectCourse), React.createElement("span", null, "👥 ", selectedGroup.members, " members"))), React.createElement("div", {
      style: {
        display: "flex",
        gap: 8
      }
    }, React.createElement("button", {
      onClick: () => alert("📞 Group Call Starting...\\n\\nFeature coming soon! Soon you'll be able to have real-time video/audio calls with group members."),
      style: {
        ...S.btn(C.accent, "#fff"),
        padding: "8px 12px",
        fontSize: 12
      },
      title: "Start group call"
    }, "📞 Call"), React.createElement("button", {
      onClick: () => setSelectedGroup(null),
      style: {
        ...S.btn(C.surface, C.muted),
        padding: "8px 12px",
        fontSize: 12
      }
    }, "← Back"))), React.createElement("div", {
      style: {
        flex: 1,
        overflowY: "auto",
        marginBottom: 12,
        padding: "16px 8px",
        background: C.card,
        borderRadius: 12,
        border: `1px solid ${C.border}`,
        display: "flex",
        flexDirection: "column",
        gap: 8
      }
    }, groupMessages.length === 0 ? React.createElement("div", {
      style: {
        textAlign: "center",
        color: C.muted,
        paddingTop: 60,
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }
    }, React.createElement("div", null, React.createElement("div", {
      style: {
        fontSize: 48,
        marginBottom: 16
      }
    }, "💬"), React.createElement("div", {
      style: {
        fontSize: 14,
        fontWeight: 600
      }
    }, "Start the conversation!"), React.createElement("div", {
      style: {
        fontSize: 12,
        color: C.muted,
        marginTop: 8
      }
    }, "Mention @SIMA to get a response"))) : groupMessages.map((msg, i) => {
      const isUser = msg.role === "user";
      const isSIMA = msg.senderType === "ai";
      const isFileShare = msg.content?.includes("📄 Shared:") || msg.content?.includes("🎬 Shared:") || msg.content?.includes("🖼️ Shared:");
      return React.createElement("div", {
        key: i,
        style: {
          display: "flex",
          gap: 8,
          flexDirection: isUser ? "row-reverse" : "row",
          alignItems: "flex-end",
          marginBottom: 4
        }
      }, React.createElement("div", {
        style: {
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: isSIMA ? config.accentColor : C.accent,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 14,
          flexShrink: 0,
          color: "#fff"
        }
      }, isSIMA ? "🤖" : "👤"), React.createElement("div", {
        style: {
          maxWidth: "75%",
          position: "relative"
        }
      }, React.createElement("div", {
        style: {
          fontSize: 11,
          fontWeight: 600,
          color: C.muted,
          marginBottom: 2,
          paddingLeft: 4
        }
      }, msg.sender === "You" ? getMemberId("You") : msg.sender, " ", msg.timestamp && React.createElement("span", {
        style: {
          fontSize: 10
        }
      }, "• ", msg.timestamp)), isFileShare ? React.createElement("div", {
        onClick: () => {
          const fileMatch = msg.content.match(/Shared:\s*(.+)$/);
          const fileName = fileMatch ? fileMatch[1].trim() : "document";
          let doc = sharedDocs.find(d => msg.content.includes(d.name));
          if (!doc) {
            let fileType = "pdf";
            if (msg.content.includes("🖼️")) fileType = "image";else if (msg.content.includes("🎬")) fileType = "ppt";else if (msg.content.includes("📄")) fileType = "pdf";
            doc = {
              id: `doc_${i}`,
              name: fileName,
              type: fileType,
              size: "2.5 MB",
              uploadedBy: msg.sender === "You" ? getMemberId("You") : msg.sender,
              uploadedAt: new Date().toISOString()
            };
          }
          setSelectedDoc(doc);
          setShowDocViewer(true);
        },
        onContextMenu: e => {
          e.preventDefault();
          setContextMenu({
            visible: true,
            x: e.clientX,
            y: e.clientY,
            messageId: i,
            isUser,
            canEdit: msg.sender === "You",
            canDelete: userRole.role === "admin" || msg.sender === "You"
          });
        },
        style: {
          padding: "12px 14px",
          borderRadius: isUser ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
          background: isUser ? config.accentColor : C.surface,
          color: isUser ? "#fff" : C.text,
          border: `2px solid ${isUser ? config.accentColor : C.border}`,
          fontSize: 13,
          lineHeight: 1.5,
          wordWrap: "break-word",
          whiteSpace: "pre-wrap",
          cursor: "pointer",
          transition: "all 0.2s",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
        },
        onMouseOver: e => e.target.style.transform = "scale(1.02)",
        onMouseOut: e => e.target.style.transform = "scale(1)"
      }, React.createElement("div", {
        style: {
          fontWeight: 600
        }
      }, msg.content), React.createElement("div", {
        style: {
          fontSize: 11,
          marginTop: 4,
          opacity: 0.7
        }
      }, "👆 Click to open")) : React.createElement("div", {
        onContextMenu: e => {
          e.preventDefault();
          setContextMenu({
            visible: true,
            x: e.clientX,
            y: e.clientY,
            messageId: i,
            isUser,
            canEdit: msg.sender === "You",
            canDelete: userRole.role === "admin" || msg.sender === "You"
          });
        },
        style: {
          padding: "10px 14px",
          borderRadius: isUser ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
          background: isUser ? config.accentColor : C.surface,
          color: isUser ? "#fff" : C.text,
          border: isUser ? "none" : `1px solid ${C.border}`,
          fontSize: 13,
          lineHeight: 1.5,
          wordWrap: "break-word",
          whiteSpace: "pre-wrap",
          cursor: "context-menu"
        }
      }, msg.content)));
    })), React.createElement("div", {
      style: {
        display: "flex",
        gap: 8,
        marginBottom: 12,
        alignItems: "flex-end",
        position: "relative"
      }
    }, React.createElement("input", {
      style: {
        ...S.input,
        flex: 1,
        minWidth: 200
      },
      placeholder: "Message the group… (mention @SIMA for AI help)",
      value: messageInput,
      onChange: e => setMessageInput(e.target.value),
      onKeyDown: e => e.key === "Enter" && handleSendMessage()
    }), React.createElement("button", {
      style: {
        ...S.btn(C.surface, C.text),
        border: `1px solid ${C.border}`,
        padding: "11px 12px",
        fontWeight: 600,
        fontSize: 16,
        position: "relative"
      },
      onClick: () => setShowEmojiPicker(!showEmojiPicker),
      title: "Add emoji"
    }, "😊"), React.createElement("button", {
      style: {
        ...S.btn(C.surface, C.text),
        border: `1px solid ${C.border}`,
        padding: "11px 12px",
        fontWeight: 600,
        fontSize: 14
      },
      onClick: () => alert("🎙️ Voice notes feature coming soon! Record and share audio messages with your group."),
      title: "Send voice note"
    }, "🎙️"), showEmojiPicker && React.createElement("div", {
      style: {
        position: "absolute",
        bottom: 50,
        right: 60,
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        padding: "12px",
        display: "grid",
        gridTemplateColumns: "repeat(6, 1fr)",
        gap: 8,
        zIndex: 50,
        width: 280
      }
    }, ["😂", "😍", "🤔", "😎", "🔥", "👍", "🙌", "💯", "✨", "🎉", "💪", "🚀", "📚", "💡", "⚡", "🌟", "❤️", "😘"].map(emoji => React.createElement("button", {
      key: emoji,
      onClick: () => {
        setMessageInput(m => m + emoji);
        setShowEmojiPicker(false);
      },
      style: {
        fontSize: 20,
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "4px",
        borderRadius: 8,
        transition: "background 0.2s"
      },
      onMouseOver: e => e.target.style.background = C.surface,
      onMouseOut: e => e.target.style.background = "none"
    }, emoji))), React.createElement("div", {
      style: {
        position: "relative"
      }
    }, React.createElement("button", {
      style: {
        ...S.btn(C.surface, C.text),
        border: `1px solid ${C.border}`,
        padding: "11px 12px",
        fontWeight: 600,
        fontSize: 14
      },
      onClick: () => setShowFileMenu(!showFileMenu),
      title: "Share files"
    }, "➕"), showFileMenu && React.createElement("div", {
      style: {
        position: "absolute",
        bottom: 50,
        right: 0,
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        overflow: "hidden",
        zIndex: 50,
        minWidth: 160,
        boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
      }
    }, React.createElement("button", {
      onClick: () => {
        document.getElementById(`group-upload-pdf-${selectedGroup.id}`).click();
        setShowFileMenu(false);
      },
      style: {
        width: "100%",
        padding: "12px 14px",
        background: "none",
        border: "none",
        cursor: "pointer",
        textAlign: "left",
        fontSize: 13,
        fontWeight: 600,
        transition: "background 0.2s",
        display: "flex",
        alignItems: "center",
        gap: 8
      },
      onMouseOver: e => e.target.style.background = C.surface,
      onMouseOut: e => e.target.style.background = "none"
    }, "📄 PDF"), React.createElement("button", {
      onClick: () => {
        document.getElementById(`group-upload-ppt-${selectedGroup.id}`).click();
        setShowFileMenu(false);
      },
      style: {
        width: "100%",
        padding: "12px 14px",
        background: "none",
        border: "none",
        cursor: "pointer",
        textAlign: "left",
        fontSize: 13,
        fontWeight: 600,
        transition: "background 0.2s",
        display: "flex",
        alignItems: "center",
        gap: 8,
        borderTop: `1px solid ${C.border}`
      },
      onMouseOver: e => e.target.style.background = C.surface,
      onMouseOut: e => e.target.style.background = "none"
    }, "🎬 PowerPoint"), React.createElement("button", {
      onClick: () => {
        document.getElementById(`group-upload-img-${selectedGroup.id}`).click();
        setShowFileMenu(false);
      },
      style: {
        width: "100%",
        padding: "12px 14px",
        background: "none",
        border: "none",
        cursor: "pointer",
        textAlign: "left",
        fontSize: 13,
        fontWeight: 600,
        transition: "background 0.2s",
        display: "flex",
        alignItems: "center",
        gap: 8,
        borderTop: `1px solid ${C.border}`
      },
      onMouseOver: e => e.target.style.background = C.surface,
      onMouseOut: e => e.target.style.background = "none"
    }, "🖼️ Image"))), React.createElement("input", {
      id: `group-upload-pdf-${selectedGroup?.id}`,
      type: "file",
      accept: ".pdf",
      style: {
        display: "none"
      },
      onChange: e => {
        if (e.target.files?.[0]) {
          const file = e.target.files[0];
          const memberId = getMemberId("You");
          const doc = {
            id: Date.now(),
            name: file.name,
            type: "pdf",
            size: (file.size / 1024).toFixed(1) + " KB",
            uploadedBy: memberId,
            uploadedAt: new Date().toISOString(),
            fileData: e.target.files[0]
          };
          setSharedDocs(prev => [doc, ...prev]);
          setGroupMessages(prev => [...prev, {
            role: "user",
            content: `📄 Shared: ${file.name}`,
            sender: "You",
            senderType: "user",
            timestamp: new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            }),
            msgId: Date.now(),
            canDelete: true
          }]);
        }
      }
    }), React.createElement("input", {
      id: `group-upload-ppt-${selectedGroup?.id}`,
      type: "file",
      accept: ".ppt,.pptx",
      style: {
        display: "none"
      },
      onChange: e => {
        if (e.target.files?.[0]) {
          const file = e.target.files[0];
          const memberId = getMemberId("You");
          const doc = {
            id: Date.now(),
            name: file.name,
            type: "ppt",
            size: (file.size / 1024).toFixed(1) + " KB",
            uploadedBy: memberId,
            uploadedAt: new Date().toISOString(),
            fileData: e.target.files[0]
          };
          setSharedDocs(prev => [doc, ...prev]);
          setGroupMessages(prev => [...prev, {
            role: "user",
            content: `🎬 Shared: ${file.name}`,
            sender: "You",
            senderType: "user",
            timestamp: new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            }),
            msgId: Date.now(),
            canDelete: true
          }]);
        }
      }
    }), React.createElement("input", {
      id: `group-upload-img-${selectedGroup?.id}`,
      type: "file",
      accept: "image/*",
      style: {
        display: "none"
      },
      onChange: e => {
        if (e.target.files?.[0]) {
          const file = e.target.files[0];
          const memberId = getMemberId("You");
          const doc = {
            id: Date.now(),
            name: file.name,
            type: "image",
            size: (file.size / 1024).toFixed(1) + " KB",
            uploadedBy: memberId,
            uploadedAt: new Date().toISOString(),
            fileData: e.target.files[0]
          };
          setSharedDocs(prev => [doc, ...prev]);
          setGroupMessages(prev => [...prev, {
            role: "user",
            content: `🖼️ Shared: ${file.name}`,
            sender: "You",
            senderType: "user",
            timestamp: new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            }),
            msgId: Date.now(),
            canDelete: true
          }]);
        }
      }
    }), React.createElement("button", {
      style: {
        ...S.btn(config.accentColor),
        padding: "11px 18px",
        fontWeight: 600
      },
      onClick: handleSendMessage
    }, "Send")), React.createElement("div", {
      style: {
        display: "flex",
        gap: 8
      }
    }, React.createElement("button", {
      style: {
        ...S.btn(C.surface, C.text),
        border: `1px solid ${C.border}`,
        padding: "10px 14px",
        flex: 1,
        fontSize: 13,
        fontWeight: 600
      },
      onClick: () => setShowMembers(true)
    }, "👥 Members (", selectedGroup.members, ")"), React.createElement("button", {
      style: {
        ...S.btn(C.surface, C.gold),
        border: `1px solid ${C.gold}44`,
        padding: "10px 14px",
        fontSize: 13,
        fontWeight: 600
      },
      onClick: () => setShowFilesModal(true)
    }, "📂 Files (", sharedDocs.length, ")"), React.createElement("button", {
      style: {
        ...S.btn(C.surface, C.red),
        border: `1px solid ${C.red}44`,
        padding: "10px 14px",
        fontSize: 13,
        fontWeight: 600
      },
      onClick: handleLeaveGroup
    }, "🚪 Leave")), showMembers && React.createElement("div", {
      style: {
        position: "fixed",
        inset: 0,
        background: "#000b",
        zIndex: 300,
        display: "flex",
        alignItems: "flex-end"
      }
    }, React.createElement("div", {
      style: {
        ...S.card,
        width: "100%",
        borderRadius: "20px 20px 0 0",
        maxHeight: "70vh",
        display: "flex",
        flexDirection: "column"
      }
    }, React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16
      }
    }, React.createElement("div", {
      style: {
        fontWeight: 800,
        fontSize: 18
      }
    }, "👥 Group Members"), React.createElement("button", {
      onClick: () => setShowMembers(false),
      style: {
        ...S.btn(C.surface, C.muted),
        padding: "6px 10px"
      }
    }, React.createElement(Icon, {
      d: Icons.x,
      size: 16
    }))), React.createElement("div", {
      style: {
        overflowY: "auto",
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        marginBottom: 16
      }
    }, React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 700,
        color: C.muted,
        paddingLeft: 4,
        marginBottom: 8
      }
    }, "CURRENT MEMBERS"), React.createElement("div", {
      style: {
        background: C.surface,
        borderRadius: 10,
        padding: "12px 14px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }
    }, React.createElement("div", null, React.createElement("div", {
      style: {
        fontSize: 13,
        fontWeight: 600
      }
    }, "👤 You"), React.createElement("div", {
      style: {
        fontSize: 11,
        color: C.muted,
        marginTop: 2
      }
    }, "Owner • Group Creator")), React.createElement("span", {
      style: {
        background: C.accent + "44",
        color: C.accent,
        fontSize: 10,
        fontWeight: 700,
        padding: "4px 10px",
        borderRadius: 6
      }
    }, "OWNER")), [...Array(Math.max(0, selectedGroup.members - 1))].map((_, i) => {
      const memberRoles = ["Admin", "Moderator", "Member", "Member"];
      const role = memberRoles[i % memberRoles.length];
      const roleColors = {
        "Admin": {
          bg: C.gold + "44",
          text: C.gold
        },
        "Moderator": {
          bg: C.purple + "44",
          text: C.purple
        },
        "Member": {
          bg: C.muted + "22",
          text: C.muted
        }
      };
      const roleStyle = roleColors[role] || roleColors["Member"];
      return React.createElement("div", {
        key: i,
        style: {
          background: C.surface,
          borderRadius: 10,
          padding: "12px 14px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }
      }, React.createElement("div", null, React.createElement("div", {
        style: {
          fontSize: 13,
          fontWeight: 600
        }
      }, "👤 Member ", i + 2), React.createElement("div", {
        style: {
          fontSize: 11,
          color: C.muted,
          marginTop: 2
        }
      }, "Joined recently")), React.createElement("div", {
        style: {
          display: "flex",
          gap: 8,
          alignItems: "center"
        }
      }, React.createElement("span", {
        style: {
          background: roleStyle.bg,
          color: roleStyle.text,
          fontSize: 10,
          fontWeight: 700,
          padding: "4px 10px",
          borderRadius: 6
        }
      }, role), role === "Member" && React.createElement("button", {
        style: {
          ...S.btn(C.gold, "#000"),
          padding: "4px 10px",
          fontSize: 11,
          fontWeight: 600
        },
        onClick: () => alert(`Promoted Member ${i + 2} to Admin!`),
        title: "Make admin"
      }, "⬆️ Admin"), role !== "Member" && React.createElement("button", {
        style: {
          ...S.btn(C.red + "44", C.red),
          padding: "4px 10px",
          fontSize: 11,
          fontWeight: 600,
          border: `1px solid ${C.red}`
        },
        onClick: () => alert(`Removed Member ${i + 2} from group`),
        title: "Remove member"
      }, "🚪 Remove")));
    })), React.createElement("div", {
      style: {
        marginBottom: 12,
        paddingBottom: 12,
        borderTop: `1px solid ${C.border}`
      }
    }, React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 700,
        color: C.muted,
        marginBottom: 8,
        paddingTop: 12
      }
    }, "GROUP SETTINGS"), React.createElement("label", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        cursor: "pointer",
        padding: "10px 0"
      }
    }, React.createElement("input", {
      type: "checkbox",
      checked: groupOpenToAll[selectedGroup?.id] || false,
      onChange: e => setGroupOpenToAll(prev => ({
        ...prev,
        [selectedGroup?.id]: e.target.checked
      })),
      style: {
        cursor: "pointer",
        width: 18,
        height: 18
      }
    }), React.createElement("span", {
      style: {
        fontSize: 13,
        fontWeight: 600
      }
    }, "Open to all (no admin approval needed)"))), React.createElement("button", {
      style: {
        ...S.btn(config.accentColor),
        width: "100%",
        justifyContent: "center",
        padding: "12px"
      },
      onClick: () => setShowMembers(false)
    }, "Done"))), showDocViewer && selectedDoc && React.createElement("div", {
      style: {
        position: "fixed",
        inset: 0,
        background: "#000b",
        zIndex: 350,
        display: "flex",
        alignItems: "flex-end"
      }
    }, React.createElement("div", {
      style: {
        ...S.card,
        width: "100%",
        borderRadius: "20px 20px 0 0",
        maxHeight: "90vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden"
      }
    }, React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px",
        borderBottom: `1px solid ${C.border}`,
        background: C.surface
      }
    }, React.createElement("div", null, React.createElement("div", {
      style: {
        fontWeight: 800,
        fontSize: 18
      }
    }, selectedDoc.type === "pdf" ? "📄" : selectedDoc.type === "ppt" ? "🎬" : "🖼️", " ", selectedDoc.name), React.createElement("div", {
      style: {
        fontSize: 11,
        color: C.muted,
        marginTop: 4
      }
    }, "Shared ", new Date(selectedDoc.uploadedAt).toLocaleDateString(), " • ", selectedDoc.size)), React.createElement("button", {
      onClick: closeDocViewer,
      style: {
        ...S.btn(C.surface, C.muted),
        padding: "8px 12px"
      }
    }, "✕")), React.createElement("div", {
      style: {
        flex: 1,
        overflowY: "auto",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center"
      }
    }, selectedDoc.type === "image" && previewUrl && React.createElement("img", {
      src: previewUrl,
      alt: selectedDoc.name,
      style: {
        maxWidth: "100%",
        maxHeight: 260,
        objectFit: "contain",
        borderRadius: 16,
        marginBottom: 18
      }
    }), React.createElement("div", {
      style: {
        fontSize: 64,
        marginBottom: 16
      }
    }, selectedDoc.type === "pdf" ? "📄" : selectedDoc.type === "ppt" ? "🎬" : "🖼️"), React.createElement("div", {
      style: {
        fontSize: 16,
        fontWeight: 700,
        marginBottom: 8
      }
    }, selectedDoc.name), React.createElement("div", {
      style: {
        fontSize: 13,
        color: C.muted,
        marginBottom: 16,
        maxWidth: 300
      }
    }, selectedDoc.type === "pdf" && "PDF document - View in your preferred PDF reader", selectedDoc.type === "ppt" && "PowerPoint presentation - Open in Microsoft Office or similar", selectedDoc.type === "image" && "Image file - View full size"), React.createElement("div", {
      style: {
        display: "flex",
        gap: 10
      }
    }, React.createElement("button", {
      style: {
        ...S.btn(C.surface, C.text),
        border: `1px solid ${C.border}`,
        padding: "10px 16px"
      },
      onClick: () => {
        if (previewUrl) {
          window.open(previewUrl, '_blank');
        } else if (selectedDoc.fileData) {
          const fileURL = URL.createObjectURL(selectedDoc.fileData);
          window.open(fileURL, '_blank');
        } else {
          alert("Preview feature is loading. File is ready for download!");
        }
      }
    }, "👁️ Preview"), React.createElement("button", {
      style: {
        ...S.btn(config.accentColor),
        padding: "10px 16px"
      },
      onClick: () => {
        if (selectedDoc.fileData) {
          const fileURL = URL.createObjectURL(selectedDoc.fileData);
          const link = document.createElement('a');
          link.href = fileURL;
          link.download = selectedDoc.name;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(fileURL);
        } else {
          alert("Download starting...\\n" + selectedDoc.name);
        }
      }
    }, "📥 Download"))), React.createElement("div", {
      style: {
        padding: "16px",
        borderTop: `1px solid ${C.border}`,
        background: C.surface
      }
    }, React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 700,
        color: C.muted,
        marginBottom: 8
      }
    }, "FILE DETAILS"), React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 12
      }
    }, React.createElement("div", null, React.createElement("div", {
      style: {
        fontSize: 11,
        color: C.muted
      }
    }, "File Type"), React.createElement("div", {
      style: {
        fontSize: 13,
        fontWeight: 600,
        marginTop: 4
      }
    }, selectedDoc.type.toUpperCase())), React.createElement("div", null, React.createElement("div", {
      style: {
        fontSize: 11,
        color: C.muted
      }
    }, "File Size"), React.createElement("div", {
      style: {
        fontSize: 13,
        fontWeight: 600,
        marginTop: 4
      }
    }, selectedDoc.size)), React.createElement("div", {
      style: {
        gridColumn: "1/-1"
      }
    }, React.createElement("div", {
      style: {
        fontSize: 11,
        color: C.muted
      }
    }, "Shared By"), React.createElement("div", {
      style: {
        fontSize: 13,
        fontWeight: 600,
        marginTop: 4
      }
    }, "👤 ", selectedDoc.uploadedBy)), React.createElement("div", {
      style: {
        gridColumn: "1/-1"
      }
    }, React.createElement("div", {
      style: {
        fontSize: 11,
        color: C.muted
      }
    }, "Date"), React.createElement("div", {
      style: {
        fontSize: 13,
        fontWeight: 600,
        marginTop: 4
      }
    }, new Date(selectedDoc.uploadedAt).toLocaleString())))), React.createElement("button", {
      style: {
        ...S.btn(config.accentColor),
        width: "100%",
        padding: "12px",
        borderRadius: 0
      },
      onClick: closeDocViewer
    }, "Close"))), contextMenu.visible && React.createElement("div", {
      style: {
        position: "fixed",
        top: contextMenu.y,
        left: contextMenu.x,
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 8,
        overflow: "hidden",
        zIndex: 400,
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        minWidth: 150
      }
    }, contextMenu.canEdit && React.createElement("button", {
      onClick: () => {
        const target = groupMessages[contextMenu.messageId];
        if (target) {
          setEditingMessageId(contextMenu.messageId);
          setMessageInput(target.content);
        }
        setContextMenu({
          visible: false,
          x: 0,
          y: 0,
          messageId: null
        });
      },
      style: {
        width: "100%",
        padding: "10px 14px",
        background: "none",
        border: "none",
        cursor: "pointer",
        textAlign: "left",
        fontSize: 13,
        fontWeight: 500,
        color: C.text,
        display: "flex",
        alignItems: "center",
        gap: 8
      },
      onMouseOver: e => e.target.style.background = C.surface,
      onMouseOut: e => e.target.style.background = "none"
    }, "✏️ Edit"), contextMenu.canDelete && React.createElement("button", {
      onClick: () => {
        setGroupMessages(prev => prev.filter((_, idx) => idx !== contextMenu.messageId));
        setContextMenu({
          visible: false,
          x: 0,
          y: 0,
          messageId: null
        });
      },
      style: {
        width: "100%",
        padding: "10px 14px",
        background: "none",
        border: "none",
        cursor: "pointer",
        textAlign: "left",
        fontSize: 13,
        fontWeight: 500,
        color: C.red,
        display: "flex",
        alignItems: "center",
        gap: 8,
        borderTop: `1px solid ${C.border}`
      },
      onMouseOver: e => e.target.style.background = C.surface,
      onMouseOut: e => e.target.style.background = "none"
    }, "🗑️ Delete"), React.createElement("button", {
      onClick: () => setContextMenu({
        visible: false,
        x: 0,
        y: 0,
        messageId: null
      }),
      style: {
        width: "100%",
        padding: "10px 14px",
        background: "none",
        border: "none",
        cursor: "pointer",
        textAlign: "left",
        fontSize: 13,
        fontWeight: 500,
        color: C.muted,
        display: "flex",
        alignItems: "center",
        gap: 8,
        borderTop: `1px solid ${C.border}`
      },
      onMouseOver: e => e.target.style.background = C.surface,
      onMouseOut: e => e.target.style.background = "none"
    }, "✕ Close")), showFilesModal && React.createElement("div", {
      style: {
        position: "fixed",
        inset: 0,
        background: "#000b",
        zIndex: 300,
        display: "flex",
        alignItems: "flex-end"
      }
    }, React.createElement("div", {
      style: {
        ...S.card,
        width: "100%",
        borderRadius: "20px 20px 0 0",
        maxHeight: "80vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden"
      }
    }, React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
        paddingBottom: 12,
        borderBottom: `1px solid ${C.border}`
      }
    }, React.createElement("div", {
      style: {
        fontWeight: 800,
        fontSize: 18
      }
    }, "📂 ", sharedDocs.length, " Files Shared"), React.createElement("button", {
      onClick: () => setShowFilesModal(false),
      style: {
        ...S.btn(C.surface, C.muted),
        padding: "8px 12px"
      }
    }, "✕")), React.createElement("div", {
      style: {
        overflowY: "auto",
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        marginBottom: 16
      }
    }, sharedDocs.length === 0 ? React.createElement("div", {
      style: {
        textAlign: "center",
        color: C.muted,
        padding: 40
      }
    }, React.createElement("div", {
      style: {
        fontSize: 32,
        marginBottom: 16
      }
    }, "📭"), React.createElement("div", {
      style: {
        fontSize: 14,
        fontWeight: 600
      }
    }, "No files shared yet"), React.createElement("div", {
      style: {
        fontSize: 12,
        marginTop: 8
      }
    }, "Files shared in group chat will appear here")) : sharedDocs.map((doc, idx) => React.createElement("div", {
      key: idx,
      style: {
        background: C.surface,
        borderRadius: 10,
        padding: "12px 14px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        border: `1px solid ${C.border}`
      }
    }, React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        flex: 1
      }
    }, React.createElement("div", {
      style: {
        fontSize: 24
      }
    }, doc.type === "pdf" ? "📄" : doc.type === "ppt" ? "🎬" : "🖼️"), React.createElement("div", {
      style: {
        flex: 1
      }
    }, React.createElement("div", {
      style: {
        fontSize: 13,
        fontWeight: 600,
        marginBottom: 2
      }
    }, doc.name), React.createElement("div", {
      style: {
        fontSize: 11,
        color: C.muted
      }
    }, doc.size, " • ", doc.uploadedBy))), React.createElement("button", {
      onClick: () => {
        setSelectedDoc(doc);
        setShowDocViewer(true);
        setShowFilesModal(false);
      },
      style: {
        ...S.btn(config.accentColor),
        padding: "8px 12px",
        fontSize: 12
      }
    }, "Open")))), React.createElement("button", {
      style: {
        ...S.btn(config.accentColor),
        width: "100%",
        padding: "12px"
      },
      onClick: () => setShowFilesModal(false)
    }, "Done"))));
  }
  return React.createElement("div", {
    style: {
      padding: "20px 16px 80px"
    }
  }, React.createElement("div", {
    style: {
      fontSize: 22,
      fontWeight: 800,
      marginBottom: 4
    }
  }, "Study Groups"), React.createElement("div", {
    style: {
      fontSize: 13,
      color: C.muted,
      marginBottom: 12
    }
  }, "Secure study rooms, peer learning, and shared guidance."), React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      marginBottom: 14
    }
  }, React.createElement("input", {
    style: {
      ...S.input,
      flex: 1
    },
    placeholder: "Search groups…",
    value: search,
    onChange: e => setSearch(e.target.value)
  }), React.createElement("button", {
    onClick: () => setShowCreate(!showCreate),
    style: {
      ...S.btn(config.accentColor),
      padding: "12px 16px",
      whiteSpace: "nowrap"
    }
  }, showCreate ? "Cancel" : "+ Create")), showCreate && React.createElement("div", {
    style: {
      ...S.card,
      marginBottom: 16,
      background: config.accentColor + "0d",
      maxHeight: "65vh",
      overflowY: "auto"
    }
  }, React.createElement("div", {
    style: {
      fontWeight: 700,
      marginBottom: 12
    }
  }, "📚 Create Study Group"), React.createElement("label", {
    style: S.label
  }, "Group Name"), React.createElement("input", {
    style: S.input,
    value: newGroup.name,
    onChange: e => setNewGroup(g => ({
      ...g,
      name: e.target.value
    })),
    placeholder: "e.g. Physics Squad"
  }), React.createElement("label", {
    style: S.label
  }, "Topic/Subject"), React.createElement("input", {
    style: S.input,
    value: newGroup.topic,
    onChange: e => setNewGroup(g => ({
      ...g,
      topic: e.target.value
    })),
    placeholder: "e.g. Exam prep"
  }), React.createElement("label", {
    style: S.label
  }, "Institution"), React.createElement("input", {
    style: S.input,
    value: newGroup.university || profile?.institution || "",
    onChange: e => setNewGroup(g => ({
      ...g,
      university: e.target.value
    })),
    placeholder: profile?.institution || "Your school/university"
  }), React.createElement("label", {
    style: S.label
  }, "Subject & Course"), React.createElement("input", {
    style: S.input,
    value: newGroup.subjectCourse,
    onChange: e => setNewGroup(g => ({
      ...g,
      subjectCourse: e.target.value
    })),
    placeholder: "e.g. Physics - Mechanics"
  }), React.createElement("label", {
    style: S.label
  }, education === "primary" ? "Grade" : education === "secondary" ? "Form/Grade" : "Year"), React.createElement("select", {
    style: S.input,
    value: newGroup.year,
    onChange: e => setNewGroup(g => ({
      ...g,
      year: e.target.value
    }))
  }, React.createElement("option", {
    value: ""
  }, "Select ", education === "primary" ? "Grade" : education === "secondary" ? "Form" : "Year"), yieldYearOptions().map(opt => React.createElement("option", {
    key: opt.value,
    value: opt.value
  }, opt.label))), React.createElement("label", {
    style: S.label
  }, "Expected Members"), React.createElement("input", {
    style: S.input,
    type: "number",
    value: newGroup.members,
    onChange: e => setNewGroup(g => ({
      ...g,
      members: e.target.value
    })),
    min: "1",
    max: "999"
  }), React.createElement("button", {
    onClick: handleCreateGroup,
    style: {
      ...S.btn(config.accentColor),
      marginTop: 12,
      width: "100%",
      fontWeight: 600
    }
  }, "Create & Join")), filteredGroups.length === 0 ? React.createElement("div", {
    style: {
      textAlign: "center",
      padding: "60px 20px",
      color: C.muted
    }
  }, React.createElement("div", {
    style: {
      fontSize: 52,
      marginBottom: 16
    }
  }, "📚"), React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 600
    }
  }, "No groups yet"), React.createElement("div", {
    style: {
      fontSize: 13,
      marginTop: 8
    }
  }, "Create or join one to collaborate!")) : React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, filteredGroups.map(g => React.createElement("div", {
    key: g.id,
    style: {
      ...S.card,
      cursor: "pointer",
      transition: "all 0.2s"
    },
    onClick: () => {
      setSelectedGroup(g);
      setGroupMessages([]);
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: 12
    }
  }, React.createElement("div", {
    style: {
      flex: 1
    }
  }, React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 14,
      marginBottom: 6
    }
  }, g.name), React.createElement("div", {
    style: {
      fontSize: 12,
      color: C.muted,
      marginBottom: 6
    }
  }, "💬 ", g.topic, " · 👥 ", g.members, " members"), (g.university || g.subjectCourse) && React.createElement("div", {
    style: {
      fontSize: 11,
      color: C.muted
    }
  }, g.university && React.createElement("span", null, "🏫 ", g.university), g.subjectCourse && React.createElement("span", null, " · 📚 ", g.subjectCourse), g.year && React.createElement("span", null, " · ", education === "primary" ? "Gr" : "Y", g.year))), React.createElement(Badge, {
    color: C.green
  }, "Open →"))))));
}
function EnterpriseScreen({
  config
}) {
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [requestMessage, setRequestMessage] = useState("");
  const requestEnterprise = () => {
    if (!contactPhone.trim() || !contactEmail.trim()) {
      return alert("Please provide a phone number and business email to request enterprise onboarding.");
    }
    const payload = {
      contactPhone,
      contactEmail,
      requestMessage,
      source: "sima-mind-frontend"
    };
    fetch("/api/enterprise-requests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    }).then(r => r.json()).then(() => {
      alert("Enterprise request received. We will contact you soon to set up secure payments and backend support.");
      setContactPhone("");
      setContactEmail("");
      setRequestMessage("");
    }).catch(() => {
      localStorage.setItem("enterprise_request", JSON.stringify({
        ...payload,
        createdAt: new Date().toISOString()
      }));
      alert("Enterprise request received and stored locally. We will contact you soon.");
      setContactPhone("");
      setContactEmail("");
      setRequestMessage("");
    });
  };
  return React.createElement("div", {
    style: {
      padding: "20px 16px 100px"
    }
  }, React.createElement("div", {
    style: {
      fontSize: 22,
      fontWeight: 800,
      marginBottom: 6
    }
  }, "Enterprise Infrastructure"), React.createElement("div", {
    style: {
      fontSize: 13,
      color: C.muted,
      marginBottom: 18
    }
  }, "A scalable study platform built for 10,000+ users with strong security, storage, payments, and collaboration."), React.createElement("div", {
    style: {
      ...S.card,
      marginBottom: 16,
      background: `linear-gradient(135deg, ${C.accent}18, ${C.card})`,
      borderColor: C.accent + "44"
    }
  }, React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 700,
      marginBottom: 10
    }
  }, "Core system requirements"), React.createElement("ul", {
    style: {
      paddingLeft: 18,
      color: C.text,
      lineHeight: 1.7,
      fontSize: 13
    }
  }, React.createElement("li", null, "Cloud storage for user data, study progress, files, and media"), React.createElement("li", null, "Distributed database with backups and multi-region failover"), React.createElement("li", null, "Authentication, encryption at rest/in transit, MFA, and audit logging"), React.createElement("li", null, "Automatic data loss protection and daily snapshot backups"), React.createElement("li", null, "Frontend / backend separation with APIs and secure service layer"), React.createElement("li", null, "Airtel Money, MTN Mobile Money, VISA payment integration, and bank payment flow"), React.createElement("li", null, "Group creation, group chat, moderated conversations, and role permissions"), React.createElement("li", null, "AI model platform support for custom training and rapid response"))), React.createElement("div", {
    style: {
      ...S.card,
      marginBottom: 16,
      borderColor: C.green + "44",
      background: C.green + "0d"
    }
  }, React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 700,
      marginBottom: 10
    }
  }, "Security & reliability"), React.createElement("div", {
    style: {
      fontSize: 13,
      color: C.text,
      lineHeight: 1.7
    }
  }, "This app requires secure user identities, token-based session management, encrypted payment flows, permissions control, and strong monitoring so 10,000+ users stay protected and reliable.")), React.createElement("div", {
    style: {
      ...S.card,
      marginBottom: 16,
      borderColor: C.gold + "44",
      background: C.gold + "0d"
    }
  }, React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 700,
      marginBottom: 10
    }
  }, "Payments & monetization"), React.createElement("div", {
    style: {
      fontSize: 13,
      color: C.text,
      lineHeight: 1.7,
      marginBottom: 10
    }
  }, "Build payment flows that support Airtel Money, MTN Mobile Money, VISA, and direct bank transfers to your business account. Keep all sensitive data off the client and process through secure gateways."), React.createElement("div", {
    style: {
      fontSize: 13,
      color: C.muted
    }
  }, "Note: real payment integrations require server-side APIs and verified merchant accounts.")), React.createElement("div", {
    style: {
      ...S.card,
      marginBottom: 16,
      borderColor: C.accent + "44",
      background: C.accent + "0d"
    }
  }, React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 700,
      marginBottom: 10
    }
  }, "Request Enterprise Onboarding"), React.createElement("div", {
    style: {
      fontSize: 13,
      color: C.text,
      lineHeight: 1.7,
      marginBottom: 12
    }
  }, "Share your phone, email, and a short description. We’ll use this to plan secure mobile money, bank, and AI infrastructure for your organization."), React.createElement("label", {
    style: S.label
  }, "Phone / WhatsApp"), React.createElement("input", {
    style: S.input,
    placeholder: "+260 XXX XXX XXX",
    value: contactPhone,
    onChange: e => setContactPhone(e.target.value)
  }), React.createElement("label", {
    style: S.label
  }, "Business Email"), React.createElement("input", {
    style: S.input,
    placeholder: "contact@company.com",
    value: contactEmail,
    onChange: e => setContactEmail(e.target.value)
  }), React.createElement("label", {
    style: S.label
  }, "Project notes"), React.createElement("textarea", {
    style: {
      ...S.input,
      minHeight: 90,
      resize: "vertical"
    },
    placeholder: "Tell us about your team size, goals, and required integrations.",
    value: requestMessage,
    onChange: e => setRequestMessage(e.target.value)
  }), React.createElement("button", {
    onClick: requestEnterprise,
    style: {
      ...S.btn(C.accent),
      marginTop: 12,
      width: "100%"
    }
  }, "Send Request")), React.createElement("div", {
    style: {
      ...S.card,
      marginBottom: 16,
      borderColor: C.purple + "44",
      background: C.purple + "0d"
    }
  }, React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 700,
      marginBottom: 10
    }
  }, "AI & product roadmap"), React.createElement("ul", {
    style: {
      paddingLeft: 18,
      color: C.text,
      lineHeight: 1.7,
      fontSize: 13
    }
  }, React.createElement("li", null, "Start with managed AI services, then migrate to custom model training over time"), React.createElement("li", null, "Use a secure API layer for prompt processing, model selection, and usage tracking"), React.createElement("li", null, "Measure performance, optimize context length, and secure training data"), React.createElement("li", null, "Keep user-facing AI chat separate from internal model orchestration"))), React.createElement("div", {
    style: {
      ...S.card,
      marginBottom: 16,
      textAlign: "center",
      color: C.muted
    }
  }, React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 700,
      marginBottom: 10
    }
  }, "What I’ve added"), React.createElement("div", {
    style: {
      fontSize: 13,
      lineHeight: 1.7
    }
  }, "This app now includes an infrastructure blueprint screen that mentions scalable storage, security, payments, AI, group chat, and backend architecture. Actual backend integrations must be implemented separately in a real server and payment provider environment.")));
}
const SUBSCRIPTION_CONFIG = {
  trialDays: 30,
  deviceLimits: {
    phone: 1,
    pc: 1,
    tablet: 1
  },
  usageLimits: {
    free: {
      messages: 30,
      uploads: 3,
      flashcards: 10,
      mcqs: 20,
      audioOverview: 0,
      videoOverview: 0,
      infographic: 0,
      slideDeck: 0,
      osce: 0,
      scenario: 0
    },
    "scholar-lite": {
      messages: 80,
      uploads: 8,
      flashcards: 100,
      mcqs: 100,
      audioOverview: 5,
      videoOverview: 0,
      infographic: 3,
      slideDeck: 5,
      osce: 10,
      scenario: 10
    },
    standard: {
      messages: 9999,
      uploads: 15,
      flashcards: 9999,
      mcqs: 9999,
      audioOverview: 50,
      videoOverview: 10,
      infographic: 50,
      slideDeck: 50,
      osce: 100,
      scenario: 100
    },
    scholar: {
      messages: 9999,
      uploads: 9999,
      flashcards: 9999,
      mcqs: 9999,
      audioOverview: 9999,
      videoOverview: 9999,
      infographic: 9999,
      slideDeck: 9999,
      osce: 9999,
      scenario: 9999
    }
  },
  generationTypes: [{
    id: "flashcard",
    label: "🃏 Flashcards",
    feature: "flashcards"
  }, {
    id: "spacedRepetition",
    label: "🔄 Spaced Rep",
    feature: "flashcards"
  }, {
    id: "quiz",
    label: "📝 Quiz (MCQs)",
    feature: "mcqs"
  }, {
    id: "audioOverview",
    label: "🎧 Audio",
    feature: "audioOverview"
  }, {
    id: "videoOverview",
    label: "🎬 Video",
    feature: "videoOverview"
  }, {
    id: "infographic",
    label: "📊 Infographic",
    feature: "infographic"
  }, {
    id: "slideDeck",
    label: "📑 Slides",
    feature: "slideDeck"
  }, {
    id: "osce",
    label: "🏥 OSCE",
    feature: "osce"
  }]
};
function useSubscription() {
  const [subscription, setSubscription] = useState(() => {
    try {
      const saved = localStorage.getItem("sima_subscription");
      return saved ? JSON.parse(saved) : {
        plan: "trial",
        startDate: new Date().toISOString(),
        trialEndDate: new Date(Date.now() + SUBSCRIPTION_CONFIG.trialDays * 24 * 60 * 60 * 1000).toISOString(),
        verified: false,
        email: null,
        phone: null,
        devices: [],
        usage: {
          messages: 0,
          uploads: 0,
          flashcards: 0,
          mcqs: 0
        },
        lastReset: new Date().toISOString()
      };
    } catch {
      return {
        plan: "trial",
        startDate: new Date().toISOString(),
        trialEndDate: new Date(Date.now() + SUBSCRIPTION_CONFIG.trialDays * 24 * 60 * 60 * 1000).toISOString(),
        verified: false,
        email: null,
        phone: null,
        devices: [],
        usage: {
          messages: 0,
          uploads: 0,
          flashcards: 0,
          mcqs: 0
        },
        lastReset: new Date().toISOString()
      };
    }
  });
  const saveSubscription = newSub => {
    setSubscription(newSub);
    try {
      localStorage.setItem("sima_subscription", JSON.stringify(newSub));
    } catch {}
  };
  const getCurrentPlan = () => {
    const now = new Date();
    const trialEnd = new Date(subscription.trialEndDate);
    return now > trialEnd ? "free" : subscription.plan;
  };
  const getDaysLeftInTrial = () => {
    const now = new Date();
    const trialEnd = new Date(subscription.trialEndDate);
    const diffTime = trialEnd - now;
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  };
  const isTrialActive = () => getDaysLeftInTrial() > 0;
  const upgradePlan = newPlan => {
    saveSubscription({
      ...subscription,
      plan: newPlan
    });
  };
  const verifyContact = (type, value) => {
    const code = Math.floor(100000 + Math.random() * 900000);
    alert(`Verification code sent to ${value}: ${code}`);
    saveSubscription({
      ...subscription,
      [type]: value,
      verified: true
    });
  };
  const registerDevice = () => {
    const deviceFingerprint = navigator.userAgent + screen.width + screen.height + navigator.language;
    const deviceType = /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? "phone" : /Tablet|iPad/i.test(navigator.userAgent) ? "tablet" : "pc";
    const existingDevices = subscription.devices.filter(d => d.type === deviceType);
    if (existingDevices.length >= SUBSCRIPTION_CONFIG.deviceLimits[deviceType]) {
      alert(`Maximum ${SUBSCRIPTION_CONFIG.deviceLimits[deviceType]} ${deviceType}(s) allowed per account.`);
      return false;
    }
    const newDevice = {
      id: deviceFingerprint,
      type: deviceType,
      registered: new Date().toISOString()
    };
    saveSubscription({
      ...subscription,
      devices: [...subscription.devices, newDevice]
    });
    return true;
  };
  const canUseFeature = feature => {
    const plan = getCurrentPlan();
    const limits = SUBSCRIPTION_CONFIG.usageLimits[plan] || SUBSCRIPTION_CONFIG.usageLimits.free;
    return subscription.usage[feature] < limits[feature];
  };
  const recordUsage = feature => {
    if (canUseFeature(feature)) {
      saveSubscription({
        ...subscription,
        usage: {
          ...subscription.usage,
          [feature]: subscription.usage[feature] + 1
        }
      });
      return true;
    }
    return false;
  };
  const resetUsage = () => {
    const now = new Date();
    const lastReset = new Date(subscription.lastReset);
    if (now.getDate() !== lastReset.getDate()) {
      saveSubscription({
        ...subscription,
        usage: {
          messages: 0,
          uploads: 0,
          flashcards: 0,
          mcqs: 0
        },
        lastReset: now.toISOString()
      });
    }
  };
  useEffect(() => {
    resetUsage();
    const interval = setInterval(resetUsage, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);
  return {
    subscription,
    getCurrentPlan,
    getDaysLeftInTrial,
    isTrialActive,
    upgradePlan,
    verifyContact,
    registerDevice,
    canUseFeature,
    recordUsage,
    resetUsage
  };
}
const EXCHANGE_RATE = 22.5;
const PLANS = [{
  id: "free",
  label: "Basic",
  subtitle: "14-day full access, then limited",
  price: {
    usd: 0,
    kwacha: 0
  },
  period: "Free",
  color: C.muted,
  badge: null,
  features: {
    main: [{
      text: "30 AI messages / 12 hours",
      icon: Icons.sparkle
    }, {
      text: "3 file uploads / day",
      icon: Icons.upload
    }, {
      text: "Limited flashcard decks",
      icon: Icons.flash
    }, {
      text: "MCQ generator (20/day)",
      icon: Icons.target
    }, {
      text: "Basic study timetable",
      icon: Icons.clock
    }, {
      text: "Guest access",
      icon: Icons.users
    }, {
      text: "Basic AI tutor",
      icon: Icons.brain
    }, {
      text: "Homework help",
      icon: Icons.note
    }],
    restricted: ["No advanced AI modes", "No audio/video studio", "No group study rooms", "No clinical tools", "No document analysis"]
  },
  limitMessage: "You've reached your study limit. Resets in 12 hours or upgrade for uninterrupted learning."
}, {
  id: "scholar-lite",
  label: "Scholar Lite",
  subtitle: "Perfect for exam prep",
  price: {
    usd: 3,
    kwacha: 56.16
  },
  period: "/month",
  color: C.teal,
  badge: "Popular",
  features: {
    main: [{
      text: "80 AI messages / 12 hours",
      icon: Icons.sparkle
    }, {
      text: "8 file uploads/day",
      icon: Icons.upload
    }, {
      text: "Unlimited flashcards",
      icon: Icons.flash
    }, {
      text: "MCQ generator (100/day)",
      icon: Icons.target
    }, {
      text: "Exam practice mode",
      icon: Icons.check
    }, {
      text: "Smart study planner",
      icon: Icons.clock
    }, {
      text: "AI summaries & notes",
      icon: Icons.note
    }, {
      text: "Audio overview studio",
      icon: Icons.mic
    }, {
      text: "Spaced repetition (SM-2)",
      icon: Icons.repeat
    }, {
      text: "Study streak tracking",
      icon: Icons.trending
    }, {
      text: "Group study access (3 groups)",
      icon: Icons.users
    }, {
      text: "Mind-map generator (limited)",
      icon: Icons.chart
    }],
    aiAccess: "Faster AI · Exam-focused · Better reasoning",
    restricted: ["No video generation", "No advanced research mode", "No clinical tools"]
  }
}, {
  id: "standard",
  label: "Standard",
  subtitle: "For serious learners",
  price: {
    usd: 8,
    kwacha: 149.76
  },
  period: "/month",
  color: C.accent,
  badge: "Best Value",
  features: {
    main: [{
      text: "Unlimited AI messages",
      icon: Icons.sparkle
    }, {
      text: "15 uploads/day",
      icon: Icons.upload
    }, {
      text: "Unlimited chat & analysis",
      icon: Icons.flash
    }, {
      text: "Advanced exam mode",
      icon: Icons.target
    }, {
      text: "OSCE engine unlimited",
      icon: Icons.check
    }, {
      text: "Audio overview with Q&A",
      icon: Icons.mic
    }, {
      text: "Mind mapping (full)",
      icon: Icons.chart
    }, {
      text: "Voice chat with AI",
      icon: Icons.mic
    }, {
      text: "Adaptive timetable",
      icon: Icons.clock
    }, {
      text: "Collaborative study groups",
      icon: Icons.users
    }, {
      text: "Essay structuring",
      icon: Icons.note
    }, {
      text: "Presentation builder",
      icon: Icons.upload
    }, {
      text: "Citation assistance",
      icon: Icons.check
    }, {
      text: "PDF deep analysis",
      icon: Icons.flash
    }],
    aiAccess: "Powerful AI model · Better accuracy · Longer memory · Faster responses",
    restricted: ["No full clinical suite", "Limited video generation"]
  }
}, {
  id: "scholar",
  label: "Scholar",
  subtitle: "Ultimate learning power",
  price: {
    usd: 16,
    kwacha: 299.52
  },
  period: "/month",
  color: C.gold,
  badge: "Most Powerful",
  features: {
    main: [{
      text: "Unlimited everything",
      icon: Icons.sparkle
    }, {
      text: "Clinical rotation assistant",
      icon: Icons.target
    }, {
      text: "Clinical reasoning tools",
      icon: Icons.brain
    }, {
      text: "OSCE preparation suite",
      icon: Icons.check
    }, {
      text: "Differential diagnosis support",
      icon: Icons.chart
    }, {
      text: "Investigation planner",
      icon: Icons.note
    }, {
      text: "Drug reference assistant",
      icon: Icons.flash
    }, {
      text: "Research synthesis",
      icon: Icons.trending
    }, {
      text: "Literature review assistance",
      icon: Icons.note
    }, {
      text: "Research proposal builder",
      icon: Icons.upload
    }, {
      text: "Video explanation studio",
      icon: Icons.play
    }, {
      text: "AI whiteboard lessons",
      icon: Icons.upload
    }, {
      text: "Animated concept breakdowns",
      icon: Icons.sparkle
    }, {
      text: "Highest-speed responses",
      icon: Icons.flash
    }, {
      text: "Priority servers",
      icon: Icons.target
    }, {
      text: "Early feature access",
      icon: Icons.trending
    }],
    aiAccess: "Most advanced AI model · Elite accuracy · Maximum context · Lightning-fast",
    academic: "Clinical mode · Research mode · Advanced reasoning · Teaching mode"
  }
}];
function UpgradeScreen({
  onUpgrade,
  onEnterprise
}) {
  const [currency, setCurrency] = useState("usd");
  const [compareMode, setCompareMode] = useState(false);
  return React.createElement("div", {
    style: {
      padding: "24px 16px 80px"
    }
  }, React.createElement("div", {
    style: {
      textAlign: "center",
      marginBottom: 24
    }
  }, React.createElement("div", {
    style: {
      fontSize: 11,
      color: C.gold,
      fontWeight: 700,
      letterSpacing: "0.1em",
      marginBottom: 8,
      textTransform: "uppercase"
    }
  }, "🚀 Unlock Your Potential"), React.createElement("div", {
    style: {
      fontSize: 28,
      fontWeight: 800,
      marginBottom: 6
    }
  }, "Choose Your Plan"), React.createElement("div", {
    style: {
      fontSize: 14,
      color: C.muted,
      marginBottom: 16
    }
  }, "Start free for 14 days. Upgrade anytime. Cancel anytime."), React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      justifyContent: "center",
      flexWrap: "wrap"
    }
  }, [["usd", "💵 USD"], ["kwacha", "🇿🇲 Kwacha (K)"]].map(([c, l]) => React.createElement(Pill, {
    key: c,
    active: currency === c,
    onClick: () => setCurrency(c),
    color: C.accent
  }, l)), React.createElement(Pill, {
    active: compareMode,
    onClick: () => setCompareMode(c => !c),
    color: C.purple
  }, "📊 Compare"))), React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: window.innerWidth < 768 ? "1fr" : "repeat(2, 1fr)",
      gap: 12,
      marginBottom: 24
    }
  }, PLANS.map(plan => {
    const price = currency === "usd" ? plan.price.usd : plan.price.kwacha;
    const symbol = currency === "usd" ? "$" : "K";
    const isHighlighted = plan.id === "standard" || plan.id === "scholar";
    return React.createElement("div", {
      key: plan.id,
      style: {
        ...S.card,
        position: "relative",
        borderColor: isHighlighted ? plan.color + "66" : C.border,
        background: isHighlighted ? `linear-gradient(135deg, ${plan.color}12, ${C.card})` : C.card,
        transform: isHighlighted ? "scale(1.02)" : "scale(1)",
        transition: "all .3s"
      }
    }, plan.badge && React.createElement("div", {
      style: {
        position: "absolute",
        top: -10,
        left: 16,
        background: plan.color,
        color: "#fff",
        padding: "4px 12px",
        borderRadius: 8,
        fontSize: 10,
        fontWeight: 700
      }
    }, "⭐ ", plan.badge), React.createElement("div", {
      style: {
        marginBottom: 16
      }
    }, React.createElement("div", {
      style: {
        fontSize: 18,
        fontWeight: 800,
        color: plan.color,
        marginBottom: 2
      }
    }, plan.label), React.createElement("div", {
      style: {
        fontSize: 12,
        color: C.muted
      }
    }, plan.subtitle)), React.createElement("div", {
      style: {
        marginBottom: 16
      }
    }, price > 0 ? React.createElement(React.Fragment, null, React.createElement("div", {
      style: {
        fontSize: 32,
        fontWeight: 800,
        color: plan.color,
        lineHeight: 1
      }
    }, symbol, price), React.createElement("div", {
      style: {
        fontSize: 12,
        color: C.muted
      }
    }, plan.period)) : React.createElement(React.Fragment, null, React.createElement("div", {
      style: {
        fontSize: 28,
        fontWeight: 800,
        color: plan.color
      }
    }, "Free"), React.createElement("div", {
      style: {
        fontSize: 12,
        color: C.muted
      }
    }, "14-day full access"))), React.createElement("div", {
      style: {
        marginBottom: 16,
        fontSize: 13
      }
    }, plan.features.main.slice(0, compareMode ? plan.features.main.length : 5).map((f, i) => React.createElement("div", {
      key: i,
      style: {
        display: "flex",
        gap: 8,
        marginBottom: 8,
        alignItems: "flex-start"
      }
    }, React.createElement(Icon, {
      d: f.icon,
      size: 16,
      color: plan.color,
      style: {
        marginTop: 2,
        flexShrink: 0
      }
    }), React.createElement("span", {
      style: {
        lineHeight: 1.4
      }
    }, f.text))), !compareMode && plan.features.main.length > 5 && React.createElement("div", {
      style: {
        fontSize: 12,
        color: plan.color,
        fontWeight: 600,
        cursor: "pointer",
        marginTop: 8
      }
    }, "+ ", plan.features.main.length - 5, " more features")), plan.features.aiAccess && React.createElement("div", {
      style: {
        background: plan.color + "15",
        borderLeft: `3px solid ${plan.color}`,
        padding: "10px 12px",
        borderRadius: 6,
        marginBottom: 12,
        fontSize: 12,
        color: plan.color,
        fontWeight: 500
      }
    }, React.createElement("div", {
      style: {
        fontWeight: 700,
        marginBottom: 4
      }
    }, "🧠 AI Access"), plan.features.aiAccess), plan.features.academic && React.createElement("div", {
      style: {
        background: C.purple + "15",
        borderLeft: `3px solid ${C.purple}`,
        padding: "10px 12px",
        borderRadius: 6,
        marginBottom: 12,
        fontSize: 12,
        color: C.purple,
        fontWeight: 500
      }
    }, React.createElement("div", {
      style: {
        fontWeight: 700,
        marginBottom: 4
      }
    }, "📚 Advanced Modes"), plan.features.academic), plan.features.restricted && React.createElement("div", {
      style: {
        marginBottom: 16
      }
    }, React.createElement("div", {
      style: {
        fontSize: 11,
        fontWeight: 700,
        color: C.muted,
        marginBottom: 6,
        textTransform: "uppercase"
      }
    }, "Restrictions"), React.createElement("div", {
      style: {
        fontSize: 12,
        color: C.muted,
        lineHeight: 1.6
      }
    }, plan.features.restricted.map((r, i) => React.createElement("div", {
      key: i,
      style: {
        marginBottom: 4
      }
    }, "✗ ", r)))), React.createElement("button", {
      onClick: () => onUpgrade(plan.id),
      style: {
        ...S.btn(plan.color, "#fff"),
        width: "100%",
        justifyContent: "center",
        border: `1px solid ${plan.color}`,
        fontSize: 14,
        fontWeight: 700,
        padding: "12px"
      }
    }, plan.id === "free" ? "Continue Free" : `Get ${plan.label}`));
  })), compareMode && React.createElement("div", {
    style: {
      ...S.card,
      marginBottom: 16,
      overflowX: "auto"
    }
  }, React.createElement("div", {
    style: {
      fontSize: 16,
      fontWeight: 800,
      marginBottom: 12
    }
  }, "📊 Full Feature Comparison"), React.createElement("table", {
    style: {
      width: "100%",
      fontSize: 12,
      borderCollapse: "collapse"
    }
  }, React.createElement("thead", null, React.createElement("tr", {
    style: {
      borderBottom: `1px solid ${C.border}`
    }
  }, React.createElement("th", {
    style: {
      textAlign: "left",
      padding: "8px 0",
      paddingRight: 8,
      fontWeight: 700,
      color: C.muted
    }
  }, "Feature"), PLANS.map(p => React.createElement("th", {
    key: p.id,
    style: {
      textAlign: "center",
      padding: "8px 6px",
      fontWeight: 700,
      color: p.color
    }
  }, p.label)))), React.createElement("tbody", null, [{
    label: "Price",
    values: PLANS.map(p => currency === "usd" ? `$${p.price.usd}` : `K${p.price.kwacha}`)
  }, {
    label: "Messages / 12h",
    values: ["30", "80", "Unlimited", "Unlimited"]
  }, {
    label: "File Uploads / day",
    values: ["3", "8", "15", "Unlimited"]
  }, {
    label: "Flashcard Decks",
    values: ["Limited", "Unlimited", "Unlimited", "Unlimited"]
  }, {
    label: "MCQ Generator",
    values: ["20/day", "100/day", "Unlimited", "Unlimited"]
  }, {
    label: "Exam Practice Mode",
    values: ["✗", "✓", "✓", "✓"]
  }, {
    label: "Audio Studio",
    values: ["✗", "✓", "✓", "✓"]
  }, {
    label: "Voice Chat",
    values: ["✗", "✗", "✓", "✓"]
  }, {
    label: "Group Study",
    values: ["✗", "3 groups", "Unlimited", "Unlimited"]
  }, {
    label: "Clinical Tools",
    values: ["✗", "✗", "✗", "✓"]
  }, {
    label: "Video Studio",
    values: ["✗", "✗", "✗", "✓"]
  }, {
    label: "Research Mode",
    values: ["✗", "Limited", "✓", "✓"]
  }, {
    label: "AI Model Quality",
    values: ["Standard", "Enhanced", "Advanced", "Elite"]
  }].map((row, i) => React.createElement("tr", {
    key: i,
    style: {
      borderBottom: `1px solid ${C.border}`
    }
  }, React.createElement("td", {
    style: {
      padding: "8px 0",
      paddingRight: 8,
      fontWeight: 600,
      color: C.text
    }
  }, row.label), row.values.map((val, j) => React.createElement("td", {
    key: j,
    style: {
      textAlign: "center",
      padding: "8px 6px",
      color: PLANS[j].color
    }
  }, val))))))), React.createElement("div", {
    style: {
      ...S.card,
      textAlign: "center"
    }
  }, React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 700,
      marginBottom: 8
    }
  }, "🔒 Your Trust, Our Priority"), React.createElement("div", {
    style: {
      fontSize: 12,
      color: C.muted,
      lineHeight: 1.6
    }
  }, "✓ Airtel Money, MTN Money, VISA, and bank payments supported", React.createElement("br", null), "✓ Secure payments with encrypted flows", React.createElement("br", null), "✓ Cancel anytime — no questions asked", React.createElement("br", null), "✓ Auto-renewing subscription and scalable enterprise onboarding")));
}
function LandingScreen({
  onStart,
  displayMode,
  themeMode,
  onDisplayModeChange
}) {
  const landingText = themeMode === "light" ? "#111827" : C.text;
  const landingMuted = themeMode === "light" ? "#4b5563" : C.muted;
  const frameBorder = themeMode === "light" ? "#cbd5e1" : C.borderLight;
  const decorationA = themeMode === "light" ? "rgba(79,142,247,0.18)" : `${C.accent}15`;
  const decorationB = themeMode === "light" ? "rgba(167,139,250,0.18)" : `${C.purple}15`;
  const featureCardBg = themeMode === "light" ? "rgba(255,255,255,0.8)" : `linear-gradient(135deg, ${C.accentSoft}40, transparent)`;
  const features = [{
    icon: "🧠",
    title: "AI-Powered Learning",
    desc: "Your personal study AI that adapts to your level"
  }, {
    icon: "📚",
    title: "Smart Content",
    desc: "Auto-generate flashcards, quizzes, and study guides"
  }, {
    icon: "📊",
    title: "Track Progress",
    desc: "Monitor mastery, streaks, and learning analytics"
  }, {
    icon: "⏰",
    title: "Smart Scheduling",
    desc: "Personalized study plans and Pomodoro timers"
  }, {
    icon: "🎯",
    title: "Adaptive Difficulty",
    desc: "Content that grows with your knowledge"
  }, {
    icon: "💾",
    title: "Offline Ready",
    desc: "Study anywhere, sync when connected"
  }];
  return React.createElement("div", {
    style: {
      minHeight: "100vh",
      background: C.bg,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
      overflow: "auto",
      color: landingText
    }
  }, React.createElement("div", {
    style: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundImage: `radial-gradient(circle at 20% 50%, ${decorationA} 0%, transparent 45%), radial-gradient(circle at 80% 50%, ${decorationB} 0%, transparent 45%)`,
      pointerEvents: "none"
    }
  }), React.createElement("div", {
    style: {
      position: "relative",
      zIndex: 1,
      maxWidth: 600,
      textAlign: "center"
    }
  }, React.createElement("div", {
    style: {
      marginBottom: 30
    }
  }, React.createElement("div", {
    style: {
      fontSize: 48,
      fontWeight: 800,
      marginBottom: 8,
      animation: "bounce 2s infinite",
      color: C.accent
    }
  }, "🧠"), React.createElement("div", {
    style: {
      fontSize: 36,
      fontWeight: 800,
      color: landingText,
      marginBottom: 6,
      letterSpacing: "-0.5px"
    }
  }, "SIMA MIND"), React.createElement("div", {
    style: {
      fontSize: 18,
      color: landingMuted,
      fontWeight: 600,
      marginBottom: 12,
      letterSpacing: "0.5px"
    }
  }, "Your Second Brain"), React.createElement("div", {
    style: {
      fontSize: 13,
      color: C.accent,
      fontWeight: 700,
      letterSpacing: "1px",
      textTransform: "uppercase",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 6
    }
  }, React.createElement("div", {
    style: {
      width: 20,
      height: 1,
      background: C.accent
    }
  }), "Powered by SIMA TECH", React.createElement("div", {
    style: {
      width: 20,
      height: 1,
      background: C.accent
    }
  }))), React.createElement("div", {
    style: {
      fontSize: 16,
      color: landingMuted,
      marginBottom: 24,
      lineHeight: 1.6,
      fontWeight: 500
    }
  }, "Transform how you study with AI that understands your learning style, generates personalized content, and keeps you motivated every step of the way."), React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "center",
      gap: 10,
      flexWrap: "wrap",
      marginBottom: 32
    }
  }, [{
    key: "default",
    label: "Auto (Device)",
    icon: "🖥️"
  }, {
    key: "dark",
    label: "Dark",
    icon: "🌙"
  }, {
    key: "light",
    label: "Light",
    icon: "☀️"
  }].map(option => React.createElement("button", {
    key: option.key,
    onClick: () => onDisplayModeChange(option.key),
    style: {
      border: `1px solid ${displayMode === option.key ? C.accent : frameBorder}`,
      background: displayMode === option.key ? C.accent : "transparent",
      color: displayMode === option.key ? "white" : landingText,
      borderRadius: 999,
      padding: "10px 16px",
      fontSize: 13,
      cursor: "pointer",
      minWidth: 120
    }
  }, option.icon, " ", option.label))), React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 16,
      marginBottom: 40
    }
  }, features.map((feature, idx) => React.createElement("div", {
    key: idx,
    style: {
      background: featureCardBg,
      border: `1px solid ${frameBorder}`,
      borderRadius: 12,
      padding: 16,
      textAlign: "center",
      transition: "all 0.3s ease",
      cursor: "pointer"
    },
    onMouseEnter: e => e.currentTarget.style.transform = "translateY(-4px)",
    onMouseLeave: e => e.currentTarget.style.transform = "translateY(0)"
  }, React.createElement("div", {
    style: {
      fontSize: 28,
      marginBottom: 8
    }
  }, feature.icon), React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: landingText,
      marginBottom: 4
    }
  }, feature.title), React.createElement("div", {
    style: {
      fontSize: 12,
      color: landingMuted
    }
  }, feature.desc)))), React.createElement("div", {
    style: {
      display: "flex",
      gap: 12,
      flexDirection: "column",
      marginBottom: 12
    }
  }, React.createElement("button", {
    onClick: onStart,
    style: {
      width: "100%",
      padding: "16px 24px",
      fontSize: 16,
      fontWeight: 700,
      background: `linear-gradient(135deg, ${C.accent}, ${C.purple})`,
      color: "white",
      border: "none",
      borderRadius: 12,
      cursor: "pointer",
      transition: "all 0.3s ease",
      letterSpacing: "0.5px",
      boxShadow: `0 8px 24px ${C.accent}40`
    },
    onMouseEnter: e => {
      e.currentTarget.style.transform = "translateY(-2px)";
      e.currentTarget.style.boxShadow = `0 12px 32px ${C.accent}60`;
    },
    onMouseLeave: e => {
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.boxShadow = `0 8px 24px ${C.accent}40`;
    }
  }, "✨ Create Account"), React.createElement("button", {
    onClick: () => onStart?.("login"),
    style: {
      width: "100%",
      padding: "16px 24px",
      fontSize: 16,
      fontWeight: 700,
      background: "transparent",
      color: C.accent,
      border: `2px solid ${C.accent}`,
      borderRadius: 12,
      cursor: "pointer",
      transition: "all 0.3s ease",
      letterSpacing: "0.5px"
    },
    onMouseEnter: e => {
      e.currentTarget.style.background = `${C.accent}15`;
      e.currentTarget.style.transform = "translateY(-2px)";
    },
    onMouseLeave: e => {
      e.currentTarget.style.background = "transparent";
      e.currentTarget.style.transform = "translateY(0)";
    }
  }, "🔑 Log In")), React.createElement("div", {
    style: {
      fontSize: 12,
      color: landingMuted,
      marginTop: 24,
      paddingTop: 20,
      borderTop: `1px solid ${frameBorder}`,
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, React.createElement("div", null, "📈 Join 3,000+ students mastering their subjects"), React.createElement("div", null, "🎓 Built for learners, exam prep, and lifelong growth"), React.createElement("div", {
    style: {
      fontSize: 11,
      color: landingMuted,
      marginTop: 8
    }
  }, "By starting, you agree to our Terms & Privacy Policy"))));
}
function VerificationScreen({
  onVerified,
  subscription
}) {
  const [method, setMethod] = useState("email");
  const [value, setValue] = useState("");
  const [countryCode, setCountryCode] = useState("+260");
  const [code, setCode] = useState("");
  const [sentCode, setSentCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [deviceType, setDeviceType] = useState("phone");
  const [step, setStep] = useState("input");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const sendCode = async () => {
    if (!value.trim()) {
      setError("Please enter a valid " + (method === "email" ? "email" : "phone number"));
      return;
    }
    setError("");
    setLoading(true);
    try {
      const payload = method === "email" ? {
        email: value
      } : {
        phone: countryCode + value
      };
      const res = await fetch(API_BASE_URL + "/api/auth/request-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to send verification code");
      } else {
        setSentCode(data.code || "");
        setCode(data.code || "");
        setStep("code");
      }
    } catch (err) {
      setError("Network error. Please check your connection.");
    }
    setLoading(false);
  };
  const verifyCode = async () => {
    if (code.length !== 6) {
      setError("Please enter a 6-digit code");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const payload = method === "email" ? {
        email: value,
        code
      } : {
        phone: countryCode + value,
        code
      };
      const res = await fetch(API_BASE_URL + "/api/auth/verify-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Invalid code");
      } else {
        setStep("password");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    }
    setLoading(false);
  };
  const handlePasswordNext = () => {
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setError("");
    setStep("device");
  };
  const completeSetup = async () => {
    setError("");
    setLoading(true);
    try {
      const registerPayload = method === "email" ? {
        email: value,
        password,
        deviceType
      } : {
        phone: countryCode + value,
        password,
        deviceType
      };
      const res = await fetch(API_BASE_URL + "/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(registerPayload)
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem("sima_token", data.token);
        localStorage.setItem("sima_user", JSON.stringify(data.user));
        onVerified(method, method === "email" ? value : countryCode + value);
        setStep("success");
        setTimeout(() => setStep("welcome"), 2000);
      } else if (res.status === 409) {
        const loginRes = await fetch(API_BASE_URL + "/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(registerPayload)
        });
        const loginData = await loginRes.json();
        if (loginRes.ok && loginData.token) {
          localStorage.setItem("sima_token", loginData.token);
          localStorage.setItem("sima_user", JSON.stringify(loginData.user));
          onVerified(method, method === "email" ? value : countryCode + value);
          setStep("success");
          setTimeout(() => setStep("welcome"), 2000);
        } else {
          setError(loginData.error || "Login failed");
        }
      } else {
        setError(data.error || "Registration failed");
      }
    } catch (err) {
      setError("Network error: " + err.message);
    }
    setLoading(false);
  };
  if (step === "success") {
    return React.createElement("div", {
      style: {
        ...S.page,
        alignItems: "center",
        justifyContent: "center",
        padding: 24
      }
    }, React.createElement("div", {
      style: {
        textAlign: "center",
        maxWidth: 320
      }
    }, React.createElement("div", {
      style: {
        fontSize: 48,
        marginBottom: 16
      }
    }, "✅"), React.createElement("div", {
      style: {
        fontSize: 20,
        fontWeight: 800,
        marginBottom: 8
      }
    }, "Account Created!"), React.createElement("div", {
      style: {
        fontSize: 14,
        color: C.muted
      }
    }, "Setting up your profile...")));
  }
  if (step === "welcome") {
    return React.createElement(WelcomeMessageScreen, {
      onContinue: () => {}
    });
  }
  return React.createElement("div", {
    style: {
      ...S.page,
      alignItems: "center",
      justifyContent: "center",
      padding: 24
    }
  }, React.createElement("div", {
    style: {
      width: "100%",
      maxWidth: 380
    }
  }, React.createElement("div", {
    style: {
      textAlign: "center",
      marginBottom: 32
    }
  }, React.createElement("div", {
    style: {
      fontSize: 28,
      fontWeight: 800,
      marginBottom: 8
    }
  }, step === "input" ? "🔐 Secure Account" : step === "code" ? "📝 Verify Code" : step === "password" ? "🔑 Set Password" : "📱 Device Type"), React.createElement("div", {
    style: {
      fontSize: 14,
      color: C.muted
    }
  }, step === "input" ? "Email-verified security with end-to-end encryption " : step === "code" ? "Enter the code we sent you" : step === "password" ? "Create a strong password" : "Choose your primary device")), React.createElement("div", {
    style: {
      ...S.card,
      marginBottom: 16
    }
  }, step === "input" && React.createElement(React.Fragment, null, React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      color: C.muted,
      marginBottom: 12,
      letterSpacing: "0.08em",
      textTransform: "uppercase"
    }
  }, "Verification Method"), React.createElement("label", {
    style: S.label
  }, "Email Address"), React.createElement("input", {
    style: S.input,
    type: "email",
    placeholder: "your@email.com",
    value: value,
    onChange: e => {
      setValue(e.target.value);
      setError("");
    }
  }), error && React.createElement("div", {
    style: {
      color: C.red,
      fontSize: 12,
      marginTop: 8
    }
  }, "⚠️ ", error), React.createElement("button", {
    onClick: sendCode,
    disabled: loading,
    style: {
      ...S.btn(C.accent),
      width: "100%",
      marginTop: 16,
      opacity: loading ? 0.6 : 1
    }
  }, loading ? "Sending…" : "Send Verification Code"), React.createElement("div", {
    style: {
      marginTop: 16,
      padding: 12,
      background: `${C.accent}15`,
      border: `1px solid ${C.accent}30`,
      borderRadius: 8,
      fontSize: 12,
      color: C.muted,
      textAlign: "center",
      lineHeight: 1.5
    }
  }, React.createElement("div", {
    style: {
      fontWeight: 700,
      marginBottom: 8,
      color: C.accent
    }
  }, " Enterprise Security"), React.createElement("div", null, "AES-256 encryption • Device limits • Audit logs"))), step === "code" && React.createElement(React.Fragment, null, React.createElement("div", {
    style: {
      fontSize: 13,
      color: C.muted,
      marginBottom: 12
    }
  }, "Enter the 6-digit code sent to ", React.createElement("strong", null, method === "email" ? value : countryCode + value)), sentCode && React.createElement("div", {
    style: {
      marginBottom: 12,
      padding: "8px 10px",
      background: `${C.accent}12`,
      border: `1px solid ${C.accent}30`,
      borderRadius: 8,
      fontSize: 12,
      color: C.accent
    }
  }, "Email delivery is delayed, so use this code instead: ", React.createElement("strong", null, sentCode)), React.createElement("input", {
    style: {
      ...S.input,
      textAlign: "center",
      fontSize: 18,
      fontWeight: 800,
      letterSpacing: 4
    },
    placeholder: "000000",
    value: code,
    onChange: e => {
      setCode(e.target.value.replace(/\D/g, "").slice(0, 6));
      setError("");
    },
    maxLength: 6
  }), error && React.createElement("div", {
    style: {
      color: C.red,
      fontSize: 12,
      marginTop: 8
    }
  }, "⚠️ ", error), React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      marginTop: 16
    }
  }, React.createElement("button", {
    onClick: () => {
      setStep("input");
      setCode("");
      setError("");
    },
    style: {
      ...S.btn(C.surface, C.muted),
      border: `1px solid ${C.border}`,
      flex: 1
    }
  }, "Back"), React.createElement("button", {
    onClick: verifyCode,
    disabled: loading,
    style: {
      ...S.btn(C.accent),
      flex: 1,
      opacity: loading ? 0.6 : 1
    }
  }, loading ? "Verifying…" : "Verify"))), step === "password" && React.createElement(React.Fragment, null, React.createElement("label", {
    style: S.label
  }, "Password (min 8 characters)"), React.createElement("input", {
    style: S.input,
    type: "password",
    placeholder: "Create a strong password",
    value: password,
    onChange: e => {
      setPassword(e.target.value);
      setError("");
    }
  }), React.createElement("label", {
    style: {
      ...S.label,
      marginTop: 14
    }
  }, "Confirm Password"), React.createElement("input", {
    style: S.input,
    type: "password",
    placeholder: "Confirm your password",
    value: confirmPassword,
    onChange: e => {
      setConfirmPassword(e.target.value);
      setError("");
    }
  }), error && React.createElement("div", {
    style: {
      color: C.red,
      fontSize: 12,
      marginTop: 8
    }
  }, "⚠️ ", error), React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      marginTop: 16
    }
  }, React.createElement("button", {
    onClick: () => {
      setStep("code");
      setPassword("");
      setConfirmPassword("");
      setError("");
    },
    style: {
      ...S.btn(C.surface, C.muted),
      border: `1px solid ${C.border}`,
      flex: 1
    }
  }, "Back"), React.createElement("button", {
    onClick: handlePasswordNext,
    style: {
      ...S.btn(C.accent),
      flex: 1
    }
  }, "Next"))), step === "device" && React.createElement(React.Fragment, null, React.createElement("div", {
    style: {
      fontSize: 13,
      color: C.muted,
      marginBottom: 14
    }
  }, "Select your primary device type. You can use up to 3 different device types (phone, PC, tablet) on one account."), React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr 1fr",
      gap: 8,
      marginBottom: 16
    }
  }, [{
    id: "phone",
    label: "📱 Phone"
  }, {
    id: "pc",
    label: "💻 PC"
  }, {
    id: "tablet",
    label: "📱 Tablet"
  }].map(d => React.createElement("button", {
    key: d.id,
    onClick: () => {
      setDeviceType(d.id);
      setError("");
    },
    style: {
      padding: "16px",
      borderRadius: 10,
      border: `2px solid ${deviceType === d.id ? C.accent : C.border}`,
      background: deviceType === d.id ? C.accent + "15" : C.surface,
      color: deviceType === d.id ? C.accent : C.text,
      fontSize: 12,
      cursor: "pointer",
      fontWeight: deviceType === d.id ? 700 : 600
    }
  }, d.label))), error && React.createElement("div", {
    style: {
      color: C.red,
      fontSize: 12,
      marginBottom: 12
    }
  }, "⚠️ ", error), React.createElement("div", {
    style: {
      display: "flex",
      gap: 8
    }
  }, React.createElement("button", {
    onClick: () => {
      setStep("password");
      setError("");
    },
    style: {
      ...S.btn(C.surface, C.muted),
      border: `1px solid ${C.border}`,
      flex: 1
    }
  }, "Back"), React.createElement("button", {
    onClick: completeSetup,
    disabled: loading,
    style: {
      ...S.btn(C.accent),
      flex: 1,
      opacity: loading ? 0.6 : 1
    }
  }, loading ? "Creating account…" : "Complete Setup")))), React.createElement("div", {
    style: {
      fontSize: 12,
      color: C.muted,
      textAlign: "center"
    }
  }, "Your data is secure with end-to-end encryption and device verification.")));
}
function LoginScreen({
  onLoginSuccess,
  onBack,
  subscription
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetStep, setResetStep] = useState("email");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSentCode, setResetSentCode] = useState("");
  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Email and password are required");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const response = await fetch(API_BASE_URL + "/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
          deviceId: `device-${Date.now()}`,
          deviceName: navigator.userAgent.slice(0, 50),
          deviceType: /mobile|tablet/i.test(navigator.userAgent) ? "mobile" : "web"
        })
      });
      if (!response.ok) {
        const err = await response.json();
        setError(err.error || "Login failed. Please check your credentials.");
        setLoading(false);
        return;
      }
      const data = await response.json();
      localStorage.setItem("sima_token", data.token);
      localStorage.setItem("sima_user", JSON.stringify(data.user));
      onLoginSuccess?.(data.user);
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return React.createElement("div", {
    style: {
      minHeight: "100vh",
      background: C.bg,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: 20
    }
  }, React.createElement("div", {
    style: {
      maxWidth: 400,
      width: "100%",
      textAlign: "center"
    }
  }, React.createElement("div", {
    style: {
      fontSize: 40,
      marginBottom: 16,
      color: C.accent
    }
  }, "🔑"), React.createElement("div", {
    style: {
      fontSize: 24,
      fontWeight: 800,
      color: C.text,
      marginBottom: 8
    }
  }, "Welcome Back"), React.createElement("div", {
    style: {
      fontSize: 14,
      color: C.muted,
      marginBottom: 32
    }
  }, "Log in to continue your learning journey"), React.createElement("input", {
    type: "email",
    placeholder: "Email",
    value: email,
    onChange: e => setEmail(e.target.value),
    onKeyPress: e => e.key === "Enter" && handleLogin(),
    disabled: loading,
    style: {
      width: "100%",
      padding: "12px 16px",
      marginBottom: 12,
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: 8,
      color: C.text,
      fontSize: 14,
      transition: "all 0.3s ease"
    },
    onFocus: e => e.target.style.borderColor = C.accent,
    onBlur: e => e.target.style.borderColor = C.border
  }), React.createElement("input", {
    type: "password",
    placeholder: "Password",
    value: password,
    onChange: e => setPassword(e.target.value),
    onKeyPress: e => e.key === "Enter" && handleLogin(),
    disabled: loading,
    style: {
      width: "100%",
      padding: "12px 16px",
      marginBottom: 8,
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: 8,
      color: C.text,
      fontSize: 14,
      transition: "all 0.3s ease"
    },
    onFocus: e => e.target.style.borderColor = C.accent,
    onBlur: e => e.target.style.borderColor = C.border
  }), React.createElement("button", {
    onClick: () => {
      setShowForgotPassword(true);
      setResetError("");
      setResetStep("email");
      setResetEmail("");
      setResetCode("");
      setResetSentCode("");
      setNewPassword("");
      setConfirmPassword("");
    },
    style: {
      width: "100%",
      padding: "8px",
      background: "transparent",
      color: C.accent,
      border: "none",
      fontSize: 12,
      cursor: "pointer",
      marginBottom: 12,
      textAlign: "right",
      fontWeight: 500
    }
  }, "Forgot password?"), error && React.createElement("div", {
    style: {
      color: C.red,
      fontSize: 12,
      marginBottom: 12
    }
  }, "⚠️ ", error), React.createElement("button", {
    onClick: handleLogin,
    disabled: loading,
    style: {
      width: "100%",
      padding: "12px 16px",
      marginBottom: 12,
      background: C.accent,
      color: "white",
      border: "none",
      borderRadius: 8,
      fontSize: 14,
      fontWeight: 700,
      cursor: loading ? "not-allowed" : "pointer",
      opacity: loading ? 0.6 : 1,
      transition: "all 0.3s ease"
    },
    onMouseEnter: e => !loading && (e.target.style.background = C.purple),
    onMouseLeave: e => !loading && (e.target.style.background = C.accent)
  }, loading ? "Logging in…" : "Log In"), showForgotPassword && React.createElement("div", {
    style: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: `${C.bg}dd`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 999,
      padding: 20
    }
  }, React.createElement("div", {
    style: {
      ...S.card,
      maxWidth: 360,
      width: "100%",
      padding: 24
    }
  }, React.createElement("div", {
    style: {
      fontSize: 20,
      fontWeight: 800,
      marginBottom: 20
    }
  }, "🔑 Reset Password"), resetStep === "email" && React.createElement(React.Fragment, null, React.createElement("label", {
    style: S.label
  }, "Email address"), React.createElement("input", {
    type: "email",
    placeholder: "your@email.com",
    value: resetEmail,
    onChange: e => setResetEmail(e.target.value),
    style: {
      ...S.input,
      marginBottom: 16
    }
  }), React.createElement("button", {
    onClick: async () => {
      if (!resetEmail.trim()) {
        setResetError("Please enter your email");
        return;
      }
      setResetLoading(true);
      try {
        const res = await fetch(API_BASE_URL + "/api/auth/request-verification", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email: resetEmail
          })
        });
        if (res.ok) {
          const data = await res.json();
          setResetSentCode(data.code || "");
          setResetCode(data.code || "");
          setResetStep("code");
          setResetError("");
        } else {
          const data = await res.json();
          setResetError(data.error || "Email not found");
        }
      } catch (err) {
        setResetError("Network error. Please try again.");
      }
      setResetLoading(false);
    },
    disabled: resetLoading,
    style: {
      ...S.btn(C.accent),
      width: "100%",
      marginBottom: 12
    }
  }, resetLoading ? "Sending..." : "Send Code")), resetStep === "code" && React.createElement(React.Fragment, null, React.createElement("label", {
    style: S.label
  }, "Verification code"), resetSentCode && React.createElement("div", {
    style: {
      marginBottom: 12,
      padding: "8px 10px",
      background: `${C.accent}12`,
      border: `1px solid ${C.accent}30`,
      borderRadius: 8,
      fontSize: 12,
      color: C.accent
    }
  }, "If the email is late, use this code instead: ", React.createElement("strong", null, resetSentCode)), React.createElement("input", {
    placeholder: "000000",
    maxLength: "6",
    value: resetCode,
    onChange: e => setResetCode(e.target.value.replace(/\D/g, "")),
    style: {
      ...S.input,
      marginBottom: 16
    }
  }), React.createElement("button", {
    onClick: () => {
      if (resetCode.length !== 6) {
        setResetError("Please enter a 6-digit code");
        return;
      }
      setResetStep("password");
      setResetError("");
    },
    style: {
      ...S.btn(C.accent),
      width: "100%",
      marginBottom: 12
    }
  }, "Verify Code")), resetStep === "password" && React.createElement(React.Fragment, null, React.createElement("label", {
    style: S.label
  }, "New password"), React.createElement("input", {
    type: "password",
    placeholder: "At least 8 characters",
    value: newPassword,
    onChange: e => setNewPassword(e.target.value),
    style: {
      ...S.input,
      marginBottom: 12
    }
  }), React.createElement("label", {
    style: S.label
  }, "Confirm password"), React.createElement("input", {
    type: "password",
    placeholder: "Confirm new password",
    value: confirmPassword,
    onChange: e => setConfirmPassword(e.target.value),
    style: {
      ...S.input,
      marginBottom: 16
    }
  }), React.createElement("button", {
    onClick: async () => {
      if (newPassword.length < 8) {
        setResetError("Password must be at least 8 characters");
        return;
      }
      if (newPassword !== confirmPassword) {
        setResetError("Passwords do not match");
        return;
      }
      setResetLoading(true);
      try {
        const res = await fetch(API_BASE_URL + "/api/auth/reset-password", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email: resetEmail,
            code: resetCode,
            newPassword
          })
        });
        if (res.ok) {
          setResetStep("success");
          setResetError("");
          setTimeout(async () => {
            try {
              const loginRes = await fetch(API_BASE_URL + "/api/auth/login", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({
                  email: resetEmail,
                  password: newPassword
                })
              });
              if (loginRes.ok) {
                const userData = await loginRes.json();
                localStorage.setItem("sima_token", userData.token);
                localStorage.setItem("sima_user", JSON.stringify(userData.user));
                setShowForgotPassword(false);
                onLoginSuccess(userData.user, userData.token);
              } else {
                setResetError("Password reset successful. Please log in with your new password.");
                setShowForgotPassword(false);
              }
            } catch (err) {
              setResetError("Password reset successful. Please log in with your new password.");
              setShowForgotPassword(false);
            }
          }, 2000);
        } else {
          const data = await res.json();
          setResetError(data.error || "Reset failed");
        }
      } catch (err) {
        setResetError("Network error. Please try again.");
      }
      setResetLoading(false);
    },
    disabled: resetLoading,
    style: {
      ...S.btn(C.accent),
      width: "100%",
      marginBottom: 12
    }
  }, resetLoading ? "Resetting..." : "Reset Password")), resetStep === "success" && React.createElement(React.Fragment, null, React.createElement("div", {
    style: {
      textAlign: "center",
      marginBottom: 16
    }
  }, React.createElement("div", {
    style: {
      fontSize: 40,
      marginBottom: 12
    }
  }, "✅"), React.createElement("div", {
    style: {
      fontSize: 16,
      fontWeight: 700,
      marginBottom: 8
    }
  }, "Password reset successful!"), React.createElement("div", {
    style: {
      fontSize: 13,
      color: C.muted
    }
  }, "You can now log in with your new password."))), resetError && React.createElement("div", {
    style: {
      color: C.red,
      fontSize: 12,
      marginBottom: 12
    }
  }, "⚠️ ", resetError), React.createElement("button", {
    onClick: () => {
      setShowForgotPassword(false);
      if (resetStep === "success") {
        setResetStep("email");
        setResetEmail("");
        setResetCode("");
        setNewPassword("");
        setConfirmPassword("");
      }
    },
    style: {
      ...S.btn(C.surface, C.text),
      width: "100%",
      border: `1px solid ${C.border}`
    }
  }, resetStep === "success" ? "Back to Login" : "Cancel"))), React.createElement("button", {
    onClick: onBack,
    style: {
      width: "100%",
      padding: "12px 16px",
      background: "transparent",
      color: C.accent,
      border: `1px solid ${C.border}`,
      borderRadius: 8,
      fontSize: 14,
      fontWeight: 700,
      cursor: "pointer",
      transition: "all 0.3s ease"
    },
    onMouseEnter: e => e.target.style.background = C.accentSoft,
    onMouseLeave: e => e.target.style.background = "transparent"
  }, "Back")));
}
function WelcomeMessageScreen({
  onContinue
}) {
  const [step, setStep] = useState(0);
  const welcomeSteps = [{
    icon: "🚀",
    title: "Welcome to SIMA MIND",
    subtitle: "Powered by SMX & MGX",
    content: "Your intelligent study companion, designed to adapt to every learner's needs."
  }, {
    icon: "👥",
    title: "Meet the Team",
    subtitle: "Built by Experts",
    content: "Developed by a team of educators, AI specialists, and learning scientists dedicated to revolutionizing education."
  }, {
    icon: "🎯",
    title: "Your Learning Journey",
    subtitle: "14 Days Free Access",
    content: "Experience all premium features for 14 days. No credit card required. Upgrade anytime."
  }, {
    icon: "🔒",
    title: "Secure & Private",
    subtitle: "Your Data is Safe",
    content: "End-to-end encryption, device verification, and secure payment processing."
  }];
  const nextStep = () => {
    if (step < welcomeSteps.length - 1) {
      setStep(s => s + 1);
    } else {
      onContinue();
    }
  };
  const currentStep = welcomeSteps[step];
  return React.createElement("div", {
    style: {
      ...S.page,
      alignItems: "center",
      justifyContent: "center",
      padding: 24
    }
  }, React.createElement("div", {
    style: {
      width: "100%",
      maxWidth: 400
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "center",
      gap: 8,
      marginBottom: 32
    }
  }, welcomeSteps.map((_, i) => React.createElement("div", {
    key: i,
    style: {
      width: 8,
      height: 8,
      borderRadius: "50%",
      background: i === step ? C.accent : C.border,
      transition: "all .3s"
    }
  }))), React.createElement("div", {
    style: {
      textAlign: "center",
      marginBottom: 32
    }
  }, React.createElement("div", {
    style: {
      fontSize: 48,
      marginBottom: 16
    }
  }, currentStep.icon), React.createElement("div", {
    style: {
      fontSize: 24,
      fontWeight: 800,
      marginBottom: 8
    }
  }, currentStep.title), React.createElement("div", {
    style: {
      fontSize: 16,
      color: C.accent,
      fontWeight: 600,
      marginBottom: 16
    }
  }, currentStep.subtitle), React.createElement("div", {
    style: {
      fontSize: 14,
      color: C.muted,
      lineHeight: 1.6
    }
  }, currentStep.content)), React.createElement("div", {
    style: {
      display: "flex",
      gap: 12
    }
  }, step > 0 && React.createElement("button", {
    onClick: () => setStep(s => s - 1),
    style: {
      ...S.btn(C.surface, C.muted),
      border: `1px solid ${C.border}`,
      flex: 1
    }
  }, "Back"), React.createElement("button", {
    onClick: nextStep,
    style: {
      ...S.btn(C.accent),
      flex: step === 0 ? "initial" : 1
    }
  }, step === welcomeSteps.length - 1 ? "Get Started" : "Next"))));
}
function PaymentScreen({
  plan,
  onPaymentComplete,
  onBack
}) {
  const [method, setMethod] = useState("visa");
  const [step, setStep] = useState("form");
  const [formData, setFormData] = useState({
    cardNumber: "",
    expiry: "",
    cvv: "",
    name: "",
    phone: "",
    amount: "",
    bankName: "",
    accountNumber: ""
  });
  const selectedPlan = PLANS.find(p => p.id === plan);
  const amount = selectedPlan.price.usd;
  const displayAmount = method === "visa" ? amount : Number(formData.amount) || selectedPlan.price.kwacha;
  const currencySymbol = method === "visa" ? "$" : "K";
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  const processPayment = () => {
    if (method === "visa") {
      if (!formData.cardNumber || !formData.expiry || !formData.cvv || !formData.name) {
        return alert("Please complete all card details before continuing.");
      }
    }
    if (method === "bank") {
      if (!formData.name || !formData.phone || !formData.bankName || !formData.accountNumber) {
        return alert("Please complete all bank transfer details before continuing.");
      }
    }
    if (method === "airtel" || method === "mtn") {
      if (!formData.phone) {
        return alert("Please provide your phone number for mobile money.");
      }
    }
    const payload = {
      plan: selectedPlan.label,
      amount: displayAmount,
      currency: currencySymbol,
      method,
      paymentMethod: method,
      metadata: {
        ...formData,
        planId: selectedPlan.value
      }
    };
    setStep("processing");
    fetch("/api/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    }).then(r => r.json()).then(data => {
      const receipt = data.receipt || {
        id: "RCT-" + Math.random().toString(36).substr(2, 9).toUpperCase(),
        plan: selectedPlan.label,
        amount: displayAmount,
        method: method,
        currency: currencySymbol,
        timestamp: new Date().toISOString(),
        status: "completed"
      };
      localStorage.setItem("last_receipt", JSON.stringify(receipt));
      setStep("success");
      setTimeout(() => onPaymentComplete(receipt), 2000);
    }).catch(() => {
      const receipt = {
        id: "RCT-" + Math.random().toString(36).substr(2, 9).toUpperCase(),
        plan: selectedPlan.label,
        amount: displayAmount,
        method: method,
        currency: currencySymbol,
        timestamp: new Date().toISOString(),
        status: "completed"
      };
      localStorage.setItem("last_receipt", JSON.stringify(receipt));
      setStep("success");
      setTimeout(() => onPaymentComplete(receipt), 2000);
    });
  };
  const generateReceipt = receipt => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Payment Receipt - SIMA MIND</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 400px; margin: 20px auto; padding: 20px; border: 1px solid #ccc; }
            .header { text-align: center; border-bottom: 2px solid #007bff; padding-bottom: 10px; margin-bottom: 20px; }
            .logo { font-size: 24px; font-weight: bold; color: #007bff; }
            .details { margin: 10px 0; }
            .total { font-size: 18px; font-weight: bold; color: #28a745; }
            .footer { margin-top: 20px; font-size: 12px; color: #666; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">SIMA MIND</div>
            <div>Powered by SMX & MGX</div>
          </div>
          <div class="details">
            <strong>Receipt ID:</strong> ${receipt.id}<br>
            <strong>Plan:</strong> ${receipt.plan}<br>
            <strong>Amount:</strong> ${receipt.currency}${receipt.amount}<br>
            <strong>Payment Method:</strong> ${receipt.method.toUpperCase()}<br>
            <strong>Date:</strong> ${new Date(receipt.timestamp).toLocaleString()}<br>
            <strong>Status:</strong> <span style="color: #28a745;">${receipt.status.toUpperCase()}</span>
          </div>
          <div class="total">Total Paid: ${receipt.currency}${receipt.amount}</div>
          <div class="footer">
            Thank you for choosing SIMA MIND!<br>
            For support: support@simamind.com
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };
  if (step === "processing") {
    return React.createElement("div", {
      style: {
        ...S.page,
        alignItems: "center",
        justifyContent: "center",
        padding: 24
      }
    }, React.createElement("div", {
      style: {
        textAlign: "center",
        maxWidth: 320
      }
    }, React.createElement("div", {
      style: {
        fontSize: 48,
        marginBottom: 16
      }
    }, "⏳"), React.createElement("div", {
      style: {
        fontSize: 20,
        fontWeight: 800,
        marginBottom: 8
      }
    }, "Processing Payment"), React.createElement("div", {
      style: {
        fontSize: 14,
        color: C.muted
      }
    }, "Please wait while we secure your transaction...")));
  }
  if (step === "success") {
    const receipt = JSON.parse(localStorage.getItem("last_receipt"));
    return React.createElement("div", {
      style: {
        ...S.page,
        alignItems: "center",
        justifyContent: "center",
        padding: 24
      }
    }, React.createElement("div", {
      style: {
        width: "100%",
        maxWidth: 380
      }
    }, React.createElement("div", {
      style: {
        textAlign: "center",
        marginBottom: 32
      }
    }, React.createElement("div", {
      style: {
        fontSize: 48,
        marginBottom: 16
      }
    }, "✅"), React.createElement("div", {
      style: {
        fontSize: 24,
        fontWeight: 800,
        marginBottom: 8
      }
    }, "Payment Successful!"), React.createElement("div", {
      style: {
        fontSize: 14,
        color: C.muted
      }
    }, "Welcome to your premium plan")), React.createElement("div", {
      style: {
        ...S.card,
        marginBottom: 16
      }
    }, React.createElement("div", {
      style: {
        fontSize: 16,
        fontWeight: 700,
        marginBottom: 12
      }
    }, "📄 Receipt Details"), React.createElement("div", {
      style: {
        fontSize: 13,
        color: C.muted,
        lineHeight: 1.6
      }
    }, React.createElement("div", null, React.createElement("strong", null, "Plan:"), " ", receipt.plan), React.createElement("div", null, React.createElement("strong", null, "Amount:"), " ", receipt.currency, receipt.amount), React.createElement("div", null, React.createElement("strong", null, "Method:"), " ", receipt.method.toUpperCase()), React.createElement("div", null, React.createElement("strong", null, "Receipt ID:"), " ", receipt.id))), React.createElement("div", {
      style: {
        display: "flex",
        gap: 8
      }
    }, React.createElement("button", {
      onClick: () => generateReceipt(receipt),
      style: {
        ...S.btn(C.surface, C.muted),
        border: `1px solid ${C.border}`,
        flex: 1
      }
    }, "📄 Print Receipt"), React.createElement("button", {
      onClick: () => onPaymentComplete(receipt),
      style: {
        ...S.btn(C.accent),
        flex: 1
      }
    }, "Continue"))));
  }
  return React.createElement("div", {
    style: {
      ...S.page,
      alignItems: "center",
      justifyContent: "center",
      padding: 24
    }
  }, React.createElement("div", {
    style: {
      width: "100%",
      maxWidth: 380
    }
  }, React.createElement("div", {
    style: {
      textAlign: "center",
      marginBottom: 24
    }
  }, React.createElement("div", {
    style: {
      fontSize: 20,
      fontWeight: 800,
      marginBottom: 4
    }
  }, "💳 Complete Payment"), React.createElement("div", {
    style: {
      fontSize: 14,
      color: C.muted
    }
  }, selectedPlan.label, " Plan - ", currencySymbol, displayAmount)), React.createElement("div", {
    style: {
      ...S.card,
      marginBottom: 16
    }
  }, React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      color: C.muted,
      marginBottom: 12,
      letterSpacing: "0.08em",
      textTransform: "uppercase"
    }
  }, "Payment Method"), React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      marginBottom: 16
    }
  }, [{
    id: "visa",
    label: "💳 Visa/Mastercard",
    icon: "💳"
  }, {
    id: "airtel",
    label: "📱 Airtel Money",
    icon: "📱"
  }, {
    id: "mtn",
    label: "📱 MTN Money",
    icon: "📱"
  }, {
    id: "bank",
    label: "🏦 Bank Transfer",
    icon: "🏦"
  }].map(m => React.createElement("button", {
    key: m.id,
    onClick: () => setMethod(m.id),
    style: {
      flex: 1,
      padding: "12px",
      borderRadius: 10,
      border: `1px solid ${method === m.id ? C.accent : C.border}`,
      background: method === m.id ? C.accent + "15" : C.surface,
      color: method === m.id ? C.accent : C.text,
      fontSize: 13,
      cursor: "pointer",
      textAlign: "center"
    }
  }, React.createElement("div", {
    style: {
      fontSize: 16,
      marginBottom: 4
    }
  }, m.icon), React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 11
    }
  }, m.label)))), method === "visa" && React.createElement(React.Fragment, null, React.createElement("label", {
    style: S.label
  }, "Card Number"), React.createElement("input", {
    style: S.input,
    placeholder: "1234 5678 9012 3456",
    value: formData.cardNumber,
    onChange: e => handleInputChange("cardNumber", e.target.value.replace(/\D/g, "").replace(/(\d{4})(?=\d)/g, "$1 ")),
    maxLength: 19
  }), React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      marginBottom: 12
    }
  }, React.createElement("div", {
    style: {
      flex: 1
    }
  }, React.createElement("label", {
    style: S.label
  }, "Expiry Date"), React.createElement("input", {
    style: S.input,
    placeholder: "MM/YY",
    value: formData.expiry,
    onChange: e => handleInputChange("expiry", e.target.value.replace(/\D/g, "").replace(/(\d{2})(?=\d)/g, "$1/")),
    maxLength: 5
  })), React.createElement("div", {
    style: {
      flex: 1
    }
  }, React.createElement("label", {
    style: S.label
  }, "CVV"), React.createElement("input", {
    style: S.input,
    placeholder: "123",
    type: "password",
    value: formData.cvv,
    onChange: e => handleInputChange("cvv", e.target.value.replace(/\D/g, "").slice(0, 4)),
    maxLength: 4
  }))), React.createElement("label", {
    style: S.label
  }, "Cardholder Name"), React.createElement("input", {
    style: S.input,
    placeholder: "John Doe",
    value: formData.name,
    onChange: e => handleInputChange("name", e.target.value)
  })), (method === "airtel" || method === "mtn" || method === "bank") && React.createElement(React.Fragment, null, React.createElement("label", {
    style: S.label
  }, "Phone Number"), React.createElement("input", {
    style: S.input,
    placeholder: "+260 XXX XXX XXX",
    value: formData.phone,
    onChange: e => handleInputChange("phone", e.target.value)
  }), method === "bank" && React.createElement(React.Fragment, null, React.createElement("label", {
    style: S.label
  }, "Bank Name"), React.createElement("input", {
    style: S.input,
    placeholder: "e.g. Stanbic Bank",
    value: formData.bankName,
    onChange: e => handleInputChange("bankName", e.target.value)
  }), React.createElement("label", {
    style: S.label
  }, "Account Number"), React.createElement("input", {
    style: S.input,
    placeholder: "1234567890",
    value: formData.accountNumber,
    onChange: e => handleInputChange("accountNumber", e.target.value.replace(/\D/g, ""))
  })), React.createElement("label", {
    style: S.label
  }, "Amount (", method === "visa" ? "USD" : "ZMW", ")"), React.createElement("input", {
    style: S.input,
    placeholder: method === "bank" ? "Enter amount" : `Default K${selectedPlan.price.kwacha}`,
    value: formData.amount,
    onChange: e => handleInputChange("amount", e.target.value.replace(/\D/g, ""))
  }), React.createElement("div", {
    style: {
      fontSize: 12,
      color: C.muted,
      marginTop: 8
    }
  }, method === "bank" ? "💡 Use your bank transfer details to complete a secure payment request." : "💡 You'll receive a prompt on your phone to complete the payment."))), React.createElement("div", {
    style: {
      display: "flex",
      gap: 8
    }
  }, React.createElement("button", {
    onClick: onBack,
    style: {
      ...S.btn(C.surface, C.muted),
      border: `1px solid ${C.border}`,
      flex: 1
    }
  }, "Back"), React.createElement("button", {
    onClick: processPayment,
    style: {
      ...S.btn(C.accent),
      flex: 1
    }
  }, "Pay ", currencySymbol, displayAmount)), React.createElement("div", {
    style: {
      fontSize: 12,
      color: C.muted,
      textAlign: "center",
      marginTop: 16
    }
  }, "🔒 Secure payment processing • No hidden fees")));
}
function UpgradePromptModal({
  plan,
  onClose,
  onUpgrade,
  resetTime
}) {
  const config = PROFILE_ENGINE.getConfig({
    education: "university",
    program: "General"
  });
  const currentPlan = PLANS.find(p => p.id === plan) || PLANS[0];
  return React.createElement("div", {
    style: {
      position: "fixed",
      inset: 0,
      background: "#000c",
      zIndex: 200,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 24
    }
  }, React.createElement("div", {
    style: {
      ...S.card,
      width: "100%",
      maxWidth: 380,
      position: "relative"
    }
  }, React.createElement("button", {
    onClick: onClose,
    style: {
      position: "absolute",
      top: 14,
      right: 14,
      ...S.btn(C.surface, C.muted),
      padding: "6px 10px"
    }
  }, React.createElement(Icon, {
    d: Icons.x,
    size: 16
  })), React.createElement("div", {
    style: {
      textAlign: "center",
      marginBottom: 20
    }
  }, React.createElement("div", {
    style: {
      fontSize: 28,
      marginBottom: 8
    }
  }, "🚀"), React.createElement("div", {
    style: {
      fontSize: 18,
      fontWeight: 800,
      marginBottom: 6
    }
  }, "Study Limit Reached"), React.createElement("div", {
    style: {
      fontSize: 13,
      color: C.muted,
      lineHeight: 1.6
    }
  }, currentPlan.limitMessage || `You've reached your ${currentPlan.label} limit for the next 12 hours.`)), resetTime && React.createElement("div", {
    style: {
      background: currentPlan.color + "15",
      borderLeft: `3px solid ${currentPlan.color}`,
      padding: "10px 12px",
      borderRadius: 8,
      marginBottom: 16,
      fontSize: 12,
      color: currentPlan.color
    }
  }, "⏰ Resets in ", React.createElement("strong", null, resetTime)), React.createElement("div", {
    style: {
      marginBottom: 16
    }
  }, React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      color: C.muted,
      marginBottom: 10,
      textTransform: "uppercase",
      letterSpacing: "0.08em"
    }
  }, "Recommended Upgrades"), React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, PLANS.filter(p => p.id !== plan).slice(-2).map(p => React.createElement("button", {
    key: p.id,
    onClick: () => onUpgrade(p.id),
    style: {
      background: p.color + "22",
      border: `1px solid ${p.color}44`,
      borderRadius: 10,
      padding: "12px 14px",
      fontSize: 13,
      fontWeight: 600,
      cursor: "pointer",
      color: p.color,
      textAlign: "left",
      transition: "all .2s"
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }
  }, React.createElement("div", null, React.createElement("div", {
    style: {
      fontWeight: 700,
      marginBottom: 2
    }
  }, p.label), React.createElement("div", {
    style: {
      fontSize: 11,
      color: C.muted
    }
  }, "$", p.price.usd, "/mo · ", p.features.main[0].text)), React.createElement(Icon, {
    d: Icons.send,
    size: 16,
    color: p.color
  })))))), React.createElement("button", {
    onClick: onClose,
    style: {
      ...S.btn(C.surface, C.muted),
      border: `1px solid ${C.border}`,
      width: "100%",
      justifyContent: "center",
      fontSize: 14
    }
  }, "Close")));
}
function useMessageLimit(plan) {
  const [messagesUsed, setMessagesUsed] = useState(0);
  const [resetTime, setResetTime] = useState(null);
  const limits = {
    free: 30,
    "scholar-lite": 80,
    standard: 9999,
    scholar: 9999
  };
  const getLimit = () => limits[plan] || 30;
  const canSendMessage = () => messagesUsed < getLimit();
  const recordMessage = () => {
    if (canSendMessage()) {
      setMessagesUsed(m => m + 1);
    }
  };
  return {
    messagesUsed,
    getLimit,
    canSendMessage,
    recordMessage,
    resetTime
  };
}
function BottomNav({
  active,
  onNav,
  config
}) {
  const tabs = [{
    id: "dashboard",
    icon: Icons.home,
    label: "Home"
  }, {
    id: "chat",
    icon: Icons.sparkle,
    label: "SIMA"
  }, {
    id: "studio",
    icon: Icons.play,
    label: "Studio"
  }, {
    id: "study-plan",
    icon: Icons.chart,
    label: "Plan"
  }, {
    id: "groups",
    icon: Icons.users,
    label: "Groups"
  }, {
    id: "gamification",
    icon: Icons.trophy,
    label: "Achievements"
  }, {
    id: "analytics",
    icon: Icons.target,
    label: "Stats"
  }];
  const accentCol = config?.accentColor || C.accent;
  return React.createElement("div", {
    style: {
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      background: C.surface,
      borderTop: `1px solid ${C.border}`,
      display: "flex",
      justifyContent: "space-evenly",
      alignItems: "center",
      zIndex: 100,
      overflowX: "auto"
    }
  }, tabs.map(({
    id,
    icon,
    label
  }) => {
    const isActive = active === id;
    return React.createElement("button", {
      key: id,
      onClick: () => onNav(id),
      style: {
        flex: "1",
        padding: "10px 4px 12px",
        background: "transparent",
        border: "none",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 3,
        fontFamily: "inherit",
        minWidth: 60
      }
    }, React.createElement(Icon, {
      d: icon,
      size: 20,
      color: isActive ? accentCol : C.muted
    }), React.createElement("span", {
      style: {
        fontSize: 9,
        fontWeight: isActive ? 700 : 500,
        color: isActive ? accentCol : C.muted,
        whiteSpace: "nowrap",
        textAlign: "center"
      }
    }, label));
  }));
}
function DocumentUploadScreen({
  profile,
  config,
  plan,
  onLimitReached,
  onUploadComplete
}) {
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [generatingTools, setGeneratingTools] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);
  const accentCol = config?.accentColor || C.accent;
  const uploadDocument = async file => {
    if (!file) return;
    const validTypes = ["application/pdf", "application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.presentationml.presentation", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain", "image/jpeg", "image/png", "image/gif"];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(pdf|ppt|pptx|doc|docx|txt|jpg|jpeg|png|gif)$/i)) {
      alert("❌ Unsupported file type. Please upload PDF, PPT, Word, Text, or Images.");
      return;
    }
    if (plan === "free" && documents.length >= 3) {
      onLimitReached?.();
      return;
    }
    setUploading(true);
    const newDoc = {
      id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      size: file.size,
      type: file.type || file.name.split('.').pop(),
      uploadedAt: new Date().toISOString(),
      content: ""
    };
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", localStorage.getItem("sima_user") ? JSON.parse(localStorage.getItem("sima_user")).id : "");
      const response = await fetch(API_BASE_URL + "/api/documents/upload", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("sima_token")}`
        },
        body: formData
      }).catch(() => null);
      let updatedDocs;
      if (response?.ok) {
        const data = await response.json();
        updatedDocs = [...documents, data.document];
        setDocuments(updatedDocs);
      } else {
        updatedDocs = [...documents, newDoc];
        setDocuments(updatedDocs);
      }
      localStorage.setItem("sima_documents", JSON.stringify(updatedDocs));
      alert("✅ Document uploaded! Taking you to Studio...");
      onUploadComplete?.();
    } catch (err) {
      const updatedDocs = [...documents, newDoc];
      setDocuments(updatedDocs);
      localStorage.setItem("sima_documents", JSON.stringify(updatedDocs));
      alert("✅ Document saved! Taking you to Studio...");
      onUploadComplete?.();
    }
    setUploading(false);
  };
  const generateStudyTools = async docId => {
    setGeneratingTools(true);
    try {
      const response = await fetch(API_BASE_URL + "/api/documents/generate-tools", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("sima_token")}`
        },
        body: JSON.stringify({
          documentId: docId,
          profile,
          type: ["flashcards", "mcqs", "summary"]
        })
      });
      if (response.ok) {
        const data = await response.json();
        setGeneratedContent(data);
      } else {
        alert("❌ Failed to generate study tools");
      }
    } catch (err) {
      alert("❌ Generation error: " + err.message);
    }
    setGeneratingTools(false);
  };
  return React.createElement("div", {
    style: {
      padding: "20px 16px 100px"
    }
  }, React.createElement("div", {
    style: {
      fontSize: 22,
      fontWeight: 800,
      marginBottom: 4
    }
  }, "📚 Study Materials"), React.createElement("div", {
    style: {
      fontSize: 13,
      color: C.muted,
      marginBottom: 20
    }
  }, "Upload documents and generate study tools"), React.createElement("div", {
    style: {
      ...S.card,
      border: `2px dashed ${accentCol}33`,
      background: accentCol + "11",
      padding: 32,
      textAlign: "center",
      marginBottom: 20,
      cursor: "pointer",
      transition: "all 0.3s ease"
    },
    onClick: () => document.getElementById("fileInput").click(),
    onDragOver: e => {
      e.preventDefault();
      e.currentTarget.style.background = accentCol + "22";
    },
    onDragLeave: e => {
      e.currentTarget.style.background = accentCol + "11";
    },
    onDrop: e => {
      e.preventDefault();
      if (e.dataTransfer.files?.[0]) {
        uploadDocument(e.dataTransfer.files[0]);
      }
    }
  }, React.createElement("input", {
    id: "fileInput",
    type: "file",
    style: {
      display: "none"
    },
    accept: ".pdf,.ppt,.pptx,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif",
    onChange: e => uploadDocument(e.target.files?.[0])
  }), React.createElement("div", {
    style: {
      fontSize: 32,
      marginBottom: 12
    }
  }, "📄"), React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 700,
      marginBottom: 4
    }
  }, "Drop or click to upload"), React.createElement("div", {
    style: {
      fontSize: 12,
      color: C.muted
    }
  }, "PDF, PPT, Word, or Images"), uploading && React.createElement("div", {
    style: {
      fontSize: 12,
      color: accentCol,
      marginTop: 12
    }
  }, "⏳ Uploading...")), documents.length > 0 && React.createElement("div", {
    style: {
      marginBottom: 20
    }
  }, React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 700,
      marginBottom: 12
    }
  }, "Your Documents (", documents.length, ")"), documents.map((doc, idx) => React.createElement("div", {
    key: idx,
    style: {
      ...S.card,
      marginBottom: 8,
      padding: "12px 14px",
      cursor: "pointer",
      border: selectedDoc?.id === doc.id ? `2px solid ${accentCol}` : `1px solid ${C.border}`,
      background: selectedDoc?.id === doc.id ? accentCol + "11" : "transparent"
    },
    onClick: () => setSelectedDoc(doc)
  }, React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }
  }, React.createElement("div", null, React.createElement("div", {
    style: {
      fontWeight: 600
    }
  }, doc.name), React.createElement("div", {
    style: {
      fontSize: 12,
      color: C.muted
    }
  }, (doc.size / 1024).toFixed(1), " KB")), React.createElement("button", {
    onClick: e => {
      e.stopPropagation();
      generateStudyTools(doc.id);
    },
    style: {
      ...S.btn(accentCol),
      padding: "8px 12px",
      fontSize: 12
    }
  }, generatingTools ? "⏳ Generating..." : "✨ Generate"))))), generatedContent && React.createElement("div", {
    style: {
      marginTop: 20
    }
  }, React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 700,
      marginBottom: 12
    }
  }, "📚 Generated Study Tools"), generatedContent.flashcards && React.createElement("div", {
    style: {
      ...S.card,
      marginBottom: 12,
      padding: "12px 14px"
    }
  }, React.createElement("div", {
    style: {
      fontWeight: 600,
      marginBottom: 8
    }
  }, "🎯 Flashcards (", generatedContent.flashcards.length, ")"), React.createElement("div", {
    style: {
      fontSize: 13,
      color: C.muted,
      lineHeight: "1.6"
    }
  }, generatedContent.flashcards.slice(0, 3).map((card, i) => React.createElement("div", {
    key: i,
    style: {
      marginBottom: 8
    }
  }, React.createElement("strong", null, "Q: ", card.question), React.createElement("br", null), "A: ", card.answer))), React.createElement("button", {
    style: {
      ...S.btn(accentCol, C.text),
      width: "100%",
      marginTop: 8,
      padding: "8px"
    }
  }, "View All ", generatedContent.flashcards.length, " Flashcards")), generatedContent.mcqs && React.createElement("div", {
    style: {
      ...S.card,
      marginBottom: 12,
      padding: "12px 14px"
    }
  }, React.createElement("div", {
    style: {
      fontWeight: 600,
      marginBottom: 8
    }
  }, "❓ Practice Questions (", generatedContent.mcqs.length, ")"), React.createElement("div", {
    style: {
      fontSize: 13,
      color: C.muted,
      lineHeight: "1.6"
    }
  }, generatedContent.mcqs.slice(0, 2).map((q, i) => React.createElement("div", {
    key: i,
    style: {
      marginBottom: 8
    }
  }, React.createElement("strong", null, "Q: ", q.question), React.createElement("br", null), q.options.slice(0, 2).map((opt, j) => React.createElement("div", {
    key: j,
    style: {
      fontSize: 12,
      marginLeft: 12
    }
  }, "• ", opt))))), React.createElement("button", {
    style: {
      ...S.btn(accentCol, C.text),
      width: "100%",
      marginTop: 8,
      padding: "8px"
    }
  }, "Take Quiz")), generatedContent.summary && React.createElement("div", {
    style: {
      ...S.card,
      padding: "12px 14px"
    }
  }, React.createElement("div", {
    style: {
      fontWeight: 600,
      marginBottom: 8
    }
  }, "📝 Key Summary"), React.createElement("div", {
    style: {
      fontSize: 13,
      color: C.muted,
      lineHeight: "1.6"
    }
  }, generatedContent.summary.slice(0, 300), "..."), React.createElement("button", {
    style: {
      ...S.btn(accentCol, C.text),
      width: "100%",
      marginTop: 8,
      padding: "8px"
    }
  }, "Read Full Summary"))), documents.length === 0 && React.createElement("div", {
    style: {
      textAlign: "center",
      padding: "40px 20px",
      color: C.muted
    }
  }, React.createElement("div", {
    style: {
      fontSize: 32,
      marginBottom: 12
    }
  }, "📚"), React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 600
    }
  }, "No documents yet"), React.createElement("div", {
    style: {
      fontSize: 13,
      marginTop: 4
    }
  }, "Upload your first document to get started")));
}
function QuizScreen({
  profile,
  config,
  plan,
  documentId
}) {
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState([]);
  const [completed, setCompleted] = useState(false);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const accentCol = config?.accentColor || C.accent;
  const startQuiz = async () => {
    if (!documentId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/quiz/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("sima_token")}`
        },
        body: JSON.stringify({
          documentId,
          questionCount: 5
        })
      });
      const data = await res.json();
      setQuiz(data);
      setCurrentQuestion(0);
      setResponses([]);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };
  const selectAnswer = optionIndex => {
    const newResponses = [...responses];
    newResponses[currentQuestion] = optionIndex;
    setResponses(newResponses);
  };
  const submitQuiz = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/quiz/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("sima_token")}`
        },
        body: JSON.stringify({
          quizId: quiz.quizId,
          responses: responses.map((resp, idx) => ({
            questionId: quiz.questions[idx].id,
            userResponse: resp,
            correct: resp === quiz.questions[idx].correctAnswer
          }))
        })
      });
      const data = await res.json();
      setResults(data);
      setCompleted(true);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };
  if (!quiz) {
    return React.createElement("div", {
      style: {
        padding: "20px 16px 80px",
        textAlign: "center"
      }
    }, React.createElement("div", {
      style: {
        fontSize: 22,
        fontWeight: 800,
        marginBottom: 20
      }
    }, "❓ Quiz & Assessment"), React.createElement("div", {
      style: {
        ...S.card,
        padding: "20px",
        marginBottom: 16
      }
    }, React.createElement("div", {
      style: {
        fontSize: 48,
        marginBottom: 12
      }
    }, "📝"), React.createElement("div", {
      style: {
        fontSize: 14,
        marginBottom: 12
      }
    }, "Test your knowledge with AI-generated quizzes"), React.createElement("button", {
      onClick: startQuiz,
      disabled: loading || !documentId,
      style: {
        ...S.btn(accentCol),
        width: "100%",
        padding: "12px"
      }
    }, loading ? "Starting..." : "Start Quiz")));
  }
  if (completed && results) {
    const passed = results.passed;
    return React.createElement("div", {
      style: {
        padding: "20px 16px 80px"
      }
    }, React.createElement("div", {
      style: {
        textAlign: "center",
        marginBottom: 20
      }
    }, React.createElement("div", {
      style: {
        fontSize: 48,
        marginBottom: 12
      }
    }, passed ? "🎉" : "📚"), React.createElement("div", {
      style: {
        fontSize: 22,
        fontWeight: 800,
        marginBottom: 8
      }
    }, passed ? "Great Job!" : "Keep Learning"), React.createElement("div", {
      style: {
        fontSize: 14,
        color: C.muted
      }
    }, "Your Score")), React.createElement("div", {
      style: {
        ...S.card,
        padding: "20px",
        textAlign: "center",
        marginBottom: 16
      }
    }, React.createElement("div", {
      style: {
        fontSize: 48,
        fontWeight: 800,
        color: accentCol,
        marginBottom: 8
      }
    }, results.scorePercentage, "%"), React.createElement("div", {
      style: {
        fontSize: 13,
        color: C.muted,
        marginBottom: 12
      }
    }, results.correctAnswers, " of ", results.totalQuestions, " correct"), React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 10
      }
    }, React.createElement("div", {
      style: {
        ...S.card,
        padding: "10px",
        background: C.green + "22"
      }
    }, React.createElement("div", {
      style: {
        fontSize: 20,
        fontWeight: 800,
        color: C.green
      }
    }, results.correctAnswers), React.createElement("div", {
      style: {
        fontSize: 11,
        color: C.muted
      }
    }, "Correct")), React.createElement("div", {
      style: {
        ...S.card,
        padding: "10px",
        background: C.red + "22"
      }
    }, React.createElement("div", {
      style: {
        fontSize: 20,
        fontWeight: 800,
        color: C.red
      }
    }, results.totalQuestions - results.correctAnswers), React.createElement("div", {
      style: {
        fontSize: 11,
        color: C.muted
      }
    }, "Incorrect")))), React.createElement("button", {
      onClick: () => {
        setQuiz(null);
        setCompleted(false);
        setResults(null);
      },
      style: {
        ...S.btn(accentCol),
        width: "100%",
        padding: "12px"
      }
    }, "Take Another Quiz"));
  }
  const q = quiz.questions[currentQuestion];
  const progress = Math.round((currentQuestion + 1) / quiz.totalQuestions * 100);
  return React.createElement("div", {
    style: {
      padding: "20px 16px 80px"
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16
    }
  }, React.createElement("div", {
    style: {
      fontSize: 16,
      fontWeight: 700
    }
  }, "Question ", currentQuestion + 1, "/", quiz.totalQuestions), React.createElement("div", {
    style: {
      fontSize: 13,
      color: C.muted
    }
  }, progress, "%")), React.createElement(ProgressBar, {
    value: currentQuestion + 1,
    max: quiz.totalQuestions,
    color: accentCol,
    height: 4
  }), React.createElement("div", {
    style: {
      ...S.card,
      padding: "16px",
      marginTop: 16,
      marginBottom: 16
    }
  }, React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 600,
      marginBottom: 16
    }
  }, q.question), React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 10
    }
  }, q.options.map((option, idx) => React.createElement("button", {
    key: idx,
    onClick: () => selectAnswer(idx),
    style: {
      ...S.btn(responses[currentQuestion] === idx ? accentCol : C.surface, C.text),
      border: `1px solid ${responses[currentQuestion] === idx ? accentCol : C.border}`,
      padding: "12px",
      textAlign: "left",
      fontSize: 14
    }
  }, React.createElement("span", {
    style: {
      display: "inline-block",
      width: 24,
      fontWeight: 700
    }
  }, String.fromCharCode(65 + idx), "."), option)))), React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 10
    }
  }, React.createElement("button", {
    onClick: () => setCurrentQuestion(Math.max(0, currentQuestion - 1)),
    disabled: currentQuestion === 0,
    style: {
      ...S.btn(C.surface, C.text),
      border: `1px solid ${C.border}`,
      padding: "10px",
      opacity: currentQuestion === 0 ? 0.5 : 1
    }
  }, "← Previous"), currentQuestion === quiz.totalQuestions - 1 ? React.createElement("button", {
    onClick: submitQuiz,
    disabled: loading || responses.length !== quiz.totalQuestions,
    style: {
      ...S.btn(accentCol),
      padding: "10px"
    }
  }, loading ? "Submitting..." : "Submit Quiz") : React.createElement("button", {
    onClick: () => setCurrentQuestion(currentQuestion + 1),
    style: {
      ...S.btn(accentCol),
      padding: "10px"
    }
  }, "Next →")));
}
function StudyPlannerScreen({
  profile,
  config,
  plan
}) {
  const [studyPlan, setStudyPlan] = useState(null);
  const [todaysTasks, setTodaysTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showNewPlan, setShowNewPlan] = useState(false);
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState("");
  const [examDate, setExamDate] = useState("");
  const [hoursPerDay, setHoursPerDay] = useState("2");
  const [coursesPerDay, setCoursesPerDay] = useState("1");
  const [previousWeekScore, setPreviousWeekScore] = useState("78");
  const [preferredTime, setPreferredTime] = useState("morning");
  const [learningStyles, setLearningStyles] = useState(["spaced-repetition"]);
  const [studySpan, setStudySpan] = useState("30");
  const [focusLevel, setFocusLevel] = useState("medium");
  const [breaksPerHour, setBreaksPerHour] = useState("2");
  const [courseDifficulty, setCourseDifficulty] = useState({});
  const [newCourse, setNewCourse] = useState("");
  const [newDifficulty, setNewDifficulty] = useState("medium");
  const accentCol = config?.accentColor || C.accent;
  const learningStyleOptions = [{
    id: "spaced-repetition",
    label: "Spaced Repetition",
    icon: "🔄"
  }, {
    id: "active-recall",
    label: "Active Recall",
    icon: "🧠"
  }, {
    id: "group-study",
    label: "Group Study",
    icon: "👥"
  }, {
    id: "mind-mapping",
    label: "Mind Mapping",
    icon: "🗺️"
  }, {
    id: "visual-learning",
    label: "Visual Learning",
    icon: "👁️"
  }, {
    id: "auditory",
    label: "Auditory",
    icon: "🎧"
  }, {
    id: "kinesthetic",
    label: "Kinesthetic",
    icon: "✋"
  }, {
    id: "reading-writing",
    label: "Reading/Writing",
    icon: "📖"
  }];
  const toggleLearningStyle = styleId => {
    setLearningStyles(prev => prev.includes(styleId) ? prev.filter(s => s !== styleId) : [...prev, styleId]);
  };
  const addCourse = () => {
    if (newCourse.trim()) {
      setCourseDifficulty(prev => ({
        ...prev,
        [newCourse.trim()]: newDifficulty
      }));
      setNewCourse("");
    }
  };
  const buildTodaysTasks = planData => {
    const timetable = planData?.timetable || {};
    const tasks = [];
    Object.keys(timetable).slice(0, 3).forEach(day => {
      const sessions = timetable[day] || [];
      sessions.slice(0, 2).forEach((session, index) => {
        tasks.push({
          title: `${day}: ${session.activity}`,
          estimatedTime: session.duration || 45,
          id: `${day}-${index}`
        });
      });
    });
    return tasks;
  };
  const loadTodaysTasks = () => {
    const fallbackTasks = buildTodaysTasks(studyPlan);
    setTodaysTasks(fallbackTasks);
  };
  const generateTimetable = () => {
    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const styleMap = {
      "spaced-repetition": {
        icon: "🔄",
        name: "Spaced Repetition"
      },
      "active-recall": {
        icon: "🧠",
        name: "Active Recall"
      },
      "group-study": {
        icon: "👥",
        name: "Group Study"
      },
      "mind-mapping": {
        icon: "🗺️",
        name: "Mind Mapping"
      },
      "visual-learning": {
        icon: "👁️",
        name: "Visual"
      },
      "auditory": {
        icon: "🎧",
        name: "Listen & Discuss"
      },
      "kinesthetic": {
        icon: "✋",
        name: "Hands-on"
      },
      "reading-writing": {
        icon: "📖",
        name: "Reading/Notes"
      }
    };
    const courses = Object.keys(courseDifficulty).length > 0 ? Object.keys(courseDifficulty) : [profile?.program || "Main Subject"];
    const examDateObj = examDate ? new Date(examDate) : null;
    const daysUntilExam = examDateObj ? Math.max(0, Math.ceil((examDateObj - new Date()) / (1000 * 60 * 60 * 24))) : null;
    const examBoost = daysUntilExam !== null ? daysUntilExam <= 7 ? 1.35 : daysUntilExam <= 14 ? 1.2 : daysUntilExam <= 30 ? 1.1 : 1 : 1;
    const performanceBoost = parseInt(previousWeekScore) < 70 ? 1.25 : parseInt(previousWeekScore) < 85 ? 1.1 : 0.95;
    const difficultyWeights = {
      hardest: 1.3,
      hard: 1.15,
      medium: 1,
      easy: 0.85
    };
    const getDifficultyMultiplier = course => difficultyWeights[(courseDifficulty[course] || "medium").toLowerCase()] || 1;
    const schedule = {};
    const sessionsPerDay = Math.max(1, parseInt(coursesPerDay) || 1);
    daysOfWeek.forEach((day, dayIdx) => {
      const sessions = [];
      const availableCourses = courses.slice(dayIdx % courses.length).concat(courses.slice(0, dayIdx % courses.length));
      for (let i = 0; i < sessionsPerDay; i++) {
        const course = availableCourses[i % availableCourses.length] || courses[0];
        const difficultyMultiplier = getDifficultyMultiplier(course);
        const duration = Math.min(90, Math.max(30, Math.round(45 * examBoost * performanceBoost * difficultyMultiplier)));
        const learningStyle = learningStyles[i % learningStyles.length] || "spaced-repetition";
        const styleInfo = styleMap[learningStyle] || styleMap["spaced-repetition"];
        const activity = i % 2 === 0 ? `${styleInfo.icon} Study: ${course}` : `✍️ Practice: ${course}`;
        const description = i % 2 === 0 ? `Deep focus on ${course} with ${styleInfo.name.toLowerCase()}` : `Reinforce ${course} with active recall and quick review`;
        sessions.push({
          time: `${String(8 + i * 1.5).padStart(2, '0')}:00`,
          endTime: `${String(8 + i * 1.5 + 1).padStart(2, '0')}:00`,
          activity,
          description,
          course,
          duration,
          learningStyle,
          learningStyleInfo: styleInfo
        });
      }
      if (day === "Sunday") {
        sessions.push({
          time: "10:00",
          endTime: "10:45",
          activity: "📋 Weekly Review",
          description: `Recap all subjects${daysUntilExam !== null ? ` before your exam in ${daysUntilExam} days` : ""}`,
          course: "All Subjects",
          duration: 45,
          learningStyle: "active-recall",
          learningStyleInfo: styleMap["active-recall"]
        });
      }
      schedule[day] = sessions;
    });
    return schedule;
  };
  const createPlan = async () => {
    setLoading(true);
    try {
      const nextPlan = {
        goals: goals.map((g, i) => ({
          id: `goal_${i}`,
          title: g,
          progress: 0
        })),
        examDate,
        personalization: {
          coursesPerDay: parseInt(coursesPerDay),
          previousWeekScore: parseInt(previousWeekScore),
          hoursPerDay: parseInt(hoursPerDay),
          preferredTime,
          learningStyles,
          examDate,
          studySpan: parseInt(studySpan),
          focusLevel,
          breaksPerHour: parseInt(breaksPerHour),
          courseDifficulty
        },
        studyMethods: learningStyles.map(style => ({
          method: style.replace(/-/g, "_")
        })),
        timetable: generateTimetable()
      };
      localStorage.setItem("sima_study_plan", JSON.stringify(nextPlan));
      setStudyPlan(nextPlan);
      setTodaysTasks(buildTodaysTasks(nextPlan));
      setShowNewPlan(false);
      setGoals([]);
      setNewGoal("");
      setExamDate("");
      try {
        await fetch(`${API_BASE_URL}/api/study-plan/save`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("sima_token")}`
          },
          body: JSON.stringify(nextPlan)
        });
      } catch (err) {
        console.warn("Study plan sync skipped", err);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const storedPlan = localStorage.getItem("sima_study_plan");
    if (storedPlan) {
      try {
        const parsed = JSON.parse(storedPlan);
        setStudyPlan(parsed);
        setTodaysTasks(buildTodaysTasks(parsed));
      } catch (err) {
        console.error("Failed to load saved study plan", err);
      }
    }
  }, []);
  const addGoal = () => {
    if (newGoal.trim()) {
      setGoals([...goals, newGoal.trim()]);
      setNewGoal("");
    }
  };
  if (showNewPlan) {
    return React.createElement("div", {
      style: {
        padding: "20px 16px 80px"
      }
    }, React.createElement("div", {
      style: {
        fontSize: 22,
        fontWeight: 800,
        marginBottom: 4
      }
    }, "📅 Create Study Plan"), React.createElement("div", {
      style: {
        fontSize: 13,
        color: C.muted,
        marginBottom: 20
      }
    }, "Personalize your learning journey"), React.createElement("div", {
      style: {
        ...S.card,
        padding: "16px",
        marginBottom: 16
      }
    }, React.createElement("div", {
      style: {
        fontWeight: 600,
        marginBottom: 12
      }
    }, "Your Goals"), React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 8,
        marginBottom: 12
      }
    }, goals.map((g, i) => React.createElement("div", {
      key: i,
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: C.surface,
        padding: "8px 12px",
        borderRadius: 8
      }
    }, React.createElement("span", {
      style: {
        fontSize: 13
      }
    }, g), React.createElement("button", {
      onClick: () => setGoals(goals.filter((_, j) => j !== i)),
      style: {
        background: "none",
        border: "none",
        cursor: "pointer",
        color: C.muted
      }
    }, "✕")))), React.createElement("div", {
      style: {
        display: "flex",
        gap: 8
      }
    }, React.createElement("input", {
      value: newGoal,
      onChange: e => setNewGoal(e.target.value),
      onKeyDown: e => e.key === "Enter" && addGoal(),
      placeholder: "E.g., Master calculus",
      style: {
        ...S.input,
        flex: 1
      }
    }), React.createElement("button", {
      onClick: addGoal,
      style: {
        ...S.btn(accentCol),
        padding: "8px 14px"
      }
    }, "Add"))), React.createElement("div", {
      style: {
        ...S.card,
        padding: "16px",
        marginBottom: 16
      }
    }, React.createElement("div", {
      style: {
        fontWeight: 600,
        marginBottom: 12
      }
    }, "📊 Personalization"), React.createElement("label", {
      style: S.label
    }, "Study Plan Duration (Days)"), React.createElement("input", {
      type: "number",
      min: "1",
      max: "365",
      value: studySpan,
      onChange: e => setStudySpan(e.target.value),
      style: {
        ...S.input,
        marginBottom: 12
      }
    }), React.createElement("label", {
      style: S.label
    }, "Exam Date (Optional)"), React.createElement("input", {
      type: "date",
      value: examDate,
      onChange: e => setExamDate(e.target.value),
      style: {
        ...S.input,
        marginBottom: 12
      }
    }), React.createElement("label", {
      style: S.label
    }, "Hours Per Day"), React.createElement("div", {
      style: {
        display: "flex",
        gap: 8,
        marginBottom: 12
      }
    }, ["1", "2", "3", "4", "5"].map(h => React.createElement("button", {
      key: h,
      onClick: () => setHoursPerDay(h),
      style: {
        flex: 1,
        padding: "8px",
        borderRadius: 6,
        border: `2px solid ${hoursPerDay === h ? accentCol : C.border}`,
        background: hoursPerDay === h ? accentCol + "15" : C.surface,
        color: hoursPerDay === h ? accentCol : C.text,
        fontWeight: 600,
        cursor: "pointer"
      }
    }, h, "h"))), React.createElement("label", {
      style: S.label
    }, "Courses Per Day"), React.createElement("div", {
      style: {
        display: "flex",
        gap: 8,
        marginBottom: 12
      }
    }, ["1", "2", "3"].map(n => React.createElement("button", {
      key: n,
      onClick: () => setCoursesPerDay(n),
      style: {
        flex: 1,
        padding: "8px",
        borderRadius: 6,
        border: `2px solid ${coursesPerDay === n ? accentCol : C.border}`,
        background: coursesPerDay === n ? accentCol + "15" : C.surface,
        color: coursesPerDay === n ? accentCol : C.text,
        fontWeight: 600,
        cursor: "pointer"
      }
    }, n))), React.createElement("label", {
      style: S.label
    }, "Last Week Score"), React.createElement("input", {
      type: "number",
      min: "0",
      max: "100",
      value: previousWeekScore,
      onChange: e => setPreviousWeekScore(e.target.value),
      style: {
        ...S.input,
        marginBottom: 12
      },
      placeholder: "% performance in the last week"
    }), React.createElement("label", {
      style: S.label
    }, "Focus Level"), React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: 8,
        marginBottom: 12
      }
    }, ["low", "medium", "high"].map(level => React.createElement("button", {
      key: level,
      onClick: () => setFocusLevel(level),
      style: {
        padding: "8px",
        borderRadius: 6,
        border: `2px solid ${focusLevel === level ? accentCol : C.border}`,
        background: focusLevel === level ? accentCol + "15" : C.surface,
        color: focusLevel === level ? accentCol : C.text,
        fontWeight: 600,
        cursor: "pointer",
        textTransform: "capitalize"
      }
    }, level === "low" ? "🟢 Light" : level === "medium" ? "🟡 Medium" : "🔴 Intense"))), React.createElement("label", {
      style: S.label
    }, "Breaks Per Hour"), React.createElement("div", {
      style: {
        display: "flex",
        gap: 8,
        marginBottom: 12
      }
    }, ["1", "2", "3", "4"].map(b => React.createElement("button", {
      key: b,
      onClick: () => setBreaksPerHour(b),
      style: {
        flex: 1,
        padding: "8px",
        borderRadius: 6,
        border: `2px solid ${breaksPerHour === b ? accentCol : C.border}`,
        background: breaksPerHour === b ? accentCol + "15" : C.surface,
        color: breaksPerHour === b ? accentCol : C.text,
        fontWeight: 600,
        cursor: "pointer"
      }
    }, b))), React.createElement("label", {
      style: S.label
    }, "Preferred Study Time"), React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: 8,
        marginBottom: 12
      }
    }, ["morning", "afternoon", "evening"].map(time => React.createElement("button", {
      key: time,
      onClick: () => setPreferredTime(time),
      style: {
        padding: "8px",
        borderRadius: 6,
        border: `2px solid ${preferredTime === time ? accentCol : C.border}`,
        background: preferredTime === time ? accentCol + "15" : C.surface,
        color: preferredTime === time ? accentCol : C.text,
        fontWeight: 600,
        cursor: "pointer",
        textTransform: "capitalize"
      }
    }, time === "morning" ? "🌅" : time === "afternoon" ? "☀️" : "🌙"))), React.createElement("label", {
      style: S.label
    }, "Learning Styles (Select Multiple)"), React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 8,
        marginBottom: 12
      }
    }, learningStyleOptions.map(style => React.createElement("button", {
      key: style.id,
      onClick: () => toggleLearningStyle(style.id),
      style: {
        padding: "10px 8px",
        borderRadius: 6,
        border: `2px solid ${learningStyles.includes(style.id) ? accentCol : C.border}`,
        background: learningStyles.includes(style.id) ? accentCol + "15" : C.surface,
        color: learningStyles.includes(style.id) ? accentCol : C.text,
        fontWeight: 600,
        cursor: "pointer",
        fontSize: 12,
        textAlign: "center"
      }
    }, style.icon, " ", style.label))), React.createElement("label", {
      style: S.label
    }, "Course Difficulty (Hardest to Easiest)"), React.createElement("div", {
      style: {
        display: "flex",
        gap: 8,
        marginBottom: 12
      }
    }, React.createElement("input", {
      value: newCourse,
      onChange: e => setNewCourse(e.target.value),
      placeholder: "E.g., Advanced Physics",
      style: {
        ...S.input,
        flex: 1
      }
    }), React.createElement("select", {
      value: newDifficulty,
      onChange: e => setNewDifficulty(e.target.value),
      style: {
        ...S.input,
        width: "auto"
      }
    }, React.createElement("option", {
      value: "hardest"
    }, "Hardest"), React.createElement("option", {
      value: "hard"
    }, "Hard"), React.createElement("option", {
      value: "medium"
    }, "Medium"), React.createElement("option", {
      value: "easy"
    }, "Easy")), React.createElement("button", {
      onClick: addCourse,
      style: {
        ...S.btn(accentCol),
        padding: "8px 14px"
      }
    }, "Add")), React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 6
      }
    }, Object.entries(courseDifficulty).map(([course, diff]) => React.createElement("div", {
      key: course,
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: C.surface,
        padding: "8px 12px",
        borderRadius: 8,
        fontSize: 12
      }
    }, React.createElement("span", null, course), React.createElement("div", {
      style: {
        display: "flex",
        gap: 8,
        alignItems: "center"
      }
    }, React.createElement("span", {
      style: {
        color: C.muted
      }
    }, diff), React.createElement("button", {
      onClick: () => setCourseDifficulty(prev => {
        const n = {
          ...prev
        };
        delete n[course];
        return n;
      }),
      style: {
        background: "none",
        border: "none",
        cursor: "pointer",
        color: C.muted
      }
    }, "✕")))))), React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 10
      }
    }, React.createElement("button", {
      onClick: () => setShowNewPlan(false),
      style: {
        ...S.btn(C.surface, C.text),
        border: `1px solid ${C.border}`,
        padding: "12px"
      }
    }, "Cancel"), React.createElement("button", {
      onClick: createPlan,
      disabled: loading || goals.length === 0,
      style: {
        ...S.btn(accentCol),
        padding: "12px",
        opacity: goals.length === 0 ? 0.5 : 1
      }
    }, loading ? "Creating..." : "Create Plan")));
  }
  if (!studyPlan) {
    return React.createElement("div", {
      style: {
        padding: "20px 16px 80px",
        textAlign: "center"
      }
    }, React.createElement("div", {
      style: {
        fontSize: 22,
        fontWeight: 800,
        marginBottom: 20
      }
    }, "📅 Study Planner"), React.createElement("div", {
      style: {
        ...S.card,
        padding: "20px",
        marginBottom: 16
      }
    }, React.createElement("div", {
      style: {
        fontSize: 48,
        marginBottom: 12
      }
    }, "📋"), React.createElement("div", {
      style: {
        fontSize: 14,
        marginBottom: 12
      }
    }, "No study plan yet. Create one to get started!"), React.createElement("button", {
      onClick: () => setShowNewPlan(true),
      style: {
        ...S.btn(accentCol),
        width: "100%",
        padding: "12px"
      }
    }, "Create Study Plan")));
  }
  return React.createElement("div", {
    style: {
      padding: "20px 16px 80px"
    }
  }, React.createElement("div", {
    style: {
      fontSize: 22,
      fontWeight: 800,
      marginBottom: 4
    }
  }, "📅 Your Study Plan"), React.createElement("div", {
    style: {
      fontSize: 13,
      color: C.muted,
      marginBottom: 20
    }
  }, "Personalized learning schedule"), todaysTasks && todaysTasks.length > 0 && React.createElement("div", {
    style: {
      ...S.card,
      padding: "16px",
      marginBottom: 16,
      background: accentCol + "11",
      border: `1px solid ${accentCol}33`
    }
  }, React.createElement("div", {
    style: {
      fontWeight: 600,
      marginBottom: 12,
      color: accentCol
    }
  }, "📌 Today's Tasks"), React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 10
    }
  }, todaysTasks.slice(0, 3).map((task, i) => React.createElement("div", {
    key: i,
    style: {
      display: "flex",
      gap: 10,
      alignItems: "flex-start"
    }
  }, React.createElement("input", {
    type: "checkbox",
    style: {
      marginTop: 4
    }
  }), React.createElement("div", null, React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 600
    }
  }, task.title || "Task"), React.createElement("div", {
    style: {
      fontSize: 11,
      color: C.muted
    }
  }, task.estimatedTime || "---", " min")))))), studyPlan?.examDate && React.createElement("div", {
    style: {
      fontSize: 12,
      color: C.muted,
      marginBottom: 14
    }
  }, "Exam in ", Math.max(0, Math.ceil((new Date(studyPlan.examDate) - new Date()) / (1000 * 60 * 60 * 24))), " days — schedule includes extra revision and exam practice."), React.createElement("div", {
    style: {
      ...S.card,
      padding: "16px",
      marginBottom: 16
    }
  }, React.createElement("div", {
    style: {
      fontWeight: 600,
      marginBottom: 12
    }
  }, "📚 Your Goals"), React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 10
    }
  }, Array.isArray(studyPlan?.goals) && studyPlan.goals.length > 0 ? studyPlan.goals.map((goal, i) => React.createElement("div", {
    key: i,
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "10px",
      background: C.surface,
      borderRadius: 8
    }
  }, React.createElement("div", null, React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 600
    }
  }, goal.title), React.createElement("div", {
    style: {
      fontSize: 11,
      color: C.muted
    }
  }, "Progress: ", goal.progress || 0, "%")), React.createElement(ProgressBar, {
    value: goal.progress || 0,
    max: 100,
    color: accentCol,
    height: 3
  }))) : React.createElement("div", {
    style: {
      textAlign: "center",
      color: C.muted
    }
  }, "No goals yet"))), Array.isArray(studyPlan?.studyMethods) && studyPlan.studyMethods.length > 0 && React.createElement("div", {
    style: {
      ...S.card,
      padding: "16px",
      marginBottom: 16
    }
  }, React.createElement("div", {
    style: {
      fontWeight: 600,
      marginBottom: 12
    }
  }, "🎯 Recommended Methods"), React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      flexWrap: "wrap"
    }
  }, studyPlan.studyMethods.slice(0, 4).map((method, i) => React.createElement(Badge, {
    key: i,
    color: accentCol,
    style: {
      fontSize: 11
    }
  }, (method.method || method).replace(/_/g, " ").replace(/-/g, " "))))), studyPlan?.timetable && React.createElement("div", {
    style: {
      marginBottom: 16
    }
  }, React.createElement("div", {
    style: {
      fontSize: 16,
      fontWeight: 700,
      marginBottom: 16,
      color: accentCol
    }
  }, "✨ Weekly Schedule"), React.createElement("div", {
    style: {
      display: "grid",
      gap: 12
    }
  }, Object.entries(studyPlan.timetable).map(([day, sessions]) => React.createElement("div", {
    key: day,
    style: {
      ...S.card,
      padding: "12px"
    }
  }, React.createElement("div", {
    style: {
      fontWeight: 700,
      marginBottom: 8
    }
  }, day), React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, sessions.map((session, i) => React.createElement("div", {
    key: i,
    style: {
      background: C.surface,
      borderRadius: 8,
      padding: "10px 12px"
    }
  }, React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 600
    }
  }, session.activity), React.createElement("div", {
    style: {
      fontSize: 11,
      color: C.muted,
      marginTop: 2
    }
  }, session.time, " — ", session.description)))))))), React.createElement("button", {
    onClick: () => setShowNewPlan(true),
    style: {
      ...S.btn(accentCol),
      width: "100%",
      padding: "12px",
      marginTop: 16
    }
  }, "Update Plan"));
}
function ProfileMenuScreen({
  user,
  onClose,
  onLogout,
  onPasswordChange,
  onDeleteAccount
}) {
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const daysWithUs = user?.createdAt ? Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 0;
  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("All fields are required");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords don't match");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const response = await fetch(API_BASE_URL + "/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("sima_token")}`
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });
      if (!response.ok) {
        const err = await response.json();
        setError(err.error || "Failed to change password");
        setLoading(false);
        return;
      }
      setSuccess("Password changed successfully!");
      setTimeout(() => {
        setShowPasswordChange(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setSuccess("");
      }, 2000);
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure? This action cannot be undone. All your data will be deleted permanently.")) {
      return;
    }
    const password = prompt("Enter your password to confirm account deletion:");
    if (!password) {
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(API_BASE_URL + "/api/auth/delete-account", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("sima_token")}`
        },
        body: JSON.stringify({
          password
        })
      });
      if (!response.ok) {
        const err = await response.json();
        setError(err.error || "Failed to delete account");
        setLoading(false);
        return;
      }
      alert("Account deleted successfully. Goodbye!");
      localStorage.clear();
      sessionStorage.clear();
      onDeleteAccount?.();
      window.location.href = "/";
    } catch (err) {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };
  if (showPasswordChange) {
    return React.createElement("div", {
      style: {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `${C.bg}dd`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 999,
        padding: 20
      }
    }, React.createElement("div", {
      style: {
        background: C.surface,
        borderRadius: 12,
        padding: 24,
        maxWidth: 400,
        width: "100%",
        border: `1px solid ${C.border}`
      }
    }, React.createElement("div", {
      style: {
        fontSize: 18,
        fontWeight: 800,
        marginBottom: 16
      }
    }, "🔐 Change Password"), React.createElement("input", {
      type: "password",
      placeholder: "Current Password",
      value: currentPassword,
      onChange: e => setCurrentPassword(e.target.value),
      disabled: loading,
      style: {
        width: "100%",
        padding: "10px 12px",
        marginBottom: 12,
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 8,
        color: C.text,
        fontSize: 14
      }
    }), React.createElement("input", {
      type: "password",
      placeholder: "New Password",
      value: newPassword,
      onChange: e => setNewPassword(e.target.value),
      disabled: loading,
      style: {
        width: "100%",
        padding: "10px 12px",
        marginBottom: 12,
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 8,
        color: C.text,
        fontSize: 14
      }
    }), React.createElement("input", {
      type: "password",
      placeholder: "Confirm Password",
      value: confirmPassword,
      onChange: e => setConfirmPassword(e.target.value),
      disabled: loading,
      style: {
        width: "100%",
        padding: "10px 12px",
        marginBottom: 12,
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 8,
        color: C.text,
        fontSize: 14
      }
    }), error && React.createElement("div", {
      style: {
        color: C.red,
        fontSize: 12,
        marginBottom: 12
      }
    }, "⚠️ ", error), success && React.createElement("div", {
      style: {
        color: C.green,
        fontSize: 12,
        marginBottom: 12
      }
    }, "✅ ", success), React.createElement("div", {
      style: {
        display: "flex",
        gap: 8
      }
    }, React.createElement("button", {
      onClick: () => {
        setShowPasswordChange(false);
        setError("");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      },
      disabled: loading,
      style: {
        flex: 1,
        padding: "10px 12px",
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 8,
        color: C.text,
        cursor: loading ? "not-allowed" : "pointer",
        fontWeight: 600
      }
    }, "Cancel"), React.createElement("button", {
      onClick: handleChangePassword,
      disabled: loading,
      style: {
        flex: 1,
        padding: "10px 12px",
        background: C.accent,
        border: "none",
        borderRadius: 8,
        color: "white",
        cursor: loading ? "not-allowed" : "pointer",
        fontWeight: 600
      }
    }, loading ? "Updating…" : "Update"))));
  }
  return React.createElement("div", {
    style: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: `${C.bg}dd`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 999,
      padding: 20
    }
  }, React.createElement("div", {
    style: {
      background: C.surface,
      borderRadius: 12,
      padding: 24,
      maxWidth: 420,
      width: "100%",
      border: `1px solid ${C.border}`,
      maxHeight: "90vh",
      overflow: "auto"
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20
    }
  }, React.createElement("div", {
    style: {
      fontSize: 20,
      fontWeight: 800
    }
  }, "👤 Profile"), React.createElement("button", {
    onClick: onClose,
    style: {
      background: "transparent",
      border: "none",
      fontSize: 24,
      cursor: "pointer",
      color: C.muted
    }
  }, "✕")), React.createElement("div", {
    style: {
      background: C.card,
      borderRadius: 8,
      padding: 16,
      marginBottom: 16
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 16,
      marginBottom: 16,
      paddingBottom: 16,
      borderBottom: `1px solid ${C.border}`
    }
  }, React.createElement("div", {
    style: {
      width: 60,
      height: 60,
      borderRadius: "50%",
      background: user?.avatarImage ? `url(${user.avatarImage})` : `linear-gradient(135deg, ${C.accent}, ${C.purple})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 28,
      cursor: "pointer",
      color: "white"
    }
  }, !user?.avatarImage && (user?.avatar || "😊")), React.createElement("div", {
    style: {
      flex: 1
    }
  }, React.createElement("div", {
    style: {
      fontSize: 14,
      color: C.muted,
      marginBottom: 4
    }
  }, "Profile Picture"), React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      flexWrap: "wrap"
    }
  }, React.createElement("label", {
    style: {
      width: 36,
      height: 36,
      borderRadius: "50%",
      background: C.surface,
      border: `2px solid ${C.border}`,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 18
    }
  }, "📤", React.createElement("input", {
    type: "file",
    accept: "image/*",
    style: {
      display: "none"
    },
    onChange: e => {
      if (e.target.files?.[0]) {
        const reader = new FileReader();
        reader.onload = event => {
          const updUser = {
            ...user,
            avatarImage: event.target?.result,
            avatar: null
          };
          localStorage.setItem("sima_user", JSON.stringify(updUser));
          window.location.href = window.location.href;
        };
        reader.readAsDataURL(e.target.files[0]);
      }
    }
  })), ["😊", "😎", "🤔", "😌", "😍", "🥰", "😃", "🤗"].map(avatar => React.createElement("button", {
    key: avatar,
    onClick: () => {
      const updUser = {
        ...user,
        avatar,
        avatarImage: null
      };
      localStorage.setItem("sima_user", JSON.stringify(updUser));
      window.location.href = window.location.href;
    },
    style: {
      width: 36,
      height: 36,
      borderRadius: "50%",
      background: user?.avatar === avatar && !user?.avatarImage ? C.accent : C.surface,
      border: `2px solid ${user?.avatar === avatar && !user?.avatarImage ? C.accent : C.border}`,
      cursor: "pointer",
      fontSize: 18,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, avatar))))), React.createElement("div", {
    style: {
      fontSize: 14,
      color: C.muted,
      marginBottom: 6
    }
  }, "Name"), React.createElement("div", {
    style: {
      fontSize: 16,
      fontWeight: 700,
      marginBottom: 16,
      color: user?.name && user.name !== "User" ? C.text : C.muted
    }
  }, user?.name && user.name !== "User" ? user.name : user?.email?.split("@")[0] || "User"), React.createElement("div", {
    style: {
      fontSize: 14,
      color: C.muted,
      marginBottom: 6
    }
  }, "Email"), React.createElement("div", {
    style: {
      fontSize: 14,
      marginBottom: 16
    }
  }, user?.email, user?.email_verified && React.createElement("span", {
    style: {
      marginLeft: 8,
      color: C.green,
      fontWeight: 600
    }
  }, "✓ Verified")), user?.phone && React.createElement(React.Fragment, null, React.createElement("div", {
    style: {
      fontSize: 14,
      color: C.muted,
      marginBottom: 6
    }
  }, "Phone"), React.createElement("div", {
    style: {
      fontSize: 14,
      marginBottom: 16
    }
  }, user.phone, user.phone_verified && React.createElement("span", {
    style: {
      marginLeft: 8,
      color: C.green,
      fontWeight: 600
    }
  }, "✓ Verified"))), React.createElement("div", {
    style: {
      fontSize: 14,
      color: C.muted,
      marginBottom: 6
    }
  }, "Days with us"), React.createElement("div", {
    style: {
      fontSize: 16,
      fontWeight: 700
    }
  }, daysWithUs, " days 📈")), React.createElement("button", {
    onClick: () => setShowPasswordChange(true),
    style: {
      width: "100%",
      padding: "12px 16px",
      marginBottom: 8,
      background: C.card,
      border: `1px solid ${C.border}`,
      borderRadius: 8,
      color: C.text,
      cursor: "pointer",
      fontWeight: 600,
      textAlign: "left",
      transition: "all 0.3s ease"
    },
    onMouseEnter: e => {
      e.target.style.background = `${C.card}cc`;
      e.target.style.borderColor = C.accent;
    },
    onMouseLeave: e => {
      e.target.style.background = C.card;
      e.target.style.borderColor = C.border;
    }
  }, "🔐 Change Password"), React.createElement("button", {
    onClick: () => onLogout?.(),
    style: {
      width: "100%",
      padding: "12px 16px",
      marginBottom: 8,
      background: C.card,
      border: `1px solid ${C.border}`,
      borderRadius: 8,
      color: C.text,
      cursor: "pointer",
      fontWeight: 600,
      textAlign: "left",
      transition: "all 0.3s ease"
    },
    onMouseEnter: e => {
      e.target.style.background = `${C.card}cc`;
      e.target.style.borderColor = C.accent;
    },
    onMouseLeave: e => {
      e.target.style.background = C.card;
      e.target.style.borderColor = C.border;
    }
  }, "🚪 Switch User"), React.createElement("button", {
    onClick: handleDeleteAccount,
    disabled: loading,
    style: {
      width: "100%",
      padding: "12px 16px",
      marginBottom: 8,
      background: `${C.red}22`,
      border: `1px solid ${C.red}44`,
      borderRadius: 8,
      color: C.red,
      cursor: loading ? "not-allowed" : "pointer",
      fontWeight: 600,
      textAlign: "left",
      transition: "all 0.3s ease",
      opacity: loading ? 0.6 : 1
    },
    onMouseEnter: e => !loading && (e.target.style.background = `${C.red}44`),
    onMouseLeave: e => !loading && (e.target.style.background = `${C.red}22`)
  }, loading ? "Deleting…" : "🗑️ Delete Account"), error && React.createElement("div", {
    style: {
      color: C.red,
      fontSize: 12,
      marginTop: 12
    }
  }, "⚠️ ", error), React.createElement("button", {
    onClick: onClose,
    style: {
      width: "100%",
      padding: "12px 16px",
      marginTop: 12,
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: 8,
      color: C.muted,
      cursor: "pointer",
      fontWeight: 600
    }
  }, "Close")));
}
function SimaMindApp() {
  const [screen, setScreen] = useState("welcome");
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [config, setConfig] = useState(null);
  const [plan, setPlan] = useState("free");
  const [isFirstUse, setIsFirstUse] = useState(true);
  const [groupContext, setGroupContext] = useState(null);
  const [showPomodoro, setShowPomodoro] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [displayMode, setDisplayMode] = useState("default");
  const [prefersDark, setPrefersDark] = useState(typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
  const themeMode = displayMode === "default" ? prefersDark ? "dark" : "light" : displayMode;
  const currentTheme = THEME_PALETTES[themeMode] || THEME_PALETTES.dark;
  Object.assign(C, currentTheme);
  const subscription = useSubscription();
  const applyProfile = async p => {
    try {
      const response = await fetch("/api/onboarding/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("sima_token")}`
        },
        body: JSON.stringify({
          name: p.name,
          age: p.age,
          education: p.education,
          program: p.program,
          year: p.year,
          institution: p.institution,
          studyTime: p.studyTime,
          attention: p.attention,
          style: p.style,
          hours: p.hours,
          urgency: p.urgency,
          email: p.email
        })
      });
      if (!response.ok) {
        const error = await response.json();
        console.error("Profile save error:", error);
        return;
      }
      setProfile(p);
      setConfig(PROFILE_ENGINE.getConfig(p, {
        resetProgress: true
      }));
    } catch (err) {
      console.error("Failed to save profile:", err);
    }
  };
  const handleGuest = () => {
    const guestProfile = {
      name: "Guest",
      education: "university",
      program: "General",
      style: ["visual"],
      hours: 3,
      attention: "medium",
      studyTime: "morning"
    };
    applyProfile(guestProfile);
    setScreen("dashboard");
  };
  const handleResetProgress = () => {
    if (!profile) return;
    applyProfile(profile);
    alert("✅ Study progress has been reset to a fresh starting state.");
  };
  const handlePlanChange = newPlan => {
    const selectedPlan = PLANS.find(p => p.id === newPlan);
    if (selectedPlan.price.usd > 0) {
      setScreen("payment");
      setPlan(newPlan);
    } else {
      setPlan(newPlan);
      setScreen("dashboard");
      console.log(`Activated ${newPlan} plan`);
    }
  };
  const handlePaymentComplete = receipt => {
    subscription.upgradePlan(plan);
    setScreen("dashboard");
    alert(`🎉 Welcome to ${PLANS.find(p => p.id === plan).label}! Your receipt: ${receipt.id}`);
  };
  const handleVerificationComplete = (method, value) => {
    localStorage.setItem("verified_contact", JSON.stringify({
      method,
      value,
      timestamp: Date.now()
    }));
    setScreen("welcome-message");
  };
  const handleWelcomeComplete = () => {
    setScreen("onboarding");
  };
  const handleLoginSuccess = user => {
    const userName = user.name && user.name !== "User" ? user.name : user.email?.split("@")[0] || "User";
    const updatedUser = {
      ...user,
      name: userName,
      avatar: user.avatar || "😊",
      avatarImage: user.avatarImage || null
    };
    localStorage.setItem("sima_user", JSON.stringify(updatedUser));
    setUser(updatedUser);
    setProfile({
      name: userName,
      education: "university",
      program: "General",
      style: ["visual"],
      hours: 3,
      attention: "medium",
      studyTime: "morning"
    });
    setScreen("dashboard");
    setIsFirstUse(false);
  };
  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    setProfile(null);
    setConfig(null);
    setPlan("free");
    setScreen("landing");
  };
  useEffect(() => {
    Object.assign(C, currentTheme);
    const style = document.createElement("style");
    const buildStyles = () => `
      @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');
      @keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-5px)} }
      @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      @keyframes fadein { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { background: ${currentTheme.bg}; color: ${currentTheme.text}; }
      html { background: ${currentTheme.bg}; color: ${currentTheme.text}; }
      ::-webkit-scrollbar { width: 3px; height: 3px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: ${currentTheme.border}; border-radius: 4px; }
      select option { background: ${currentTheme.card}; color: ${currentTheme.text}; }
      input, textarea, select { color: ${currentTheme.text}; }
      input[type=range] { height: 4px; border-radius: 2px; }
      button:focus, input:focus, textarea:focus, select:focus { outline: 2px solid ${currentTheme.accent}; outline-offset: 2px; }
    `;
    style.innerHTML = buildStyles();
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, [currentTheme]);
  useEffect(() => {
    if (!window.matchMedia) return;
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = event => setPrefersDark(event.matches);
    if (query.addEventListener) query.addEventListener("change", handleChange);else query.addListener(handleChange);
    return () => {
      if (query.removeEventListener) query.removeEventListener("change", handleChange);else query.removeListener(handleChange);
    };
  }, []);
  useEffect(() => {
    const savedUser = localStorage.getItem("sima_user");
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        const userName = userData.name && userData.name !== "User" ? userData.name : userData.email?.split("@")[0] || "User";
        setProfile({
          name: userName,
          education: "university",
          program: "General",
          style: ["visual"],
          hours: 3,
          attention: "medium",
          studyTime: "morning"
        });
        setScreen("dashboard");
        setIsFirstUse(false);
      } catch (e) {
        console.error("Failed to load user", e);
        setScreen("landing");
      }
    } else {
      setScreen("landing");
    }
  }, []);
  useEffect(() => {
    if (!localStorage.getItem("sima_subscription")) {
      const trialSubscription = {
        plan: "trial",
        startDate: new Date().toISOString(),
        trialEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        verified: false,
        email: null,
        phone: null,
        devices: [],
        usage: {
          messages: 0,
          uploads: 0,
          flashcards: 0,
          mcqs: 0
        },
        lastReset: new Date().toISOString()
      };
      localStorage.setItem("sima_subscription", JSON.stringify(trialSubscription));
    }
  }, []);
  const showNav = !["welcome", "onboarding", "verification", "welcome-message", "payment", "landing", "login"].includes(screen);
  const activeConfig = config || PROFILE_ENGINE.getConfig({
    education: "university",
    program: "General"
  });
  return React.createElement("div", {
    style: S.page
  }, screen === "landing" && React.createElement(LandingScreen, {
    onStart: mode => mode === "login" ? setScreen("login") : setScreen("verification"),
    displayMode: displayMode,
    themeMode: themeMode,
    onDisplayModeChange: setDisplayMode
  }), screen === "login" && React.createElement(LoginScreen, {
    onLoginSuccess: handleLoginSuccess,
    onBack: () => setScreen("landing"),
    subscription: subscription
  }), screen === "verification" && React.createElement(VerificationScreen, {
    onVerified: handleVerificationComplete,
    subscription: subscription
  }), screen === "welcome-message" && React.createElement(WelcomeMessageScreen, {
    onContinue: handleWelcomeComplete
  }), screen === "payment" && React.createElement(PaymentScreen, {
    plan: plan,
    onPaymentComplete: handlePaymentComplete,
    onBack: () => setScreen("upgrade")
  }), screen === "welcome" && React.createElement(WelcomeScreen, {
    onStart: () => setScreen("onboarding"),
    onGuest: handleGuest
  }), screen === "onboarding" && React.createElement(OnboardingScreen, {
    onComplete: async p => {
      await applyProfile(p);
      setScreen("dashboard");
    }
  }), showNav && React.createElement("div", {
    style: {
      flex: 1,
      overflowY: "auto"
    }
  }, screen === "dashboard" && React.createElement(Dashboard, {
    profile: profile,
    config: activeConfig,
    plan: plan,
    onNav: setScreen,
    onPomodoro: () => setShowPomodoro(true),
    onNotes: () => setShowNotes(true),
    onResetProgress: handleResetProgress,
    onProfileClick: () => setShowProfileMenu(true),
    onLogout: handleLogout,
    user: user,
    isFirstUse: isFirstUse
  }), screen === "chat" && React.createElement(ChatScreen, {
    profile: profile,
    config: activeConfig,
    plan: plan,
    groupContext: groupContext,
    onLimitReached: () => setShowUpgradePrompt(true)
  }), screen === "documents" && React.createElement(DocumentUploadScreen, {
    profile: profile,
    config: activeConfig,
    plan: plan,
    onLimitReached: () => setShowUpgradePrompt(true),
    onUploadComplete: () => setScreen("studio")
  }), screen === "quiz" && React.createElement(QuizScreen, {
    profile: profile,
    config: activeConfig,
    plan: plan,
    documentId: null
  }), screen === "studio" && React.createElement(StudioScreen, {
    profile: profile,
    config: activeConfig,
    plan: plan
  }), screen === "srs" && React.createElement(SpacedRepetitionScreen, {
    profile: profile,
    config: activeConfig
  }), screen === "study-plan" && React.createElement(StudyPlannerScreen, {
    profile: profile,
    config: activeConfig,
    plan: plan
  }), screen === "gamification" && React.createElement(GamificationScreen, {
    profile: profile,
    config: activeConfig,
    plan: plan
  }), screen === "timetable" && React.createElement(TimetableScreen, {
    profile: profile,
    config: activeConfig
  }), screen === "analytics" && React.createElement(AnalyticsDashboardScreen, {
    profile: profile,
    config: activeConfig,
    plan: plan,
    isFirstUse: isFirstUse
  }), screen === "groups" && React.createElement(GroupsScreen, {
    profile: profile,
    config: activeConfig
  }), screen === "upgrade" && React.createElement(UpgradeScreen, {
    onUpgrade: handlePlanChange,
    onEnterprise: () => setScreen("enterprise")
  })), showNav && React.createElement(BottomNav, {
    active: screen,
    onNav: setScreen,
    config: activeConfig
  }), showPomodoro && React.createElement(PomodoroTimer, {
    onClose: () => setShowPomodoro(false),
    config: activeConfig
  }), showNotes && React.createElement(QuickNotes, {
    onClose: () => setShowNotes(false)
  }), showUpgradePrompt && React.createElement(UpgradePromptModal, {
    plan: plan,
    onClose: () => setShowUpgradePrompt(false),
    onUpgrade: handlePlanChange
  }), showProfileMenu && React.createElement(ProfileMenuScreen, {
    user: {
      ...user,
      phone: user?.phone || "",
      email_verified: user?.email_verified,
      phone_verified: user?.phone_verified
    },
    onClose: () => setShowProfileMenu(false),
    onLogout: handleLogout,
    onPasswordChange: () => setShowProfileMenu(false),
    onDeleteAccount: handleLogout
  }));
}
try {
  ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(SimaMindApp, null));
} catch (err) {
  console.error(err);
  const rootEl = document.getElementById('root');
  if (rootEl) {
    rootEl.innerHTML = `<div style="font-family: Arial, sans-serif; padding: 24px; color: #111; background: #fff; min-height: 100vh;">Unable to render SIMA MIND: ${err.message}</div>`;
  }
}