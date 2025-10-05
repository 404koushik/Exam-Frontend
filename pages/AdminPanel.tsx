
import React, { useState, useEffect, useMemo } from 'react';
import type { Student, ExamResult, Question } from '../types';
import * as apiService from '../services/apiService';
import Spinner from '../components/Spinner';
import { ADMIN_USERNAME, ADMIN_PASSWORD, CLASSES, TOTAL_QUESTIONS } from '../constants';

type AdminView = 'students' | 'results' | 'questions';
type SortKey<T> = keyof T;
type SortDirection = 'asc' | 'desc';

interface SortConfig<T> {
    key: SortKey<T>;
    direction: SortDirection;
}

const AdminLogin: React.FC<{ onLogin: (success: boolean) => void; loginError: string }> = ({ onLogin, loginError }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const success = username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
        onLogin(success);
    };

    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">Admin Login</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-slate-700">Username</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-slate-500 focus:border-slate-500"
                            required
                            aria-label="Username"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-slate-500 focus:border-slate-500"
                            required
                            aria-label="Password"
                        />
                    </div>
                    {loginError && <p className="text-sm text-red-600 text-center" role="alert">{loginError}</p>}
                    <button
                        type="submit"
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-600 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
};


const useSortableData = <T extends object,>(items: T[], config: SortConfig<T> | null = null) => {
    const [sortConfig, setSortConfig] = useState(config);

    const sortedItems = useMemo(() => {
        let sortableItems = [...items];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [items, sortConfig]);

    const requestSort = (key: SortKey<T>) => {
        let direction: SortDirection = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    return { items: sortedItems, requestSort, sortConfig };
};

const ThWithSort: React.FC<{
    sortKey: string;
    label: string;
    requestSort: (key: any) => void;
    sortConfig: SortConfig<any> | null;
}> = ({ sortKey, label, requestSort, sortConfig }) => {
    const isSorted = sortConfig?.key === sortKey;
    const directionIcon = sortConfig?.direction === 'asc' ? '▲' : '▼';
    
    return (
        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort(sortKey)}>
            {label} {isSorted && <span className="ml-1">{directionIcon}</span>}
        </th>
    );
};

const QuestionEditor: React.FC<{
    question: Question | null;
    onSave: (question: Question) => void;
    onCancel: () => void;
}> = ({ question, onSave, onCancel }) => {
    const [formData, setFormData] = useState<Omit<Question, 'id'>>({
        question: '',
        options: ['', '', '', ''],
        correctAnswerIndex: 0,
    });

    useEffect(() => {
        if (question) {
            setFormData({
                question: question.question,
                options: [...question.options],
                correctAnswerIndex: question.correctAnswerIndex,
            });
        }
    }, [question]);

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...formData.options];
        newOptions[index] = value;
        setFormData({ ...formData, options: newOptions });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Basic validation
        if (formData.question.trim() === '' || formData.options.some(opt => opt.trim() === '')) {
            alert('Please fill out the question and all four options.');
            return;
        }
        onSave({ id: question?.id || '', ...formData });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-lg shadow-2xl max-w-2xl w-full">
                <h3 className="text-xl font-bold text-slate-800 mb-6">{question ? 'Edit Question' : 'Add New Question'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Question Text</label>
                        <textarea
                            value={formData.question}
                            onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-slate-500 focus:border-slate-500"
                            rows={3}
                            required
                        />
                    </div>
                    {formData.options.map((option, index) => (
                        <div key={index}>
                            <label className="block text-sm font-medium text-slate-700">Option {index + 1}</label>
                            <input
                                type="text"
                                value={option}
                                onChange={(e) => handleOptionChange(index, e.target.value)}
                                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-slate-500 focus:border-slate-500"
                                required
                            />
                        </div>
                    ))}
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Correct Answer</label>
                        <select
                            value={formData.correctAnswerIndex}
                            onChange={(e) => setFormData({ ...formData, correctAnswerIndex: parseInt(e.target.value) })}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-slate-500 focus:border-slate-500"
                        >
                            {formData.options.map((_, index) => (
                                <option key={index} value={index}>Option {index + 1}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onCancel} className="py-2 px-6 rounded-md text-slate-700 bg-slate-200 hover:bg-slate-300">Cancel</button>
                        <button type="submit" className="py-2 px-6 rounded-md text-white bg-slate-600 hover:bg-slate-700">Save Question</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const AdminPanel: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loginError, setLoginError] = useState('');
    const [view, setView] = useState<AdminView>('students');
    const [students, setStudents] = useState<Student[]>([]);
    const [results, setResults] = useState<ExamResult[]>([]);
    const [manualQuestions, setManualQuestions] = useState<apiService.ManualQuestionsDB>({});
    const [selectedClass, setSelectedClass] = useState<string>('');
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { items: sortedStudents, requestSort: requestStudentSort, sortConfig: studentSortConfig } = useSortableData(students, { key: 'registeredAt', direction: 'desc' });
    const { items: sortedResults, requestSort: requestResultSort, sortConfig: resultSortConfig } = useSortableData(results, { key: 'submittedAt', direction: 'desc' });

    useEffect(() => {
        const fetchData = async () => {
            if (!isAuthenticated) return;
            try {
                setLoading(true);
                setError(null);
                const [studentsData, resultsData, questionsData] = await Promise.all([
                    apiService.getStudents(),
                    apiService.getResults(),
                    apiService.getManualQuestions()
                ]);
                setStudents(studentsData);
                setResults(resultsData);
                setManualQuestions(questionsData);
            } catch (err) {
                setError("Failed to fetch admin data.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [isAuthenticated]);
    
    const handleLogin = (success: boolean) => {
        if (success) {
            setIsAuthenticated(true);
            setLoginError('');
        } else {
            setLoginError('Invalid username or password.');
        }
    };
    
    const handleLogout = () => {
        setIsAuthenticated(false);
        setStudents([]);
        setResults([]);
        setManualQuestions({});
    };

    const handleQuestionSave = async (question: Question) => {
        const classQuestions = manualQuestions[selectedClass] || [];
        let updatedQuestions;
        if (editingQuestion) {
            updatedQuestions = classQuestions.map(q => q.id === question.id ? question : q);
        } else {
            updatedQuestions = [...classQuestions, { ...question, id: `q-${Date.now()}` }];
        }
        setLoading(true);
        await apiService.saveQuestionsForClass(selectedClass, updatedQuestions);
        const updatedDB = await apiService.getManualQuestions();
        setManualQuestions(updatedDB);
        setLoading(false);
        setIsEditorOpen(false);
        setEditingQuestion(null);
    };

    const handleQuestionDelete = async (questionId: string) => {
        if (window.confirm('Are you sure you want to delete this question?')) {
            const classQuestions = manualQuestions[selectedClass] || [];
            const updatedQuestions = classQuestions.filter(q => q.id !== questionId);
            setLoading(true);
            await apiService.saveQuestionsForClass(selectedClass, updatedQuestions);
            const updatedDB = await apiService.getManualQuestions();
            setManualQuestions(updatedDB);
            setLoading(false);
        }
    };

    const openEditorForNew = () => {
        setEditingQuestion(null);
        setIsEditorOpen(true);
    };
    
    const openEditorForEdit = (question: Question) => {
        setEditingQuestion(question);
        setIsEditorOpen(true);
    };
    
    if (!isAuthenticated) {
        return <AdminLogin onLogin={handleLogin} loginError={loginError} />;
    }

    const renderContent = () => {
        if (loading) return <Spinner message="Loading admin data..." />;
        if (error) return <p className="text-center text-red-500">{error}</p>;

        if (view === 'students') {
             return (
                <div className="shadow overflow-hidden border-b border-slate-200 sm:rounded-lg">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <ThWithSort sortKey="name" label="Name" requestSort={requestStudentSort} sortConfig={studentSortConfig} />
                                <ThWithSort sortKey="className" label="Class" requestSort={requestStudentSort} sortConfig={studentSortConfig} />
                                <ThWithSort sortKey="section" label="Section" requestSort={requestStudentSort} sortConfig={studentSortConfig} />
                                <ThWithSort sortKey="rollNumber" label="Roll No." requestSort={requestStudentSort} sortConfig={studentSortConfig} />
                                <ThWithSort sortKey="registeredAt" label="Registered At" requestSort={requestStudentSort} sortConfig={studentSortConfig} />
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {sortedStudents.map((student) => (
                                <tr key={student.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{student.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{student.className}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{student.section}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{student.rollNumber}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{new Date(student.registeredAt).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        }

        if (view === 'results') {
            return (
                 <div className="shadow overflow-hidden border-b border-slate-200 sm:rounded-lg">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <ThWithSort sortKey="studentName" label="Name" requestSort={requestResultSort} sortConfig={resultSortConfig} />
                                <ThWithSort sortKey="className" label="Class" requestSort={requestResultSort} sortConfig={resultSortConfig} />
                                <ThWithSort sortKey="rollNumber" label="Roll No." requestSort={requestResultSort} sortConfig={resultSortConfig} />
                                <ThWithSort sortKey="score" label="Score" requestSort={requestResultSort} sortConfig={resultSortConfig} />
                                <ThWithSort sortKey="answeredQuestions" label="Answered" requestSort={requestResultSort} sortConfig={resultSortConfig} />
                                <ThWithSort sortKey="status" label="Status" requestSort={requestResultSort} sortConfig={resultSortConfig} />
                                <ThWithSort sortKey="submittedAt" label="Submitted At" requestSort={requestResultSort} sortConfig={resultSortConfig} />
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {sortedResults.map((result) => (
                                <tr key={result.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{result.studentName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{result.className}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{result.rollNumber}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-bold">{result.score} / {result.totalQuestions}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{result.answeredQuestions} / {result.totalQuestions}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${result.status === 'Pass' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {result.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{new Date(result.submittedAt).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        }

        if (view === 'questions') {
            const classQuestions = manualQuestions[selectedClass] || [];
            return (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <label htmlFor="class-select" className="mr-2 font-medium">Select Class:</label>
                            <select id="class-select" value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="p-2 border border-slate-300 rounded-md">
                                <option value="">-- Select --</option>
                                {CLASSES.map(c => <option key={c} value={c}>Class {c}</option>)}
                            </select>
                        </div>
                        {selectedClass && (
                             <button onClick={openEditorForNew} className="py-2 px-4 rounded-md text-white bg-green-600 hover:bg-green-700">Add Question</button>
                        )}
                    </div>
                    {selectedClass ? (
                        <div className="space-y-4">
                            <p className="text-sm text-slate-600">
                                {classQuestions.length} / {TOTAL_QUESTIONS} questions set. Students can only take the exam when {TOTAL_QUESTIONS} questions are available.
                            </p>
                            {classQuestions.map((q, index) => (
                                <div key={q.id} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                    <p className="font-bold text-slate-800 mb-2">{index + 1}. {q.question}</p>
                                    <ul className="list-disc list-inside ml-4 space-y-1">
                                        {q.options.map((opt, i) => (
                                            <li key={i} className={i === q.correctAnswerIndex ? 'font-semibold text-green-700' : 'text-slate-600'}>
                                                {opt} {i === q.correctAnswerIndex && '(Correct)'}
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="flex justify-end gap-2 mt-2">
                                        <button onClick={() => openEditorForEdit(q)} className="text-sm py-1 px-3 rounded-md text-white bg-slate-500 hover:bg-slate-600">Edit</button>
                                        <button onClick={() => handleQuestionDelete(q.id)} className="text-sm py-1 px-3 rounded-md text-white bg-red-500 hover:bg-red-600">Delete</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-slate-500 py-8">Please select a class to view and manage its questions.</p>
                    )}
                </div>
            )
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            {isEditorOpen && <QuestionEditor question={editingQuestion} onSave={handleQuestionSave} onCancel={() => setIsEditorOpen(false)} />}
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-3xl font-bold text-slate-800">Admin Dashboard</h2>
                <button
                    onClick={handleLogout}
                    className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                    Logout
                </button>
            </div>
            <div className="mb-6 border-b border-slate-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button onClick={() => setView('students')} className={`${view === 'students' ? 'border-slate-500 text-slate-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                        Students ({students.length})
                    </button>
                    <button onClick={() => setView('results')} className={`${view === 'results' ? 'border-slate-500 text-slate-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                        Results ({results.length})
                    </button>
                    <button onClick={() => setView('questions')} className={`${view === 'questions' ? 'border-slate-500 text-slate-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                        Manage Questions
                    </button>
                </nav>
            </div>
            {renderContent()}
        </div>
    );
};

export default AdminPanel;