export type RoomStatus = 'active' | 'paused' | 'closed';

export interface PromoBanner {
  id: string;
  title: string;
  subtitle: string;
  color: 'gold' | 'emerald' | 'purple' | 'ruby';
  is_active: boolean;
}

export interface KaraokeRoom {
  id: string; room_code: string; host_pin: string; name: string; status: RoomStatus;
  current_song_id: string | null; is_playing: boolean; current_time_seconds: number; volume_percent: number;
  created_at: string; updated_at: string; owner_id?: string | null; owner_email?: string | null;
  business_name?: string | null; pricing_mode?: 'free' | 'paid_per_song'; price_per_song?: number;
  is_approved?: boolean; approved_at?: string | null; approved_by?: string | null;
  promo_banners?: PromoBanner[]; allow_vip_boost?: boolean;
}

export type QueueStatus =
  | 'queued' | 'playing' | 'finished' | 'skipped' | 'purged_by_host' | 'cancelled_by_guest';

export interface QueueItem {
  id: string; room_id: string; guest_id: string | null; video_id: string; title: string; author: string;
  thumbnail_url: string | null; duration_seconds: number; duration_text: string; requested_by: string;
  priority_order: number; status: QueueStatus; requested_at: string; started_at: string | null; finished_at: string | null;
  dedication?: string | null; is_vip?: boolean;
}

export interface KaraokeGuest {
  id: string; room_id: string; session_token: string; guest_name: string;
  is_active: boolean; joined_at: string; last_seen_at: string;
}

export type CommandType = 'play' | 'pause' | 'skip' | 'previous' | 'seek' | 'volume' | 'set_promo_banners';

export interface RemoteCommand {
  id: string; room_id: string; command: CommandType;
  payload: { volume?: number; seconds?: number; [key: string]: unknown } | null;
  is_executed: boolean; created_at: string;
}

export type SearchFilterType = 'all' | 'karaoke' | 'official' | 'live';
export type VersionCategory = 'karaoke' | 'official' | 'live' | 'general';

export interface SearchResultItem {
  videoId: string; title: string; author: string; durationSeconds: number;
  durationText: string; thumbnailUrl: string; versionType?: VersionCategory;
}

export interface GuestSession {
  guestName: string; sessionToken: string; guestId?: string;
  joinedAt: number; initialLat?: number; initialLng?: number;
}

export interface GuestPresenceStatus {
  isWithinGracePeriod: boolean; remainingGraceMinutes: number;
  distanceMeters?: number; hasLocationPermission: boolean;
}

export interface GuestTurnStatus {
  isSingingNow: boolean; hasSongsInQueue: boolean; queuePosition: number;
  songsAhead: number; estimatedWaitMinutes: number; userSongsCount: number;
}

export interface TvPlayerState {
  isPlaying: boolean; currentTime: number; duration: number; volume: number;
  currentSong: QueueItem | null; nextSongs: QueueItem[];
}
