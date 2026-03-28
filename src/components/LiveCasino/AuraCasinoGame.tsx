import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { casinoApi } from '../../api/client';
import { useToastStore } from '../../store/toastStore';

import Loader from '../Common/Loader';

const AuraCasinoGame: React.FC = () => {
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
        effectRan.current = true;

        const runGame = async () => {
            const isMobile = window.innerWidth <= 768;
            const gameid = localStorage.getItem('gameId');

            if (!gameid) {
                addToast('Game ID not found', 'error');
                navigate('/');
                setLoading(false);
                return;
            }

            try {
                const response: any = await casinoApi.getAuraUrl({ game_id: gameid });

                if (response?.status === 200 || response?.success) {
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
                console.error('[AuraCasinoGame] fetch failed:', error);
                addToast(error?.message || 'Error launching game', 'error');
                navigate('/');
            } finally {
                setLoading(false);
            }
        };

        runGame();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

export default AuraCasinoGame;
