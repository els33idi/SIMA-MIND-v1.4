// Study Tools Generator with AI-like capabilities
const DocumentExtractor = require('./document-extractor');

class StudyToolsGenerator {
  constructor() {
    this.maxFlashcards = 10;
    this.maxMCQs = 5;
  }

  async generateStudyTools(documentText, profile = {}) {
    if (!documentText || documentText.length < 50) {
      return this.getDefaultStudyTools();
    }

    try {
      const chunks = DocumentExtractor.splitIntoChunks(documentText, 300);
      const keyTerms = DocumentExtractor.extractKeyTerms(documentText, 8);
      const summary = DocumentExtractor.summarizeText(documentText, 4);

      return {
        flashcards: this.generateFlashcards(chunks, keyTerms),
        mcqs: this.generateMCQs(chunks, keyTerms),
        summary: summary,
        keyTopics: keyTerms,
        estimatedReadTime: this.estimateReadTime(documentText)
      };
    } catch (error) {
      console.error('Study tools generation error:', error);
      return this.getDefaultStudyTools();
    }
  }

  generateFlashcards(chunks, keyTerms) {
    const flashcards = [];

    // Generate from key terms
    keyTerms.forEach((term, idx) => {
      if (flashcards.length < this.maxFlashcards) {
        flashcards.push({
          id: `fc_${idx}`,
          question: `What is the significance of "${term}"?`,
          answer: `"${term}" is a key concept discussed in the document. It relates to important aspects of the material and is often used in context with other related concepts.`,
          difficulty: ['easy', 'medium', 'hard'][idx % 3],
          category: 'concept'
        });
      }
    });

    // Generate from document chunks
    chunks.slice(0, 5).forEach((chunk, idx) => {
      if (flashcards.length < this.maxFlashcards) {
        const sentences = chunk.match(/[^.!?]+[.!?]+/g) || [];
        if (sentences.length > 0) {
          const mainSentence = sentences[0].trim();
          flashcards.push({
            id: `fc_chunk_${idx}`,
            question: `Summarize this idea: "${mainSentence.substring(0, 60)}..."?`,
            answer: mainSentence,
            difficulty: 'medium',
            category: 'summary'
          });
        }
      }
    });

    return flashcards.slice(0, this.maxFlashcards);
  }

  generateMCQs(chunks, keyTerms) {
    const mcqs = [];
    const distractors = [
      'an unrelated concept',
      'a previous topic',
      'a common misconception',
      'an alternative interpretation'
    ];

    keyTerms.forEach((term, idx) => {
      if (mcqs.length < this.maxMCQs) {
        const options = [
          `${term} is a key concept in the material`,
          distractors[idx % distractors.length],
          distractors[(idx + 1) % distractors.length],
          distractors[(idx + 2) % distractors.length]
        ];

        // Shuffle options
        const shuffled = this.shuffleArray(options);

        mcqs.push({
          id: `mcq_${idx}`,
          question: `Which statement best describes "${term}"?`,
          options: shuffled,
          correctIndex: shuffled.indexOf(`${term} is a key concept in the material`),
          explanation: `"${term}" is discussed as a key concept in the document, distinguishing it from the other options which represent common misconceptions or unrelated topics.`,
          difficulty: ['easy', 'medium', 'hard'][idx % 3]
        });
      }
    });

    // Add comprehension MCQs from chunks
    chunks.slice(0, 3).forEach((chunk, idx) => {
      if (mcqs.length < this.maxMCQs) {
        const sentences = chunk.match(/[^.!?]+[.!?]+/g) || [];
        if (sentences.length > 0) {
          const mainSentence = sentences[0].trim();
          mcqs.push({
            id: `mcq_chunk_${idx}`,
            question: `What is being described in this statement: "${mainSentence.substring(0, 60)}..."?`,
            options: [
              'The main concept being introduced',
              'A counter-argument',
              'An example from earlier',
              'A future consideration'
            ],
            correctIndex: 0,
            explanation: 'This statement introduces and describes the main concept from the document.',
            difficulty: 'medium'
          });
        }
      }
    });

    return mcqs.slice(0, this.maxMCQs);
  }

  generateSummary(documentText, profile = {}) {
    if (!documentText) return '';
    
    const chunks = DocumentExtractor.splitIntoChunks(documentText, 400);
    const keyTerms = DocumentExtractor.extractKeyTerms(documentText, 5);
    
    let summary = DocumentExtractor.summarizeText(documentText, 5);
    
    if (keyTerms.length > 0) {
      summary += `\n\nKey topics: ${keyTerms.join(', ')}`;
    }

    if (chunks.length > 1) {
      summary += `\n\nThis document covers approximately ${chunks.length} distinct sections with varying complexity levels.`;
    }

    return summary;
  }

  estimateReadTime(text) {
    const words = (text || '').split(/\s+/).length;
    const wordsPerMinute = 200;
    const minutes = Math.ceil(words / wordsPerMinute);
    return Math.max(1, minutes);
  }

  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  getDefaultStudyTools() {
    return {
      flashcards: [
        {
          id: 'default_1',
          question: 'What is the main focus of your learning?',
          answer: 'Focus on understanding core concepts and their relationships.',
          difficulty: 'easy',
          category: 'concept'
        },
        {
          id: 'default_2',
          question: 'How should you approach this material?',
          answer: 'Start with the fundamentals, then progress to more complex topics.',
          difficulty: 'medium',
          category: 'strategy'
        }
      ],
      mcqs: [
        {
          id: 'default_mcq_1',
          question: 'What is the best first step in learning new material?',
          options: ['Read through everything quickly', 'Understand core concepts first', 'Jump to advanced topics', 'Memorize definitions'],
          correctIndex: 1,
          explanation: 'Understanding core concepts first provides a foundation for learning advanced topics.',
          difficulty: 'easy'
        }
      ],
      summary: 'Upload a document to get AI-generated study materials including flashcards, practice questions, and summaries.',
      keyTopics: ['Learning', 'Study Methods', 'Material Review'],
      estimatedReadTime: 5
    };
  }
}

module.exports = new StudyToolsGenerator();
