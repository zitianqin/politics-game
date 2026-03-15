"use client";

import { useEffect, useRef, useState } from "react";
import type {
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  IMicrophoneAudioTrack,
  IRemoteAudioTrack,
} from "agora-rtc-sdk-ng";
import { apiUrl } from "../lib/api";

type VoiceStatus = "idle" | "connecting" | "connected" | "error";

interface AgoraTokenResponse {
  appId: string;
  channelName: string;
  token: string;
  uid: number;
}

interface UseAgoraDebateVoiceProps {
  enabled: boolean;
  gameCode: string;
  playerSlot: 1 | 2;
  activeSpeaker: 1 | 2;
  roundNumber: number;
  debateLive: boolean;
}

export function useAgoraDebateVoice({
  enabled,
  gameCode,
  playerSlot,
  activeSpeaker,
  roundNumber,
  debateLive,
}: UseAgoraDebateVoiceProps) {
  const [status, setStatus] = useState<VoiceStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const localTrackRef = useRef<IMicrophoneAudioTrack | null>(null);
  const remoteTracksRef = useRef<Map<string, IRemoteAudioTrack>>(new Map());

  useEffect(() => {
    const shouldPublish = enabled && debateLive && activeSpeaker === playerSlot;
    const localTrack = localTrackRef.current;

    if (!localTrack) return;

    localTrack.setEnabled(shouldPublish).catch((err: unknown) => {
      console.error("Failed to update Agora microphone state:", err);
      setError("Voice mic toggle failed");
      setStatus("error");
    });
  }, [activeSpeaker, debateLive, enabled, playerSlot]);

  useEffect(() => {
    if (!enabled) {
      setStatus("idle");
      setError(null);
      return;
    }

    let cancelled = false;

    const cleanup = async () => {
      const localTrack = localTrackRef.current;
      if (localTrack) {
        localTrackRef.current = null;
        try {
          localTrack.stop();
          localTrack.close();
        } catch {}
      }

      for (const track of remoteTracksRef.current.values()) {
        try {
          track.stop();
        } catch {}
      }
      remoteTracksRef.current.clear();

      const client = clientRef.current;
      clientRef.current = null;
      if (client) {
        try {
          client.removeAllListeners();
          await client.leave();
        } catch {}
      }
    };

    const subscribeToRemoteAudio = async (
      client: IAgoraRTCClient,
      user: IAgoraRTCRemoteUser
    ) => {
      await client.subscribe(user, "audio");
      if (user.audioTrack) {
        remoteTracksRef.current.set(String(user.uid), user.audioTrack);
        user.audioTrack.play();
      }
    };

    const joinVoice = async () => {
      try {
        setStatus("connecting");
        setError(null);

        const playerId = sessionStorage.getItem("playerId");
        if (!playerId) {
          throw new Error("Missing player id");
        }

        const [{ default: AgoraRTC }, response] = await Promise.all([
          import("agora-rtc-sdk-ng"),
          fetch(apiUrl("/api/agora/token"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              gameCode,
              playerId,
              roundNumber,
            }),
          }),
        ]);

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as {
            error?: string;
          } | null;
          throw new Error(payload?.error || "Failed to fetch Agora token");
        }

        const { appId, channelName, token, uid } =
          (await response.json()) as AgoraTokenResponse;

        const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
        clientRef.current = client;

        client.on("user-published", async (user, mediaType) => {
          if (mediaType !== "audio") return;
          try {
            await subscribeToRemoteAudio(client, user);
          } catch (err) {
            console.error("Failed to subscribe to remote audio:", err);
          }
        });

        client.on("user-unpublished", (user, mediaType) => {
          if (mediaType !== "audio") return;
          const track = remoteTracksRef.current.get(String(user.uid));
          if (track) {
            track.stop();
            remoteTracksRef.current.delete(String(user.uid));
          }
        });

        client.on("user-left", (user) => {
          const track = remoteTracksRef.current.get(String(user.uid));
          if (track) {
            track.stop();
            remoteTracksRef.current.delete(String(user.uid));
          }
        });

        await client.join(appId, channelName, token, uid);

        if (cancelled) {
          await cleanup();
          return;
        }

        const localTrack = await AgoraRTC.createMicrophoneAudioTrack();
        localTrackRef.current = localTrack;

        await client.publish([localTrack]);
        await localTrack.setEnabled(debateLive && activeSpeaker === playerSlot);

        const remoteUsers = [...client.remoteUsers];
        for (const remoteUser of remoteUsers) {
          if (remoteUser.hasAudio) {
            await subscribeToRemoteAudio(client, remoteUser);
          }
        }

        if (!cancelled) {
          setStatus("connected");
        }
      } catch (err) {
        console.error("Failed to connect Agora voice:", err);
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to start voice call"
          );
          setStatus("error");
        }
        await cleanup();
      }
    };

    void joinVoice();

    return () => {
      cancelled = true;
      void cleanup();
    };
  }, [enabled, gameCode, playerSlot, roundNumber]);

  return {
    status,
    error,
  };
}
