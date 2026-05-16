import React, { useState, useEffect } from "react";

function EntryForm({ entry, onSubmit, isSubmitting }) {
    const [entryDate, setEntryDate] = useState(entry?.entry_date || new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState(entry?.description || "");
    const [amount, setAmount] = useState(entry?.amount || "");
    const [error, setError] = useState(null);

    useEffect(() => {
        if (entry) {
            setEntryDate(entry.entry_date);
            setDescription(entry.description || "");
            setAmount(entry.amount);
        } else {
            setEntryDate(new Date().toISOString().split('T')[0]);
            setDescription("");
            setAmount("");
        }
    }, [entry]);

    const isEditMode = !!entry;
    const isValid = entryDate && amount && Number(amount) > 0;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isValid) return;

        setError(null);
        try {
            const payload = {
                entry_date: entryDate,
                description: description || null,
                amount: Number(amount),
            };
            await onSubmit(payload);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
                {isEditMode ? "Edit Entry" : "Add New Entry"}
            </h2>

            {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                    {error}
                </div>
            )}

            <div className="mb-4">
                <label className="block mb-2 text-sm font-medium text-gray-700">
                    Date
                </label>
                <input
                    type="date"
                    value={entryDate}
                    onChange={(e) => setEntryDate(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-colors"
                    required
                />
            </div>

            <div className="mb-4">
                <label className="block mb-2 text-sm font-medium text-gray-700">
                    Description (Optional)
                </label>
                <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-colors"
                    placeholder="e.g., Sold items, Paid rent"
                />
            </div>

            <div className="mb-6">
                <label className="block mb-2 text-sm font-medium text-gray-700">
                    Amount (Rs.)
                </label>
                <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-colors"
                    placeholder="e.g., 1500"
                    required
                />
            </div>

            <button
                type="submit"
                disabled={!isValid || isSubmitting}
                className="w-full bg-linear-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-md transition-all disabled:opacity-50"
            >
                {isSubmitting ? (isEditMode ? "Updating..." : "Saving...") : (isEditMode ? "Update Entry" : "Save Entry")}
            </button>
        </form>
    );
}

export default EntryForm;
