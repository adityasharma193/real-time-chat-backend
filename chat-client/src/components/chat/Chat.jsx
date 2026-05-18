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

    // join room
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

    // ================= REACTIONS =================
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

    <div className="flex-1 flex flex-col bg-gray-900 text-white">

      {/* HEADER */}
      <div className="h-14 border-b border-gray-700 flex items-center px-4 font-semibold">
        Room #{roomId}
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">

        {messages.map((msg) => (

          <div
            key={msg.id}
            className="bg-gray-800 p-3 rounded-lg"
          >

            {/* NAME */}
            <div className="text-sm text-blue-400 mb-1">
              {msg.name}
            </div>

            {/* TEXT */}
            <div>
              {msg.text}
            </div>

            {/* REACTIONS */}
            <div className="flex gap-2 mt-2">

              {(msg.reactions || [])
                .map((r, i) => (

                  <button
                    key={i}
                    className="text-sm bg-gray-700 px-2 py-1 rounded"
                  >
                    {r.emoji}
                    {" "}
                    {r.count}
                  </button>
                ))}

              <button
                onClick={() =>
                  addReaction(
                    msg.id,
                    "👍"
                  )
                }

                className="text-sm bg-gray-700 px-2 py-1 rounded"
              >
                👍
              </button>

              <button
                onClick={() =>
                  addReaction(
                    msg.id,
                    "❤️"
                  )
                }

                className="text-sm bg-gray-700 px-2 py-1 rounded"
              >
                ❤️
              </button>

            </div>
          </div>
        ))}

        {typing && (
          <div className="text-sm text-gray-400">
            Someone is typing...
          </div>
        )}

        <div ref={messagesEndRef} />

      </div>

      {/* INPUT */}
      <div className="p-4 border-t border-gray-700 flex gap-2">

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

          className="flex-1 bg-gray-800 rounded px-3 py-2 outline-none"
        />

        <button
          onClick={
            sendMessage
          }

          className="bg-blue-500 hover:bg-blue-600 px-4 rounded"
        >
          Send
        </button>

      </div>

    </div>
  );
}