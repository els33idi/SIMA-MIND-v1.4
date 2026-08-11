// Intelligent Study Planner
// Creates personalized study schedules based on user profile, goals, and performance

class StudyPlanner {
  constructor() {
    this.studyMethods = ['active_recall', 'spaced_repetition', 'interleaving', 'elaboration', 'pomodoro'];
    this.priorities = ['urgent', 'high', 'medium', 'low'];
  }

  /**
   * Create personalized study plan
   * @param {object} userProfile - User's learning profile
   * @param {array} goals - Learning goals
   * @param {object} availability - Available study hours
   * @returns {object} Personalized study plan
   */
  createStudyPlan(userProfile, goals, availability = {}) {
    const {
      hoursPerDay = 2,
      hoursPerWeek = 14,
      preferredTimes = ['morning', 'evening']
    } = availability;

    const learningStyle = userProfile.learningStyle || 'visual';
    const studyPace = userProfile.studyPace || 'moderate';
    const focusDuration = userProfile.focusDuration || 25; // minutes

    // Generate weekly schedule
    const weeklyPlan = this.generateWeeklySchedule(
      goals,
      hoursPerWeek,
      preferredTimes,
      learningStyle,
      studyPace
    );

    // Generate daily tasks
    const dailyTasks = this.generateDailyTasks(goals, focusDuration);

    return {
      planId: `plan_${Date.now()}`,
      userId: userProfile.id,
      goals: goals.map(g => ({
        id: g.id,
        title: g.title,
        deadline: g.deadline,
        priority: g.priority || 'medium',
        status: 'in_progress',
        progress: 0
      })),
      weeklyPlan,
      dailyTasks,
      studyMethods: this.recommendStudyMethods(userProfile),
      resources: this.recommendResources(goals),
      createdAt: new Date().toISOString(),
      nextReview: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };
  }

  /**
   * Generate weekly schedule
   * @param {array} goals - Goals to schedule
   * @param {number} hoursPerWeek - Available hours
   * @param {array} preferredTimes - Preferred study times
   * @param {string} learningStyle - User's learning style
   * @param {string} pace - Study pace
   * @returns {object} Weekly schedule
   */
  generateWeeklySchedule(goals, hoursPerWeek, preferredTimes, learningStyle, pace) {
    const minPerDay = Math.round((hoursPerWeek * 60) / 7);
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const schedule = {};

    days.forEach((day, idx) => {
      const isWeekend = idx >= 5;
      const timeSlots = isWeekend 
        ? [{ time: '10:00-12:00', duration: 120 }, { time: '14:00-16:00', duration: 120 }]
        : this.getTimeSlots(preferredTimes, minPerDay);

      schedule[day] = {
        date: this.getDateForDay(idx),
        totalMinutes: minPerDay,
        sessions: timeSlots.map((slot, i) => ({
          id: `session_${day}_${i}`,
          time: slot.time,
          duration: slot.duration,
          topic: goals[idx % goals.length]?.title || 'General Review',
          method: this.selectStudyMethod(learningStyle, i),
          difficulty: this.calculateDifficulty(pace, i)
        }))
      };
    });

    return schedule;
  }

  /**
   * Generate daily tasks
   * @param {array} goals - Goals to create tasks from
   * @param {number} focusDuration - Focus session duration in minutes
   * @returns {array} Daily tasks
   */
  generateDailyTasks(goals, focusDuration) {
    const tasks = [];
    const today = new Date();

    goals.forEach((goal, idx) => {
      const daysUntilDeadline = goal.deadline 
        ? Math.ceil((new Date(goal.deadline) - today) / (1000 * 60 * 60 * 24))
        : 14;

      const priority = daysUntilDeadline <= 3 ? 'urgent' : daysUntilDeadline <= 7 ? 'high' : 'medium';
      const sessionsNeeded = Math.ceil(daysUntilDeadline / 7) || 1;
      const tasksPerGoal = Math.max(1, Math.floor(7 / sessionsNeeded));

      for (let i = 0; i < tasksPerGoal; i++) {
        tasks.push({
          id: `task_${goal.id}_${i}`,
          goalId: goal.id,
          title: `${goal.title} - Part ${i + 1}`,
          description: goal.description || '',
          priority,
          dueDate: new Date(today.getTime() + (i + 1) * (24 * 60 * 60 * 1000)).toISOString(),
          estimatedTime: focusDuration,
          completed: false,
          subtasks: this.generateSubtasks(goal, focusDuration)
        });
      }
    });

    return tasks.sort((a, b) => this.priorityValue(b.priority) - this.priorityValue(a.priority));
  }

  /**
   * Generate subtasks for a goal
   * @param {object} goal - Goal to break down
   * @param {number} focusDuration - Focus session duration
   * @returns {array} Subtasks
   */
  generateSubtasks(goal, focusDuration) {
    return [
      {
        id: `subtask_${goal.id}_1`,
        title: 'Review lecture notes',
        duration: focusDuration * 0.3,
        completed: false
      },
      {
        id: `subtask_${goal.id}_2`,
        title: 'Practice problems',
        duration: focusDuration * 0.4,
        completed: false
      },
      {
        id: `subtask_${goal.id}_3`,
        title: 'Summarize key concepts',
        duration: focusDuration * 0.3,
        completed: false
      }
    ];
  }

