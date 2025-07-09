import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../services/ChatService';
import { getChatCompletion } from '../services/ChatService';

const ChatBot: React.FC = () => {
  const [messages, setMessages] = useState<{ text: string; sender: 'user' | 'bot' }[]>([]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<ChatMessage[]>([
    { role: 'system', content: 'Voce e um assistente que fala carioques. Usa todas as gírias cariocas e fala de forma descontraída. Troca uma ideia com o usuario e sempre fala bem do Rio de Janeiro. Se o usuario pedir para procurar vagas de emprego, procura vagas de emprego no Rio de Janeiro e fala que o Rio é o melhor lugar do mundo para se trabalhar.' }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, { text: input, sender: 'user' }]);
    setHistory(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    const reply = await getChatCompletion([...history, userMessage]);
    const botMessage: ChatMessage = { role: 'assistant', content: reply };

    setMessages(prev => [...prev, { text: reply, sender: 'bot' }]);
    setHistory(prev => [...prev, botMessage]);
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div className="chatbot">
      <div className="chat-window">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.sender}`}>
            <span>{msg.text}</span>
          </div>
        ))}
        {loading && <div className="message bot"><span>Typing...</span></div>}
        <div ref={messagesEndRef} />
      </div>
      <div className="input-area">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask something..."
        />
        <button onClick={handleSend} disabled={loading}>Send</button>
      </div>
    </div>
  );
};

export default ChatBot;
