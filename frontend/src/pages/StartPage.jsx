import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './StartPage.module.css';
import { ActivityService } from '../services/ActivityService';

const StartPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(1);

  useEffect(() => {
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
      // create a lightweight activity record so dashboard reflects the action
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
      <div className={styles.bgVideoWrap} aria-hidden>
        <video className={styles.bgVideo} autoPlay muted loop playsInline poster="/pdf/reading-illus.png">
          <source src="/vedio/Professional_Library_Video_Generation.webm" type="video/webm" />
        </video>
        <div className={styles.videoOverlay}></div>
      </div>

      <div className={styles.centerContainer}>
        <button className={styles.centerButton} onClick={() => handleAction('START_READING')} disabled={loading}>
          {loading ? 'Processing...' : 'Start Reading'}
        </button>
      </div>
    </main>
  );
};

export default StartPage;
