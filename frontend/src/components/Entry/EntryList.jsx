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
                            className="p-4 rounded-xl border border-blue-600/10 flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white shadow-sm hover:shadow-md transition-all gap-3"
                        >
                            {/* Entry Info: Date, Description & Mobile Amount */}
                            <div className="flex-1 w-full">
                                <div className="flex justify-between items-start w-full gap-3 mb-2.5">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-md tracking-wide">
                                            {entry.entry_date}
                                        </span>
                                    </div>
                                    <p className="sm:hidden text-lg font-bold text-[#1C1433] whitespace-nowrap">
                                        Rs. {Number(entry.amount).toFixed(2)}
                                    </p>
                                </div>
                                <p className="text-[#1C1433] font-medium text-base wrap-break-word">
                                    {entry.description || <span className="italic text-gray-400 font-normal">No description provided</span>}
                                </p>
                            </div>

                            {/* Desktop Amount & Actions */}
                            <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto border-t border-gray-100 pt-3 sm:border-0 sm:pt-0">
                                <p className="hidden sm:block text-lg font-bold text-[#1C1433] mr-4 whitespace-nowrap">
                                    Rs. {Number(entry.amount).toFixed(2)}
                                </p>
                                <div className="flex justify-between sm:justify-start gap-2 w-full sm:w-auto">
                                    <button
                                        onClick={() => onEdit(entry)}
                                        className="flex-1 sm:flex-initial text-center text-indigo-600 hover:text-indigo-800 font-medium px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors text-sm sm:w-auto w-full"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(entry)}
                                        className="flex-1 sm:flex-initial text-center text-red-500 hover:text-red-700 font-medium px-3 py-1.5 bg-red-50 hover:bg-red-100 rounded-lg transition-colors text-sm sm:w-auto w-full"
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
