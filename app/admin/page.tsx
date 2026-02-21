'use client';

import { useConfig } from '../contexts/ConfigContext';
import { Background } from '../components/Background';
import { useState } from 'react';
import { RefreshCw, Save, Upload } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Admin() {
  const { config, updateConfig, resetConfig, saveConfig } = useConfig();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);

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

  const updateNested = (path: string[], value: string | number | boolean | string[]) => {
    const newConfig = JSON.parse(JSON.stringify(config));
    let current = newConfig;
    for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
    }
    current[path[path.length - 1]] = value;
    updateConfig(newConfig);
  };

  return (
    <main className="relative min-h-screen w-full flex flex-col p-8 overflow-x-hidden">
      <Background />

      <div className="z-10 w-full max-w-4xl mx-auto bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl mb-20">
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
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
                    {saving ? 'Saving...' : <><Save size={16} /> Save to Supabase</>}
                </button>
            </div>
        </div>

        <div className="space-y-8">
            {/* User Info */}
            <section>
                <h2 className="text-xl font-bold text-white mb-4 border-b border-white/10 pb-2">User Profile</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Username" value={config.user.username} onChange={(v) => updateNested(['user', 'username'], v)} />
                    <Input label="Location" value={config.user.location} onChange={(v) => updateNested(['user', 'location'], v)} />
                    <Input label="Discord ID" value={config.user.discordId} onChange={(v) => updateNested(['user', 'discordId'], v)} />

                    <div>
                        <Input label="Avatar URL" value={config.user.avatarUrl} onChange={(v) => updateNested(['user', 'avatarUrl'], v)} />
                        <div className="mt-2">
                             <FileInput
                                label={uploading === 'avatars' ? "Uploading..." : "Upload Avatar"}
                                onChange={(e) => handleFileUpload(e, ['user', 'avatarUrl'], 'avatars')}
                            />
                        </div>
                    </div>

                    <div className="col-span-1 md:col-span-2 pt-2">
                         <Toggle label="Use Discord Avatar" checked={config.user.useDiscordAvatar} onChange={(v) => updateNested(['user', 'useDiscordAvatar'], v)} />
                    </div>
                </div>
                <div className="mt-4">
                     <label className="block text-xs font-bold text-gray-400 mb-1">Description (Lines)</label>
                     {config.user.description.map((line, idx) => (
                         <div key={idx} className="flex gap-2 mb-2">
                            <input
                                type="text"
                                value={line}
                                onChange={(e) => {
                                    const newDesc = [...config.user.description];
                                    newDesc[idx] = e.target.value;
                                    updateNested(['user', 'description'], newDesc);
                                }}
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-pink-500 transition-colors"
                            />
                            <button
                                onClick={() => {
                                    const newDesc = config.user.description.filter((_, i) => i !== idx);
                                    updateNested(['user', 'description'], newDesc);
                                }}
                                className="text-red-400 hover:text-red-300 px-2"
                            >
                                ×
                            </button>
                         </div>
                     ))}
                     <button
                        onClick={() => updateNested(['user', 'description'], [...config.user.description, ""])}
                        className="text-xs text-pink-400 hover:text-pink-300"
                     >
                        + Add Line
                     </button>
                </div>
            </section>

            {/* Theme */}
            <section>
                <h2 className="text-xl font-bold text-white mb-4 border-b border-white/10 pb-2">Theme & Appearance</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <Input label="Background URL (Image/Video)" value={config.theme.backgroundUrl} onChange={(v) => updateNested(['theme', 'backgroundUrl'], v)} />
                        <div className="mt-2">
                             <FileInput
                                label={uploading === 'backgrounds' ? "Uploading..." : "Upload Background"}
                                onChange={(e) => handleFileUpload(e, ['theme', 'backgroundUrl'], 'backgrounds')}
                            />
                        </div>
                    </div>

                    <div>
                        <Input label="Custom Cursor URL" value={config.theme.customCursorUrl} onChange={(v) => updateNested(['theme', 'customCursorUrl'], v)} />
                        <div className="mt-2">
                             <FileInput
                                label={uploading === 'cursors' ? "Uploading..." : "Upload Cursor"}
                                onChange={(e) => handleFileUpload(e, ['theme', 'customCursorUrl'], 'cursors')}
                            />
                        </div>
                    </div>

                    <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                             <label className="block text-xs font-bold text-gray-400 mb-2">Profile Opacity ({config.theme.profileOpacity}%)</label>
                             <input
                                type="range"
                                min="0"
                                max="100"
                                value={config.theme.profileOpacity}
                                onChange={(e) => updateNested(['theme', 'profileOpacity'], Number(e.target.value))}
                                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-pink-500 [&::-webkit-slider-thumb]:rounded-full"
                             />
                        </div>
                        <div>
                             <label className="block text-xs font-bold text-gray-400 mb-2">Background Blur ({config.theme.profileBlur}px)</label>
                             <input
                                type="range"
                                min="0"
                                max="100"
                                value={config.theme.profileBlur}
                                onChange={(e) => updateNested(['theme', 'profileBlur'], Number(e.target.value))}
                                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-pink-500 [&::-webkit-slider-thumb]:rounded-full"
                             />
                        </div>
                    </div>

                    {/* Colors */}
                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-xs font-bold text-gray-400 mb-2">Colors</label>
                        <div className="flex flex-wrap gap-4">
                            {Object.entries(config.theme.colors).map(([key, value]) => (
                                <div key={key} className="flex items-center gap-2 bg-white/5 p-2 rounded-lg">
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

                    {/* Effects Toggles */}
                    <div className="col-span-1 md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(config.theme.effects).map(([key, value]) => (
                            <Toggle
                                key={key}
                                label={key.replace(/([A-Z])/g, ' $1').trim()}
                                checked={value}
                                onChange={(v) => updateNested(['theme', 'effects', key], v)}
                            />
                        ))}
                    </div>
                </div>
            </section>

             {/* Music */}
             <section>
                <h2 className="text-xl font-bold text-white mb-4 border-b border-white/10 pb-2">Music Player</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Input label="Music URL (MP3)" value={config.music.url} onChange={(v) => updateNested(['music', 'url'], v)} />
                        <div className="mt-2">
                             <FileInput
                                label={uploading === 'music' ? "Uploading..." : "Upload MP3"}
                                onChange={(e) => handleFileUpload(e, ['music', 'url'], 'music')}
                            />
                        </div>
                    </div>

                    <div className="flex items-end gap-4 pb-2">
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
    <div className="flex items-center gap-2 cursor-pointer" onClick={() => onChange(!checked)}>
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
