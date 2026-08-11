// Phase 4: Gamification System
// Features: Achievements, Points, Levels, Streaks, Challenges, Leaderboards

class GamificationEngine {
  constructor() {
    this.achievements = this.defineAchievements();
    this.levelThresholds = [0, 100, 250, 500, 1000, 1500, 2500, 4000, 6000, 9000];
    this.streakBonusMultiplier = 1.1; // 10% bonus per day streak
  }

  /**
   * Define available achievements/badges
   * @returns {object} Achievement definitions
   */
  defineAchievements() {
    return {
      // SRS Achievements
      first_card: {
        id: 'first_card',
        name: 'Getting Started',
        description: 'Create your first flashcard',
        points: 10,
        icon: '🎯',
        category: 'srs',
        requirement: { type: 'cards_created', value: 1 }
      },
      card_collector: {
        id: 'card_collector',
        name: 'Card Collector',
        description: 'Create 50 flashcards',
        points: 50,
        icon: '📚',
        category: 'srs',
        requirement: { type: 'cards_created', value: 50 }
      },
      card_master: {
        id: 'card_master',
        name: 'Card Master',
        description: 'Master 100 flashcards',
        points: 200,
        icon: '👑',
        category: 'srs',
        requirement: { type: 'cards_mastered', value: 100 }
      },
      retention_expert: {
        id: 'retention_expert',
        name: 'Retention Expert',
        description: 'Achieve 90% retention rate',
        points: 150,
        icon: '🎖️',
        category: 'srs',
        requirement: { type: 'retention_rate', value: 90 }
      },

      // Quiz Achievements
      quiz_starter: {
        id: 'quiz_starter',
        name: 'Quiz Starter',
        description: 'Complete your first quiz',
        points: 15,
        icon: '❓',
        category: 'quiz',
        requirement: { type: 'quizzes_completed', value: 1 }
      },
      quiz_enthusiast: {
        id: 'quiz_enthusiast',
        name: 'Quiz Enthusiast',
        description: 'Complete 20 quizzes',
        points: 75,
        icon: '📊',
        category: 'quiz',
        requirement: { type: 'quizzes_completed', value: 20 }
      },
      perfect_score: {
        id: 'perfect_score',
        name: 'Perfect Score',
        description: 'Get 100% on a quiz',
        points: 100,
        icon: '🌟',
        category: 'quiz',
        requirement: { type: 'quiz_score', value: 100 }
      },
      consistent_performer: {
        id: 'consistent_performer',
        name: 'Consistent Performer',
        description: 'Average 80%+ on quizzes',
        points: 120,
        icon: '📈',
        category: 'quiz',
        requirement: { type: 'average_quiz_score', value: 80 }
      },

      // Study Plan Achievements
      planner: {
        id: 'planner',
        name: 'Planner',
        description: 'Create your first study plan',
        points: 20,
        icon: '📅',
        category: 'plan',
        requirement: { type: 'plans_created', value: 1 }
      },
      goal_crusher: {
        id: 'goal_crusher',
        name: 'Goal Crusher',
        description: 'Complete 5 goals',
        points: 100,
        icon: '🚀',
        category: 'plan',
        requirement: { type: 'goals_completed', value: 5 }
      },
      dedicated_learner: {
        id: 'dedicated_learner',
        name: 'Dedicated Learner',
        description: 'Study for 30 consecutive days',
        points: 150,
        icon: '⭐',
        category: 'plan',
        requirement: { type: 'study_streak', value: 30 }
      },

      // Consistency Achievements
      on_fire: {
        id: 'on_fire',
        name: 'On Fire! 🔥',
        description: '7-day study streak',
        points: 70,
        icon: '🔥',
        category: 'consistency',
        requirement: { type: 'study_streak', value: 7 }
      },
      unstoppable: {
        id: 'unstoppable',
        name: 'Unstoppable',
        description: '30-day study streak',
        points: 300,
        icon: '💪',
        category: 'consistency',
        requirement: { type: 'study_streak', value: 30 }
      },
      legend: {
        id: 'legend',
        name: 'Legend',
        description: '100-day study streak',
        points: 1000,
        icon: '👑',
        category: 'consistency',
        requirement: { type: 'study_streak', value: 100 }
      },

      // Engagement Achievements
      early_bird: {
        id: 'early_bird',
        name: 'Early Bird',
        description: 'Study before 8 AM',
        points: 25,
        icon: '🌅',
        category: 'engagement',
        requirement: { type: 'time_based', value: 'early_bird' }
      },
      night_owl: {
        id: 'night_owl',
        name: 'Night Owl',
        description: 'Study after 10 PM',
        points: 25,
        icon: '🦉',
        category: 'engagement',
        requirement: { type: 'time_based', value: 'night_owl' }
      }
    };
  }

