import { Box, Text, Button, Group, Stack } from "@mantine/core";
import { JSX } from "react/jsx-dev-runtime";
export interface AudioFile {
  id: string;
  blob: Blob;
  url: string;
  name: string;
  size: number;
  type: string;
}

interface AudioPreviewProps {
  audioFile: AudioFile;
  onRemove: () => void;
}

export function AudioPreview({
  audioFile,
  onRemove,
}: AudioPreviewProps): JSX.Element {
  return (
    <Box bg="gray.1" p="md" pb="0" style={{ borderRadius: "8px" }}>
      <Group justify="space-between">
        <Stack gap="xs">
          <Text size="sm" fw={500}>
            Audio Preview
          </Text>
          <Text size="xs" c="dimmed">
            {audioFile.name}
          </Text>
          <Text size="xs" c="dimmed">
            {(audioFile.size / 1024 / 1024).toFixed(2)} MB • {audioFile.type}
          </Text>
        </Stack>
        <Button size="xs" color="red" variant="light" onClick={onRemove}>
          Remove
        </Button>
      </Group>
      <Box w="100%">
        <audio controls src={audioFile.url}></audio>
      </Box>
    </Box>
  );
}
