'use server';

import { supabase } from '../lib/supabase';
import { AppConfig } from '../types/config';
import defaultConfig from '../../config.json';

// Deep merge utility to ensure we don't lose nested properties
// when the database JSON is missing newer schema additions
function mergeConfigs(defaultConf: any, dbConf: any): AppConfig {
  if (!dbConf) return defaultConf as AppConfig;

  const merged = { ...defaultConf };

  for (const key in merged) {
    if (dbConf.hasOwnProperty(key)) {
      if (typeof dbConf[key] === 'object' && dbConf[key] !== null && !Array.isArray(dbConf[key])) {
        // Deep merge for nested objects (like user, theme, etc)
        merged[key] = { ...defaultConf[key], ...dbConf[key] };
      } else {
        // Direct assignment for primitives and arrays
        merged[key] = dbConf[key];
      }
    }
  }

  return merged as AppConfig;
}

export async function getConfig(): Promise<AppConfig> {
  if (!supabase) {
    console.warn('Supabase client not initialized. Falling back to default config.');
    return defaultConfig as unknown as AppConfig;
  }

  const { data, error } = await supabase
    .from('site_config')
    .select('data')
    .order('id', { ascending: true })
    .limit(1)
    .single();

  if (error || !data) {
    console.error('Supabase Config Fetch Error:', error);
    // Fallback to local config if Supabase fails or is empty
    return defaultConfig as unknown as AppConfig;
  }

  return mergeConfigs(defaultConfig, data.data);
}

export async function updateConfig(newConfig: AppConfig): Promise<boolean> {
  if (!supabase) return false;

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
        .insert({ data: newConfig });

      if (error) {
          console.error('Supabase Config Insert Error:', error);
          return false;
      }
      return true;
  }

  const { error } = await supabase
    .from('site_config')
    .update({ data: newConfig, updated_at: new Date().toISOString() })
    .eq('id', currentData.id);

  if (error) {
    console.error('Supabase Config Update Error:', error);
    return false;
  }

  return true;
}
