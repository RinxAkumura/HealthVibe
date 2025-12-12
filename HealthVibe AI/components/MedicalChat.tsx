import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Bot, MessageSquare } from 'lucide-react';
import { Chat } from '@google/genai';
import { ChatMessage } from '../types';

interface MedicalChatProps {
  chatSession: Chat;
}

export const MedicalChat: React.FC<MedicalChatProps> = ({ chatSession }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initial greeting
  useEffect(() => {
    setMessages([
      {
        id: 'init',
        role: 'model',
        text: 'Hola. He revisado tu caso. ¿Tienes alguna pregunta sobre el diagnóstico o los pasos a seguir?',
        timestamp: new Date()
      }
    ]);
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const result = await chatSession.sendMessage({ message: userMsg.text });
      const modelMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: result.text || "Lo siento, no pude procesar eso.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, modelMsg]);
    } catch (error) {
      console.error("Chat error:", error);
      // Handle error gracefully in UI
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "Hubo un error de conexión. Por favor intenta de nuevo.",
        timestamp: new Date()
      };
       setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[500px]">
      {/* Chat Header */}
      <div className="bg-slate-50 border-b border-slate-200 p-4 flex items-center gap-3">
        <div className="bg-teal-100 p-2 rounded-full">
          <MessageSquare className="w-5 h-5 text-teal-600" />
        </div>
        <div>
          <h3 className="font-bold text-slate-800">Asistente Post-Diagnóstico</h3>
          <p className="text-slate-500 text-xs flex items-center gap-1">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            En línea • Gemini 3 Pro
          </p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex items-end gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'}`}>
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            
            <div 
              className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm border ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white border-blue-600 rounded-br-none' 
                  : 'bg-slate-50 text-slate-800 border-slate-200 rounded-bl-none'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex items-end gap-2">
             <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
               <Bot className="w-4 h-4" />
             </div>
             <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-1">
               <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
               <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></span>
               <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></span>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-200">
        <form onSubmit={handleSend} className="flex gap-2 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pregunta sobre tu diagnóstico o tratamiento..."
            className="flex-1 pl-4 pr-4 py-3 bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-teal-500 rounded-xl transition-all outline-none text-slate-700 placeholder:text-slate-400 border"
            disabled={isTyping}
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="bg-teal-600 hover:bg-teal-700 disabled:bg-slate-200 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-colors shadow-sm"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};