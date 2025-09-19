import { GoogleGenAI, Type } from "@google/genai";
import type { Expert, RagSource, ChatMessage } from '../types';
// FIX: Imported STRINGS constant to be used in the catch block for generateTeamNames.
import { STRINGS } from "../constants";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a list of relevant expert titles based on the provided RAG content.
 * @param ragContent A string of concatenated RAG source content.
 * @returns A promise that resolves to an array of expert titles.
 */
export const generateExperts = async (ragContent: string): Promise<string[]> => {
    const expertSchema = {
        type: Type.OBJECT,
        properties: {
            experts: {
                type: Type.ARRAY,
                description: `A list of 4-5 diverse and relevant expert roles (e.g., 'Analista de Riesgos', 'Estratega de Mercado', 'Abogado Corporativo') for analyzing the topics. Do not include generic roles like 'Analyst' or 'Expert'.`,
                items: { type: Type.STRING }
            }
        },
        required: ["experts"]
    };

    const prompt = `Based on the following topics derived from file names and URLs: "${ragContent}", please generate a list of 4-5 relevant and specific expert profiles for a Socratic analysis. The profiles should be diverse. For example, if the topic is about a tech merger, profiles could be "Tech M&A Analyst", "Antitrust Lawyer", "Software Integration Engineer", and "Corporate Culture Specialist". Do not include a "Fact Validator" or "Validador Fáctico" role.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: expertSchema,
            },
        });

        const data = JSON.parse(response.text);
        if (!data.experts || data.experts.length === 0) {
             throw new Error("Gemini failed to return expert profiles.");
        }
        return data.experts;
    } catch (error) {
        console.error(`Error generating experts:`, error);
        throw new Error(`Failed to generate expert profiles.`);
    }
};

/**
 * Generates an opinion from an expert's perspective.
 * @param expertTitle The title of the expert.
 * @param ragContent The context from RAG sources.
 * @param stance The position to argue for ('a favor' or 'en contra').
 * @returns A promise that resolves to the generated opinion string.
 */
export const generateExpertOpinion = async (
    expertTitle: string,
    ragContent: string,
    stance: 'a favor' | 'en contra'
): Promise<string> => {
    const prompt = `
        Actúa como un ${expertTitle}.
        Se te ha proporcionado una lista de fuentes de datos con los siguientes temas: "${ragContent}".
        Tu tarea es generar un argumento conciso y bien fundamentado (2-3 frases) ${stance} del asunto principal que se desprende de estos temas.
        Basa tu argumento únicamente en tu rol y en la información implícita en los nombres de las fuentes. No inventes datos.
        Tu respuesta debe ser directa, sin preámbulos como "Como un ${expertTitle},...".
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        
        const text = response.text.trim();
        if (!text) {
            throw new Error("The model returned an empty opinion.");
        }
        return text;
    } catch (error) {
        console.error(`Error generating opinion for ${expertTitle}:`, error);
        throw new Error(`Failed to generate opinion for ${expertTitle}.`);
    }
};

/**
 * Assesses data consistency between expert opinions and RAG content.
 * Generates a report with a summary and detailed analysis, using Unicode for formatting.
 * @param ragContent The context from RAG sources.
 * @param expertOpinions A string containing all expert opinions.
 * @returns A promise that resolves to the formatted report string.
 */
export const verifyFacts = async (ragContent: string, expertOpinions: string): Promise<string> => {
    const prompt = `
        Actúa como un verificador de hechos y analista de coherencia.
        FUENTES DE DATOS (RAG): "${ragContent}".
        OPINIONES DE EXPERTOS:
        ---
        ${expertOpinions}
        ---
        MISIÓN:
        1.  Revisa las opiniones y compáralas con las fuentes de datos.
        2.  Genera un informe en dos partes, separadas exactamente por "---DETALLE---".
        3.  **Formato**: Utiliza caracteres Unicode para resaltar información clave. Usa **negrita** (ej. **experto clave**) para enfatizar elementos importantes y *cursiva* (ej. *inconsistencia*) para destacar puntos sutiles o citas.

        ESTRUCTURA DE LA RESPUESTA:
        **Resumen del Informe:** (Un párrafo conciso de 2-3 frases resumiendo los hallazgos principales. Indica si hay coherencia general o si existen discrepancias significativas).
        ---DETALLE---
        **Análisis Detallado:** (Una lista de puntos o párrafos detallando cada hallazgo, inconsistencia o confirmación. Menciona a los expertos específicos y las afirmaciones evaluadas).
    `;
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        const text = response.text.trim();
        if (!text) {
            throw new Error("The model returned an empty verification response.");
        }
        return text;
    } catch (error) {
        console.error(`Error verifying facts:`, error);
        throw new Error(`Failed to verify facts.`);
    }
};

