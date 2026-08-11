// Analytics Dashboard Service for Phase 3.5
// Tracks progress across SRS, quizzes, and study plans

class AnalyticsDashboard {
  constructor() {
    this.periods = ['today', 'week', 'month', 'all'];
  }

  /**
   * Calculate SRS retention metrics
   * @param {array} cards - All flashcards
   * @returns {object} SRS analytics
   */
  calculateSRSAnalytics(cards) {
    if (!cards || cards.length === 0) {
      return {
        totalCards: 0,
        masteredCards: 0,
        learningCards: 0,
        newCards: 0,
        retentionRate: 0,
        averageEase: 2.5,
        averageInterval: 0,
        reviewsCompleted: 0,
        estimatedNextReview: null
      };
    }

    const mastered = cards.filter(c => c.interval >= 21 && c.reviews >= 3);
    const learning = cards.filter(c => c.reviews > 0 && c.reviews < 3);
    const newCards = cards.filter(c => c.reviews === 0);
    const totalReviews = cards.reduce((sum, c) => sum + (c.reviews || 0), 0);
    const avgEase = cards.length > 0 
      ? parseFloat((cards.reduce((sum, c) => sum + (c.easeFactor || 2.5), 0) / cards.length).toFixed(2))
      : 2.5;
    const avgInterval = cards.length > 0 
      ? Math.round(cards.reduce((sum, c) => sum + (c.interval || 1), 0) / cards.length)
      : 0;

    const retentionRate = cards.length > 0 
      ? Math.round((mastered.length / cards.length) * 100)
      : 0;

    const nextReview = cards
      .filter(c => c.nextReviewDate)
      .sort((a, b) => new Date(a.nextReviewDate) - new Date(b.nextReviewDate))[0];

    return {
      totalCards: cards.length,
      masteredCards: mastered.length,
      learningCards: learning.length,
      newCards: newCards.length,
      retentionRate,
      averageEase: avgEase,
      averageInterval: avgInterval,
      reviewsCompleted: totalReviews,
      estimatedNextReview: nextReview?.nextReviewDate || null,
      masteryTimeline: this.estimateMasteryTimeline(cards)
    };
  }

  /**
   * Calculate quiz performance metrics
   * @param {array} sessions - Quiz sessions
   * @returns {object} Quiz analytics
   */
  calculateQuizAnalytics(sessions) {
    if (!sessions || sessions.length === 0) {
      return {
        totalQuizzes: 0,
        averageScore: 0,
        passRate: 0,
        highestScore: 0,
        lowestScore: 0,
        questionTypes: {},
        improvementTrend: 0,
        estimatedCompetency: 'Not Started'
      };
    }

    const scores = sessions.map(s => s.score_percentage || 0);
    const passedCount = sessions.filter(s => s.passed).length;
    const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const passRate = Math.round((passedCount / sessions.length) * 100);
    
    // Calculate trend (comparing last 3 to first 3)
    const lastThree = scores.slice(-3);
    const firstThree = scores.slice(0, 3);
    const lastAvg = lastThree.length > 0 ? Math.round(lastThree.reduce((a, b) => a + b, 0) / lastThree.length) : 0;
    const firstAvg = firstThree.length > 0 ? Math.round(firstThree.reduce((a, b) => a + b, 0) / firstThree.length) : 0;
    const trend = firstAvg > 0 ? Math.round(((lastAvg - firstAvg) / firstAvg) * 100) : 0;

    return {
      totalQuizzes: sessions.length,
      averageScore: avgScore,
      passRate,
      highestScore: Math.max(...scores),
      lowestScore: Math.min(...scores),
      recentScores: scores.slice(-5),
      improvementTrend: trend,
      estimatedCompetency: this.getCompetencyLevel(avgScore),
      recommendation: this.getQuizRecommendation(avgScore, passRate)
    };
  }

