import React from 'react';
import AuthModalWrapper from './AuthModalWrapper';
import LoginForm from './LoginForm';
import { useUiStore } from '../../store/uiStore';

const LoginModal: React.FC = () => {
    const { closeModal } = useUiStore();

    return (
        <AuthModalWrapper title="Log In" size="lg">
            <LoginForm onSuccess={closeModal} />
        </AuthModalWrapper>
    );
};

export default LoginModal;
