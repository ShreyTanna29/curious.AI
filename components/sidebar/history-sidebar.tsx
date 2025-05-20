// components/sidebar/HistorySidebar.tsx
"use client";

import { Button } from "@/components/ui/button";
import { History } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Pencil, Check, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";


type Message = {
  role: "user" | "assistant";
  content: string;
};
type ChatHistory = {
  id: string;
  title: string;
  createdAt: string;
  messages: Message[];
};

export function HistorySidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [history, setHistory] = useState<ChatHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const router = useRouter();

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/chat/get-user-chat");
      setHistory(response.data);
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && history.length === 0) {
      fetchHistory();
    }
  }, [isOpen]);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleEditClick = (chat: ChatHistory) => {
    setEditingId(chat.id);
    setEditTitle(chat.title);
  };

  const handleSaveEdit = async (chatId: string) => {
    try {
      await axios.patch(`/api/chat/${chatId}`, { title: editTitle });
      setHistory(history.map(chat => 
        chat.id === chatId ? { ...chat, title: editTitle } : chat
      ));
      setEditingId(null);
    } catch (error) {
      console.error("Failed to update title:", error);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleChatSelect = (chatId: string) => {
    router.push(`/chat/${chatId}`);
    setIsOpen(false);
  };

  return (
    <>
      <Button
        variant={"custom"}
        className="right-3 lg:right-10 bg-gray-100 rounded-lg absolute md:p-4"
        onClick={toggleSidebar}
      >
        <History className="mr-2" />
        <span className="hidden md:block">
          {isOpen ? "Hide" : "Show"} History
        </span>
      </Button>

      <div
        className={`fixed inset-y-0 right-0 w-80 bg-white dark:bg-[#1a1a1a] shadow-lg transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 ease-in-out z-50 border-l border-gray-200 dark:border-gray-700`}
      >
        <div className="p-4 h-full flex flex-col">
          <h2 className="text-xl font-bold mb-4">Chat History</h2>
          
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-lg" />
                ))}
              </div>
            ) : history.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No chat history found
              </p>
            ) : (
              <ul className="space-y-2">
                {history.map((chat) => (
                  <li
                    key={chat.id}
                    className="group flex items-center justify-between p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer"
                    onClick={() => handleChatSelect(chat.id)}
                  >
                    <div className="flex-1 min-w-0">
                      {editingId === chat.id ? (
                        <Input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          className="h-8 px-2 py-1 text-sm"
                        />
                      ) : (
                        <p className="truncate text-sm font-medium">
                          {chat.title || "Untitled Chat"}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(chat.createdAt).toLocaleString()}
                      </p>
                    </div>
                    
                    {editingId === chat.id ? (
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSaveEdit(chat.id);
                          }}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancelEdit();
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditClick(chat);
                        }}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
      
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
}