import type { Student, ExamResult, StudentRegistration, Question } from '../types';
import { TOTAL_QUESTIONS } from '../constants';

const API_BASE_URL = 'http://localhost:8080/api'; // Your Spring Boot backend address

// --- API Fetch Helper ---
const apiFetch = async (url: string, options: RequestInit = {}) => {
    const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.statusText} - ${errorText}`);
    }
    // Handle responses that might not have a body (e.g., HTTP 204 No Content)
    if (response.status === 204 || response.headers.get('content-length') === '0') {
        return null;
    }
    return response.json();
};

// --- STUDENT API ---

export const registerStudent = (studentDetails: StudentRegistration): Promise<Student> => {
    return apiFetch('/students', {
        method: 'POST',
        body: JSON.stringify(studentDetails),
    });
};

export const getStudents = (): Promise<Student[]> => {
    return apiFetch('/students');
};

// --- EXAM & QUESTION API ---

export type ManualQuestionsDB = Record<string, Question[]>;

export const getQuestionsForClass = (className: string): Promise<Question[]> => {
    return apiFetch(`/questions/${className}`);
};

// This function is for the admin panel to get all questions for editing
export const getManualQuestions = async (): Promise<ManualQuestionsDB> => {
    // This is a bit different now. We fetch for all classes one by one.
    const classes = ['V', 'VI', 'VII', 'VIII', 'IX'];
    const allQuestions: ManualQuestionsDB = {};
    for (const className of classes) {
        try {
            // Use the new /manage endpoint to get all questions without shuffling
            const questions = await apiFetch(`/questions/manage/${className}`);
            allQuestions[className] = questions;
        } catch (error) {
            console.error(`Failed to fetch questions for class ${className}`, error);
            allQuestions[className] = [];
        }
    }
    return allQuestions;
};

export const saveQuestionsForClass = (className: string, questions: Question[]): Promise<void> => {
     // Ensure IDs are not sent for new questions; backend will generate them.
    const questionsToSave = questions.map(({ id, ...rest }) => ({ ...rest, id: id.startsWith('q-') ? null : id }));
    return apiFetch(`/questions/${className}`, {
        method: 'POST',
        body: JSON.stringify(questionsToSave),
    });
};

// --- RESULT API ---

export const submitResult = (student: Student, questions: Question[], answers: (number | null)[]): Promise<ExamResult> => {
    const payload = {
        student,
        questions,
        answers,
    };
    return apiFetch('/results', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
};

export const getResults = (): Promise<ExamResult[]> => {
    return apiFetch('/results');
};
