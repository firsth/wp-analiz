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
  isSilent?: boolean;
}

interface ChatStatsProps {
  data: {
    stats: {
      [key: string]: UserData;
    };
    totalMembers: number;
    activeMembers: number;
    silentMembers: number;
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
  const [showSilentMembers, setShowSilentMembers] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const parseDate = (dateStr: string) => {
    const [day, month, year] = dateStr.split('.').map(Number);
    return new Date(year, month - 1, day);
  };

  const getFilteredData = useMemo(() => {
    if (!isClient) return { stats: data.stats, activeMembers: data.activeMembers, silentMembers: data.silentMembers };
    if (dateFilter === 'ALL') return { stats: data.stats, activeMembers: data.activeMembers, silentMembers: data.silentMembers };

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

    const filteredData: { [key: string]: UserData } = {};
    const activeUsers = new Set<string>();

    Object.entries(data.stats).forEach(([user, userData]) => {
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
        // Bu tarih aralığında mesajı olan kullanıcı
        activeUsers.add(user);
        filteredData[user] = {
          ...userData,
          messageCount: filteredDates.length,
          dates: filteredDates,
          isSilent: false
        };
      } else {
        // Bu tarih aralığında mesajı olmayan kullanıcı
        if (showSilentMembers) {
          filteredData[user] = {
            ...userData,
            messageCount: 0,
            dates: [],
            isSilent: true
          };
        }
      }
    });

    const silentMembersCount = Object.keys(data.stats).length - activeUsers.size;

    return {
      stats: filteredData,
      activeMembers: activeUsers.size,
      silentMembers: silentMembersCount
    };
  }, [data.stats, data.activeMembers, data.silentMembers, dateFilter, isClient, showSilentMembers]);

  const sortedUsers = useMemo(() => {
    return Object.entries(getFilteredData.stats)
      .sort(([, a], [, b]) => {
        const comparison = b.messageCount - a.messageCount;
        return sortOrder === 'desc' ? comparison : -comparison;
      });
  }, [getFilteredData, sortOrder]);

  const totalMessages = useMemo(() => 
    sortedUsers.reduce((sum, [, userData]) => sum + userData.messageCount, 0),
    [sortedUsers]
  );

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
            <button
              onClick={() => setShowSilentMembers(prev => !prev)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                showSilentMembers 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
              }`}
            >
              {showSilentMembers ? 'Sessiz Üyeleri Gizle' : 'Sessiz Üyeleri Göster'}
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
            <p className="text-gray-400 text-sm">Toplam Mesaj</p>
            <p className="text-2xl font-bold text-white">{totalMessages}</p>
          </div>
          <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
            <p className="text-gray-400 text-sm">Aktif Üye</p>
            <p className="text-2xl font-bold text-white">{getFilteredData.activeMembers}</p>
          </div>
          <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
            <p className="text-gray-400 text-sm">Sessiz Üye</p>
            <p className="text-2xl font-bold text-white">{getFilteredData.silentMembers}</p>
          </div>
        </div>
        
        <div className="space-y-4">
          {sortedUsers.map(([user, userData]) => {
            const percentage = totalMessages === 0 ? 0 : ((userData.messageCount / totalMessages) * 100).toFixed(1);
            
            return (
              <div 
                key={user} 
                className={`border border-gray-700 rounded-lg p-4 bg-gray-900 ${
                  userData.isSilent ? 'opacity-75' : ''
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-200">{user}</h3>
                    {userData.isSilent && (
                      <span className="px-2 py-1 text-xs bg-yellow-600 text-white rounded-full">
                        Sessiz Üye
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-gray-400">
                    {userData.messageCount} mesaj ({percentage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${
                      userData.isSilent ? 'bg-yellow-600' : 'bg-blue-500'
                    }`}
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