'use client';

import { useState, useEffect } from 'react';

const LANYARD_WS = 'wss://api.lanyard.rest/socket';

export interface LanyardData {
  spotify: {
    track_id: string;
    timestamps: {
      start: number;
      end: number;
    };
    song: string;
    artist: string;
    album_art_url: string;
    album: string;
  } | null;
  discord_user: {
    username: string;
    public_flags: number;
    id: string;
    discriminator: string;
    avatar: string;
    avatar_decoration_data: {
      asset: string;
      sku_id: string;
    } | null;
  };
  discord_status: string;
  activities: Array<{
    type: number;
    state: string;
    name: string;
    id: string;
    details: string;
    assets: {
      small_text: string;
      small_image: string;
      large_text: string;
      large_image: string;
    };
    timestamps: {
      start: number;
      end?: number;
    };
    emoji?: {
      name: string;
      id?: string;
      animated?: boolean;
    };
  }>;
  active_on_discord_web: boolean;
  active_on_discord_mobile: boolean;
  active_on_discord_desktop: boolean;
}

export function useLanyard(discordId: string) {
  const [data, setData] = useState<LanyardData | null>(null);

  useEffect(() => {
    if (!discordId) return;

    let ws: WebSocket;
    let heartbeatInterval: NodeJS.Timeout;

    const connect = () => {
      ws = new WebSocket(LANYARD_WS);

      ws.onopen = () => {
        // Subscribe
        ws.send(JSON.stringify({
          op: 2,
          d: { subscribe_to_id: discordId }
        }));
      };

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);

        if (message.op === 1) {
          // Identify/Hello - Start heartbeat
          const heartbeat_interval = message.d.heartbeat_interval;
          heartbeatInterval = setInterval(() => {
            ws.send(JSON.stringify({ op: 3 }));
          }, heartbeat_interval);
        } else if (message.t === 'INIT_STATE' || message.t === 'PRESENCE_UPDATE') {
          setData(message.d);
        }
      };

      ws.onclose = () => {
        clearInterval(heartbeatInterval);
        setTimeout(connect, 5000); // Reconnect after 5s
      };
    };

    connect();

    return () => {
      clearInterval(heartbeatInterval);
      if (ws) ws.close();
    };
  }, [discordId]);

  return data;
}
