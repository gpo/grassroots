import { Anchor } from "@mantine/core";
import { LinkProps, Link } from "@tanstack/react-router";
import { JSX } from "react";

export function RoutedLink({
  to,
  children,
  ...rest
}: {
  to: LinkProps["to"]; // You can further constrain this to `RoutePaths` if desired
  children: React.ReactNode;
}): JSX.Element {
  return (
    <Anchor renderRoot={(props) => <Link to={to} {...props} />} {...rest}>
      {children}
    </Anchor>
  );
}
