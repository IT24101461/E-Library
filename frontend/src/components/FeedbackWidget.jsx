import React, { useState, useEffect } from 'react';
import styles from './FeedbackWidget.module.css';
import FeedbackService from '../services/FeedbackService';

const FeedbackWidget = ({ isOpen, onClose }) => {
  const [type, setType] = useState('bug'); // 'bug', 'feature', 'review'
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [theme, setTheme] = useState('dark');
  const [isCheckingGrammar, setIsCheckingGrammar] = useState(false);
  const [grammarIssues, setGrammarIssues] = useState([]);

  useEffect(() => {
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

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsSuccess(false);
      setMessage('');
      setRating(0);
      setType('bug');
      setErrorMessage('');
      setGrammarIssues([]);
    }
  }, [isOpen]);

  const handleTypeSelect = (selectedType) => {
    setType(selectedType);
    if (selectedType !== 'review') {
      setRating(0);
    }
  };

  const handleCheckGrammar = async () => {
    if (!message.trim()) {
      setErrorMessage('Please enter text to check');
      return;
    }

    setIsCheckingGrammar(true);
    try {
<<<<<<< HEAD
      const params = new URLSearchParams();
      params.append('text', message);
      params.append('language', 'en-US');

      const response = await fetch('https://api.languagetoolplus.com/v2/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params
      });

      const data = await response.json();
      const mistakes = data.matches || [];
      
      setGrammarIssues(mistakes);
      if (mistakes.length === 0) {
        setErrorMessage('✓ No grammar issues found!');
      } else {
        setErrorMessage(`Found ${mistakes.length} issue(s)`);
=======
      const response = await fetch('http://127.0.0.1:5000/api/check-grammar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: message })
      });

      const data = await response.json();
      
      if (data.status === 'success') {
        setGrammarIssues(data.details || []);
        if (data.details.length === 0) {
          setErrorMessage('✓ No grammar issues found!');
        } else {
          setErrorMessage(`Found ${data.details.length} issue(s)`);
        }
      } else {
        setErrorMessage('Failed to check grammar');
>>>>>>> 7d6a5d204ea17806ab69918b293c59a83a16ffc5
      }
    } catch (error) {
      console.error('Grammar check error:', error);
      setErrorMessage('Could not connect to grammar checker');
    } finally {
      setIsCheckingGrammar(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      setErrorMessage('Please enter a message');
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
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Failed to submit feedback', error);
      const errorMsg = error.response?.data?.message || 
                       error.response?.data || 
                       error.message || 
                       'Failed to submit feedback. Please try again.';
      setErrorMessage(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} data-theme={theme} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>✕</button>
        
        {!isSuccess ? (
          <>
            <div className={styles.header}>
              <h3 className={styles.title}>Send Feedback</h3>
              <p className={styles.subtitle}>Help us improve your E-Library experience</p>
            </div>

            <div className={styles.typeSelector}>
              <button
                type="button"
                className={`${styles.typeBtn} ${type === 'bug' ? styles.selected : ''}`}
                onClick={() => handleTypeSelect('bug')}
              >
                <span>🐛</span> Bug
              </button>
              <button
                type="button"
                className={`${styles.typeBtn} ${type === 'feature' ? styles.selected : ''}`}
                onClick={() => handleTypeSelect('feature')}
              >
                <span>💡</span> Feature
              </button>
              <button
                type="button"
                className={`${styles.typeBtn} ${type === 'review' ? styles.selected : ''}`}
                onClick={() => handleTypeSelect('review')}
              >
                <span>⭐</span> Review
              </button>
            </div>

            {type === 'review' && (
              <div className={styles.ratingContainer}>
                <p className={styles.subtitle} style={{ marginBottom: '5px' }}>Rate your experience</p>
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
              <textarea
                className={styles.textarea}
                placeholder={
                  type === 'bug' ? "What's broken or not working?" :
                  type === 'feature' ? "What new feature would you like to see?" :
                  "Tell us about your experience..."
                }
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={500}
                required
              />
              
              <button
                type="button"
                onClick={handleCheckGrammar}
                className={styles.grammarBtn}
                disabled={isCheckingGrammar || !message.trim()}
              >
                {isCheckingGrammar ? 'Checking...' : '✓ CHECK GRAMMAR'}
              </button>
              
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
                {isSubmitting ? 'Sending...' : 'Send Feedback'}
              </button>
            </form>
          </>
        ) : (
           <div className={styles.successMessage}>
              <div className={styles.checkIcon}>✓</div>
              <h3 className={styles.title}>Thank You!</h3>
              <p className={styles.subtitle}>Your feedback has been received.</p>
           </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackWidget;
