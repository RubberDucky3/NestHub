import { useState, useRef, useEffect } from "react";
import { Bot, Send, X, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";

type Message = {
    id: string;
    role: "user" | "assistant";
    content: string;
};

export function AIAssistantWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([{
        id: 'welcome',
        role: "assistant",
        content: "Hi! I'm your HomeHub AI. Ask me about your chores, points, or upcoming events!"
    }]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom of chat
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg: Message = { id: Date.now().toString(), role: "user", content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);

        try {
            const res = await apiRequest("POST", "/api/chat", { message: userMsg.content });
            const data = await res.json();
            const aiMsg: Message = { id: (Date.now() + 1).toString(), role: "assistant", content: data.reply };
            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            const errorMsg: Message = { id: (Date.now() + 1).toString(), role: "assistant", content: "I encountered an error connecting to my server. Please try again." };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {isOpen && (
                <div className="mb-4 w-80 sm:w-96 bg-background/80 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-5 duration-300">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-purple-600/90 to-teal-500/90 p-4 text-white flex justify-between items-center shrink-0">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-yellow-300" />
                            <h3 className="font-semibold text-lg">HomeHub AI</h3>
                        </div>
                        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 h-8 w-8 rounded-full" onClick={() => setIsOpen(false)}>
                            <X className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* Chat Area */}
                    <div className="h-80 p-4 overflow-y-auto flex flex-col gap-4" ref={scrollRef}>
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex items-start gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === "assistant" ? "bg-gradient-to-br from-purple-500 to-teal-400 text-white" : "bg-muted text-muted-foreground"}`}>
                                    {msg.role === "assistant" ? <Bot className="w-4 h-4" /> : <div className="text-xs font-bold">U</div>}
                                </div>
                                <div className={`px-4 py-2 rounded-2xl max-w-[75%] text-sm shadow-sm ${msg.role === "user" ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-card border border-border/50 rounded-tl-none"}`}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex items-start gap-2">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-gradient-to-br from-purple-500 to-teal-400 text-white">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                </div>
                                <div className="px-4 py-2 rounded-2xl max-w-[75%] text-sm bg-card border border-border/50 rounded-tl-none flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                    <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                    <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="p-3 bg-muted/30 border-t border-border/50 flex gap-2 shrink-0">
                        <Input
                            placeholder="Ask about your household..."
                            className="bg-background rounded-full border-border/50 focus-visible:ring-purple-500"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSend()}
                        />
                        <Button size="icon" className="rounded-full shrink-0 bg-gradient-to-r from-purple-600 to-teal-500 hover:opacity-90 border-0" onClick={handleSend} disabled={isLoading || !input.trim()}>
                            <Send className="w-4 h-4 text-white" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            <Button
                size="icon"
                className={`w-14 h-14 rounded-full shadow-lg bg-gradient-to-br from-purple-600 to-teal-500 hover:scale-105 hover:shadow-xl transition-all duration-300 border-2 border-white/20 ${isOpen ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'}`}
                onClick={() => setIsOpen(true)}
            >
                <Bot className="w-7 h-7 text-white drop-shadow-md" />
            </Button>
        </div>
    );
}
