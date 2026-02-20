import React, { useState, useEffect } from 'react';
import axios from 'axios';
import useAuth from '../hooks/useAuth';
import { FaFacebook, FaSyncAlt, FaTrash, FaCheckCircle, FaTimesCircle, FaPlus } from 'react-icons/fa';

const Integrations = () => {
    const { user } = useAuth();
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.token) {
            fetchAccounts();
        }

        // Check for success/error from OAuth redirect
        const params = new URLSearchParams(window.location.search);
        if (params.get('success')) {
            alert('Facebook account connected successfully!');
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, [user]);

    const fetchAccounts = async () => {
        try {
            const { data } = await axios.get('/api/social/accounts', {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setAccounts(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching accounts:', error);
            setLoading(false);
        }
    };

    const handleConnectFB = async () => {
        try {
            const { data } = await axios.get('/api/social/facebook/auth-url', {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            window.location.href = data.url;
        } catch (error) {
            alert('Failed to initialize Facebook connection');
        }
    };

    const toggleAccount = async (id) => {
        try {
            await axios.put(`/api/social/accounts/${id}/toggle`, {}, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            fetchAccounts();
        } catch (error) {
            alert('Failed to update account status');
        }
    };

    const disconnectAccount = async (id) => {
        if (!window.confirm('Are you sure you want to disconnect this account?')) return;
        try {
            await axios.delete(`/api/social/accounts/${id}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            fetchAccounts();
        } catch (error) {
            alert('Failed to disconnect account');
        }
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Social Media Integrations</h1>
                    <p className="text-slate-500 mt-1">Manage your Facebook and Instagram account connections</p>
                </div>
                <button
                    onClick={handleConnectFB}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all"
                >
                    <FaPlus /> Connect New Account
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full text-center py-20 text-slate-400">Loading accounts...</div>
                ) : accounts.length === 0 ? (
                    <div className="col-span-full text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                        <FaFacebook className="text-6xl text-slate-200 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-slate-600">No accounts connected</h3>
                        <p className="text-slate-400">Click the button above to link your Facebook pages.</p>
                    </div>
                ) : (
                    accounts.map(acc => (
                        <div key={acc._id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 text-2xl">
                                        <FaFacebook />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800">{acc.accountName}</h3>
                                        <p className="text-xs text-slate-400 uppercase tracking-widest">{acc.platform}</p>
                                    </div>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${acc.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {acc.isActive ? <FaCheckCircle /> : <FaTimesCircle />}
                                    {acc.isActive ? 'ACTIVE' : 'INACTIVE'}
                                </div>
                            </div>

                            <div className="space-y-2 mb-6">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">Page ID:</span>
                                    <span className="text-slate-600 font-mono">{acc.pageId}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">Connected:</span>
                                    <span className="text-slate-600">{new Date(acc.connectedDate).toLocaleDateString()}</span>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-slate-50">
                                <button
                                    onClick={() => toggleAccount(acc._id)}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-semibold transition-colors ${acc.isActive ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-green-600 text-white hover:bg-green-700'}`}
                                >
                                    {acc.isActive ? 'DEACTIVATE' : 'ACTIVATE'}
                                </button>
                                <button
                                    onClick={() => disconnectAccount(acc._id)}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-red-100"
                                    title="Remove Account"
                                >
                                    <FaTrash />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Integrations;
