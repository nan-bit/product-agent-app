'use client';

import * as React from 'react';
import { SendHorizonal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
}

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [value, setValue] = React.useState('');
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(event.target.value);
  };

  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${scrollHeight}px`;
    }
  }, [value]);
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!value.trim() || isLoading) return;
    onSend(value);
    setValue('');
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e as any);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="relative flex w-full items-end gap-2 rounded-xl border bg-card p-2 shadow"
    >
      <Textarea
        ref={textareaRef}
        rows={1}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder="Tell me about your product idea..."
        className="max-h-48 resize-none border-0 bg-transparent px-2 py-1.5 shadow-none focus-visible:ring-0"
        disabled={isLoading}
      />
      <Button type="submit" size="icon" disabled={isLoading || !value.trim()}>
        <SendHorizonal />
        <span className="sr-only">Send message</span>
      </Button>
    </form>
  );
}
