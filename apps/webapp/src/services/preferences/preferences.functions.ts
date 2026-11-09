import { createServerFn } from '@tanstack/react-start';

import { getSidebarOpenServer } from './preferences.server';

export const getSidebarOpenFn = createServerFn({ method: 'GET' }).handler(getSidebarOpenServer);
