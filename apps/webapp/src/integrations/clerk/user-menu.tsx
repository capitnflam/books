import { Avatar, AvatarFallback, AvatarImage } from '@books/ui/components/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@books/ui/components/dropdown-menu';
import { Icon } from '@books/ui/components/icon';
import { SidebarMenuButton, SidebarMenuSkeleton, useSidebar } from '@books/ui/components/sidebar';
import { SignInButton, useClerk, useUser } from '@clerk/tanstack-react-start';
import { Link } from '@tanstack/react-router';

import { themeOptions, useTheme } from '#/components/ThemeProvider';
import { m } from '#/paraglide/messages';
import { getLocale, localizeHref, locales, setLocale } from '#/paraglide/runtime';
import { initialsOf, localeName } from '#/utils/names';

import type { Locale } from '#/paraglide/runtime';
import type { Theme } from '#/services/preferences/theme';

export default function UserMenu() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const { isMobile, setOpenMobile } = useSidebar();
  const { theme, setTheme } = useTheme();

  if (!isLoaded) {
    return <SidebarMenuSkeleton showIcon />;
  }

  if (!isSignedIn) {
    return (
      <SignInButton mode="modal" withSignUp>
        <SidebarMenuButton tooltip={m.user_menu_sign_in()}>
          <Icon icon="login" aria-hidden />
          <span>{m.user_menu_sign_in()}</span>
        </SidebarMenuButton>
      </SignInButton>
    );
  }

  const email = user.primaryEmailAddress?.emailAddress ?? '';
  const name = user.fullName || user.username || email;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <SidebarMenuButton
            size="lg"
            tooltip={m.user_menu_label()}
            className="data-popup-open:bg-sidebar-accent"
          />
        }
      >
        <Avatar>
          <AvatarImage src={user.imageUrl} alt="" />
          <AvatarFallback>{initialsOf(name)}</AvatarFallback>
        </Avatar>
        <span className="flex min-w-0 flex-col">
          <span className="truncate">{name}</span>
          {email && email !== name && (
            <span className="text-muted-foreground truncate text-sm font-normal">{email}</span>
          )}
        </span>
        <Icon icon="selector" className="ml-auto" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side={isMobile ? 'top' : 'right'}
        align="end"
        sideOffset={8}
        className="min-w-56"
      >
        <DropdownMenuItem render={<Link to="/me" />} onClick={() => setOpenMobile(false)}>
          <Icon icon="user" aria-hidden />
          {m.user_menu_profile()}
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Icon icon="language" aria-hidden />
            {m.language_label()}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup
              value={getLocale()}
              onValueChange={(locale: Locale) => setLocale(locale)}
            >
              {locales.map((locale) => (
                <DropdownMenuRadioItem key={locale} value={locale} lang={locale}>
                  {localeName(locale)}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Icon icon="sun-moon" aria-hidden />
            {m.theme_label()}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup value={theme} onValueChange={(next: Theme) => setTheme(next)}>
              {themeOptions.map(({ value, icon, label }) => (
                <DropdownMenuRadioItem key={value} value={value}>
                  <Icon icon={icon} aria-hidden />
                  {label()}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut({ redirectUrl: localizeHref('/') })}>
          <Icon icon="logout" aria-hidden />
          {m.user_menu_sign_out()}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
