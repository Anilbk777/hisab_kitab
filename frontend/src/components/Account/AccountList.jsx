import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "../Modal";

const AccountList = ({ accounts, onDelete, onEdit }) => {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const navigate = useNavigate();

    const handleDelete = (account) => {
        setSelectedAccount(account);
        setIsDeleteModalOpen(true);
    };
    const handleConfirmDelete = () => {
        onDelete(selectedAccount.id);
        setIsDeleteModalOpen(false);
    };
    const handleCancelDelete = () => {
        setIsDeleteModalOpen(false);
    };
    return (
        <div>

            {accounts.map((account) => (
                <div
                    key={account.id}
                    onClick={() => navigate(`/accounts/${account.id}/entries`)}
                    className="p-4 sm:p-5 rounded-xl border-2 border-[#E2DAF0] flex flex-col sm:flex-row sm:justify-between sm:items-center my-4 cursor-pointer hover:bg-[#FDF8F2] hover:border-indigo-200 transition-all shadow-sm hover:shadow gap-3"
                >
                    {/* Account Info: Name & Mobile Balance */}
                    <div className="flex justify-between items-center w-full sm:w-auto">
                        <h4 className="text-base font-semibold text-[#201833] break-all mr-2">
                            {account.account_name} 
                        </h4>
                        <p className="sm:hidden text-sm text-[#201833] font-semibold whitespace-nowrap">
                            Rs. {Number(account.balance).toFixed(2)}
                        </p>
                    </div>

                    {/* Desktop Balance & Actions */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto border-t border-gray-100 pt-3 sm:border-0 sm:pt-0">
                        <p className="hidden sm:block text-sm text-[#201833] font-medium mr-4">
                            Rs. {Number(account.balance).toFixed(2)}
                        </p>
                        <div className="flex gap-2 w-full sm:w-auto justify-end">
                            <button
                                onClick={(e) => { e.stopPropagation(); onEdit(account); }}
                                className="flex-1 sm:flex-initial text-center text-indigo-600 hover:text-indigo-800 font-medium px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors shadow-sm text-sm"
                            >
                                Edit
                            </button>

                            <button
                                onClick={(e) => { e.stopPropagation(); handleDelete(account); }}
                                className="flex-1 sm:flex-initial text-center text-red-500 hover:text-red-700 font-medium px-3 py-1.5 bg-red-50 hover:bg-red-100 rounded-lg transition-colors shadow-sm text-sm"
                            >
                                Delete
                            </button>
                        </div>
                    </div>

                </div>
            ))}

            {/* delete popup */}
            {isDeleteModalOpen && (
                <Modal onClose={handleCancelDelete}>
                    <div className="p-2">
                        <h2 className="text-2xl font-bold mb-4 text-gray-800">
                            Delete Account
                        </h2>
                        <p className="text-base text-gray-600 mb-6">Are you sure you want to delete this account?</p>
                        <div className="flex justify-end gap-3">
                            <button className="bg-gray-200 text-gray-800 px-5 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors" onClick={handleCancelDelete}>Cancel</button>
                            <button className="bg-red-500 text-white px-5 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors" onClick={handleConfirmDelete}>Delete</button>
                        </div>
                    </div>
                </Modal>
            )}

        </div>
    );
};

const styles = {
    emptyState: {
        padding: '40px 0',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
    }
}
export default AccountList;