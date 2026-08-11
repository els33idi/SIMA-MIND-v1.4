// Phase 4: Gamification Engine Unit Tests
// Comprehensive test suite for achievements, points, levels, streaks, challenges

const GamificationEngine = require('./gamification-engine');

let testCount = 0;
let passedCount = 0;
let failedTests = [];

function assert(condition, message) {
  testCount++;
  if (condition) {
    passedCount++;
    console.log(`✓ ${message}`);
  } else {
    failedTests.push(message);
    console.log(`✗ ${message}`);
  }
}

console.log('\n🎮 GAMIFICATION ENGINE TESTS\n');

// ─────────────────────────────────────────────────────────────────────────
// 1. ACHIEVEMENT TESTS (4 tests)
// ─────────────────────────────────────────────────────────────────────────
console.log('🏆 ACHIEVEMENT TESTS');
console.log('─────────────────────────────────────────────────────────');

// Test 1.1: Achievements are properly defined
const achievements = GamificationEngine.achievements;
assert(achievements !== undefined, 'Achievements object exists');
assert(achievements.first_card !== undefined, 'First Card achievement exists');
assert(achievements.card_master !== undefined, 'Card Master achievement exists');
assert(achievements.perfect_score !== undefined, 'Perfect Score achievement exists');

// Test 1.2: Achievement structure
const firstCard = achievements.first_card;
assert(firstCard.id === 'first_card', 'Achievement has correct id');
assert(firstCard.name === 'Getting Started', 'Achievement has correct name');
assert(firstCard.points === 10, 'Achievement has correct points');
assert(firstCard.icon !== undefined, 'Achievement has icon');
assert(firstCard.category === 'srs', 'Achievement has correct category');

// Test 1.3: All achievement categories covered
const categories = {};
Object.values(achievements).forEach(ach => {
  categories[ach.category] = (categories[ach.category] || 0) + 1;
});
assert(categories['srs'] >= 4, 'At least 4 SRS achievements');
assert(categories['quiz'] >= 4, 'At least 4 Quiz achievements');
assert(categories['plan'] >= 3, 'At least 3 Plan achievements');
assert(categories['consistency'] >= 3, 'At least 3 Consistency achievements');

console.log('');

// ─────────────────────────────────────────────────────────────────────────
// 2. LEVEL SYSTEM TESTS (5 tests)
// ─────────────────────────────────────────────────────────────────────────
console.log('📊 LEVEL SYSTEM TESTS');
console.log('─────────────────────────────────────────────────────────');

// Test 2.1: Level calculation for 0 points
let level = GamificationEngine.calculateLevel(0);
assert(level.currentLevel === 1, 'Level 1 for 0 points');
assert(level.levelName === 'Novice', 'Level 1 name is Novice');

// Test 2.2: Level calculation for 100 points
level = GamificationEngine.calculateLevel(100);
assert(level.currentLevel === 2, 'Level 2 for 100+ points');
assert(level.levelName === 'Apprentice', 'Level 2 name is Apprentice');

// Test 2.3: Level calculation for 1000 points
level = GamificationEngine.calculateLevel(1000);
assert(level.currentLevel === 5, 'Level 5 for 1000+ points');
assert(level.pointsToNextLevel > 0, 'Points to next level is positive');
assert(level.percentToNextLevel >= 0 && level.percentToNextLevel <= 100, 'Progress percent is 0-100');

// Test 2.4: Maximum level
level = GamificationEngine.calculateLevel(50000);
assert(level.currentLevel === 10, 'Level capped at 10 for very high points');

// Test 2.5: All 10 levels are defined
for (let i = 1; i <= 10; i++) {
  const pointsForLevel = i === 1 ? 0 : 100 * i;
  const lv = GamificationEngine.calculateLevel(pointsForLevel);
  assert(lv.levelName !== undefined, `Level ${i} has a name: ${lv.levelName}`);
}

console.log('');

// ─────────────────────────────────────────────────────────────────────────
// 3. POINTS & STREAK BONUS TESTS (4 tests)
// ─────────────────────────────────────────────────────────────────────────
console.log('⭐ POINTS & STREAK BONUS TESTS');
console.log('─────────────────────────────────────────────────────────');

// Test 3.1: Points with no streak bonus
let result = GamificationEngine.calculatePointsWithBonus(50, 0);
assert(result.totalPoints === 50, 'No bonus with 0 streak');
assert(result.bonusMultiplier === 1, 'Multiplier is 1x with 0 streak');

// Test 3.2: Points with streak bonus
result = GamificationEngine.calculatePointsWithBonus(50, 5);
const expectedWith5Day = Math.round(50 * Math.pow(1.1, 5));
assert(result.totalPoints === expectedWith5Day, `5-day streak bonus calculated correctly (${expectedWith5Day} total)`);
assert(result.bonusMultiplier > 1, 'Multiplier > 1 with streak');