  /**
   * Calculate user level from points
   * @param {number} points - User's total points
   * @returns {object} Level information
   */
  calculateLevel(points) {
    let level = 1;
    let nextThreshold = this.levelThresholds[1];

    for (let i = 0; i < this.levelThresholds.length; i++) {
      if (points >= this.levelThresholds[i]) {
        level = i + 1;
        nextThreshold = this.levelThresholds[i + 1] || this.levelThresholds[this.levelThresholds.length - 1];
      }
    }
    
    level = Math.min(level, 10); // Cap at level 10

    const progressToNextLevel = points - (this.levelThresholds[level - 1] || 0);
    const pointsForNextLevel = nextThreshold - (this.levelThresholds[level - 1] || 0);
    const percentToNextLevel = Math.round((progressToNextLevel / pointsForNextLevel) * 100);

    return {
      currentLevel: level,
      totalPoints: points,
      pointsToNextLevel: Math.max(0, nextThreshold - points),
      progressToNextLevel,
      percentToNextLevel,
      levelName: this.getLevelName(level)
    };
  }

  /**
   * Get level name by level number
   * @param {number} level - Level number
   * @returns {string} Level name
   */
  getLevelName(level) {
    const names = [
      'Novice', 'Apprentice', 'Learner', 'Scholar', 'Expert', 
      'Master', 'Grandmaster', 'Sage', 'Genius', 'Legend'
    ];
    return names[Math.min(level - 1, names.length - 1)];
  }

  /**
   * Check and unlock achievements
   * @param {object} userStats - User statistics
   * @returns {array} Newly unlocked achievements
   */
  checkAchievements(userStats) {
    const unlocked = [];

    Object.values(this.achievements).forEach(achievement => {
      const req = achievement.requirement;

      let shouldUnlock = false;

      if (req.type === 'cards_created' && (userStats.cardsCreated || 0) >= req.value) {
        shouldUnlock = true;
      } else if (req.type === 'cards_mastered' && (userStats.cardsMastered || 0) >= req.value) {
        shouldUnlock = true;
      } else if (req.type === 'retention_rate' && (userStats.retentionRate || 0) >= req.value) {
        shouldUnlock = true;
      } else if (req.type === 'quizzes_completed' && (userStats.quizzesCompleted || 0) >= req.value) {
        shouldUnlock = true;
      } else if (req.type === 'quiz_score' && (userStats.bestQuizScore || 0) === req.value) {
        shouldUnlock = true;
      } else if (req.type === 'average_quiz_score' && (userStats.averageQuizScore || 0) >= req.value) {
        shouldUnlock = true;
      } else if (req.type === 'plans_created' && (userStats.plansCreated || 0) >= req.value) {
        shouldUnlock = true;
      } else if (req.type === 'goals_completed' && (userStats.goalsCompleted || 0) >= req.value) {
        shouldUnlock = true;
      } else if (req.type === 'study_streak' && (userStats.longestStreak || 0) >= req.value) {
        shouldUnlock = true;
      }

      if (shouldUnlock && !userStats.unlockedAchievements?.includes(achievement.id)) {
        unlocked.push(achievement);
      }
    });

    return unlocked;
  }

  /**
   * Calculate points with streak bonus
   * @param {number} basePoints - Base points earned
   * @param {number} streakDays - Current streak
   * @returns {object} Points calculation
   */
  calculatePointsWithBonus(basePoints, streakDays = 1) {
    const streakMultiplier = streakDays > 0 ? Math.pow(1.1, Math.min(streakDays, 30)) : 1;
    const bonusPoints = Math.round(basePoints * (streakMultiplier - 1));
    const totalPoints = basePoints + bonusPoints;

    return {
      basePoints,
      bonusMultiplier: parseFloat(streakMultiplier.toFixed(2)),
      streakMultiplier: streakMultiplier.toFixed(2),
      bonusPoints,
      totalPoints,
      message: streakDays > 1 ? `+${totalPoints} points (${streakDays}-day streak bonus!)` : `+${totalPoints} points`
    };
  }

