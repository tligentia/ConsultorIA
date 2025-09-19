import React, { useState, useMemo } from 'react';
import { STRINGS } from '../constants';
import { ChevronDownIcon, ChevronUpIcon } from './icons';

interface CollapsibleReportProps {
    reportText: string;
}

const REPORT_DELIMITER = '---DETALLE---';

export const CollapsibleReport: React.FC<CollapsibleReportProps> = ({ reportText }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const { summary, detail } = useMemo(() => {
        if (reportText.includes(REPORT_DELIMITER)) {
            const parts = reportText.split(REPORT_DELIMITER);
            return {
                summary: parts[0].trim(),
                detail: parts.slice(1).join(REPORT_DELIMITER).trim(),
            };
        }
        return { summary: reportText.trim(), detail: null };
    }, [reportText]);

    return (
        <div className="p-3 bg-gray-50 rounded-md border animate-fade-in">
            <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-800 text-sm">{STRINGS.dataAssessmentReportTitle}</h3>
                {detail && (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-1 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-100 transition-colors"
                        title={isExpanded ? STRINGS.collapseReportTooltip : STRINGS.expandReportTooltip}
                    >
                        {isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
                    </button>
                )}
            </div>
            <p className="text-xs text-gray-700 whitespace-pre-wrap mt-2">{summary}</p>
            {isExpanded && detail && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-700 whitespace-pre-wrap">{detail}</p>
                </div>
            )}
        </div>
    );
};