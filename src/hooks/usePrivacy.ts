import { useState, useEffect } from 'react';
import { PrivacyState, PhotoPrivacy, ProfileVisibility, BlockedUser } from '@/types/privacy.types';

const DEFAULT_PRIVACY_STATE: PrivacyState = {
  visibility: 'matches',
  showOnline: true,
  readReceipts: false,
  shareLocation: true,
  blockedUsers: [],
  photoSettings: {
    blurUntilMatched: false,
    requireApproval: false,
    whoCanSee: 'matches',
  },
};

export const usePrivacy = () => {
  const [privacyState, setPrivacyState] = useState<PrivacyState>(() => {
    const stored = localStorage.getItem('privacy-settings');
    return stored ? JSON.parse(stored) : DEFAULT_PRIVACY_STATE;
  });

  const [blockedUserDetails, setBlockedUserDetails] = useState<BlockedUser[]>([]);

  // Persist to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('privacy-settings', JSON.stringify(privacyState));
  }, [privacyState]);

  const updateVisibility = (visibility: ProfileVisibility) => {
    setPrivacyState(prev => ({ ...prev, visibility }));
  };

  const toggleOnlineStatus = (showOnline: boolean) => {
    setPrivacyState(prev => ({ ...prev, showOnline }));
  };

  const toggleReadReceipts = (readReceipts: boolean) => {
    setPrivacyState(prev => ({ ...prev, readReceipts }));
  };

  const toggleLocationSharing = (shareLocation: boolean) => {
    setPrivacyState(prev => ({ ...prev, shareLocation }));
  };

  const updatePhotoSettings = (settings: Partial<PhotoPrivacy>) => {
    setPrivacyState(prev => ({
      ...prev,
      photoSettings: { ...prev.photoSettings, ...settings },
    }));
  };

  const blockUser = (userId: string) => {
    if (!privacyState.blockedUsers.includes(userId)) {
      setPrivacyState(prev => ({
        ...prev,
        blockedUsers: [...prev.blockedUsers, userId],
      }));
    }
  };

  const unblockUser = (userId: string) => {
    setPrivacyState(prev => ({
      ...prev,
      blockedUsers: prev.blockedUsers.filter(id => id !== userId),
    }));
    setBlockedUserDetails(prev => prev.filter(user => user.id !== userId));
  };

  const resetPrivacy = () => {
    setPrivacyState(DEFAULT_PRIVACY_STATE);
  };

  const requestDataDownload = async () => {
    // Implement data download logic
    console.log('Requesting data download...');
    // In production, call API to generate and email download link
  };

  const deleteAllMatches = async () => {
    // Implement delete matches logic
    console.log('Deleting all matches...');
    // In production, call API to delete matches
  };

  const clearSearchHistory = async () => {
    // Implement clear search history logic
    console.log('Clearing search history...');
    localStorage.removeItem('search-history');
  };

  return {
    privacyState,
    blockedUserDetails,
    updateVisibility,
    toggleOnlineStatus,
    toggleReadReceipts,
    toggleLocationSharing,
    updatePhotoSettings,
    blockUser,
    unblockUser,
    resetPrivacy,
    requestDataDownload,
    deleteAllMatches,
    clearSearchHistory,
  };
};
