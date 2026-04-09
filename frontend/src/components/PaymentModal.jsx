import React, { useState, useEffect } from 'react';
import { getApiUrl } from '../config/ApiConfig';
import styles from './PaymentModal.module.css';

const PaymentModal = ({ isOpen, onClose, onShowSuccess }) => {
  const [step, setStep] = useState(1); // 1: Plan, 2: Payment, 3: Processing
  const [plan, setPlan] = useState('annual');
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiry: '',
    cvc: '',
    name: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setIsProcessing(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Basic formatting for card number
    if (name === 'cardNumber') {
      const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
      const matches = v.match(/\d{4,16}/g);
      const match = matches && matches[0] || '';
      const parts = [];
      for (let i = 0, len = match.length; i < len; i += 4) {
        parts.push(match.substring(i, i + 4));
      }
      if (parts.length) {
        setFormData({ ...formData, [name]: parts.join(' ') });
      } else {
        setFormData({ ...formData, [name]: v });
      }
    } else if (name === 'expiry') {
      const v = value.replace(/\//g, '').replace(/[^0-9]/gi, '');
      if (v.length <= 4) {
        if (v.length > 2) {
          setFormData({ ...formData, [name]: `${v.substring(0, 2)}/${v.substring(2)}` });
        } else {
          setFormData({ ...formData, [name]: v });
        }
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStep(3);
    setIsProcessing(true);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2500));

    // Update backend (simulated)
    const authUser = JSON.parse(localStorage.getItem('authUser'));
    if (authUser) {
      try {
        const response = await fetch(`${getApiUrl()}/auth/upgrade`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: authUser.id })
        });
        if (response.ok) {
          const updatedUser = await response.json();
          localStorage.setItem('authUser', JSON.stringify(updatedUser));
          onShowSuccess();
          onClose();
        } else {
          console.error("Upgrade failed with status:", response.status);
          throw new Error("Backend upgrade failed");
        }
      } catch (err) {
        console.error("Upgrade failed:", err);
        // Even if backend fails, for demo purposes we upgrade locally
        authUser.isPremium = true;
        localStorage.setItem('authUser', JSON.stringify(authUser));
        onShowSuccess();
        onClose();
      }
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>✕</button>

        {step === 1 && (
          <div className={styles.stepContainer}>
            <div className={styles.premiumBadge}>💎 PREMIUM SCHOLAR</div>
            <h2 className={styles.title}>Unlock the Full Library</h2>
            <p className={styles.subtitle}>Choose the plan that fits your learning journey.</p>
            
            <div className={styles.plansGrid}>
              <div 
                className={`${styles.planCard} ${plan === 'monthly' ? styles.planActive : ''}`}
                onClick={() => setPlan('monthly')}
              >
                <span className={styles.planName}>Monthly</span>
                <span className={styles.planPrice}>$9.99<small>/mo</small></span>
                <ul className={styles.planFeatures}>
                  <li>✓ Unlimited Books</li>
                  <li>✓ Advanced AI Search</li>
                  <li>✓ Offline Reading</li>
                </ul>
              </div>
              <div 
                className={`${styles.planCard} ${plan === 'annual' ? styles.planActive : ''}`}
                onClick={() => setPlan('annual')}
              >
                <div className={styles.bestValue}>BEST VALUE</div>
                <span className={styles.planName}>Annual</span>
                <span className={styles.planPrice}>$79.99<small>/yr</small></span>
                <ul className={styles.planFeatures}>
                  <li>✓ All Pro Features</li>
                  <li>✓ 33% Discount</li>
                  <li>✓ Priority Support</li>
                </ul>
              </div>
            </div>

            <button className={styles.mainBtn} onClick={() => setStep(2)}>Next: Payment Details</button>
          </div>
        )}

        {step === 2 && (
          <div className={styles.stepContainer}>
            <div className={styles.backBtn} onClick={() => setStep(1)}>← Back to plans</div>
            <h2 className={styles.title}>Secure Payment</h2>
            <p className={styles.subtitle}>Powered by <span className={styles.stripeText}>stripe</span> (Simulation)</p>

            <form className={styles.paymentForm} onSubmit={handleSubmit}>
              <div className={styles.inputGroup}>
                <label>Cardholder Name</label>
                <input 
                  type="text" 
                  name="name"
                  placeholder="Jane Doe" 
                  required 
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>
              <div className={styles.inputGroup}>
                <label>Card Number</label>
                <input 
                  type="text" 
                  name="cardNumber"
                  placeholder="4242 4242 4242 4242" 
                  required 
                  maxLength="19"
                  value={formData.cardNumber}
                  onChange={handleInputChange}
                />
              </div>
              <div className={styles.row}>
                <div className={styles.inputGroup}>
                  <label>Expiry Date</label>
                  <input 
                    type="text" 
                    name="expiry"
                    placeholder="MM/YY" 
                    required 
                    maxLength="5"
                    value={formData.expiry}
                    onChange={handleInputChange}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>CVC</label>
                  <input 
                    type="text" 
                    name="cvc"
                    placeholder="123" 
                    required 
                    maxLength="3"
                    value={formData.cvc}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div className={styles.secureInfo}>
                🔒 256-bit SSL Encrypted Simulation
              </div>

              <button type="submit" className={styles.mainBtn}>
                Pay {plan === 'monthly' ? '$9.99' : '$79.99'} & Upgrade
              </button>
            </form>
          </div>
        )}

        {step === 3 && (
          <div className={styles.processingContainer}>
            <div className={styles.spinner}></div>
            <h2 className={styles.title}>Authorizing...</h2>
            <p className={styles.subtitle}>Securing your Premium Scholar access.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;
