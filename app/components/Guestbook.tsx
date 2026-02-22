'use client';

import { useState, useEffect } from 'react';
import { getGuestbookEntries, addGuestbookEntry, GuestbookEntry } from '../actions/guestbook';
import { motion } from 'framer-motion';
import { Send, User, MessageSquare } from 'lucide-react';
import { cn } from '../lib/utils';
import { useConfig } from '../contexts/ConfigContext';

export const Guestbook = () => {
    const { config } = useConfig();
    const [entries, setEntries] = useState<GuestbookEntry[]>([]);
    const [name, setName] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getGuestbookEntries().then(setEntries);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !message) return;

        setLoading(true);
        const success = await addGuestbookEntry(name, message);
        if (success) {
            setName('');
            setMessage('');
            getGuestbookEntries().then(setEntries); // Refresh
        }
        setLoading(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="w-full max-w-4xl p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex flex-col gap-8"
        >
             <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <MessageSquare className="text-pink-500" />
                Guestbook
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-black/20 p-4 rounded-xl border border-white/5">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Your Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            maxLength={50}
                            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-pink-500 transition-colors"
                        />
                    </div>
                    <div className="flex-[2] relative">
                         <input
                            type="text"
                            placeholder="Leave a message..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            maxLength={200}
                            className="w-full pl-4 pr-12 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-pink-500 transition-colors"
                        />
                        <button
                            type="submit"
                            disabled={loading || !name || !message}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md bg-pink-500 text-white hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <Send size={16} />
                        </button>
                    </div>
                </div>
            </form>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {entries.map((entry) => (
                    <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-1"
                    >
                        <div className="flex justify-between items-center text-xs text-gray-400">
                            <span className="font-bold text-pink-400">{entry.name}</span>
                            <span>{new Date(entry.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-white text-sm">{entry.message}</p>
                    </motion.div>
                ))}
                {entries.length === 0 && (
                    <p className="text-center text-gray-500 py-8">No messages yet. Be the first!</p>
                )}
            </div>
        </motion.div>
    );
};
