import React, { useEffect, useState } from "react";
import Modal from "../Modal";

const AccountList = ({ accounts, onDelete, onEdit }) => {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState(null);

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
                    className="p-4 rounded-lg border-2 border-[#9B8BB8] flex justify-between items-center my-4"
                >
                    {/* account name */}
                    <h4 className="text-base font-semibold text-[#201833]">
                        {account.account_name}
                    </h4>

                    <div className="flex gap-2 items-center justify-between">
                        {/* balance */}
                        <p className="text-sm text-[#201833] font-medium mr-4">
                            Rs. {Number(account.balance).toFixed(2)}
                        </p>
                        <button
                            onClick={() => onEdit(account)}
                            className="text-indigo-600 hover:text-indigo-800 font-medium px-2 py-1 bg-indigo-50 rounded transition-colors"
                        >
                            Edit
                        </button>

                        <button
                            onClick={() => handleDelete(account)}
                            className="text-red-500 hover:text-red-700 font-medium px-2 py-1 bg-red-50 rounded transition-colors"
                        >
                            Delete
                        </button>
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