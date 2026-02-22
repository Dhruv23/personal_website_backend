'use client';

import { useConfig } from '../contexts/ConfigContext';
import { Background } from '../components/Background';
import { useState } from 'react';
import { RefreshCw, Save, Upload, Github, Trash2, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getGitHubRepos } from '../actions/github';

export default function Admin() {
    const { config, updateConfig, resetConfig, saveConfig } = useConfig();
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState<string | null>(null);
    const [loadingRepos, setLoadingRepos] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        const success = await saveConfig();
        if (success) {
            alert('Config saved to Supabase!');
        } else {
            alert('Failed to save config. Check console.');
        }
        setSaving(false);
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, path: string[], bucketPath: string) => {
        if (!event.target.files || event.target.files.length === 0) return;
        const file = event.target.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `${bucketPath}/${fileName}`;

        setUploading(bucketPath);

        try {
            const { error: uploadError } = await supabase.storage.from('media').upload(filePath, file);
            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(filePath);

            updateNested(path, publicUrl);
        } catch (error) {
            console.error('Upload error:', error);
            alert('Error uploading file!');
        } finally {
            setUploading(null);
        }
    };

    const updateNested = (path: string[], value: any) => {
        const newConfig = JSON.parse(JSON.stringify(config));
        let current = newConfig;
        for (let i = 0; i < path.length - 1; i++) {
            if (!current[path[i]]) current[path[i]] = {}; // Safely initialize missing nested objects
            current = current[path[i]];
        }
        current[path[path.length - 1]] = value;
        updateConfig(newConfig);
    };

    const fetchRepos = async () => {
        setLoadingRepos(true);
        const username = config.github?.username || config.user.username;
        if (!username) {
            alert("Please set a GitHub username first.");
            setLoadingRepos(false);
            return;
        }

        const repos = await getGitHubRepos(username);
        if (repos.length === 0) {
            alert("No repositories found or error fetching.");
        } else {
            // Merge logic
            const currentRepos = config.github?.repos || [];
            const merged = repos.map(r => {
                const existing = currentRepos.find(cr => cr.id === r.id);
                if (existing) {
                    return { ...r, hidden: existing.hidden, order: existing.order };
                }
                return r;
            });
            updateNested(['github', 'repos'], merged);
        }
        setLoadingRepos(false);
    };

    return (
        <main className="relative min-h-screen w-full flex flex-col p-8 overflow-x-hidden">
            <Background />

            <div className="z-10 w-full max-w-5xl mx-auto bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl mb-20">
                <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4 sticky top-0 bg-black/80 p-4 rounded-xl border border-white/5 z-20 backdrop-blur-md">
                    <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
                    <div className="flex gap-4">
                        <button
                            onClick={resetConfig}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                        >
                            <RefreshCw size={16} /> Reset
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-pink-500 text-white hover:bg-pink-600 transition-colors shadow-lg shadow-pink-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? 'Saving...' : <><Save size={16} /> Save Changes</>}
                        </button>
                    </div>
                </div>

                <div className="space-y-12">

                    {/* 1. User Profile & Socials */}
                    <section className="space-y-6">
                        <h2 className="text-xl font-bold text-white border-b border-white/10 pb-2">Profile & Socials</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input label="Username" value={config.user.username} onChange={(v) => updateNested(['user', 'username'], v)} />
                            <Input label="Location" value={config.user.location} onChange={(v) => updateNested(['user', 'location'], v)} />
                            <Input label="Offline Status Text" value={config.user.offlineStatus || ''} onChange={(v) => updateNested(['user', 'offlineStatus'], v)} />

                            <div>
                                <Input label="Avatar URL" value={config.user.avatarUrl} onChange={(v) => updateNested(['user', 'avatarUrl'], v)} />
                                <div className="mt-2">
                                    <FileInput label={uploading === 'avatars' ? "Uploading..." : "Upload Avatar"} onChange={(e) => handleFileUpload(e, ['user', 'avatarUrl'], 'avatars')} />
                                </div>
                            </div>

                            <div className="pt-6">
                                <Toggle label="Use Discord Avatar" checked={config.user.useDiscordAvatar} onChange={(v) => updateNested(['user', 'useDiscordAvatar'], v)} />
                            </div>
                        </div>

                        {/* Socials Editor */}
                        <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                            <label className="block text-xs font-bold text-gray-400 mb-2">Social Links</label>
                            <div className="space-y-3">
                                {config.socials.map((social, idx) => (
                                    <div key={idx} className="flex gap-2 items-center">
                                        <select
                                            value={social.platform}
                                            onChange={(e) => {
                                                const newSocials = [...config.socials];
                                                newSocials[idx].platform = e.target.value;
                                                updateNested(['socials'], newSocials);
                                            }}
                                            className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-pink-500"
                                        >
                                            <option value="github">GitHub</option>
                                            <option value="discord">Discord</option>
                                            <option value="youtube">YouTube</option>
                                            <option value="twitter">Twitter</option>
                                            <option value="tiktok">TikTok</option>
                                            <option value="twitch">Twitch</option>
                                            <option value="spotify">Spotify</option>
                                        </select>
                                        <input
                                            type="text"
                                            value={social.url}
                                            onChange={(e) => {
                                                const newSocials = [...config.socials];
                                                newSocials[idx].url = e.target.value;
                                                updateNested(['socials'], newSocials);
                                            }}
                                            className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-pink-500"
                                            placeholder="URL"
                                        />
                                        <button
                                            onClick={() => {
                                                const newSocials = config.socials.filter((_, i) => i !== idx);
                                                updateNested(['socials'], newSocials);
                                            }}
                                            className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    onClick={() => updateNested(['socials'], [...config.socials, { platform: 'github', url: '', icon: 'Github' }])}
                                    className="flex items-center gap-1 text-xs text-pink-400 hover:text-pink-300 px-2 py-1"
                                >
                                    <Plus size={14} /> Add Social
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* 2. GitHub Project Manager */}
                    <section className="space-y-6">
                        <div className="flex justify-between items-center border-b border-white/10 pb-2">
                            <h2 className="text-xl font-bold text-white">GitHub Projects</h2>
                            <button
                                onClick={fetchRepos}
                                disabled={loadingRepos}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs transition-colors"
                            >
                                <Github size={14} /> {loadingRepos ? "Fetching..." : "Fetch Repos"}
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input label="GitHub Username (for stats)" value={config.github?.username || ''} onChange={(v) => updateNested(['github', 'username'], v)} />
                            <div className="pt-6">
                                <Toggle
                                    label="Show Stats Widget"
                                    checked={config.github?.statsWidget ?? true}
                                    onChange={(v) => {
                                        if (!config.github?.username) {
                                            alert("Please set a GitHub username first.");
                                            return;
                                        }
                                        updateNested(['github', 'statsWidget'], v);
                                    }}
                                />
                            </div>
                        </div>

                        {config.github?.repos && config.github.repos.length > 0 && (
                            <div className="bg-white/5 rounded-xl border border-white/5 overflow-hidden">
                                <div className="grid grid-cols-12 gap-4 p-3 bg-black/20 text-xs font-bold text-gray-400 border-b border-white/5">
                                    <div className="col-span-1 text-center">Order</div>
                                    <div className="col-span-6">Repository</div>
                                    <div className="col-span-2 text-center">Stars</div>
                                    <div className="col-span-2 text-center">Forks</div>
                                    <div className="col-span-1 text-center">Visible</div>
                                </div>
                                <div className="max-h-[400px] overflow-y-auto">
                                    {[...config.github.repos].sort((a, b) => (a.order || 0) - (b.order || 0)).map((repo, idx) => (
                                        <div key={repo.id} className="grid grid-cols-12 gap-4 p-3 items-center border-b border-white/5 hover:bg-white/5 transition-colors text-sm text-white">
                                            <div className="col-span-1">
                                                <input
                                                    type="number"
                                                    value={repo.order}
                                                    onChange={(e) => {
                                                        const newRepos = [...config.github!.repos];
                                                        const targetIndex = newRepos.findIndex(r => r.id === repo.id);
                                                        newRepos[targetIndex].order = Number(e.target.value);
                                                        updateNested(['github', 'repos'], newRepos);
                                                    }}
                                                    className="w-full bg-black/40 border border-white/10 rounded px-1 py-1 text-center"
                                                />
                                            </div>
                                            <div className="col-span-6 truncate">
                                                <div className="font-bold">{repo.name}</div>
                                                <div className="text-xs text-gray-400 truncate">{repo.description}</div>
                                            </div>
                                            <div className="col-span-2 text-center text-gray-400">{repo.stargazers_count}</div>
                                            <div className="col-span-2 text-center text-gray-400">{repo.forks_count}</div>
                                            <div className="col-span-1 flex justify-center">
                                                <Toggle
                                                    label=""
                                                    checked={!repo.hidden}
                                                    onChange={(v) => {
                                                        const newRepos = [...config.github!.repos];
                                                        const targetIndex = newRepos.findIndex(r => r.id === repo.id);
                                                        newRepos[targetIndex].hidden = !v; // v is "checked" i.e. Visible. hidden = !visible
                                                        updateNested(['github', 'repos'], newRepos);
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </section>

                    {/* 3. Theme & Effects */}
                    <section className="space-y-6">
                        <h2 className="text-xl font-bold text-white border-b border-white/10 pb-2">Theme & Effects</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Input label="Background URL" value={config.theme.backgroundUrl} onChange={(v) => updateNested(['theme', 'backgroundUrl'], v)} />
                                <div className="mt-2"><FileInput label={uploading === 'backgrounds' ? "Uploading..." : "Upload BG"} onChange={(e) => handleFileUpload(e, ['theme', 'backgroundUrl'], 'backgrounds')} /></div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-2">Weather Effect</label>
                                <select
                                    value={config.theme.effects.weather}
                                    onChange={(e) => updateNested(['theme', 'effects', 'weather'], e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-pink-500"
                                >
                                    <option value="none">None</option>
                                    <option value="cherry">Cherry Blossoms</option>
                                    <option value="snow">Snowflakes</option>
                                    <option value="matrix">Matrix Rain</option>
                                </select>
                            </div>
                        </div>

                        <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                            <label className="block text-xs font-bold text-gray-400 mb-4">Feature Toggles</label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <Toggle label="Glow Effect" checked={config.theme.effects.glow} onChange={(v) => updateNested(['theme', 'effects', 'glow'], v)} />
                                <Toggle label="Bg Blur" checked={config.theme.effects.backgroundBlur} onChange={(v) => updateNested(['theme', 'effects', 'backgroundBlur'], v)} />
                                <Toggle label="Animated Title" checked={config.theme.effects.animatedTitle} onChange={(v) => updateNested(['theme', 'effects', 'animatedTitle'], v)} />
                                <Toggle label="3D Tilt" checked={config.theme.effects.tilt} onChange={(v) => updateNested(['theme', 'effects', 'tilt'], v)} />
                                <Toggle label="Audio Visualizer" checked={config.theme.effects.visualizer} onChange={(v) => updateNested(['theme', 'effects', 'visualizer'], v)} />
                                <Toggle label="Mono Icons" checked={config.theme.effects.monochromeIcons} onChange={(v) => updateNested(['theme', 'effects', 'monochromeIcons'], v)} />
                            </div>
                        </div>

                        {/* Colors */}
                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-2">Theme Colors</label>
                            <div className="flex flex-wrap gap-4">
                                {Object.entries(config.theme.colors).map(([key, value]) => (
                                    <div key={key} className="flex items-center gap-2 bg-white/5 p-2 rounded-lg border border-white/5">
                                        <input
                                            type="color"
                                            value={value}
                                            onChange={(e) => updateNested(['theme', 'colors', key], e.target.value)}
                                            className="w-8 h-8 rounded cursor-pointer bg-transparent border-none"
                                        />
                                        <span className="text-xs text-gray-300 capitalize">{key}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* 4. Music Player */}
                    <section className="space-y-6">
                        <h2 className="text-xl font-bold text-white border-b border-white/10 pb-2">Music Player</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Input label="Song Title" value={config.music.songTitle || ''} onChange={(v) => updateNested(['music', 'songTitle'], v)} />
                                <Input label="Music URL (MP3)" value={config.music.url} onChange={(v) => updateNested(['music', 'url'], v)} />
                                <div className="mt-2">
                                    <FileInput label={uploading === 'music' ? "Uploading..." : "Upload MP3"} onChange={(e) => handleFileUpload(e, ['music', 'url'], 'music')} />
                                </div>
                            </div>
                            <div>
                                <Input label="Album Icon URL" value={config.music.albumIconUrl || ''} onChange={(v) => updateNested(['music', 'albumIconUrl'], v)} />
                                <div className="mt-2">
                                    <FileInput label={uploading === 'icons' ? "Uploading..." : "Upload Icon"} onChange={(e) => handleFileUpload(e, ['music', 'albumIconUrl'], 'icons')} />
                                </div>
                                {config.music.albumIconUrl && <img src={config.music.albumIconUrl} alt="Album" className="w-16 h-16 mt-4 rounded-md object-cover border border-white/10" />}
                            </div>

                            <div className="flex items-end gap-4 pb-2 pt-4">
                                <Toggle label="Enabled" checked={config.music.enabled} onChange={(v) => updateNested(['music', 'enabled'], v)} />
                                <Toggle label="Autoplay" checked={config.music.autoplay} onChange={(v) => updateNested(['music', 'autoplay'], v)} />
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </main>
    );
}

const Input = ({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) => (
    <div>
        <label className="block text-xs font-bold text-gray-400 mb-1">{label}</label>
        <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-pink-500 transition-colors"
        />
    </div>
);

const Toggle = ({ label, checked, onChange }: { label: string, checked: boolean, onChange: (v: boolean) => void }) => (
    <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => onChange(!checked)}>
        <div className={`w-10 h-6 rounded-full p-1 transition-colors ${checked ? 'bg-pink-500' : 'bg-gray-700'}`}>
            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${checked ? 'translate-x-4' : ''}`} />
        </div>
        <span className="text-sm text-gray-300 capitalize">{label}</span>
    </div>
);

const FileInput = ({ label, onChange }: { label: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
    <label className="flex items-center gap-2 cursor-pointer bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg transition-colors text-xs text-gray-300">
        <Upload size={14} />
        {label}
        <input type="file" className="hidden" onChange={onChange} />
    </label>
);
