import Sidebar from '../components/Sidebar';
import { Outlet } from 'react-router-dom';

const Layout = () => {
    return (
        <div className="flex bg-gray-100 min-h-screen">
            <Sidebar />
            <div className="flex-1 p-8 overflow-y-auto h-screen">
                <Outlet />
            </div>
        </div>
    );
};

export default Layout;
