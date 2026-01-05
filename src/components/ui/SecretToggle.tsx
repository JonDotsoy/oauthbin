import { useState } from 'react';

interface SecretToggleProps {
  value: string;
}

export default function SecretToggle({ value }: SecretToggleProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-sm">
        {isVisible ? value : '•'.repeat(Math.min(value.length, 32))}
      </span>
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="text-lg hover:opacity-70 transition-opacity"
        aria-label={isVisible ? 'Ocultar secreto' : 'Mostrar secreto'}
      >
        {isVisible ? '🙈' : '👁️'}
      </button>
    </div>
  );
}
