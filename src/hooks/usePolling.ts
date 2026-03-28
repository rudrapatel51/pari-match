import { useEffect, useRef } from 'react';

export const usePolling = (callback: () => void, delay: number | null) => {
    const savedCallback = useRef(callback);

    // Remember the latest callback if it changes.
    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    // Set up the interval.
    useEffect(() => {
        // Don't poll if delay is null
        if (delay === null) {
            return;
        }

        const id = setInterval(() => {
            savedCallback.current();
        }, delay);

        return () => clearInterval(id);
    }, [delay]);
};
