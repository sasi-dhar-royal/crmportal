import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Layout from './layouts/Layout';
import PrivateRoute from './components/PrivateRoute';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Leads from './pages/Leads';
import WhatsApp from './pages/WhatsApp';
import WhatsAppConnection from './pages/WhatsAppConnection';
import ManageTemplates from './pages/ManageTemplates';
import Integrations from './pages/Integrations';

import Register from './pages/Register';

function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    <Route element={<PrivateRoute allowedRoles={['admin', 'employee']} />}>
                        <Route element={<Layout />}>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/employees" element={<Employees />} />
                            <Route path="/leads" element={<Leads />} />
                            <Route path="/whatsapp" element={<WhatsApp />} />
                            <Route path="/whatsapp-connection" element={<WhatsAppConnection />} />
                            <Route path="/templates" element={<ManageTemplates />} />
                            <Route path="/integrations" element={<Integrations />} />
                        </Route>
                    </Route>
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;
