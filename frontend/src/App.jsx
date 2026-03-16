import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout';
import StudentManagement from './pages/StudentManagement';
import FacultyManagement from './pages/FacultyManagement';
import CourseManagement from './pages/CourseManagement';
import Attendance from './pages/Attendance';
import Marks from './pages/Marks';
import Profile from './pages/Profile';
import Home from './pages/Home';
import Assignments from './pages/Assignments';
import Materials from './pages/Materials';
import BulkUpload from './pages/BulkUpload';

const ProtectedRoute = ({ children, roles }) => {
    const { user, loading } = useAuth();

    if (loading) return <div>Loading...</div>;

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (roles && !roles.includes(user.role)) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

function App() {
    const { user } = useAuth();
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Home />} />
                <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
                <Route path="/signup" element={user ? <Navigate to="/dashboard" /> : <SignUp />} />

                <Route path="/dashboard" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                    <Route index element={<Dashboard />} />
                    <Route path="students" element={<ProtectedRoute roles={['Admin']}><StudentManagement /></ProtectedRoute>} />
                    <Route path="faculty" element={<ProtectedRoute roles={['Admin']}><FacultyManagement /></ProtectedRoute>} />
                    <Route path="courses" element={<ProtectedRoute roles={['Admin', 'Faculty', 'Student']}><CourseManagement /></ProtectedRoute>} />
                    <Route path="attendance" element={<ProtectedRoute roles={['Admin', 'Faculty', 'Student']}><Attendance /></ProtectedRoute>} />
                    <Route path="marks" element={<ProtectedRoute roles={['Admin', 'Faculty', 'Student']}><Marks /></ProtectedRoute>} />
                    <Route path="assignments" element={<ProtectedRoute roles={['Admin', 'Faculty', 'Student']}><Assignments /></ProtectedRoute>} />
                    <Route path="materials" element={<ProtectedRoute roles={['Admin', 'Faculty', 'Student']}><Materials /></ProtectedRoute>} />
                    <Route path="bulk-upload" element={<ProtectedRoute roles={['Admin', 'Faculty']}><BulkUpload /></ProtectedRoute>} />
                    <Route path="profile" element={<ProtectedRoute roles={['Student', 'Faculty', 'Admin']}><Profile /></ProtectedRoute>} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
