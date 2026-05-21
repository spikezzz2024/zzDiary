import { useState, useRef, useEffect } from 'react';
import { useDiaryStore } from './diary.store';
import Button from '../../components/ui/Button';

export default function GuidedChat() {
  const { chatMessages, analyzing, addChatMessage, analyze } = useDiaryStore();
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || analyzing) return;

    addChatMessage({ role: 'user', content: trimmed });
    setInput('');

    // Simulate AI response for guided conversation
    setTimeout(() => {
      addChatMessage({ role: 'assistant', content: getGuideResponse(trimmed) });
    }, 800);
  };

  const handleFinish = () => {
    analyze();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-gray-200 bg-white p-4 min-h-[300px] max-h-[400px] overflow-y-auto">
        {chatMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-[260px] text-gray-400 gap-2">
            <p className="text-lg">开始一场对话吧</p>
            <p className="text-sm">AI 会温和地引导你表达内心的感受</p>
          </div>
        )}
        {chatMessages.map((msg, i) => (
          <div
            key={i}
            className={`mb-4 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {analyzing && (
          <div className="flex justify-start mb-4">
            <div className="bg-gray-100 rounded-xl px-4 py-2.5 text-sm text-gray-500">
              <span className="inline-block animate-pulse">正在理解你的感受...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <textarea
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
            placeholder="写下你的想法... (Enter 发送，Shift+Enter 换行)"
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={analyzing}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleSend} disabled={!input.trim() || analyzing}>
            发送
          </Button>
          <Button
            onClick={handleFinish}
            disabled={chatMessages.length === 0 || analyzing}
          >
            完成分析
          </Button>
        </div>
      </div>
    </div>
  );
}

function getGuideResponse(userInput: string): string {
  const lower = userInput.toLowerCase();

  if (lower.length < 10) {
    return '可以多说一些吗？我很想了解你此刻的感受。';
  }
  if (/生气|愤怒|讨厌|烦|暴躁/.test(lower)) {
    return '听起来你今天经历了不少让人生气的事情。这件事让你想到了过去的类似经历吗？';
  }
  if (/难过|伤心|哭|悲伤|失落/.test(lower)) {
    return '我能感受到你的悲伤。这种难过的感觉，是从什么时候开始的呢？';
  }
  if (/焦虑|紧张|担心|害怕|不安/.test(lower)) {
    return '焦虑的感觉一定很不好受。你觉得这种焦虑背后，是在担心什么具体的事情吗？';
  }
  if (/开心|高兴|快乐|幸福|感激/.test(lower)) {
    return '真为你感到高兴！你觉得是什么让今天这么特别呢？';
  }
  return '谢谢你愿意分享这些。你刚才说的这些，让你身体的哪个部位感觉最明显呢？';
}
