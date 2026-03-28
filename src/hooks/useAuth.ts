import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi, userApi } from '../api/client';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import type { User, PasswordLoginRequest, SendOtpRequest, VerifyLoginOtpRequest, RegisterSendOtpRequest, RegisterVerifyOtpRequest, ForgotPasswordVerifyOtpRequest, ResetPasswordRequest, ChangePasswordRequest } from '../types/auth';

const fetchIpAddress = async (): Promise<string> => {
    try {
        const res = await fetch('https://api.ipify.org?format=json');
        const data = await res.json();
        return data.ip || '0.0.0.0';
    } catch {
        return '0.0.0.0';
    }
};

export const useAuth = () => {
    const { setAuth, logout: storeLogout, user, isAuthenticated } = useAuthStore();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // --- Login Mutations ---
    const loginMutation = useMutation({
        mutationFn: async (data: PasswordLoginRequest) => {
            const ip = data.ip_address || await fetchIpAddress();
            return authApi.login({ ...data, ip_address: ip });
        },
        onSuccess: (response, variables) => {
            // API returns: { data: { user, token, session_token, ... }, message, status }
            const { user, token, session_token } = response.data;

            // Store both tokens
            if (session_token) {
                localStorage.setItem('sessionToken', session_token);
            }

            setAuth(user, token, variables.remember);
            navigate('/');
        },
        onError: (error: Error) => console.error('Login failed:', error)
    });

    const sendLoginOtpMutation = useMutation({
        mutationFn: authApi.sendLoginOtp
    });

    const verifyLoginOtpMutation = useMutation({
        mutationFn: authApi.verifyLoginOtp,
        onSuccess: (response) => {
            // API returns: { data: { data: { user, token, session_token, ... } }, message, status }
            // Or sometimes: { data: { user, token, session_token, ... }, message, status }
            const responseData = response.data as any;
            const data = responseData?.data || response.data;
            const { user, token, session_token } = data;

            // Store both tokens
            if (session_token) {
                localStorage.setItem('sessionToken', session_token);
            }

            setAuth(user, token);
            navigate('/');
        },
        onError: (error: Error) => console.error('OTP Login failed:', error)
    });

    // --- Register Mutations ---
    const registerSendOtpMutation = useMutation({
        mutationFn: authApi.registerSendOtp
    });

    const registerVerifyOtpMutation = useMutation({
        mutationFn: authApi.registerVerifyOtp,
        onSuccess: (response) => {
            // API returns: { data: { user, token, session_token, ... }, message, status }
            const { user, token, session_token } = response.data;

            // Store both tokens
            if (session_token) {
                localStorage.setItem('sessionToken', session_token);
            }

            setAuth(user, token);
            navigate('/');
        },
        onError: (error: Error) => console.error('Registration failed:', error)
    });

    // --- Forgot Password Mutations ---
    const forgotPasswordSendOtpMutation = useMutation({
        mutationFn: authApi.sendForgotPasswordOtp
    });

    const forgotPasswordVerifyOtpMutation = useMutation({
        mutationFn: authApi.verifyForgotPasswordOtp
    });

    const resetPasswordMutation = useMutation({
        mutationFn: authApi.resetPassword,
        onSuccess: () => {
            navigate('/');
        }
    });

    // --- Logout Mutation ---
    const logoutMutation = useMutation({
        mutationFn: authApi.logout,
        onSettled: () => {
            storeLogout();
            queryClient.clear();
            navigate('/');
        }
    });

    // --- Change Password Mutation ---
    const changePasswordMutation = useMutation({
        mutationFn: authApi.changePassword,
        onSuccess: () => {
            // Optionally logout user to force re-login with new password
            // storeLogout();
            // navigate('/login');
        },
        onError: (error: Error) => console.error('Change password failed:', error)
    });

    // --- Get Country Codes Query ---
    const { data: countryCodes, isLoading: isLoadingCountryCodes } = useQuery({
        queryKey: ['countryCodes'],
        queryFn: async () => {
            const response = await authApi.getCountryCodes();
            return response.data || [];
        },
        staleTime: 1000 * 60 * 60, // 1 hour - country codes don't change often
    });

    // --- Verify Token / Fetch Profile on load ---
    const { isLoading: isVerifying } = useQuery({
        queryKey: ['auth', 'verify'],
        queryFn: async () => {
            const token = localStorage.getItem('authToken');
            if (!token) return null;

            try {
                // Use verifyToken endpoint to validate session explicitly if needed, or just getProfile
                await authApi.verifyToken({ token });

                // Then fetch profile to get up-to-date user data
                const response = await userApi.getProfile();
                if (response.data) {
                    setAuth(response.data as User, token);
                    return response.data;
                }
            } catch (e) {
                storeLogout();
                throw e;
            }
        },
        retry: false,
        enabled: !!localStorage.getItem('authToken') && !isAuthenticated,
        refetchInterval: (query) => {
            // Polling logic: 2s on game pages (not impl yet), 6m otherwise
            return 6 * 60 * 1000;
        }
    });

    return {
        user,
        isAuthenticated,
        // Login
        login: loginMutation.mutate,
        isLoggingIn: loginMutation.isPending,
        sendLoginOtp: sendLoginOtpMutation.mutateAsync,
        isSendingLoginOtp: sendLoginOtpMutation.isPending,
        verifyLoginOtp: verifyLoginOtpMutation.mutate,
        isVerifyingLoginOtp: verifyLoginOtpMutation.isPending,

        // Register
        registerSendOtp: registerSendOtpMutation.mutateAsync,
        isSendingRegisterOtp: registerSendOtpMutation.isPending,
        registerSendOtpError: registerSendOtpMutation.error,
        registerVerifyOtp: registerVerifyOtpMutation.mutate,
        isRegistering: registerVerifyOtpMutation.isPending,
        registerVerifyOtpError: registerVerifyOtpMutation.error,

        // Forgot Password
        sendForgotPasswordOtp: forgotPasswordSendOtpMutation.mutateAsync,
        isSendingForgotOtp: forgotPasswordSendOtpMutation.isPending,
        verifyForgotPasswordOtp: forgotPasswordVerifyOtpMutation.mutateAsync,
        isVerifyingForgotOtp: forgotPasswordVerifyOtpMutation.isPending,
        resetPassword: resetPasswordMutation.mutateAsync,
        isResettingPassword: resetPasswordMutation.isPending,

        // Change Password
        changePassword: changePasswordMutation.mutateAsync,
        isChangingPassword: changePasswordMutation.isPending,

        // Common
        logout: logoutMutation.mutate,
        isLoggingOut: logoutMutation.isPending,
        isVerifying,
        loginError: loginMutation.error,

        // Country Codes
        countryCodes: countryCodes || [],
        isLoadingCountryCodes,
    };
};
