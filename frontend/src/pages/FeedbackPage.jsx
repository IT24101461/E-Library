import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './FeedbackPage.module.css';
import FeedbackService from '../services/FeedbackService';

const FeedbackPage = () => {
  const navigate = useNavigate();
  const [type, setType] = useState('bug'); // 'bug', 'feature', 'review'
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [isCheckingGrammar, setIsCheckingGrammar] = useState(false);
  const [grammarMistakes, setGrammarMistakes] = useState([]);
  const [grammarChecked, setGrammarChecked] = useState(false);

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
    setGrammarChecked(false);
    setGrammarMistakes([]);
  };

  const handleCheckGrammar = async () => {
    if (!message.trim()) return;
    setIsCheckingGrammar(true);
    setGrammarChecked(false);
    setGrammarMistakes([]);
    setErrorMessage('');
    
    try {
      const params = new URLSearchParams();
      params.append('text', message);
      params.append('language', 'en-US');

      const response = await fetch('https://api.languagetoolplus.com/v2/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params
      });
      const data = await response.json();
      
      const mistakes = (data.matches || []).map(m => ({
        offset: m.offset,
        length: m.length,
        mistake: message.substring(m.offset, m.offset + m.length),
        message: m.message,
        suggestions: m.replacements.map(r => r.value).slice(0, 5)
      }));

      setGrammarMistakes(mistakes);
      setGrammarChecked(true);
      if (mistakes.length === 0) {
        setErrorMessage('✓ Your message is perfectly balanced and harmonious.');
      }
    } catch (err) {
      console.error('Error calling grammar API:', err);
      setErrorMessage('Harmony check could not be completed at this time.');
    } finally {
      setIsCheckingGrammar(false);
    }
  };

  const applyCorrection = (mistake, suggestion) => {
    const newMsg = message.substring(0, mistake.offset) + suggestion + message.substring(mistake.offset + mistake.length);
    setMessage(newMsg);
    
    const offsetDiff = suggestion.length - mistake.length;
    setGrammarMistakes(prev => prev.filter(m => m !== mistake).map(m => {
        if (m.offset > mistake.offset) {
            return { ...m, offset: m.offset + offsetDiff };
        }
        return m;
    }));
  };

  const handleTypeSelect = (selectedType) => {
    setType(selectedType);
    if (selectedType !== 'review') {
      setRating(0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      setErrorMessage('Please share your thoughts before transmitting.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    try {
      await FeedbackService.submitFeedback({
        type,
        rating: type === 'review' ? rating : null,
        message
      });
      setIsSuccess(true);
    } catch (error) {
      console.error('Failed to submit feedback', error);
      setErrorMessage('Failed to transmit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        {!isSuccess ? (
          <>
            <section className={styles.heroSection}>
              <h1 className={styles.title}>The Feedback Hub</h1>
              <p className={styles.subtitle}>Help us shape the future of the sanctuary. Your insights drive our evolution.</p>
            </section>

            <div className={styles.formSection}>
              <span className={styles.sectionLabel}>1. Identify the Nature of your Feedback</span>
              <div className={styles.typeSelector}>
                <div
                  className={`${styles.typeCard} ${type === 'bug' ? styles.selected : ''}`}
                  onClick={() => handleTypeSelect('bug')}
                >
                  <span className={styles.typeIcon}>🐛</span>
                  <span className={styles.typeName}>Reports</span>
                </div>
                <div
                  className={`${styles.typeCard} ${type === 'feature' ? styles.selected : ''}`}
                  onClick={() => handleTypeSelect('feature')}
                >
                  <span className={styles.typeIcon}>💡</span>
                  <span className={styles.typeName}>Aspirations</span>
                </div>
                <div
                  className={`${styles.typeCard} ${type === 'review' ? styles.selected : ''}`}
                  onClick={() => handleTypeSelect('review')}
                >
                  <span className={styles.typeIcon}>✨</span>
                  <span className={styles.typeName}>Reflections</span>
                </div>
              </div>

              {type === 'review' && (
                <div className={styles.ratingContainer}>
                  <span className={styles.sectionLabel}>2. Rate your Experience</span>
                  <div className={styles.stars} onMouseLeave={() => setHoveredStar(0)}>
                    {[1, 2, 3, 4, 5].map((value) => (
                      <span
                        key={value}
                        className={`${styles.star} ${(hoveredStar || rating) >= value ? styles.filled : ''}`}
                        onClick={() => setRating(value)}
                        onMouseEnter={() => setHoveredStar(value)}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <span className={styles.sectionLabel}>
                  {type === 'review' ? '3. Elaborate on your Thoughts' : '2. Elaborate on your Thoughts'}
                </span>
                
                <div className={styles.inputSection}>
                    <textarea
                    className={styles.textarea}
                    placeholder={
                        type === 'bug' ? "Describe the friction you encountered in detail..." :
                        type === 'feature' ? "What new elements would enrich your reading journey?" :
                        "Share your overall experience and suggestions for the sanctuary..."
                    }
                    value={message}
                    onChange={handleMessageChange}
                    maxLength={1000}
                    required
                    />
                    <div className={styles.charCounter}>{message.length} / 1000</div>
                </div>
                
                <div className={styles.grammarControls}>
                  <button 
                    type="button" 
                    className={styles.grammarBtn}
                    onClick={handleCheckGrammar}
                    disabled={isCheckingGrammar || !message.trim()}
                  >
                    {isCheckingGrammar ? 'REFINING...' : '✨ HARMONY CHECK'}
                  </button>
                </div>

                {grammarChecked && grammarMistakes.length > 0 && (
                  <div className={styles.grammarResults}>
                    <h4>Found {grammarMistakes.length} Point(s) for Refinement</h4>
                    {grammarMistakes.map((mistake, idx) => (
                      <div key={idx} className={styles.grammarMistake}>
                        <div>Point: <span className={styles.mistakeText}>"{mistake.mistake}"</span></div>
                        <div className={styles.mistakeReason}>{mistake.message}</div>
                        {mistake.suggestions && mistake.suggestions.length > 0 && (
                          <div className={styles.suggestionsBox}>
                            {mistake.suggestions.map((sug, i) => (
                              <button 
                                key={i} 
                                type="button" 
                                className={styles.suggestionChip}
                                onClick={() => applyCorrection(mistake, sug)}
                              >
                                {sug}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {errorMessage && (
                    <div className={styles.errorMessage}>
                        {errorMessage}
                    </div>
                )}

                <button 
                  type="submit" 
                  className={styles.submitBtn}
                  disabled={isSubmitting || !message.trim() || (type === 'review' && rating === 0)}
                >
                  {isSubmitting ? 'TRANSMITTING...' : 'TRANSMIT FEEDBACK'}
                </button>
              </form>
            </div>
          </>
        ) : (
           <div className={styles.successMessage}>
              <div className={styles.checkIcon}>✓</div>
              <h2 className={styles.title}>Grateful</h2>
              <p className={styles.subtitle}>Your feedback has been successfully woven into the future of our library.</p>
              <button className={styles.homeBtn} onClick={() => navigate('/dashboard')}>
                Return to Sanctuary
              </button>
           </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackPage;
