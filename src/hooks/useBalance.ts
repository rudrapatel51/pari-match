import { useQuery, useQueryClient } from '@tanstack/react-query';
import { userApi } from '../api/client';
import { useAuthStore } from '../store/authStore';

export interface BalanceData {
    mainBalance: number;
    bonusBalance: number;
    lockedBalance: number;
    withdrawableBalance: number;
    totalAvailable: number;
    totalBalance: number;
    activeWagers: any[];
    totalExposure: number;
    currency?: string;
}

export const useBalance = () => {
    const { isAuthenticated } = useAuthStore();
    const queryClient = useQueryClient();

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['user', 'balance'],
        queryFn: async () => {
            const response = await userApi.balance();
            return response.data;
        },
        enabled: isAuthenticated,
        refetchInterval: 5000,
        retry: false,
    });

    const balanceData = data as BalanceData | undefined;

    return {
        balanceData,
        isLoading,
        error,
        refreshBalance: refetch,
        totalBalance: balanceData?.totalBalance || 0,
        mainBalance: balanceData?.mainBalance || 0,
        bonusBalance: balanceData?.bonusBalance || 0,
        lockedBalance: balanceData?.lockedBalance || 0,
        withdrawableBalance: balanceData?.withdrawableBalance || 0,
        totalAvailable: balanceData?.totalAvailable || 0,
        totalExposure: balanceData?.totalExposure || 0,
        activeWagers: balanceData?.activeWagers || [],
    };
};
