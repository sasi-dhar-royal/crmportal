import { Link, useLocation } from 'react-router-dom';
import { FaChartBar, FaUserCheck, FaUsers, FaWhatsapp, FaSignOutAlt, FaClipboardList } from 'react-icons/fa';
import useAuth from '../hooks/useAuth';

const Sidebar = () => {
    const { logout, user } = useAuth();
    const location = useLocation();

    const isActive = (path) => location.pathname === path ? 'bg-slate-600' : '';

    return (
        <div className="h-screen w-64 bg-gradient-to-b from-slate-700 to-slate-800 text-white flex flex-col shadow-2xl">
            {/* Header */}
            <div className="p-6 text-center border-b border-slate-600">
                <h1 className="text-3xl font-extrabold tracking-tight">LeadFlow</h1>
                <p className="text-slate-300 text-xs mt-1">CRM System</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                <Link
                    to="/"
                    className={`flex items-center p-3 rounded-lg hover:bg-slate-600 transition-all duration-200 ${isActive('/')}`}
                >
                    <FaChartBar className="mr-3" /> Dashboard
                </Link>
                {user?.role === 'admin' && (
                    <>
                        <Link
                            to="/employees"
                            className={`flex items-center p-3 rounded-lg hover:bg-slate-600 transition-all duration-200 ${isActive('/employees')}`}
                        >
                            <FaUserCheck className="mr-3" /> Employees
                        </Link>
                        <Link
                            to="/leads"
                            className={`flex items-center p-3 rounded-lg hover:bg-slate-600 transition-all duration-200 ${isActive('/leads')}`}
                        >
                            <FaUsers className="mr-3" /> Leads
                        </Link>
                        <Link
                            to="/whatsapp"
                            className={`flex items-center p-3 rounded-lg hover:bg-slate-600 transition-all duration-200 ${isActive('/whatsapp')}`}
                        >
                            <FaWhatsapp className="mr-3" /> WhatsApp
                        </Link>
                        <Link
                            to="/whatsapp-connection"
                            className={`flex items-center p-3 rounded-lg hover:bg-slate-600 transition-all duration-200 ${isActive('/whatsapp-connection')}`}
                        >
                            <FaWhatsapp className="mr-3" /> Connect WhatsApp
                        </Link>
                        <Link
                            to="/templates"
                            className={`flex items-center p-3 rounded-lg hover:bg-slate-600 transition-all duration-200 ${isActive('/templates')}`}
                        >
                            <FaClipboardList className="mr-3" /> Templates
                        </Link>
                        <Link
                            to="/integrations"
                            className={`flex items-center p-3 rounded-lg hover:bg-slate-600 transition-all duration-200 ${isActive('/integrations')}`}
                        >
                            <FaUsers className="mr-3" /> Facebook Sync
                        </Link>
                    </>
                )}
            </nav>

            {/* Logout Button */}
            <div className="p-4 border-t border-slate-600">
                <button
                    onClick={logout}
                    className="flex items-center justify-center w-full p-3 rounded-lg bg-red-600 hover:bg-red-700 transition-all duration-200 font-semibold shadow-lg"
                >
                    <FaSignOutAlt className="mr-2" /> Logout
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
