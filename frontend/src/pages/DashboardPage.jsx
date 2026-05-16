import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HisabKitabLogo from '../components/HisabKitabLogo';
import Modal from '../components/Modal';
import AccountForm from '../components/Account/AccountForm';
import AccountList from '../components/Account/AccountList';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [accountsLoading, setAccountsLoading] = useState(true);


  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('hk_token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!res.ok) {
          throw new Error('Session expired. Please log in again.');
        }

        let data;
        try {
          data = await res.json();
        } catch (e) {
          throw new Error('Invalid response from server.');
        }

        setUser(data);
      } catch (err) {
        const msg = err.message === 'Failed to fetch'
          ? 'Unable to connect to server. Please check backend.'
          : err.message;
        setError(msg);
        localStorage.removeItem('hk_token');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('hk_token');
    navigate('/login');
  };

  const [accounts, setAccounts] = useState([]);
  const fetchAccounts = async () => {
    try {
      const token = localStorage.getItem("hk_token");

      const res = await fetch("http://127.0.0.1:8000/api/accounts/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch accounts");
      }

      const data = await res.json();
      console.log(data);
      setAccounts(data);
    } catch (err) {
      console.error("Error fetching accounts:", err);
    }
    finally {
      setAccountsLoading(false);
    }
  };
  useEffect(() => {
    fetchAccounts();
  }, []);

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={{ color: '#2563EB', fontFamily: "'Inter', sans-serif", display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          Loading your dashboard...
        </div>
      </div>
    );
  }

  if (error) {
    return null; // Will redirect via useEffect
  }

  return (
    <div style={styles.page}>
      <div style={styles.blobTR} />
      <div style={styles.blobBL} />

      <div style={styles.container}>
        {/* Header */}
        <header style={styles.header}>
          <HisabKitabLogo size="sm" showTag={false} theme="light" />

          <div className="flex items-center gap-4">
            <div style={styles.userInfo}>
              <span style={styles.welcomeText}>Welcome back,</span>
              <span style={styles.userName}>{user?.user_name || 'User'}</span>
            </div>
            <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
          </div>
        </header>

        {/* Dashboard Content */}
        <main style={styles.main}>
          <h2 style={styles.sectionTitle}>Overview</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            {/* Income Card */}
            <div style={{ ...styles.card, ...styles.incomeCard }}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>Total Income</h3>
                <div style={{ ...styles.iconWrapper, background: 'rgba(34, 197, 94, 0.1)' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="19" x2="12" y2="5"></line>
                    <polyline points="5 12 12 5 19 12"></polyline>
                  </svg>
                </div>
              </div>
              <div style={styles.amount}>Rs. 0.00</div>
              <p style={styles.cardSubtitle}>This month</p>
            </div>

            {/* Expense Card */}
            <div style={{ ...styles.card, ...styles.expenseCard }}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>Total Expense</h3>
                <div style={{ ...styles.iconWrapper, background: 'rgba(239, 68, 68, 0.1)' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <polyline points="19 12 12 19 5 12"></polyline>
                  </svg>
                </div>
              </div>
              <div style={styles.amount}>Rs. 0.00</div>
              <p style={styles.cardSubtitle}>This month</p>
            </div>
          </div>

          {/* Recent Transactions Placeholder */}
          <div style={{ ...styles.card, marginTop: '24px' }}>
            <div className='flex justify-between items-center'>
              <h3 style={{ ...styles.cardTitle, marginBottom: '16px' }}>Accounts</h3>
              <button style={styles.addBtn} onClick={() => setIsModalOpen(true)}>+ Add Account</button>
              {isModalOpen && (
                <Modal onClose={() => setIsModalOpen(false)}>
                  <AccountForm
                    onSuccess={() => {
                      setIsModalOpen(false);
                      fetchAccounts();
                    }}
                  />
                </Modal>
              )}
            </div>

            {accountsLoading ? (
              <div className="flex justify-center items-center h-32">
                <p className="text-gray-500">Loading accounts...</p>
              </div>
            ) : !accounts || accounts.length === 0 ? (
              <div className="flex justify-center items-center h-32">
                <p className="text-gray-500">No accounts added yet.</p>
              </div>
            ) : (
              <AccountList accounts={accounts} />
            )}


          </div>
        </main>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(145deg, #FDF8F2 0%, #F7F0FC 50%, #FDF4F8 100%)',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: "'Inter', sans-serif",
  },
  blobTR: {
    position: 'absolute',
    top: '-160px',
    right: '-160px',
    width: '480px',
    height: '480px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 65%)',
    pointerEvents: 'none',
  },
  blobBL: {
    position: 'absolute',
    bottom: '-160px',
    left: '-120px',
    width: '420px',
    height: '420px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(29, 78, 216, 0.08) 0%, transparent 65%)',
    pointerEvents: 'none',
  },
  container: {
    position: 'relative',
    zIndex: 1,
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 24px',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 0',
    borderBottom: '1px solid rgba(37,99,235,0.08)',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  welcomeText: {
    fontSize: '12px',
    color: '#7B6F96',
    fontWeight: 500,
  },
  userName: {
    fontSize: '15px',
    color: '#1C1433',
    fontWeight: 700,
  },
  logoutBtn: {
    padding: '8px 16px',
    border: '1px solid #E2DAF0',
    background: '#FFFFFF',
    borderRadius: '8px',
    color: '#4A4065',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  main: {
    padding: '32px 0',
    flex: 1,
  },
  sectionTitle: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#1C1433',
    letterSpacing: '-0.02em',
    marginBottom: '8px',
  },
  card: {
    background: '#FFFFFF',
    border: '1px solid rgba(37,99,235,0.08)',
    borderRadius: '20px',
    padding: '24px',
    boxShadow: '0 4px 40px rgba(37,99,235,0.04), 0 1px 4px rgba(0,0,0,0.02)',
  },
  incomeCard: {
    borderTop: '4px solid #22C55E',
  },
  expenseCard: {
    borderTop: '4px solid #EF4444',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#4A4065',
    margin: 0,
  },
  iconWrapper: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  amount: {
    fontSize: '32px',
    fontWeight: 700,
    color: '#1C1433',
    letterSpacing: '-0.02em',
    marginBottom: '4px',
  },
  cardSubtitle: {
    fontSize: '13px',
    color: '#9B8BB8',
    margin: 0,
  },

  addBtn: {
    padding: '10px 20px',
    border: 'none',
    background: 'linear-gradient(90deg, #60A5FA 0%, #3B82F6 50%, #1D4ED8 100%)',
    color: '#FFFFFF',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(59, 130, 246, 0.25)',
  }
};

export default DashboardPage;
