// Regenerates src/routeTree.gen.ts without a full build.
//
// The tanstackStart() Vite plugin runs the router generator when the Vite
// config is resolved, and appends the TanStack Start `Register` declaration
// that the bare router CLI (`tsr generate`) leaves out. Resolving the config is
// enough to trigger it.
import { resolveConfig } from 'vite';

await resolveConfig({}, 'build');
