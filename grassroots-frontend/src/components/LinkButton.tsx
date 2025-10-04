// From https://tanstack.com/router/latest/docs/framework/react/guide/custom-link#mantine-example

import * as React from "react";
import { createLink, LinkComponent } from "@tanstack/react-router";
import { Button, ButtonProps } from "@mantine/core";

const MantineButtonComponent = React.forwardRef<HTMLAnchorElement, ButtonProps>(
  (props, ref) => {
    return <Button component="a" ref={ref} {...props} />;
  },
);
MantineButtonComponent.displayName = "MantineButtonComponent";

const CreatedLinkComponent = createLink(MantineButtonComponent);

export const LinkButton: LinkComponent<typeof MantineButtonComponent> = (
  props,
) => {
  return <CreatedLinkComponent preload="intent" {...props} />;
};
