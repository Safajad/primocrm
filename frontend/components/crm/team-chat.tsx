"use client";

import { useState, useRef, useEffect } from "react";
import { useCRMStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Plus,
  Send,
  Paperclip,
  Smile,
  MoreVertical,
  Phone,
  Video,
  Users,
  Hash,
  Lock,
  Pin,
  Star,
  Bell,
  BellOff,
  Settings,
  Trash2,
  LogOut,
  AtSign,
  ImageIcon,
  FileText,
  Reply,
  Forward,
  Copy,
  Check,
  CheckCheck,
  Circle,
} from "lucide-react";

interface TeamChannel {
  id: string;
  name: string;
  type: "public" | "private" | "direct";
  description?: string;
  members: string[];
  unreadCount: number;
  lastMessage?: {
    text: string;
    sender: string;
    timestamp: Date;
  };
  pinned: boolean;
  muted: boolean;
}

interface TeamMessage {
  id: string;
  channelId: string;
  senderId: string;
  text: string;
  timestamp: Date;
  edited: boolean;
  reactions: { emoji: string; users: string[] }[];
  replyTo?: string;
  attachments?: { type: string; name: string; url: string }[];
  read: boolean;
}

const defaultChannels: TeamChannel[] = [
  {
    id: "ch-1",
    name: "geral",
    type: "public",
    description: "Canal para discussões gerais da equipe",
    members: ["user-1", "user-2", "user-3"],
    unreadCount: 3,
    lastMessage: { text: "Bom dia equipe!", sender: "user-2", timestamp: new Date() },
    pinned: true,
    muted: false,
  },
  {
    id: "ch-2",
    name: "vendas",
    type: "public",
    description: "Discussões sobre vendas e metas",
    members: ["user-1", "user-2"],
    unreadCount: 0,
    lastMessage: { text: "Meta batida!", sender: "user-1", timestamp: new Date(Date.now() - 3600000) },
    pinned: true,
    muted: false,
  },
  {
    id: "ch-3",
    name: "suporte",
    type: "public",
    description: "Canal de suporte ao cliente",
    members: ["user-1", "user-3"],
    unreadCount: 5,
    pinned: false,
    muted: false,
  },
  {
    id: "ch-4",
    name: "gestao",
    type: "private",
    description: "Canal privado da gestão",
    members: ["user-1"],
    unreadCount: 0,
    pinned: false,
    muted: false,
  },
];

const defaultMessages: TeamMessage[] = [
  {
    id: "msg-1",
    channelId: "ch-1",
    senderId: "user-2",
    text: "Bom dia equipe! Vamos começar a semana com tudo!",
    timestamp: new Date(Date.now() - 7200000),
    edited: false,
    reactions: [{ emoji: "👍", users: ["user-1"] }],
    read: true,
  },
  {
    id: "msg-2",
    channelId: "ch-1",
    senderId: "user-1",
    text: "Bom dia! Temos reunião às 10h para alinhamento.",
    timestamp: new Date(Date.now() - 3600000),
    edited: false,
    reactions: [],
    read: true,
  },
  {
    id: "msg-3",
    channelId: "ch-1",
    senderId: "user-3",
    text: "Perfeito! Estarei lá.",
    timestamp: new Date(Date.now() - 1800000),
    edited: false,
    reactions: [{ emoji: "✅", users: ["user-1", "user-2"] }],
    read: false,
  },
  {
    id: "msg-4",
    channelId: "ch-2",
    senderId: "user-1",
    text: "Fechamos mais uma venda! Cliente Acme Corp, R$ 15.000",
    timestamp: new Date(Date.now() - 86400000),
    edited: false,
    reactions: [{ emoji: "🎉", users: ["user-2", "user-3"] }, { emoji: "💰", users: ["user-2"] }],
    read: true,
  },
];

