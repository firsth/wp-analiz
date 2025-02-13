'use client';

import { useState, useEffect, useMemo } from 'react';

interface Message {
  date: string;
  time: string;
  sender: string;
  message: string;
}

interface UserData {
  messageCount: number;
  messages: string[];
  dates: string[];
}

interface ChatStatsProps {
  data: {
    [key: string]: UserData;
  };
}

const DATE_FILTERS = {
  ALL: 'Tüm Zamanlar',
  WEEK: 'Son 1 Hafta',
  MONTH: 'Son 1 Ay',
  THREE_MONTHS: 'Son 3 Ay',
  SIX_MONTHS: 'Son 6 Ay',
  YEAR: 'Son 1 Yıl'
} as const;

type DateFilterType = keyof typeof DATE_FILTERS;

export default function ChatStats({ data }: ChatStatsProps) {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [dateFilter, setDateFilter] = useState<DateFilterType>('ALL');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const parseDate = (dateStr: string) => {
    const [day, month, year] = dateStr.split('.').map(Number);
    return new Date(year, month - 1, day);
  };

  const getFilteredData = useMemo(() => {
    if (!isClient) return data;
    if (dateFilter === 'ALL') return data;

    const now = new Date();
    const filterDate = new Date();

    switch (dateFilter) {
      case 'WEEK':
        filterDate.setDate(now.getDate() - 7);
        break;
      case 'MONTH':
        filterDate.setMonth(now.getMonth() - 1);
        break;
      case 'THREE_MONTHS':
        filterDate.setMonth(now.getMonth() - 3);
        break;
      case 'SIX_MONTHS':
        filterDate.setMonth(now.getMonth() - 6);
        break;
      case 'YEAR':
        filterDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    const filteredData: ChatStatsProps['data'] = {};

    Object.entries(data).forEach(([user, userData]) => {
      const filteredDates = userData.dates.filter(date => {
        try {
          const messageDate = parseDate(date);
          return messageDate >= filterDate;
        } catch (error) {
          console.error('Tarih ayrıştırma hatası:', date);
          return false;
        }
      });

      if (filteredDates.length > 0) {
        filteredData[user] = {
          ...userData,
          messageCount: filteredDates.length,
          dates: filteredDates
        };
      }
    });

    return filteredData;
  }, [data, dateFilter, isClient]);

  const sortedUsers = useMemo(() => {
    return Object.entries(getFilteredData)
      .sort(([, a], [, b]) => {
        const comparison = (b as UserData).messageCount - (a as UserData).messageCount;
        return sortOrder === 'desc' ? comparison : -comparison;
      });
  }, [getFilteredData, sortOrder]);

  const totalMessages = useMemo(() => 
    sortedUsers.reduce((sum, [, userData]) => sum + (userData as UserData).messageCount, 0),
    [sortedUsers]
  );

  const totalUsers = sortedUsers.length;

  if (!isClient) {
    return null;
  }

  return (
    <div className="mt-8 space-y-6">
      <div className="bg-gray-800 rounded-lg p-6 shadow-xl border border-gray-700">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h2 className="text-2xl font-semibold text-white">Sohbet İstatistikleri</h2>
          <div className="flex flex-wrap gap-2">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as DateFilterType)}
              className="px-4 py-2 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer"
            >
              {Object.entries(DATE_FILTERS).map(([key, value]) => (
                <option key={key} value={key}>{value}</option>
              ))}
            </select>
            <button
              onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
              className="px-4 py-2 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition-colors"
            >
              {sortOrder === 'desc' ? '↓ Çoktan Aza' : '↑ Azdan Çoğa'}
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
            <p className="text-gray-400 text-sm">Toplam Mesaj Sayısı</p>
            <p className="text-2xl font-bold text-white">{totalMessages}</p>
          </div>
          <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
            <p className="text-gray-400 text-sm">Toplam Kişi Sayısı</p>
            <p className="text-2xl font-bold text-white">{totalUsers}</p>
          </div>
        </div>
        
        <div className="space-y-4">
          {sortedUsers.map(([user, userData]) => {
            const percentage = (((userData as UserData).messageCount / totalMessages) * 100).toFixed(1);
            
            return (
              <div key={user} className="border border-gray-700 rounded-lg p-4 bg-gray-900">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-gray-200">{user}</h3>
                  <span className="text-sm text-gray-400">
                    {(userData as UserData).messageCount} mesaj ({percentage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                  <div
                    className="bg-blue-500 h-2.5 rounded-full"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 