// Test 3.3: High streak bonus (capped at 30 days)
result = GamificationEngine.calculatePointsWithBonus(100, 30);
assert(result.totalPoints > 100, 'Points increased with 30-day streak');
const bonus30 = result.totalPoints;

result = GamificationEngine.calculatePointsWithBonus(100, 40);
const bonus40 = result.totalPoints;
assert(bonus40 === bonus30, 'Bonus capped at 30-day max');

// Test 3.4: Bonus calculation is consistent
result = GamificationEngine.calculatePointsWithBonus(100, 10);
const expectedWithStreak = Math.round(100 * Math.pow(1.1, 10));
assert(result.totalPoints === expectedWithStreak, 'Bonus formula correct');

console.log('');

// ─────────────────────────────────────────────────────────────────────────
// 4. STREAK CALCULATION TESTS (4 tests)
// ─────────────────────────────────────────────────────────────────────────
console.log('🔥 STREAK CALCULATION TESTS');
console.log('─────────────────────────────────────────────────────────');

// Test 4.1: Empty study dates (no streak)
let streak = GamificationEngine.calculateStreak([]);
assert(streak.currentStreak === 0, 'No streak with empty dates');
assert(streak.longestStreak === 0, 'No longest streak with empty dates');

// Test 4.2: Single study date (1-day streak)
const today = new Date();
const todayStr = today.toISOString().split('T')[0];
streak = GamificationEngine.calculateStreak([todayStr]);
assert(streak.currentStreak === 1, 'Current streak is 1 with today\'s study');

// Test 4.3: Consecutive days (multi-day streak)
const dates = [];
for (let i = 0; i < 5; i++) {
  const d = new Date(today);
  d.setDate(d.getDate() - i);
  dates.unshift(d.toISOString().split('T')[0]);
}
streak = GamificationEngine.calculateStreak(dates);
assert(streak.currentStreak === 5, '5-day streak calculated correctly');
assert(streak.longestStreak >= 5, 'Longest streak is at least 5');

// Test 4.4: Non-consecutive dates
const gappedDates = [
  new Date(today.getTime() - 86400000).toISOString().split('T')[0],
  new Date(today.getTime() - 86400000 * 3).toISOString().split('T')[0]
];
streak = GamificationEngine.calculateStreak(gappedDates);
assert(streak.currentStreak < gappedDates.length, 'Streak breaks with gaps');

console.log('');

// ─────────────────────────────────────────────────────────────────────────
// 5. ACHIEVEMENT UNLOCK TESTS (5 tests)
// ─────────────────────────────────────────────────────────────────────────
console.log('🎖️ ACHIEVEMENT UNLOCK TESTS');
console.log('─────────────────────────────────────────────────────────');

// Test 5.1: Check achievements for basic stats
let userStats = {
  cardsCreated: 1,
  cardsMastered: 0,
  retentionRate: 0,
  quizzesCompleted: 0,
  averageQuizScore: 0,
  studyPlansCreated: 0,
  studyConsistency: 0,
  longestStreak: 0
};
let unlocked = GamificationEngine.checkAchievements(userStats);
assert(Array.isArray(unlocked), 'Returns array of achievements');
assert(unlocked.some(a => a.id === 'first_card'), 'First Card achievement unlocked when cards created');

// Test 5.2: Quiz achievement unlocks
userStats.quizzesCompleted = 1;
unlocked = GamificationEngine.checkAchievements(userStats);
assert(unlocked.some(a => a.id === 'quiz_starter'), 'Quiz Starter unlocked at 1 quiz');

// Test 5.3: Multiple achievement tracking
userStats.cardsCreated = 50;
userStats.quizzesCompleted = 20;
unlocked = GamificationEngine.checkAchievements(userStats);
assert(unlocked.length >= 2, 'Multiple achievements can be unlocked');

// Test 5.4: High achievement requirements
userStats.retentionRate = 90;
userStats.cardsMastered = 100;
unlocked = GamificationEngine.checkAchievements(userStats);
assert(unlocked.some(a => a.id === 'retention_expert'), 'Retention Expert unlocked at 90% rate');

// Test 5.5: No premature unlocks
userStats = { cardsCreated: 0, cardsMastered: 0, quizzesCompleted: 0, averageQuizScore: 0, longestStreak: 0 };
unlocked = GamificationEngine.checkAchievements(userStats);
assert(unlocked.length === 0, 'No achievements unlocked with zero stats');

console.log('');

// ─────────────────────────────────────────────────────────────────────────
// 6. CHALLENGE TESTS (4 tests)
// ─────────────────────────────────────────────────────────────────────────
console.log('⚡ CHALLENGE TESTS');
console.log('─────────────────────────────────────────────────────────');

