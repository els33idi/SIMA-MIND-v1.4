// Quiz/Assessment Engine for Testing Knowledge
// Supports multiple question types and adaptive difficulty

class QuizEngine {
  constructor() {
    this.questionTypes = {
      'multiple_choice': 'MCQ',
      'true_false': 'T/F',
      'short_answer': 'SA',
      'matching': 'Match',
      'fill_blank': 'FillBlank',
      'ordering': 'Order'
    };
  }

  /**
   * Create a quiz session
   * @param {array} questions - Questions for the quiz
   * @param {object} options - Quiz options (time, difficulty, shuffle)
   * @returns {object} Quiz session
   */
  createQuizSession(questions, options = {}) {
    const {
      timeLimit = 60, // minutes
      allowReview = true,
      shuffle = true,
      passingScore = 60, // percentage
      showAnswers = false
    } = options;

    const shuffled = shuffle ? this.shuffleArray([...questions]) : questions;

    return {
      quizId: `quiz_${Date.now()}`,
      questions: shuffled.map((q, idx) => ({
        id: q.id,
        type: q.type,
        question: q.question,
        options: q.options || [],
        media: q.media || null,
        difficulty: q.difficulty || 'medium',
        points: q.points || 1,
        order: idx + 1,
        answered: false,
        timeSpent: 0
      })),
      totalQuestions: shuffled.length,
      totalPoints: shuffled.reduce((sum, q) => sum + (q.points || 1), 0),
      timeLimit: timeLimit * 60, // Convert to seconds
      allowReview,
      passingScore,
      showAnswers,
      startTime: new Date().toISOString(),
      responses: [],
      submitted: false
    };
  }

  /**
   * Score a response
   * @param {object} question - The question
   * @param {*} userResponse - User's answer
   * @returns {object} Scoring result
   */
  scoreResponse(question, userResponse) {
    let correct = false;
    let points = 0;
    const maxPoints = question.points || 1;

    switch (question.type) {
      case 'multiple_choice':
      case 'true_false':
        correct = userResponse === question.correctAnswer;
        points = correct ? maxPoints : 0;
        break;

      case 'short_answer':
        // Partial matching
        const userLower = (userResponse || '').toLowerCase().trim();
        const answerLower = (question.correctAnswer || '').toLowerCase().trim();
        correct = userLower === answerLower;
        
        if (!correct && question.acceptableAnswers) {
          correct = question.acceptableAnswers.some(ans => 
            userLower === ans.toLowerCase().trim()
          );
        }
        points = correct ? maxPoints : 0;
        break;

      case 'matching':
        // Check if all matches are correct
        const allCorrect = Array.isArray(userResponse) && userResponse.every((resp, idx) => 
          resp === question.correctMatches[idx]
        );
        correct = allCorrect;
        points = correct ? maxPoints : Math.floor(maxPoints * userResponse.filter((r, idx) => 
          r === question.correctMatches[idx]
        ).length / question.correctMatches.length);
        break;

      case 'ordering':
        // Check if sequence is correct
        const correctSequence = userResponse.join(',') === question.correctOrder.join(',');
        correct = correctSequence;
        points = correct ? maxPoints : 0;
        break;

      case 'fill_blank':
        // Check fill-in-the-blank answers
        const allBlanksCorrect = userResponse.every((ans, idx) => 
          (ans || '').toLowerCase().trim() === (question.answers[idx] || '').toLowerCase().trim()
        );
        correct = allBlanksCorrect;
        points = correct ? maxPoints : 0;
        break;

      default:
        points = 0;
    }

    return {
      questionId: question.id,
      correct,
      pointsEarned: points,
      maxPoints,
      scorePercentage: Math.round((points / maxPoints) * 100),
      userResponse,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation || ''
    };
  }

  /**
   * Calculate quiz results
   * @param {object} session - Quiz session with responses
   * @returns {object} Results summary
   */
  calculateResults(session) {
    let totalPoints = 0;
    let totalEarned = 0;
    let correctCount = 0;
    const results = [];

    session.responses.forEach(response => {
      totalPoints += response.maxPoints;
      totalEarned += response.pointsEarned;
      if (response.correct) correctCount++;
      results.push(response);
    });

    const scorePercentage = totalPoints > 0 ? Math.round((totalEarned / totalPoints) * 100) : 0;
    const passed = scorePercentage >= session.passingScore;
    const timeTaken = Math.round((new Date() - new Date(session.startTime)) / 1000);

    return {
      quizId: session.quizId,
      totalQuestions: session.totalQuestions,
      correctAnswers: correctCount,
      incorrectAnswers: session.totalQuestions - correctCount,
      skipped: session.totalQuestions - session.responses.length,
      pointsEarned: totalEarned,
      totalPoints: totalPoints,
      scorePercentage,
      passed,
      passingScore: session.passingScore,
      timeTaken,
      timeLimit: session.timeLimit,
      completedAt: new Date().toISOString(),
      detailedResults: results,
      strengths: this.identifyStrengths(results),
      weaknesses: this.identifyWeaknesses(results)
    };
  }

  /**
   * Identify strong areas
   * @param {array} results - Scored responses
   * @returns {array} Strong topics
   */
  identifyStrengths(results) {
    const byDifficulty = {};
    results.forEach(r => {
      const diff = r.difficulty || 'medium';
      if (!byDifficulty[diff]) byDifficulty[diff] = { correct: 0, total: 0 };
      byDifficulty[diff].total++;
      if (r.correct) byDifficulty[diff].correct++;
    });

    return Object.entries(byDifficulty)
      .filter(([_, data]) => data.correct / data.total >= 0.8)
      .map(([diff]) => diff);
  }

  /**
   * Identify weak areas
   * @param {array} results - Scored responses
   * @returns {array} Weak topics
   */
  identifyWeaknesses(results) {
    const byDifficulty = {};
    results.forEach(r => {
      const diff = r.difficulty || 'medium';
      if (!byDifficulty[diff]) byDifficulty[diff] = { correct: 0, total: 0 };
      byDifficulty[diff].total++;
      if (r.correct) byDifficulty[diff].correct++;
    });

    return Object.entries(byDifficulty)
      .filter(([_, data]) => data.correct / data.total < 0.6)
      .map(([diff]) => diff);
  }

  /**
   * Adaptive difficulty adjustment
   * @param {object} results - Quiz results so far
   * @returns {number} Difficulty adjustment (-1, 0, or 1)
   */
  adjustDifficulty(results) {
    const scorePercentage = results.scorePercentage;
    
    if (scorePercentage >= 85) return 1; // Increase difficulty
    if (scorePercentage <= 50) return -1; // Decrease difficulty
    return 0; // Keep same
  }

  /**
   * Shuffle array
   * @param {array} array - Array to shuffle
   * @returns {array} Shuffled array
   */
  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Generate practice questions from study material
   * @param {string} text - Study material
   * @param {number} count - Number of questions to generate
   * @returns {array} Generated questions
   */
  generatePracticeQuestions(text, count = 5) {
    // This is a simplified version - real implementation would use NLP/AI
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
    const questions = [];

    for (let i = 0; i < Math.min(count, sentences.length); i++) {
      const sentence = sentences[i].trim();
      questions.push({
        id: `q_${i}`,
        type: 'short_answer',
        question: `Explain: ${sentence.substring(0, 100)}...`,
        correctAnswer: sentence,
        difficulty: i % 2 === 0 ? 'easy' : 'medium',
        points: i % 2 === 0 ? 1 : 2,
        explanation: `The text states: ${sentence}`
      });
    }

    return questions;
  }
}

module.exports = new QuizEngine();
