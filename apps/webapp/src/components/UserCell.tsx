import { Avatar, AvatarFallback, AvatarImage } from '@books/ui/components/avatar';
import { Link } from '@tanstack/react-router';

import { m } from '#/paraglide/messages';
import { initialsOf } from '#/utils/names';

import type { FC } from 'react';

type UserCellProps = {
  user: { id: string; displayName: string | null; email: string; imageUrl: string };
};

/** A user in a list: their picture, their name linking to their page, and their email. */
const UserCell: FC<UserCellProps> = ({ user }) => {
  const name = user.displayName || user.email || m.users_unnamed();

  return (
    <div className="flex items-center gap-3">
      <Avatar>
        <AvatarImage src={user.imageUrl || undefined} alt="" />
        <AvatarFallback>{initialsOf(name)}</AvatarFallback>
      </Avatar>
      <div className="flex min-w-0 flex-col">
        <Link
          to="/users/$userId"
          params={{ userId: user.id }}
          className="text-link focus-visible:ring-ring focus-visible:ring-offset-background truncate rounded-sm font-semibold underline-offset-3 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-offset-2"
        >
          {name}
        </Link>
        {user.email && user.email !== name && (
          <span className="text-muted-foreground truncate text-sm">{user.email}</span>
        )}
      </div>
    </div>
  );
};

export default UserCell;
