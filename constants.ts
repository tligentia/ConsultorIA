export const STRINGS = {
  // App General
  appTitle: 'ConsultorIA',
  appSubtitle: 'Análisis de casos mediante método socrático y IA',

  // RAG Management
  ragModalTitle: 'Gestionar Fuentes de Datos',
  ragTitle: 'Fuentes de Datos (RAG)',
  ragDescription: 'Suba archivos, añada URLs o escriba frases para construir la base de conocimiento de su caso.',
  addUrlPlaceholder: 'https://ejemplo.com/articulo',
  addUrlButton: 'Añadir URL',
  addTextPlaceholder: 'Escriba una frase, opinión o dato...',
  addTextButton: 'Añadir Texto',
  uploadFileButton: 'Subir Archivo(s)',
  ragListHeader: 'Fuentes Cargadas:',
  manageSourcesButton: 'Gestionar Fuentes',
  sourcesSummary: (count: number) => `${count} fuente${count === 1 ? '' : 's'} activa${count === 1 ? '' : 's'}`,
  ragUrlTooltip: 'Añadir una URL pública como fuente de datos.',
  ragTextTooltip: 'Añadir una frase u opinión como fuente de datos.',
  ragFileUploadTooltip: 'Subir archivos (PDF, DOC, TXT) como fuentes.',
  ragSourceActiveTooltip: 'Activar/Desactivar esta fuente en el análisis.',
  ragSourceDeleteTooltip: 'Eliminar esta fuente.',
  ragModalCloseButtonTooltip: 'Cerrar el gestor de fuentes.',
  ragSourcesChangedWarning: 'Las fuentes de datos han cambiado. El análisis se ha reiniciado para mantener la coherencia.',

  // Main Controls
  startAnalysisButton: 'Iniciar Análisis',
  analysisInProgress: 'Analizando...',
  analysisErrorDefault: 'No se pudieron generar expertos dinámicamente debido a un error de API (posiblemente cuota excedida). Se han cargado expertos predeterminados para continuar.',
  startAnalysisTooltip: 'Generar un panel de expertos basado en las fuentes activas.',

  // Experts Section
  expertsTitle: 'Panel de Expertos',
  expertsTeamRed: 'Equipo Rojo',
  expertsTeamGreen: 'Equipo Verde',
  addExpertButton: 'Añadir Experto',
  addExpertPlaceholder: 'Título del nuevo experto',
  generateAllOpinionsButton: 'Generar Todos los Argumentos',
  evaluateCaseButton: 'Evaluar Caso',
  argumentForButton: 'Argumenta a Favor',
  argumentAgainstButton: 'Argumenta en Contra',
  generatingOpinion: 'Generando...',
  assessDataButton: 'Valorar Datos',
  assessingData: 'Valorando...',
  dataAssessmentReportTitle: 'Informe de Valoración de Datos',
  expandReportTooltip: 'Mostrar el análisis detallado',
  collapseReportTooltip: 'Ocultar el análisis detallado',
  addExpertTooltip: 'Añadir un experto personalizado al panel.',
  deleteExpertTooltip: (name: string) => `Eliminar al experto ${name}.`,
  generateAllOpinionsTooltip: 'Generar automáticamente todos los argumentos a favor y en contra para cada experto.',
  assessDataTooltip: 'Analizar la coherencia entre las opiniones de los expertos y las fuentes de datos.',
  evaluateCaseTooltip: 'Dividir a los expertos en equipos y obtener la conclusión final.',

  // Chat Section
  chatTitle: 'Consulta a la IA',
  chatInputPlaceholder: 'Pregunte sobre el caso...',
  chatSendButton: 'Enviar',
  chatWelcomeMessage: 'El chat se activará tras el análisis de los expertos.',
  chatThinking: 'Pensando...',
  chatError: 'Hubo un problema al contactar a la IA. Por favor, intente de nuevo.',
  chatSendTooltip: 'Enviar su pregunta a la IA.',

  // Case Management
  clearCacheButton: 'Limpiar caché y reiniciar',
  saveConsultationButton: 'Guardar Consulta',
  saveConsultationPlaceholder: 'Nombre de la consulta...',
  clearCacheTooltip: 'Eliminar todos los datos (expertos personalizados, historial) y reiniciar la aplicación.',
  saveConsultationTooltip: 'Guardar la sesión de análisis actual en el historial.',
  
  // Used for the custom expert form
  addValueAddButton: 'Añadir',
  addValueCancelButton: 'Cancelar',
  
  // Footer
  version: 'Versión v2025.09B',
  modelName: 'gemini-2.5-flash',
};
