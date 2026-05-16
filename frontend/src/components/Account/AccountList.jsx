import React, { useEffect, useState } from "react";
import Modal from "../Modal";

const AccountList = ({ accounts, onDelete }) => {
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
                    <p className="text-sm text-[#201833] font-medium">
                        Rs. {Number(account.balance).toFixed(2)}
                    </p>
                        <button
                        // onClick={() => onEdit(account)}
                        >
                            Edit
                        </button>

                        <button
                        onClick={() => handleDelete(account)}
                        >
                            Delete
                        </button>
                    </div>

                </div>
            ))}
            
            {/* delete popup */}
            {isDeleteModalOpen && (
            <Modal onClose={handleCancelDelete}>
                <div>
                    <h2 className="text-2xl font-bold mb-6 text-gray-800">
                        Delete Account
                    </h2>
                    <p className="text-base font-medium text-[#201833]">Are you sure you want to delete this account?</p>
                    <button className="bg-red-500 text-white px-4 py-2 rounded-lg" onClick={handleConfirmDelete}>Delete</button>
                    <button className="bg-gray-500 text-white px-4 py-2 rounded-lg" onClick={handleCancelDelete}>Cancel</button>
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