import { Anchor } from "@mantine/core";
import { LinkProps, Link } from "@tanstack/react-router";
import { JSX } from "react";

export function RoutedLink({
  to,
  children,
  search,
  ...rest
}: {
  to: LinkProps["to"];
  search?: LinkProps["search"];
  children: React.ReactNode;
}): JSX.Element {
  return (
    <Anchor
      renderRoot={(props) => <Link to={to} search={search} {...props} />}
      {...rest}
    >
      {children}
    </Anchor>
  );
}
