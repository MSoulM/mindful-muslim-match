/**
 * Optimistic Updates Examples
 * 
 * Demonstrates useOptimisticUpdate patterns for instant UI feedback
 */

import { useState } from 'react';
import { useQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useOptimisticUpdate, useOptimisticList } from '@/hooks/useOptimisticUpdate';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const queryClient = new QueryClient();

// Example 1: Optimistic message sending
export function OptimisticMessagesExample() {
  const [newMessage, setNewMessage] = useState('');

  // Fetch messages
  const { data: messages = [] } = useQuery({
    queryKey: ['messages', 'chat-123'],
    queryFn: async () => {
      // Simulated API call
      return [
        { id: '1', content: 'Hello!', status: 'sent' },
        { id: '2', content: 'How are you?', status: 'sent' },
      ];
    },
  });

  // Optimistic send message
  const sendMessage = useOptimisticUpdate(
    ['messages', 'chat-123'],
    async (message: any) => {
      // Simulate API call with delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Simulate occasional failure
      if (Math.random() > 0.8) {
        throw new Error('Failed to send message');
      }
      
      return { ...message, status: 'sent' };
    },
    {
      updater: (old: any[], newMessage) => [
        ...old,
        { ...newMessage, status: 'sending' },
      ],
      onSuccess: () => {
        toast.success('Message sent!');
      },
      onError: (error) => {
        toast.error('Failed to send message');
      },
    }
  );

  const handleSend = () => {
    if (!newMessage.trim()) return;

    sendMessage.mutate({
      id: Date.now().toString(),
      content: newMessage,
      timestamp: new Date().toISOString(),
    });

    setNewMessage('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Optimistic Messages</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {messages.map((msg: any) => (
            <div
              key={msg.id}
              className={`p-3 rounded-lg ${
                msg.status === 'sending'
                  ? 'bg-muted opacity-70'
                  : 'bg-primary/10'
              }`}
            >
              <p className="text-sm">{msg.content}</p>
              <span className="text-xs text-muted-foreground">
                {msg.status}
              </span>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <Button
            onClick={handleSend}
            disabled={sendMessage.isPending}
          >
            Send
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Example 2: Optimistic list operations (todo list)
export function OptimisticTodoExample() {
  const [newTodo, setNewTodo] = useState('');

  const { data: todos = [] } = useQuery({
    queryKey: ['todos'],
    queryFn: async () => [
      { id: '1', text: 'Complete onboarding', completed: true },
      { id: '2', text: 'Upload photos', completed: false },
    ],
  });

  // Add todo
  const addTodo = useOptimisticList(
    ['todos'],
    async (todo: any) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return todo;
    },
    'add'
  );

  // Toggle todo
  const toggleTodo = useOptimisticUpdate(
    ['todos'],
    async (todo: any) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return todo;
    },
    {
      updater: (old: any[], updated) => 
        old.map((item) =>
          item.id === updated.id ? { ...item, completed: !item.completed } : item
        ),
      onError: () => toast.error('Failed to update todo'),
    }
  );

  // Delete todo
  const deleteTodo = useOptimisticList(
    ['todos'],
    async (todo: any) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return todo;
    },
    'delete'
  );

  const handleAdd = () => {
    if (!newTodo.trim()) return;

    addTodo.mutate({
      id: Date.now().toString(),
      text: newTodo,
      completed: false,
    });

    setNewTodo('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Optimistic Todo List</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Add a todo..."
            onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
          />
          <Button onClick={handleAdd}>Add</Button>
        </div>

        <div className="space-y-2">
          {todos.map((todo: any) => (
            <div
              key={todo.id}
              className="flex items-center gap-3 p-3 bg-muted rounded-lg"
            >
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo.mutate(todo)}
                className="w-5 h-5"
              />
              <span
                className={`flex-1 ${
                  todo.completed ? 'line-through text-muted-foreground' : ''
                }`}
              >
                {todo.text}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteTodo.mutate(todo)}
              >
                Delete
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Example 3: Optimistic reaction (like button)
export function OptimisticReactionExample() {
  const postId = 'post-123';

  const { data: post } = useQuery({
    queryKey: ['post', postId],
    queryFn: async () => ({
      id: postId,
      content: 'Check out my profile!',
      liked: false,
      likeCount: 42,
    }),
  });

  const toggleLike = useOptimisticUpdate(
    ['post', postId],
    async (liked: boolean) => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      return liked;
    },
    {
      updater: (old: any) => ({
        ...old,
        liked: !old.liked,
        likeCount: old.liked ? old.likeCount - 1 : old.likeCount + 1,
      }),
      onError: () => toast.error('Failed to update like'),
    }
  );

  if (!post) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Optimistic Reactions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm">{post.content}</p>
        
        <Button
          variant={post.liked ? 'default' : 'outline'}
          onClick={() => toggleLike.mutate(!post.liked)}
          className="gap-2"
        >
          <span>{post.liked ? '❤️' : '🤍'}</span>
          <span>{post.likeCount} likes</span>
        </Button>

        <p className="text-xs text-muted-foreground">
          Click the button - notice instant feedback even with network delay!
        </p>
      </CardContent>
    </Card>
  );
}

// Wrapper with QueryClient
export function OptimisticUpdatesDemo() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="space-y-4 p-4">
        <OptimisticMessagesExample />
        <OptimisticTodoExample />
        <OptimisticReactionExample />
      </div>
    </QueryClientProvider>
  );
}
