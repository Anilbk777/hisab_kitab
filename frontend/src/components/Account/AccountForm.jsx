import React, { useState, useEffect } from "react";
import { fetchWithAuth } from "../../utils/api";

function AccountForm({ account, onSuccess, onError }) {
    // add edit feature 
    const [accountName, setAccountName] = useState(account?.account_name || "");
    const [accountType, setAccountType] = useState(account?.account_type || "");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (account) {
            setAccountName(account.account_name || "");
            setAccountType(account.account_type || "");
        } else {
            setAccountName("");
            setAccountType("");
        }
    }, [account]);

    const isEditMode = !!account;

    const isValid =
        (accountName || "").trim() !== "" &&
        (accountType || "").trim() !== "";

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isValid) return;

        setIsSubmitting(true);

        try {
            const payload = {
                account_name: accountName,
                account_type: accountType,
            };
            const url = account
                ? `http://localhost:8000/api/accounts/${account.id}`
                : "http://localhost:8000/api/accounts";

            const method = account ? "PATCH" : "POST";

            const res = await fetchWithAuth(url, {
                method: method,
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                let errorMessage = isEditMode ? "Failed to update account" : "Failed to create account";
                
                if (errorData.message) {
                    errorMessage = errorData.message;
                } else if (typeof errorData.detail === 'string') {
                    errorMessage = errorData.detail;
                } else if (Array.isArray(errorData.detail)) {
                    errorMessage = errorData.detail.map(e => e.msg).join(", ");
                }

                throw new Error(errorMessage);
            }

            const data = await res.json();
            console.log(isEditMode ? "Account updated:" : "Account added:", data);

            setAccountName("");
            setAccountType("");
            onSuccess?.();
        } catch (err) {
            console.error(isEditMode ? "Error updating account:" : "Error creating account:", err);
            if (onError) {
                onError(err.message);
            } else {
                alert(err.message);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
                {isEditMode ? "Edit Account" : "Add New Account"}
            </h2>

            <div className="mb-4">
                <label className="block mb-2 text-sm font-medium text-gray-700">
                    Account Name
                </label>

                <input
                    type="text"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-colors"
                    placeholder="e.g., Salary, Rent"
                />
            </div>

            <div className="mb-6">
                <label className="block mb-2 text-sm font-medium text-gray-700">
                    Account Type
                </label>

                <select
                    value={accountType}
                    onChange={(e) => setAccountType(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                    <option value="">Select type...</option>
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                </select>


            </div>

            <button
                type="submit"
                disabled={!isValid || isSubmitting}
                className="w-full bg-linear-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-md transition-all"
            >
                {isSubmitting ? (isEditMode ? "Updating Account..." : "Creating Account...") : (isEditMode ? "Update Account" : "Create Account")}
            </button>
        </form>
    );
}

export default AccountForm;