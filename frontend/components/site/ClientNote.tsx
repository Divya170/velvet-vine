/** Dashed "Client to supply / confirm" note from the design. Rendered only while the admin leaves a note on the record. */
export function ClientNote({ note, tag = 'Client to supply', style }: { note?: string | null; tag?: string; style?: React.CSSProperties }) {
  if (!note) return null;
  return (
    <div className="todo" style={style}>
      <span className="todo-tag">{tag}</span>
      {note}
    </div>
  );
}
