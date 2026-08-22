import React, { useState, useEffect, useRef } from 'react';
import type { Employee, Message } from '../../types';
import { api } from '../../api/client';
import { UserAvatar } from './UserAvatar';
import {
  FiX,
  FiSend,
  FiSearch,
  FiMessageSquare,
  FiCheck,
  FiCheckCircle,
} from 'react-icons/fi';

interface PrivateChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  targetEmployee: Employee | null;
  allEmployees: Employee[];
  currentUser: Employee | null;
}

export const PrivateChatDrawer: React.FC<PrivateChatDrawerProps> = ({
  isOpen,
  onClose,
  targetEmployee,
  allEmployees,
  currentUser,
}) => {
  const [selectedContact, setSelectedContact] = useState<Employee | null>(targetEmployee);
  const [contactSearch, setContactSearch] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [unreadMap, setUnreadMap] = useState<Record<string, number>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Synchronize target employee when passed from props
  useEffect(() => {
    if (targetEmployee) {
      setSelectedContact(targetEmployee);
    } else if (!selectedContact && allEmployees.length > 0 && currentUser) {
      const firstOther = allEmployees.find(e => e.employeeId !== currentUser.employeeId);
      if (firstOther) setSelectedContact(firstOther);
    }
  }, [targetEmployee, allEmployees, currentUser]);

  // Fetch unread counts periodically
  const fetchUnread = async () => {
    if (!currentUser) return;
    try {
      const res = await api.getUnreadMessageCounts();
      setUnreadMap(res.unreadBySender || {});
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch messages for selected contact
  const fetchMessages = async () => {
    if (!selectedContact || !currentUser) return;
    try {
      const data = await api.getMessages(selectedContact.employeeId);
      setMessages(data);
      // Refresh unread counts after reading messages
      fetchUnread();
      window.dispatchEvent(new Event('dayflow_messages_updated'));
      window.dispatchEvent(new Event('dayflow_notifications_updated'));
    } catch (err) {
      console.error('Failed to load chat messages:', err);
    }
  };


  useEffect(() => {
    if (isOpen) {
      fetchMessages();
      fetchUnread();

      const interval = setInterval(() => {
        fetchMessages();
        fetchUnread();
      }, 2500);

      return () => clearInterval(interval);
    }
  }, [isOpen, selectedContact, currentUser]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContact || !newMessage.trim() || isSending) return;

    const contentToSend = newMessage.trim();
    setNewMessage('');
    setIsSending(true);

    try {
      const res = await api.sendMessage(selectedContact.employeeId, contentToSend);
      if (res.data) {
        setMessages(prev => [...prev, res.data]);
      }
      fetchMessages();
      window.dispatchEvent(new Event('dayflow_messages_updated'));
      window.dispatchEvent(new Event('dayflow_notifications_updated'));
    } catch (err) {

      console.error('Failed to send message:', err);
      setNewMessage(contentToSend);
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  const otherEmployees = allEmployees.filter(e => !currentUser || e.employeeId !== currentUser.employeeId);
  const filteredContacts = otherEmployees.filter(e =>
    e.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
    e.employeeId.toLowerCase().includes(contactSearch.toLowerCase()) ||
    e.jobTitle.toLowerCase().includes(contactSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 font-carme text-[#E8E3DD]">
      <div className="bg-[#1C1A19] border border-[#332F2C] w-full max-w-5xl h-[85vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative">
        {/* ================= LEFT COLUMN: CONTACTS LIST ================= */}
        <div className="w-full md:w-80 bg-[#141312] border-r border-[#292624] flex flex-col shrink-0">
          {/* Header */}
          <div className="p-4 border-b border-[#292624] flex items-center justify-between">
            <div className="flex items-center space-x-2 text-[#E07A5F]">
              <FiMessageSquare className="w-5 h-5" />
              <h3 className="font-crimson font-bold text-lg text-[#E8E3DD]">Private Messages</h3>
            </div>
            <button
              onClick={onClose}
              className="md:hidden p-1 rounded-lg text-[#A39C95] hover:text-[#E8E3DD]"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Search Box */}
          <div className="p-3 border-b border-[#292624]">
            <div className="relative">
              <FiSearch className="w-3.5 h-3.5 text-[#78726A] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={contactSearch}
                onChange={e => setContactSearch(e.target.value)}
                placeholder="Search colleagues..."
                className="w-full bg-[#1C1A19] border border-[#332F2C] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#E8E3DD] placeholder-[#78726A] focus:outline-none focus:border-[#E07A5F]"
              />
            </div>
          </div>

          {/* Contacts Directory */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#24211F] p-1">
            {filteredContacts.length === 0 ? (
              <div className="p-6 text-center text-[#78726A] text-xs">
                No colleagues found.
              </div>
            ) : (
              filteredContacts.map(emp => {
                const isSelected = selectedContact?.employeeId === emp.employeeId;
                const unreadCount = unreadMap[emp.employeeId] || 0;
                const isPresent = emp.status === 'present';
                const isOnLeave = emp.status === 'leave';

                return (
                  <button
                    key={emp.employeeId}
                    onClick={() => setSelectedContact(emp)}
                    className={`w-full p-3 rounded-2xl flex items-center space-x-3 text-left transition-all relative ${
                      isSelected
                        ? 'bg-[#2B2825] border border-[#E07A5F]/40 shadow-sm'
                        : 'hover:bg-[#1C1A19]'
                    }`}
                  >
                    <div className="relative">
                      <UserAvatar name={emp.name} src={emp.avatarUrl} size="w-10 h-10" />
                      <span
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#141312] ${
                          isPresent ? 'bg-[#709775]' : isOnLeave ? 'bg-[#E07A5F]' : 'bg-[#F4A261]'
                        }`}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-[#E8E3DD] truncate">{emp.name}</span>
                        {unreadCount > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-[#E07A5F] text-white text-[10px] font-bold font-mono">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#A39C95] truncate">{emp.jobTitle}</p>
                      <span className="text-[9px] font-mono text-[#78726A]">{emp.department}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ================= RIGHT COLUMN: CHAT CONVERSATION AREA ================= */}
        <div className="flex-1 flex flex-col bg-[#1C1A19]">
          {selectedContact ? (
            <>
              {/* Active Conversation Header */}
              <div className="p-4 border-b border-[#292624] flex items-center justify-between bg-[#181716]">
                <div className="flex items-center space-x-3">
                  <UserAvatar name={selectedContact.name} src={selectedContact.avatarUrl} size="w-11 h-11" />
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-crimson font-bold text-lg text-[#E8E3DD]">
                        {selectedContact.name}
                      </h4>
                      <span className="px-2 py-0.5 rounded bg-[#141312] border border-[#332F2C] text-[#E07A5F] text-[10px] font-mono font-bold">
                        {selectedContact.employeeId}
                      </span>
                    </div>
                    <p className="text-xs text-[#A39C95]">
                      {selectedContact.jobTitle} • <span className="text-[#709775] font-semibold">{selectedContact.department}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={onClose}
                    className="p-2 rounded-xl bg-[#24211F] border border-[#332F2C] text-[#A39C95] hover:text-[#E8E3DD] transition-colors"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Messages Thread Container */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#141312]/60">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2 text-[#78726A]">
                    <div className="w-12 h-12 rounded-2xl bg-[#1C1A19] border border-[#332F2C] flex items-center justify-center text-[#E07A5F] text-xl">
                      <FiMessageSquare />
                    </div>
                    <h5 className="font-crimson font-bold text-base text-[#E8E3DD]">No conversation history yet</h5>
                    <p className="text-xs max-w-sm">
                      Send a private message to <strong>{selectedContact.name}</strong> to initiate direct communication.
                    </p>
                  </div>
                ) : (
                  messages.map(msg => {
                    const isMine = msg.senderId === currentUser?.employeeId;
                    const timeStr = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-md p-3.5 rounded-2xl text-xs shadow-md space-y-1 ${
                            isMine
                              ? 'bg-[#E07A5F] text-white rounded-br-none'
                              : 'bg-[#24211F] text-[#E8E3DD] border border-[#383330] rounded-bl-none'
                          }`}
                        >
                          <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                          <div
                            className={`flex items-center justify-end space-x-1 text-[9px] font-mono ${
                              isMine ? 'text-white/80' : 'text-[#78726A]'
                            }`}
                          >
                            <span>{timeStr}</span>
                            {isMine && (
                              msg.read ? (
                                <FiCheckCircle className="w-3 h-3 text-white" title="Read" />
                              ) : (
                                <FiCheck className="w-3 h-3 text-white/70" title="Sent" />
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Composer Footer */}
              <form onSubmit={handleSendMessage} className="p-3 bg-[#181716] border-t border-[#292624]">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder={`Write a private message to ${selectedContact.name}...`}
                    className="flex-1 bg-[#141312] border border-[#332F2C] rounded-2xl px-4 py-2.5 text-xs text-[#E8E3DD] placeholder-[#78726A] focus:outline-none focus:border-[#E07A5F]"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || isSending}
                    className="px-5 py-2.5 rounded-2xl bg-[#E07A5F] text-white font-bold text-xs hover:bg-[#D0694E] transition-colors flex items-center space-x-1.5 shadow-md disabled:opacity-50"
                  >
                    <span>Send</span>
                    <FiSend className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-[#78726A] space-y-2">
              <FiMessageSquare className="w-12 h-12 text-[#332F2C]" />
              <p className="text-xs">Select a colleague from the left panel to open private chat.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
