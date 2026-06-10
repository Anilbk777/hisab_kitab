import { useState, useEffect, useCallback } from 'react';
import { fetchWithAuth } from '../utils/api';

export function useAccountEntries(accountId) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const limit = 10;

    const fetchAccountData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const skip = (page - 1) * limit;
            const res = await fetchWithAuth(`/api/entries/account/${accountId}?skip=${skip}&limit=${limit}`);
            if (!res.ok) throw new Error('Failed to fetch account details');
            const result = await res.json();
            setData(result);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [accountId, page]);

    useEffect(() => {
        fetchAccountData();
    }, [fetchAccountData]);

    const createEntry = async (payload) => {
        const res = await fetchWithAuth(`/api/entries/`, {
            method: 'POST',
            body: JSON.stringify({ ...payload, account_id: Number(accountId) })
        });
        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            let errMsg = 'Failed to create entry';
            if (errData.message) {
                errMsg = errData.message;
            } else if (typeof errData.detail === 'string') {
                errMsg = errData.detail;
            } else if (Array.isArray(errData.detail)) {
                errMsg = errData.detail.map(e => e.msg).join(', ');
            }
            throw new Error(errMsg);
        }
        await fetchAccountData();
    };

    const updateEntry = async (entryId, payload) => {
        const res = await fetchWithAuth(`/api/entries/${entryId}`, {
            method: 'PATCH',
            body: JSON.stringify(payload)
        });
        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            let errMsg = 'Failed to update entry';
            if (errData.message) {
                errMsg = errData.message;
            } else if (typeof errData.detail === 'string') {
                errMsg = errData.detail;
            } else if (Array.isArray(errData.detail)) {
                errMsg = errData.detail.map(e => e.msg).join(', ');
            }
            throw new Error(errMsg);
        }
        await fetchAccountData();
    };

    const deleteEntry = async (entryId) => {
        const res = await fetchWithAuth(`/api/entries/${entryId}`, {
            method: 'DELETE'
        });
        if (!res.ok) throw new Error('Failed to delete entry');
        await fetchAccountData();
    };

    return { data, loading, error, page, setPage, limit, createEntry, updateEntry, deleteEntry, refresh: fetchAccountData };
}
