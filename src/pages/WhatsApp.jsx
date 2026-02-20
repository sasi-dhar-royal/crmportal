import { useState, useEffect } from 'react';
import axios from '../utils/axiosConfig';
import useAuth from '../hooks/useAuth';
import { Link } from 'react-router-dom';

const WhatsApp = () => {
    const [message, setMessage] = useState('');
    const [phone, setPhone] = useState('');
    const { user } = useAuth();
    const [sending, setSending] = useState(false);
    const [isConnected, setIsConnected] = useState(null); // null = loading, false, true
    const [templates, setTemplates] = useState([]);

    useEffect(() => {
        checkStatus();
        fetchTemplates();
    }, []);

    const checkStatus = async () => {
        try {
            const { data } = await axios.get('/api/messages/status', {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setIsConnected(data.status === 'connected');
        } catch (error) {
            console.error('Failed to check status', error);
            setIsConnected(false);
        }
    };

    const fetchTemplates = async () => {
        try {
            const { data } = await axios.get('/api/templates', {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setTemplates(data);
        } catch (error) {
            console.error('Failed to load templates:', error);
        }
    };

    const handleTemplateChange = (e) => {
        const selected = templates.find(t => t._id === e.target.value);
        if (selected) {
            setMessage(selected.content);
        } else {
            setMessage('');
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        setSending(true);
        try {
            await axios.post(
                '/api/messages/send',
                { phone, message },
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            alert('Message sent successfully');
            setMessage('');
            setPhone('');
        } catch (error) {
            console.error(error);
            alert('Failed to send message: ' + (error.response?.data?.message || error.message));
        } finally {
            setSending(false);
        }
    };

    const sendViaWhatsAppWeb = (e) => {
        e.preventDefault();
        if (!phone || !message) {
            alert('Please enter phone and message');
            return;
        }

        // Cleanup phone: remove +, spaces, dashes
        let cleanPhone = phone.replace(/\D/g, '');
        if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone; // Default to India if 10 digits

        const encodedMessage = encodeURIComponent(message);
        const url = `https://web.whatsapp.com/send?phone=${cleanPhone}&text=${encodedMessage}`;

        window.open(url, '_blank');
        setMessage(''); // Optional: clear message after opening
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">WhatsApp Messaging</h1>

            {/* Connection Warning */}
            {isConnected === false && (
                <div className="bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6" role="alert">
                    <p className="font-bold">⚠️ Backend Not Connected</p>
                    <p className="mb-2">You can connect your device to send automatically, OR use the "WhatsApp Web" button below to send manually.</p>
                    <Link
                        to="/whatsapp-connection"
                        className="underline text-sm hover:text-yellow-900"
                    >
                        Connect Backend Device →
                    </Link>
                </div>
            )}

            <div className="bg-white p-6 rounded shadow">
                <form>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-bold mb-2">Phone Number (with Code)</label>
                        <input
                            type="text"
                            className="w-full p-2 border border-gray-300 rounded"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="e.g. 919876543210"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 font-bold mb-2">Select Template</label>
                        <select
                            onChange={handleTemplateChange}
                            className="w-full p-2 border border-gray-300 rounded bg-white"
                        >
                            <option value="">-- Manual Message --</option>
                            {templates.map(t => (
                                <option key={t._id} value={t._id}>{t.title}</option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-6">
                        <label className="block text-gray-700 font-bold mb-2">Message Content</label>
                        <textarea
                            className="w-full p-2 border border-gray-300 rounded h-32"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type your message here or select a template..."
                            required
                        />
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={sendViaWhatsAppWeb}
                            className="flex-1 bg-green-600 text-white p-3 rounded hover:bg-green-700 transition duration-200 font-bold flex items-center justify-center gap-2"
                        >
                            <span>↗️</span> Send via WhatsApp Web
                        </button>

                        <button
                            onClick={sendMessage}
                            disabled={!isConnected || sending}
                            className={`flex-1 p-3 rounded text-white font-bold transition duration-200 ${isConnected
                                ? 'bg-blue-600 hover:bg-blue-700'
                                : 'bg-gray-400 cursor-not-allowed'
                                }`}
                        >
                            {sending ? 'Sending...' : 'Send via Backend API'}
                        </button>
                    </div>

                    {!isConnected && (
                        <p className="text-xs text-center text-gray-500 mt-2">
                            * Backend API requires device connection. Use "Send via WhatsApp Web" otherwise.
                        </p>
                    )}
                </form>
            </div>
            <div className="mt-8">
                <h2 className="text-xl font-bold mb-4">Bulk Messaging Instructions</h2>
                <div className="bg-blue-50 p-4 rounded text-sm text-blue-800">
                    To send bulk messages, please upload leads via the Leads page first, then use the bulk messaging API endpoint directly or wait for the full bulk messaging UI implementation. Currently supports single direct message for testing.
                </div>
            </div>
        </div>
    );
};

export default WhatsApp;
