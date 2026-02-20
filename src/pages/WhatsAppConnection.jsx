import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const WhatsAppConnection = () => {
    const [qrCode, setQrCode] = useState(null);
    const [status, setStatus] = useState('disconnected');
    const [message, setMessage] = useState('Initializing WhatsApp connection...');
    const [usePairing, setUsePairing] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [pairingCode, setPairingCode] = useState(null);
    const [socketInstance, setSocketInstance] = useState(null);

    useEffect(() => {
        // Connect to Socket.IO server
        const socket = io('http://localhost:5000');
        setSocketInstance(socket);

        socket.on('connect', () => {
            console.log('Connected to Socket.IO');
            setMessage('Waiting for QR code...');
            socket.emit('request-qr');
        });

        socket.on('qr', (qrDataURL) => {
            console.log('QR code received');
            setQrCode(qrDataURL);
            setStatus('waiting');
            setMessage('Scan this QR code with WhatsApp');
            setPairingCode(null); // Clear pairing code if QR received
        });

        socket.on('pairing-code', (code) => {
            console.log('Pairing code received:', code);
            setPairingCode(code);
            setStatus('pairing');
            setMessage('Enter this code on your phone');
            setQrCode(null); // Clear QR
        });

        socket.on('connection-status', (data) => {
            console.log('Connection status:', data);
            setStatus(data.status);
            setMessage(data.message);

            if (data.status === 'connected') {
                setQrCode(null);
                setPairingCode(null);
            }
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from Socket.IO');
            setMessage('Disconnected from server');
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const handlePairingRequest = (e) => {
        e.preventDefault();
        if (socketInstance && phoneNumber) {
            setMessage('Requesting pairing code...');
            socketInstance.emit('request-pairing', phoneNumber);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">WhatsApp Connection</h1>

            <div className="bg-white rounded-lg shadow p-6">
                {/* Status Indicator */}
                <div className="mb-6 flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${status === 'connected' ? 'bg-green-500' :
                        ['waiting', 'pairing'].includes(status) ? 'bg-yellow-500' :
                            'bg-red-500'
                        }`}></div>
                    <span className="text-lg font-semibold">
                        {status === 'connected' ? '✅ Connected' :
                            status === 'pairing' ? '🔢 Pairing Code Ready' :
                                status === 'waiting' ? '⏳ Waiting for scan' :
                                    '❌ Disconnected'}
                    </span>
                </div>

                {/* Message */}
                <p className="text-gray-600 mb-6">{message}</p>

                {/* Pairing Code Display */}
                {pairingCode && (
                    <div className="flex flex-col items-center mb-8">
                        <div className="bg-gray-100 p-8 rounded-lg border-2 border-dashed border-gray-400">
                            <h2 className="text-4xl font-mono tracking-widest font-bold text-gray-800">
                                {pairingCode.split('').join(' ')}
                            </h2>
                        </div>
                        <p className="mt-4 text-center text-gray-600">
                            Enter this code on your phone:<br />
                            <strong>WhatsApp &gt; Linked Devices &gt; Link a Device &gt; Link with phone number instead</strong>
                        </p>
                    </div>
                )}

                {/* Toggle / Form */}
                {!pairingCode && status !== 'connected' && (
                    <div className="mb-8 p-4 bg-gray-50 rounded border">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold">Connection Method:</h3>
                            <button
                                onClick={() => setUsePairing(!usePairing)}
                                className="text-blue-600 underline text-sm"
                            >
                                {usePairing ? 'Use QR Code Scanner instead' : 'Use Phone Number (Alt Way)'}
                            </button>
                        </div>

                        {usePairing ? (
                            <form onSubmit={handlePairingRequest} className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Enter Phone (e.g. 919876543210)"
                                    className="border p-2 rounded flex-1"
                                    value={phoneNumber}
                                    onChange={e => setPhoneNumber(e.target.value)}
                                    required
                                />
                                <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
                                    Get Code
                                </button>
                            </form>
                        ) : (
                            <p className="text-sm text-gray-500">
                                Scan the QR code below. If camera is not working, click "Use Phone Number" above.
                            </p>
                        )}
                    </div>
                )}

                {/* QR Code Display */}
                {qrCode && !usePairing && !pairingCode && (
                    <div className="flex flex-col items-center">
                        <div className="bg-white p-6 rounded-lg border-4 border-green-500 shadow-lg">
                            <img
                                src={qrCode}
                                alt="WhatsApp QR Code"
                                className="w-80 h-80"
                            />
                        </div>
                        {/* ... instructions ... */}
                    </div>
                )}

                {/* ... Connected/Disconnected states (keep existing code) ... */}

                {/* Connected State */}
                {status === 'connected' && !qrCode && (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">✅</div>
                        <h2 className="text-2xl font-bold text-green-600 mb-2">
                            WhatsApp Connected!
                        </h2>
                        <p className="text-gray-600">
                            You can now send bulk WhatsApp messages from the Leads page.
                        </p>
                    </div>
                )}

                {/* Disconnected State */}
                {status === 'disconnected' && !qrCode && (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">⏳</div>
                        <h2 className="text-2xl font-bold text-gray-600 mb-2">
                            Waiting for Connection
                        </h2>
                        <p className="text-gray-600">
                            The QR code will appear here when ready.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
                        >
                            Refresh Page
                        </button>
                    </div>
                )}
            </div>

            {/* Instructions Card */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-bold text-blue-900 mb-2">📌 Important Notes:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Keep this page open while scanning the QR code</li>
                    <li>• Once connected, the session is saved and you won't need to scan again</li>
                    <li>• If disconnected, a new QR code will appear automatically</li>
                    <li>• Make sure your phone has an active internet connection</li>
                </ul>
            </div>
        </div>
    );
};

export default WhatsAppConnection;
