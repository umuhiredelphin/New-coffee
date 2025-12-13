import React from 'react';
import { useNavigate } from 'react-router-dom';

// All styles are defined in a JavaScript object
const styles = {
  notFoundContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    textAlign: 'center',
    backgroundColor: '#f8f9fa',
    color: '#333',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    margin: 0,
    padding: '20px',
    boxSizing: 'border-box',
  },
  notFoundContent: {
    maxWidth: '600px',
  },
  notFoundCode: {
    fontSize: '10rem',
    fontWeight: 700,
    color: '#e0e0e0',
    margin: 0,
    lineHeight: 1,
  },
  notFoundIcon: {
    color: '#6c757d',
    margin: '1rem 0',
  },
  notFoundTitle: {
    fontSize: '2.5rem',
    fontWeight: 600,
    margin: '0.5rem 0',
  },
  notFoundMessage: {
    fontSize: '1.1rem',
    color: '#6c757d',
    lineHeight: 1.6,
    marginBottom: '2rem',
  },
  goHomeBtn: {
    display: 'inline-block',
    backgroundColor: '#007bff',
    color: '#ffffff',
    padding: '12px 30px',
    fontSize: '1rem',
    fontWeight: 500,
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'background-color 0.3s ease, transform 0.2s ease',
  },
  goHomeBtnHover: {
    backgroundColor: '#0056b3',
    transform: 'translateY(-2px)',
  },
};

const NotFound = () => {
  const navigate = useNavigate();

  const goHome = () => {
    navigate('/');
  };

  // We use state to handle the hover effect for the button
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <main style={styles.notFoundContainer}>
      <div style={styles.notFoundContent}>
        <h1 style={styles.notFoundCode}>404</h1>
        <div style={styles.notFoundIcon}>
          {/* Simple SVG Icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            width="80px"
            height="80px"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
        </div>
        <h2 style={styles.notFoundTitle}>Oops! Page Not Found</h2>
        <p style={styles.notFoundMessage}>
          The page you're looking for doesn't exist or has been moved.
          Don't worry, it happens to the best of us.
        </p>
        <button
          onClick={goHome}
          style={isHovered ? { ...styles.goHomeBtn, ...styles.goHomeBtnHover } : styles.goHomeBtn}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          Go to Homepage
        </button>
      </div>
    </main>
  );
};

export default NotFound;