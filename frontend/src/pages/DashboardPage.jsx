import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchWithAuth } from '../utils/api';
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
  const token = localStorage.getItem("hk_token");
  const [accounts, setAccounts] = useState([]);
  const [editingAccount, setEditingAccount] = useState(null);
  const [accountError, setAccountError] = useState(null);
  const [activeTab, setActiveTab] = useState('income');

  // Helpers to get current month date range bounds in YYYY-MM-DD format
  const getFirstDayOfMonth = () => {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
  };

  const getLastDayOfMonth = () => {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];
  };

  const [fromDate, setFromDate] = useState(getFirstDayOfMonth());
  const [toDate, setToDate] = useState(getLastDayOfMonth());

  const fetchUser = useCallback(async (from = fromDate, to = toDate) => {
    const token = localStorage.getItem('hk_token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const url = `/api/auth/me?from_date=${from}&to_date=${to}`;
      const res = await fetchWithAuth(url);

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
  }, [navigate]);

  useEffect(() => {
    fetchUser(getFirstDayOfMonth(), getLastDayOfMonth());
  }, [fetchUser]);

  const handleLogout = () => {
    localStorage.removeItem('hk_token');
    navigate('/login');
  };

  const fetchAccounts = useCallback(async (from = fromDate, to = toDate) => {
    try {
      const url = `http://127.0.0.1:8000/api/accounts/?from_date=${from}&to_date=${to}`;
      const res = await fetchWithAuth(url);

      if (!res.ok) {
        throw new Error("Failed to fetch accounts");
      }

      const data = await res.json();
      setAccounts(data);
    } catch (err) {
      console.error("Error fetching accounts:", err);
    }
    finally {
      setAccountsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts(getFirstDayOfMonth(), getLastDayOfMonth());
  }, [fetchAccounts]);

  const handleDeleteAccount = async (id) => {
    try {
      const res = await fetchWithAuth(`http://127.0.0.1:8000/api/accounts/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete account");
      }

      fetchAccounts(fromDate, toDate);
      fetchUser(fromDate, toDate);
    } catch (err) {
      console.error("Error deleting account:", err);
    }
  };

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

  const filteredAccounts = accounts?.accounts?.filter(acc => acc.account_type === activeTab) || [];

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
          {/* date range search */}
          <div className="flex flex-col md:flex-row md:items-center gap-3 my-4 p-4 bg-white/75 backdrop-blur-md border border-gray-100 rounded-2xl shadow-sm">
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-sm font-semibold text-gray-500 whitespace-nowrap min-w-[45px]">From:</span>
                <input 
                  type="date" 
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="p-2.5 border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200/50 rounded-xl w-full sm:w-44 text-sm text-[#1C1433] font-medium outline-none transition-all shadow-inner" 
                />
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-sm font-semibold text-gray-500 whitespace-nowrap min-w-[45px]">To:</span>
                <input 
                  type="date" 
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="p-2.5 border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200/50 rounded-xl w-full sm:w-44 text-sm text-[#1C1433] font-medium outline-none transition-all shadow-inner" 
                />
              </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto md:ml-auto">
              <button 
                onClick={() => {
                  fetchUser(fromDate, toDate);
                  fetchAccounts(fromDate, toDate);
                }}
                className="flex-1 md:flex-initial bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-6 py-2.5 rounded-xl hover:cursor-pointer transition-all shadow-sm hover:shadow-md active:scale-95"
              >
                Search
              </button>
              <button 
                onClick={() => {
                  const defaultFrom = getFirstDayOfMonth();
                  const defaultTo = getLastDayOfMonth();
                  setFromDate(defaultFrom);
                  setToDate(defaultTo);
                  fetchUser(defaultFrom, defaultTo);
                  fetchAccounts(defaultFrom, defaultTo);
                }}
                className="flex-1 md:flex-initial bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm px-6 py-2.5 rounded-xl hover:cursor-pointer transition-all shadow-sm active:scale-95"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 min-h-[10px]" >
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
              <div style={styles.amount}>Rs. {user?.total_income}</div>
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
              <div style={styles.amount}>Rs. {user?.total_expense}</div>
              <p style={styles.cardSubtitle}>This month</p>
            </div>
          </div>

          {/* Recent Transactions Placeholder */}
          <div style={{ ...styles.card, marginTop: '24px' }}>
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full md:w-auto">
                <h3 style={{ ...styles.cardTitle }} className="text-xl md:text-lg font-bold">Accounts</h3>
                <div className="flex bg-gray-100 rounded-lg p-1 w-full sm:w-auto justify-center">
                  <button
                    onClick={() => setActiveTab('income')}
                    className={`flex-1 sm:flex-initial px-4 py-1.5 text-sm font-medium rounded-md transition-all cursor-pointer ${activeTab === 'income' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    Income
                  </button>
                  <button
                    onClick={() => setActiveTab('expense')}
                    className={`flex-1 sm:flex-initial px-4 py-1.5 text-sm font-medium rounded-md transition-all cursor-pointer ${activeTab === 'expense' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    Expense
                  </button>
                </div>
              </div>
              <button 
                style={styles.addBtn} 
                className="w-full md:w-auto text-center py-2.5 px-5 active:scale-95 transition-transform" 
                onClick={() => { setEditingAccount(null); setIsModalOpen(true); }}
              >
                + Add Account
              </button>
              {isModalOpen && (
                <Modal onClose={() => { setIsModalOpen(false); setEditingAccount(null); }}>
                  <AccountForm
                    account={editingAccount}
                    onSuccess={() => {
                      setIsModalOpen(false);
                      setEditingAccount(null);
                      fetchAccounts(fromDate, toDate);
                      fetchUser(fromDate, toDate);
                    }}
                    onError={(msg) => {
                      setIsModalOpen(false);
                      setAccountError(msg);
                    }}
                  />
                </Modal>
              )}
            </div>

            {accountsLoading ? (
              <div className="flex justify-center items-center h-32">
                <p className="text-gray-500">Loading accounts...</p>
              </div>
            ) : filteredAccounts.length === 0 ? (
              <div className="flex justify-center items-center h-32">
                <p className="text-gray-500">No {activeTab} accounts added yet.</p>
              </div>
            ) : (
              <AccountList accounts={filteredAccounts} onDelete={handleDeleteAccount} onEdit={(account) => {
                setEditingAccount(account);
                setIsModalOpen(true);
              }} />
            )}


            {accountError && (
              <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-60 p-4">
                <div className="bg-white p-6 rounded-xl shadow-2xl max-w-sm w-full animate-in fade-in zoom-in duration-200">
                  <h3 className="text-xl font-bold mb-3 text-red-600 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Error
                  </h3>
                  <p className="text-gray-700 mb-6">{accountError}</p>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setAccountError(null);
                        // Optionally reopen the modal when error is closed:
                        // setIsModalOpen(true);
                      }}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium px-5 py-2 rounded-lg transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
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
    fontSize: '24px',
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