/**
 * Generates descriptive team names based on the case context.
 * @param ragContent The context from RAG sources.
 * @param expertOpinions A string containing all expert opinions.
 * @returns A promise that resolves to an object with teamRedName and teamGreenName.
 */
export const generateTeamNames = async (
    ragContent: string,
    expertOpinions: string
): Promise<{ teamRedName: string; teamGreenName: string }> => {
    const schema = {
        type: Type.OBJECT,
        properties: {
            teamRedName: { type: Type.STRING, description: "Descriptive name for the team arguing against the main topic (e.g., 'Equipo Rojo (En contra de la fusión)')." },
            teamGreenName: { type: Type.STRING, description: "Descriptive name for the team arguing for the main topic (e.g., 'Equipo Verde (A favor de la fusión)')." }
        },
        required: ["teamRedName", "teamGreenName"]
    };

    const prompt = `
        Analiza el contexto del caso proporcionado por estas fuentes: "${ragContent}" y las siguientes opiniones de expertos:
        ---
        ${expertOpinions}
        ---
        Basándote en este contexto, genera nombres descriptivos para dos equipos opuestos.
        - El "Equipo Rojo" es el que se opone a la idea principal.
        - El "Equipo Verde" es el que apoya la idea principal.
        Devuelve los nombres en el formato JSON especificado.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        });
        return JSON.parse(response.text);
    } catch (error) {
        console.error(`Error generating team names:`, error);
        return {
            teamRedName: STRINGS.expertsTeamRed,
            teamGreenName: STRINGS.expertsTeamGreen
        };
    }
};


/**
 * Generates a chat response based on the full case context.
 * @param question The user's question.
 * @param ragSources The array of RAG sources.
 * @param experts The array of experts.
 * @returns A promise that resolves to the chat response string.
 */
export const generateChatResponse = async (
    question: string,
    ragSources: RagSource[],
    experts: Expert[]
): Promise<string> => {
    const ragContext = ragSources
        .filter(s => s.status === 'active')
        .map(s => `(${s.type}: ${s.content})`)
        .join(', ');

    const expertContext = experts
        .map(e => {
            let opinions = `Experto: ${e.title}`;
            if (e.opinionFor) opinions += `\n  - A favor: ${e.opinionFor}`;
            if (e.opinionAgainst) opinions += `\n  - En contra: ${e.opinionAgainst}`;
            if (e.team) opinions += `\n  - Equipo: ${e.team === 'red' ? 'Rojo (En Contra)' : 'Verde (A Favor)'} con una convicción de ${e.positioningIndex}/10.`;
            return opinions;
        })
        .join('\n\n');

    const prompt = `
        Eres un asistente de IA llamado ConsultorIA. Tu propósito es ayudar a analizar un caso complejo.
        Se te ha proporcionado el siguiente contexto:

        1.  FUENTES DE DATOS (RAG):
            ${ragContext || 'No se proporcionaron fuentes.'}

        2.  ANÁLISIS DE EXPERTOS:
            ${expertContext || 'No se generaron opiniones de expertos.'}

        Basándote ESTRICTAMENTE en la información anterior, responde a la siguiente pregunta del usuario de forma concisa y objetiva.
        Sintetiza la información de los expertos y las fuentes si es necesario. No inventes información.

        Pregunta del usuario: "${question}"
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        const text = response.text.trim();
        if (!text) {
            throw new Error("The model returned an empty response.");
        }
        return text;
    } catch (error) {
        console.error(`Error generating chat response:`, error);
        throw new Error(`Failed to generate chat response.`);
    }
};