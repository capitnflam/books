import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@books/ui/components/dropdown-menu';
import { Icon } from '@books/ui/components/icon';
import { IconButton } from '@books/ui/components/icon-button';

import { themeOptions, useTheme } from '#/components/ThemeProvider';
import { m } from '#/paraglide/messages';

import type { Theme } from '#/services/preferences/theme';

/** Header button to switch the theme, so it can be changed without an account. */
export default function ThemeMenu() {
  const { theme, setTheme } = useTheme();
  const current = themeOptions.find(({ value }) => value === theme);
  if (!current) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <IconButton
            variant="ghost"
            size="sm"
            icon={current.icon}
            label={m.theme_menu_label({ theme: current.label() })}
          />
        }
      />
      <DropdownMenuContent align="end" className="min-w-48">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{m.theme_label()}</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={theme} onValueChange={(next: Theme) => setTheme(next)}>
            {themeOptions.map(({ value, icon, label }) => (
              <DropdownMenuRadioItem key={value} value={value}>
                <Icon icon={icon} aria-hidden />
                {label()}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
