"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, X, Send, Loader2, MapPin, Search, Bot, ArrowUp, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils"; // Assuming utils exists

export function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const scrollRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const toggleChat = () => setIsOpen((prev) => !prev);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = { role: "user", content: input };
        const newMessages = [...messages, userMessage];

        setMessages(newMessages);
        setInput("");
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: newMessages }),
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            if (!response.body) return;

            // Initialize empty assistant message
            setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let done = false;

            while (!done) {
                const { value, done: doneReading } = await reader.read();
                done = doneReading;
                const chunkValue = decoder.decode(value, { stream: true });

                setMessages((prev) => {
                    const lastMsg = prev[prev.length - 1];
                    // Append only to the last assistant message
                    if (lastMsg.role === 'assistant') {
                        return [
                            ...prev.slice(0, -1),
                            { ...lastMsg, content: lastMsg.content + chunkValue }
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
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end space-y-4">
            {isOpen ? (
                <Card className="w-[380px] h-[600px] flex flex-col shadow-2xl border-border/50 bg-background/80 backdrop-blur-xl animate-in slide-in-from-bottom-10 fade-in duration-300 rounded-2xl overflow-hidden">
                    <CardHeader className="p-4 border-b border-border/50 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent backdrop-blur-md">
                        <div className="flex flex-row items-center justify-between">
                            <CardTitle className="text-lg flex items-center gap-2.5 font-semibold text-foreground/90">
                                <div className="p-2 rounded-lg bg-primary/20 text-primary ring-1 ring-primary/20">
                                    <MessageCircle className="w-5 h-5" />
                                </div>
                                <div className="flex flex-col">
                                    <span>Lost & Found AI</span>
                                    <span className="text-[10px] font-normal text-muted-foreground/80 -mt-0.5">Always here to help</span>
                                </div>
                            </CardTitle>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={toggleChat}
                                className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth" ref={scrollRef}>
                        {messages.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-6 opacity-0 animate-in fade-in zoom-in duration-500 delay-100 fill-mode-forwards">
                                <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-primary/20 to-primary/5 flex items-center justify-center rotate-3 transform transition-transform hover:rotate-6 shadow-lg shadow-primary/5">
                                    <Bot className="w-12 h-12 text-primary/80" />
                                </div>
                                <div className="space-y-2 max-w-[250px]">
                                    <h3 className="font-semibold text-lg text-foreground">How can I help?</h3>
                                    <p className="text-muted-foreground text-sm leading-relaxed">
                                        I can help you find lost items, search the database, or guide you through the reporting process.
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 gap-2 w-full">
                                    {["I lost my wallet", "Found a set of keys", "Search for 'Blue Umbrella'"].map((suggestion, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setInput(suggestion)}
                                            className="text-xs text-left px-3 py-2.5 rounded-xl bg-muted/50 hover:bg-primary/10 hover:text-primary transition-all duration-200 border border-transparent hover:border-primary/20 truncate"
                                        >
                                            "{suggestion}"
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {messages.map((m: any, idx: number) => (
                            <div
                                key={idx}
                                className={cn(
                                    "flex gap-3 max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-300",
                                    m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto flex-row"
                                )}
                            >
                                {m.role !== "user" && (
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary/20 to-secondary/20 flex items-center justify-center shrink-0 shadow-sm border border-white/10 mt-1">
                                        <Bot className="w-4 h-4 text-primary" />
                                    </div>
                                )}
                                <div className="flex flex-col gap-1.5 min-w-0">
                                    {m.role !== "user" && idx === 0 && (
                                        <span className="text-[10px] text-muted-foreground ml-1">AI Assistant</span>
                                    )}
                                    <div
                                        className={cn(
                                            "rounded-2xl px-4 py-2.5 text-sm shadow-sm break-words",
                                            m.role === "user"
                                                ? "bg-primary text-primary-foreground rounded-tr-sm"
                                                : "bg-muted/80 backdrop-blur-sm border border-border/50 text-foreground rounded-tl-sm"
                                        )}
                                    >
                                        <div className="bg-local leading-relaxed">
                                            {m.content}
                                        </div>
                                    </div>

                                    {/* Tool Results (Simplified Style) */}
                                    {/* Note: In manual mode, we render everything in text, but if you have custom part parsers, add them here. 
                                        For now, we assume the server returns text describing the action. */}
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex items-center gap-2 text-muted-foreground text-xs ml-11 animate-pulse">
                                <div className="flex gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce delay-0"></div>
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce delay-150"></div>
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce delay-300"></div>
                                </div>
                                <span className="opacity-70">Thinking...</span>
                            </div>
                        )}

                        {error && (
                            <div className="text-xs text-destructive bg-destructive/10 p-2 rounded-lg text-center animate-in shake">
                                {error}
                            </div>
                        )}
                    </CardContent>

                    <CardFooter className="p-3 border-t border-border/50 bg-background/50 backdrop-blur-md">
                        <form onSubmit={handleSubmit} className="flex w-full gap-2 items-end relative">
                            <Input
                                value={input}
                                onChange={handleInputChange}
                                placeholder="Type a message..."
                                className="flex-1 min-h-[44px] max-h-[100px] rounded-2xl bg-muted/50 border-transparent focus:border-primary/20 focus:bg-background shadow-inner resize-none py-3 pr-10 transition-all"
                                disabled={isLoading}
                                autoComplete="off"
                            />
                            <Button
                                type="submit"
                                size="icon"
                                disabled={isLoading || !input.trim()}
                                className={cn(
                                    "absolute right-1.5 bottom-1.5 h-8 w-8 rounded-full transition-all duration-300 shadow-sm",
                                    input.trim() ? "bg-primary text-primary-foreground hover:scale-105" : "bg-muted text-muted-foreground hover:bg-muted"
                                )}
                            >
                                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 ml-0.5" />}
                            </Button>
                        </form>
                    </CardFooter>
                </Card>
            ) : (
                <Button
                    onClick={toggleChat}
                    size="lg"
                    className="rounded-full h-16 w-16 shadow-lg hover:shadow-primary/25 hover:scale-105 transition-all duration-300 bg-primary text-primary-foreground border-4 border-background"
                >
                    <MessageCircle className="h-8 w-8" />
                </Button>
            )}
        </div>
    );
}
