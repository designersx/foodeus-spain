import React, { useState, useEffect } from 'react';
import styles from '../css/PopUp.module.css'
interface PopUpProps {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  onClose: () => void;
  onConfirm?: () => void;
}

const PopUp: React.FC<PopUpProps> = ({ type, message, onClose, onConfirm }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (message) setShow(true);
  }, [message]);

  const handleClose = () => {
    setShow(false);
    setTimeout(() => onClose(), 300);
  };

  const getIconPath = () => {
    switch (type) {
      case "success":
        return "svg/sucess-icon.svg";
      case "error":
        return "svg/failed-icon.svg";
      case "info":
        return "svg/confirmation-icon.svg";
      default:
        return "";
    }
  };

  return (
    message ? (
      <div className={`${styles.overlay} ${show ? styles.fadeIn : styles.fadeOut}`}>
        <div className={`${styles.popup} ${styles[type]} ${show ? styles.scaleIn : styles.scaleOut}`}>
          <img src={getIconPath()} alt={type} className={`${styles.icon} ${styles.animateIcon}`} />
          <p className={styles.message}>{message}</p>

          {type === "info" ? (
            <div className={styles.buttons}>
              <button className={styles.cancel} onClick={handleClose}>Cancel</button>
              <button className={styles.confirmBtn} onClick={() => {
                onConfirm?.();
                handleClose();
              }}>Confirm</button>
            </div>
          ) : (
            <button className={styles.close} onClick={handleClose}>Close</button>
          )}
        </div>
      </div>
    ) : null
  );
};

export default PopUp;
