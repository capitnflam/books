import { createServerFn } from '@tanstack/react-start';

import { getSidebarOpenServer, getThemeServer } from './preferences.server';

export const getSidebarOpenFn = createServerFn({ method: 'GET' }).handler(getSidebarOpenServer);

export const getThemeFn = createServerFn({ method: 'GET' }).handler(getThemeServer);
