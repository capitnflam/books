import { createServerFn } from "@tanstack/react-start";

import { getAuthenticatedUserServer } from "./users.server";

export const getAuthenticatedUserFn = createServerFn({ method: "GET" }).handler(
  getAuthenticatedUserServer,
);
