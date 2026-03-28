export const formatCurrency = (amount: number | string, currency: string = 'INR'): string => {
    const num = Number(amount);
    if (isNaN(num)) return '0';

    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(num);
};

export const formatDate = (date: string | Date): string => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
};

export const formatDateTime = (date: string | Date): string => {
    if (!date) return '';
    return new Date(date).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};