  /**
   * Recommend study methods based on learning profile
   * @param {object} userProfile - User's profile
   * @returns {array} Recommended methods with rationale
   */
  recommendStudyMethods(userProfile) {
    const learningStyle = userProfile.learningStyle || 'mixed';
    const recommendations = [];

    const methodMap = {
      visual: ['mind_maps', 'diagrams', 'videos', 'color_coding'],
      auditory: ['recordings', 'discussion', 'podcasts', 'group_study'],
      reading: ['textbooks', 'notes', 'summaries', 'flashcards'],
      kinesthetic: ['practice_problems', 'experiments', 'simulations', 'projects'],
      mixed: ['spaced_repetition', 'active_recall', 'interleaving', 'elaboration']
    };

    const methods = methodMap[learningStyle] || methodMap.mixed;
    
    methods.forEach((method, idx) => {
      recommendations.push({
        method,
        priority: idx === 0 ? 'high' : idx === 1 ? 'medium' : 'low',
        rationale: `Recommended for ${learningStyle} learners`,
        effectiveness: 0.7 + (0.1 * (3 - idx))
      });
    });

    return recommendations;
  }

  /**
   * Recommend resources
   * @param {array} goals - Study goals
   * @returns {array} Resource recommendations
   */
  recommendResources(goals) {
    return goals.map(goal => ({
      goalId: goal.id,
      resources: [
        { type: 'textbook', title: `${goal.title} Fundamentals` },
        { type: 'video', title: `${goal.title} Explained` },
        { type: 'practice', title: `${goal.title} Exercises` },
        { type: 'flashcard_deck', title: `${goal.title} Cards` }
      ]
    }));
  }

  /**
   * Get time slots for study
   * @param {array} preferredTimes - Preferred times
   * @param {number} minPerDay - Minutes per day
   * @returns {array} Time slots
   */
  getTimeSlots(preferredTimes, minPerDay) {
    const timeMap = {
      'morning': [{ time: '06:00-08:00', duration: 120 }],
      'afternoon': [{ time: '14:00-16:00', duration: 120 }],
      'evening': [{ time: '18:00-20:00', duration: 120 }],
      'night': [{ time: '20:00-22:00', duration: 120 }]
    };

    let slots = [];
    preferredTimes.forEach(time => {
      slots = slots.concat(timeMap[time] || []);
    });

    // Adjust durations to match minPerDay
    if (slots.length > 0) {
      const durationPerSlot = Math.floor(minPerDay / slots.length);
      slots = slots.map(slot => ({ ...slot, duration: durationPerSlot }));
    }

    return slots.length > 0 ? slots : [{ time: '19:00-20:00', duration: minPerDay }];
  }

  /**
   * Select study method based on learning style and session number
   * @param {string} learningStyle - User's learning style
   * @param {number} sessionNumber - Session number
   * @returns {string} Study method
   */
  selectStudyMethod(learningStyle, sessionNumber) {
    const methods = {
      visual: ['mind_map', 'diagram', 'color_code', 'video'],
      auditory: ['discussion', 'recording', 'podcast', 'group'],
      reading: ['note_taking', 'summarization', 'flashcard', 'reading'],
      kinesthetic: ['problem_solving', 'experiment', 'practice', 'project']
    };

    const methodList = methods[learningStyle] || methods.reading;
    return methodList[sessionNumber % methodList.length];
  }

  /**
   * Calculate difficulty for session
   * @param {string} pace - Study pace
   * @param {number} sessionNumber - Session number
   * @returns {string} Difficulty level
   */
  calculateDifficulty(pace, sessionNumber) {
    if (pace === 'fast') return sessionNumber < 2 ? 'medium' : 'hard';
    if (pace === 'slow') return sessionNumber < 3 ? 'easy' : 'medium';
    return 'medium';
  }

  /**
   * Get date for day of week
   * @param {number} dayIndex - Day index (0-6)
   * @returns {string} ISO date string
   */
  getDateForDay(dayIndex) {
    const date = new Date();
    const currentDay = date.getDay();
    const diff = dayIndex - currentDay;
    date.setDate(date.getDate() + diff);
    return date.toISOString().split('T')[0];
  }

  /**
   * Convert priority to numeric value for sorting
   * @param {string} priority - Priority level
   * @returns {number} Priority value
   */
  priorityValue(priority) {
    const values = { urgent: 4, high: 3, medium: 2, low: 1 };
    return values[priority] || 2;
  }

  /**
   * Update plan based on performance
   * @param {object} currentPlan - Current study plan
   * @param {object} performance - User's recent performance
   * @returns {object} Updated study plan
   */
  updatePlanByPerformance(currentPlan, performance) {
    const adjustments = {};

    // Increase focus on weak areas
    if (performance.weakAreas && performance.weakAreas.length > 0) {
      performance.weakAreas.forEach(area => {
        adjustments[area] = { intensity: 'high', frequency: 'daily' };
      });
    }

    // Reduce focus on strong areas
    if (performance.strongAreas && performance.strongAreas.length > 0) {
      performance.strongAreas.forEach(area => {
        adjustments[area] = { intensity: 'low', frequency: 'weekly' };
      });
    }

    return {
      ...currentPlan,
      adjustments,
      updatedAt: new Date().toISOString()
    };
  }
}

module.exports = new StudyPlanner();
