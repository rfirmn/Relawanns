import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Trash2, Search, Filter, Loader2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

const RegistrantList = () => {
    const [registrants, setRegistrants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterEvent, setFilterEvent] = useState('All');
    const [uniqueEvents, setUniqueEvents] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchRegistrants();
    }, []);

    const fetchRegistrants = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('registrations')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            setRegistrants(data || []);

            // Extract unique event names
            const events = Array.from(new Set(data?.map((r: any) => r.event_name).filter(Boolean))) as string[];
            setUniqueEvents(events);

        } catch (error) {
            console.error('Error fetching registrants:', error);
            toast.error('Gagal mengambil data pendaftar');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number, eventName: string) => {
        if (!confirm('Apakah Anda yakin ingin menghapus data ini? Kuota akan dikembalikan.')) return;

        try {
            // 1. Delete registrant
            const { error } = await supabase
                .from('registrations')
                .delete()
                .eq('id', id);

            if (error) throw error;

            // 2. Decrement quota (only if it matches current Active Event, but let's try to be safe)
            // Ideally we should check if the deleted user is from the current active event.
            // For now, simpler approach: Just decrement 'current_registrants' in settings.

            const { data: settings } = await supabase
                .from('event_settings')
                .select('value')
                .eq('key', 'current_registrants')
                .single();

            if (settings) {
                const current = parseInt(settings.value);
                if (current > 0) {
                    await supabase
                        .from('event_settings')
                        .update({ value: (current - 1).toString() })
                        .eq('key', 'current_registrants');
                }
            }

            toast.success('Data berhasil dihapus & kuota dikembalikan');
            fetchRegistrants(); // Refresh list

        } catch (error) {
            console.error('Error deleting:', error);
            toast.error('Gagal menghapus data');
        }
    };

    // Filter Logic
    const filteredData = registrants.filter(item => {
        const matchEvent = filterEvent === 'All' || item.event_name === filterEvent;
        const matchSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.phone.includes(searchTerm);
        return matchEvent && matchSearch;
    });

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-gray-400" /></div>;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Filter className="text-blue-600" />
                        Data Pendaftar
                    </h2>
                    <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                        Total: {filteredData.length}
                    </span>
                </div>

                <div className="mt-6 flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Cari nama, email, atau WA..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    {/* Filter Event */}
                    <div className="md:w-64">
                        <select
                            value={filterEvent}
                            onChange={(e) => setFilterEvent(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="All">Semua Event</option>
                            {uniqueEvents.map(event => (
                                <option key={event} value={event}>{event}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-100">
                            <th className="p-4 font-semibold">Nama & Kontak</th>
                            <th className="p-4 font-semibold">Usia & Kota</th>
                            <th className="p-4 font-semibold">Event</th>
                            <th className="p-4 font-semibold">Ukuran Vest</th>
                            <th className="p-4 font-semibold">Bukti</th>
                            <th className="p-4 font-semibold text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {filteredData.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-gray-500">
                                    Tidak ada data ditemukan
                                </td>
                            </tr>
                        ) : (
                            filteredData.map((item) => (
                                <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50">
                                    <td className="p-4">
                                        <div className="font-semibold text-gray-900">{item.name}</div>
                                        <div className="text-gray-500">{item.email}</div>
                                        <div className="text-gray-500">{item.phone}</div>
                                    </td>
                                    <td className="p-4">
                                        <div>{item.age} Tahun</div>
                                        <div className="text-gray-500">{item.city}</div>
                                    </td>
                                    <td className="p-4">
                                        <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                            {item.event_name || '-'}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className="font-bold">{item.vest_size || '-'}</span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex gap-2">
                                            {item.payment_proof_url && (
                                                <a href={item.payment_proof_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                                                    <ExternalLink size={12} /> Bayar
                                                </a>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => handleDelete(item.id, item.event_name)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Hapus Data"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="p-4 border-t border-gray-100 text-xs text-gray-500 text-center">
                Menampilkan {filteredData.length} dari {registrants.length} total pendaftar
            </div>
        </div>
    );
};

export default RegistrantList;
