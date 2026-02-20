import { useState, useEffect } from 'react';
import axios from '../utils/axiosConfig';
import useAuth from '../hooks/useAuth';
import { FaEdit, FaTrash, FaSearch, FaFilter } from 'react-icons/fa';

const Leads = () => {
    const [leads, setLeads] = useState([]);
    const { user } = useAuth();
    const [file, setFile] = useState(null);
    const [selectedLeads, setSelectedLeads] = useState([]);
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [employees, setEmployees] = useState([]);
    const [showAddLeadModal, setShowAddLeadModal] = useState(false);
    const [newLead, setNewLead] = useState({ name: '', phone: '', source: '' });
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedLead, setSelectedLead] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [editData, setEditData] = useState({});

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [employeeFilter, setEmployeeFilter] = useState('all');
    const [sourceFilter, setSourceFilter] = useState('all');

    useEffect(() => {
        fetchLeads();
        if (user.role === 'admin') {
            fetchEmployees();
        }
    }, []);

    const fetchLeads = async () => {
        try {
            const { data } = await axios.get('/api/leads', {
                headers: { Authorization: `Bearer ${user.token}` },
            });
            setLeads(data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchEmployees = async () => {
        try {
            const { data } = await axios.get('/api/auth/employees', {
                headers: { Authorization: `Bearer ${user.token}` },
            });
            setEmployees(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleAssignLead = async (leadId, employeeId) => {
        // Allow empty employeeId for unassignment

        try {
            await axios.put(`/api/leads/${leadId}/assign`,
                { employeeId },
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            fetchLeads(); // Refresh the list
            alert(employeeId ? 'Lead assigned successfully' : 'Lead unassigned successfully');
        } catch (error) {
            console.error(error);
            alert('Failed to assign lead');
        }
    };

    const handleFileUpload = async (e) => {
        e.preventDefault();
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            await axios.post('/api/leads/upload', formData, {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
            fetchLeads();
            setFile(null);
            alert('Leads uploaded successfully');
        } catch (error) {
            console.error(error);
            alert('Upload failed');
        }
    };

    const toggleSelectLead = (id) => {
        if (selectedLeads.includes(id)) {
            setSelectedLeads(selectedLeads.filter(leadId => leadId !== id));
        } else {
            setSelectedLeads([...selectedLeads, id]);
        }
    };

    const toggleSelectAll = () => {
        const filteredIds = filteredLeads.map(l => l._id);
        const allFilteredSelected = filteredIds.length > 0 && filteredIds.every(id => selectedLeads.includes(id));

        if (allFilteredSelected) {
            setSelectedLeads(selectedLeads.filter(id => !filteredIds.includes(id)));
        } else {
            const newSelection = [...new Set([...selectedLeads, ...filteredIds])];
            setSelectedLeads(newSelection);
        }
    };

    const [templates, setTemplates] = useState([]);

    useEffect(() => {
        fetchLeads();
        fetchTemplates();
        if (user.role === 'admin') {
            fetchEmployees();
        }
    }, []);

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

    const handleBulkMessage = async () => {
        if (selectedLeads.length === 0) return alert('Select leads first');
        if (!message) return alert('Enter a message');

        setIsSending(true);
        try {
            const selectedLeadDetails = leads.filter(l => selectedLeads.includes(l._id));
            const validPhones = selectedLeadDetails
                .filter(l => l.phone && l.phone.length >= 10)
                .map(l => l.phone.replace(/\D/g, ''));

            if (validPhones.length === 0) {
                alert('No valid phone numbers found in selection');
                setIsSending(false);
                return;
            }

            await axios.post('/api/messages/bulk', {
                numbers: validPhones,
                message: message
            }, {
                headers: { Authorization: `Bearer ${user.token}` }
            });

            alert(`Messages sent to ${validPhones.length} leads successfully!`);
            setIsSending(false);
            setShowModal(false);
            setSelectedLeads([]);
            setMessage('');
        } catch (error) {
            console.error(error);
            alert('Failed to send messages: ' + (error.response?.data?.message || 'Unknown error'));
            setIsSending(false);
        }
    };

    const handleAddNewLead = async (e) => {
        e.preventDefault();
        try {
            const leadPayload = { ...newLead };

            // If employee, auto-assign to themselves
            if (user.role === 'employee') {
                const userId = user._id || user.id;
                console.log('Auto-assigning to employee:', userId, 'Full user:', user);
                leadPayload.assignedTo = userId;
            }

            console.log('Lead payload being sent:', leadPayload);

            await axios.post(
                '/api/leads',
                leadPayload,
                { headers: { Authorization: `Bearer ${user.token}` } }
            );

            alert('Lead created successfully!');
            setShowAddLeadModal(false);
            setNewLead({ name: '', phone: '', source: '' });
            fetchLeads();
        } catch (error) {
            console.error('Create Lead Error:', error);
            alert(`Failed: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleViewLead = (lead, initialEditMode = false) => {
        setSelectedLead(lead);
        setEditData({
            name: lead.name,
            phone: lead.phone,
            email: lead.email || '',
            source: lead.source || '',
            notes: lead.notes || '',
            status: lead.status
        });
        setEditMode(initialEditMode);
        setShowDetailModal(true);
    };

    const handleUpdateLead = async () => {
        try {
            await axios.put(
                `/api/leads/${selectedLead._id}`,
                editData,
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            alert('Lead updated successfully!');
            setShowDetailModal(false);
            setEditMode(false);
            fetchLeads();
        } catch (error) {
            console.error('Update Lead Error:', error);
            alert(`Failed: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleDeleteLead = async (leadId) => {
        if (!window.confirm('Are you sure you want to delete this lead?')) {
            return;
        }
        try {
            await axios.delete(
                `/api/leads/${leadId}`,
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            alert('Lead deleted successfully!');
            fetchLeads();
        } catch (error) {
            console.error('Delete Lead Error:', error);
            alert(`Failed: ${error.response?.data?.message || error.message}`);
        }
    };

    const filteredLeads = leads.filter(lead => {
        const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.phone.includes(searchTerm);
        const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
        const matchesEmployee = employeeFilter === 'all' || lead.assignedTo?._id === employeeFilter;
        const matchesSource = sourceFilter === 'all' || lead.source === sourceFilter;

        return matchesSearch && matchesStatus && matchesEmployee && matchesSource;
    });

    const handleSyncFacebook = async () => {
        setIsLoadingSync(true);
        try {
            const { data } = await axios.post('/api/leads/sync-facebook', {}, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            alert(data.message);
            fetchLeads();
        } catch (error) {
            console.error(error);
            alert('Sync failed: ' + (error.response?.data?.message || error.message));
        } finally {
            setIsLoadingSync(false);
        }
    };

    const [isLoadingSync, setIsLoadingSync] = useState(false);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white p-8 rounded-2xl shadow-lg mb-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-4xl font-extrabold tracking-tight text-gray-800">Leads Management</h1>
                            <p className="text-gray-500 mt-2">Manage and track your leads</p>
                        </div>
                        <div className="flex space-x-4">
                            {/* Add Lead Button - For all users */}
                            <button
                                onClick={() => setShowAddLeadModal(true)}
                                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 flex items-center shadow-md font-semibold"
                            >
                                + Add Lead
                            </button>

                            {user.role === 'admin' && (
                                <button
                                    onClick={handleSyncFacebook}
                                    disabled={isLoadingSync}
                                    className="bg-[#1877F2] text-white px-4 py-2 rounded-lg hover:bg-[#166fe5] flex items-center shadow-md font-semibold disabled:opacity-50"
                                >
                                    {isLoadingSync ? 'Syncing...' : 'Sync Facebook'}
                                </button>
                            )}

                            {selectedLeads.length > 0 && (
                                <button
                                    onClick={() => setShowModal(true)}
                                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center shadow-md font-semibold"
                                >
                                    <span>WhatsApp Selected ({selectedLeads.length})</span>
                                </button>
                            )}

                            {user.role === 'admin' && (
                                <form onSubmit={handleFileUpload} className="flex items-center space-x-2">
                                    <input
                                        type="file"
                                        onChange={(e) => setFile(e.target.files[0])}
                                        className="border border-gray-300 p-2 rounded-lg text-sm w-48"
                                        accept=".xlsx, .xls, .csv"
                                    />
                                    <button
                                        type="submit"
                                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 text-sm font-semibold shadow-md"
                                        disabled={!file}
                                    >
                                        Upload
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white p-6 rounded-2xl shadow-md mb-6 flex flex-wrap gap-4 items-center">
                    <div className="flex-1 min-w-[200px] relative">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name or phone..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center space-x-2">
                        <FaFilter className="text-gray-400" />
                        <select
                            className="border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">All Status</option>
                            <option value="new">New</option>
                            <option value="follow-up">Follow-up</option>
                            <option value="converted">Converted</option>
                            <option value="lost">Lost</option>
                        </select>
                    </div>

                    {user.role === 'admin' && (
                        <div className="flex items-center space-x-2">
                            <select
                                className="border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                value={employeeFilter}
                                onChange={(e) => setEmployeeFilter(e.target.value)}
                            >
                                <option value="all">All Employees</option>
                                {employees.map(emp => (
                                    <option key={emp._id} value={emp._id}>{emp.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="flex items-center space-x-2">
                        <select
                            className="border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                            value={sourceFilter}
                            onChange={(e) => setSourceFilter(e.target.value)}
                        >
                            <option value="all">All Sources</option>
                            {[...new Set(leads.map(l => l.source).filter(Boolean))].map(source => (
                                <option key={source} value={source}>{source.charAt(0).toUpperCase() + source.slice(1)}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={() => {
                            setSearchTerm('');
                            setStatusFilter('all');
                            setEmployeeFilter('all');
                            setSourceFilter('all');
                        }}
                        className="text-blue-500 hover:text-blue-700 text-sm font-semibold"
                    >
                        Reset Filters
                    </button>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <table className="min-w-full">
                        <thead>
                            <tr className="bg-blue-500 text-white text-left">
                                <th className="p-4 w-10">
                                    <input
                                        type="checkbox"
                                        checked={filteredLeads.length > 0 && filteredLeads.every(l => selectedLeads.includes(l._id))}
                                        onChange={toggleSelectAll}
                                    />
                                </th>
                                <th className="p-4">Name</th>
                                <th className="p-4">Phone</th>
                                <th className="p-4">Assigned To</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLeads.map((lead) => (
                                <tr key={lead._id} className={`border-b hover:bg-gray-50 ${selectedLeads.includes(lead._id) ? 'bg-blue-50' : ''}`}>
                                    <td className="p-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedLeads.includes(lead._id)}
                                            onChange={() => toggleSelectLead(lead._id)}
                                        />
                                    </td>
                                    <td
                                        className="p-4 font-medium text-blue-600 hover:text-blue-800 cursor-pointer hover:underline"
                                        onClick={() => handleViewLead(lead)}
                                    >
                                        {lead.name}
                                    </td>
                                    <td className="p-4 text-gray-600">{lead.phone}</td>
                                    <td className="p-4">
                                        {user.role === 'admin' ? (
                                            <select
                                                className="border rounded px-2 py-1 text-sm bg-white"
                                                value={lead.assignedTo?._id || ''}
                                                onChange={(e) => handleAssignLead(lead._id, e.target.value)}
                                            >
                                                <option value="">Unassigned</option>
                                                {employees.map(emp => (
                                                    <option key={emp._id} value={emp._id}>
                                                        {emp.name}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            lead.assignedTo ? (
                                                <span className="bg-gray-100 px-2 py-1 rounded text-xs">{lead.assignedTo.name}</span>
                                            ) : (
                                                <span className="text-gray-400 italic">Unassigned</span>
                                            )
                                        )}
                                    </td>
                                    <td className="p-4 capitalize">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${lead.status === 'new' ? 'bg-blue-100 text-blue-800' :
                                            lead.status === 'converted' ? 'bg-green-100 text-green-800' :
                                                lead.status === 'lost' ? 'bg-red-100 text-red-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {lead.status}
                                        </span>
                                    </td>
                                    <td className="p-4 flex space-x-3">
                                        <button
                                            onClick={() => handleViewLead(lead, true)}
                                            className="text-blue-500 hover:text-blue-700 transition-colors"
                                            title="Edit Lead"
                                        >
                                            <FaEdit size={18} />
                                        </button>
                                        {user.role === 'admin' && (
                                            <button
                                                onClick={() => handleDeleteLead(lead._id)}
                                                className="text-red-500 hover:text-red-700 transition-colors"
                                                title="Delete Lead"
                                            >
                                                <FaTrash size={18} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Bulk Message Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md">
                            <h3 className="text-xl font-bold mb-4">Send Bulk WhatsApp</h3>
                            <p className="mb-4 text-gray-600">Sending to {selectedLeads.length} recipients.</p>

                            <select
                                className="w-full border rounded p-3 mb-4 bg-white"
                                onChange={handleTemplateChange}
                            >
                                <option value="">-- Select a Template --</option>
                                {templates.map(t => (
                                    <option key={t._id} value={t._id}>{t.title}</option>
                                ))}
                            </select>

                            <textarea
                                className="w-full border rounded p-3 mb-4 h-32 focus:ring-2 focus:ring-green-500 outline-none"
                                placeholder="Type your message here..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                            ></textarea>

                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleBulkMessage}
                                    disabled={isSending}
                                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 flex items-center"
                                >
                                    {isSending ? 'Sending...' : 'Send Message'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Add Lead Modal */}
                {showAddLeadModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">
                                Add New Lead
                            </h2>
                            {user.role === 'employee' && (
                                <p className="text-sm text-blue-600 mb-4 bg-blue-50 p-3 rounded-lg">
                                    This lead will be automatically assigned to you
                                </p>
                            )}
                            <form onSubmit={handleAddNewLead} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Lead Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={newLead.name}
                                        onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
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
                                        value={newLead.phone}
                                        onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
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
                                        value={newLead.source}
                                        onChange={(e) => setNewLead({ ...newLead, source: e.target.value })}
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
                                        onClick={() => setShowAddLeadModal(false)}
                                        className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-all font-semibold"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Lead Detail/Edit Modal */}
                {showDetailModal && selectedLead && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-3xl font-bold text-gray-800">
                                    {editMode ? 'Edit Lead' : 'Lead Details'}
                                </h2>
                                <button
                                    onClick={() => setShowDetailModal(false)}
                                    className="text-gray-500 hover:text-gray-700 text-2xl"
                                >
                                    ×
                                </button>
                            </div>

                            {!editMode ? (
                                /* View Mode */
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-semibold text-gray-500">Name</label>
                                            <p className="text-lg font-medium text-gray-800">{selectedLead.name}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold text-gray-500">Phone</label>
                                            <p className="text-lg font-medium text-gray-800">{selectedLead.phone}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold text-gray-500">Email</label>
                                            <p className="text-lg font-medium text-gray-800">{selectedLead.email || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold text-gray-500">Source</label>
                                            <p className="text-lg font-medium text-gray-800 capitalize">{selectedLead.source || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold text-gray-500">Status</label>
                                            <p className="text-lg font-medium text-gray-800 capitalize">
                                                <span className={`px-3 py-1 rounded-full text-sm ${selectedLead.status === 'new' ? 'bg-blue-100 text-blue-800' :
                                                    selectedLead.status === 'converted' ? 'bg-green-100 text-green-800' :
                                                        selectedLead.status === 'lost' ? 'bg-red-100 text-red-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {selectedLead.status}
                                                </span>
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold text-gray-500">Assigned To</label>
                                            <p className="text-lg font-medium text-gray-800">
                                                {selectedLead.assignedTo?.name || 'Unassigned'}
                                            </p>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold text-gray-500">Notes</label>
                                        <p className="text-gray-700 mt-1">{selectedLead.notes || 'No notes'}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                                        <div>
                                            <label className="text-sm font-semibold text-gray-500">Created</label>
                                            <p className="text-sm text-gray-600">{new Date(selectedLead.createdAt).toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold text-gray-500">Last Updated</label>
                                            <p className="text-sm text-gray-600">{new Date(selectedLead.updatedAt).toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex space-x-3 mt-6">
                                        <button
                                            onClick={() => setEditMode(true)}
                                            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md font-semibold"
                                        >
                                            Edit Lead
                                        </button>
                                        <button
                                            onClick={() => setShowDetailModal(false)}
                                            className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-all font-semibold"
                                        >
                                            Close
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                /* Edit Mode */
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Name *</label>
                                            <input
                                                type="text"
                                                required
                                                value={editData.name}
                                                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Phone *</label>
                                            <input
                                                type="tel"
                                                required
                                                value={editData.phone}
                                                onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                                            <input
                                                type="email"
                                                value={editData.email}
                                                onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Source</label>
                                            <input
                                                type="text"
                                                value={editData.source}
                                                onChange={(e) => setEditData({ ...editData, source: e.target.value })}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                                            <select
                                                value={editData.status}
                                                onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                <option value="new">New</option>
                                                <option value="follow-up">Follow-up</option>
                                                <option value="converted">Converted</option>
                                                <option value="lost">Lost</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
                                        <textarea
                                            value={editData.notes}
                                            onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            rows="4"
                                            placeholder="Enter any notes..."
                                        />
                                    </div>
                                    <div className="flex space-x-3 mt-6">
                                        <button
                                            onClick={handleUpdateLead}
                                            className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md font-semibold"
                                        >
                                            Save Changes
                                        </button>
                                        <button
                                            onClick={() => setEditMode(false)}
                                            className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-all font-semibold"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Leads;
