/**
 * GameControls Component
 * Design: 和モダン × ミニマリズム
 * - 数字入力パネル、ヒント・Undo・メモ・リスタートボタン
 */
import { Difficulty, formatTime } from '@/lib/sudoku';

interface GameControlsProps {
  difficulty: Difficulty;
  elapsed: number;
  mistakes: number;
  hintsUsed: number;
  isMemoMode: boolean;
  canUndo: boolean;
  bestTime: number | null;
  onInputNumber: (n: number) => void;
  onDelete: () => void;
  onUndo: () => void;
  onHint: () => void;
  onToggleMemo: () => void;
  onRestart: () => void;
  onGoTitle: () => void;
}

export default function GameControls({
  difficulty,
  elapsed,
  mistakes,
  hintsUsed,
  isMemoMode,
  canUndo,
  bestTime,
  onInputNumber,
  onDelete,
  onUndo,
  onHint,
  onToggleMemo,
  onRestart,
  onGoTitle,
}: GameControlsProps) {
  const diffLabel = { easy: 'Easy', normal: 'Normal', hard: 'Hard' }[difficulty];
  const diffClass = `difficulty-badge difficulty-${difficulty}`;

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* ヘッダー情報 */}
      <div className="flex items-center justify-between">
        <span className={diffClass}>{diffLabel}</span>
        <div className="flex items-center gap-4">
          {/* ミス数 */}
          <div className="flex items-center gap-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: i < mistakes ? 'var(--sudoku-error)' : 'var(--sudoku-cell-border)',
                  transition: 'background 0.2s ease',
                }}
              />
            ))}
            {mistakes > 3 && (
              <span
                style={{
                  fontFamily: "'Roboto Mono', monospace",
                  fontSize: '11px',
                  color: 'var(--sudoku-error)',
                }}
              >
                +{mistakes - 3}
              </span>
            )}
            <span
              style={{
                fontSize: '11px',
                color: 'var(--sudoku-grid-border)',
                fontFamily: "'Noto Sans JP', sans-serif",
                marginLeft: '2px',
              }}
            >
              ミス
            </span>
          </div>
          {/* タイマー */}
          <div className="timer-display">{formatTime(elapsed)}</div>
        </div>
      </div>

      {/* ベストタイム */}
      {bestTime !== null && (
        <div
          className="text-right text-xs"
          style={{ color: 'var(--sudoku-grid-border)', fontFamily: "'Noto Sans JP', sans-serif" }}
        >
          ベスト: <span style={{ fontFamily: "'Roboto Mono', monospace" }}>{formatTime(bestTime)}</span>
        </div>
      )}

      {/* 数字入力パネル */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(9, 1fr)',
          gap: '4px',
        }}
      >
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <button
            key={n}
            className="number-btn"
            onClick={() => onInputNumber(n)}
            aria-label={`${n}を入力`}
          >
            {n}
          </button>
        ))}
      </div>

      {/* アクションボタン */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
        {/* Undo */}
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="flex flex-col items-center gap-1 py-2.5 rounded-lg transition-all duration-150"
          style={{
            background: canUndo ? '#FDFAF5' : 'transparent',
            border: `1.5px solid ${canUndo ? 'var(--sudoku-cell-border)' : 'var(--sudoku-cell-border)'}`,
            color: canUndo ? 'var(--sudoku-fixed)' : 'var(--sudoku-cell-border)',
            opacity: canUndo ? 1 : 0.5,
          }}
          aria-label="1手戻す"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 7v6h6" />
            <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
          </svg>
          <span style={{ fontSize: '10px', fontFamily: "'Noto Sans JP', sans-serif" }}>Undo</span>
        </button>

        {/* メモ */}
        <button
          onClick={onToggleMemo}
          className="flex flex-col items-center gap-1 py-2.5 rounded-lg transition-all duration-150"
          style={{
            background: isMemoMode ? 'var(--sudoku-input)' : '#FDFAF5',
            border: `1.5px solid ${isMemoMode ? 'var(--sudoku-input)' : 'var(--sudoku-cell-border)'}`,
            color: isMemoMode ? 'white' : 'var(--sudoku-fixed)',
          }}
          aria-label={isMemoMode ? 'メモモードON' : 'メモモードOFF'}
          aria-pressed={isMemoMode}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
          <span style={{ fontSize: '10px', fontFamily: "'Noto Sans JP', sans-serif" }}>メモ</span>
        </button>

        {/* ヒント */}
        <button
          onClick={onHint}
          className="flex flex-col items-center gap-1 py-2.5 rounded-lg transition-all duration-150"
          style={{
            background: '#FDFAF5',
            border: '1.5px solid var(--sudoku-cell-border)',
            color: 'var(--sudoku-fixed)',
          }}
          aria-label={`ヒントを使う（使用済み: ${hintsUsed}回）`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <span style={{ fontSize: '10px', fontFamily: "'Noto Sans JP', sans-serif" }}>
            ヒント{hintsUsed > 0 ? `(${hintsUsed})` : ''}
          </span>
        </button>

        {/* 削除 */}
        <button
          onClick={onDelete}
          className="flex flex-col items-center gap-1 py-2.5 rounded-lg transition-all duration-150"
          style={{
            background: '#FDFAF5',
            border: '1.5px solid var(--sudoku-cell-border)',
            color: 'var(--sudoku-fixed)',
          }}
          aria-label="削除"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
            <line x1="18" y1="9" x2="12" y2="15" />
            <line x1="12" y1="9" x2="18" y2="15" />
          </svg>
          <span style={{ fontSize: '10px', fontFamily: "'Noto Sans JP', sans-serif" }}>削除</span>
        </button>
      </div>

      {/* リスタート・タイトルへ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
        <button
          onClick={onRestart}
          className="py-2.5 rounded-lg text-sm font-medium transition-all duration-150 hover:opacity-80"
          style={{
            background: 'transparent',
            border: '1.5px solid var(--sudoku-cell-border)',
            color: 'var(--sudoku-grid-border)',
            fontFamily: "'Noto Sans JP', sans-serif",
          }}
        >
          リスタート
        </button>
        <button
          onClick={onGoTitle}
          className="py-2.5 rounded-lg text-sm font-medium transition-all duration-150 hover:opacity-80"
          style={{
            background: 'transparent',
            border: '1.5px solid var(--sudoku-cell-border)',
            color: 'var(--sudoku-grid-border)',
            fontFamily: "'Noto Sans JP', sans-serif",
          }}
        >
          タイトルへ
        </button>
      </div>
    </div>
  );
}
