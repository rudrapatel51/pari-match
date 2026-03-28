import React, { useState, useEffect } from 'react';

import { FiMail, FiSmartphone, FiEye, FiEyeOff } from 'react-icons/fi';
import { FaGoogle, FaTelegram, FaApple, FaTwitter } from 'react-icons/fa';

import { getIpAddress } from '../../utils/network';
import { useAuth } from '../../hooks/useAuth';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import { useToastStore } from '../../store/toastStore';

interface LoginFormProps {
    onSuccess?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
    const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
    const [identifier, setIdentifier] = useState(''); // email (username) or phone
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [otpTimer, setOtpTimer] = useState(0);
    const [ageVerified, setAgeVerified] = useState(false);

    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const { login, isLoggingIn, sendLoginOtp, isSendingLoginOtp, verifyLoginOtp, isVerifyingLoginOtp } = useAuth();
    const { openModal } = useUiStore();
    const { rememberedUsername } = useAuthStore();
    const toast = useToastStore();

    // Pre-fill username if remember me is enabled
    useEffect(() => {
        if (rememberedUsername && loginMethod === 'email') {
            setIdentifier(rememberedUsername);
            setRememberMe(true);
        }
    }, [rememberedUsername, loginMethod]);

    // OTP countdown timer
    useEffect(() => {
        let interval: number | undefined;
        if (otpTimer > 0) {
            interval = window.setInterval(() => {
                setOtpTimer(prev => prev - 1);
            }, 1000);
        }
        return () => {
            if (interval) window.clearInterval(interval);
        };
    }, [otpTimer]);

    const handleSendOtp = async () => {
        if (!identifier.trim()) {
            return;
        }

        if (identifier.length !== 10 || !/^\d+$/.test(identifier)) {
            return;
        }

        try {
            await sendLoginOtp({ mobile: identifier, type: 'login' }, {
                onSuccess: () => {
                    setIsOtpSent(true);
                    setOtpTimer(60); // 60 seconds countdown
                }
            });
        } catch (error: any) {
            console.error('[LoginForm] send OTP failed:', error);
        }
    };

    const handleResendOtp = async () => {
        if (otpTimer > 0) return;
        await handleSendOtp();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Age verification check (for both methods)
        if (!ageVerified) {
            toast.warning('Please confirm you are 18 years or older');
            return;
        }

        const ip = await getIpAddress();

        if (loginMethod === 'email') {
            // Password Login
            login({
                username: identifier,
                password,
                login_type: 'password',
                remember: rememberMe,
                device_type: 'Web',
                device_app_version: '1.0',
                ip_address: ip
            }, {
                onSuccess: () => {
                    if (onSuccess) onSuccess();
                }
            });
        } else {
            // Phone Login (OTP)
            if (!isOtpSent) {
                await handleSendOtp();
            } else {
                // Verify OTP
                if (!otp || otp.length !== 4) {
                    toast.warning('Please enter a valid 4-digit OTP');
                    return;
                }

                verifyLoginOtp({
                    mobile: identifier,
                    otp,
                    type: 'login',
                    ip_address: ip
                }, {
                    onSuccess: () => {
                        if (onSuccess) onSuccess();
                    }
                });
            }
        }
    };

    // Reset OTP state when switching to phone method
    const handleMethodSwitch = (method: 'email' | 'phone') => {
        setLoginMethod(method);
        setIsOtpSent(false);
        setOtp('');
        setOtpTimer(0);
    };

