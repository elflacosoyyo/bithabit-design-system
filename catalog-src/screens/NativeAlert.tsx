import { useTheme } from '../../src/theme/ThemeProvider';

export interface AlertAction { label: string; style?: 'default' | 'cancel' | 'destructive'; onPress: () => void }

/**
 * Emulation of the operating system's alert (the app calls Alert.alert). It is catalog chrome, drawn in neutral iOS-like colors,
 * and is NOT a design-system component: the OS owns that look.
 */
export const NativeAlert = ({ title, message, actions, testID = 'native-alert' }: { title: string; message: string; actions: AlertAction[]; testID?: string }) => {
  const { mode } = useTheme();
  const dark = mode === 'dark';
  const line = dark ? 'rgba(255,255,255,0.18)' : 'rgba(60,60,67,0.29)';
  const color = (s: AlertAction['style']) => (s === 'destructive' ? (dark ? '#ff453a' : '#ff3b30') : dark ? '#0a84ff' : '#007aff');
  return (
    <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 900 }} data-testid={`${testID}-backdrop`}>
      <div role="alertdialog" aria-modal="true" aria-label={title || message} data-testid={testID} style={{ width: 270, borderRadius: 14, overflow: 'hidden', background: dark ? '#2c2c2e' : '#f2f2f7', color: dark ? '#fff' : '#000', textAlign: 'center', fontFamily: '-apple-system, Inter, system-ui, sans-serif' }}>
        <div style={{ padding: '18px 16px 16px' }}>
          {title ? <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 4 }}>{title}</div> : null}
          <div style={{ fontSize: 13, lineHeight: '16px' }}>{message}</div>
        </div>
        <div style={{ display: 'flex', borderTop: `1px solid ${line}` }}>
          {actions.map((a, i) => (
            <button key={a.label} onClick={a.onPress} style={{ flex: 1, height: 44, border: 0, borderLeft: i ? `1px solid ${line}` : 0, background: 'transparent', color: color(a.style), fontSize: 17, fontWeight: a.style === 'cancel' ? 600 : 400, cursor: 'pointer', fontFamily: 'inherit' }}>{a.label}</button>
          ))}
        </div>
      </div>
    </div>
  );
};
