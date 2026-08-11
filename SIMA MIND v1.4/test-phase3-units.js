// Unit Tests for Phase 3 Systems
// Tests: SRS Manager, Quiz Engine, Study Planner, Analytics Dashboard

const SRSManager = require('./srs-manager');
const QuizEngine = require('./quiz-engine');
const StudyPlanner = require('./study-planner');
const AnalyticsDashboard = require('./analytics-dashboard');

let testsPassed = 0;
let testsFailed = 0;

// Test utility
function assert(condition, message) {
  if (condition) {
    testsPassed++;
    console.log(`  ✓ ${message}`);
  } else {
    testsFailed++;
    console.log(`  ✗ ${message}`);
  }
}

console.log('═══════════════════════════════════════════════════════════');
console.log('PHASE 3 UNIT TESTS');
console.log('═══════════════════════════════════════════════════════════\n');

// ─── SRS MANAGER TESTS ──────────────────────────────────────────────────

console.log('🧠 SRS Manager Tests');

// Test 1: Card review calculation
const testCard = {
  id: 'card_1',
  interval: 1,
  easeFactor: 2.5,
  reviews: 0,
  lastReviewDate: new Date().toISOString(),
  nextReviewDate: new Date().toISOString(),
  suspended: false
};

const result1 = SRSManager.recordReview(testCard, 5); // Perfect response
assert(result1.interval > testCard.interval, 'Interval increases on perfect response');
assert(result1.easeFactor >= testCard.easeFactor, 'Ease factor maintains or increases');
assert(result1.reviews === 1, 'Reviews counter increments');

// Test 2: Difficult response handling
const result2 = SRSManager.recordReview(testCard, 2); // Difficult response
assert(result2.interval === 1, 'Interval resets to 1 on difficult response');
assert(result2.easeFactor < testCard.easeFactor, 'Ease factor decreases on difficulty');

// Test 3: Get cards due for review
const mockCards = [
  { id: '1', interval: 1, nextReviewDate: new Date(Date.now() - 1000).toISOString() },
  { id: '2', interval: 3, nextReviewDate: new Date(Date.now() + 100000).toISOString() }
];
const dueCads = SRSManager.getCardsDue(mockCards);
assert(dueCads.length === 1, 'Correctly identifies cards due for review');

// Test 4: Statistics calculation
const stats = SRSManager.calculateStats(mockCards);
assert(stats.total === 2, 'Card count is correct');
assert(stats.due === 1, 'Due card count is correct');
assert(typeof stats.averageInterval === 'number', 'Average interval calculated');

console.log('');

// ─── QUIZ ENGINE TESTS ──────────────────────────────────────────────────

console.log('❓ Quiz Engine Tests');

// Test 1: Quiz session creation
const testQuestions = [
  { id: 'q1', type: 'multiple_choice', question: 'What is 2+2?', options: ['3', '4', '5'], correctAnswer: 1, points: 1 },
  { id: 'q2', type: 'true_false', question: 'Is JS a language?', options: ['True', 'False'], correctAnswer: 0, points: 1 }
];

const session = QuizEngine.createQuizSession(testQuestions, { timeLimit: 30, passingScore: 70 });
assert(session.totalQuestions === 2, 'Quiz session created with correct question count');
assert(session.timeLimit === 30 * 60, 'Time limit converted to seconds');
assert(session.passingScore === 70, 'Passing score set correctly');

// Test 2: Response scoring
const score1 = QuizEngine.scoreResponse(testQuestions[0], 1);
assert(score1.correct === true, 'Correct multiple choice response scored');
assert(score1.pointsEarned === 1, 'Points awarded for correct answer');

const score2 = QuizEngine.scoreResponse(testQuestions[0], 2);
assert(score2.correct === false, 'Incorrect response detected');
assert(score2.pointsEarned === 0, 'No points for incorrect answer');

// Test 3: Results calculation
const mockResponses = [
  { correct: true, pointsEarned: 1, maxPoints: 1 },
  { correct: false, pointsEarned: 0, maxPoints: 1 }
];
const mockSession = { 
  totalQuestions: 2, 
  responses: mockResponses,
  passingScore: 60,
  quizId: 'quiz_1'
};
const results = QuizEngine.calculateResults(mockSession);
assert(results.correctAnswers === 1, 'Correct answer count is accurate');
assert(results.scorePercentage === 50, 'Score percentage calculated correctly');
assert(results.passed === false, 'Pass/fail determined correctly');

// Test 4: Strengths and weaknesses
const strengthsList = QuizEngine.identifyStrengths(mockResponses);
const weaknessesList = QuizEngine.identifyWeaknesses(mockResponses);
assert(Array.isArray(strengthsList), 'Strengths identified');
assert(Array.isArray(weaknessesList), 'Weaknesses identified');

console.log('');

// ─── STUDY PLANNER TESTS ────────────────────────────────────────────────

console.log('📅 Study Planner Tests');

// Test 1: Study plan creation
const userProfile = { id: 'user_1', learningStyle: 'visual', studyPace: 'moderate' };
const goals = [
  { id: 'g1', title: 'Learn React', priority: 'high', deadline: new Date(Date.now() + 30*24*60*60*1000).toISOString() }
];
const plan = StudyPlanner.createStudyPlan(userProfile, goals);

assert(plan.planId, 'Plan ID generated');
assert(plan.goals.length === 1, 'Goals included in plan');
assert(Object.keys(plan.weeklyPlan).length === 7, 'Weekly plan has 7 days');