  /**
   * Calculate study streak
   * @param {array} lastStudyDates - Array of study dates
   * @returns {object} Streak information
   */
  calculateStreak(lastStudyDates) {
    if (!lastStudyDates || lastStudyDates.length === 0) {
      return { currentStreak: 0, longestStreak: 0, lastStudyDate: null };
    }

    const sortedDates = lastStudyDates.map(d => new Date(d).getTime()).sort((a, b) => b - a);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    for (let i = 0; i < sortedDates.length; i++) {
      const date = new Date(sortedDates[i]);
      date.setHours(0, 0, 0, 0);

      if (i === 0) {
        // Check if today or yesterday
        const daysDiff = Math.floor((today - date) / (1000 * 60 * 60 * 24));
        if (daysDiff <= 1) currentStreak = 1;
        tempStreak = 1;
      } else {
        const prevDate = new Date(sortedDates[i - 1]);
        prevDate.setHours(0, 0, 0, 0);
        const daysDiff = Math.floor((prevDate - date) / (1000 * 60 * 60 * 24));

        if (daysDiff === 1) {
          tempStreak++;
          if (currentStreak > 0 || i === 1) currentStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }
    }

    longestStreak = Math.max(longestStreak, tempStreak, currentStreak);

    return {
      currentStreak,
      longestStreak,
      lastStudyDate: new Date(sortedDates[0]).toISOString()
    };
  }

  /**
   * Generate leaderboard
   * @param {array} users - Array of user stats
   * @param {string} period - Period for leaderboard ('week', 'month', 'all')
   * @returns {array} Sorted leaderboard
   */
  generateLeaderboard(users, period = 'week') {
    const sorted = users
      .map(user => ({
        ...user,
        badges: (user.achievements || []).length
      }))
      .sort((a, b) => {
        if (period === 'week') {
          return (b.weeklyPoints || 0) - (a.weeklyPoints || 0);
        } else if (period === 'month') {
          return (b.monthlyPoints || 0) - (a.monthlyPoints || 0);
        } else {
          return (b.totalPoints || 0) - (a.totalPoints || 0);
        }
      })
      .map((user, index) => ({
        ...user,
        rank: index + 1
      }));
    
    return sorted;
  }

  /**
   * Get user profile badge
   * @param {object} userStats - User statistics
   * @returns {object} User badge
   */
  getUserBadge(userStats) {
    const level = this.calculateLevel(userStats.totalPoints || 0);
    const badges = [
      userStats.longestStreak >= 100 ? '👑' : '',
      userStats.longestStreak >= 30 ? '💪' : '',
      userStats.longestStreak >= 7 ? '🔥' : '',
      userStats.averageQuizScore >= 90 ? '⭐' : '',
      userStats.cardsMastered >= 100 ? '🎖️' : ''
    ].filter(Boolean);

    return {
      level: level.currentLevel,
      levelName: level.levelName,
      achievements: badges.length,
      topBadges: badges
    };
  }

  /**
   * Create daily challenge
   * @param {date} date - Challenge date
   * @returns {object} Daily challenge
   */
  createDailyChallenge(date = new Date()) {
    const challenges = [
      {
        title: 'Review Master',
        description: 'Review 20 flashcards',
        target: 20,
        category: 'srs',
        reward: 50,
        icon: '📚'
      },
      {
        title: 'Quiz Champion',
        description: 'Score 80%+ on a quiz',
        target: 80,
        category: 'quiz',
        reward: 75,
        icon: '❓'
      },
      {
        title: 'Study Dedication',
        description: 'Study for 2 hours',
        target: 120,
        category: 'time',
        reward: 100,
        icon: '⏱️'
      },
      {
        title: 'Goal Achiever',
        description: 'Complete 3 study goals',
        target: 3,
        category: 'goals',
        reward: 60,
        icon: '🎯'
      }
    ];

    const dayIndex = date.getDay();
    return {
      ...challenges[dayIndex % challenges.length],
      challengeId: `challenge_${date.toISOString().split('T')[0]}`,
      date: date.toISOString(),
      progress: 0
    };
  }

  /**
   * Generate weekly challenges
   * @returns {array} 7 daily challenges
   */
  generateWeeklyChallenges() {
    const challenges = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      challenges.push(this.createDailyChallenge(date));
    }
    return challenges;
  }

  /**
   * Calculate challenge progress
   * @param {object} challenge - Challenge object
   * @param {number} current - Current progress value
   * @returns {object} Progress calculation
   */
  calculateChallengeProgress(challenge, current) {
    const progress = Math.min(100, Math.round((current / challenge.target) * 100));
    const completed = progress >= 100;
    const remaining = Math.max(0, challenge.target - current);

    return {
      progress,
      completed,
      remaining,
      reward: completed ? challenge.reward : 0,
      message: completed ? `Challenge Complete! +${challenge.reward} points` : `${remaining} to go`
    };
  }
}

module.exports = new GamificationEngine();
