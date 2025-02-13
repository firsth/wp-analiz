'use client';

import { useState, useEffect } from 'react';
import FileUpload from '@/components/FileUpload';
import ChatStats from '@/components/ChatStats';

export default function Home() {
  const [chatData, setChatData] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <main className="min-h-screen p-8 bg-gray-900">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-white">
          WhatsApp Sohbet Analizi
        </h1>
        <FileUpload onDataProcessed={setChatData} />
        {chatData && <ChatStats data={chatData} />}
      </div>
    </main>
  );
}
