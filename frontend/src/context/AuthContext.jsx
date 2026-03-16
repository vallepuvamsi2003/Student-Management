import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // set default axios defaults
    axios.defaults.baseURL = 'http://localhost:5000/api';

    useEffect(() => {
        const token = localStorage.getItem('sms_token');
        const storedUser = localStorage.getItem('sms_user');

        if (token && storedUser) {
            setUser(JSON.parse(storedUser));
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
        setLoading(false);

        // Listen for profile updates to keep global user object in sync
        const handleSync = (e) => {
            const updatedProfile = e.detail;
            const currentUser = JSON.parse(localStorage.getItem('sms_user'));
            const mergedUser = { ...currentUser, name: updatedProfile.name, email: updatedProfile.email };
            localStorage.setItem('sms_user', JSON.stringify(mergedUser));
            setUser(mergedUser);
        };
        window.addEventListener('sync-user', handleSync);
        return () => window.removeEventListener('sync-user', handleSync);
    }, []);

    const login = async (email, password, role) => {
        try {
            const res = await axios.post('/auth/login', { email, password, role });
            const { token, ...userData } = res.data;

            localStorage.setItem('sms_token', token);
            localStorage.setItem('sms_user', JSON.stringify(userData));

            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setUser(userData);
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Login failed' };
        }
    };

    const loginWithGoogle = async (email, name) => {
        try {
            const res = await axios.post('/auth/google', { email, name });
            const { token, ...userData } = res.data;

            localStorage.setItem('sms_token', token);
            localStorage.setItem('sms_user', JSON.stringify(userData));

            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setUser(userData);
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Google Auth failed' };
        }
    };

    const signup = async (formData) => {
        try {
            const res = await axios.post('/auth/signup', formData);
            const { token, ...userData } = res.data;

            localStorage.setItem('sms_token', token);
            localStorage.setItem('sms_user', JSON.stringify(userData));

            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setUser(userData);
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Signup failed' };
        }
    };

    const logout = () => {
        localStorage.removeItem('sms_token');
        localStorage.removeItem('sms_user');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, signup, loginWithGoogle, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
