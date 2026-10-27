import { useState } from 'react';

/**
 * Аватар с автономным fallback: если src нет или не загрузился (в т.ч.
 * внешние сервисы вроде dicebear, недоступные из некоторых сетей, и
 * отсутствующие локальные файлы) — рисуем инициалы на детерминированном
 * градиенте. Никаких внешних зависимостей, битых иконок быть не должно.
 */
export default function Avatar({
  name,
  src,
  size = 40,
}: {
  name?: string;
  src?: string | null;
  size?: number;
}) {
  const [failed, setFailed] = useState(false);

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={name || ''}
        onError={() => setFailed(true)}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
      />
    );
  }

  const initials =
    (name || '?')
      .trim()
      .split(/\s+/)
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || '?';

  let hue = 0;
  const seed = name || '?';
  for (let i = 0; i < seed.length; i++) {
    hue = (hue * 31 + seed.charCodeAt(i)) % 360;
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: `linear-gradient(135deg, hsl(${hue}, 40%, 38%), hsl(${(hue + 50) % 360}, 40%, 26%))`,
        color: '#F5F5F0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: Math.round(size * 0.36),
        fontWeight: 600,
        flexShrink: 0,
        userSelect: 'none',
      }}
    >
      {initials}
    </div>
  );
}
