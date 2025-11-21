import { useState, useEffect, useCallback } from 'react';
import { MemoryConsent, ConsentHistoryEntry, DataExportRequest, EncryptionStatus } from '@/types/privacy.types';

const CONSENT_KEY = 'memory_consent';
const CONSENT_HISTORY_KEY = 'memory_consent_history';
const CURRENT_POLICY_VERSION = '1.0.0';

const DEFAULT_CONSENT: MemoryConsent = {
  granted: false,
  version: CURRENT_POLICY_VERSION,
};

const ENCRYPTION_STATUS: EncryptionStatus = {
  enabled: true,
  algorithm: 'AES-256-GCM',
  lastRotated: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
  keyVersion: 'v2.1',
};

export const useMemoryPrivacy = () => {
  const [consent, setConsent] = useState<MemoryConsent>(DEFAULT_CONSENT);
  const [consentHistory, setConsentHistory] = useState<ConsentHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load consent and history from localStorage
  useEffect(() => {
    try {
      const storedConsent = localStorage.getItem(CONSENT_KEY);
      const storedHistory = localStorage.getItem(CONSENT_HISTORY_KEY);

      if (storedConsent) {
        const parsed = JSON.parse(storedConsent);
        setConsent({
          ...parsed,
          grantedAt: parsed.grantedAt ? new Date(parsed.grantedAt) : undefined,
          revokedAt: parsed.revokedAt ? new Date(parsed.revokedAt) : undefined,
        });
      }

      if (storedHistory) {
        const parsed = JSON.parse(storedHistory);
        setConsentHistory(
          parsed.map((entry: any) => ({
            ...entry,
            timestamp: new Date(entry.timestamp),
          }))
        );
      }
    } catch (error) {
      console.error('Error loading memory privacy settings:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save consent to localStorage
  const saveConsent = useCallback((newConsent: MemoryConsent) => {
    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify(newConsent));
      setConsent(newConsent);
    } catch (error) {
      console.error('Error saving consent:', error);
    }
  }, []);

  // Save consent history to localStorage
  const saveConsentHistory = useCallback((history: ConsentHistoryEntry[]) => {
    try {
      localStorage.setItem(CONSENT_HISTORY_KEY, JSON.stringify(history));
      setConsentHistory(history);
    } catch (error) {
      console.error('Error saving consent history:', error);
    }
  }, []);

  // Grant consent
  const grantConsent = useCallback(() => {
    const newConsent: MemoryConsent = {
      granted: true,
      grantedAt: new Date(),
      version: CURRENT_POLICY_VERSION,
    };

    const historyEntry: ConsentHistoryEntry = {
      id: `consent_${Date.now()}`,
      action: 'granted',
      timestamp: new Date(),
      policyVersion: CURRENT_POLICY_VERSION,
      details: 'User granted memory storage consent',
    };

    saveConsent(newConsent);
    saveConsentHistory([historyEntry, ...consentHistory]);
  }, [consentHistory, saveConsent, saveConsentHistory]);

  // Revoke consent
  const revokeConsent = useCallback(() => {
    const newConsent: MemoryConsent = {
      granted: false,
      revokedAt: new Date(),
      version: CURRENT_POLICY_VERSION,
    };

    const historyEntry: ConsentHistoryEntry = {
      id: `revoke_${Date.now()}`,
      action: 'revoked',
      timestamp: new Date(),
      policyVersion: CURRENT_POLICY_VERSION,
      details: 'User revoked memory storage consent',
    };

    saveConsent(newConsent);
    saveConsentHistory([historyEntry, ...consentHistory]);
  }, [consentHistory, saveConsent, saveConsentHistory]);

  // Request data export
  const requestDataExport = useCallback(async (): Promise<DataExportRequest> => {
    // In production, this would call an API endpoint
    const exportRequest: DataExportRequest = {
      id: `export_${Date.now()}`,
      requestedAt: new Date(),
      status: 'pending',
    };

    // Simulate processing
    setTimeout(() => {
      exportRequest.status = 'completed';
      exportRequest.downloadUrl = '/api/exports/memory-data.json';
      exportRequest.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    }, 2000);

    return exportRequest;
  }, []);

  // Delete specific memories
  const deleteMemories = useCallback(async (memoryIds: string[]) => {
    // In production, this would call an API endpoint
    // For now, we'll just update localStorage
    const storedMemories = localStorage.getItem('mmgent_memories');
    if (storedMemories) {
      const memories = JSON.parse(storedMemories);
      const filtered = memories.filter((m: any) => !memoryIds.includes(m.id));
      localStorage.setItem('mmgent_memories', JSON.stringify(filtered));
    }

    const historyEntry: ConsentHistoryEntry = {
      id: `delete_${Date.now()}`,
      action: 'modified',
      timestamp: new Date(),
      policyVersion: CURRENT_POLICY_VERSION,
      details: `Deleted ${memoryIds.length} ${memoryIds.length === 1 ? 'memory' : 'memories'}`,
    };

    saveConsentHistory([historyEntry, ...consentHistory]);
  }, [consentHistory, saveConsentHistory]);

  // Delete all memories
  const deleteAllMemories = useCallback(async () => {
    // In production, this would call an API endpoint
    localStorage.removeItem('mmgent_memories');
    localStorage.setItem('mmgent_memory_settings', JSON.stringify({
      enableMemory: false,
      enablePersonalization: false,
      storageLimit: 100,
      currentUsage: 0,
    }));

    const historyEntry: ConsentHistoryEntry = {
      id: `delete_all_${Date.now()}`,
      action: 'modified',
      timestamp: new Date(),
      policyVersion: CURRENT_POLICY_VERSION,
      details: 'All memories permanently deleted',
    };

    saveConsentHistory([historyEntry, ...consentHistory]);
  }, [consentHistory, saveConsentHistory]);

  return {
    consent,
    consentHistory,
    encryptionStatus: ENCRYPTION_STATUS,
    isLoading,
    grantConsent,
    revokeConsent,
    requestDataExport,
    deleteMemories,
    deleteAllMemories,
  };
};
