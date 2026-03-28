import React from 'react';
import { useUiStore } from '../../store/uiStore';
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';
import ForgotPasswordModal from './ForgotPasswordModal';

const AuthModalContainer: React.FC = () => {
    const { activeModal } = useUiStore();

    if (!activeModal) return null;

    return (
        <>
            {activeModal === 'login' && <LoginModal />}
            {activeModal === 'register' && <RegisterModal />}
            {activeModal === 'forgotPassword' && <ForgotPasswordModal />}
        </>
    );
};

export default AuthModalContainer;
