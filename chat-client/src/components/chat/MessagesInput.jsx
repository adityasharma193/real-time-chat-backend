import { useState } from "react";

export default function MessageInput({ roomId }) {
  const [text, setText] = useState("");

  const sendMessage = () => {
    if (!text.trim()) return;

    // 👉 your socket emit here
    // socket.emit("send_message", { roomId, text });

    setText("");
  };

  return (
  <div className="p-4 border-t border-gray-700 bg-gray-900">
  <div className="flex items-center gap-2 bg-gray-800 rounded-full px-3 py-2">

    <input
      value={text}
      onChange={(e) => {
        setText(e.target.value);
        getSocket().emit("typing", roomId);
      }}
      placeholder="Message #room"
      className="flex-1 bg-transparent outline-none text-sm"
      onKeyDown={(e) => e.key === "Enter" && sendMessage()}
    />

    <button
      onClick={sendMessage}
      className="bg-blue-500 px-4 py-1.5 rounded-full text-sm hover:bg-blue-600"
    >
      Send
    </button>

  </div>
</div>
  );
}