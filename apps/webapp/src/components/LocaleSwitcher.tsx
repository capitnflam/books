import { m } from '#/paraglide/messages';
// Locale switcher refs:
// - Paraglide docs: https://inlang.com/m/gerre34r/library-inlang-paraglideJs
// - Router example: https://github.com/TanStack/router/tree/main/examples/react/i18n-paraglide#switching-locale
import { getLocale, locales, setLocale } from '#/paraglide/runtime';

export default function ParaglideLocaleSwitcher() {
  const currentLocale = getLocale();

  return (
    <div
      style={{
        display: 'flex',
        gap: '0.5rem',
        alignItems: 'center',
        color: 'inherit',
      }}
      aria-label={m.language_label()}
    >
      <span style={{ opacity: 0.85 }}>{m.current_locale({ locale: currentLocale })}</span>
      <div style={{ display: 'flex', gap: '0.25rem' }}>
        {locales.map((locale) => (
          <button
            key={locale}
            onClick={() => setLocale(locale)}
            aria-pressed={locale === currentLocale}
            className="border-input hover:border-foreground hover:bg-card aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground focus-visible:ring-ring focus-visible:ring-offset-background cursor-pointer rounded-md border px-3 py-1 text-sm font-medium tracking-[0.01em] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-offset-2 aria-pressed:font-semibold"
          >
            {locale.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}
