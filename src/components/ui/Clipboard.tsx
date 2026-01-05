import { useState, type ReactNode } from 'react';

interface ClipboardProps {
  value: string;
  children?: ReactNode;
}

export default function Clipboard({ value, children }: ClipboardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  return (
    <div
      onClick={handleCopy}
      className="cursor-pointer hover:opacity-70 transition-opacity"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleCopy()}
      aria-label="Copiar al portapapeles"
    >
      {children}
    </div>
  );
}
