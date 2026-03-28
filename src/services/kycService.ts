import apiClient, { ApiResponse } from '../api/client';
import { Endpoints } from '../api/endpoints';
import { KycDocumentType, GetKycResponse } from '../types/auth';

export const kycService = {
    getDocumentTypes: async (): Promise<KycDocumentType[]> => {
        try {
            // apiClient interceptor returns the response body (ApiResponse)
            const response = await apiClient.get<any, ApiResponse<KycDocumentType[]>>(Endpoints.KYC_DOCUMENT_TYPES);
            return response.data;
        } catch (error) {
            console.error("Error fetching document types:", error);
            throw error;
        }
    },

    getKycStatus: async (): Promise<GetKycResponse['data']> => {
        try {
            const response = await apiClient.post<any, GetKycResponse>(Endpoints.GET_KYC, {});
            return response.data;
        } catch (error) {
            console.error("Error fetching KYC status:", error);
            throw error;
        }
    },

    submitKyc: async (formData: FormData): Promise<any> => {
        try {
            const response = await apiClient.post<any, ApiResponse>(Endpoints.UPDATE_KYC, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response;
        } catch (error) {
            console.error("Error submitting KYC:", error);
            throw error;
        }
    }
};
