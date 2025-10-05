
import { GoogleGenAI, Type } from "@google/genai";
import { Question } from '../types';
import { TOTAL_QUESTIONS } from '../constants';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const generateExamQuestions = async (className: string): Promise<Question[]> => {
    const prompt = `Generate ${TOTAL_QUESTIONS} multiple-choice questions for a Class ${className} student. The questions should cover a mix of general subjects like Science, Mathematics, and English Grammar. Each question must have 4 options and a correct answer index.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            question: {
                                type: Type.STRING,
                                description: "The text of the question."
                            },
                            options: {
                                type: Type.ARRAY,
                                items: { type: Type.STRING },
                                description: "An array of 4 possible answers."
                            },
                            correctAnswerIndex: {
                                type: Type.INTEGER,
                                description: "The 0-based index of the correct answer in the options array."
                            }
                        },
                        required: ["question", "options", "correctAnswerIndex"]
                    }
                }
            }
        });
        
        const jsonText = response.text.trim();
        const questions = JSON.parse(jsonText);

        // Basic validation
        if (!Array.isArray(questions) || questions.length === 0) {
            throw new Error("Generated content is not a valid array of questions.");
        }

        return questions as Question[];

    } catch (error) {
        console.error("Error generating questions with Gemini:", error);
        throw new Error("Failed to generate exam questions. Please try again.");
    }
};
