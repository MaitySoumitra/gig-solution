import {
  PhoneCall,
  PhoneDisconnect,
  MicrophoneSlash,
} from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { socket } from "../services/socket";
import { getAvatarColor } from "../utils/avatarColor";

interface ChatUser {
  _id: string;
  name: string;
}

interface Props {
  user: ChatUser;
}

export default function ChatHeader({ user }: Props) {
  const [inCall, setInCall] = useState(false);
  // const [muted, setMuted] = useState(false);
  const [incoming, setIncoming] = useState<any>(null);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const ringRef = useRef<HTMLAudioElement | null>(null);

  /* ========== PEER ========== */
  const createPeer = (toSocketId: string | null) => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    pc.onicecandidate = (e) => {
      if (e.candidate && toSocketId) {
        socket.emit("ice-candidate", {
          toSocketId,
          candidate: e.candidate,
        });
      }
    };

    pc.ontrack = (e) => {
      const audio = document.createElement("audio");
      audio.srcObject = e.streams[0];
      audio.autoplay = true;
    };

    pcRef.current = pc;
    return pc;
  };

  /* ========== SOCKET EVENTS ========== */
  useEffect(() => {
    ringRef.current = new Audio("/ringtone.mp3");
    ringRef.current.loop = true;

    socket.on("incoming-call", ({ fromSocketId, offer }) => {
      setIncoming({ fromSocketId, offer });
      ringRef.current?.play().catch(() => {});
    });

    socket.on("call-accepted", async ({ answer }) => {
      await pcRef.current?.setRemoteDescription(answer);
      setInCall(true);
      ringRef.current?.pause();
    });

    socket.on("ice-candidate", (candidate) => {
      pcRef.current?.addIceCandidate(candidate);
    });

    socket.on("call-ended", cleanup);

    return () => {
      socket.off("incoming-call");
      socket.off("call-accepted");
      socket.off("ice-candidate");
      socket.off("call-ended");
    };
  }, []);

  /* ========== ACTIONS ========== */

  const startCall = async () => {
    const pc = createPeer(null);

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;
    stream.getTracks().forEach((t) => pc.addTrack(t, stream));

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    socket.emit("call-user", {
      to: user._id,
      offer,
    });
  };

  const acceptCall = async () => {
    if (!incoming) return;

    const pc = createPeer(incoming.fromSocketId);

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;
    stream.getTracks().forEach((t) => pc.addTrack(t, stream));

    await pc.setRemoteDescription(incoming.offer);

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    socket.emit("answer-call", {
      toSocketId: incoming.fromSocketId,
      answer,
    });

    ringRef.current?.pause();
    setIncoming(null);
    setInCall(true);
  };

  const endCall = () => {
    socket.emit("end-call", { toUserId: user._id });
    cleanup();
  };

  const toggleMute = () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getAudioTracks()[0];
    track.enabled = !track.enabled;
    // setMuted(!track.enabled);
  };

  const cleanup = () => {
    pcRef.current?.close();
    pcRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    ringRef.current?.pause();
    setIncoming(null);
    setInCall(false);
    // setMuted(false);
  };

  const avatarColor = getAvatarColor(user.name);

  return (
    <>
      {/* HEADER */}
      <div className="flex items-center justify-between px-6 py-3 bg-white shadow">
        <div className="flex items-center gap-3">
          <div
            className="h-9 w-9 rounded-full text-white flex items-center justify-center font-semibold"
            style={{ backgroundColor: avatarColor }}
          >
            {user.name[0]}
          </div>
          <p className="font-semibold">{user.name}</p>
        </div>

        <div className="flex gap-2">
          {!inCall && (
            <button
              onClick={startCall}
              className="h-10 w-10 rounded-full bg-green-500 text-white flex items-center justify-center"
            >
              <PhoneCall size={18} weight="fill" />
            </button>
          )}

          {inCall && (
            <>
              <button
                onClick={toggleMute}
                className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center"
              >
                <MicrophoneSlash size={18} />
              </button>

              <button
                onClick={endCall}
                className="h-10 w-10 rounded-full bg-red-600 text-white flex items-center justify-center"
              >
                <PhoneDisconnect size={18} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* INCOMING CALL UI */}
      {incoming && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-xl">
            <p className="mb-3 font-semibold">📞 Incoming Call</p>
            <div className="flex gap-3">
              <button
                onClick={acceptCall}
                className="bg-green-600 text-white px-4 py-1 rounded"
              >
                Accept
              </button>
              <button
                onClick={endCall}
                className="bg-red-600 text-white px-4 py-1 rounded"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 