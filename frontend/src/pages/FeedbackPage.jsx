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
  const [theme, setTheme] = useState('dark');

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
    } catch (err) {
      console.error('Error calling grammar API:', err);
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

  useEffect(() => {
    // Sync with existing theme
    const rootTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    setTheme(rootTheme);
    
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-theme') {
          setTheme(document.documentElement.getAttribute('data-theme'));
        }
      });
    });
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  const handleTypeSelect = (selectedType) => {
    setType(selectedType);
    if (selectedType !== 'review') {
      setRating(0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    try {
      await FeedbackService.submitFeedback({
        type,
        rating: type === 'review' ? rating : null,
        message
      });
      setIsSuccess(true);
    } catch (error) {
      console.error('Failed to submit feedback', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.pageContainer} data-theme={theme}>
      <div className={styles.contentWrapper}>
        {!isSuccess ? (
          <>
            <div className={styles.header}>
              <h1 className={styles.title}>Send Feedback</h1>
              <p className={styles.subtitle}>Help us shape the future of E-Library. Your thoughts mean the world to us.</p>
            </div>

            <div className={styles.formSection}>
              <span className={styles.sectionLabel}>1. What kind of feedback do you have?</span>
              <div className={styles.typeSelector}>
                <button
                  type="button"
                  className={`${styles.typeBtn} ${type === 'bug' ? styles.selected : ''}`}
                  onClick={() => handleTypeSelect('bug')}
                >
                  <span>🐛</span>
                  <span>Report a Bug</span>
                </button>
                <button
                  type="button"
                  className={`${styles.typeBtn} ${type === 'feature' ? styles.selected : ''}`}
                  onClick={() => handleTypeSelect('feature')}
                >
                  <span>💡</span>
                  <span>Feature Request</span>
                </button>
                <button
                  type="button"
                  className={`${styles.typeBtn} ${type === 'review' ? styles.selected : ''}`}
                  onClick={() => handleTypeSelect('review')}
                >
                  <span>⭐</span>
                  <span>General Review</span>
                </button>
              </div>

              {type === 'review' && (
                <div className={styles.ratingContainer}>
                  <span className={styles.sectionLabel} style={{ marginBottom: '5px' }}>2. How would you rate your experience?</span>
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
                  {type === 'review' ? '3. Tell us more about it' : '2. Tell us more about it'}
                </span>
                <textarea
                  className={styles.textarea}
                  placeholder={
                    type === 'bug' ? "What's broken or not working? Please provide as much detail as possible so we can squash this bug..." :
                    type === 'feature' ? "What new feature would you like to see? How would it help your reading experience?" :
                    "Tell us what you love, what you hate, and how we can make E-Library even better..."
                  }
                  value={message}
                  onChange={handleMessageChange}
                  maxLength={1000}
                  required
                />
                
                <div className={styles.grammarControls}>
                  <button 
                    type="button" 
                    className={styles.grammarBtn}
                    onClick={handleCheckGrammar}
                    disabled={isCheckingGrammar || !message.trim()}
                  >
                    {isCheckingGrammar ? 'Checking...' : '✨ Check Spelling & Grammar'}
                  </button>
                </div>

                {grammarChecked && (
                  <div className={styles.grammarResults}>
                    {grammarMistakes.length > 0 ? (
                      <>
                        <h4>Found {grammarMistakes.length} Suggestion{grammarMistakes.length > 1 ? 's' : ''}</h4>
                        {grammarMistakes.map((mistake, idx) => (
                          <div key={idx} className={styles.grammarMistake}>
                            <div>Issue: <span className={styles.mistakeText}>"{mistake.mistake}"</span></div>
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
                      </>
                    ) : (
                      <div className={styles.noMistakes}>
                        <span>✨</span> Looks great! No spelling or grammar issues found.
                      </div>
                    )}
                  </div>
                )}

                <button 
                  type="submit" 
                  className={styles.submitBtn}
                  disabled={isSubmitting || !message.trim() || (type === 'review' && rating === 0)}
                >
                  {isSubmitting ? 'Sending your thoughts...' : 'Submit Feedback'}
                </button>
              </form>
            </div>
          </>
        ) : (
           <div className={styles.successMessage}>
              <div className={styles.checkIcon}>✓</div>
              <h2 className={styles.title}>You're Awesome!</h2>
              <p className={styles.subtitle}>Your feedback has been successfully submitted and helps us build a better platform for everyone.</p>
              <button className={styles.homeBtn} onClick={() => navigate('/dashboard')}>
                Return to Dashboard
              </button>
           </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackPage;
