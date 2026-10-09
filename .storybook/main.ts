import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../stories/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-a11y'],
  framework: { name: '@storybook/react-vite', options: {} },
  async viteFinal(viteConfig) {
    const { mergeConfig } = await import('vite');
    return mergeConfig(viteConfig, {
      resolve: {
        // The reference components are written against React Native and rendered on the web by react-native-web.
        alias: { 'react-native': 'react-native-web' },
        extensions: ['.web.tsx', '.web.ts', '.web.js', '.tsx', '.ts', '.js', '.mjs', '.json'],
      },
      define: { __DEV__: JSON.stringify(true) },
      optimizeDeps: { include: ['react-native-web'] },
      server: { fs: { allow: ['..'] } },
      build: {
        rollupOptions: {
          // react-native-web ships 'use client' directives that are irrelevant for a static Storybook.
          onwarn(warning: { code?: string }, defaultHandler: (w: unknown) => void) {
            if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return;
            defaultHandler(warning);
          },
        },
      },
    });
  },
};

export default config;
