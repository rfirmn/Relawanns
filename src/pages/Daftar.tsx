

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MapPin, Calendar, Users, Tag, CheckCircle2, AlertCircle } from 'lucide-react';
import Form from '../components/Form';
import { supabase } from '../lib/supabase';

const Contact = () => {
    return (
        <div className="min-h-screen bg-white">
            <EventHeroSection />
            <EventDetailsSection />
            <Form />
        </div>
    );
};

interface EventData {
    id: string; // Added ID
    name: string;
    date: string;
    location: string;
    description: string;
    max_quota: number;
    is_active: boolean;
}

// Event Hero Section with Dynamic Data (New System)
const EventHeroSection = () => {
    const [eventData, setEventData] = useState<EventData | null>(null);
    const [loading, setLoading] = useState(true);
    const [quotaFull, setQuotaFull] = useState(false);

    // Fetch ACTIVE event
    React.useEffect(() => {
        const fetchEvent = async () => {
            try {
                const { data, error } = await supabase
                    .from('events')
                    .select('*')
                    .eq('is_active', true)
                    .single();

                if (error || !data) {
                    setEventData(null);
                } else {
                    // Check quota
                    const { count, error: countError } = await supabase
                        .from('registrations')
                        .select('*', { count: 'exact', head: true })
                        .eq('event_id', data.id);

                    if (!countError) {
                        const isFull = (count || 0) >= data.max_quota;
                        setQuotaFull(isFull);
                    }
                    setEventData(data);
                }
            } catch (error) {
                console.error('Failed to fetch event:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchEvent();
        const interval = setInterval(fetchEvent, 30000); // Poll for updates
        return () => clearInterval(interval);
    }, []);

    const formattedDate = eventData?.date
        ? new Date(eventData.date).toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
        : 'Belum diset';

    return (
        <section className="pt-20">
            <div className="container-custom">
                <div className="max-w-4xl mx-auto">
                    {/* Event Image */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6 }}
                        className="relative rounded-3xl overflow-hidden mb-8 aspect-[16/9]"
                    >
                        <img
                            src="/img/21.webp"
                            alt="Event Relawan"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute top-6 left-6">
                            <span
                                className={`inline-block px-4 py-2 text-white rounded-full text-sm font-semibold shadow-lg transition-all duration-300`}
                                style={{
                                    backgroundColor: loading
                                        ? '#6b7280'
                                        : eventData
                                            ? (quotaFull ? '#dc2626' : '#000000') // Red if full
                                            : '#dc2626'
                                }}
                            >
                                {loading
                                    ? 'Memuat...'
                                    : eventData
                                        ? (quotaFull ? 'Kuota Penuh' : 'Pendaftaran Dibuka')
                                        : 'Pendaftaran Ditutup'
                                }
                            </span>
                        </div>
                    </motion.div>

                    {/* Event Title & Info */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <h1 className="mb-6 text-black">
                            {eventData?.name || 'Belum Ada Event Aktif'}
                        </h1>

                        {/* Event Meta Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[--color-gray-50] flex items-center justify-center flex-shrink-0">
                                    <MapPin size={18} className="text-[--color-primary]" />
                                </div>
                                <div>
                                    <div className="text-sm text-[--color-secondary] mb-1">Lokasi</div>
                                    <div className="font-semibold text-black">
                                        {eventData?.location || '-'}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[--color-gray-50] flex items-center justify-center flex-shrink-0">
                                    <Calendar size={18} className="text-[--color-primary]" />
                                </div>
                                <div>
                                    <div className="text-sm text-[--color-secondary] mb-1">Waktu pelaksanaan</div>
                                    <div className="font-semibold text-black">{formattedDate}</div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

// Event Details Section with Dynamic Data
const EventDetailsSection = () => {
    const [eventData, setEventData] = useState<EventData | null>(null);
    const [registrantCount, setRegistrantCount] = useState(0);

    React.useEffect(() => {
        const fetchEvent = async () => {
            try {
                const { data, error } = await supabase
                    .from('events')
                    .select('*')
                    .eq('is_active', true)
                    .single();

                if (!error && data) {
                    setEventData(data);

                    // Fetch registrant count
                    const { count, error: countError } = await supabase
                        .from('registrations')
                        .select('*', { count: 'exact', head: true })
                        .eq('event_id', data.id);

                    if (!countError) {
                        setRegistrantCount(count || 0);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch event details:', error);
            }
        };

        fetchEvent();
    }, []);

    if (!eventData) return null; // Don't show details if no event

    return (
        <section className="section-padding">
            <div className="container-custom">
                <div className="max-w-4xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Deskripsi */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5 }}
                            >
                                <h3 className="mb-4">Deskripsi Acara</h3>
                                <p className="text-[--color-secondary] leading-relaxed whitespace-pre-line">
                                    {eventData.description || 'Deskripsi belum tersedia.'}
                                </p>
                            </motion.div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Kuota */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5 }}
                                className="bg-[--color-gray-50] p-6 rounded-2xl"
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
                                        <Users size={18} className="text-[--color-primary]" />
                                    </div>
                                    <h5 className="text-black">Kuota Pendaftaran</h5>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-end">
                                        <span className="text-3xl font-bold text-black">
                                            {Math.max(0, (eventData?.max_quota || 0) - registrantCount)}
                                        </span>
                                        <span className="text-sm text-gray-500 mb-1">
                                            dari {eventData?.max_quota} kursi
                                        </span>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${registrantCount >= (eventData?.max_quota || 0)
                                                ? 'bg-red-500'
                                                : 'bg-[--color-primary]'
                                                }`}
                                            style={{
                                                width: `${Math.min(100, (registrantCount / (eventData?.max_quota || 1)) * 100)}%`
                                            }}
                                        />
                                    </div>

                                    {registrantCount >= (eventData?.max_quota || 0) && (
                                        <div className="text-red-500 text-sm font-semibold mt-1 flex items-center gap-1">
                                            <AlertCircle size={14} />
                                            Kuota Penuh!
                                        </div>
                                    )}
                                </div>
                            </motion.div>

                            {/* Kategori */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                className="bg-[--color-gray-50] p-6 rounded-2xl"
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
                                        <Tag size={18} className="text-[--color-primary]" />
                                    </div>
                                    <h5 className="text-black">Kategori</h5>
                                </div>
                                <p className="font-semibold text-black">Volunteer</p>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Contact;