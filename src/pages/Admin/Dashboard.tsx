import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, LayoutDashboard, UserCheck } from 'lucide-react';
import EventManager from './EventManager';
import RegistrantList from './RegistrantList';

const Dashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('events'); // events | registrants

    useEffect(() => {
        const isAdmin = localStorage.getItem('isAdmin');
        if (isAdmin !== 'true') {
            navigate('/admin/login');
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('isAdmin');
        navigate('/admin/login');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                        <LayoutDashboard className="text-white" size={18} />
                    </div>
                    <h1 className="text-xl font-bold">Admin Relawanns</h1>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors"
                >
                    <LogOut size={18} />
                    <span className="hidden md:inline">Keluar</span>
                </button>
            </header>

            <div className="flex-1 container-custom py-8 max-w-6xl mx-auto w-full px-4">
                {/* Tabs */}
                <div className="flex space-x-1 bg-gray-200 p-1 rounded-xl mb-8 w-fit">
                    <button
                        onClick={() => setActiveTab('events')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'events'
                                ? 'bg-white text-black shadow-sm'
                                : 'text-gray-600 hover:text-black hover:bg-gray-100'
                            }`}
                    >
                        <LayoutDashboard size={16} />
                        Kelola Event
                    </button>
                    <button
                        onClick={() => setActiveTab('registrants')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'registrants'
                                ? 'bg-white text-black shadow-sm'
                                : 'text-gray-600 hover:text-black hover:bg-gray-100'
                            }`}
                    >
                        <UserCheck size={16} />
                        Data Pendaftar
                    </button>
                </div>

                {/* Content */}
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                    {activeTab === 'events' ? <EventManager /> : <RegistrantList />}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
