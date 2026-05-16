import { useState, useEffect, useCallback } from 'react';

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
            const token = localStorage.getItem('hk_token');
            const skip = (page - 1) * limit;
            const res = await fetch(`http://127.0.0.1:8000/api/entries/account/${accountId}?skip=${skip}&limit=${limit}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
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
        const token = localStorage.getItem('hk_token');
        const res = await fetch(`http://127.0.0.1:8000/api/entries/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ ...payload, account_id: Number(accountId) })
        });
        if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.detail || 'Failed to create entry');
        }
        await fetchAccountData();
    };

    const updateEntry = async (entryId, payload) => {
        const token = localStorage.getItem('hk_token');
        const res = await fetch(`http://127.0.0.1:8000/api/entries/${entryId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(payload)
        });
        if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.detail || 'Failed to update entry');
        }
        await fetchAccountData();
    };

    const deleteEntry = async (entryId) => {
        const token = localStorage.getItem('hk_token');
        const res = await fetch(`http://127.0.0.1:8000/api/entries/${entryId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to delete entry');
        await fetchAccountData();
    };

    return { data, loading, error, page, setPage, limit, createEntry, updateEntry, deleteEntry, refresh: fetchAccountData };
}