  /**
   * Calculate study plan progress
   * @param {object} plan - Study plan
   * @param {array} completedTasks - Completed tasks
   * @returns {object} Study progress
   */
  calculateStudyProgress(plan, completedTasks = []) {
    if (!plan) {
      return {
        activePlans: 0,
        goalsTotal: 0,
        goalsCompleted: 0,
        completionRate: 0,
        tasksCompleted: 0,
        tasksRemaining: 0,
        averageDailyStudyTime: 0,
        consistencyScore: 0
      };
    }

    const goals = plan.goals || [];
    const completedGoals = goals.filter(g => g.status === 'completed').length;
    const completionRate = goals.length > 0 ? Math.round((completedGoals / goals.length) * 100) : 0;

    return {
      activePlans: 1,
      goalsTotal: goals.length,
      goalsCompleted: completedGoals,
      completionRate,
      tasksCompleted: completedTasks.length,
      tasksRemaining: Math.max(0, (goals.length * 5) - completedTasks.length),
      averageDailyStudyTime: this.calculateAverageDailyTime(plan),
      consistencyScore: this.calculateConsistency(completedTasks),
      timeToCompletion: this.estimateTimeToCompletion(completionRate)
    };
  }

  /**
   * Calculate overall learning analytics
   * @param {object} allMetrics - All collected metrics
   * @returns {object} Comprehensive analytics
   */
  calculateOverallAnalytics(allMetrics) {
    const totalStudyTime = (allMetrics.quizzes?.averageScore || 0) + 
                           (allMetrics.srs?.averageInterval || 0);
    const engagementScore = Math.min(100, Math.round(
      ((allMetrics.srs?.reviewsCompleted || 0) / 10 +
       (allMetrics.quizzes?.totalQuizzes || 0) * 5 +
       (allMetrics.study?.completionRate || 0)) / 3
    ));

    return {
      overallProgress: Math.round(
        ((allMetrics.srs?.retentionRate || 0) + 
         (allMetrics.quizzes?.averageScore || 0) + 
         (allMetrics.study?.completionRate || 0)) / 3
      ),
      engagementScore,
      learningVelocity: this.calculateLearningVelocity(allMetrics),
      estimatedStudyLevel: this.getStudyLevel(allMetrics),
      recommendations: this.generateRecommendations(allMetrics),
      nextMilestone: this.getNextMilestone(allMetrics)
    };
  }

  /**
   * Estimate mastery timeline
   * @param {array} cards - Flashcards
   * @returns {object} Timeline projection
   */
  estimateMasteryTimeline(cards) {
    const newCards = cards.filter(c => c.reviews === 0).length;
    const learningCards = cards.filter(c => c.reviews > 0 && c.reviews < 3).length;
    const masteredCards = cards.filter(c => c.interval >= 21).length;

    // Estimate: 30 days for new cards, 60 for learning, already done for mastered
    const daysToCompletion = (newCards * 1) + (learningCards * 1.5);

    return {
      masteredPercentage: Math.round((masteredCards / cards.length) * 100),
      estimatedDaysToMastery: Math.ceil(daysToCompletion),
      projectedMasteryDate: new Date(Date.now() + daysToCompletion * 24 * 60 * 60 * 1000).toISOString()
    };
  }

  /**
   * Get competency level from score
   * @param {number} score - Average score
   * @returns {string} Competency level
   */
  getCompetencyLevel(score) {
    if (score >= 90) return 'Expert';
    if (score >= 80) return 'Advanced';
    if (score >= 70) return 'Proficient';
    if (score >= 60) return 'Competent';
    return 'Novice';
  }

  /**
   * Get quiz recommendation
   * @param {number} score - Average score
   * @param {number} passRate - Pass rate
   * @returns {string} Recommendation
   */
  getQuizRecommendation(score, passRate) {
    if (score >= 80 && passRate >= 80) return 'Excellent! Move to advanced topics.';
    if (score >= 60 && passRate >= 60) return 'Good progress. Review weak areas.';
    return 'Review fundamentals before moving forward.';
  }

  /**
   * Calculate average daily study time
   * @param {object} plan - Study plan
   * @returns {number} Minutes per day
   */
  calculateAverageDailyTime(plan) {
    if (!plan.dailyTasks) return 0;
    const totalTime = plan.dailyTasks.reduce((sum, t) => sum + (t.estimatedTime || 0), 0);
    return Math.round(totalTime / 7); // Average over week
  }

