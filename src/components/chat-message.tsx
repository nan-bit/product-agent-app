'use client';

import { Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Message } from '@/lib/types';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isAgent = message.role === 'agent';

  return (
    <div
      className={cn(
        'flex items-start gap-3',
        isAgent ? 'justify-start' : 'justify-end'
      )}
    >
      {isAgent && (
        <Avatar className="h-8 w-8 border">
          <AvatarFallback className="bg-primary text-primary-foreground">
            <Bot className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          'max-w-md rounded-2xl p-3 text-sm shadow-sm animate-in fade-in',
          isAgent
            ? 'rounded-bl-none bg-card'
            : 'rounded-br-none bg-primary text-primary-foreground'
        )}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
       {!isAgent && (
        <Avatar className="h-8 w-8 border">
          <AvatarFallback className='bg-secondary text-secondary-foreground'>
            <User className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
