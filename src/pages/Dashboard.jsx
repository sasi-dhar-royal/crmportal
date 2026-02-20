import { useState, useEffect } from 'react';
import axios from '../utils/axiosConfig'; // Use interceptor instance
import useAuth from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import { FaUsers, FaCalendarDay, FaCheckCircle, FaClock, FaClipboardList, FaComments } from 'react-icons/fa';
import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const { data } = await axios.get('/api/analytics/dashboard');
            setStats(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading Dashboard...</div>;
    if (!stats) return <div className="p-8 text-center text-red-500">Failed to load dashboard statistics.</div>;

    const { role, counts, performance, recentMessages } = stats;

    // Chart Data (Admin Only)
    const chartData = role === 'admin' && performance ? {
        labels: performance.map(p => p.name),
        datasets: [{
            label: 'Converted Leads',
            data: performance.map(p => p.count),
            backgroundColor: 'rgba(16, 185, 129, 0.6)', // Green-500
            borderColor: 'rgba(16, 185, 129, 1)',
            borderWidth: 1,
        }]
    } : null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-6">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header with Gradient */}
                <header className="bg-white p-8 rounded-2xl shadow-lg mb-6">
                    <h1 className="text-4xl font-extrabold capitalize tracking-tight text-gray-800">
                        {role} Dashboard
                    </h1>
                    <p className="text-gray-500 mt-2">
                        Overview for {new Date().toLocaleDateString()}
                    </p>
                </header>

                {/* KPI Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title={role === 'admin' ? "Total Leads" : "My Leads"}
                        value={counts.total}
                        icon={<FaUsers />}
                        gradient="from-blue-500 to-blue-600"
                    />
                    <StatCard
                        title="Today's Leads"
                        value={counts.today}
                        icon={<FaCalendarDay />}
                        gradient="from-green-500 to-green-600"
                    />
                    <StatCard
                        title="Converted"
                        value={counts.converted}
                        icon={<FaCheckCircle />}
                        gradient="from-green-400 to-green-500"
                    />
                    <StatCard
                        title="Follow-ups"
                        value={counts.followUp}
                        icon={<FaClock />}
                        gradient="from-orange-400 to-orange-500"
                    />
                </div>

                {/* Admin Exclusive Section */}
                {role === 'admin' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Employee Performance Chart */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h2 className="text-lg font-bold text-gray-800 mb-4">Employee Performance</h2>
                            <div className="h-64">
                                {chartData && performance.length > 0 ? (
                                    <Bar
                                        data={chartData}
                                        options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }}
                                    />
                                ) : (
                                    <div className="h-full flex items-center justify-center text-gray-400">
                                        No conversion data yet
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recent Message Report */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-bold text-gray-800">Message Report</h2>
                                <Link to="/whatsapp-connection" className="text-sm text-blue-600 hover:underline">View All</Link>
                            </div>
                            <div className="overflow-y-auto h-64 pr-2">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 sticky top-0">
                                        <tr>
                                            <th className="p-3 font-semibold text-gray-600">Sender</th>
                                            <th className="p-3 font-semibold text-gray-600">Content</th>
                                            <th className="p-3 font-semibold text-gray-600">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {recentMessages?.length > 0 ? (
                                            recentMessages.map((msg, i) => (
                                                <tr key={i} className="hover:bg-gray-50 transition-colors">
                                                    <td className="p-3 font-medium text-gray-900">{msg.sender?.name || 'Unknown'}</td>
                                                    <td className="p-3 text-gray-500 truncate max-w-[150px]" title={msg.content}>
                                                        {msg.content}
                                                    </td>
                                                    <td className="p-3">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${msg.status === 'sent' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                            }`}>
                                                            {msg.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="3" className="p-4 text-center text-gray-400">No messages sent recently</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Employee Exclusive Actions */}
                {role === 'employee' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Link to="/leads" className="group block p-8 bg-white rounded-xl shadow-sm border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">My Leads</h3>
                                    <p className="text-gray-500 mt-1">View and manage your assigned leads</p>
                                </div>
                                <div className="text-4xl text-gray-400 group-hover:text-blue-500 transition-colors">
                                    <FaClipboardList />
                                </div>
                            </div>
                        </Link>

                        <Link to="/whatsapp-connection" className="group block p-8 bg-white rounded-xl shadow-sm border border-gray-200 hover:border-green-500 hover:shadow-md transition-all">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-green-600 transition-colors">Bulk Message Option</h3>
                                    <p className="text-gray-500 mt-1">Send campaigns or updates via WhatsApp</p>
                                </div>
                                <div className="text-4xl text-gray-400 group-hover:text-green-500 transition-colors">
                                    <FaComments />
                                </div>
                            </div>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

// Reusable Internal Card Component
const StatCard = ({ title, value, icon, gradient }) => (
    <div className={`bg-gradient-to-r ${gradient} text-white p-6 rounded-xl shadow-lg transition-transform hover:-translate-y-1 hover:shadow-xl`}>
        <div className="flex justify-between items-start">
            <div>
                <p className="text-xs font-bold uppercase tracking-wider opacity-90 mb-1">{title}</p>
                <h3 className="text-4xl font-extrabold">{value}</h3>
            </div>
            <div className="text-3xl opacity-90">
                {icon}
            </div>
        </div>
    </div>
);

export default Dashboard;