  /**
   * Calculate consistency score
   * @param {array} completedTasks - Completed tasks
   * @returns {number} Score 0-100
   */
  calculateConsistency(completedTasks) {
    if (completedTasks.length === 0) return 0;
    // Would normally analyze date distribution
    return Math.min(100, 50 + (completedTasks.length * 5));
  }

  /**
   * Estimate time to completion
   * @param {number} completionRate - Completion percentage
   * @returns {number} Estimated days
   */
  estimateTimeToCompletion(completionRate) {
    if (completionRate >= 100) return 0;
    const daysPerPercent = 0.5;
    return Math.ceil((100 - completionRate) * daysPerPercent);
  }

  /**
   * Calculate learning velocity
   * @param {object} metrics - All metrics
   * @returns {object} Velocity data
   */
  calculateLearningVelocity(metrics) {
    return {
      cardsPerWeek: Math.round((metrics.srs?.reviewsCompleted || 0) / 4),
      quizzesPerWeek: Math.round((metrics.quizzes?.totalQuizzes || 0) / 4),
      improvementRate: metrics.quizzes?.improvementTrend || 0,
      estimatedLearningRate: 'Moderate'
    };
  }

  /**
   * Get study level
   * @param {object} metrics - All metrics
   * @returns {string} Study level
   */
  getStudyLevel(metrics) {
    const avgScore = metrics.quizzes?.averageScore || 0;
    const retention = metrics.srs?.retentionRate || 0;
    const composite = (avgScore + retention) / 2;

    if (composite >= 80) return 'Advanced';
    if (composite >= 60) return 'Intermediate';
    return 'Beginner';
  }

  /**
   * Generate recommendations
   * @param {object} metrics - All metrics
   * @returns {array} Recommendations
   */
  generateRecommendations(metrics) {
    const recommendations = [];

    if ((metrics.srs?.reviewsCompleted || 0) < 10) {
      recommendations.push('Start daily SRS reviews for better retention');
    }
    if ((metrics.quizzes?.passRate || 0) < 70) {
      recommendations.push('Focus on weak areas identified in quizzes');
    }
    if ((metrics.study?.completionRate || 0) < 50) {
      recommendations.push('Increase daily study consistency');
    }
    if (metrics.srs?.averageEase > 3) {
      recommendations.push('Cards may be too easy - increase difficulty');
    }

    return recommendations.slice(0, 3);
  }

  /**
   * Get next milestone
   * @param {object} metrics - All metrics
   * @returns {object} Next milestone
   */
  getNextMilestone(metrics) {
    const retention = metrics.srs?.retentionRate || 0;
    const quizScore = metrics.quizzes?.averageScore || 0;

    if (retention < 50) {
      return { title: 'Reach 50% Card Mastery', progress: retention, target: 50 };
    }
    if (quizScore < 75) {
      return { title: 'Achieve 75% Quiz Average', progress: quizScore, target: 75 };
    }
    if (retention < 80) {
      return { title: 'Master 80% of Cards', progress: retention, target: 80 };
    }
    return { title: 'Reach Expert Level', progress: Math.max(retention, quizScore), target: 95 };
  }

  /**
   * Get dashboard summary
   * @param {object} srsData - SRS analytics
   * @param {object} quizData - Quiz analytics
   * @param {object} studyData - Study progress
   * @returns {object} Dashboard summary
   */
  getDashboardSummary(srsData, quizData, studyData) {
    return {
      timestamp: new Date().toISOString(),
      cards: {
        total: srsData.totalCards,
        mastered: srsData.masteredCards,
        learning: srsData.learningCards,
        retentionRate: srsData.retentionRate
      },
      quizzes: {
        total: quizData.totalQuizzes,
        averageScore: quizData.averageScore,
        passRate: quizData.passRate,
        trend: quizData.improvementTrend
      },
      study: {
        goalsCompleted: studyData.goalsCompleted,
        completionRate: studyData.completionRate,
        consistency: studyData.consistencyScore
      },
      overall: this.calculateOverallAnalytics({
        srs: srsData,
        quizzes: quizData,
        study: studyData
      })
    };
  }
}

module.exports = new AnalyticsDashboard();
