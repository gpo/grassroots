import {
  Avatar,
  Badge,
  Group,
  Paper,
  Stack,
  ThemeIcon,
  Text,
  Button,
} from "@mantine/core";
import { PhoneCanvassContactDTO } from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";
import { JSX } from "react";
import {
  IconMail,
  IconPhone,
  IconMapPin,
  IconCheck,
  IconUser,
} from "@tabler/icons-react";

export interface ContactCardProps {
  // TODO: This should just take a ContactDTO, but right now some of the fields
  // are only in PhoneCanvassContactDTO.
  phoneCanvassContact: PhoneCanvassContactDTO | undefined;
  style?: React.CSSProperties;
}

const getSupportLevelColor = (level: number | undefined): string => {
  if (level === undefined) {
    return "grey";
  }
  const colors: Record<number, string> = {
    1: "red",
    2: "orange",
    3: "yellow",
    4: "blue",
    5: "green",
  };
  return colors[level] ?? "grey";
};

function getVotedColor(voter: string | undefined): string {
  switch (voter) {
    case "confirmed":
      return "green";
    case "not voted":
      return "red";
  }
  return "grey";
}

export function ContactCard(props: ContactCardProps): JSX.Element {
  const { phoneCanvassContact, style } = props;

  if (phoneCanvassContact === undefined) {
    return (
      <Paper
        style={style}
        h={"28em"}
        shadow="sm"
        p="xl"
        radius="md"
        withBorder
      ></Paper>
    );
  }

  const contact = phoneCanvassContact.contact;

  const name =
    contact.firstName +
    (contact.middleName == undefined ? "" : " " + contact.middleName) +
    " " +
    contact.lastName;

  const tags: string[] = [
    phoneCanvassContact.getMetadataByKey("tags") ?? [],
  ].flat();

  return (
    <Paper style={style} shadow="sm" p="xl" radius="md" withBorder>
      <Group justify="space-between" mb="lg">
        <Group>
          <Avatar size="lg" color="blue">
            <IconUser />
          </Avatar>
          <div>
            <Text size="xl" fw={600}>
              {name}{" "}
              {contact.gvote_id !== undefined ? (
                <Button
                  ml="lg"
                  component="a"
                  target="_blank"
                  href={"https://app.gvote.ca/contacts/" + contact.gvote_id}
                >
                  GVote
                </Button>
              ) : undefined}
            </Text>
            <Text size="sm" c="dimmed">
              {contact.partySupport ?? "unknown"}
            </Text>
          </div>
        </Group>

        <div>
          <Badge
            color={getSupportLevelColor(contact.supportLevel)}
            size="lg"
            mb="xs"
          >
            Support Level {contact.supportLevel}
          </Badge>
          <Group gap="xs">
            <ThemeIcon
              size="sm"
              color={getVotedColor(contact.voted)}
              variant="light"
            >
              <IconCheck size={14} />
            </ThemeIcon>
            <Text size="sm" c="dimmed">
              Voted: {contact.voted}
            </Text>
          </Group>
        </div>
      </Group>

      <Group mb="lg">
        <Text size="sm" fw={500}>
          Membership Status:
        </Text>
        <Badge variant="outline">{contact.membershipStatus ?? "unknown"}</Badge>
      </Group>

      <Stack gap="md">
        <Text size="sm" fw={600} tt="uppercase" c="dimmed">
          Contact Information
        </Text>

        <Group>
          <IconPhone size={18} />
          <Text size="sm">{contact.phoneNumber}</Text>
        </Group>

        <Group>
          <IconMail size={18} />
          <Text size="sm">{contact.email}</Text>
        </Group>

        <Group align="flex-start" mb="lg">
          <IconMapPin size={18} />
          <Stack gap={6}>
            <Text size="sm">{contact.address}</Text>
            <Text size="sm">{contact.town}</Text>
            <Text size="sm">{contact.province}</Text>
            <Text size="sm">{contact.postalCode}</Text>
          </Stack>
        </Group>
      </Stack>

      {tags.length > 0 && (
        <div>
          <Text size="sm" fw={600} tt="uppercase" c="dimmed" mb="sm">
            Tags
          </Text>
          <Group gap="xs">
            {tags.map((tag, index) => (
              <Badge key={index} variant="light">
                {tag}
              </Badge>
            ))}
          </Group>
        </div>
      )}
    </Paper>
  );
}
