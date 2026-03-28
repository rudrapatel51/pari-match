import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const PrivateRoute: React.FC = () => {
    const { isAuthenticated, isLoading, user } = useAuthStore();
    const location = useLocation();

    if (isLoading) {
        return <div className="flex items-center justify-center h-screen text-brand-primary">Loading...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    // Force password change on first login
    if (user?.change_password && location.pathname !== '/change-password') {
        return <Navigate to="/change-password" replace />;
    }

    return <Outlet />;
};

export default PrivateRoute;
