import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { casinoApi } from '../../api/client';
import { useToastStore } from '../../store/toastStore';

import Loader from '../Common/Loader';

const DreamCasinoGame: React.FC = () => {
    const navigate = useNavigate();
    const { addToast } = useToastStore();

    const [loading, setLoading] = useState(true);
    const [gameUrl, setGameUrl] = useState<string | undefined>();
    const [width, setWidth] = useState<number>(window.innerWidth);

    useEffect(() => {
        const handleWindowSizeChange = () => setWidth(window.innerWidth);
        window.addEventListener('resize', handleWindowSizeChange);
        return () => window.removeEventListener('resize', handleWindowSizeChange);
    }, []);

    const effectRan = React.useRef(false);

    useEffect(() => {
        if (effectRan.current === true) return;

        const fetchIpAndRunGame = async () => {
            effectRan.current = true;
            try {
                const response = await fetch('https://api.ipify.org?format=json');
                const data = await response.json();
                runGame(data.ip);
            } catch (error) {
                console.error('[DreamCasinoGame] IP fetch failed:', error);
                setLoading(false);
            }
        };

        fetchIpAndRunGame();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const runGame = async (ip: string) => {
        const isMobile = width <= 768;
        const gameid = localStorage.getItem('gameId');

        if (!gameid) {
            addToast('Game ID not found', 'error');
            navigate('/');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('gameId', String(gameid));
            formData.append('clientId', ip);

            const response: any = await casinoApi.getDreamGameUrl(formData);

            if (response?.status === 200 || response?.success) {
                // Handle multiple response formats: string URL directly, or nested in data object
                const rawData = response?.data;
                const url = typeof rawData === 'string'
                    ? rawData
                    : rawData?.url || rawData?.gameUrl || rawData?.launch_url || rawData?.link || rawData?.game_url || '';

                if (url) {
                    if (isMobile) {
                        window.location.replace(url);
                    } else {
                        setGameUrl(url);
                    }
                } else {
                    addToast('Game URL not found in response', 'error');
                    navigate('/');
                }
            } else {
                addToast(response?.message || 'Failed to get game URL', 'error');
                navigate('/');
            }
        } catch (error: any) {
            console.error('[DreamCasinoGame] game URL fetch failed:', error);
            addToast(error?.message || 'Error launching game', 'error');
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] bg-black flex flex-col">
            {loading ? (
                <Loader fullScreen />
            ) : (
                gameUrl && (
                    <iframe
                        title="Embedded Content"
                        src={gameUrl}
                        className="w-full h-full border-none bg-black"
                        allowFullScreen
                    />
                )
            )}
        </div>
    );
};

export default DreamCasinoGame;
