// TODO: this is mostly AI generated, and should probably be rewritten.

import { useState, useRef, JSX } from "react";
import {
  Button,
  Paper,
  Title,
  Text,
  Group,
  Stack,
  Progress,
  Box,
  Badge,
} from "@mantine/core";
import { IconMicrophone, IconMicrophoneOff } from "@tabler/icons-react";
import { runPromise } from "grassroots-shared/util/RunPromise";

export function MicrophoneTester(): JSX.Element {
  const [isRecording, setIsRecording] = useState(false);
  const [volumeHistory, setVolumeHistory] = useState<number[]>([]);
  const [currentVolume, setCurrentVolume] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const MAX_HISTORY_LENGTH = 100;

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

    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
    }

    if (audioContextRef.current) {
      runPromise(audioContextRef.current.close(), true);
    }

    setIsRecording(false);
    setCurrentVolume(0);
  };

  const updateVolume = (): void => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
    const normalizedVolume = Math.min(100, (average / 255) * 100);

    setCurrentVolume(normalizedVolume);
    setVolumeHistory((prev) => {
      const newHistory = [...prev, normalizedVolume];
      return newHistory.slice(-MAX_HISTORY_LENGTH);
    });

    animationFrameRef.current = requestAnimationFrame(updateVolume);
  };

  const getVolumeColor = (volume: number): string => {
    if (volume < 20) return "green";
    if (volume < 60) return "yellow";
    return "red";
  };

  const getVolumeLabel = (volume: number): string => {
    if (volume < 10) return "Silent";
    if (volume < 30) return "Quiet";
    if (volume < 60) return "Normal";
    if (volume < 80) return "Loud";
    return "Very Loud";
  };

  return (
    <Stack gap="xl">
      <Group justify="space-between" align="flex-start">
        <Box>
          <Title order={2} mb="xs">
            Microphone Tester
          </Title>
          <Text size="sm" c="dimmed">
            Test your microphone and monitor audio levels in real-time
          </Text>
        </Box>
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
        >
          {isRecording ? "Stop" : "Start Test"}
        </Button>
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
        <Group justify="space-between" align="flex-end">
          <Box>
            <Text size="sm" c="dimmed" mb={4}>
              Current Level
            </Text>
            <Group gap="xs" align="baseline">
              <Text size="2.5rem" fw={700}>
                {Math.round(currentVolume)}
              </Text>
              <Text size="lg" c="dimmed">
                dB
              </Text>
            </Group>
            <Text
              size="sm"
              fw={500}
              mt={4}
              c={currentVolume > 0 ? undefined : "dimmed"}
            >
              {getVolumeLabel(currentVolume)}
            </Text>
          </Box>
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
        </Group>

        <Progress
          value={currentVolume}
          size="lg"
          radius="xl"
          color={getVolumeColor(currentVolume)}
          animated={isRecording}
        />

        <Paper withBorder p="md" radius="md">
          <Group justify="space-between" mb="md">
            <Text size="sm" fw={500}>
              Volume History
            </Text>
            <Text size="xs" c="dimmed">
              Last {volumeHistory.length} samples
            </Text>
          </Group>
          <Box
            style={{
              height: 192,
              backgroundColor: "var(--mantine-color-gray-1)",
              borderRadius: "var(--mantine-radius-sm)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <svg
              style={{ width: "100%", height: "100%" }}
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient
                  id="volumeGradient"
                  x1="0%"
                  y1="0%"
                  x2="0%"
                  y2="100%"
                >
                  <stop
                    offset="0%"
                    stopColor="var(--mantine-color-blue-6)"
                    stopOpacity="0.8"
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--mantine-color-blue-6)"
                    stopOpacity="0.1"
                  />
                </linearGradient>
              </defs>
              {volumeHistory.length > 1 && (
                <>
                  <polyline
                    fill="url(#volumeGradient)"
                    stroke="none"
                    points={
                      volumeHistory
                        .map((vol, i) => {
                          const x = (i / (MAX_HISTORY_LENGTH - 1)) * 100;
                          const y = 100 - vol;
                          return `${String(x)},${String(y)}`;
                        })
                        .join(" ") + ` 100,100 0,100`
                    }
                    vectorEffect="non-scaling-stroke"
                  />
                  <polyline
                    fill="none"
                    stroke="var(--mantine-color-blue-6)"
                    strokeWidth="2"
                    points={volumeHistory
                      .map((vol, i) => {
                        const x = (i / (MAX_HISTORY_LENGTH - 1)) * 100;
                        const y = 100 - vol;
                        return `${String(x)},${String(y)}`;
                      })
                      .join(" ")}
                    vectorEffect="non-scaling-stroke"
                  />
                </>
              )}
            </svg>
            {volumeHistory.length === 0 && (
              <Box
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text size="sm" c="dimmed">
                  Start testing to see volume history
                </Text>
              </Box>
            )}
          </Box>
        </Paper>
      </Stack>
    </Stack>
  );
}
