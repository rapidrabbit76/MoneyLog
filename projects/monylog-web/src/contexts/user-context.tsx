"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User } from '@/types/auth'; // Assuming you have a User type defined
import { getCurrentUser, logout as logoutUser } from '@/lib/api/auth'; // Corrected import for getting the current user

interface UserContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
    logout: () => Promise<void>; // Add logout to context
    fetchUser: () => Promise<void>; // Add getUser to context
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true); // Set initial loading state to true

    // useEffect to fetch user on mount
    useEffect(() => {
        fetchUser();
    }, []); // Empty array to run only on mount

    const logout = async () => {
        await logoutUser();
        setUser(null);
    };

    const fetchUser = async () => {
        setIsLoading(true);
        try {
            const currentUser = await getCurrentUser();
            setUser(currentUser);
        } catch (error) {
            console.error('Failed to fetch user:', error);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <UserContext.Provider value={{ user, setUser, isLoading, fetchUser, setIsLoading, logout }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = (): UserContextType => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
