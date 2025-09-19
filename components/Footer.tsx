import React from 'react';
import { STRINGS } from '../constants';

interface FooterProps {
    tokenCount: number;
    userIp?: string | null;
}

export const Footer: React.FC<FooterProps> = ({ tokenCount, userIp }) => {
    return (
        <footer className="w-full mt-8 py-4 border-t border-slate-200 text-slate-600 text-sm">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 gap-y-2 sm:gap-x-4 items-center">
                {/* Left Column */}
                <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-x-4 gap-y-1">
                    <span className="font-bold text-red-700">{STRINGS.version}</span>
                    <div className="flex items-center gap-1">
                        <span className="font-mono text-sm text-slate-800">{STRINGS.modelName}</span>
                    </div>
                    {userIp && (
                         <div className="flex items-center gap-1">
                            <span className="text-slate-600">IP:</span>
                            <span className="font-mono text-sm text-slate-800">{userIp}</span>
                        </div>
                    )}
                </div>

                {/* Right Column */}
                <div className="text-center sm:text-right">
                    <a href="https://jesus.depablos.es" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline transition">Jesus de Pablos</a>
                    <span className="mx-1">by</span>
                    <a href="https://www.tligent.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline transition">Tligent</a>
                </div>
            </div>
        </footer>
    );
};