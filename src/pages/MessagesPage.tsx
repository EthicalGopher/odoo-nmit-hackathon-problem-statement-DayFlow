import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import type { Employee, Message } from '../types';
import { UserAvatar } from '../components/ui/UserAvatar';
import {
  FiSend,
  FiSearch,
  FiMessageSquare,
  FiCheck,
  FiCheckCircle,
  FiRefreshCw,
  FiUserCheck,
  FiUserX,
  FiBriefcase,
  FiMail,
} from 'react-icons/fi';

export const MessagesPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [contacts, setContacts] = useState<Employee[]>([]);
  const [selectedContact, setSelectedContact] = useState<Employee | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [unreadMap, setUnreadMap] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Fetch contacts (all organization members except current user)
  const fetchContacts = async () => {
    try {
      const allEmps = await api.getEmployees();
      const peerList = allEmps.filter(e => e.employeeId !== currentUser?.employeeId);
      setContacts(peerList);

      // Auto-select first contact if none selected
      if (peerList.length > 0 && !selectedContact) {
        setSelectedContact(peerList[0]);
      }
    } catch (err) {
      console.error('Failed to load messaging contacts', err);
    }
  };

  // 2. Fetch unread counts
  const fetchUnreadCounts = async () => {
    try {
      const res = await api.getUnreadMessageCounts();
      setUnreadMap(res.unreadBySender || {});
    } catch (err) {
      console.error('Failed to fetch unread counts', err);
    }
  };

  // 3. Fetch active chat messages
  const fetchActiveChatMessages = async (peerId: string) => {
    try {
      const chatLogs = await api.getMessages(peerId);
      setMessages(chatLogs);
      fetchUnreadCounts();
    } catch (err) {
      console.error('Failed to fetch chat logs', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
    fetchUnreadCounts();
  }, [currentUser]);

  useEffect(() => {
    if (selectedContact) {
      setIsLoading(true);
      fetchActiveChatMessages(selectedContact.employeeId);

      // Poll active chat every 2.5 seconds
      const timer = setInterval(() => {
        fetchActiveChatMessages(selectedContact.employeeId);
      }, 2500);

      return () => clearInterval(timer);
    }
  }, [selectedContact?.employeeId]);

  // Scroll to bottom on message update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedContact || !inputText.trim() || isSending) return;

    const content = inputText.trim();
    setInputText('');
    setIsSending(true);

    try {
      await api.sendMessage(selectedContact.employeeId, content);
      await fetchActiveChatMessages(selectedContact.employeeId);
    } catch (err) {
      console.error('Failed to send message', err);
      setInputText(content); // restore on error
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredContacts = contacts.filter(c => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(term) ||
      c.jobTitle.toLowerCase().includes(term) ||
      c.department.toLowerCase().includes(term)
    );
  });

  const formatMessageTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch {
      return '';
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto font-carme text-[#E8E3DD] space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#292624] pb-5">
        <div>
          <h1 className="font-crimson font-bold text-3xl text-[#E8E3DD] flex items-center space-x-3">
            <FiMessageSquare className="w-7 h-7 text-[#E07A5F]" />
            <span>Private Employee Messages</span>
          </h1>
          <p className="text-xs text-[#A39C95] mt-1 font-sans">
            Direct, confidential communication channel between organization team members
          </p>
        </div>
        <button
          onClick={() => {
            fetchContacts();
            if (selectedContact) fetchActiveChatMessages(selectedContact.employeeId);
          }}
          className="p-2.5 rounded-xl bg-[#24211F] border border-[#332F2C] text-[#A39C95] hover:text-[#E8E3DD] hover:border-[#E07A5F] transition-colors flex items-center space-x-2 text-xs font-mono"
        >
          <FiRefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Main Messaging Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[720px] bg-[#1C1A19] border border-[#332F2C] rounded-2xl shadow-2xl overflow-hidden">
        
        {/* ================= LEFT SIDEBAR: CONTACTS LIST (4 cols) ================= */}
        <div className="lg:col-span-4 border-r border-[#292624] flex flex-col bg-[#141312]">
          {/* Search Box */}
          <div className="p-4 border-b border-[#292624]">
            <div className="relative">
              <FiSearch className="w-4 h-4 text-[#78726A] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search colleagues..."
                className="w-full bg-[#1C1A19] border border-[#332F2C] rounded-xl pl-9 pr-4 py-2 text-xs text-[#E8E3DD] placeholder-[#78726A] focus:outline-none focus:border-[#E07A5F]"
              />
            </div>
          </div>

          {/* Contact List */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#24211F]">
            {filteredContacts.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#78726A]">
                No team members found.
              </div>
            ) : (
              filteredContacts.map(contact => {
                const isSelected = selectedContact?.employeeId === contact.employeeId;
                const unreadCount = unreadMap[contact.employeeId] || 0;

                return (
                  <button
                    key={contact.employeeId}
                    onClick={() => setSelectedContact(contact)}
                    className={`w-full text-left p-4 flex items-center space-x-3 transition-colors ${
                      isSelected
                        ? 'bg-[#2B2825] border-l-4 border-[#E07A5F]'
                        : 'hover:bg-[#1C1A19]'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <UserAvatar name={contact.name} size="w-11 h-11" />
                      <span
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#141312] ${
                          contact.status === 'present'
                            ? 'bg-[#709775]'
                            : contact.status === 'leave'
                            ? 'bg-[#F4A261]'
                            : 'bg-[#78726A]'
                        }`}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-[#E8E3DD] truncate">{contact.name}</h4>
                        {unreadCount > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-[#E07A5F] text-white text-[10px] font-bold font-mono animate-pulse">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#A39C95] truncate font-sans">{contact.jobTitle}</p>
                      <span className="text-[10px] text-[#78726A] block font-mono mt-0.5">{contact.department}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ================= RIGHT MAIN PANEL: ACTIVE CHAT (8 cols) ================= */}
        <div className="lg:col-span-8 flex flex-col bg-[#1C1A19]">
          {selectedContact ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-[#292624] bg-[#22201E] flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <UserAvatar name={selectedContact.name} size="w-10 h-10" />
                  <div>
                    <h3 className="font-crimson font-bold text-lg text-[#E8E3DD] leading-none">
                      {selectedContact.name}
                    </h3>
                    <div className="flex items-center space-x-2 text-[11px] text-[#A39C95] mt-1 font-mono">
                      <span className="flex items-center space-x-1">
                        <FiBriefcase className="w-3 h-3 text-[#E07A5F]" />
                        <span>{selectedContact.jobTitle}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center space-x-1">
                        <FiMail className="w-3 h-3 text-[#709775]" />
                        <span>{selectedContact.email}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold flex items-center space-x-1 ${
                      selectedContact.status === 'present'
                        ? 'bg-[#1C251F] text-[#709775] border border-[#709775]/30'
                        : selectedContact.status === 'leave'
                        ? 'bg-[#25221C] text-[#F4A261] border border-[#F4A261]/30'
                        : 'bg-[#24211F] text-[#78726A] border border-[#332F2C]'
                    }`}
                  >
                    {selectedContact.status === 'present' ? (
                      <>
                        <FiUserCheck className="w-3 h-3" />
                        <span>Online</span>
                      </>
                    ) : selectedContact.status === 'leave' ? (
                      <>
                        <FiUserX className="w-3 h-3" />
                        <span>On Leave</span>
                      </>
                    ) : (
                      <span>Offline</span>
                    )}
                  </span>
                </div>
              </div>

              {/* Chat Messages Body */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-[#181716]">
                {isLoading && messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-xs text-[#78726A] font-mono">
                    Loading messages...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-2">
                    <FiMessageSquare className="w-10 h-10 text-[#332F2C]" />
                    <p className="text-xs text-[#A39C95] font-sans">
                      No private messages exchanged yet with <strong>{selectedContact.name}</strong>.
                    </p>
                    <p className="text-[11px] text-[#78726A]">
                      Say hello to start the conversation!
                    </p>
                  </div>
                ) : (
                  messages.map(msg => {
                    const isMe = msg.senderId === currentUser?.employeeId;

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div className="flex items-end space-x-2 max-w-[75%]">
                          {!isMe && (
                            <UserAvatar name={msg.senderName} size="w-7 h-7" className="mb-1" />
                          )}

                          <div
                            className={`p-3.5 rounded-2xl text-xs font-sans leading-relaxed shadow-lg ${
                              isMe
                                ? 'bg-[#E07A5F] text-white rounded-br-none'
                                : 'bg-[#24211F] text-[#E8E3DD] border border-[#332F2C] rounded-bl-none'
                            }`}
                          >
                            <p className="whitespace-pre-wrap break-words">{msg.content}</p>

                            <div
                              className={`flex items-center justify-end space-x-1.5 mt-1 text-[9px] font-mono ${
                                isMe ? 'text-white/80' : 'text-[#78726A]'
                              }`}
                            >
                              <span>{formatMessageTime(msg.createdAt)}</span>
                              {isMe && (
                                <span>
                                  {msg.read ? (
                                    <FiCheckCircle className="w-3 h-3 text-white inline" title="Read" />
                                  ) : (
                                    <FiCheck className="w-3 h-3 text-white/70 inline" title="Sent" />
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Bar */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-[#292624] bg-[#22201E] flex items-center space-x-3">
                <input
                  type="text"
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Write a private message to ${selectedContact.name}...`}
                  className="flex-1 bg-[#141312] border border-[#332F2C] rounded-xl px-4 py-3 text-xs text-[#E8E3DD] placeholder-[#78726A] focus:outline-none focus:border-[#E07A5F]"
                />

                <button
                  type="submit"
                  disabled={!inputText.trim() || isSending}
                  className="px-5 py-3 rounded-xl bg-[#E07A5F] text-white font-bold text-xs hover:bg-[#C0504D] transition-colors shadow-lg disabled:opacity-50 flex items-center space-x-2 cursor-pointer shrink-0"
                >
                  <span>Send</span>
                  <FiSend className="w-3.5 h-3.5" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-3">
              <FiMessageSquare className="w-12 h-12 text-[#332F2C]" />
              <p className="text-sm font-semibold text-[#A39C95]">
                Select a colleague from the directory to start messaging.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
