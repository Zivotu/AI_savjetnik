import { useRef, useEffect } from 'react';

interface Props {
  value: string;
  onChange: (val: string) => void;
}

const RichTextEditor = ({ value, onChange }: Props) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value;
    }
  }, [value]);

  const exec = (command: string, arg?: string) => {
    document.execCommand(command, false, arg);
    onChange(ref.current?.innerHTML || '');
  };

  return (
    <div>
      <div className="flex gap-2 mb-2">
        <button type="button" className="px-2 py-1 border rounded" onClick={() => exec('bold')}>B</button>
        <button type="button" className="px-2 py-1 border rounded" onClick={() => exec('italic')}>I</button>
        <button type="button" className="px-2 py-1 border rounded" onClick={() => exec('underline')}>U</button>
        <button type="button" className="px-2 py-1 border rounded" onClick={() => exec('formatBlock','H2')}>H2</button>
        <input type="color" onChange={e => exec('foreColor', e.target.value)} />
      </div>
      <div
        ref={ref}
        className="border rounded p-2 min-h-[150px] bg-white"
        contentEditable
        onInput={() => onChange(ref.current?.innerHTML || '')}
      />
    </div>
  );
};

export default RichTextEditor;
