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
  offlineStatus: string;
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
  tilt: boolean;
  weather: 'none' | 'cherry' | 'snow' | 'matrix';
  visualizer: boolean;
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
  songTitle?: string;
  albumIconUrl?: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  hidden: boolean;
  order: number;
}

export interface GitHubConfig {
  username: string;
  repos: GitHubRepo[];
  statsWidget: boolean;
}

export interface AppConfig {
  siteMetadata: SiteMetadata;
  user: UserConfig;
  theme: ThemeConfig;
  socials: SocialLink[];
  music: MusicConfig;
  github?: GitHubConfig;
}
