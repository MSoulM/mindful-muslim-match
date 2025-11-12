export type ProfileVisibility = 'everyone' | 'matches' | 'hidden';

export interface PhotoPrivacy {
  blurUntilMatched: boolean;
  requireApproval: boolean;
  whoCanSee: ProfileVisibility;
}

export interface PrivacyState {
  visibility: ProfileVisibility;
  showOnline: boolean;
  readReceipts: boolean;
  shareLocation: boolean;
  blockedUsers: string[];
  photoSettings: PhotoPrivacy;
}

export interface BlockedUser {
  id: string;
  name: string;
  age: number;
  avatar: string;
  blockedAt: string;
}

export interface PrivacyPreferences extends PrivacyState {
  showInDiscover: boolean;
  dataDownloadRequested?: boolean;
  lastUpdated: string;
}

// Privacy action types for state management
export type PrivacyAction =
  | { type: 'SET_VISIBILITY'; payload: ProfileVisibility }
  | { type: 'TOGGLE_ONLINE_STATUS'; payload: boolean }
  | { type: 'TOGGLE_READ_RECEIPTS'; payload: boolean }
  | { type: 'TOGGLE_LOCATION'; payload: boolean }
  | { type: 'BLOCK_USER'; payload: string }
  | { type: 'UNBLOCK_USER'; payload: string }
  | { type: 'UPDATE_PHOTO_SETTINGS'; payload: Partial<PhotoPrivacy> }
  | { type: 'RESET_PRIVACY'; payload: PrivacyState };
