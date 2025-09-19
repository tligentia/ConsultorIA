import React from 'react';
import type { Expert, LoadingAction } from '../types';
import { STRINGS } from '../constants';
import { LoadingSpinner, TrashIcon } from './icons';

interface ExpertCardProps {
  expert: Expert;
  loadingAction: LoadingAction;
  onGenerateOpinion: (expertId: string, stance: 'for' | 'against') => void;
  onDelete?: (expertId: string) => void;
}

export const ExpertCard: React.FC<ExpertCardProps> = ({ expert, loadingAction, onGenerateOpinion, onDelete }) => {
  const isLoadingFor = loadingAction === `opinion-${expert.id}-for`;
  const isLoadingAgainst = loadingAction === `opinion-${expert.id}-against`;

  const teamColorClass = expert.team === 'red' ? 'border-red-400' : expert.team === 'green' ? 'border-green-400' : 'border-gray-200';
  const teamBgClass = expert.team === 'red' ? 'bg-red-50' : expert.team === 'green' ? 'bg-green-50' : 'bg-white';
  const badgeColorClass = expert.team === 'red' ? 'bg-red-600' : expert.team === 'green' ? 'bg-green-600' : '';

  return (
    <div className={`p-2 rounded-lg border-l-2 transition-all ${teamColorClass} ${teamBgClass}`}>
      <div className="flex justify-between items-start">
        <h3 className="font-semibold text-gray-800 text-sm pr-2">{expert.title}</h3>
        <div className="flex items-center space-x-2 flex-shrink-0">
          {expert.positioningIndex !== null && (
            <span className={`text-xs font-bold text-white ${badgeColorClass} px-2 py-0.5 rounded-full`}>
              {expert.positioningIndex} / 10
            </span>
          )}
          {expert.isCustom && onDelete && (
            <button
              onClick={() => onDelete(expert.id)}
              className="p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-100 transition-colors"
              aria-label={`Eliminar experto ${expert.title}`}
              title={STRINGS.deleteExpertTooltip(expert.title)}
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {expert.opinionFor && (
        <div className="mt-1 text-xs bg-green-50 text-green-800 px-2 py-1 rounded-md border border-green-200">
          <strong className="font-medium">A Favor:</strong> {expert.opinionFor}
        </div>
      )}
      {expert.opinionAgainst && (
        <div className="mt-1 text-xs bg-red-50 text-red-800 px-2 py-1 rounded-md border border-red-200">
          <strong className="font-medium">En Contra:</strong> {expert.opinionAgainst}
        </div>
      )}

      <div className="flex gap-1 mt-1">
        <button
          onClick={() => onGenerateOpinion(expert.id, 'for')}
          disabled={!!loadingAction}
          className="flex-1 text-xs px-2 py-1 bg-green-600 text-white font-semibold rounded hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed flex items-center justify-center"
          title={STRINGS.argumentForButton}
        >
          {isLoadingFor ? <LoadingSpinner className="h-4 w-4 text-white" /> : STRINGS.argumentForButton}
        </button>
        <button
          onClick={() => onGenerateOpinion(expert.id, 'against')}
          disabled={!!loadingAction}
          className="flex-1 text-xs px-2 py-1 bg-red-600 text-white font-semibold rounded hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed flex items-center justify-center"
          title={STRINGS.argumentAgainstButton}
        >
          {isLoadingAgainst ? <LoadingSpinner className="h-4 w-4 text-white" /> : STRINGS.argumentAgainstButton}
        </button>
      </div>
    </div>
  );
};