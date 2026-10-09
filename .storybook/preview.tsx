import { useEffect } from 'react';
import type { Preview } from '@storybook/react-vite';
import '@fontsource/inter/300.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/yrsa/300.css';
import '@fontsource/yrsa/400.css';
import '@fontsource/yrsa/500.css';
import '@fontsource/yrsa/600.css';
import '@fontsource/yrsa/700.css';
import { ThemeProvider, useTheme } from '../src/theme/ThemeProvider';
import { BRAND_IDS, brandName, type Mode } from '../src/theme/themes';

const Canvas = ({ children }: { children: React.ReactNode }) => {
  const { theme, mode } = useTheme();
  useEffect(() => {
    document.body.style.background = theme.color.bg.canvas;
    document.documentElement.style.colorScheme = mode;
  }, [theme, mode]);
  return (
    <div style={{ minHeight: '100vh', boxSizing: 'border-box', padding: 24, background: theme.color.bg.canvas, color: theme.color.text.primary, fontFamily: theme.font.family.sans }}>
      {children}
    </div>
  );
};

const preview: Preview = {
  globalTypes: {
    brand: {
      description: 'Brand (white-label client)',
      toolbar: {
        title: 'Brand',
        icon: 'paintbrush',
        dynamicTitle: true,
        items: BRAND_IDS.map((id) => ({ value: id, title: brandName(id) })),
      },
    },
    mode: {
      description: 'Color mode',
      toolbar: {
        title: 'Mode',
        icon: 'circlehollow',
        dynamicTitle: true,
        items: [
          { value: 'light', title: 'Light', icon: 'sun' },
          { value: 'dark', title: 'Dark', icon: 'moon' },
        ],
      },
    },
  },
  initialGlobals: { brand: 'bithabit', mode: 'light' },
  decorators: [
    (Story, context) => (
      <ThemeProvider brand={context.globals.brand as string} mode={context.globals.mode as Mode}>
        <Canvas>
          <Story />
        </Canvas>
      </ThemeProvider>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    backgrounds: { disable: true },
    controls: { expanded: true },
    a11y: { test: 'todo' },
    options: { storySort: { order: ['Overview', 'Foundations', 'Components', 'Audit'] } },
  },
};

export default preview;
