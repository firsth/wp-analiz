'use client';

import { useState } from 'react';

interface FileUploadProps {
  onDataProcessed: (data: any) => void;
}

export default function FileUpload({ onDataProcessed }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const formatDate = (dateStr: string) => {
    // Gelen tarih formatını standartlaştır (DD.MM.YY veya DD/MM/YY -> DD.MM.YYYY)
    const [day, month, year] = dateStr.split(/[./]/).map(num => num.trim());
    const fullYear = year.length === 2 ? '20' + year : year;
    return `${day.padStart(2, '0')}.${month.padStart(2, '0')}.${fullYear}`;
  };

  const processFile = async (file: File) => {
    const text = await file.text();
    const lines = text.split('\n');
    
    const messagePattern = /^\[?(\d{1,2}[/.]\d{1,2}[/.]\d{2,4})[,\s]+(\d{1,2}:\d{2}(?::\d{2})?)\]?\s-\s([^:]+):\s(.+)$/;
    const messages: any[] = [];
    
    lines.forEach(line => {
      const match = line.match(messagePattern);
      if (match) {
        const [, date, time, sender, message] = match;
        messages.push({
          date: formatDate(date),
          time: time.trim(),
          sender: sender.trim(),
          message: message.trim()
        });
      }
    });

    const stats = messages.reduce((acc: any, curr) => {
      const sender = curr.sender;
      if (!acc[sender]) {
        acc[sender] = {
          messageCount: 0,
          messages: [],
          dates: []
        };
      }
      acc[sender].messageCount++;
      acc[sender].messages.push(curr.message);
      acc[sender].dates.push(curr.date);
      return acc;
    }, {});

    onDataProcessed(stats);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'text/plain') {
      await processFile(file);
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
        isDragging 
          ? 'border-blue-400 bg-gray-800' 
          : 'border-gray-600 hover:border-gray-500 bg-gray-800'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => document.getElementById('fileInput')?.click()}
    >
      <input
        type="file"
        id="fileInput"
        className="hidden"
        accept=".txt"
        onChange={handleFileInput}
      />
      <p className="text-lg text-gray-200">
        WhatsApp sohbet dosyasını sürükleyip bırakın veya seçmek için tıklayın
      </p>
      <p className="text-sm text-gray-400 mt-2">
        Sadece .txt dosyaları kabul edilir
      </p>
    </div>
  );
} 