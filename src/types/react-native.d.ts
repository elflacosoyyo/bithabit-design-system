// Minimal typings for the React Native APIs used by the reference components.
// The catalog build maps 'react-native' to react-native-web (see scripts/build-catalog.mjs). We do not install the real
// react-native package here (it drags in Metro and its advisories), so only the surface we use is declared.
declare module 'react-native' {
  import type * as React from 'react';
  type Any = any; // eslint-disable-line @typescript-eslint/no-explicit-any
  export type StyleProp = Any;
  export type ViewStyle = Record<string, Any>;
  export type TextStyle = Record<string, Any>;
  export interface LayoutChangeEvent { nativeEvent: { layout: { x: number; y: number; width: number; height: number } } }
  export const View: React.ComponentType<Record<string, Any>>;
  export const Text: React.ComponentType<Record<string, Any>>;
  export const Pressable: React.ComponentType<Record<string, Any>>;
  export const Modal: React.ComponentType<Record<string, Any>>;
  export const ActivityIndicator: React.ComponentType<Record<string, Any>>;
  export const Platform: { OS: 'ios' | 'android' | 'web'; select<T>(spec: Record<string, T>): T };
  export const StyleSheet: { absoluteFill: ViewStyle; absoluteFillObject: ViewStyle; create<T>(styles: T): T; hairlineWidth: number };
  export function useWindowDimensions(): { width: number; height: number; scale: number; fontScale: number };
  export const PanResponder: { create(config: Record<string, Any>): { panHandlers: Record<string, Any> } };
  export const Easing: Record<string, Any>;
  export namespace Animated {
    class Value { constructor(v: number); setValue(v: number): void; stopAnimation(cb?: (v: number) => void): void; }
    const View: React.ComponentType<Record<string, Any>>;
    function timing(v: Value, cfg: Record<string, Any>): { start(cb?: (r: { finished: boolean }) => void): void };
    function spring(v: Value, cfg: Record<string, Any>): { start(cb?: (r: { finished: boolean }) => void): void };
    function parallel(a: Array<{ start(cb?: (r: { finished: boolean }) => void): void }>): { start(cb?: (r: { finished: boolean }) => void): void };
  }
}
