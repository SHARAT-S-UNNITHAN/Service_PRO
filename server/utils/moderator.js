const PROFANITY_WORDS = ['badword1', 'badword2', 'spam', 'fraud', 'fake', 'scam'];

/**
 * Checks a text for profanity and returns flagging status
 * @param {string} text 
 * @returns {Object} { flagged: boolean, reason: string|null }
 */
const moderateText = (text) => {
  if (!text) return { flagged: false, reason: null };
  
  const lowerText = text.toLowerCase();
  const foundWords = PROFANITY_WORDS.filter(word => lowerText.includes(word));
  
  if (foundWords.length > 0) {
    return { 
      flagged: true, 
      reason: `Profanity detected: ${foundWords.join(', ')}` 
    };
  }
  
  return { flagged: false, reason: null };
};

module.exports = { moderateText };
