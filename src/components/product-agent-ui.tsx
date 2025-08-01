'use client';

import * as React from 'react';
import { useProductAgent } from '@/hooks/use-product-agent';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Bot, Copy, Loader2, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggle } from './theme-toggle';
import { ChatMessage } from './chat-message';
import { ChatInput } from './chat-input';

export default function ProductAgentUI() {
  const { messages, prd, edd, isLoading, sendMessage } = useProductAgent();
  const { toast } = useToast();

  const [isPanelVisible, setIsPanelVisible] = React.useState(true);
  const [chatPanelWidth, setChatPanelWidth] = React.useState<number>(50);
  const isResizing = React.useRef(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing.current) return;
    const newWidth = (e.clientX / window.innerWidth) * 100;
    if (newWidth > 30 && newWidth < 70) {
      setChatPanelWidth(newWidth);
    }
  };

  const handleMouseUp = () => {
    isResizing.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const copyToClipboard = (text: string, documentName: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard',
      description: `${documentName} has been copied to your clipboard.`,
    });
  };

  const chatScrollAnchorRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    chatScrollAnchorRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background font-sans text-foreground">
      {/* Chat Panel */}
      <div
        className="relative flex h-full flex-col"
        style={{ width: isPanelVisible ? `${chatPanelWidth}%` : '100%' }}
      >
        <header className="flex h-14 items-center justify-between border-b border-r px-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsPanelVisible(!isPanelVisible)}
            >
              {isPanelVisible ? <PanelLeftClose /> : <PanelLeftOpen />}
            </Button>
            <ThemeToggle />
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold">Product Agent</h1>
            <Bot className="h-7 w-7 text-primary" />
          </div>
        </header>

        <ScrollArea className="flex-1 border-r">
          <div className="space-y-6 p-4 md:p-6">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            {isLoading && messages.length > 0 && (
              <div className="flex items-start gap-3 justify-start">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border bg-primary text-primary-foreground">
                  <Bot className="h-5 w-5" />
                </div>
                <div className="flex items-center gap-2 rounded-2xl rounded-bl-none bg-card p-3 text-sm shadow-sm">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Thinking...</span>
                </div>
              </div>
            )}
            <div ref={chatScrollAnchorRef} />
          </div>
        </ScrollArea>

        <div className="border-r border-t p-4">
          <ChatInput onSend={sendMessage} isLoading={isLoading} />
        </div>
      </div>

      {isPanelVisible && (
        <>
          {/* Resizer */}
          <div
            className="w-2 cursor-col-resize bg-border/50 transition-colors hover:bg-border"
            onMouseDown={handleMouseDown}
          />
          {/* Document Panel */}
          <div
            className="flex h-full flex-col"
            style={{ width: `${100 - chatPanelWidth}%` }}
          >
            <Tabs defaultValue="prd" className="flex h-full flex-col">
              <div className="flex h-14 items-center justify-between border-b px-4">
                <TabsList>
                  <TabsTrigger value="prd">PRD</TabsTrigger>
                  <TabsTrigger value="edd">EDD</TabsTrigger>
                </TabsList>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(prd, 'PRD')}
                  >
                    <Copy className="mr-2 h-4 w-4" /> Copy PRD
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(edd, 'EDD')}
                  >
                    <Copy className="mr-2 h-4 w-4" /> Copy EDD
                  </Button>
                </div>
              </div>
              <div className="flex-1 overflow-hidden">
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
                      <pre className="whitespace-pre-wrap p-6 font-sans text-sm">
                        {prd || 'PRD will be generated here...'}
                      </pre>
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
                      <pre className="whitespace-pre-wrap p-6 font-sans text-sm">
                        {edd || 'EDD will be generated here...'}
                      </pre>
                    )}
                  </ScrollArea>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </>
      )}
    </div>
  );
}
