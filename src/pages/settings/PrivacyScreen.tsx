import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { TopBar } from '@/components/layout/TopBar';
import { BaseCard } from '@/components/ui/Cards/BaseCard';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { 
  Eye, CheckCheck, MapPin, Image as ImageIcon, 
  Download, Trash2, X
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BlockedUser {
  id: string;
  name: string;
  age: number;
  avatar: string;
}

export default function PrivacyScreen() {
  const navigate = useNavigate();
  const [showInDiscover, setShowInDiscover] = useState(true);
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);
  const [showReadReceipts, setShowReadReceipts] = useState(false);
  const [shareLocation, setShareLocation] = useState(true);
  const [profileVisibility, setProfileVisibility] = useState<string>('matches');
  const [blurPhotos, setBlurPhotos] = useState(false);
  const [requirePhotoApproval, setRequirePhotoApproval] = useState(false);
  
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([
    { id: '1', name: 'User One', age: 28, avatar: '👤' },
    { id: '2', name: 'User Two', age: 32, avatar: '👤' },
    { id: '3', name: 'User Three', age: 26, avatar: '👤' },
  ]);

  const handleToggle = (key: string, value: boolean) => {
    localStorage.setItem(`privacy-${key}`, JSON.stringify(value));
  };

  const handleUnblock = (userId: string) => {
    setBlockedUsers(blockedUsers.filter(user => user.id !== userId));
  };

  const handleDownloadData = () => {
    // Implement data download
    console.log('Downloading user data...');
  };

  const handleDeleteMatches = () => {
    if (window.confirm('Are you sure you want to delete all matches? This cannot be undone.')) {
      console.log('Deleting all matches...');
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Clear all search history?')) {
      console.log('Clearing search history...');
    }
  };

  return (
    <ScreenContainer>
      <TopBar 
        variant="back"
        title="Privacy"
        onBackClick={() => navigate(-1)}
      />

      <div className="flex-1 overflow-y-auto pb-20">
        {/* Visibility Settings */}
        <div className="px-5 pt-6 pb-4">
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">Visibility Settings</h2>
          <BaseCard padding="md" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 pr-4">
                <div className="flex items-center gap-2 mb-1">
                  <Eye className="w-4 h-4 text-muted-foreground" />
                  <h3 className="font-medium">Show me in Discover</h3>
                </div>
                <p className="text-sm text-muted-foreground">Others can find you</p>
              </div>
              <Switch 
                checked={showInDiscover}
                onCheckedChange={(checked) => {
                  setShowInDiscover(checked);
                  handleToggle('discover', checked);
                }}
              />
            </div>

            <div className="h-px bg-border" />

            <div className="flex items-center justify-between">
              <div className="flex-1 pr-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-semantic-success" />
                  <h3 className="font-medium">Show online status</h3>
                </div>
                <p className="text-sm text-muted-foreground">Show when you're active</p>
              </div>
              <Switch 
                checked={showOnlineStatus}
                onCheckedChange={(checked) => {
                  setShowOnlineStatus(checked);
                  handleToggle('online-status', checked);
                }}
              />
            </div>

            <div className="h-px bg-border" />

            <div className="flex items-center justify-between">
              <div className="flex-1 pr-4">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCheck className="w-4 h-4 text-muted-foreground" />
                  <h3 className="font-medium">Show read receipts</h3>
                  <Badge variant="secondary" className="text-xs">Premium</Badge>
                </div>
                <p className="text-sm text-muted-foreground">Know when seen</p>
              </div>
              <Switch 
                checked={showReadReceipts}
                onCheckedChange={(checked) => {
                  setShowReadReceipts(checked);
                  handleToggle('read-receipts', checked);
                }}
                disabled={!showReadReceipts}
              />
            </div>

            <div className="h-px bg-border" />

            <div className="flex items-center justify-between">
              <div className="flex-1 pr-4">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <h3 className="font-medium">Share location</h3>
                </div>
                <p className="text-sm text-muted-foreground">Approximate only</p>
              </div>
              <Switch 
                checked={shareLocation}
                onCheckedChange={(checked) => {
                  setShareLocation(checked);
                  handleToggle('location', checked);
                }}
              />
            </div>
          </BaseCard>
        </div>

        {/* Profile Visibility */}
        <div className="px-5 py-4">
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">Profile Visibility</h2>
          <BaseCard padding="md">
            <label className="text-sm font-medium mb-2 block">Who can see my profile</label>
            <Select value={profileVisibility} onValueChange={setProfileVisibility}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="everyone">Everyone</SelectItem>
                <SelectItem value="matches">Matches only</SelectItem>
                <SelectItem value="hidden">No one (hidden)</SelectItem>
              </SelectContent>
            </Select>
          </BaseCard>
        </div>

        {/* Photo Settings */}
        <div className="px-5 py-4">
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">Photo Settings</h2>
          <BaseCard padding="md" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 pr-4">
                <div className="flex items-center gap-2 mb-1">
                  <ImageIcon className="w-4 h-4 text-muted-foreground" />
                  <h3 className="font-medium">Blur until matched</h3>
                </div>
                <p className="text-sm text-muted-foreground">Photos blurred for non-matches</p>
              </div>
              <Switch 
                checked={blurPhotos}
                onCheckedChange={setBlurPhotos}
              />
            </div>

            <div className="h-px bg-border" />

            <div className="flex items-center justify-between">
              <div className="flex-1 pr-4">
                <h3 className="font-medium mb-1">Require approval</h3>
                <p className="text-sm text-muted-foreground">Approve photo view requests</p>
              </div>
              <Switch 
                checked={requirePhotoApproval}
                onCheckedChange={setRequirePhotoApproval}
              />
            </div>
          </BaseCard>
        </div>

        {/* Blocked Users */}
        <div id="blocked" className="px-5 py-4">
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">Blocked Users</h2>
          {blockedUsers.length === 0 ? (
            <BaseCard padding="md">
              <p className="text-center text-muted-foreground py-8">
                No blocked users
              </p>
            </BaseCard>
          ) : (
            <div className="space-y-2">
              {blockedUsers.map((user) => (
                <BaseCard key={user.id} padding="sm" className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xl">
                      {user.avatar}
                    </div>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.age} years old</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleUnblock(user.id)}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Unblock
                  </Button>
                </BaseCard>
              ))}
            </div>
          )}
        </div>

        {/* Data Management */}
        <div id="data" className="px-5 py-4 pb-8">
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">Data Management</h2>
          <div className="space-y-3">
            <Button
              variant="secondary"
              className="w-full justify-start"
              onClick={handleDownloadData}
            >
              <Download className="w-5 h-5 mr-2" />
              Download my data
            </Button>
            
            <Button
              variant="secondary"
              className="w-full justify-start border-semantic-warning text-semantic-warning hover:bg-semantic-warning/10"
              onClick={handleDeleteMatches}
            >
              <Trash2 className="w-5 h-5 mr-2" />
              Delete all matches
            </Button>
            
            <Button
              variant="secondary"
              className="w-full justify-start"
              onClick={handleClearHistory}
            >
              <Trash2 className="w-5 h-5 mr-2" />
              Clear search history
            </Button>
          </div>
        </div>
      </div>
    </ScreenContainer>
  );
}
