
import React from 'react';
import { NavLink } from 'react-router-dom';

const Header: React.FC = () => {
    const activeLinkClass = "text-white bg-slate-700";
    const inactiveLinkClass = "text-slate-300 hover:bg-slate-700 hover:text-white";
    const linkClasses = "px-3 py-2 rounded-md text-sm font-medium transition-colors";

    return (
        <header className="bg-slate-800 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <h1 className="text-white text-xl font-bold">
                                🚀Exam Portal
                            </h1>
                        </div>
                    </div>
                    <nav className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-4">
                            <NavLink to="/" className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClass : inactiveLinkClass}`}>
                                Home
                            </NavLink>
                            <NavLink to="/student" className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClass : inactiveLinkClass}`}>
                                Student Portal
                            </NavLink>
                            <NavLink to="/admin" className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClass : inactiveLinkClass}`}>
                                Admin Panel
                            </NavLink>
                        </div>
                    </nav>
                </div>
            </div>
        </header>
    );
};

export default Header;
