import { Routes, Route, Navigate } from 'react-router-dom';
import { useIsAuthenticated } from '@azure/msal-react';
import HomePage from '../pages/home';
import Index from '../pages/Index';

export const AppRoutes = () => {
    const isAuthenticated = useIsAuthenticated();

    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route
                path="/index"
                element={
                    isAuthenticated ? (
                        <Index />
                    ) : (
                        <Navigate to="/" replace />
                    )
                }
            />
        </Routes>
    );
};