// Test 2: Daily tasks generation
assert(plan.dailyTasks.length > 0, 'Daily tasks generated');
const taskWithSubtasks = plan.dailyTasks[0];
assert(Array.isArray(taskWithSubtasks.subtasks), 'Subtasks created for tasks');

// Test 3: Study method recommendations
assert(plan.studyMethods.length > 0, 'Study methods recommended');
assert(plan.studyMethods[0].priority, 'Methods have priority levels');

// Test 4: Resource recommendations
assert(plan.resources.length > 0, 'Resources recommended');

console.log('');

// ─── ANALYTICS DASHBOARD TESTS ──────────────────────────────────────────

console.log('📊 Analytics Dashboard Tests');

// Test 1: SRS analytics calculation
const mockCardData = [
  { id: '1', interval: 30, easeFactor: 2.8, reviews: 5, nextReviewDate: new Date(Date.now() + 10000).toISOString() },
  { id: '2', interval: 7, easeFactor: 2.4, reviews: 2, nextReviewDate: new Date(Date.now() - 1000).toISOString() },
  { id: '3', interval: 1, easeFactor: 2.5, reviews: 0, nextReviewDate: new Date().toISOString() }
];

const srsAnalytics = AnalyticsDashboard.calculateSRSAnalytics(mockCardData);
assert(srsAnalytics.totalCards === 3, 'Total cards counted');
assert(srsAnalytics.masteredCards === 1, 'Mastered cards identified');
assert(srsAnalytics.newCards === 1, 'New cards identified');
assert(typeof srsAnalytics.retentionRate === 'number', 'Retention rate calculated');
assert(srsAnalytics.averageEase > 0, 'Average ease factor calculated');

// Test 2: Quiz analytics calculation
const mockQuizSessions = [
  { id: 's1', score_percentage: 85, passed: 1, created_at: new Date().toISOString() },
  { id: 's2', score_percentage: 70, passed: 1, created_at: new Date().toISOString() },
  { id: 's3', score_percentage: 60, passed: 0, created_at: new Date().toISOString() }
];

const quizAnalytics = AnalyticsDashboard.calculateQuizAnalytics(mockQuizSessions);
assert(quizAnalytics.totalQuizzes === 3, 'Quiz count correct');
assert(quizAnalytics.averageScore === 72, 'Average score calculated');
assert(quizAnalytics.passRate === 67, 'Pass rate calculated');
assert(quizAnalytics.estimatedCompetency, 'Competency level determined');

// Test 3: Study progress calculation
const mockPlan = {
  goals: [
    { title: 'Goal 1', status: 'completed' },
    { title: 'Goal 2', status: 'in_progress' },
    { title: 'Goal 3', status: 'in_progress' }
  ],
  dailyTasks: []
};

const studyProgress = AnalyticsDashboard.calculateStudyProgress(mockPlan, []);
assert(studyProgress.goalsTotal === 3, 'Goal count accurate');
assert(studyProgress.goalsCompleted === 1, 'Completed goals counted');
assert(studyProgress.completionRate === 33, 'Completion rate calculated');

// Test 4: Competency level determination
const beginner = AnalyticsDashboard.getCompetencyLevel(45);
const expert = AnalyticsDashboard.getCompetencyLevel(95);
assert(beginner === 'Novice', 'Low score maps to Novice');
assert(expert === 'Expert', 'High score maps to Expert');

// Test 5: Recommendations generation
const testMetrics = {
  srs: { reviewsCompleted: 2, averageEase: 3.5 },
  quizzes: { passRate: 55 }
};
const recs = AnalyticsDashboard.generateRecommendations(testMetrics);
assert(Array.isArray(recs), 'Recommendations generated');
assert(recs.length > 0, 'Recommendations not empty');

console.log('');

// ─── INTEGRATION TESTS ──────────────────────────────────────────────────

console.log('🔗 Integration Tests');

// Test workflow: Cards → SRS → Quiz → Analytics
const card = SRSManager.recordReview(testCard, 4);
assert(card.reviews > 0, 'SRS updates card state');

const quizWithoutAnswers = QuizEngine.createQuizSession(testQuestions);
assert(quizWithoutAnswers.responses.length === 0, 'Quiz starts with empty responses');

const planWithGoals = StudyPlanner.createStudyPlan(userProfile, goals);
const dashboard = AnalyticsDashboard.getDashboardSummary(srsAnalytics, quizAnalytics, studyProgress);
assert(dashboard.timestamp, 'Dashboard summary includes timestamp');
assert(dashboard.overall, 'Dashboard includes overall metrics');

console.log('');

// ─── SUMMARY ────────────────────────────────────────────────────────────

console.log('═══════════════════════════════════════════════════════════');
console.log('TEST RESULTS');
console.log('═══════════════════════════════════════════════════════════');
console.log(`✅ Passed: ${testsPassed}`);
console.log(`❌ Failed: ${testsFailed}`);
console.log(`📊 Total: ${testsPassed + testsFailed}`);
console.log(`📈 Success Rate: ${Math.round((testsPassed / (testsPassed + testsFailed)) * 100)}%`);
console.log('');

if (testsFailed === 0) {
  console.log('🎉 ALL TESTS PASSED!');
} else {
  console.log(`⚠️  ${testsFailed} test(s) failed`);
}

console.log('');
console.log('═══════════════════════════════════════════════════════════');
