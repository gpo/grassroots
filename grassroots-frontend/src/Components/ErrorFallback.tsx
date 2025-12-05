import { Text, Stack, MantineProvider, Code } from "@mantine/core";
import { JSX } from "react";

interface ErrorFallBackProps {
  // We type this a bit more strictly than FallbackProps.
  error: unknown;
  resetErrorBoundary?: (...args: unknown[]) => void;
}

export function ErrorFallback(props: ErrorFallBackProps): JSX.Element {
  const { error } = props;
  const errorStr = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;
  const stackEl = stack !== undefined ? <Code block>{stack}</Code> : undefined;

  const json = JSON.stringify(error, null, 2);
  const jsonEl = <Code block>{json}</Code>;

  return (
    <Stack
      ml={200}
      mt={20}
      align="left"
      justify="left"
      style={{ height: "100vh" }}
    >
      <Text size="xl" c="red">
        Something went wrong:
      </Text>
      <Text>{errorStr}</Text>
      {jsonEl}
      {stackEl}
    </Stack>
  );
}

export function ErrorFallbackOutsideMantineProvider(
  props: ErrorFallBackProps,
): JSX.Element {
  return (
    <MantineProvider>
      <ErrorFallback {...props}></ErrorFallback>
    </MantineProvider>
  );
}
