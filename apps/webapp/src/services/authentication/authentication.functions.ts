import { createServerFn } from "@tanstack/react-start";

import { checkIsAuthenticatedServer } from "./authentication.server";

export const checkIsAuthenticatedFn = createServerFn({ method: "GET" })
  .validator(({ redirect_url = "/" } = {}) => ({ redirect_url }))
  .handler(async ({ data }) => {
    return checkIsAuthenticatedServer(data.redirect_url);
  });
