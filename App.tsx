import React, { useState, useCallback, useEffect, useRef } from 'react';
import { STRINGS } from './constants';
import type { RagSource, Expert, ChatMessage, Consultation, LoadingAction } from './types';
import { AnalysisStage } from './types';
import { Footer } from './components/Footer';
import { LoadingSpinner, SaveIcon } from './components/icons';
import { generateExperts, generateExpertOpinion, generateChatResponse, verifyFacts, generateTeamNames } from './services/geminiService';
import { RagManagerModal } from './components/RagManagerModal';
import { ExpertCard } from './components/ExpertCard';
import { ChatPanel } from './components/ChatPanel';
import { CollapsibleReport } from './components/CollapsibleReport';

interface AppProps {
    userIp?: string | null;
}

const App: React.FC<AppProps> = ({ userIp }) => {
    const [ragSources, setRagSources] = useState<RagSource[]>([]);
    const [experts, setExperts] = useState<Expert[]>([]);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [analysisStage, setAnalysisStage] = useState<AnalysisStage>(AnalysisStage.IDLE);
    const [loadingAction, setLoadingAction] = useState<LoadingAction>(null);

    const [dataAssessmentResult, setDataAssessmentResult] = useState<string | null>(null);
    const [teamRedName, setTeamRedName] = useState(STRINGS.expertsTeamRed);
    const [teamGreenName, setTeamGreenName] = useState(STRINGS.expertsTeamGreen);
    
    const [analysisError, setAnalysisError] = useState<string | null>(null);
    const [isRagModalOpen, setIsRagModalOpen] = useState(false);
    const [isAddingExpert, setIsAddingExpert] = useState(false);
    const [newExpertTitle, setNewExpertTitle] = useState('');
    const [isSavingConsultation, setIsSavingConsultation] = useState(false);
    const [consultationName, setConsultationName] = useState('');
    const [sourcesChangedWarning, setSourcesChangedWarning] = useState(false);

    const sourcesRef = useRef<string>(JSON.stringify(ragSources));

    useEffect(() => {
        const currentSources = JSON.stringify(ragSources);
        if (sourcesRef.current !== currentSources) {
            if (analysisStage !== AnalysisStage.IDLE) {
                setAnalysisStage(AnalysisStage.IDLE);
                setExperts(prev => prev.filter(e => e.isCustom));
                setDataAssessmentResult(null);
                setTeamRedName(STRINGS.expertsTeamRed);
                setTeamGreenName(STRINGS.expertsTeamGreen);
                setChatHistory([]);
                setSourcesChangedWarning(true);
                const timer = setTimeout(() => setSourcesChangedWarning(false), 5000);
                return () => clearTimeout(timer);
            }
            sourcesRef.current = currentSources;
        }
    }, [ragSources, analysisStage]);

    useEffect(() => {
        try {
            const savedCustomExperts: Expert[] = JSON.parse(localStorage.getItem('customExperts') || '[]');
            setExperts(savedCustomExperts);
        } catch (error) {
            console.error("Failed to load custom experts from localStorage:", error);
            setExperts([]);
        }
    }, []);

    const activeRagSources = ragSources.filter(s => s.status === 'active');

    const saveCustomExperts = (currentExperts: Expert[]) => {
        const customExperts = currentExperts.filter(e => e.isCustom);
        localStorage.setItem('customExperts', JSON.stringify(customExperts));
    };

    const handleClearCache = () => {
        localStorage.removeItem('customExperts');
        localStorage.removeItem('consultationHistory');
        setRagSources([]);
        setExperts([]);
        setChatHistory([]);
        setAnalysisStage(AnalysisStage.IDLE);
        setAnalysisError(null);
        setDataAssessmentResult(null);
        setTeamRedName(STRINGS.expertsTeamRed);
        setTeamGreenName(STRINGS.expertsTeamGreen);
    };
    
    const handleSaveCustomExpert = () => {
        if (!newExpertTitle.trim()) return;
        const newExpert: Expert = {
            id: `custom-${Date.now()}`, title: newExpertTitle.trim(), isCustom: true, opinionFor: null, opinionAgainst: null, team: null, positioningIndex: null,
        };
        const updatedExperts = [...experts, newExpert];
        setExperts(updatedExperts);
        saveCustomExperts(updatedExperts);
        setNewExpertTitle('');
        setIsAddingExpert(false);
    };

    const handleDeleteExpert = (expertId: string) => {
        const updatedExperts = experts.filter(e => e.id !== expertId);
        setExperts(updatedExperts);
        saveCustomExperts(updatedExperts);
    };

    const loadDefaultExperts = () => {
        const defaultExpertTitles = ['Analista de Riesgos', 'Estratega Financiero', 'Experto Legal', 'Consultor de Operaciones'];
        const newExperts: Expert[] = defaultExpertTitles.map((title, index) => ({
            id: `default-${index}`, title, isCustom: false, opinionFor: null, opinionAgainst: null, team: null, positioningIndex: null,
        }));
        const customExperts = experts.filter(e => e.isCustom);
        setExperts([...customExperts, ...newExperts]);
    };

    const handleStartAnalysis = async () => {
        if (activeRagSources.length === 0) return;
        setLoadingAction('analysis');
        setAnalysisError(null);
        setDataAssessmentResult(null);
        setChatHistory([]);
        
        setExperts(prev => prev.filter(e => e.isCustom));

        try {
            const ragContent = activeRagSources.map(s => s.content).join(', ');
            const expertTitles = await generateExperts(ragContent);
            const newExperts: Expert[] = expertTitles.map((title, index) => ({
                id: `expert-${index}`, title, isCustom: false, opinionFor: null, opinionAgainst: null, team: null, positioningIndex: null,
            }));
            
            setExperts(prev => [...prev.filter(e => e.isCustom), ...newExperts]);
            setAnalysisStage(AnalysisStage.ANALYSIS_STARTED);
        } catch (error) {
            console.error("Failed to start analysis:", error);
            setAnalysisError(STRINGS.analysisErrorDefault);
            loadDefaultExperts();
            setAnalysisStage(AnalysisStage.ANALYSIS_STARTED);
        } finally {
            setLoadingAction(null);
        }
    };

    const handleGenerateOpinion = useCallback(async (expertId: string, stance: 'for' | 'against') => {
        const loadingKey: LoadingAction = `opinion-${expertId}-${stance}`;
        setLoadingAction(loadingKey);
        setDataAssessmentResult(null);
        setAnalysisStage(AnalysisStage.ANALYSIS_STARTED);
        try {
            const expert = experts.find(e => e.id === expertId);
            if (!expert) return;

            const ragContent = activeRagSources.map(s => s.content).join(', ');
            const opinion = await generateExpertOpinion(expert.title, ragContent, stance === 'for' ? 'a favor' : 'en contra');
            
            setExperts(prev => {
                const updated = prev.map(e => e.id === expertId ? { ...e, [stance === 'for' ? 'opinionFor' : 'opinionAgainst']: opinion } : e);
                if (updated.some(e => e.opinionFor || e.opinionAgainst)) {
                    setAnalysisStage(AnalysisStage.OPINIONS_GENERATED);
                }
                return updated;
            });
        } catch (error) {
            console.error(`Failed to generate opinion for ${expertId}:`, error);
        } finally {
            setLoadingAction(null);
        }
    }, [experts, activeRagSources]);

    const handleGenerateAllOpinions = async () => {
        setLoadingAction('all-opinions');
        setDataAssessmentResult(null);

        const opinionPromises = experts.flatMap(expert => [
            { id: expert.id, stance: 'for' as const, title: expert.title },
            { id: expert.id, stance: 'against' as const, title: expert.title }
        ]);
        const ragContent = activeRagSources.map(s => s.content).join(', ');
        const results = await Promise.allSettled(
            opinionPromises.map(p => generateExpertOpinion(p.title, ragContent, p.stance === 'for' ? 'a favor' : 'en contra'))
        );
        
        setExperts(prevExperts => {
            let opinionsGenerated = false;
            const newExperts = [...prevExperts];
            results.forEach((result, index) => {
                if (result.status === 'fulfilled' && result.value) {
                    opinionsGenerated = true;
                    const { id, stance } = opinionPromises[index];
                    const expertIndex = newExperts.findIndex(e => e.id === id);
                    if (expertIndex !== -1) {
                        newExperts[expertIndex] = {
                            ...newExperts[expertIndex], [stance === 'for' ? 'opinionFor' : 'opinionAgainst']: result.value,
                        };
                    }
                }
            });
            if (opinionsGenerated) {
                setAnalysisStage(AnalysisStage.OPINIONS_GENERATED);
            }
            return newExperts;
        });

        setLoadingAction(null);
    };

    const handleAssessData = async () => {
        setLoadingAction('assess-data');
        const ragContent = activeRagSources.map(s => s.content).join(', ');
        const expertOpinions = experts
            .map(e => `Experto: ${e.title}\n- A favor: ${e.opinionFor || 'N/A'}\n- En contra: ${e.opinionAgainst || 'N/A'}`)
            .join('\n---\n');
        
        try {
            const verification = await verifyFacts(ragContent, expertOpinions);
            setDataAssessmentResult(verification);
            setAnalysisStage(AnalysisStage.DATA_ASSESSED);
        } catch (error) {
            console.error("Failed to assess data:", error);
            setDataAssessmentResult("Error durante la valoración de datos.");
        } finally {
            setLoadingAction(null);
        }
    };
    
    const handleEvaluateCase = async () => {
        setLoadingAction('evaluate');
        const ragContent = activeRagSources.map(s => s.content).join(', ');
        const expertOpinions = experts
            .map(e => `Experto: ${e.title}\n- A favor: ${e.opinionFor || 'N/A'}\n- En contra: ${e.opinionAgainst || 'N/A'}`)
            .join('\n');

        try {
            const { teamRedName, teamGreenName } = await generateTeamNames(ragContent, expertOpinions);
            setTeamRedName(teamRedName);
            setTeamGreenName(teamGreenName);
        } catch (error) {
            console.error("Failed to generate team names:", error);
            setTeamRedName(STRINGS.expertsTeamRed);
            setTeamGreenName(STRINGS.expertsTeamGreen);
        }

        setExperts(prevExperts => prevExperts.map(expert => ({
            ...expert,
            team: Math.random() > 0.5 ? 'red' : 'green',
            positioningIndex: Math.floor(Math.random() * 11)
        })));
        setAnalysisStage(AnalysisStage.CASE_EVALUATED);
        setLoadingAction(null);
    };

    const handleSendMessage = async (message: string) => {
        const userMessage: ChatMessage = { role: 'user', content: message };
        setChatHistory(prev => [...prev, userMessage]);
        setLoadingAction('chat');
        
        try {
            const response = await generateChatResponse(message, activeRagSources, experts);
            const modelMessage: ChatMessage = { role: 'model', content: response };
            setChatHistory(prev => [...prev, modelMessage]);
        } catch (error) {
            console.error("Chat error:", error);
            const errorMessage: ChatMessage = { role: 'model', content: STRINGS.chatError };
            setChatHistory(prev => [...prev, errorMessage]);
        } finally {
            setLoadingAction(null);
        }
    };

    const handleSaveConsultation = () => {
        if (!consultationName.trim()) return;
        const newConsultation: Consultation = {
            id: `consultation-${Date.now()}`, name: consultationName.trim(), createdAt: new Date().toISOString(), ragSources, experts, dataAssessmentResult, teamRedName, teamGreenName, chatHistory,
        };
        try {
            const history: Consultation[] = JSON.parse(localStorage.getItem('consultationHistory') || '[]');
            history.unshift(newConsultation);
            localStorage.setItem('consultationHistory', JSON.stringify(history));
        } catch (error) {
            console.error("Failed to save consultation to localStorage:", error);
        }
        setConsultationName('');
        setIsSavingConsultation(false);
    };
    
    const renderExperts = () => {
        const renderExpertList = (expertList: Expert[]) => (
             <div className="space-y-2">
                {expertList.map(expert => <ExpertCard key={expert.id} expert={expert} loadingAction={loadingAction} onGenerateOpinion={handleGenerateOpinion} onDelete={handleDeleteExpert} />)}
            </div>
        )

        if (analysisStage === AnalysisStage.CASE_EVALUATED) {
            const redTeam = experts.filter(e => e.team === 'red');
            const greenTeam = experts.filter(e => e.team === 'green');
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 animate-fade-in">
                    <div>
                        <h3 className="text-lg font-bold text-red-700 mb-2">{teamRedName}</h3>
                        {renderExpertList(redTeam)}
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-green-700 mb-2">{teamGreenName}</h3>
                        {renderExpertList(greenTeam)}
                    </div>
                </div>
            );
        }
        
        return (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-2 animate-fade-in">
                {experts.map(expert => (
                    <ExpertCard key={expert.id} expert={expert} loadingAction={loadingAction} onGenerateOpinion={handleGenerateOpinion} onDelete={handleDeleteExpert} />
                ))}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 text-gray-900 font-sans flex flex-col">
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                            Consultor<span className="text-red-600">IA</span>
                        </h1>
                        <p className="text-gray-500 mt-0.5 text-xs sm:text-sm">{STRINGS.appSubtitle}</p>
                    </div>
                    <button onClick={handleClearCache} className="text-sm text-gray-500 hover:text-red-600 hover:underline transition-colors" title={STRINGS.clearCacheTooltip}>
                        {STRINGS.clearCacheButton}
                    </button>
                </div>
            </header>
            
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-grow">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2 space-y-4">
                        <div className="bg-white p-4 rounded-lg shadow-md">
                            <h2 className="text-lg font-bold mb-2">{STRINGS.ragTitle}</h2>
                            <p className="text-gray-600 text-sm mb-4">{STRINGS.sourcesSummary(activeRagSources.length)}</p>
                             <button onClick={() => setIsRagModalOpen(true)} className="w-full py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors" title={STRINGS.manageSourcesButton}>
                                {STRINGS.manageSourcesButton}
                            </button>
                            {sourcesChangedWarning && <div className="mt-4 p-3 bg-yellow-50 border border-yellow-300 text-yellow-800 text-sm rounded-md animate-fade-in">{STRINGS.ragSourcesChangedWarning}</div>}
                        </div>

                        {analysisStage === AnalysisStage.IDLE ? (
                            <div className="bg-white p-4 rounded-lg shadow-md animate-fade-in">
                                <button onClick={handleStartAnalysis} disabled={activeRagSources.length === 0 || !!loadingAction} className="w-full py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 disabled:bg-gray-400 flex items-center justify-center" title={STRINGS.startAnalysisTooltip}>
                                    {loadingAction === 'analysis' ? <><LoadingSpinner /> {STRINGS.analysisInProgress}</> : STRINGS.startAnalysisButton}
                                </button>
                                 {analysisError && <div className="mt-4 p-3 bg-yellow-50 border border-yellow-300 text-yellow-800 text-sm rounded-md">{analysisError}</div>}
                            </div>
                        ) : (
                            <div className="bg-white p-3 rounded-lg shadow-md animate-fade-in">
                                <div className="flex justify-between items-center mb-2 px-1">
                                    <h2 className="text-lg font-bold">{STRINGS.expertsTitle}</h2>
                                    {!isAddingExpert && (
                                        <button onClick={() => setIsAddingExpert(true)} className="text-sm py-1 px-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors" title={STRINGS.addExpertTooltip}>
                                            {STRINGS.addExpertButton}
                                        </button>
                                    )}
                                </div>
                                {isAddingExpert && (
                                    <div className="p-2 mb-2 border rounded-md bg-slate-50 animate-fade-in">
                                        <input type="text" value={newExpertTitle} onChange={(e) => setNewExpertTitle(e.target.value)} placeholder={STRINGS.addExpertPlaceholder} className="w-full text-sm form-input px-2 py-1 border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500" autoFocus />
                                        <div className="flex gap-2 mt-2">
                                            <button onClick={handleSaveCustomExpert} disabled={!newExpertTitle.trim()} className="flex-1 text-sm py-1 px-3 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-300">{STRINGS.addValueAddButton}</button>
                                            <button onClick={() => setIsAddingExpert(false)} className="flex-1 text-sm py-1 px-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">{STRINGS.addValueCancelButton}</button>
                                        </div>
                                    </div>
                                )}
                                {renderExperts()}
                                
                                <div className="flex flex-col sm:flex-row gap-2 mt-3 pt-3 border-t">
                                    <button onClick={handleGenerateAllOpinions} disabled={!!loadingAction} title={STRINGS.generateAllOpinionsTooltip} className="flex-1 text-xs py-1.5 px-3 border border-gray-300 rounded-md hover:bg-gray-100 disabled:bg-gray-100 disabled:cursor-not-allowed flex items-center justify-center">
                                        {loadingAction === 'all-opinions' ? <><LoadingSpinner /> {STRINGS.generatingOpinion}</> : STRINGS.generateAllOpinionsButton}
                                    </button>
                                    <button onClick={handleAssessData} disabled={analysisStage < AnalysisStage.OPINIONS_GENERATED || !!loadingAction} title={STRINGS.assessDataTooltip} className="flex-1 text-xs py-1.5 px-3 border border-gray-300 rounded-md hover:bg-gray-100 disabled:bg-gray-100 disabled:cursor-not-allowed flex items-center justify-center">
                                        {loadingAction === 'assess-data' ? <><LoadingSpinner /> {STRINGS.assessingData}</> : STRINGS.assessDataButton}
                                    </button>
                                    <button onClick={handleEvaluateCase} disabled={analysisStage < AnalysisStage.DATA_ASSESSED || !!loadingAction} title={STRINGS.evaluateCaseTooltip} className="flex-1 text-xs py-1.5 px-3 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 flex items-center justify-center">
                                        {loadingAction === 'evaluate' ? <><LoadingSpinner /> {STRINGS.analysisInProgress}</> : STRINGS.evaluateCaseButton}
                                    </button>
                                    {analysisStage === AnalysisStage.CASE_EVALUATED && !isSavingConsultation && (
                                        <button onClick={() => setIsSavingConsultation(true)} className="flex-1 text-xs py-1.5 px-3 bg-green-600 text-white font-semibold rounded-md shadow-sm hover:bg-green-700 flex items-center justify-center transition-colors" title={STRINGS.saveConsultationTooltip}>
                                            <SaveIcon className="h-4 w-4 mr-1.5" /> {STRINGS.saveConsultationButton}
                                        </button>
                                    )}
                                </div>

                                {isSavingConsultation && analysisStage === AnalysisStage.CASE_EVALUATED && (
                                    <div className="mt-3 pt-3 border-t animate-fade-in">
                                        <input type="text" value={consultationName} onChange={(e) => setConsultationName(e.target.value)} placeholder={STRINGS.saveConsultationPlaceholder} className="w-full text-sm form-input px-2 py-1.5 border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500" autoFocus />
                                        <div className="flex gap-2 mt-2">
                                            <button onClick={handleSaveConsultation} disabled={!consultationName.trim()} className="flex-1 text-sm py-1.5 px-3 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-300">{STRINGS.addValueAddButton}</button>
                                            <button onClick={() => setIsSavingConsultation(false)} className="flex-1 text-sm py-1.5 px-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">{STRINGS.addValueCancelButton}</button>
                                        </div>
                                    </div>
                                )}

                                <div className="mt-3">
                                    {dataAssessmentResult && <CollapsibleReport reportText={dataAssessmentResult} />}
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <div className="lg:col-span-1">
                        <ChatPanel 
                            isReady={analysisStage >= AnalysisStage.ANALYSIS_STARTED}
                            onSendMessage={handleSendMessage} 
                            chatHistory={chatHistory} 
                            isChatLoading={loadingAction === 'chat'}
                        />
                    </div>
                </div>
            </main>

            <Footer tokenCount={0} userIp={userIp} />
            <RagManagerModal isOpen={isRagModalOpen} onClose={() => setIsRagModalOpen(false)} ragSources={ragSources} setRagSources={setRagSources} />
        </div>
    );
};

export default App;