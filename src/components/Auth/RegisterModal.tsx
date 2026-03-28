import React from 'react';
import AuthModalWrapper from './AuthModalWrapper';
import RegisterForm from './RegisterForm';
import { useUiStore } from '../../store/uiStore';

const RegisterModal: React.FC = () => {
    const { closeModal } = useUiStore();

    return (
        <AuthModalWrapper title="Registration" size="lg">
            <RegisterForm onSuccess={closeModal} />
        </AuthModalWrapper>
    );
};

export default RegisterModal;