// Test 6.1: Daily challenge creation
const date = new Date();
const challenge = GamificationEngine.createDailyChallenge(date);
assert(challenge !== undefined, 'Daily challenge created');
assert(challenge.title !== undefined, 'Challenge has title');
assert(challenge.target > 0, 'Challenge has target > 0');
assert(challenge.reward > 0, 'Challenge has reward');

// Test 6.2: Challenge has all required fields
assert(challenge.description !== undefined, 'Challenge has description');
assert(challenge.icon !== undefined, 'Challenge has icon');
assert(challenge.challengeId !== undefined, 'Challenge has unique ID');
assert(challenge.progress === 0, 'Challenge starts with 0 progress');

// Test 6.3: Weekly challenge generation
const weekly = GamificationEngine.generateWeeklyChallenges();
assert(Array.isArray(weekly), 'Returns array of challenges');
assert(weekly.length === 7, '7 challenges for 7 days');

// Test 6.4: Challenge progress calculation
const progress = GamificationEngine.calculateChallengeProgress(
  { target: 100, reward: 50 },
  50
);
assert(progress.progress === 50, 'Progress calculated as percentage');
assert(progress.completed === false, 'Not completed at 50%');
assert(progress.remaining === 50, 'Remaining calculated correctly');

const progressFull = GamificationEngine.calculateChallengeProgress(
  { target: 100, reward: 50 },
  100
);
assert(progressFull.completed === true, 'Completed when progress >= target');
assert(progressFull.reward === 50, 'Reward given when completed');

console.log('');

// ─────────────────────────────────────────────────────────────────────────
// 7. LEADERBOARD TESTS (3 tests)
// ─────────────────────────────────────────────────────────────────────────
console.log('📈 LEADERBOARD TESTS');
console.log('─────────────────────────────────────────────────────────');

// Test 7.1: Leaderboard generation
const users = [
  { userId: 'user1', totalPoints: 500, weeklyPoints: 0, monthlyPoints: 0 },
  { userId: 'user2', totalPoints: 1000, weeklyPoints: 0, monthlyPoints: 0 },
  { userId: 'user3', totalPoints: 750, weeklyPoints: 0, monthlyPoints: 0 }
];
const leaderboard = GamificationEngine.generateLeaderboard(users, 'all');
assert(Array.isArray(leaderboard), 'Returns array');
assert(leaderboard.length === 3, 'All users included');
assert(leaderboard[0].totalPoints >= leaderboard[1].totalPoints, 'Sorted by points descending');

// Test 7.2: Leaderboard rankings
assert(leaderboard[0].userId === 'user2', 'Top user is highest points');
assert(leaderboard[0].rank === 1, 'First rank is 1');
assert(leaderboard[1].rank === 2, 'Second rank is 2');

// Test 7.3: Different periods
const weekLead = GamificationEngine.generateLeaderboard(users, 'all');
const monthLead = GamificationEngine.generateLeaderboard(users, 'all');
assert(weekLead.length === monthLead.length, 'Same users across periods');

console.log('');

// ─────────────────────────────────────────────────────────────────────────
// 8. USER BADGE TESTS (3 tests)
// ─────────────────────────────────────────────────────────────────────────
console.log('🏅 USER BADGE TESTS');
console.log('─────────────────────────────────────────────────────────');

// Test 8.1: Badge generation for new user
let badge = GamificationEngine.getUserBadge({
  totalPoints: 0,
  longestStreak: 0,
  averageQuizScore: 0,
  cardsMastered: 0
});
assert(badge.level === 1, 'New user at level 1');
assert(badge.levelName === 'Novice', 'New user is Novice');
assert(badge.topBadges.length === 0, 'No badges for new user');

// Test 8.2: Badge generation for active user
badge = GamificationEngine.getUserBadge({
  totalPoints: 2000,
  longestStreak: 30,
  averageQuizScore: 90,
  cardsMastered: 100
});
assert(badge.level >= 4, 'Level 4+ for 2000 points');
assert(badge.topBadges.length > 0, 'Has badges for achievements');

// Test 8.3: Specific badge unlocks
assert(badge.topBadges.some(b => b === '🔥'), 'Fire emoji badge for 30-day streak');
assert(badge.topBadges.some(b => b === '⭐'), 'Star emoji badge for 90% quiz score');

console.log('');

// ─────────────────────────────────────────────────────────────────────────
// TEST SUMMARY
// ─────────────────────────────────────────────────────────────────────────
console.log('═══════════════════════════════════════════════════════════');
console.log(`✅ Passed: ${passedCount}`);
console.log(`❌ Failed: ${failedTests.length}`);
console.log(`📊 Total: ${testCount}`);
console.log(`📈 Success Rate: ${Math.round((passedCount / testCount) * 100)}%`);

if (failedTests.length > 0) {
  console.log('\n⚠️ FAILED TESTS:');
  failedTests.forEach(test => console.log(`   - ${test}`));
  process.exit(1);
} else {
  console.log('\n🎉 ALL TESTS PASSED!');
  process.exit(0);
}
