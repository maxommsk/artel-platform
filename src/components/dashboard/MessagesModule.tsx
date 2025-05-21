// Компоненты для модуля сообщений

import React, { useState, useEffect } from 'react';

interface Message {
  id: number;
  sender_id: number;
  recipient_id: number;
  subject: string;
  body: string;
  is_read: boolean;
  created_at: string;
  sender_name?: string; // Добавим для отображения
  recipient_name?: string; // Добавим для отображения
}

interface MessagesProps {
  userId: number;
}

// Заглушка для API сообщений
const fetchMessages = async (userId: number, type: 'inbox' | 'sent'): Promise<Message[]> => {
  // Здесь должен быть реальный вызов API
  console.log(`Fetching ${type} for user ${userId}`);
  // Примерные данные
  const mockMessages: Message[] = [
    {
      id: 1,
      sender_id: 2,
      recipient_id: userId,
      subject: 'Добро пожаловать!',
      body: 'Рады приветствовать вас в ЖНК Артель!',
      is_read: false,
      created_at: '2025-05-03T10:00:00Z',
      sender_name: 'Администрация',
    },
    {
      id: 2,
      sender_id: userId,
      recipient_id: 1,
      subject: 'Вопрос по тарифам',
      body: 'Здравствуйте, подскажите подробнее про тариф Оптимальный.',
      is_read: true,
      created_at: '2025-05-02T15:30:00Z',
      recipient_name: 'Администрация',
    },
  ];
  return type === 'inbox' ? mockMessages.filter(m => m.recipient_id === userId) : mockMessages.filter(m => m.sender_id === userId);
};

const sendMessage = async (message: Omit<Message, 'id' | 'created_at' | 'is_read'>): Promise<Message> => {
  // Здесь должен быть реальный вызов API
  console.log('Sending message:', message);
  const sentMessage: Message = {
    ...message,
    id: Math.floor(Math.random() * 1000),
    created_at: new Date().toISOString(),
    is_read: false,
  };
  return sentMessage;
};

export const MessagesList: React.FC<MessagesProps> = ({ userId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [view, setView] = useState<'inbox' | 'sent'>('inbox');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showCompose, setShowCompose] = useState(false);

  useEffect(() => {
    fetchMessages(userId, view).then(setMessages);
  }, [userId, view]);

  const handleSendMessage = async (recipientId: number, subject: string, body: string) => {
    try {
      await sendMessage({ sender_id: userId, recipient_id: recipientId, subject, body });
      setShowCompose(false);
      // Обновить список отправленных, если нужно
      if (view === 'sent') {
        fetchMessages(userId, 'sent').then(setMessages);
      }
      alert('Сообщение отправлено!');
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Ошибка отправки сообщения.');
    }
  };

  if (selectedMessage) {
    return <MessageView message={selectedMessage} onBack={() => setSelectedMessage(null)} />;
  }

  if (showCompose) {
    return <ComposeMessage userId={userId} onSend={handleSendMessage} onCancel={() => setShowCompose(false)} />;
  }

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Сообщения</h2>
      <div className="mb-4 flex space-x-2">
        <button
          onClick={() => setView('inbox')}
          className={`px-3 py-1 rounded ${view === 'inbox' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Входящие
        </button>
        <button
          onClick={() => setView('sent')}
          className={`px-3 py-1 rounded ${view === 'sent' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Отправленные
        </button>
        <button
            onClick={() => setShowCompose(true)}
            className="ml-auto px-3 py-1 rounded bg-green-500 text-white"
        >
            Написать
        </button>
      </div>
      {messages.length === 0 ? (
        <p>Нет сообщений.</p>
      ) : (
        <ul className="space-y-2">
          {messages.map((msg) => (
            <li
              key={msg.id}
              onClick={() => setSelectedMessage(msg)}
              className={`p-3 border rounded cursor-pointer hover:bg-gray-100 ${!msg.is_read && view === 'inbox' ? 'font-bold' : ''}`}
            >
              <div className="flex justify-between">
                <span>{view === 'inbox' ? `От: ${msg.sender_name || msg.sender_id}` : `Кому: ${msg.recipient_name || msg.recipient_id}`}</span>
                <span className="text-sm text-gray-500">{new Date(msg.created_at).toLocaleString()}</span>
              </div>
              <div>{msg.subject}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

interface MessageViewProps {
  message: Message;
  onBack: () => void;
}

const MessageView: React.FC<MessageViewProps> = ({ message, onBack }) => {
  // Отметить как прочитанное при просмотре (если это входящее)
  useEffect(() => {
    if (!message.is_read) {
      // Здесь должен быть вызов API для отметки сообщения как прочитанного
      console.log(`Marking message ${message.id} as read`);
      // message.is_read = true; // Локальное обновление для UI
    }
  }, [message]);

  return (
    <div className="p-4 bg-white rounded shadow">
      <button onClick={onBack} className="mb-4 text-blue-500 hover:underline">{'< Назад'}</button>
      <h2 className="text-xl font-semibold mb-2">{message.subject}</h2>
      <div className="mb-4 text-sm text-gray-600">
        {message.sender_id === message.recipient_id ? (
            <span>От: {message.sender_name || message.sender_id}</span>
        ) : (
            <span>От: {message.sender_name || message.sender_id} | Кому: {message.recipient_name || message.recipient_id}</span>
        )}
        <span className="ml-4">{new Date(message.created_at).toLocaleString()}</span>
      </div>
      <div className="whitespace-pre-wrap border-t pt-4">
        {message.body}
      </div>
    </div>
  );
};

interface ComposeMessageProps {
    userId: number;
    onSend: (recipientId: number, subject: string, body: string) => Promise<void>;
    onCancel: () => void;
}

const ComposeMessage: React.FC<ComposeMessageProps> = ({ userId, onSend, onCancel }) => {
    const [recipientId, setRecipientId] = useState('');
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [isSending, setIsSending] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!recipientId || !subject || !body) {
            alert('Пожалуйста, заполните все поля.');
            return;
        }
        setIsSending(true);
        await onSend(parseInt(recipientId, 10), subject, body);
        setIsSending(false);
    };

    return (
        <div className="p-4 bg-white rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Новое сообщение</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="recipientId" className="block text-sm font-medium text-gray-700 mb-1">Кому (ID пользователя):</label>
                    <input
                        type="number"
                        id="recipientId"
                        value={recipientId}
                        onChange={(e) => setRecipientId(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                    {/* TODO: Добавить поиск пользователя по имени/email */} 
                </div>
                <div className="mb-4">
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Тема:</label>
                    <input
                        type="text"
                        id="subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="body" className="block text-sm font-medium text-gray-700 mb-1">Сообщение:</label>
                    <textarea
                        id="body"
                        rows={6}
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                </div>
                <div className="flex justify-end space-x-2">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isSending}
                        className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 disabled:opacity-50"
                    >
                        Отмена
                    </button>
                    <button
                        type="submit"
                        disabled={isSending}
                        className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
                    >
                        {isSending ? 'Отправка...' : 'Отправить'}
                    </button>
                </div>
            </form>
        </div>
    );
};

