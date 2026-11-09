import { Button } from '@books/ui/components/button';
import { Icon } from '@books/ui/components/icon';
import { SignInButton } from '@clerk/tanstack-react-start';
import { createFileRoute } from '@tanstack/react-router';

import { m } from '#/paraglide/messages';
import { getAuthenticatedUserFn } from '#/services/users/users.functions';

export const Route = createFileRoute('/_app/')({
  component: Home,
  loader: async () => {
    const user = await getAuthenticatedUserFn();

    return { user };
  },
  head: () => ({ meta: [{ title: m.nav_home() }] }),
});

function Home() {
  const { user } = Route.useLoaderData();

  return (
    <div className="container mx-auto flex max-w-4xl flex-col gap-8 px-4 py-16">
      <header className="flex flex-col gap-2">
        <p className="text-overline text-muted-foreground uppercase">{m.nav_home()}</p>
        <h1>
          {user?.displayName ? m.home_welcome({ name: user.displayName }) : m.home_welcome_guest()}
        </h1>
        <p className="text-muted-foreground">{m.home_intro()}</p>
      </header>

      {!user && (
        <section className="flex flex-col items-start gap-4">
          <p>{m.home_sign_in_prompt()}</p>
          <SignInButton mode="modal" withSignUp>
            <Button>
              <Icon icon="login" aria-hidden data-icon="inline-start" />
              {m.user_menu_sign_in()}
            </Button>
          </SignInButton>
        </section>
      )}
    </div>
  );
}
