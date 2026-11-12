import { Button } from '@books/ui/components/button';
import { Icon } from '@books/ui/components/icon';
import { Link, createFileRoute } from '@tanstack/react-router';

import { m } from '#/paraglide/messages';

// Where a page guard sends a signed-in user who lacks the permission the page needs.
export const Route = createFileRoute('/_app/forbidden')({
  head: () => ({ meta: [{ title: m.forbidden_title() }] }),
  component: ForbiddenPage,
});

function ForbiddenPage() {
  return (
    <div className="container mx-auto flex max-w-4xl flex-col items-start gap-6 px-4 py-16">
      <header className="flex flex-col gap-2">
        <p className="text-overline text-muted-foreground uppercase">{m.forbidden_overline()}</p>
        <h1>{m.forbidden_title()}</h1>
        <span aria-hidden className="bg-gilt h-0.5 w-16" />
      </header>
      <p className="text-muted-foreground">{m.forbidden_description()}</p>
      <Button nativeButton={false} render={<Link to="/" />}>
        <Icon icon="home" aria-hidden data-icon="inline-start" />
        {m.forbidden_home()}
      </Button>
    </div>
  );
}
