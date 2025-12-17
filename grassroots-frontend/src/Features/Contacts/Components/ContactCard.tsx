import {
  Avatar,
  Badge,
  Group,
  Paper,
  Stack,
  ThemeIcon,
  Text,
  Button,
  Center,
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
import { EditContactNotes } from "./EditContactNotes.js";

export interface ContactCardProps {
  // TODO: This should just take a ContactDTO, but right now some of the fields
  // are only in PhoneCanvassContactDTO.
  phoneCanvassContact: PhoneCanvassContactDTO | undefined;
  phoneCanvassId: string;
  children?: React.ReactNode;
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

const SUPPORT_LEVEL_TEXT: Record<number, string> = {
  1: "Strong Opposition",
  2: "Leaning Opposition",
  3: "Undecided",
  4: "Leaning Green",
  5: "Strong Green",
};

const getSupportLevelText = (level: number | undefined): string => {
  if (level === undefined || level < 1 || level > 5) {
    return "Unknown Support";
  }

  return SUPPORT_LEVEL_TEXT[level] ?? "Unknown Support";
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
  const { phoneCanvassContact } = props;

  let mainCard = (
    <Center h="100%">
      <Text style={{ fontSize: "100px" }} c="lightgrey">
        No active call
      </Text>
    </Center>
  );

  if (phoneCanvassContact !== undefined) {
    const contact = phoneCanvassContact.contact;

    const name =
      contact.firstName +
      (contact.middleName == undefined ? "" : " " + contact.middleName) +
      " " +
      contact.lastName;

    const tags: string[] = [
      phoneCanvassContact.getMetadataByKey("tags") ?? [],
    ].flat();

    mainCard = (
      <>
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
              {getSupportLevelText(contact.supportLevel)}
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
          <Badge variant="outline">
            {contact.membershipStatus ?? "unknown"}
          </Badge>
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
      </>
    );
  }

  return (
    <Group h="100%" align="stretch">
      <Paper flex={5} shadow="sm" p="xl" radius="md" withBorder mih={"25em"}>
        {mainCard}
      </Paper>
      <Paper flex={2} shadow="sm" p="sm" radius="md" withBorder>
        <Stack h="100%">
          {props.children}
          {phoneCanvassContact && (
            <EditContactNotes
              contactId={phoneCanvassContact.phoneCanvassContactId}
              initialNotes={phoneCanvassContact.notes}
              phoneCanvassId={props.phoneCanvassId}
            ></EditContactNotes>
          )}
        </Stack>
      </Paper>
    </Group>
  );
}
