import type { ReactNode } from 'react';
import { useTheme } from '../../src/theme/ThemeProvider';

/** One labelled example on a component page. The section is a landmark so tests (and screen readers) can find it by name. */
export const Example = ({ title, note, children, width = 420 }: { title: string; note?: string; children: ReactNode; width?: number | string }) => {
  const { theme } = useTheme();
  return (
    <section aria-label={title} style={{ margin: '0 0 28px' }}>
      <h3 style={{ fontSize: 13, fontWeight: 600, letterSpacing: 0.6, textTransform: 'uppercase', color: theme.color.text.secondary, margin: '0 0 8px' }}>{title}</h3>
      {note ? <p style={{ fontSize: 13.5, lineHeight: '19px', color: theme.color.text.secondary, margin: '0 0 10px', maxWidth: 640 }}>{note}</p> : null}
      <div style={{ maxWidth: width }}>{children}</div>
    </section>
  );
};

export const noop = () => undefined;
