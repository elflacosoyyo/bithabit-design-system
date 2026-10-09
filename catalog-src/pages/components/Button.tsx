import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Button } from '../../../src';
import type { ButtonVariant } from '../../../src';
import { PlusGlyph, TrashGlyph } from '../../../src/components/Glyphs';
import { useTheme } from '../../../src/theme/ThemeProvider';
import { BrandMatrix } from '../../helpers/BrandMatrix';
import { Example, noop } from '../../helpers/layout';

/** Icons take the label color of their variant, as in the app. */
const Icon = ({ kind, variant }: { kind: 'plus' | 'trash'; variant: ButtonVariant }) => {
  const { theme } = useTheme();
  const color = variant === 'outline' ? theme.button.outline.label : theme.button.primary.label;
  const size = theme.button.iconSize;
  return kind === 'plus' ? <PlusGlyph size={size} color={color} /> : <TrashGlyph size={size} color={color} />;
};

const Caption = ({ children }: { children: ReactNode }) => {
  const { theme } = useTheme();
  return <div style={{ fontSize: 12, color: theme.color.text.secondary, margin: '10px 0 4px' }}>{children}</div>;
};

const Stack = ({ items }: { items: Array<{ caption: string; button: ReactNode }> }) => (
  <div>{items.map((i) => <div key={i.caption}><Caption>{i.caption}</Caption>{i.button}</div>)}</div>
);

const AllVariants = () => (
  <div style={{ display: 'grid', gap: 8 }}>
    <Button variant="primary" label="Continue" onPress={noop} />
    <Button variant="outline" label="Add norm" icon={<Icon kind="plus" variant="outline" />} onPress={noop} />
    <Button variant="destructive" label="Delete selected (3)" icon={<Icon kind="trash" variant="destructive" />} onPress={noop} />
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <Button variant="text" label="Cancel" onPress={noop} />
      <Button variant="text-destructive" label="Delete account" onPress={noop} />
      <Button variant="text-link" label="Manage subscriptions" onPress={noop} />
    </div>
    <Button variant="primary" label="Continue" disabled onPress={noop} />
    <Button variant="outline" label="Add norm" loading onPress={noop} />
  </div>
);

const Interactive = () => {
  const [count, setCount] = useState(0);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const save = () => {
    setStatus('saving');
    timer.current = setTimeout(() => setStatus('saved'), 700);
  };
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <Button variant="outline" label="Add norm" onPress={() => setCount((c) => c + 1)} />
      <Button variant="outline" label="Add norm (disabled)" disabled onPress={() => setCount((c) => c + 100)} />
      <Button variant="primary" label="Save changes" loading={status === 'saving'} onPress={save} />
      <p aria-live="polite" style={{ margin: '4px 0 0', fontSize: 13 }}>
        {`Added ${count} ${count === 1 ? 'time' : 'times'}. ${status === 'saved' ? 'Saved.' : status === 'saving' ? 'Saving...' : 'Not saved yet.'}`}
      </p>
    </div>
  );
};

export const Examples = () => (
  <>
    <Example title="Primary" note="The one main action of a screen: accent fill, label on the accent.">
      <Stack items={[
        { caption: 'Default', button: <Button variant="primary" label="Continue" onPress={noop} /> },
        { caption: 'With icon', button: <Button variant="primary" label="Add norm" icon={<Icon kind="plus" variant="primary" />} onPress={noop} /> },
        { caption: 'Disabled', button: <Button variant="primary" label="Continue" disabled onPress={noop} /> },
        { caption: 'Loading', button: <Button variant="primary" label="Continue" loading onPress={noop} /> },
      ]} />
    </Example>
    <Example title="Outline" note="Secondary action: 1.5pt accent border and accent label.">
      <Stack items={[
        { caption: 'Default', button: <Button variant="outline" label="Add norm" onPress={noop} /> },
        { caption: 'With icon', button: <Button variant="outline" label="Add norm" icon={<Icon kind="plus" variant="outline" />} onPress={noop} /> },
        { caption: 'Disabled', button: <Button variant="outline" label="Add norm" disabled onPress={noop} /> },
        { caption: 'Loading', button: <Button variant="outline" label="Log out" loading onPress={noop} /> },
      ]} />
    </Example>
    <Example title="Destructive" note="Deleting or removing data. Two disabled looks: faded (default) and neutral (used by the delete-account confirm).">
      <Stack items={[
        { caption: 'With icon', button: <Button variant="destructive" label="Delete selected (3)" icon={<Icon kind="trash" variant="destructive" />} onPress={noop} /> },
        { caption: 'Without icon', button: <Button variant="destructive" label="Delete account" onPress={noop} /> },
        { caption: 'Disabled, faded', button: <Button variant="destructive" label="Delete selected (0)" icon={<Icon kind="trash" variant="destructive" />} disabled onPress={noop} /> },
        { caption: 'Disabled, neutral', button: <Button variant="destructive" label="Delete account" disabled disabledVariant="neutral" onPress={noop} /> },
        { caption: 'Loading', button: <Button variant="destructive" label="Delete account" loading onPress={noop} /> },
      ]} />
    </Example>
    <Example title="Text" note="Low emphasis, no container. Destructive and link tones are underlined so color is never the only signal.">
      <Stack items={[
        { caption: 'Text', button: <Button variant="text" label="Cancel" onPress={noop} /> },
        { caption: 'Text, disabled', button: <Button variant="text" label="Cancel" disabled onPress={noop} /> },
        { caption: 'Text, destructive', button: <Button variant="text-destructive" label="Delete account" onPress={noop} /> },
        { caption: 'Text, destructive, disabled', button: <Button variant="text-destructive" label="Delete account" disabled onPress={noop} /> },
        { caption: 'Text, link', button: <Button variant="text-link" label="Manage subscriptions" onPress={noop} /> },
      ]} />
    </Example>
    <Example title="Interactive" note="Press the first button to count; the disabled one ignores presses; Save changes shows the loading state for a moment and then confirms."><Interactive /></Example>
  </>
);

export const AllBrands = () => <BrandMatrix minWidth={380}><AllVariants /></BrandMatrix>;