export function TeamChat() {
  const { users, currentUser, addNotification } = useCRMStore();
  const [channels, setChannels] = useState<TeamChannel[]>(defaultChannels);
  const [messages, setMessages] = useState<TeamMessage[]>(defaultMessages);
  const [selectedChannel, setSelectedChannel] = useState<TeamChannel | null>(channels[0]);
  const [messageText, setMessageText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewChannel, setShowNewChannel] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyingTo, setReplyingTo] = useState<TeamMessage | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [newChannel, setNewChannel] = useState({
    name: "",
    type: "public" as "public" | "private",
    description: "",
    members: [] as string[],
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedChannel]);

  const channelMessages = selectedChannel
    ? messages.filter((m) => m.channelId === selectedChannel.id)
    : [];

  const filteredChannels = channels.filter((ch) =>
    ch.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pinnedChannels = filteredChannels.filter((ch) => ch.pinned);
  const regularChannels = filteredChannels.filter((ch) => !ch.pinned);

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedChannel) return;

    const newMessage: TeamMessage = {
      id: `msg-${Date.now()}`,
      channelId: selectedChannel.id,
      senderId: currentUser?.id || "user-1",
      text: messageText,
      timestamp: new Date(),
      edited: false,
      reactions: [],
      replyTo: replyingTo?.id,
      read: true,
    };

    setMessages([...messages, newMessage]);
    setMessageText("");
    setReplyingTo(null);

    // Update channel last message
    setChannels(
      channels.map((ch) =>
        ch.id === selectedChannel.id
          ? {
              ...ch,
              lastMessage: {
                text: messageText,
                sender: currentUser?.id || "user-1",
                timestamp: new Date(),
              },
            }
          : ch
      )
    );
  };

  const handleCreateChannel = () => {
    if (!newChannel.name.trim()) return;

    const channel: TeamChannel = {
      id: `ch-${Date.now()}`,
      name: newChannel.name.toLowerCase().replace(/\s+/g, "-"),
      type: newChannel.type,
      description: newChannel.description,
      members: [currentUser?.id || "user-1", ...newChannel.members],
      unreadCount: 0,
      pinned: false,
      muted: false,
    };

    setChannels([...channels, channel]);
    setShowNewChannel(false);
    setNewChannel({ name: "", type: "public", description: "", members: [] });
    addNotification({
      type: "success",
      title: "Canal criado",
      message: `O canal #${channel.name} foi criado com sucesso`,
    });
  };

  const togglePin = (channelId: string) => {
    setChannels(
      channels.map((ch) =>
        ch.id === channelId ? { ...ch, pinned: !ch.pinned } : ch
      )
    );
  };

  const toggleMute = (channelId: string) => {
    setChannels(
      channels.map((ch) =>
        ch.id === channelId ? { ...ch, muted: !ch.muted } : ch
      )
    );
  };

  const addReaction = (messageId: string, emoji: string) => {
    setMessages(
      messages.map((msg) => {
        if (msg.id !== messageId) return msg;
        
        const existingReaction = msg.reactions.find((r) => r.emoji === emoji);
        if (existingReaction) {
          if (existingReaction.users.includes(currentUser?.id || "user-1")) {
            // Remove user from reaction
            return {
              ...msg,
              reactions: msg.reactions
                .map((r) =>
                  r.emoji === emoji
                    ? { ...r, users: r.users.filter((u) => u !== (currentUser?.id || "user-1")) }
                    : r
                )
                .filter((r) => r.users.length > 0),
            };
          } else {
            // Add user to reaction
            return {
              ...msg,
              reactions: msg.reactions.map((r) =>
                r.emoji === emoji
                  ? { ...r, users: [...r.users, currentUser?.id || "user-1"] }
                  : r
              ),
            };
          }
        } else {
          // New reaction
          return {
            ...msg,
            reactions: [...msg.reactions, { emoji, users: [currentUser?.id || "user-1"] }],
          };
        }
      })
    );
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Hoje";
    if (date.toDateString() === yesterday.toDateString()) return "Ontem";
    return date.toLocaleDateString("pt-BR");
  };

  const getUserById = (id: string) => users.find((u) => u.id === id);

  const quickEmojis = ["👍", "❤️", "😂", "😮", "😢", "🎉", "✅", "💰"];

  return (
    <div className="flex h-full">
      {/* Channels Sidebar */}
      <div className="w-64 border-r border-border bg-card flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-foreground">Chat da Equipe</h2>
            <Dialog open={showNewChannel} onOpenChange={setShowNewChannel}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader>
                  <DialogTitle className="text-foreground">Criar Canal</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Nome do Canal</label>
                    <Input
                      placeholder="ex: marketing"
                      value={newChannel.name}
                      onChange={(e) => setNewChannel({ ...newChannel, name: e.target.value })}
                      className="bg-secondary border-border text-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Tipo</label>
                    <div className="flex gap-2">
                      <Button
                        variant={newChannel.type === "public" ? "default" : "outline"}
                        className="flex-1"
                        onClick={() => setNewChannel({ ...newChannel, type: "public" })}
                      >
                        <Hash className="h-4 w-4 mr-2" />
                        Público
                      </Button>
                      <Button
                        variant={newChannel.type === "private" ? "default" : "outline"}
                        className="flex-1"
                        onClick={() => setNewChannel({ ...newChannel, type: "private" })}
                      >
                        <Lock className="h-4 w-4 mr-2" />
                        Privado
                      </Button>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Descrição</label>
                    <Input
                      placeholder="Descrição do canal"
                      value={newChannel.description}
                      onChange={(e) => setNewChannel({ ...newChannel, description: e.target.value })}
                      className="bg-secondary border-border text-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Membros</label>
                    <div className="space-y-2">
                      {users.filter((u) => u.id !== currentUser?.id).map((user) => (
                        <label key={user.id} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newChannel.members.includes(user.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewChannel({ ...newChannel, members: [...newChannel.members, user.id] });
                              } else {
                                setNewChannel({
                                  ...newChannel,
                                  members: newChannel.members.filter((m) => m !== user.id),
                                });
                              }
                            }}
                            className="rounded border-border"
                          />
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={user.avatar || "/placeholder.svg"} />
                            <AvatarFallback className="bg-primary/20 text-primary text-xs">
                              {user.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-foreground">{user.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowNewChannel(false)}>
                      Cancelar
                    </Button>
                    <Button
                      className="bg-primary text-primary-foreground"
                      onClick={handleCreateChannel}
                    >
                      Criar Canal
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar canais..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-secondary border-border text-foreground"
            />
          </div>
        </div>

        {/* Channels List */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {/* Pinned Channels */}
            {pinnedChannels.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wider px-2 mb-2">
                  Fixados
                </p>
                {pinnedChannels.map((channel) => (
                  <ChannelItem
                    key={channel.id}
                    channel={channel}
                    isSelected={selectedChannel?.id === channel.id}
                    onClick={() => setSelectedChannel(channel)}
                    onPin={() => togglePin(channel.id)}
                    onMute={() => toggleMute(channel.id)}
                    users={users}
                  />
                ))}
              </div>
            )}

            {/* Regular Channels */}
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider px-2 mb-2">
                Canais
              </p>
              {regularChannels.map((channel) => (
                <ChannelItem
                  key={channel.id}
                  channel={channel}
                  isSelected={selectedChannel?.id === channel.id}
                  onClick={() => setSelectedChannel(channel)}
                  onPin={() => togglePin(channel.id)}
                  onMute={() => toggleMute(channel.id)}
                  users={users}
                />
              ))}
            </div>

            {/* Online Team Members */}
            <div className="mt-6">
              <p className="text-xs text-muted-foreground uppercase tracking-wider px-2 mb-2">
                Equipe Online
              </p>
              {users.filter((u) => u.status === "online").map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-secondary/50 cursor-pointer"
                >
                  <div className="relative">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar || "/placeholder.svg"} />
                      <AvatarFallback className="bg-primary/20 text-primary text-xs">
                        {user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <Circle className="absolute -bottom-0.5 -right-0.5 h-3 w-3 fill-emerald-500 text-emerald-500" />
                  </div>
                  <span className="text-sm text-foreground">{user.name}</span>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      {selectedChannel ? (
        <div className="flex-1 flex flex-col">
          {/* Channel Header */}
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary">
                {selectedChannel.type === "private" ? (
                  <Lock className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <Hash className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{selectedChannel.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedChannel.members.length} membros
                  {selectedChannel.description && ` • ${selectedChannel.description}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Phone className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Video className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Users className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {channelMessages.map((message, index) => {
                const sender = getUserById(message.senderId);
                const showDate =
                  index === 0 ||
                  formatDate(message.timestamp) !==
                    formatDate(channelMessages[index - 1].timestamp);
                const replyMessage = message.replyTo
                  ? messages.find((m) => m.id === message.replyTo)
                  : null;
                const replySender = replyMessage
                  ? getUserById(replyMessage.senderId)
                  : null;

                return (
                  <div key={message.id}>
                    {showDate && (
                      <div className="flex items-center gap-4 my-4">
                        <div className="flex-1 h-px bg-border" />
                        <span className="text-xs text-muted-foreground">
                          {formatDate(message.timestamp)}
                        </span>
                        <div className="flex-1 h-px bg-border" />
                      </div>
                    )}
                    <div className="group flex gap-3 hover:bg-secondary/30 p-2 rounded-lg -mx-2">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={sender?.avatar || "/placeholder.svg"} />
                        <AvatarFallback className="bg-primary/20 text-primary">
                          {sender?.name?.charAt(0) || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">{sender?.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatTime(message.timestamp)}
                          </span>
                          {message.edited && (
                            <span className="text-xs text-muted-foreground">(editado)</span>
                          )}
                        </div>
                        {replyMessage && (
                          <div className="mt-1 mb-2 pl-3 border-l-2 border-primary/50">
                            <p className="text-xs text-muted-foreground">
                              <span className="font-medium text-primary">{replySender?.name}</span>
                            </p>
                            <p className="text-sm text-muted-foreground truncate">
                              {replyMessage.text}
                            </p>
                          </div>
                        )}
                        <p className="text-foreground whitespace-pre-wrap">{message.text}</p>
                        {message.reactions.length > 0 && (
                          <div className="flex items-center gap-1 mt-2">
                            {message.reactions.map((reaction, i) => (
                              <button
                                key={i}
                                onClick={() => addReaction(message.id, reaction.emoji)}
                                className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm ${
                                  reaction.users.includes(currentUser?.id || "user-1")
                                    ? "bg-primary/20 border border-primary/50"
                                    : "bg-secondary hover:bg-secondary/80"
                                }`}
                              >
                                <span>{reaction.emoji}</span>
                                <span className="text-xs text-muted-foreground">
                                  {reaction.users.length}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-start gap-1">
                        {quickEmojis.slice(0, 3).map((emoji) => (
                          <Button
                            key={emoji}
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => addReaction(message.id, emoji)}
                          >
                            {emoji}
                          </Button>
                        ))}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <Smile className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-card border-border">
                            <div className="flex flex-wrap gap-1 p-2 max-w-[200px]">
                              {quickEmojis.map((emoji) => (
                                <button
                                  key={emoji}
                                  onClick={() => addReaction(message.id, emoji)}
                                  className="p-1 hover:bg-secondary rounded"
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => setReplyingTo(message)}
                        >
                          <Reply className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-card border-border">
                            <DropdownMenuItem className="text-foreground">
                              <Copy className="h-4 w-4 mr-2" />
                              Copiar texto
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-foreground">
                              <Forward className="h-4 w-4 mr-2" />
                              Encaminhar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Message Input */}
          <div className="p-4 border-t border-border">
            {replyingTo && (
              <div className="mb-2 p-2 bg-secondary/50 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Reply className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">
                    Respondendo a{" "}
                    <span className="font-medium text-foreground">
                      {getUserById(replyingTo.senderId)?.name}
                    </span>
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setReplyingTo(null)}
                >
                  <span className="text-lg">&times;</span>
                </Button>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Paperclip className="h-5 w-5" />
              </Button>
              <Input
                placeholder={`Mensagem em #${selectedChannel.name}`}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="flex-1 bg-secondary border-border text-foreground"
              />
              <Button variant="ghost" size="icon">
                <Smile className="h-5 w-5" />
              </Button>
              <Button
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={handleSendMessage}
                disabled={!messageText.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Selecione um canal para começar</p>
          </div>
        </div>
      )}
    </div>
  );
}

function ChannelItem({
  channel,
  isSelected,
  onClick,
  onPin,
  onMute,
  users,
}: {
  channel: TeamChannel;
  isSelected: boolean;
  onClick: () => void;
  onPin: () => void;
  onMute: () => void;
  users: any[];
}) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer group ${
        isSelected ? "bg-primary/10 text-primary" : "hover:bg-secondary/50 text-foreground"
      }`}
    >
      {channel.type === "private" ? (
        <Lock className="h-4 w-4 text-muted-foreground" />
      ) : (
        <Hash className="h-4 w-4 text-muted-foreground" />
      )}
      <span className="flex-1 truncate text-sm">{channel.name}</span>
      {channel.muted && <BellOff className="h-3 w-3 text-muted-foreground" />}
      {channel.unreadCount > 0 && (
        <Badge className="bg-primary text-primary-foreground h-5 min-w-[20px] text-xs">
          {channel.unreadCount}
        </Badge>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-card border-border">
          <DropdownMenuItem className="text-foreground" onClick={onPin}>
            <Pin className="h-4 w-4 mr-2" />
            {channel.pinned ? "Desafixar" : "Fixar"}
          </DropdownMenuItem>
          <DropdownMenuItem className="text-foreground" onClick={onMute}>
            {channel.muted ? (
              <>
                <Bell className="h-4 w-4 mr-2" />
                Ativar notificações
              </>
            ) : (
              <>
                <BellOff className="h-4 w-4 mr-2" />
                Silenciar
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive">
            <LogOut className="h-4 w-4 mr-2" />
            Sair do canal
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
