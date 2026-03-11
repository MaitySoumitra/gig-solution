import { useState } from "react";
import { useSendMessageMutation } from "../redux/features/chat/chatApi";
import {
  PaperPlaneRight,
  Paperclip,
  X,
} from "@phosphor-icons/react";

export default function ChatsInput({
  conversationId,
}: {
  conversationId: string;
}) {
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [sendMessage, { isLoading }] =
    useSendMessageMutation();

  const handleFileChange = (f: File | null) => {
    if (!f) return;

    setFile(f);

    if (f.type.startsWith("image")) {
      const reader = new FileReader();
      reader.onload = () =>
        setPreview(reader.result as string);
      reader.readAsDataURL(f);
    }
  };

  const handleSend = async () => {
    if (!text.trim() && !file) return;

    const fd = new FormData();
    fd.append("conversationId", conversationId);
    fd.append("text", text);
    if (file) fd.append("file", file);

    await sendMessage(fd);

    setText("");
    setFile(null);
    setPreview(null);
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white px-4 py-3 ">
      {/* 🖼 PREVIEW */}
      {preview && (
        <div className="mb-2 relative w-fit">
          <img
            src={preview}
            className="h-32 rounded-lg border"
          />
          <button
            onClick={() => {
              setPreview(null);
              setFile(null);
            }}
            className="absolute -top-2 -right-2 bg-black text-white rounded-full p-1"
          >
            <X size={12} />
          </button>
        </div>
      )}

      <div className="flex items-center gap-3">
        {/* 📎 FILE */}
        <label className="cursor-pointer text-gray-900 hover:text-black">
          <Paperclip size={18} />
          <input
            type="file"
            hidden
            accept="image/*"
            onChange={(e) =>
              handleFileChange(
                e.target.files?.[0] || null
              )
            }
          />
        </label>

        {/* ✍️ INPUT */}
        <input
          className="
            flex-1 rounded-full
            border border-gray-900
            px-4 py-2 text-sm
            focus:outline-none focus:ring-1 focus:ring-black
          "
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
        />

        {/* 🚀 SEND */}
        <button
          onClick={handleSend}
          disabled={isLoading}
          className="
            h-9 w-9 rounded-full
            flex items-center justify-center
            bg-black text-white
            hover:bg-gray-800
          "
        >
          <PaperPlaneRight size={16} />
        </button>
      </div>
    </div>
  );
}