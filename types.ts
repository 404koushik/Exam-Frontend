
export interface Student {
    id: string;
    name: string;
    className: string;
    section: string;
    rollNumber: string;
    registeredAt: string;
}

export interface Question {
    id: string;
    question: string;
    options: string[];
    correctAnswerIndex: number;
}

export interface ExamResult {
    id: string;
    studentId: string;
    studentName: string;
    className: string;
    section: string;
    rollNumber: string;
    score: number;
    answeredQuestions: number;
    totalQuestions: number;
    status: 'Pass' | 'Fail';
    submittedAt: string;
}

export type StudentRegistration = Omit<Student, 'id' | 'registeredAt'>;