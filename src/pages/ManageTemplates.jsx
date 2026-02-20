import { useState, useEffect } from 'react';
import axios from 'axios';
import useAuth from '../hooks/useAuth';
import { FaTrash, FaPlus } from 'react-icons/fa';

const ManageTemplates = () => {
    const { user } = useAuth();
    const [templates, setTemplates] = useState([]);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            const { data } = await axios.get('/api/templates', {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setTemplates(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/templates', { title, content }, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setTitle('');
            setContent('');
            fetchTemplates();
        } catch (error) {
            alert(error.response?.data?.message || 'Error creating template');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this template?')) return;
        try {
            await axios.delete(`/api/templates/${id}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            fetchTemplates();
        } catch (error) {
            alert('Error deleting template');
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Manage Message Templates</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Create Form */}
                <div className="bg-white p-6 rounded-xl shadow-md h-fit">
                    <h2 className="text-lg font-semibold mb-4">Create New Template</h2>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Title</label>
                            <input
                                type="text"
                                className="w-full mt-1 p-2 border rounded-md"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Message Content</label>
                            <textarea
                                className="w-full mt-1 p-2 border rounded-md h-32"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 flex items-center justify-center gap-2">
                            <FaPlus /> Create Template
                        </button>
                    </form>
                </div>

                {/* List */}
                <div className="space-y-4">
                    {templates.map((template) => (
                        <div key={template._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative group">
                            <h3 className="font-bold text-gray-800">{template.title}</h3>
                            <p className="text-gray-600 mt-2 text-sm whitespace-pre-wrap bg-gray-50 p-3 rounded-md border border-gray-200">
                                {template.content}
                            </p>
                            {user.role === 'admin' && (
                                <button
                                    onClick={() => handleDelete(template._id)}
                                    className="absolute top-4 right-4 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <FaTrash />
                                </button>
                            )}
                        </div>
                    ))}
                    {templates.length === 0 && (
                        <p className="text-gray-500 text-center py-10">No templates found.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManageTemplates;
