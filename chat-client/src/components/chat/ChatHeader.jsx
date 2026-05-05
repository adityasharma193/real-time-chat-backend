<div className="h-14 border-b border-gray-700 flex items-center justify-between px-4 bg-gray-900">

  <div className="flex items-center gap-3">
    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-sm">
      #
    </div>

    <div>
      <div className="font-semibold">{roomId}</div>
      <div className="text-xs text-gray-400">
        {onlineUsers.length} online
      </div>
    </div>
  </div>

  <div className="text-sm text-gray-400">
    {typingUsers.length > 0 && "Typing..."}
  </div>

</div>