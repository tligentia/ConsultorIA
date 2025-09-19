import React, { useState, useEffect } from 'react';
import { LockScreen } from './LockScreen';
import App from '../App';

export const AuthenticationProvider: React.FC = () => {
    const [isLocked, setIsLocked] = useState<boolean>(true);
    const [isAuthenticating, setIsAuthenticating] = useState<boolean>(true);
    const [userIp, setUserIp] = useState<string | null>(null);

    useEffect(() => {
        const checkIpWhitelist = async () => {
            const TRUSTED_IPS = ['83.45.135.87', '37.223.23.214'];
            try {
                const response = await fetch('https://api.ipify.org?format=json');
                if (!response.ok) throw new Error('Failed to fetch IP');
                const data = await response.json();
                const fetchedUserIp = data.ip;
                setUserIp(fetchedUserIp);

                if (TRUSTED_IPS.includes(fetchedUserIp)) {
                    setIsLocked(false);
                }
            } catch (error) {
                console.warn("Could not verify IP for whitelisting. Defaulting to lock screen.", error);
                // Set a fallback IP for display purposes if the fetch fails
                setUserIp('83.45.135.87');
            } finally {
                setIsAuthenticating(false);
            }
        };

        checkIpWhitelist();
    }, []);

    if (isAuthenticating) {
        return (
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 text-slate-800">
                <svg className="animate-spin h-10 w-10 text-red-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="mt-4 text-lg text-slate-600">Verificando acceso...</p>
            </div>
        );
    }

    if (isLocked) {
        return <LockScreen onUnlock={() => setIsLocked(false)} />;
    }

    return <App userIp={userIp} />;
};