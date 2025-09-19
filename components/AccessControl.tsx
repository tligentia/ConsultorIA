
import React, { useState } from 'react';
import { LockScreen } from './LockScreen';

interface AccessControlProps {
    children: React.ReactNode;
}

const AccessControl: React.FC<AccessControlProps> = ({ children }) => {
    const [isUnlocked, setIsUnlocked] = useState(false);

    const handleUnlock = () => {
        setIsUnlocked(true);
    };

    if (!isUnlocked) {
        return <LockScreen onUnlock={handleUnlock} />;
    }

    return <>{children}</>;
};

export default AccessControl;
