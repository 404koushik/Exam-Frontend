import React, { useState, useEffect, useCallback } from 'react';
import type { Student, Question, ExamResult, StudentRegistration } from '../types';
import { CLASSES, SECTIONS, EXAM_DURATION_MINUTES, TOTAL_QUESTIONS } from '../constants';
import * as apiService from '../services/apiService';
import Spinner from '../components/Spinner';

type ExamStage = 'registration' | 'generating' | 'instructions' | 'exam' | 'submitting' | 'result' | 'error';

// --- Sub-components defined within the same file ---

const StudentRegistrationForm: React.FC<{ onSubmit: (details: StudentRegistration) => void; loading: boolean }> = ({ onSubmit, loading }) => {
    const [details, setDetails] = useState<StudentRegistration>({ name: '', className: CLASSES[0], section: SECTIONS[0], rollNumber: '' });
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(details.name.trim() && details.rollNumber.trim()) {
            onSubmit(details);
        }
    };

    return (
        <div className="bg-white p-8 rounded-lg shadow-md max-w-lg mx-auto">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">Student Registration</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-700">Full Name</label>
                    <input type="text" id="name" value={details.name} onChange={e => setDetails({...details, name: e.target.value})} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-slate-500 focus:border-slate-500" required />
                </div>
                <div>
                    <label htmlFor="className" className="block text-sm font-medium text-slate-700">Class</label>
                    <select id="className" value={details.className} onChange={e => setDetails({...details, className: e.target.value})} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-slate-500 focus:border-slate-500">
                        {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="section" className="block text-sm font-medium text-slate-700">Section</label>
                    <select id="section" value={details.section} onChange={e => setDetails({...details, section: e.target.value})} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-slate-500 focus:border-slate-500">
                        {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                 <div>
                    <label htmlFor="rollNumber" className="block text-sm font-medium text-slate-700">Roll Number</label>
                    <input type="text" id="rollNumber" value={details.rollNumber} onChange={e => setDetails({...details, rollNumber: e.target.value})} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-slate-500 focus:border-slate-500" required />
                </div>
                <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-600 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 disabled:bg-slate-400">
                    {loading ? 'Registering...' : 'Register & Proceed'}
                </button>
            </form>
        </div>
    );
};

const ExamInstructions: React.FC<{ student: Student; onStart: () => void }> = ({ student, onStart }) => (
    <div className="bg-white p-8 rounded-lg shadow-md max-w-xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-slate-800 mb-4">Hello, {student.name}!</h2>
        <p className="text-slate-600 mb-6">Welcome to your exam. Please read the instructions carefully.</p>
        <ul className="text-left space-y-3 list-disc list-inside bg-slate-50 p-6 rounded-md mb-8">
            <li>Total Questions: <strong>{TOTAL_QUESTIONS}</strong></li>
            <li>Time Limit: <strong>{EXAM_DURATION_MINUTES} minutes</strong></li>
            <li>Each question carries 1 mark.</li>
            <li>There is no negative marking.</li>
            <li>The exam will be submitted automatically when the time runs out.</li>
        </ul>
        <button onClick={onStart} className="w-full py-3 px-4 rounded-md shadow-sm text-lg font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
            Start Exam
        </button>
    </div>
);

const ConfirmationModal: React.FC<{ onConfirm: () => void; onCancel: () => void; }> = ({ onConfirm, onCancel }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-2xl max-w-sm w-full text-center">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Confirm Submission</h3>
            <p className="text-slate-600 mb-6">Are you sure you want to submit the exam?</p>
            <div className="flex justify-center gap-4">
                <button onClick={onCancel} className="py-2 px-6 rounded-md text-slate-700 bg-slate-200 hover:bg-slate-300">Cancel</button>
                <button onClick={onConfirm} className="py-2 px-6 rounded-md text-white bg-green-600 hover:bg-green-700">Yes, Submit</button>
            </div>
        </div>
    </div>
);

const ExamView: React.FC<{ student: Student; questions: Question[]; onSubmit: (answers: (number | null)[]) => void }> = ({ student, questions, onSubmit }) => {
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [answers, setAnswers] = useState<(number | null)[]>(new Array(questions.length).fill(null));
    const [timeLeft, setTimeLeft] = useState(EXAM_DURATION_MINUTES * 60);
    const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

    const handleSubmit = useCallback(() => {
        setShowSubmitConfirm(false);
        onSubmit(answers);
    }, [answers, onSubmit]);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [handleSubmit]);

    const handleAnswerSelect = (optionIndex: number) => {
        const newAnswers = [...answers];
        newAnswers[currentQIndex] = optionIndex;
        setAnswers(newAnswers);
    };

    const getQuestionStatusClass = (index: number) => {
        if (index === currentQIndex) return 'bg-yellow-400 border-yellow-600';
        if (answers[index] !== null) return 'bg-green-500 border-green-700';
        return 'bg-red-500 border-red-700';
    };

    const currentQuestion = questions[currentQIndex];
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (
        <>
            {showSubmitConfirm && <ConfirmationModal onConfirm={handleSubmit} onCancel={() => setShowSubmitConfirm(false)} />}
            <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
                <div className="flex-grow bg-white p-6 md:p-8 rounded-lg shadow-md lg:order-1 order-2">
                    <div className="flex justify-between items-center mb-6 border-b pb-4">
                        <h2 className="text-xl font-bold text-slate-800">Question {currentQIndex + 1}/{questions.length}</h2>
                        <div className={`text-lg font-bold px-3 py-1 rounded-md ${timeLeft < 60 ? 'text-red-600 bg-red-100' : 'text-slate-700 bg-slate-100'}`}>
                            Time Left: {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                        </div>
                    </div>
                    <p className="text-lg text-slate-700 mb-6 min-h-[60px]">{currentQuestion.question}</p>
                    <div className="space-y-4">
                        {currentQuestion.options.map((option, index) => (
                            <button key={index} onClick={() => handleAnswerSelect(index)} className={`w-full text-left p-4 rounded-md border-2 transition-all ${answers[currentQIndex] === index ? 'bg-slate-200 border-slate-500 font-semibold' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
                                {option}
                            </button>
                        ))}
                    </div>
                    <div className="flex justify-between mt-8 pt-4 border-t">
                        <button onClick={() => setCurrentQIndex(i => i - 1)} disabled={currentQIndex === 0} className="py-2 px-6 rounded-md text-white bg-slate-500 hover:bg-slate-600 disabled:bg-slate-300">Previous</button>
                        <button onClick={() => setCurrentQIndex(i => i + 1)} disabled={currentQIndex === questions.length - 1} className="py-2 px-6 rounded-md text-white bg-slate-500 hover:bg-slate-600 disabled:bg-slate-300">Next</button>
                    </div>
                </div>

                <div className="lg:w-80 flex-shrink-0 order-1 lg:order-2">
                    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                        <h3 className="text-xl font-bold text-slate-800 border-b pb-2 mb-4">Student Details</h3>
                        <div className="space-y-2 text-slate-600">
                            <p><strong>Name:</strong> {student.name}</p>
                            <p><strong>Class:</strong> {student.className} - {student.section}</p>
                            <p><strong>Roll No:</strong> {student.rollNumber}</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">Question Palette</h3>
                        <div className="grid grid-cols-5 gap-2">
                            {questions.map((_, index) => (
                                <button key={index} onClick={() => setCurrentQIndex(index)} className={`flex items-center justify-center h-10 w-10 rounded-md font-bold text-white transition-transform transform hover:scale-110 border-b-4 ${getQuestionStatusClass(index)}`}>
                                    {index + 1}
                                </button>
                            ))}
                        </div>
                        <div className="mt-6 border-t pt-4 text-sm text-slate-600 space-y-2">
                            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-green-500"></div><span>Answered</span></div>
                            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-red-500"></div><span>Not Answered</span></div>
                            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-yellow-400"></div><span>Current Question</span></div>
                        </div>
                    </div>
                     <button onClick={() => setShowSubmitConfirm(true)} className="mt-6 w-full py-3 px-4 rounded-md shadow-sm text-lg font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                        Submit Exam
                    </button>
                </div>
            </div>
        </>
    );
};


const SubmissionCompleteView: React.FC<{ studentName: string; onRestart: () => void }> = ({ studentName, onRestart }) => (
    <div className="bg-white p-8 rounded-lg shadow-md max-w-lg mx-auto text-center">
        <h2 className="text-3xl font-bold text-slate-800 mb-4">Exam Submitted!</h2>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-green-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-slate-600 mb-8 text-lg">
            Thank you, <strong>{studentName}</strong>. Your submission has been received successfully.
            <br />
            Results will be announced by the administration later.
        </p>
         <button onClick={onRestart} className="w-full py-3 px-4 rounded-md shadow-sm text-lg font-medium text-white bg-slate-600 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500">
            Take Another Exam
        </button>
    </div>
);

const ErrorDisplay: React.FC<{ message: string; onRetry: () => void }> = ({ message, onRetry }) => (
     <div className="bg-red-50 p-8 rounded-lg shadow-md max-w-lg mx-auto text-center border border-red-200">
        <h2 className="text-2xl font-bold text-red-800 mb-4">An Error Occurred</h2>
        <p className="text-red-700 mb-6">{message}</p>
         <button onClick={onRetry} className="py-2 px-6 rounded-md text-white bg-red-600 hover:bg-red-700">
            Try Again
        </button>
    </div>
);


// --- Main Portal Component ---

const StudentPortal: React.FC = () => {
    const [stage, setStage] = useState<ExamStage>('registration');
    const [student, setStudent] = useState<Student | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const handleRegistration = async (details: StudentRegistration) => {
        setLoading(true);
        setError('');
        setStage('generating');
        try {
            const registeredStudent = await apiService.registerStudent(details);
            setStudent(registeredStudent);
            const fetchedQuestions = await apiService.getQuestionsForClass(details.className);
            if (fetchedQuestions.length < TOTAL_QUESTIONS) {
                throw new Error(`The exam for Class ${details.className} is not yet available or has fewer than ${TOTAL_QUESTIONS} questions. Please contact the administrator.`);
            }
            setQuestions(fetchedQuestions);
            setStage('instructions');
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred during setup.');
            setStage('error');
        } finally {
            setLoading(false);
        }
    };
    
    const handleExamSubmit = async (answers: (number | null)[]) => {
        if (!student) return;
        setStage('submitting');
        try {
            await apiService.submitResult(student, questions, answers);
            setStage('result');
        } catch (err: any) {
            setError(err.message || 'Failed to submit your exam.');
            setStage('error');
        }
    };
    
    const resetPortal = () => {
        setStage('registration');
        setStudent(null);
        setQuestions([]);
        setError('');
        setLoading(false);
    };

    const renderContent = () => {
        switch(stage) {
            case 'registration':
                return <StudentRegistrationForm onSubmit={handleRegistration} loading={loading} />;
            case 'generating':
                return <Spinner message="Loading your exam..." />;
            case 'instructions':
                return student && <ExamInstructions student={student} onStart={() => setStage('exam')} />;
            case 'exam':
                return student && questions.length > 0 && <ExamView student={student} questions={questions} onSubmit={handleExamSubmit} />;
            case 'submitting':
                return <Spinner message="Submitting your answers..." />;
            case 'result':
                return student && <SubmissionCompleteView studentName={student.name} onRestart={resetPortal} />;
            case 'error':
                 return <ErrorDisplay message={error} onRetry={resetPortal} />;
            default:
                return null;
        }
    };

    return <div className="p-4">{renderContent()}</div>;
};

export default StudentPortal;