// Document Extraction Service for Phase 2
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

class DocumentExtractor {
  constructor() {
    this.supportedFormats = ['pdf', 'txt', 'md'];
  }

  async extractText(filePath, fileType) {
    try {
      const ext = path.extname(filePath).toLowerCase().substring(1);
      
      switch(ext) {
        case 'pdf':
          return await this.extractFromPDF(filePath);
        case 'txt':
        case 'md':
          return await this.extractFromText(filePath);
        default:
          throw new Error(`Unsupported file type: ${ext}`);
      }
    } catch (error) {
      console.error('Text extraction error:', error);
      return null;
    }
  }

  async extractFromPDF(filePath) {
    try {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      return data.text || '';
    } catch (error) {
      console.error('PDF extraction error:', error);
      return null;
    }
  }

  async extractFromText(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      return content;
    } catch (error) {
      console.error('Text extraction error:', error);
      return null;
    }
  }

  // Split text into chunks for better processing
  splitIntoChunks(text, chunkSize = 500) {
    const chunks = [];
    const words = text.split(/\s+/).filter(w => w.length > 0);
    let currentChunk = [];

    for (const word of words) {
      currentChunk.push(word);
      if (currentChunk.join(' ').length >= chunkSize) {
        chunks.push(currentChunk.join(' '));
        currentChunk = [];
      }
    }

    if (currentChunk.length > 0) {
      chunks.push(currentChunk.join(' '));
    }

    return chunks;
  }

  // Generate key concepts from text
  extractKeyTerms(text, limit = 10) {
    const words = text.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
    const frequency = {};

    // Count word frequency
    words.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });

    // Sort by frequency and return top terms
    return Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([term]) => term);
  }

  // Summarize text (simple approach - take first/key sentences)
  summarizeText(text, sentenceCount = 3) {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
    if (sentences.length === 0) return text.substring(0, 300);

    return sentences
      .slice(0, Math.min(sentenceCount, sentences.length))
      .join(' ')
      .trim();
  }
}

module.exports = new DocumentExtractor();