    return (
        <div className="space-y-6">
            {/* Tabs */}
            <div className="flex space-x-2 bg-bg-light-blue dark:bg-neutral-gray-50 p-1 rounded-lg">
                <button
                    onClick={() => handleMethodSwitch('email')}
                    className={`flex-1 flex items-center justify-center space-x-2 py-2.5 text-sm font-semibold rounded-md transition-all ${loginMethod === 'email'
                        ? 'bg-brand-accent text-black shadow-md'
                        : 'text-neutral-gray-600 hover:bg-bg-light-blue'
                        }`}
                >
                    <FiMail className="w-4 h-4" />
                    <span>By email / ID</span>
                </button>
                <button
                    onClick={() => handleMethodSwitch('phone')}
                    className={`flex-1 flex items-center justify-center space-x-2 py-2.5 text-sm font-semibold rounded-md transition-all ${loginMethod === 'phone'
                        ? 'bg-brand-accent text-black shadow-md'
                        : 'text-neutral-gray-600 hover:bg-bg-light-blue'
                        }`}
                >
                    <FiSmartphone className="w-4 h-4" />
                    <span>By phone</span>
                </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-4">
                    {loginMethod === 'email' ? (
                        <div className="relative">
                            <input
                                type="text"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                placeholder="Username or Email"
                                className="w-full pl-4 pr-4 py-3 bg-bg-white dark:bg-neutral-gray-50 border border-stroke-primary dark:border-neutral-gray-300 text-neutral-gray-900 rounded-lg focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all placeholder-neutral-gray-600"
                                required
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-neutral-gray-600">
                                <FiMail />
                            </div>
                        </div>
                    ) : (
                        <div className="relative">
                            <input
                                type="tel"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                placeholder="Phone number"
                                className="w-full pl-4 pr-4 py-3 bg-bg-white dark:bg-neutral-gray-50 border border-stroke-primary dark:border-neutral-gray-300 text-neutral-gray-900 rounded-lg focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all placeholder-neutral-gray-600"
                                required
                                disabled={isOtpSent}
                                maxLength={10}
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-neutral-gray-600">
                                <FiSmartphone />
                            </div>
                        </div>
                    )}

                    {loginMethod === 'email' && (
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                                className="w-full pl-4 pr-10 py-3 bg-bg-white dark:bg-neutral-gray-50 border border-stroke-primary dark:border-neutral-gray-300 text-neutral-gray-900 rounded-lg focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all placeholder-neutral-gray-600"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-gray-600 hover:text-brand-text transition-colors"
                            >
                                {showPassword ? <FiEyeOff /> : <FiEye />}
                            </button>
                        </div>
                    )}

                    {loginMethod === 'phone' && isOtpSent && (
                        <div className="space-y-2">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                    placeholder="Enter 4-digit OTP"
                                    className="w-full pl-4 pr-4 py-3 bg-bg-white dark:bg-neutral-gray-50 border border-stroke-primary dark:border-neutral-gray-300 text-neutral-gray-900 rounded-lg focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all placeholder-neutral-gray-600"
                                    required
                                    maxLength={4}
                                />
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-neutral-gray-600">
                                    {otpTimer > 0 ? `Resend OTP in ${otpTimer}s` : 'Didn\'t receive OTP?'}
                                </span>
                                <button
                                    type="button"
                                    onClick={handleResendOtp}
                                    disabled={otpTimer > 0 || isSendingLoginOtp}
                                    className="text-brand-text hover:text-brand-text font-medium hover:underline transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSendingLoginOtp ? 'Sending...' : 'Resend OTP'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Age Verification Checkbox */}
                <label className="flex items-start space-x-2 cursor-pointer group">
                    <input
                        type="checkbox"
                        checked={ageVerified}
                        onChange={(e) => setAgeVerified(e.target.checked)}
                        className="w-4 h-4 mt-0.5 rounded border-stroke-primary dark:border-neutral-gray-300 text-brand-primary focus:ring-brand-primary cursor-pointer"
                    />
                    <span className="text-sm text-neutral-gray-600 group-hover:text-brand-text transition-colors">
                        I certify that I am 18 years of age or older, and I agree to the{' '}
                        <a href="/terms" className="text-brand-text hover:underline">User Agreement</a> and{' '}
                        <a href="/privacy" className="text-brand-text hover:underline">Privacy Policy</a>
                    </span>
                </label>

                <div className="flex items-center justify-between text-sm">
                    {loginMethod === 'email' && (
                        <>
                            <label className="flex items-center space-x-2 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="w-4 h-4 rounded border-stroke-primary dark:border-neutral-gray-300 text-brand-primary focus:ring-brand-primary cursor-pointer"
                                />
                                <span className="text-neutral-gray-600 group-hover:text-brand-text transition-colors">Remember me</span>
                            </label>
                            <button
                                type="button"
                                onClick={() => openModal('forgotPassword')}
                                className="text-brand-text hover:text-brand-text font-medium hover:underline transition-all"
                            >
                                Forgot your password?
                            </button>
                        </>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={isLoggingIn || isSendingLoginOtp || isVerifyingLoginOtp || !ageVerified}
                    className="w-full bg-brand-accent hover:brightness-110 text-black font-bold py-3.5 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loginMethod === 'email'
                        ? (isLoggingIn ? 'LOGGING IN...' : 'LOG IN')
                        : isOtpSent
                            ? (isVerifyingLoginOtp ? 'VERIFYING...' : 'VERIFY & LOGIN')
                            : (isSendingLoginOtp ? 'SENDING OTP...' : 'SEND OTP')
                    }
                </button>
            </form>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-stroke-light"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-bg-white px-2 text-brand-text">You can log in to your account via</span>
                </div>
            </div>

            {/* Social Login */}
            <div className="grid grid-cols-4 gap-3">
                <button className="flex items-center justify-center py-2.5 bg-bg-light-blue dark:bg-neutral-gray-50 border border-stroke-primary dark:border-neutral-gray-300 hover:bg-stroke-light rounded-lg text-brand-text transition-colors">
                    <FaGoogle className="w-5 h-5 text-brand-primary" />
                </button>
                <button className="flex items-center justify-center py-2.5 bg-bg-light-blue dark:bg-neutral-gray-50 border border-stroke-primary dark:border-neutral-gray-300 hover:bg-stroke-light rounded-lg text-brand-text transition-colors">
                    <FaTelegram className="w-5 h-5 text-brand-primary" />
                </button>
                <button className="flex items-center justify-center py-2.5 bg-bg-light-blue dark:bg-neutral-gray-50 border border-stroke-primary dark:border-neutral-gray-300 hover:bg-stroke-light rounded-lg text-brand-text transition-colors">
                    <FaTwitter className="w-5 h-5 text-neutral-gray-800" />
                </button>
                <button className="flex items-center justify-center py-2.5 bg-bg-light-blue dark:bg-neutral-gray-50 border border-stroke-primary dark:border-neutral-gray-300 hover:bg-stroke-light rounded-lg text-brand-text transition-colors">
                    <FaApple className="w-5 h-5 text-neutral-gray-800" />
                </button>
            </div>

            {/* Registration Link */}
            <div className="text-center pt-2">
                <p className="text-sm text-neutral-gray-600">
                    Don't have an account yet?{' '}
                    <button
                        onClick={() => openModal('register')}
                        className="text-brand-text font-bold hover:underline"
                    >
                        Registration
                    </button>
                </p>
            </div>
        </div>
    );
};

export default LoginForm;
