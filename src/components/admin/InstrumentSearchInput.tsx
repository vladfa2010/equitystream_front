import { useState, useEffect, useRef, useCallback } from 'react';
import { marketDataApi, INSTRUMENT_TYPE_LABELS, micToExchange } from '@/api';
import type { InstrumentMatch, InstrumentExchange } from '@/api';

/**
 * ТЗ-199 §3.5: поле выбора инструмента Finam (тикер/название/ISIN).
 * Строка: ТИКЕР — название, мелким ISIN, бейдж типа, справа MIC · биржа.
 * Enter — первый результат, Escape — закрыть, blur — закрыть с задержкой
 * 150 мс (чтобы сработал клик). Свободный текст допустим: маркет-данных
 * по нему не будет (finamSymbol: null).
 */

export interface InstrumentSelection {
  ticker: string;
  finamSymbol: string | null;
  isin: string | null;
  /** MIC→биржа-алиас (MISX→MOEX и т.п.); null — не менять exchange */
  exchange: string | null;
}

interface Props {
  value: string;
  selection: { finamSymbol?: string | null; isin?: string | null };
  onChange: (sel: InstrumentSelection) => void;
  disabled?: boolean;
  inputStyle: React.CSSProperties;
  inputFocusHandlers: {
    onFocus: (e: React.FocusEvent<HTMLInputElement>) => void;
    onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  };
}

const DEBOUNCE_MS = 300;
const BLUR_CLOSE_MS = 150;

export default function InstrumentSearchInput({
  value,
  selection,
  onChange,
  disabled,
  inputStyle,
  inputFocusHandlers,
}: Props) {
  const [text, setText] = useState(value);
  const [matches, setMatches] = useState<InstrumentMatch[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [exchangesReady, setExchangesReady] = useState(false);
  const [exchanges, setExchanges] = useState<InstrumentExchange[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const blurRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // При маунте — список бирж; пока не загружен — инпут disabled (ТЗ-199 §3.5)
  useEffect(() => {
    marketDataApi
      .exchanges()
      .then((r) => {
        setExchanges(r.exchanges || []);
        setExchangesReady(true);
      })
      .catch(() => setExchangesReady(true)); // не блокируем ввод при сбое
  }, []);

  useEffect(() => {
    setText(value);
  }, [value]);

  const exchangeName = useCallback(
    (mic: string) => exchanges.find((e) => e.mic === mic)?.name || mic,
    [exchanges],
  );

  const runSearch = useCallback((q: string) => {
    if (q.trim().length < 2) {
      setMatches([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    marketDataApi
      .search(q)
      .then((r) => {
        setMatches(r.matches || []);
        setOpen(true);
      })
      .catch(() => {
        setMatches([]);
        setOpen(true);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleInput = (raw: string) => {
    const upper = raw.toUpperCase();
    setText(upper);
    // свободный текст: снимаем привязку к инструменту (ТЗ-199 §3.6)
    onChange({ ticker: upper, finamSymbol: null, isin: null, exchange: null });
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(upper), DEBOUNCE_MS);
  };

  const pick = (m: InstrumentMatch) => {
    setText(m.ticker);
    setOpen(false);
    onChange({
      ticker: m.ticker,
      finamSymbol: m.symbol,
      isin: m.isin,
      exchange: micToExchange(m.mic),
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && open && matches.length > 0) {
      e.preventDefault();
      pick(matches[0]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div className="relative col-span-1">
      <label className="text-xs mb-1 block" style={{ color: '#8A8A93' }}>
        Ticker *
      </label>
      <input
        type="text"
        value={text}
        disabled={disabled || !exchangesReady}
        onChange={(e) => handleInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (matches.length > 0) setOpen(true);
        }}
        onBlur={(e) => {
          inputFocusHandlers.onBlur(e as any);
          blurRef.current = setTimeout(() => setOpen(false), BLUR_CLOSE_MS);
        }}
        placeholder={exchangesReady ? 'Тикер / название / ISIN…' : 'Загружаем справочник бирж…'}
        style={{ ...inputStyle, textTransform: 'uppercase' }}
        onFocusCapture={inputFocusHandlers.onFocus as any}
        autoComplete="off"
      />
      {/* метка привязанного инструмента */}
      {selection.finamSymbol && (
        <p className="text-[10px] mt-1" style={{ color: '#10B981' }}>
          ✓ {selection.finamSymbol}
          {selection.isin ? ` · ISIN ${selection.isin}` : ''} — маркет-данные по Finam
        </p>
      )}

      {open && (
        <div
          className="absolute z-50 left-0 right-0 mt-1 rounded-xl overflow-hidden"
          style={{
            background: 'rgba(20,20,28,0.98)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
            maxHeight: 280,
            overflowY: 'auto',
          }}
        >
          {loading && (
            <p className="px-3 py-2 text-xs" style={{ color: '#8A8A93' }}>Поиск…</p>
          )}
          {!loading && matches.length === 0 && (
            <p className="px-3 py-2 text-xs" style={{ color: '#8A8A93' }}>
              В справочнике Finam не найдено — можно сохранить как есть, маркет-данных не будет.
              Индексы в справочнике отсутствуют — это нормально.
            </p>
          )}
          {!loading &&
            matches.map((m, i) => (
              <button
                key={`${m.symbol}-${i}`}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault(); // не даём blur закрыть список раньше клика
                  if (blurRef.current) clearTimeout(blurRef.current);
                  pick(m);
                }}
                className="w-full text-left px-3 py-2 transition-colors hover:bg-white/5"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[13px] font-semibold" style={{ color: '#F5F5F0' }}>
                      {m.ticker}
                    </span>
                    <span className="text-[12px] ml-2 truncate" style={{ color: '#8A8A93' }}>
                      — {m.name}
                    </span>
                    {m.isin && (
                      <span className="block text-[10px]" style={{ color: '#55555E' }}>
                        {m.isin}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className="px-1.5 py-0.5 rounded text-[10px] font-medium"
                      style={{ background: 'rgba(184,161,78,0.12)', color: '#B8A14E' }}
                    >
                      {INSTRUMENT_TYPE_LABELS[m.type] || m.type}
                    </span>
                    <span className="text-[10px]" style={{ color: '#55555E' }}>
                      {m.mic} · {exchangeName(m.mic)}
                    </span>
                  </div>
                </div>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
