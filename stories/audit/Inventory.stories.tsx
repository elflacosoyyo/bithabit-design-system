import YAML from 'yaml';
import type { Meta, StoryObj } from '@storybook/react-vite';
import inventoryRaw from '../../components/inventory.yaml?raw';
import { allSpecs } from '../_helpers/SpecView';
import { Badge, Code, H1, H2, P, Page, Table } from '../_helpers/ui';

/* eslint-disable @typescript-eslint/no-explicit-any */
const inventory = (YAML.parse(inventoryRaw) as { components: any[] }).components;
const count = (key: string) => inventory.reduce<Record<string, number>>((acc, c) => ({ ...acc, [c[key]]: (acc[c[key]] ?? 0) + 1 }), {});

const Inventory = () => {
  const specs = allSpecs();
  const byStatus = count('status');
  const tone = (s: string) => (s === 'spec-draft' || s === 'spec-stable' ? 'pass' : s === 'deferred' ? 'neutral' : 'warn') as 'pass' | 'warn' | 'neutral';
  return (
    <Page maxWidth={1100}>
      <H1>Component inventory</H1>
      <P muted>Every component the design system will cover, and where each one stands.</P>
      <P>
        <Badge tone="pass">{byStatus['spec-draft'] ?? 0} specified (draft)</Badge>{' '}
        <Badge tone="warn">{byStatus.planned ?? 0} planned</Badge>{' '}
        <Badge>{byStatus.deferred ?? 0} deferred</Badge>{' '}
        <span style={{ opacity: 0.7 }}>of {inventory.length}</span>
      </P>
      <H2>Specified components</H2>
      <Table
        head={['Component', 'Version', 'Status', 'Tokens', 'Code gaps', 'Open questions']}
        rows={specs.map((s) => [<b key="n">{s.name}</b>, `v${s.version}`, <Badge key="s" tone={s.status === 'stable' ? 'pass' : 'warn'}>{s.status}</Badge>, s.tokens.length, s.code_gaps?.length ?? 0, s.open_questions.length])}
      />
      <H2>Backlog</H2>
      <Table
        head={['Id', 'Category', 'Priority', 'Status', 'Notes']}
        rows={inventory.map((c) => [<Code key="i">{c.id}</Code>, c.category, c.priority, <Badge key="s" tone={tone(c.status)}>{c.status}</Badge>, c.notes ?? ''])}
      />
    </Page>
  );
};

const meta = { title: 'Audit/Inventory', component: Inventory, parameters: { layout: 'padded' } } satisfies Meta<typeof Inventory>;
export default meta;
export const Status: StoryObj<typeof meta> = {};
