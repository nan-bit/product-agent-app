
'use client';

import * as React from 'react';
import ReactMarkdown from 'react-markdown';
import { useProductAgent } from '@/hooks/use-product-agent';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Bot, Copy, Loader2, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggle } from './theme-toggle';
import { ChatMessage } from './chat-message';
import { ChatInput } from './chat-input';

export default function ProductAgentUI() {
  const { messages, prd, edd, uxd, isLoading, sendMessage } = useProductAgent();
  const { toast } = useToast();

  const [isPanelVisible, setIsPanelVisible] = React.useState(true);
  const [docPanelWidth, setDocPanelWidth] = React.useState<number>(50);
  const isResizing = React.useRef(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing.current) return;
    // Calculate new width based on cursor position, but from the left edge of the screen
    const newWidth = (e.clientX / window.innerWidth) * 100;
    if (newWidth > 30 && newWidth < 70) {
      setDocPanelWidth(newWidth);
    }
  };

  const handleMouseUp = () => {
    isResizing.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const copyToClipboard = () => {
    const combinedDocs = `## Product Requirements Document (PRD)\n\n${prd}\n\n---\n\n## Engineering Design Document (EDD)\n\n${edd}\n\n---\n\n## User Experience Document (UXD)\n\n${uxd}`;
    navigator.clipboard.writeText(combinedDocs);
    toast({
      title: 'Copied to clipboard',
      description: 'PRD, EDD, and UXD have been copied to your clipboard.',
    });
  };

  const chatScrollAnchorRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    chatScrollAnchorRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background font-sans text-foreground">
      {/* Document Panel */}
      {isPanelVisible && (
        <>
          <div
            className="flex h-full flex-col"
            style={{ width: `${docPanelWidth}%` }}
          >
            <Tabs defaultValue="prd" className="flex h-full flex-col">
              <div className="flex h-14 items-center justify-between border-b border-r px-4">
                <TabsList>
                  <TabsTrigger value="prd">PRD</TabsTrigger>
                  <TabsTrigger value="edd">EDD</TabsTrigger>
                  <TabsTrigger value="uxd">UXD</TabsTrigger>
                </TabsList>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyToClipboard}
                    disabled={!prd && !edd && !uxd}
                  >
                    <Copy className="mr-2 h-4 w-4" /> Copy Documents
                  </Button>
                </div>
              </div>
              <div className="flex-1 overflow-hidden border-r">
                <TabsContent value="prd" className="mt-0 h-full">
                  <ScrollArea className="h-full">
                    {isLoading && !prd ? (
                      <div className="space-y-4 p-6">
                        <Skeleton className="h-8 w-1/2" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="mt-4 h-8 w-1/3" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                      </div>
                    ) : (
                      <div className="markdown-body p-6">
                        <ReactMarkdown>{prd || 'PRD will be generated here...'}</ReactMarkdown>
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>
                <TabsContent value="edd" className="mt-0 h-full">
                  <ScrollArea className="h-full">
                    {isLoading && !edd ? (
                      <div className="space-y-4 p-6">
                        <Skeleton className="h-8 w-1/2" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="mt-4 h-8 w-1/3" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                      </div>
                    ) : (
                     <div className="markdown-body p-6">
                        <ReactMarkdown>{edd || 'EDD will be generated here...'}</ReactMarkdown>
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>
                <TabsContent value="uxd" className="mt-0 h-full">
                  <ScrollArea className="h-full">
                    {isLoading && !uxd ? (
                      <div className="space-y-4 p-6">
                        <Skeleton className="h-8 w-1/2" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="mt-4 h-8 w-1/3" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                      </div>
                    ) : (
                     <div className="markdown-body p-6">
                        <ReactMarkdown>{uxd || 'UXD will be generated here...'}</ReactMarkdown>
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>
              </div>
            </Tabs>
          </div>

          {/* Resizer */}
          <div
            className="w-2 cursor-col-resize bg-border/50 transition-colors hover:bg-border"
            onMouseDown={handleMouseDown}
          />
        </>
      )}

      {/* Chat Panel */}
      <div
        className="relative flex h-full flex-col"
        style={{ width: isPanelVisible ? `${100 - docPanelWidth}%` : '100%' }}
      >
        <header className="flex h-14 items-center justify-between border-b px-4">
          <div className="flex items-center gap-2">
             <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsPanelVisible(!isPanelVisible)}
            >
              {isPanelVisible ? <PanelLeftClose /> : <PanelLeftOpen />}
            </Button>
            <h1 className="text-lg font-semibold">Product Agent</h1>
            <Bot className="h-7 w-7 text-primary" />
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </header>

        <ScrollArea className="flex-1">
          <div className="space-y-6 p-4 md:p-6">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            {isLoading && messages.length > 0 && (
              <div className="flex items-start gap-3 justify-start">
                <Avatar className="h-8 w-8 border">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <Bot className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-2 rounded-2xl rounded-bl-none bg-card p-3 text-sm shadow-sm">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Thinking...</span>
                </div>
              </div>
            )}
            <div ref={chatScrollAnchorRef} />
          </div>
        </ScrollArea>

        <div className="border-t p-4">
          <ChatInput onSend={sendMessage} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
