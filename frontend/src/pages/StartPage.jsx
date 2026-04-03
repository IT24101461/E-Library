import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './StartPage.module.css';
import { ActivityService } from '../services/ActivityService';

const RightArrowIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
);

const StartPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(1);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Reveal text animation after load
    setTimeout(() => setIsLoaded(true), 100);

    const raw = localStorage.getItem('authUser');
    if (raw) {
      try {
        const u = JSON.parse(raw);
        if (u && u.id) setUserId(u.id);
      } catch (e) {}
    }
  }, []);

  const handleAction = async (action) => {
    try {
      setLoading(true);
      await ActivityService.createActivity({ action: action, userId: userId });
    } catch (err) {
      console.warn('Failed to record activity', err);
    } finally {
      setLoading(false);
      navigate('/dashboard');
    }
  };

  return (
    <main className={styles.startpage}>
      {/* Background Image Wrapper */}
      <div className={styles.bgImageWrap} aria-hidden>
        <img 
          src="/images/start_page_hero.png" 
          alt="AI-Scholar Library Concept" 
          className={styles.bgImage} 
        />
        <div className={styles.imageOverlay}></div>
      </div>

      <div className={`${styles.contentWrapper} ${isLoaded ? styles.loaded : ''}`}>
        <div className={styles.glassCard}>
          <div className={styles.badge}>
             <span className={styles.pulse}></span>
             AI-Powered Discovery
          </div>
          
          <h1 className={styles.heroTitle}>
            Your Infinite Library <br/>
            <span className={styles.highlightText}>Awaits You</span>
          </h1>
          
          <p className={styles.heroSubtitle}>
            Immerse yourself in a vast collection of knowledge, curated and guided by our state-of-the-art AI recommendation engine. Read, learn, and grow.
          </p>

          <div className={styles.actionGroup}>
            <button className={styles.primaryButton} onClick={() => handleAction('START_READING')} disabled={loading}>
              <span className={styles.buttonText}>{loading ? 'Accessing Library...' : 'Enter the Library'}</span>
              {!loading && <span className={styles.iconWrapper}><RightArrowIcon /></span>}
              {loading && <span className={styles.spinner}></span>}
            </button>
          </div>
          
          <div className={styles.trustedBy}>
             <p>Access thousands of curated books and research papers.</p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default StartPage;
