'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AppConfig } from '../types/config';
import { updateConfig as updateServerConfig } from '../actions/config';

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
        const success = await updateServerConfig(config);
        return success;
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
