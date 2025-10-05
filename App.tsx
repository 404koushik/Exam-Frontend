
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import StudentPortal from './pages/StudentPortal';
import AdminPanel from './pages/AdminPanel';

const App: React.FC = () => {
    return (
        <HashRouter>
            <div className="min-h-screen bg-slate-100">
                <Header />
                <main>
                    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/student" element={<StudentPortal />} />
                            <Route path="/admin" element={<AdminPanel />} />
                        </Routes>
                    </div>
                </main>
            </div>
        </HashRouter>
    );
};

export default App;
