import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockAuth } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('user');
        return saved ? JSON.parse(saved) : null;
    });

    const login = async (email, password) => {
        try {
            const userData = await mockAuth(email, password);
            updateUser(userData);
            return userData;
        } catch (error) {
            throw error;
        }
    };

    const updateUser = (userData) => {
        setUser(userData);
        if (userData) {
            localStorage.setItem('user', JSON.stringify(userData));
        } else {
            localStorage.removeItem('user');
        }
    };

    const logout = () => {
        updateUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, setUser: updateUser, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
