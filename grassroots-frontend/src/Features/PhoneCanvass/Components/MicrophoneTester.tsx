import type React from "react";
import { useState, useRef, useEffect } from "react";
import {
  Button,
  Paper,
  Text,
  Group,
  Stack,
  Progress,
  Box,
  Badge,
} from "@mantine/core";
import {
  IconMicrophone,
  IconMicrophoneOff,
  IconPlayerPlay,
} from "@tabler/icons-react";
import { runPromise } from "grassroots-shared/util/RunPromise";

export function MicrophoneTester(): React.JSX.Element {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isReplaying, setIsReplaying] = useState<boolean>(false);
  const [hasRecording, setHasRecording] = useState<boolean>(false);
  const [currentVolume, setCurrentVolume] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordedAudioRef = useRef<HTMLAudioElement | null>(null);
  const replayAudioContextRef = useRef<AudioContext | null>(null);
  const replayAnalyserRef = useRef<AnalyserNode | null>(null);
  const replaySourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  const startRecording = async (): Promise<void> => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event): void => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = (): void => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        const audioUrl = URL.createObjectURL(audioBlob);
        recordedAudioRef.current = new Audio(audioUrl);
        setHasRecording(true);
      };

      mediaRecorder.start();

      setIsRecording(true);
      updateVolume();
    } catch (err) {
      setError("Failed to access microphone. Please check permissions.");
      console.error("Microphone error:", err);
    }
  };

  const stopRecording = (): void => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    if (micStreamRef.current !== null) {
      micStreamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
    }

    if (
      mediaRecorderRef.current !== null &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }

    if (audioContextRef.current !== null) {
      try {
        runPromise(audioContextRef.current.close(), true);
      } catch {
        // It's fine if this is already closed.
      }
    }

    setIsRecording(false);
    setCurrentVolume(0);
  };

  const startReplay = async (): Promise<void> => {
    if (recordedAudioRef.current === null) return;

    try {
      // Create audio context and nodes only once
      if (replayAudioContextRef.current === null) {
        const audioContext = new AudioContext();
        replayAudioContextRef.current = audioContext;

        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        replayAnalyserRef.current = analyser;

        const source = audioContext.createMediaElementSource(
          recordedAudioRef.current,
        );
        replaySourceRef.current = source;

        // Connect the source to both analyser and destination
        source.connect(analyser);
        source.connect(audioContext.destination);
      }

      // Resume audio context if it's suspended
      if (replayAudioContextRef.current.state === "suspended") {
        await replayAudioContextRef.current.resume();
      }

      // Reset audio to beginning
      recordedAudioRef.current.currentTime = 0;

      // Set up ended handler
      recordedAudioRef.current.onended = (): void => {
        setIsReplaying(false);
        setCurrentVolume(0);
        if (animationFrameRef.current !== null) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };

      // Play the audio
      await recordedAudioRef.current.play();
      setIsReplaying(true);
      updateReplayVolume();
    } catch (err) {
      setError("Failed to replay audio.");
      console.error("Replay error:", err);
    }
  };

  const stopReplay = (): void => {
    if (recordedAudioRef.current !== null) {
      recordedAudioRef.current.pause();
      recordedAudioRef.current.currentTime = 0;
    }

    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    setIsReplaying(false);
    setCurrentVolume(0);
  };

  const updateVolume = (): void => {
    if (analyserRef.current === null) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
    const normalizedVolume = Math.min(100, (average / 255) * 100);

    setCurrentVolume(normalizedVolume);

    animationFrameRef.current = requestAnimationFrame(updateVolume);
  };

  const updateReplayVolume = (): void => {
    if (replayAnalyserRef.current === null) return;

    const dataArray = new Uint8Array(
      replayAnalyserRef.current.frequencyBinCount,
    );
    replayAnalyserRef.current.getByteFrequencyData(dataArray);

    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
    const normalizedVolume = Math.min(100, (average / 255) * 100);

    setCurrentVolume(normalizedVolume);

    animationFrameRef.current = requestAnimationFrame(updateReplayVolume);
  };

  useEffect(() => {
    return (): void => {
      stopRecording();
      stopReplay();
      if (replayAudioContextRef.current !== null) {
        runPromise(replayAudioContextRef.current.close(), true);
      }
    };
  }, []);

  const getVolumeColor = (volume: number): string => {
    if (volume < 20) return "green";
    if (volume < 60) return "yellow";
    return "red";
  };

  return (
    <Stack gap="xl">
      <Group justify="space-between" align="flex-start">
        <Group>
          <Button
            onClick={isRecording ? stopRecording : startRecording}
            size="lg"
            color={isRecording ? "red" : "blue"}
            leftSection={
              isRecording ? (
                <IconMicrophoneOff size={20} />
              ) : (
                <IconMicrophone size={20} />
              )
            }
            disabled={isReplaying}
          >
            {isRecording ? "Stop" : "Record"}
          </Button>
          <Button
            onClick={isReplaying ? stopReplay : startReplay}
            size="lg"
            color="green"
            leftSection={<IconPlayerPlay size={20} />}
            disabled={!hasRecording || isRecording}
          >
            Replay
          </Button>
        </Group>
      </Group>

      {error !== null && (
        <Paper
          p="md"
          bg="red.1"
          style={{ border: "1px solid var(--mantine-color-red-3)" }}
        >
          <Text size="sm" c="red">
            {error}
          </Text>
        </Paper>
      )}

      <Stack gap="lg">
        <Group justify="space-between" align="center">
          <Text size="sm" fw={500}>
            Volume Level
          </Text>
          {isRecording && (
            <Badge
              color="red"
              variant="light"
              size="lg"
              leftSection={
                <Box
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    backgroundColor: "var(--mantine-color-red-6)",
                    animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                  }}
                />
              }
            >
              Recording
            </Badge>
          )}
          {isReplaying && (
            <Badge color="green" variant="light" size="lg">
              Replaying
            </Badge>
          )}
          {!isRecording && !isReplaying && (
            // Hold space for the badge.
            <Badge opacity={0} size="lg"></Badge>
          )}
        </Group>

        <Progress
          value={currentVolume}
          size="xl"
          radius="xl"
          color={getVolumeColor(currentVolume)}
          animated={isRecording || isReplaying}
        />
      </Stack>
    </Stack>
  );
}
