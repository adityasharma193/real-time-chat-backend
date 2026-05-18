import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  getMessages,
} from "../../services/api";

import {
  connectSocket,
  getSocket,
} from "../../services/socket";

export default function Chat({
  roomId,
}) {

  const [messages, setMessages] =
    useState([]);

  const [text, setText] =
    useState("");

  const [typing, setTyping] =
    useState(false);

  const messagesEndRef =
    useRef(null);

  const user =
    JSON.parse(
      localStorage.getItem("user")
    );

  // ================= LOAD HISTORY =================
  useEffect(() => {

    if (!roomId) return;

    const loadMessages =
      async () => {

        const data =
          await getMessages(
            roomId
          );

        setMessages(
          data.messages || []
        );
      };

    loadMessages();

  }, [roomId]);

  // ================= SOCKET =================
  useEffect(() => {

    const token =
      localStorage.getItem(
        "token"
      );

    if (!token || !roomId)
      return;

    const socket =
      connectSocket(token);

    socket.emit(
      "join-room",
      roomId
    );

    // ================= NEW MESSAGE =================
    const handleMessage =
      (message) => {

        if (
          Number(
            message.roomId
          ) !== Number(roomId)
        ) {

          return;
        }

        setMessages((prev) => [

          ...prev,

          {
            ...message,

            reactions:
              message.reactions
              || [],
          },
        ]);
      };

    socket.on(
      "new-message",
      handleMessage
    );

    // ================= REACTION UPDATE =================
    socket.on(
      "reaction-update",

      ({
        messageId,
        reactions,
      }) => {

        setMessages((prev) =>
          prev.map((msg) => {

            if (
              msg.id ===
              messageId
            ) {

              return {
                ...msg,
                reactions,
              };
            }

            return msg;
          })
        );
      }
    );

    // ================= TYPING =================
    socket.on(
      "user-typing",

      () => {
        setTyping(true);
      }
    );

    socket.on(
      "user-stop-typing",

      () => {
        setTyping(false);
      }
    );

    return () => {

      socket.off(
        "new-message",
        handleMessage
      );

      socket.off(
        "reaction-update"
      );

      socket.off(
        "user-typing"
      );

      socket.off(
        "user-stop-typing"
      );
    };

  }, [roomId]);

  // ================= SEND =================
  const sendMessage =
    () => {

      if (
        !text.trim()
      ) return;

      const socket =
        getSocket();

      if (!socket) {

        console.error(
          "Socket missing"
        );

        return;
      }

      socket.emit(
        "send-message",
        {
          roomId,
          text,
        }
      );

      setText("");

      socket.emit(
        "stop-typing",
        roomId
      );
    };

  // ================= ENTER =================
  const handleKeyDown =
    (e) => {

      if (
        e.key === "Enter"
      ) {

        sendMessage();
      }
    };

  // ================= REACTION =================
  const addReaction =
    (
      messageId,
      emoji
    ) => {

      const socket =
        getSocket();

      if (!socket) return;

      socket.emit(
        "add-reaction",
        {
          messageId,
          emoji,
          roomId,
        }
      );
    };

  // ================= AUTO SCROLL =================
  useEffect(() => {

    messagesEndRef.current
      ?.scrollIntoView({
        behavior: "smooth",
      });

  }, [messages]);

  return (

    <div className="flex-1 flex flex-col bg-[#020817] text-white">

      {/* HEADER */}
      <div className="h-20 border-b border-slate-800 px-6 flex items-center justify-between bg-slate-900/70 backdrop-blur-lg">

        <div>

          <h2 className="text-2xl font-bold">
            Room #{roomId}
          </h2>

          <p className="text-slate-400 text-sm">
            Real-time chat room
          </p>

        </div>

      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        {messages.map((msg) => {

          const isMine =
            msg.userId === user?.id;

          return (

            <div
              key={msg.id}

              className={`
                flex
                ${
                  isMine
                    ? "justify-end"
                    : "justify-start"
                }
              `}
            >

              <div
                className={`
                  max-w-[75%]
                  rounded-3xl
                  p-5
                  shadow-lg
                  border
                  transition
                  duration-300

                  ${
                    isMine
                      ? `
                        bg-gradient-to-br
                        from-blue-600
                        to-indigo-700
                        border-blue-500
                      `
                      : `
                        bg-slate-800/80
                        backdrop-blur-lg
                        border-slate-700
                      `
                  }
                `}
              >

                {/* NAME */}
                <div
                  className={`
                    text-sm
                    mb-2
                    font-semibold

                    ${
                      isMine
                        ? "text-blue-100"
                        : "text-blue-400"
                    }
                  `}
                >
                  {msg.name}
                </div>

                {/* TEXT */}
                <div className="text-[16px] leading-relaxed break-words">
                  {msg.text}
                </div>

                {/* TIME */}
                <div className="text-xs text-slate-300 mt-3">
                  {new Date(
                    msg.createdAt
                  ).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>

                {/* REACTIONS */}
                <div className="flex flex-wrap gap-2 mt-4">

                  {(msg.reactions || [])
                    .map((r, i) => (

                      <button
                        key={i}

                        className="
                          text-sm
                          bg-black/20
                          border
                          border-white/10
                          px-3
                          py-1
                          rounded-xl
                        "
                      >
                        {r.emoji}
                        {" "}
                        {r.count}
                      </button>
                    ))}

                  {[
                    "👍",
                    "❤️",
                    "😂",
                    "🔥",
                    "😮",
                    "😢",
                    "👏",
                    "🎉",
                  ].map((emoji) => (

                    <button
                      key={emoji}

                      onClick={() =>
                        addReaction(
                          msg.id,
                          emoji
                        )
                      }

                      className="
                        text-sm
                        bg-slate-700
                        hover:bg-blue-600
                        px-3
                        py-1
                        rounded-xl
                        transition
                        duration-200
                      "
                    >
                      {emoji}
                    </button>
                  ))}

                </div>

              </div>

            </div>
          );
        })}

        {/* TYPING */}
        {typing && (

          <div className="text-sm text-slate-400 italic">
            Someone is typing...
          </div>
        )}

        <div ref={messagesEndRef} />

      </div>

      {/* INPUT */}
      <div className="p-5 border-t border-slate-800 bg-slate-900/70 backdrop-blur-lg flex gap-3">

        <input
          value={text}

          onChange={(e) => {

            setText(
              e.target.value
            );

            const socket =
              getSocket();

            socket?.emit(
              "typing",
              roomId
            );
          }}

          onBlur={() => {

            const socket =
              getSocket();

            socket?.emit(
              "stop-typing",
              roomId
            );
          }}

          onKeyDown={
            handleKeyDown
          }

          placeholder="Type a message..."

          className="
            flex-1
            bg-slate-800
            border
            border-slate-700
            focus:border-blue-500
            rounded-2xl
            px-5
            py-4
            outline-none
            text-white
            transition
          "
        />

        <button
          onClick={
            sendMessage
          }

          className="
            px-7
            rounded-2xl
            font-semibold
            bg-gradient-to-r
            from-blue-600
            to-indigo-700
            hover:scale-105
            transition
            duration-200
            shadow-lg
          "
        >
          Send
        </button>

      </div>

    </div>
  );
}