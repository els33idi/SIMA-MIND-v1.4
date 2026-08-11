// Spaced Repetition System (SRS) for Flashcards
// Implements SM-2 algorithm for optimal learning intervals

const INTERVALS = [1, 3, 7, 14, 30]; // Days between reviews
const BASE_EASE = 2.5; // Default ease factor

class SRSManager {
  constructor() {
    this.qualities = {
      0: 'Complete blackout',
      1: 'Incorrect but close',
      2: 'Incorrect but recognized',
      3: 'Correct but with difficulty',
      4: 'Correct with some hesitation',
      5: 'Perfect response'
    };
  }

  /**
   * Calculate next review date using SM-2 algorithm
   * @param {number} interval - Current interval in days
   * @param {number} easeFactor - Current ease factor
   * @param {number} quality - User's quality response (0-5)
   * @returns {object} Next interval and ease factor
   */
  calculateNextReview(interval, easeFactor, quality) {
    if (quality < 3) {
      // Incorrect or difficult - reset interval
      return {
        nextInterval: 1,
        nextEaseFactor: Math.max(1.3, easeFactor - 0.2),
        difficulty: 'hard'
      };
    }

    // Correct answer - increase interval
    let nextInterval = interval === 0 ? 1 : Math.round(interval * easeFactor);
    let nextEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    nextEaseFactor = Math.max(1.3, nextEaseFactor); // Minimum ease factor

    return {
      nextInterval: Math.max(1, nextInterval),
      nextEaseFactor: parseFloat(nextEaseFactor.toFixed(2)),
      difficulty: quality >= 4 ? 'easy' : 'medium'
    };
  }

  /**
   * Get cards due for review today
   * @param {array} cards - All user's flashcards
   * @returns {array} Cards due for review
   */
  getCardsDue(cards) {
    const now = new Date();
    return cards.filter(card => {
      const nextReview = new Date(card.nextReviewDate);
      return nextReview <= now;
    }).sort((a, b) => new Date(a.lastReviewDate) - new Date(b.lastReviewDate));
  }

  /**
   * Calculate study statistics
   * @param {array} cards - All user's flashcards
   * @returns {object} Study stats
   */
  calculateStats(cards) {
    const due = this.getCardsDue(cards);
    const learning = cards.filter(c => c.reviews < 3);
    const mature = cards.filter(c => c.reviews >= 3 && c.interval >= 21);
    const suspended = cards.filter(c => c.suspended);

    const avgInterval = cards.length > 0 
      ? Math.round(cards.reduce((sum, c) => sum + c.interval, 0) / cards.length)
      : 0;

    const avgEase = cards.length > 0
      ? parseFloat((cards.reduce((sum, c) => sum + c.easeFactor, 0) / cards.length).toFixed(2))
      : BASE_EASE;

    return {
      total: cards.length,
      due: due.length,
      learning: learning.length,
      mature: mature.length,
      suspended: suspended.length,
      averageInterval: avgInterval,
      averageEase: avgEase,
      reviewsToday: cards.filter(c => {
        const lastReview = new Date(c.lastReviewDate);
        const today = new Date();
        return lastReview.toDateString() === today.toDateString();
      }).length
    };
  }

  /**
   * Generate review session
   * @param {array} cards - Due cards to review
   * @param {number} limit - Max cards per session
   * @returns {object} Review session data
   */
  createReviewSession(cards, limit = 20) {
    const due = this.getCardsDue(cards).slice(0, limit);
    
    return {
      sessionId: `session_${Date.now()}`,
      cards: due.map(card => ({
        id: card.id,
        front: card.front,
        back: card.back,
        interval: card.interval,
        easeFactor: card.easeFactor,
        reviews: card.reviews
      })),
      totalCards: due.length,
      startTime: new Date().toISOString(),
      estimatedTime: Math.ceil(due.length * 0.5) // ~30 seconds per card
    };
  }

  /**
   * Record review result
   * @param {object} card - Card being reviewed
   * @param {number} quality - Quality of response (0-5)
   * @returns {object} Updated card state
   */
  recordReview(card, quality) {
    const { nextInterval, nextEaseFactor } = this.calculateNextReview(
      card.interval,
      card.easeFactor,
      quality
    );

    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + nextInterval);

    return {
      ...card,
      reviews: card.reviews + 1,
      interval: nextInterval,
      easeFactor: nextEaseFactor,
      lastReviewDate: new Date().toISOString(),
      nextReviewDate: nextReviewDate.toISOString(),
      lastQuality: quality,
      suspended: quality < 1 ? true : card.suspended // Auto-suspend very difficult cards
    };
  }
}

module.exports = new SRSManager();
