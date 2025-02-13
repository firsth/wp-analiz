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

  const cleanText = (text: string) => {
    // Özel boşluk karakterlerini ve diğer gizli karakterleri temizle
    return text.replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
  };

  const standardizePhoneNumber = (text: string) => {
    // Telefon numarası formatını kontrol et
    const phoneMatch = text.match(/(?:\+)?(\d{2,3})\s*(\d{3})\s*(\d{3})\s*(\d{2})\s*(\d{2})/);
    if (phoneMatch) {
      // Numarayı standart formata dönüştür: +90 5XX XXX XX XX
      const [, countryCode, part1, part2, part3, part4] = phoneMatch;
      return `+${countryCode} ${part1} ${part2} ${part3} ${part4}`;
    }
    return text;
  };

  const standardizeName = (name: string) => {
    const cleanName = cleanText(name);
    return standardizePhoneNumber(cleanName);
  };

  const processFile = async (file: File) => {
    const text = await file.text();
    const lines = text.split('\n');
    
    const messagePattern = /^\[?(\d{1,2}[/.]\d{1,2}[/.]\d{2,4})[,\s]+(\d{1,2}:\d{2}(?::\d{2})?)\]?\s-\s([^:]+):\s(.+)$/;
    const systemMessagePattern = /^\[?(\d{1,2}[/.]\d{1,2}[/.]\d{2,4})[,\s]+(\d{1,2}:\d{2}(?::\d{2})?)\]?\s-\s(.+)$/;
    
    const messages: any[] = [];
    const groupMembers = new Set<string>();
    const activeMembers = new Set<string>();
    
    lines.forEach(line => {
      const cleanLine = cleanText(line);
      
      // Normal mesajları kontrol et
      const messageMatch = cleanLine.match(messagePattern);
      if (messageMatch) {
        const [, date, time, sender, message] = messageMatch;
        const standardSender = standardizeName(sender);
        messages.push({
          date: formatDate(date),
          time: time.trim(),
          sender: standardSender,
          message: message.trim()
        });
        activeMembers.add(standardSender);
        groupMembers.add(standardSender);
        return;
      }

      // Sistem mesajlarını kontrol et
      const systemMatch = cleanLine.match(systemMessagePattern);
      if (systemMatch) {
        const [, date, time, message] = systemMatch;
        const cleanMessage = cleanText(message);
        
        // Gruba katılma mesajlarını kontrol et
        const joinPatterns = [
          /(.+) topluluk üzerinden katıldı/,
          /(.+) gruba katıldı/,
          /(.+) bu grubun davet bağlantısıyla katıldı/,
          /Siz (.+) kişisini eklediniz/,
          /(.+) kişisini eklediniz/,
          /(.+) joined using this group's invite link/,
          /(.+) joined the group/,
          /You added (.+)/
        ];

        for (const pattern of joinPatterns) {
          const joinMatch = cleanMessage.match(pattern);
          if (joinMatch) {
            const member = standardizeName(joinMatch[1]);
            groupMembers.add(member);
            break;
          }
        }

        // Gruptan ayrılma mesajlarını kontrol et
        const leavePatterns = [
          /(.+) ayrıldı/,
          /(.+) left/
        ];

        for (const pattern of leavePatterns) {
          const leaveMatch = cleanMessage.match(pattern);
          if (leaveMatch) {
            const member = standardizeName(leaveMatch[1]);
            groupMembers.delete(member);
            activeMembers.delete(member);
            break;
          }
        }
      }
    });

    // İstatistikleri hesapla
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

    // Sessiz üyeleri ekle
    const silentMembers = Array.from(groupMembers).filter(member => !activeMembers.has(member));
    silentMembers.forEach(member => {
      stats[member] = {
        messageCount: 0,
        messages: [],
        dates: [],
        isSilent: true
      };
    });

    onDataProcessed({
      stats,
      totalMembers: groupMembers.size,
      activeMembers: activeMembers.size,
      silentMembers: silentMembers.length
    });
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