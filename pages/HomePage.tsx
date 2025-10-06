
import React from 'react';
import { Link } from 'react-router-dom';

const UserIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-slate-500 group-hover:text-slate-700 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const ShieldIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-slate-500 group-hover:text-slate-700 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.417l5.611-1.684a12.025 12.025 0 015.772 0L21 20.417c0-3.64-1.28-7.04-3.382-9.684z" />
    </svg>
);


const HomePage: React.FC = () => {
    return (
        <div className="text-center p-8">
            <h2 className="text-4xl font-extrabold text-slate-800 mb-4">পরীক্ষার ভবিষ্যতে স্বাগতম</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-12">
                গতিশীল প্রশ্ন তৈরি এবং নির্বিঘ্ন পরীক্ষা দেওয়ার জন্য Google-এর Gemini API দ্বারা চালিত একটি বুদ্ধিমান প্ল্যাটফর্ম। শুরু করতে আপনার পোর্টাল বেছে নিন।
            </p>
            <div className="flex flex-col md:flex-row justify-center items-center gap-8">
                <Link to="/student" className="group w-full md:w-80">
                    <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-slate-200">
                        <UserIcon />
                        <h3 className="text-2xl font-bold text-slate-800 mt-4">ছাত্র ছাত্রী পোর্টাল</h3>
                        <p className="text-slate-500 mt-2">নিবন্ধন করুন, আপনার পরীক্ষা দিন এবং অবিলম্বে আপনার ফলাফল দেখুন।</p>
                    </div>
                </Link>
                <Link to="/admin" className="group w-full md:w-80">
                    <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-slate-200">
                        <ShieldIcon />
                        <h3 className="text-2xl font-bold text-slate-800 mt-4">অ্যাডমিন প্যানেল</h3>
                        <p className="text-slate-500 mt-2">ছাত্র ছাত্রী নিবন্ধন এবং পরীক্ষার পারফরম্যান্স নিরীক্ষণ করুন।</p>
                    </div>
                </Link>
            </div>
        </div>
    );
};

export default HomePage;
