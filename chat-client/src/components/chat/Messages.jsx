import React, { useEffect, useRef } from "react";

const EMOJIS = ["👍", "❤️", "😂", "🔥"];

export default function Messages({ messages = [], onReact }) {
  const containerRef = useRef(null);

  // AUTO SCROLL
  useEffect(() => {
    if (!containerRef.current) return;

    containerRef.current.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  // EMPTY STATE
  if (!messages.length) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <div className="text-lg">No messages yet</div>
          <div className="text-sm mt-1">
            Start the conversation 🚀
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto px-6 py-4 space-y-3"
    >
      {messages.map((msg, index) => {
        const text = msg?.text || "";
        const isMine = !!msg?.isMine;
        const time = msg?.time || "";
        const reactions = Array.isArray(msg?.reactions)
          ? msg.reactions
          : [];

        return (
          <div
            key={msg?.id ?? index}
            className={`flex ${isMine ? "justify-end" : "justify-start"}`}
          >
            {/* 🔥 CRITICAL FIX: expanded hover area */}
            <div className="relative group max-w-[70%] pt-6">

              {/* EMOJI PICKER (NOW INSIDE SAFE ZONE) */}
              <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition">
                <div className="flex gap-2 bg-gray-800 px-2 py-1 rounded shadow-lg">
                  {EMOJIS.map((emoji) => (
                    <span
                      key={emoji}
                      className="cursor-pointer hover:scale-110 transition"
                      onClick={() => onReact && onReact(msg.id, emoji)}
                    >
                      {emoji}
                    </span>
                  ))}
                </div>
              </div>

              {/* MESSAGE */}
              <div
                className={`px-4 py-2 rounded-2xl text-sm break-words leading-relaxed shadow-sm
                  ${
                    isMine
                      ? "bg-blue-500 text-white"
                      : "bg-gray-700 text-gray-200"
                  }
                `}
              >
                {text}
              </div>

              {/* TIME */}
              <div className="text-[10px] text-gray-400 mt-1 opacity-70">
                {time}
              </div>

              {/* REACTIONS */}
              {reactions.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {reactions.map((r, i) => (
                    <span
                      key={i}
                      className="bg-gray-800 px-2 py-[2px] rounded-full text-xs cursor-pointer hover:bg-gray-700 transition"
                      onClick={() => onReact && onReact(msg.id, r.emoji)}
                    >
                      {r?.emoji || ""} {r?.count || 0}
                    </span>
                  ))}
                </div>
              )}

            </div>
          </div>
        );
      })}
    </div>
  );
}