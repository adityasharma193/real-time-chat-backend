import { useEffect, useRef, useState } from "react";
import { connectSocket, getSocket } from "../../services/socket";
import { getMessages } from "../../services/api";

const EMOJIS = ["👍", "❤️", "😂", "🔥"];

export default function Chat({ token, roomId }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typingUsers, setTypingUsers] = useState([]);

  const bottomRef = useRef(null);
  const userRef = useRef(null);
  const typingTimeout = useRef(null);

  // ================= USER CACHE =================
  useEffect(() => {
    try {
      userRef.current = JSON.parse(localStorage.getItem("user"));
    } catch {
      userRef.current = null;
    }
  }, []);

  // ================= LOAD MESSAGES =================
  useEffect(() => {
    if (!roomId) return;

    let cancelled = false;

    const load = async () => {
      try {
        const data = await getMessages(roomId);
        if (cancelled) return;

        const msgs = Array.isArray(data?.messages) ? data.messages : [];

        setMessages(
          msgs.map((m) => ({
            ...m,
            reactions: Array.isArray(m.reactions) ? m.reactions : [],
          }))
        );
      } catch (err) {
        console.error(err);
        if (!cancelled) setMessages([]);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [roomId]);

  // ================= SOCKET =================
  useEffect(() => {
    if (!token || !roomId) return;

    const socket = connectSocket(token);

    socket.emit("join-room", roomId);

    // 🔥 mark seen
    socket.emit("mark-seen", roomId);

    // -------- NEW MESSAGE --------
    const handleNewMessage = (msg) => {
      setMessages((prev) => {
        const tempIndex = prev.findIndex(
          (m) =>
            m.isTemp &&
            m.text === msg.text &&
            m.name === userRef.current?.name
        );

        if (tempIndex !== -1) {
          const updated = [...prev];
          updated[tempIndex] = {
            ...msg,
            reactions: msg.reactions || [],
          };
          return updated;
        }

        if (prev.some((m) => m.id === msg.id)) return prev;

        return [...prev, { ...msg, reactions: msg.reactions || [] }];
      });
    };

    // -------- REACTION --------
    const handleReaction = ({ messageId, reactions }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? { ...m, reactions: reactions || [] }
            : m
        )
      );
    };

    // -------- SEEN --------
    const handleSeen = ({ roomId }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.roomId === roomId ? { ...m, status: "seen" } : m
        )
      );
    };

    // -------- TYPING --------
    const handleTyping = ({ userId }) => {
      setTypingUsers((prev) =>
        prev.includes(userId) ? prev : [...prev, userId]
      );
    };

    const handleStopTyping = ({ userId }) => {
      setTypingUsers((prev) =>
        prev.filter((id) => id !== userId)
      );
    };

    socket.on("new-message", handleNewMessage);
    socket.on("reaction-update", handleReaction);
    socket.on("messages-seen", handleSeen);
    socket.on("user-typing", handleTyping);
    socket.on("user-stop-typing", handleStopTyping);

    return () => {
      socket.off("new-message", handleNewMessage);
      socket.off("reaction-update", handleReaction);
      socket.off("messages-seen", handleSeen);
      socket.off("user-typing", handleTyping);
      socket.off("user-stop-typing", handleStopTyping);
    };
  }, [token, roomId]);

  // ================= AUTO SCROLL =================
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ================= SEND =================
  const sendMessage = () => {
    const socket = getSocket();
    if (!socket || !text.trim()) return;

    const tempMsg = {
      id: "temp-" + Date.now(),
      text,
      createdAt: new Date(),
      name: userRef.current?.name || "You",
      reactions: [],
      status: "sent",
      isTemp: true,
    };

    setMessages((prev) => [...prev, tempMsg]);

    socket.emit("send-message", { roomId, text });

    setText("");
    socket.emit("stop-typing", roomId);
  };

  // ================= INPUT =================
  const handleChange = (e) => {
    setText(e.target.value);

    const socket = getSocket();
    if (!socket) return;

    socket.emit("typing", roomId);

    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit("stop-typing", roomId);
    }, 1200);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  // ================= REACT =================
  const react = (messageId, emoji) => {
    const socket = getSocket();
    if (!socket) return;

    socket.emit("add-reaction", {
      messageId,
      emoji,
      roomId,
    });
  };

  // ================= RENDER =================
  return (
    <div className="flex-1 flex flex-col bg-gray-900 text-white">

      {/* HEADER */}
      <div className="h-14 border-b border-gray-700 flex items-center px-4 font-semibold">
        Room #{roomId}
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 flex flex-col">

        {messages.map((m) => {
          const isMe = m.name === userRef.current?.name;

          return (
            <div
              key={m.id}
              className={`p-3 rounded-lg border max-w-[70%] ${
                isMe
                  ? "bg-blue-600 self-end border-blue-500"
                  : "bg-gray-800 border-gray-700"
              }`}
            >
              {!isMe && (
                <div className="text-xs text-blue-400">
                  {m.name || "User"}
                </div>
              )}

              <div className="mt-1">{m.text}</div>

              {/* REACTIONS */}
              <div className="flex gap-2 mt-2 flex-wrap">
                {m.reactions?.map((r, i) => (
                  <span
                    key={i}
                    className="text-xs bg-gray-700 px-2 py-0.5 rounded cursor-pointer"
                    onClick={() => react(m.id, r.emoji)}
                  >
                    {r.emoji} {r.count}
                  </span>
                ))}

                {EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => react(m.id, emoji)}
                    className="text-xs"
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              {/* TIME + STATUS */}
              <div className="text-xs text-gray-400 mt-2 flex justify-between">
                <span>
                  {m.createdAt
                    ? new Date(m.createdAt).toLocaleTimeString()
                    : ""}
                </span>

                {isMe && (
                  <span className="text-blue-300">
                    {m.status === "seen" ? "✔✔ Seen" : "✔ Sent"}
                  </span>
                )}
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      {/* TYPING */}
      {typingUsers.length > 0 && (
        <div className="text-xs text-gray-400 px-4 pb-1">
          Someone is typing...
        </div>
      )}

      {/* INPUT */}
      <div className="p-3 border-t border-gray-700 flex gap-2">
        <input
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className="flex-1 p-2 rounded bg-gray-800 outline-none"
          placeholder="Type message..."
        />

        <button
          onClick={sendMessage}
          className="bg-blue-500 px-4 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
}