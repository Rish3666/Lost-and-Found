"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, X, Send, Loader2, Bot, ArrowUp, Search, ArrowRight } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const scrollRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Scroll to bottom whenever messages change
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen]);

    const toggleChat = () => setIsOpen((prev) => !prev);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = { role: "user", content: input };
        // Clean input for display

        const newMessages = [...messages, userMessage];

        setMessages(newMessages);
        setInput("");
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: newMessages, pathname }), // Send pathname context
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            if (!response.body) return;

            // Initialize assistant message
            setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let done = false;
            let fullText = "";

            while (!done) {
                const { value, done: doneReading } = await reader.read();
                done = doneReading;
                const chunkValue = decoder.decode(value, { stream: true });
                fullText += chunkValue;

                // CHECK FOR REDIRECT
                // Updated regex to capture everything until the closing tag (handles spaces in queries)
                const redirectMatch = fullText.match(/__REDIRECT:(.+?)__/);
                if (redirectMatch) {
                    const path = redirectMatch[1];
                    console.log("Redirecting to:", path);
                    // setIsOpen(false); // Don't close chat on redirect, let user decide
                    router.push(path); // Go to page
                    return; // Stop processing stream
                }

                // Clean up display text:
                // Remove REDIRECT tags and handle function tags nicely
                const displayText = fullText
                    .replace(/__REDIRECT:.*$/, '')
                    // Replace full <function> blocks with status text immediately to avoid huge raw XML dump
                    .replace(/<function[\s\S]*?<\/function>/g, '\n\n*Checking database...*\n\n')
                    // Also catch partial start tags to prevent ugly display during generation
                    .replace(/<function[\s\S]*$/, '\n*Checking database...*')
                    .replace('Action: Navigating', 'Navigating')
                    .trim();

                setMessages((prev) => {
                    const lastMsg = prev[prev.length - 1];
                    if (lastMsg.role === 'assistant') {
                        return [
                            ...prev.slice(0, -1),
                            { ...lastMsg, content: displayText }
                        ];
                    }
                    return prev;
                });
            }
        } catch (err: any) {
            console.error("Chat Failed:", err);
            setError(err.message || "Failed to send message");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end space-y-4 font-sans text-foreground">
            {isOpen ? (
                <Card className="w-[380px] h-[600px] flex flex-col shadow-2xl border-white/10 bg-[#0f172a]/95 backdrop-blur-xl animate-in slide-in-from-bottom-10 fade-in duration-300 rounded-3xl overflow-hidden ring-1 ring-white/5">
                    {/* Header */}
                    <CardHeader className="p-0 border-b border-border/40 shrink-0 z-10">
                        <div className="bg-gradient-to-r from-blue-600/20 via-violet-600/20 to-background/5 p-4 flex flex-row items-center justify-between backdrop-blur-3xl">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-blue-600/10 text-blue-500 ring-1 ring-blue-500/20 shadow-[0_0_15px_-3px_rgba(59,130,246,0.3)]">
                                    <MessageCircle className="w-5 h-5 fill-current" />
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <span className="font-bold text-base tracking-tight text-slate-100">Lost & Found AI</span>
                                    <div className="flex items-center gap-1.5">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                        </span>
                                        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Online</span>
                                    </div>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={toggleChat}
                                className="h-8 w-8 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-all hover:rotate-90"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    </CardHeader>

                    {/* Chat Area */}
                    <CardContent
                        className="flex-1 overflow-y-auto p-4 scroll-smooth"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {/* Hide scrollbar for Chrome/Safari/Edge */}
                        <style jsx global>{`
                            .scroll-smooth::-webkit-scrollbar {
                                display: none;
                            }
                        `}</style>

                        {/* Messages container - now using min-h to push content down if needed, but standard logic actually works better with just spacing if we want bubble flow.
                            However, user complained about 'space between text and message box'. If messages are sparse, they are at TOP.
                            If we want them at BOTTOM (like standard chat apps), we use flex-col justify-end.
                         */}
                        <div className="flex flex-col justify-end min-h-full space-y-4">
                            {messages.length === 0 && (
                                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-8 animate-in fade-in zoom-in duration-500 select-none">
                                    <div className="relative">
                                        <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-full blur-2xl opacity-50 animate-pulse"></div>
                                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-800 border border-white/10 flex items-center justify-center rotate-3 transform shadow-xl relative z-10">
                                            <Bot className="w-10 h-10 text-blue-500" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="font-bold text-xl tracking-tight bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent">
                                            How can I help?
                                        </h3>
                                        <p className="text-slate-400 text-sm leading-relaxed max-w-[260px] mx-auto">
                                            Find items, report losses, or ask about campus policies.
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-1 gap-2.5 w-full">
                                        {["I lost my wallet", "Found a set of keys", "Search for 'Blue Umbrella'"].map((suggestion, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setInput(suggestion)}
                                                className="group relative flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                                            >
                                                <div className="p-1.5 rounded-md bg-white/5 text-slate-400 group-hover:text-blue-400 transition-colors">
                                                    <Search className="w-3.5 h-3.5" />
                                                </div>
                                                <span className="text-sm font-medium text-slate-300 group-hover:text-white">
                                                    {suggestion}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {messages.map((m: any, idx: number) => {
                                // Skip rendering empty assistant messages unless it's the very last one (which might be typing)
                                if (m.role === 'assistant' && !m.content && idx !== messages.length - 1) return null;

                                return (
                                    <div
                                        key={idx}
                                        className={cn(
                                            "flex gap-3 max-w-[85%] animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out",
                                            m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto flex-row"
                                        )}
                                    >
                                        {m.role !== "user" && (
                                            <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center shrink-0 shadow-lg mt-auto mb-0.5">
                                                <Bot className="w-4 h-4 text-blue-400" />
                                            </div>
                                        )}

                                        <div className={cn(
                                            "flex flex-col gap-1 min-w-0",
                                            m.role === "user" ? "items-end" : "items-start"
                                        )}>
                                            <div
                                                className={cn(
                                                    "px-5 py-3.5 text-sm shadow-md transition-all",
                                                    m.role === "user"
                                                        ? "bg-blue-600 text-white rounded-[20px] rounded-br-[4px]"
                                                        : "bg-slate-800/80 backdrop-blur-md border border-white/5 text-slate-100 rounded-[20px] rounded-bl-[4px]"
                                                )}
                                            >
                                                {m.content ? (
                                                    <div className="leading-relaxed whitespace-pre-wrap break-words">{m.content}</div>
                                                ) : (
                                                    <div className="flex gap-1 h-5 items-center px-1">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce [animation-delay:-0.3s]"></div>
                                                        <div className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce [animation-delay:-0.15s]"></div>
                                                        <div className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce"></div>
                                                    </div>
                                                )}
                                            </div>
                                            <span className="text-[10px] text-slate-500 px-1 select-none">
                                                {m.role === "user" ? "You" : "AI Assistant"}
                                            </span>
                                        </div>
                                    </div>
                                )
                            })}

                            {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
                                <div className="flex gap-3 max-w-[85%] animate-in fade-in">
                                    <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center shrink-0 shadow-lg mt-auto mb-0.5">
                                        <Bot className="w-4 h-4 text-blue-400" />
                                    </div>
                                    <div className="bg-slate-800/80 border border-white/5 rounded-[20px] rounded-bl-[4px] px-5 py-3.5 flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400/50 animate-bounce [animation-delay:-0.3s]"></div>
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400/50 animate-bounce [animation-delay:-0.15s]"></div>
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400/50 animate-bounce"></div>
                                    </div>
                                </div>
                            )}

                            {/* Invisible div to scroll to */}
                            <div ref={messagesEndRef} />
                        </div>

                        {error && (
                            <div className="mt-4 mx-auto max-w-[90%] text-xs text-red-300 bg-red-900/20 border border-red-500/20 p-3 rounded-xl text-center flex items-center justify-center gap-2 animate-in slide-in-from-top-2">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                </span>
                                {error}
                            </div>
                        )}
                    </CardContent>

                    <CardFooter className="p-4 border-t border-border/40 bg-[#0f172a]/95 backdrop-blur-3xl shrink-0 z-10">
                        <form onSubmit={handleSubmit} className="flex w-full gap-2 items-end relative rounded-3xl bg-white/5 p-1 border border-white/10 focus-within:border-blue-500/30 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all duration-300">
                            <Input
                                value={input}
                                onChange={handleInputChange}
                                placeholder="Message..."
                                className="flex-1 min-h-[48px] max-h-[120px] border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-4 py-3 placeholder:text-slate-400 text-slate-100 resize-none"
                                disabled={isLoading}
                                autoComplete="off"
                            />
                            <Button
                                type="submit"
                                size="icon"
                                disabled={isLoading || !input.trim()}
                                className={cn(
                                    "h-10 w-10 rounded-full transition-all duration-300 shadow-sm mb-0.5 mr-0.5",
                                    input.trim() ? "bg-blue-600 text-white hover:bg-blue-700 hover:scale-105 hover:shadow-blue-500/25" : "bg-transparent text-slate-500"
                                )}
                            >
                                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowUp className="h-5 w-5 stroke-[2.5]" />}
                            </Button>
                        </form>
                    </CardFooter>
                </Card>
            ) : (
                <Button
                    onClick={toggleChat}
                    size="lg"
                    className="rounded-full h-14 w-14 shadow-2xl hover:shadow-blue-500/40 hover:scale-110 active:scale-95 transition-all duration-500 bg-gradient-to-tr from-blue-600 to-violet-600 text-white border-4 border-[#0f172a]/80 backdrop-blur-sm group p-0 flex items-center justify-center"
                >
                    <MessageCircle className="h-7 w-7 stroke-[2.5] group-hover:rotate-12 transition-transform duration-300 drop-shadow-md" />
                </Button>
            )}
        </div>
    );
}
