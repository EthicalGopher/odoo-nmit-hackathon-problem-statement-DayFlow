import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import type { NotificationItem } from '../types';
import { FiCheckCircle, FiInfo, FiAlertTriangle, FiCheck } from 'react-icons/fi';

export const NotificationsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const fetchNotifs = async () => {
    try {
      const data = await api.getNotifications(currentUser?.email);
      setNotifications(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, [currentUser]);

  const markAllRead = async () => {
    try {
      await api.markNotificationRead('read-all');
      await fetchNotifs();
      window.dispatchEvent(new Event('dayflow_notifications_updated'));
    } catch (err) {
      console.error(err);
    }
  };

  const markSingleRead = async (id: number) => {
    try {
      await api.markNotificationRead(id);
      await fetchNotifs();
      window.dispatchEvent(new Event('dayflow_notifications_updated'));
    } catch (err) {
      console.error(err);
    }
  };


  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-[#1C1A19] border border-[#332F2C] rounded-2xl p-6 shadow-xl flex items-center justify-between">
        <div>
          <h2 className="font-crimson text-2xl font-bold text-[#E8E3DD]">
            Notifications Center
          </h2>
          <p className="text-xs text-[#A39C95] font-carme mt-0.5">
            System alerts, leave approval statuses, and attendance updates.
          </p>
        </div>

        <button
          onClick={markAllRead}
          className="px-3.5 py-1.5 rounded-xl bg-[#24211F] border border-[#332F2C] text-xs font-semibold text-[#E07A5F] hover:border-[#E07A5F] transition-colors flex items-center space-x-1.5"
        >
          <FiCheck className="w-3.5 h-3.5" />
          <span>Mark All as Read</span>
        </button>
      </div>

      {/* Notification Cards List */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="bg-[#1C1A19] border border-[#332F2C] rounded-2xl p-12 text-center text-[#A39C95]">
            <p className="font-crafty text-sm text-[#E07A5F]">No new notifications</p>
            <p className="text-xs text-[#78726A] mt-1">You are completely up to date!</p>
          </div>
        ) : (
          notifications.map(n => (
            <div
              key={n.id}
              onClick={() => markSingleRead(n.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between ${
                n.read
                  ? 'bg-[#181716] border-[#292624] opacity-75'
                  : 'bg-[#1C1A19] border-[#E07A5F]/40 shadow-lg'
              }`}
            >
              <div className="flex items-start space-x-3.5">
                <div className="mt-0.5">
                  {n.type === 'success' ? (
                    <FiCheckCircle className="w-5 h-5 text-[#709775]" />
                  ) : n.type === 'warning' ? (
                    <FiAlertTriangle className="w-5 h-5 text-[#F4A261]" />
                  ) : (
                    <FiInfo className="w-5 h-5 text-[#E07A5F]" />
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[#E8E3DD]">{n.title}</h4>
                  <p className="text-xs text-[#A39C95] mt-0.5">{n.message}</p>
                  <span className="text-[10px] text-[#78726A] block mt-1">
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {!n.read && (
                <span className="w-2 h-2 rounded-full bg-[#E07A5F] shrink-0 mt-1" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
