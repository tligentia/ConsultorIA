import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';
import { STRINGS } from '../constants';
import { SendIcon, LoadingSpinner } from './icons';

interface ChatPanelProps {
  isReady: boolean;
  onSendMessage: (message: string) => Promise<void>;
  chatHistory: ChatMessage[];
  isChatLoading: boolean;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ isReady, onSendMessage, chatHistory, isChatLoading }) => {
  const [input, setInput] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleSend = async () => {
    const userMessage = input.trim();
    if (!userMessage || isChatLoading || !isReady) return;

    setInput('');
    await onSendMessage(userMessage);
  };

  return (
    <div className="bg-white rounded-lg shadow-md sticky top-24 flex flex-col h-[calc(100vh-8rem)] max-h-[700px]">
      <h2 className="text-lg font-bold px-4 py-3 border-b flex-shrink-0">{STRINGS.chatTitle}</h2>
      <div
        ref={chatContainerRef}
        className="flex-grow p-4 space-y-4 overflow-y-auto"
      >
        {!isReady ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-400 text-sm text-center">{STRINGS.chatWelcomeMessage}</p>
          </div>
        ) : chatHistory.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-400 text-sm text-center">Puedes empezar a preguntar.</p>
          </div>
        ) : (
          chatHistory.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-xl shadow-sm ${msg.role === 'user' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-800'}`}>
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))
        )}
        {isChatLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-800 rounded-xl px-4 py-2 inline-flex items-center shadow-sm">
              <span className="w-2 h-2 bg-gray-500 rounded-full animate-pulse mr-1.5" style={{ animationDelay: '0s' }}></span>
              <span className="w-2 h-2 bg-gray-500 rounded-full animate-pulse mr-1.5" style={{ animationDelay: '0.1s' }}></span>
              <span className="w-2 h-2 bg-gray-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span>
            </div>
          </div>
        )}
      </div>
      <div className="p-4 border-t flex-shrink-0">
        <div className="relative">
          <input
            type="text"
            placeholder={STRINGS.chatInputPlaceholder}
            disabled={!isReady || isChatLoading}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            className="w-full form-input pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm disabled:bg-gray-100 focus:ring-red-500 focus:border-red-500"
          />
          <button
            onClick={handleSend}
            disabled={!isReady || isChatLoading || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:text-red-600 rounded-full disabled:text-gray-300 disabled:cursor-not-allowed"
            title={STRINGS.chatSendTooltip}
          >
            {isChatLoading ? <LoadingSpinner className="h-5 w-5"/> : <SendIcon />}
          </button>
        </div>
      </div>
    </div>
  );
};