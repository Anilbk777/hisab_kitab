import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAccountEntries } from '../hooks/useAccountEntries';
import HisabKitabLogo from '../components/HisabKitabLogo';
import Modal from '../components/Modal';
import EntryForm from '../components/Entry/EntryForm';
import EntryList from '../components/Entry/EntryList';

const AccountDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { 
        data, loading, error, page, setPage, limit, 
        createEntry, updateEntry, deleteEntry 
    } = useAccountEntries(id);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEntry, setEditingEntry] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleOpenCreate = () => {
        setEditingEntry(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (entry) => {
        setEditingEntry(entry);
        setIsModalOpen(true);
    };

    const handleFormSubmit = async (payload) => {
        setIsSubmitting(true);
        try {
            if (editingEntry) {
                await updateEntry(editingEntry.id, payload);
            } else {
                await createEntry(payload);
            }
            setIsModalOpen(false);
            setEditingEntry(null);
        } catch (err) {
            console.error(err);
            // Error handling inside form or just leave it
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading && !data) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#FDF8F2] via-[#F7F0FC] to-[#FDF4F8] flex items-center justify-center font-['Inter',_sans-serif]">
                <div className="text-[#2563EB] font-medium animate-pulse text-lg">Loading account details...</div>
            </div>
        );
    }

    if (error && !data) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#FDF8F2] via-[#F7F0FC] to-[#FDF4F8] flex flex-col items-center justify-center gap-6 font-['Inter',_sans-serif]">
                <div className="p-6 bg-white rounded-2xl shadow-sm border border-red-100 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Oops! Something went wrong.</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button onClick={() => navigate('/dashboard')} className="w-full px-4 py-3 bg-indigo-600 text-white rounded-xl font-semibold shadow-md hover:bg-indigo-700 transition-all">Back to Dashboard</button>
                </div>
            </div>
        );
    }

    const { account, balance, entries, pagination } = data;
    const isIncome = account.account_type === 'income';

    return (
        <div className="min-h-screen relative overflow-hidden font-['Inter',_sans-serif] bg-gradient-to-br from-[#FDF8F2] via-[#F7F0FC] to-[#FDF4F8]">
            {/* Background Blobs (same as dashboard) */}
            <div className="absolute top-[-160px] right-[-160px] w-[480px] h-[480px] rounded-full bg-[radial-gradient(circle,rgba(37,99,235,0.08)_0%,transparent_65%)] pointer-events-none" />
            <div className="absolute bottom-[-160px] left-[-120px] w-[420px] h-[420px] rounded-full bg-[radial-gradient(circle,rgba(29,78,216,0.08)_0%,transparent_65%)] pointer-events-none" />

            <div className="relative z-10 max-w-[1200px] mx-auto px-6 min-h-screen flex flex-col">
                <header className="flex justify-between items-center py-6 border-b border-blue-600/10">
                    <HisabKitabLogo size="sm" showTag={false} theme="light" />
                    <button 
                        onClick={() => navigate('/dashboard')} 
                        className="px-5 py-2.5 border border-[#E2DAF0] bg-white rounded-lg text-[#4A4065] text-sm font-semibold cursor-pointer hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                    >
                        &larr; Back to Dashboard
                    </button>
                </header>

                <main className="py-8 flex-1">
                    {/* Account Summary Card */}
                    <div className={`bg-white border border-blue-600/10 rounded-2xl p-8 shadow-sm mb-8 border-t-4 ${isIncome ? 'border-t-green-500' : 'border-t-red-500'}`}>
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h2 className="text-3xl font-bold text-[#1C1433] capitalize">{account.account_name}</h2>
                                    <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${isIncome ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {account.account_type}
                                    </span>
                                </div>
                                <p className="text-[#7B6F96] text-sm font-medium">Total Account Balance</p>
                            </div>
                            <div className="text-5xl font-bold text-[#1C1433] tracking-tight">
                                Rs. {Number(balance).toFixed(2)}
                            </div>
                        </div>
                    </div>

                    {/* Entries Section */}
                    <div className="bg-white border border-blue-600/10 rounded-2xl p-8 shadow-sm">
                        <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100">
                            <div>
                                <h3 className="text-2xl font-bold text-[#1C1433] mb-1">Transaction Entries</h3>
                                <p className="text-sm text-[#7B6F96]">Manage all entries for {account.account_name}</p>
                            </div>
                            <button 
                                onClick={handleOpenCreate}
                                className="px-6 py-3 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-700 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Add Entry
                            </button>
                        </div>

                        {loading && data ? (
                            <div className="py-12 flex justify-center items-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                            </div>
                        ) : (
                            <EntryList 
                                entries={entries} 
                                onEdit={handleOpenEdit} 
                                onDelete={deleteEntry}
                                page={page}
                                setPage={setPage}
                                total={pagination?.total}
                                limit={limit}
                            />
                        )}
                    </div>
                </main>
            </div>

            {isModalOpen && (
                <Modal onClose={() => setIsModalOpen(false)}>
                    <EntryForm 
                        entry={editingEntry} 
                        onSubmit={handleFormSubmit} 
                        isSubmitting={isSubmitting} 
                    />
                </Modal>
            )}
        </div>
    );
};

export default AccountDetailPage;
