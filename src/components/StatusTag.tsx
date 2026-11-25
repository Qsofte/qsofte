import './StatusTag.css';

type Tone = 'live' | 'progress' | 'planned';

const tones: Record<string, Tone> = {
  'In use': 'live',
  Built: 'live',
  'In development': 'progress',
  'In progress': 'progress',
  Planned: 'planned',
};

/** A product or module's real status. Weight carries meaning as much as colour:
 *  live is solid, in progress is outlined, planned is quiet. */
export default function StatusTag({ status }: { status: string }) {
  return <span className={`status-tag status-tag--${tones[status] ?? 'planned'}`}>{status}</span>;
}
