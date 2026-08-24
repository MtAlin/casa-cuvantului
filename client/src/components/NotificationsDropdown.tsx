import React, { useEffect, useState, useRef } from 'react';
import { Bell, Check } from 'lucide-react';
import { notificationService } from '../services/api';
import { AppNotification } from '../types';
import toast from 'react-hot-toast';

export const NotificationsDropdown: React.FC = () => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getAll();
      setNotifications(data);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Refresh every 1 minute
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => 
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      );
    } catch (err) {
      toast.error('Failed to mark notification as read');
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full text-gray-300 hover:bg-white/5 hover:text-white transition focus:outline-none"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-gray-900"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-gray-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5">
            <h3 className="font-semibold text-white">Notificări</h3>
            {unreadCount > 0 && (
              <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full font-medium">
                {unreadCount} noi
              </span>
            )}
          </div>
          
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-400 text-sm">
                Nu ai nicio notificare.
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-white/5">
                {notifications.map((notif) => (
                  <div 
                    key={notif._id} 
                    className={`px-4 py-3 flex gap-3 group transition ${
                      notif.isRead ? 'opacity-60 hover:opacity-100' : 'bg-emerald-500/5'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${notif.isRead ? 'text-gray-300' : 'text-white font-medium'} truncate`}>
                        {notif.title}
                      </p>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                        {notif.message}
                      </p>
                      <p className="text-[10px] text-gray-500 mt-2 font-medium">
                        {new Date(notif.createdAt).toLocaleDateString('ro-RO', { 
                          hour: '2-digit', minute: '2-digit' 
                        })}
                      </p>
                    </div>
                    {!notif.isRead && (
                      <button 
                        onClick={(e) => handleMarkAsRead(e, notif._id)}
                        className="self-center p-1.5 rounded-full text-emerald-400 hover:bg-emerald-400/10 opacity-0 group-hover:opacity-100 transition-all focus:outline-none"
                        title="Marchează ca citit"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
