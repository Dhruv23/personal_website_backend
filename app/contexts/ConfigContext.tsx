'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AppConfig } from '../types/config';
import { supabase } from '../lib/supabase';

interface ConfigContextType {
  config: AppConfig;
  updateConfig: (newConfig: Partial<AppConfig>) => void;
  resetConfig: () => void;
  saveConfig: () => Promise<boolean>;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export const ConfigProvider = ({
    children,
    initialConfig
}: {
    children: ReactNode,
    initialConfig: AppConfig
}) => {
  const [config, setConfig] = useState<AppConfig>(initialConfig);

  const updateConfig = (newConfig: Partial<AppConfig>) => {
    setConfig((prev) => ({ ...prev, ...newConfig }));
  };

  const resetConfig = () => {
    setConfig(initialConfig);
  }

  const saveConfig = async () => {
    try {
        // We assume there is only one row, id: 1 (or the first one created)
        // First, get the ID of the config row
        const { data: currentData } = await supabase
            .from('site_config')
            .select('id')
            .limit(1)
            .single();

        if (!currentData) {
            // Create if doesn't exist
            const { error } = await supabase
                .from('site_config')
                .insert({ data: config });

            if (error) throw error;
        } else {
            // Update
            const { error } = await supabase
                .from('site_config')
                .update({ data: config, updated_at: new Date().toISOString() })
                .eq('id', currentData.id);

            if (error) throw error;
        }
        return true;
    } catch (e) {
        console.error("Failed to save config:", e);
        return false;
    }
  };

  return (
    <ConfigContext.Provider value={{ config, updateConfig, resetConfig, saveConfig }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};
