import React, { useState } from "react";

function AccountForm({ onSuccess }) {
    const [accountName, setAccountName] = useState("");
    const [accountType, setAccountType] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isValid =
        accountName.trim() !== "" &&
        accountType.trim() !== "";

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isValid) return;

        setIsSubmitting(true);

        try {
            const token = localStorage.getItem("hk_token");

            const payload = {
                account_name: accountName,
                account_type: accountType,
            };

            const res = await fetch("http://localhost:8000/api/accounts", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                throw new Error("Failed to add account");
            }

            const data = await res.json();
            console.log("Account added:", data);

            setAccountName("");
            setAccountType("");
            onSuccess?.();
        } catch (err) {
            console.error("Error creating account:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
                Add New Account
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
                {isSubmitting ? "Creating Account..." : "Create Account"}
            </button>
        </form>
    );
}

export default AccountForm;