import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollProgress from './components/ScrollProgress';
import Beranda from './pages/Beranda';
import TentangKami from './pages/TentangKami';
import Galeri from './pages/Galeri';
import Daftar from './pages/Daftar';
import Maintenance from './pages/Maintenance';
import NotFound from './pages/NotFound';

import Login from './pages/Admin/Login';
import Dashboard from './pages/Admin/Dashboard';

function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo({
            top: 0,
            behavior: 'auto' as ScrollBehavior // Instant scroll, no animation
        });
    }, [pathname]);

    return null;
}

function Layout() {
    const location = useLocation();
    const isAdmin = location.pathname.startsWith('/admin');

    return (
        <>
            <ScrollToTop />
            {!isAdmin && <ScrollProgress />}
            <div className="min-h-screen flex flex-col">
                {!isAdmin && <Navbar />}
                <main className="flex-grow">
                    <Routes>
                        <Route path="/" element={<Beranda />} />
                        <Route path="/about" element={<TentangKami />} />
                        <Route path="/gallery" element={<Galeri />} />
                        <Route path="/daftar" element={<Daftar />} />
                        <Route path="/maintenance" element={<Maintenance />} />

                        {/* Admin Routes */}
                        <Route path="/admin/login" element={<Login />} />
                        <Route path="/admin" element={<Dashboard />} />

                        {/* 404 catch-all route */}
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </main>
                {!isAdmin && <Footer />}
            </div>
        </>
    );
}

function App() {
    return (
        <Router>
            <Layout />
        </Router>
    );
}

export default App;