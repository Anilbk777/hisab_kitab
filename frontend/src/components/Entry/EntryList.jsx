import React, { useState } from "react";
import Modal from "../Modal";

function EntryList({ entries, onEdit, onDelete, page, setPage, total, limit }) {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState(null);

    const handleDelete = (entry) => {
        setSelectedEntry(entry);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = () => {
        onDelete(selectedEntry.id);
        setIsDeleteModalOpen(false);
    };

    const handleCancelDelete = () => {
        setIsDeleteModalOpen(false);
    };

    const totalPages = Math.ceil((total || 0) / limit);

    return (
        <div>
            {entries.length === 0 ? (
                <div className="text-center text-gray-500 py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <p className="text-lg font-medium text-gray-600 mb-2">No entries found.</p>
                    <p className="text-sm">Click "+ Add Entry" to record your first transaction.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {entries.map((entry) => (
                        <div
                            key={entry.id}
                            className="p-4 rounded-lg border border-blue-600/10 flex flex-col md:flex-row justify-between items-start md:items-center bg-white shadow-sm hover:shadow-md transition-all"
                        >
                            <div className="flex-1 mb-3 md:mb-0">
                                <div className="flex items-center gap-3 mb-1.5">
                                    <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-md tracking-wide">
                                        {entry.entry_date}
                                    </span>
                                </div>
                                <p className="text-[#1C1433] font-medium text-base">
                                    {entry.description || <span className="italic text-gray-400 font-normal">No description provided</span>}
                                </p>
                            </div>

                            <div className="flex items-center gap-6 mt-2 md:mt-0 w-full md:w-auto justify-between md:justify-end">
                                <p className="text-lg font-bold text-[#1C1433]">
                                    Rs. {Number(entry.amount).toFixed(2)}
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => onEdit(entry)}
                                        className="text-indigo-600 hover:text-indigo-800 font-medium px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors text-sm"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(entry)}
                                        className="text-red-500 hover:text-red-700 font-medium px-3 py-1.5 bg-red-50 hover:bg-red-100 rounded-md transition-colors text-sm"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex justify-between items-center mt-8 pt-4 border-t border-gray-100">
                    <button
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                        className="px-5 py-2.5 border border-gray-200 rounded-lg text-[#4A4065] font-medium hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent transition-all"
                    >
                        Previous
                    </button>
                    <span className="text-sm font-medium text-[#7B6F96]">
                        Page {page} of {totalPages}
                    </span>
                    <button
                        onClick={() => setPage(page + 1)}
                        disabled={page === totalPages}
                        className="px-5 py-2.5 border border-gray-200 rounded-lg text-[#4A4065] font-medium hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent transition-all"
                    >
                        Next
                    </button>
                </div>
            )}

            {/* delete popup */}
            {isDeleteModalOpen && (
                <Modal onClose={handleCancelDelete}>
                    <div className="p-2">
                        <h2 className="text-2xl font-bold mb-4 text-gray-800">
                            Delete Entry
                        </h2>
                        <p className="text-base text-gray-600 mb-6">Are you sure you want to delete this entry? This action cannot be undone.</p>
                        <div className="flex justify-end gap-3">
                            <button className="bg-gray-200 text-gray-800 px-5 py-2.5 rounded-lg font-medium hover:bg-gray-300 transition-colors" onClick={handleCancelDelete}>Cancel</button>
                            <button className="bg-red-500 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-red-600 shadow-sm hover:shadow transition-all" onClick={handleConfirmDelete}>Delete</button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}

export default EntryList;
