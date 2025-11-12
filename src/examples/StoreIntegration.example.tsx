import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  useAuth,
  useConversations,
  useConversation,
  useNotifications,
  useSearch,
  useSavedSearches,
  useUnreadCounts,
} from '@/hooks/useStore';
import { Bell, MessageSquare, Search, User } from 'lucide-react';

// Auth Demo
const AuthDemo = () => {
  const { user, isAuthenticated, setAuth, clearAuth } = useAuth();

  const handleLogin = () => {
    // Simulate login
    setAuth(
      { id: 'user-123', email: 'demo@example.com' } as any,
      { access_token: 'demo-token' } as any
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Auth Store
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground mb-1">Status:</p>
          <Badge variant={isAuthenticated ? 'default' : 'secondary'}>
            {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
          </Badge>
        </div>

        {user && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">User:</p>
            <p className="text-sm font-mono">{user.email}</p>
          </div>
        )}

        <div className="flex gap-2">
          <Button onClick={handleLogin} disabled={isAuthenticated}>
            Login
          </Button>
          <Button onClick={clearAuth} variant="outline" disabled={!isAuthenticated}>
            Logout
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Chat Demo
const ChatDemo = () => {
  const { conversations, addConversation } = useConversations();
  const unreadCounts = useUnreadCounts();

  const createConversation = () => {
    const id = `conv-${Date.now()}`;
    addConversation({
      id,
      participantIds: ['user-1', 'user-2'],
      unreadCount: Math.floor(Math.random() * 5),
      updatedAt: new Date(),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Chat Store
          {unreadCounts.chat > 0 && (
            <Badge variant="destructive" className="ml-auto">
              {unreadCounts.chat}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={createConversation} className="w-full">
          Create Conversation
        </Button>

        <div className="space-y-2 max-h-48 overflow-y-auto">
          {conversations.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No conversations
            </p>
          ) : (
            conversations.map((conv) => (
              <div key={conv.id} className="p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono">{conv.id}</span>
                  {conv.unreadCount > 0 && (
                    <Badge variant="secondary">{conv.unreadCount}</Badge>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Notification Demo
const NotificationDemo = () => {
  const { notifications, unreadCount, addNotification, markAsRead } = useNotifications();

  const createNotification = () => {
    addNotification({
      id: `notif-${Date.now()}`,
      type: 'message',
      title: 'New Message',
      message: 'You have a new message',
      read: false,
      timestamp: new Date(),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notification Store
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-auto">
              {unreadCount}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={createNotification} className="w-full">
          Add Notification
        </Button>

        <div className="space-y-2 max-h-48 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No notifications
            </p>
          ) : (
            notifications.slice(0, 5).map((notif) => (
              <div
                key={notif.id}
                className={`p-3 rounded-lg ${
                  notif.read ? 'bg-muted' : 'bg-primary/10 border border-primary/20'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium">{notif.title}</p>
                    <p className="text-xs text-muted-foreground">{notif.message}</p>
                  </div>
                  {!notif.read && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => markAsRead(notif.id)}
                    >
                      Mark Read
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Search Demo
const SearchDemo = () => {
  const { filters, results, setFilters, setResults } = useSearch();
  const { savedSearches, addSavedSearch } = useSavedSearches();
  const [searchName, setSearchName] = useState('');

  const runSearch = () => {
    // Simulate search
    setResults([
      {
        id: '1',
        name: 'Sarah Ahmed',
        age: 28,
        location: 'New York',
        photos: [],
        compatibility: 85,
      },
      {
        id: '2',
        name: 'Fatima Khan',
        age: 26,
        location: 'Chicago',
        photos: [],
        compatibility: 92,
      },
    ]);
  };

  const saveSearch = () => {
    if (!searchName) return;
    addSavedSearch({
      id: `search-${Date.now()}`,
      name: searchName,
      filters,
      createdAt: new Date(),
      notifyOnNewMatches: false,
    });
    setSearchName('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="w-5 h-5" />
          Search Store
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Age Range</label>
          <div className="flex gap-2">
            <Input
              type="number"
              value={filters.ageRange[0]}
              onChange={(e) =>
                setFilters({ ageRange: [+e.target.value, filters.ageRange[1]] })
              }
              className="w-20"
            />
            <span className="text-muted-foreground">to</span>
            <Input
              type="number"
              value={filters.ageRange[1]}
              onChange={(e) =>
                setFilters({ ageRange: [filters.ageRange[0], +e.target.value] })
              }
              className="w-20"
            />
          </div>
        </div>

        <Button onClick={runSearch} className="w-full">
          Search
        </Button>

        {results.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Results: {results.length}</p>
            {results.map((result) => (
              <div key={result.id} className="p-2 bg-muted rounded text-sm">
                {result.name}, {result.age} - {result.compatibility}% match
              </div>
            ))}
          </div>
        )}

        <div className="pt-4 border-t space-y-2">
          <p className="text-sm font-medium">Save Search</p>
          <div className="flex gap-2">
            <Input
              placeholder="Search name"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
            />
            <Button onClick={saveSearch} variant="outline">
              Save
            </Button>
          </div>
          {savedSearches.length > 0 && (
            <p className="text-xs text-muted-foreground">
              {savedSearches.length} saved searches
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Main Example
export default function StoreIntegrationExample() {
  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Centralized Store Demo</h1>
        <p className="text-muted-foreground">
          Zustand-based state management with persistence
        </p>
      </div>

      <Tabs defaultValue="auth" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="auth">Auth</TabsTrigger>
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="search">Search</TabsTrigger>
        </TabsList>

        <TabsContent value="auth" className="mt-6">
          <AuthDemo />
        </TabsContent>

        <TabsContent value="chat" className="mt-6">
          <ChatDemo />
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <NotificationDemo />
        </TabsContent>

        <TabsContent value="search" className="mt-6">
          <SearchDemo />
        </TabsContent>
      </Tabs>
    </div>
  );
}
