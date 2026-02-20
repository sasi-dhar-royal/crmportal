import { useState, useEffect } from 'react';
import axios from '../utils/axiosConfig';
import useAuth from '../hooks/useAuth';

const Employees = () => {
    const [employees, setEmployees] = useState([]);
    const { user } = useAuth();
    const [showLeadModal, setShowLeadModal] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [leadData, setLeadData] = useState({ name: '', phone: '', source: '' });

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const { data } = await axios.get('/api/auth/users', {
                headers: { Authorization: `Bearer ${user.token}` },
            });
            setEmployees(data.filter((u) => u.role !== 'admin'));
        } catch (error) {
            console.error(error);
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await axios.put(
                `/api/auth/approve/${id}`,
                { status },
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            fetchEmployees();
            alert(`User ${status} successfully`);
        } catch (error) {
            console.error('Update Error:', error);
            alert(`Failed: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleAddLead = (employee) => {
        setSelectedEmployee(employee);
        setShowLeadModal(true);
        setLeadData({ name: '', phone: '', source: '' });
    };

    const handleCreateLead = async (e) => {
        e.preventDefault();
        try {
            await axios.post(
                '/api/leads',
                { ...leadData, assignedTo: selectedEmployee._id },
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            alert(`Lead created and assigned to ${selectedEmployee.name}`);
            setShowLeadModal(false);
            setLeadData({ name: '', phone: '', source: '' });
        } catch (error) {
            console.error('Create Lead Error:', error);
            alert(`Failed: ${error.response?.data?.message || error.message}`);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white p-8 rounded-2xl shadow-lg mb-6">
                    <h1 className="text-4xl font-extrabold tracking-tight text-gray-800">Employee Management</h1>
                    <p className="text-gray-500 mt-2">Manage employee accounts and permissions</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <table className="min-w-full">
                        <thead>
                            <tr className="bg-blue-500 text-white">
                                <th className="p-4 text-left font-semibold">Name</th>
                                <th className="p-4 text-left font-semibold">Email</th>
                                <th className="p-4 text-left font-semibold">Phone</th>
                                <th className="p-4 text-left font-semibold">Status</th>
                                <th className="p-4 text-left font-semibold">Actions</th>
                                <th className="p-4 text-left font-semibold">Assign Lead</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.map((emp) => (
                                <tr key={emp._id} className="border-b hover:bg-blue-50 transition-colors">
                                    <td className="p-4">{emp.name}</td>
                                    <td className="p-4">{emp.email}</td>
                                    <td className="p-4">{emp.phone}</td>
                                    <td className="p-4">
                                        <span
                                            className={`px-2 py-1 rounded text-sm ${emp.status === 'approved'
                                                ? 'bg-green-100 text-green-800'
                                                : emp.status === 'rejected'
                                                    ? 'bg-red-100 text-red-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                                }`}
                                        >
                                            {emp.status}
                                        </span>
                                    </td>
                                    <td className="p-4 space-x-2">
                                        {emp.status === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => updateStatus(emp._id, 'approved')}
                                                    className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md text-sm font-semibold"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => updateStatus(emp._id, 'rejected')}
                                                    className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-md text-sm font-semibold"
                                                >
                                                    Reject
                                                </button>
                                            </>
                                        )}
                                        {emp.status === 'approved' && (
                                            <button
                                                onClick={() => updateStatus(emp._id, 'rejected')}
                                                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-md text-sm font-semibold"
                                            >
                                                Reject
                                            </button>
                                        )}
                                        {emp.status === 'rejected' && (
                                            <button
                                                onClick={() => updateStatus(emp._id, 'approved')}
                                                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md text-sm font-semibold"
                                            >
                                                Approve
                                            </button>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        {emp.status === 'approved' && (
                                            <button
                                                onClick={() => handleAddLead(emp)}
                                                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md text-sm font-semibold"
                                            >
                                                + Add Lead
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Add Lead Modal */}
                {showLeadModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">
                                Add Lead for {selectedEmployee?.name}
                            </h2>
                            <form onSubmit={handleCreateLead} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Lead Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={leadData.name}
                                        onChange={(e) => setLeadData({ ...leadData, name: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Enter lead name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Phone Number *
                                    </label>
                                    <input
                                        type="tel"
                                        required
                                        value={leadData.phone}
                                        onChange={(e) => setLeadData({ ...leadData, phone: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Enter phone number"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Source
                                    </label>
                                    <input
                                        type="text"
                                        value={leadData.source}
                                        onChange={(e) => setLeadData({ ...leadData, source: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="e.g., Website, Referral, etc."
                                    />
                                </div>
                                <div className="flex space-x-3 mt-6">
                                    <button
                                        type="submit"
                                        className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md font-semibold"
                                    >
                                        Create Lead
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowLeadModal(false)}
                                        className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-all font-semibold"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Employees;
