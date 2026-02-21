export interface SiteMetadata {
  title: string;
  description: string;
  favicon: string;
}

export interface UserConfig {
  username: string;
  status: string;
  avatarUrl: string;
  description: string[];
  location: string;
  discordId: string;
  useDiscordAvatar: boolean;
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  background: string;
  icon: string;
}

export interface ThemeEffects {
  glow: boolean;
  backgroundBlur: boolean;
  animatedTitle: boolean;
  monochromeIcons: boolean;
}

export interface ThemeConfig {
  profileOpacity: number;
  profileBlur: number;
  backgroundUrl: string;
  customCursorUrl: string;
  colors: ThemeColors;
  effects: ThemeEffects;
}

export interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}

export interface MusicConfig {
  enabled: boolean;
  volume: number;
  autoplay: boolean;
  url: string;
}

export interface AppConfig {
  siteMetadata: SiteMetadata;
  user: UserConfig;
  theme: ThemeConfig;
  socials: SocialLink[];
  music: MusicConfig;
}
