import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Save, Loader2, Calendar, MapPin, FileText, Users, Plus, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface EventData {
    id: string;
    name: string;
    date: string;
    location: string;
    description: string;
    max_quota: number;
    is_active: boolean;
    price: number; // Added price
    current_registrants?: number; // Calculated field
}

const EventManager = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [events, setEvents] = useState<EventData[]>([]);

    // Form state for NEW event
    const [newEvent, setNewEvent] = useState({
        name: '',
        date: '',
        location: '',
        description: '',
        max_quota: '',
        price: '' // Added price state
    });

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            // 1. Fetch Events
            const { data: eventsData, error: eventsError } = await supabase
                .from('events')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(5);

            if (eventsError) throw eventsError;

            // 2. Fetch Registration Counts for these events
            const eventsWithCounts = await Promise.all((eventsData || []).map(async (event) => {
                const { count } = await supabase
                    .from('registrations')
                    .select('*', { count: 'exact', head: true })
                    .eq('event_id', event.id);

                return { ...event, current_registrants: count || 0 };
            }));

            setEvents(eventsWithCounts);
        } catch (error) {
            console.error('Error fetching events:', error);
            toast.error('Gagal mengambil data event');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            // Check mutex: If we are creating an ACTIVE event, close others first?
            // User requested default validation "Open".
            // Ideally we should close others if we enforce "Only 1 active".
            // Let's do it for safety.

            // 1. Close all other events first
            await supabase.from('events').update({ is_active: false }).neq('id', '00000000-0000-0000-0000-000000000000');

            const { error } = await supabase
                .from('events')
                .insert([{
                    name: newEvent.name,
                    date: newEvent.date,
                    location: newEvent.location,
                    description: newEvent.description,
                    max_quota: parseInt(newEvent.max_quota),
                    price: newEvent.price ? parseInt(newEvent.price.replace(/\D/g, '')) : 0, // Store numbers only
                    is_active: true // Default OPEN as requested
                }]);

            if (error) throw error;

            toast.success('Event berhasil dibuat dan DIBUKA!');
            setNewEvent({ name: '', date: '', location: '', description: '', max_quota: '100', price: '' }); // Reset form
            fetchEvents(); // Refresh list
        } catch (error) {
            console.error('Error creating event:', error);
            toast.error('Gagal membuat event');
        } finally {
            setSaving(false);
        }
    };

    const handleToggleStatus = async (eventId: string, currentStatus: boolean) => {
        try {
            if (currentStatus) {
                // If currently active, just close it
                const { error } = await supabase
                    .from('events')
                    .update({ is_active: false })
                    .eq('id', eventId);
                if (error) throw error;
                toast.success('Event ditutup');
            } else {
                // If activating, we must deactivate ALL others first (Mutex)
                // 1. Reset all to false
                await supabase.from('events').update({ is_active: false }).neq('id', '00000000-0000-0000-0000-000000000000'); // Hack to update all

                // 2. Set this one to true
                const { error } = await supabase
                    .from('events')
                    .update({ is_active: true })
                    .eq('id', eventId);

                if (error) throw error;
                toast.success('Event dibuka (Event lain otomatis ditutup)');
            }
            fetchEvents();
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Gagal mengubah status event');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setNewEvent(prev => ({ ...prev, [name]: value }));
    };

    // Helper to format currency
    const formatRupiah = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    };

    return (
        <div className="space-y-8">
            {/* --- CREATE EVENT FORM --- */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Plus className="text-blue-600" />
                    Buat Event Baru
                </h2>

                <form onSubmit={handleCreateEvent} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Event Name */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Event</label>
                            <input
                                type="text"
                                name="name"
                                value={newEvent.name}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="Contoh: Bermain Bersama"
                                required
                            />
                        </div>

                        {/* Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                            <input
                                type="date"
                                name="date"
                                value={newEvent.date}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        {/* Location */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Lokasi</label>
                            <div className="relative">
                                {/* <MapPin className="absolute left-3 top-2.5 text-gray-400" size={18} /> */}
                                <input
                                    type="text"
                                    name="location"
                                    value={newEvent.location}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="Contoh: Yayasan Yatim Piatu"
                                    required
                                />
                            </div>
                        </div>

                        {/* Quota */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Kuota Maksimal</label>
                            <div className="relative">
                                {/* <Users className="absolute left-3 top-2.5 text-gray-400" size={18} /> */}
                                <input
                                    type="number"
                                    name="max_quota"
                                    value={newEvent.max_quota}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="15"
                                    required
                                />
                            </div>
                        </div>

                        {/* Price */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Harga Pendaftaran (IDR)</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    name="price"
                                    value={newEvent.price}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="89000"
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Isi 0 jika gratis</p>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi Singkat</label>
                        <textarea
                            name="description"
                            value={newEvent.description}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Deskripsi singkat mengenai kegiatan ini..."
                        />
                    </div>

                    <div className="pt-4 border-t">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                            Simpan & Buka Event
                        </button>
                    </div>
                </form>
            </div>

            {/* --- LIST EVENTS --- */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Calendar className="text-blue-600" />
                    Daftar Event Terakhir
                </h2>

                {loading ? (
                    <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 text-sm text-gray-500">
                                    <th className="py-3 px-2">Nama Event</th>
                                    <th className="py-3 px-2">Tanggal</th>
                                    <th className="py-3 px-2">Lokasi</th>
                                    <th className="py-3 px-2">Harga</th>
                                    <th className="py-3 px-2">Pendaftar</th>
                                    <th className="py-3 px-2">Status</th>
                                    <th className="py-3 px-2">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {events.map((event) => (
                                    <tr key={event.id} className="hover:bg-gray-50">
                                        <td className="py-3 px-2 font-medium">{event.name}</td>
                                        <td className="py-3 px-2">{new Date(event.date).toLocaleDateString('id-ID')}</td>
                                        <td className="py-3 px-2 text-sm text-gray-600">{event.location}</td>
                                        <td className="py-3 px-2 text-sm font-medium">
                                            {event.price && event.price > 0 ? formatRupiah(event.price) : 'Gratis'}
                                        </td>
                                        <td className="py-3 px-2">
                                            <span className="font-semibold">{event.current_registrants}</span>
                                            <span className="text-gray-400 text-sm"> / {event.max_quota}</span>
                                        </td>
                                        <td className="py-3 px-2">
                                            {event.is_active ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                                                    <CheckCircle size={12} /> BUKA
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                                                    <XCircle size={12} /> TUTUP
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3 px-2">
                                            <button
                                                onClick={() => handleToggleStatus(event.id, event.is_active)}
                                                className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${event.is_active
                                                    ? 'border-red-200 text-red-600 hover:bg-red-50'
                                                    : 'border-green-200 text-green-600 hover:bg-green-50'
                                                    }`}
                                            >
                                                {event.is_active ? 'Tutup Pendaftaran' : 'Buka Pendaftaran'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {events.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="text-center py-8 text-gray-500">Belum ada event yang dibuat</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EventManager;
