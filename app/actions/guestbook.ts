'use server';

import { supabase } from '../lib/supabase';

export interface GuestbookEntry {
  id: string;
  name: string;
  message: string;
  created_at: string;
}

export async function getGuestbookEntries(): Promise<GuestbookEntry[]> {
  const { data, error } = await supabase
    .from('guestbook')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error fetching guestbook:', error);
    return [];
  }

  return data as GuestbookEntry[];
}

export async function addGuestbookEntry(name: string, message: string): Promise<boolean> {
  // Simple validation
  if (!name || !message || name.length > 50 || message.length > 200) {
    return false;
  }

  const { error } = await supabase
    .from('guestbook')
    .insert([{ name, message }]);

  if (error) {
    console.error('Error adding guestbook entry:', error);
    return false;
  }

  return true;
}
