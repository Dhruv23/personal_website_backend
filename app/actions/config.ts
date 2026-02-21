'use server';

import { supabase } from '../lib/supabase';
import { AppConfig } from '../types/config';
import defaultConfig from '../../config.json';

export async function getConfig(): Promise<AppConfig> {
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

  return data.data as AppConfig;
}

export async function updateConfig(newConfig: AppConfig): Promise<boolean> {
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
