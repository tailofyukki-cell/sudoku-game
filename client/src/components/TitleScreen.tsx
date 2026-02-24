/**
 * TitleScreen Component
 * Design: 和モダン × ミニマリズム
 * - 和紙色ベース、墨色テキスト、朱色アクセント
 */
import { useState } from 'react';
import { Difficulty, formatTime, getBestTime, loadGame } from '@/lib/sudoku';

interface TitleScreenProps {
  difficulty: Difficulty;
  onSetDifficulty: (d: Difficulty) => void;
  onStart: (difficulty: Difficulty, resume?: boolean) => void;
}

const DIFFICULTIES: { value: Difficulty; label: string; desc: string; empty: string }[] = [
  { value: 'easy',   label: 'Easy',   desc: '初心者向け',   empty: '30〜36マス空' },
  { value: 'normal', label: 'Normal', desc: '標準的な難易度', empty: '40〜46マス空' },
  { value: 'hard',   label: 'Hard',   desc: '上級者向け',   empty: '50〜56マス空' },
];

export default function TitleScreen({ difficulty, onSetDifficulty, onStart }: TitleScreenProps) {
  const [showRules, setShowRules] = useState(false);
  const savedGame = loadGame();
  const hasSaved = savedGame !== null && savedGame.difficulty === difficulty;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-8"
      style={{ background: 'var(--sudoku-bg)' }}
    >
      {/* タイトル */}
      <div className="text-center mb-10 slide-down">
        <div
          className="text-6xl font-bold mb-2 tracking-widest"
          style={{
            fontFamily: "'Noto Serif JP', serif",
            color: 'var(--sudoku-fixed)',
            letterSpacing: '0.15em',
          }}
        >
          数独
        </div>
        <div
          className="text-lg tracking-[0.3em] uppercase"
          style={{
            fontFamily: "'Roboto Mono', monospace",
            color: 'var(--sudoku-grid-border)',
            letterSpacing: '0.35em',
          }}
        >
          SUDOKU
        </div>
        <div
          className="mt-3 w-16 h-0.5 mx-auto"
          style={{ background: 'var(--sudoku-block-border)' }}
        />
      </div>

      {/* 難易度選択 */}
      <div className="w-full max-w-sm mb-8 fade-in-up" style={{ animationDelay: '0.1s' }}>
        <div
          className="text-xs font-semibold tracking-widest uppercase mb-3 text-center"
          style={{ color: 'var(--sudoku-grid-border)', fontFamily: "'Noto Sans JP', sans-serif" }}
        >
          難易度を選択
        </div>
        <div className="flex flex-col gap-2">
          {DIFFICULTIES.map((d) => {
            const best = getBestTime(d.value);
            const isSelected = difficulty === d.value;
            return (
              <button
                key={d.value}
                onClick={() => onSetDifficulty(d.value)}
                className="w-full flex items-center justify-between px-5 py-3.5 rounded-lg transition-all duration-150"
                style={{
                  background: isSelected ? '#FDFAF5' : 'transparent',
                  border: isSelected
                    ? '2px solid var(--sudoku-block-border)'
                    : '2px solid var(--sudoku-cell-border)',
                  boxShadow: isSelected ? '0 2px 12px rgba(92,74,50,0.12)' : 'none',
                }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`difficulty-badge difficulty-${d.value}`}
                    style={{ fontFamily: "'Roboto Mono', monospace" }}
                  >
                    {d.label}
                  </span>
                  <div className="text-left">
                    <div
                      className="text-sm font-medium"
                      style={{ color: 'var(--sudoku-fixed)', fontFamily: "'Noto Sans JP', sans-serif" }}
                    >
                      {d.desc}
                    </div>
                    <div
                      className="text-xs"
                      style={{ color: 'var(--sudoku-grid-border)', fontFamily: "'Noto Sans JP', sans-serif" }}
                    >
                      {d.empty}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  {best !== null ? (
                    <div>
                      <div className="text-xs" style={{ color: 'var(--sudoku-grid-border)' }}>ベスト</div>
                      <div
                        className="text-sm font-semibold"
                        style={{ fontFamily: "'Roboto Mono', monospace", color: 'var(--sudoku-input)' }}
                      >
                        {formatTime(best)}
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs" style={{ color: 'var(--sudoku-cell-border)' }}>—</div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ボタン */}
      <div className="w-full max-w-sm flex flex-col gap-3 fade-in-up" style={{ animationDelay: '0.2s' }}>
        <button
          onClick={() => onStart(difficulty)}
          className="w-full py-4 rounded-lg font-semibold text-lg tracking-wider transition-all duration-150 hover:opacity-90 active:scale-95"
          style={{
            background: 'var(--sudoku-block-border)',
            color: '#FDFAF5',
            fontFamily: "'Noto Sans JP', sans-serif",
            boxShadow: '0 4px 16px rgba(92,74,50,0.25)',
          }}
        >
          新しいゲームを開始
        </button>

        {hasSaved && (
          <button
            onClick={() => onStart(difficulty, true)}
            className="w-full py-3.5 rounded-lg font-medium text-base tracking-wide transition-all duration-150 hover:opacity-80 active:scale-95"
            style={{
              background: 'transparent',
              border: '2px solid var(--sudoku-input)',
              color: 'var(--sudoku-input)',
              fontFamily: "'Noto Sans JP', sans-serif",
            }}
          >
            続きから再開 ({savedGame ? formatTime(savedGame.elapsed) : ''})
          </button>
        )}

        <button
          onClick={() => setShowRules(!showRules)}
          className="w-full py-2.5 text-sm transition-all duration-150 hover:opacity-70"
          style={{
            color: 'var(--sudoku-grid-border)',
            fontFamily: "'Noto Sans JP', sans-serif",
            background: 'transparent',
            border: 'none',
          }}
        >
          {showRules ? '▲ ルールを閉じる' : '▼ ルールを見る'}
        </button>
      </div>

      {/* ルール説明 */}
      {showRules && (
        <div
          className="w-full max-w-sm mt-4 p-5 rounded-lg fade-in-up"
          style={{
            background: '#FDFAF5',
            border: '1px solid var(--sudoku-cell-border)',
            boxShadow: '0 2px 12px rgba(92,74,50,0.08)',
          }}
        >
          <h3
            className="font-bold text-base mb-3"
            style={{ fontFamily: "'Noto Serif JP', serif", color: 'var(--sudoku-fixed)' }}
          >
            ルール
          </h3>
          <ul
            className="text-sm space-y-2"
            style={{ color: 'var(--sudoku-fixed)', fontFamily: "'Noto Sans JP', sans-serif", lineHeight: 1.8 }}
          >
            <li>• 9×9のグリッドを1〜9の数字で埋める</li>
            <li>• 各行に1〜9が一度ずつ入る</li>
            <li>• 各列に1〜9が一度ずつ入る</li>
            <li>• 各3×3ブロックに1〜9が一度ずつ入る</li>
          </ul>
          <h3
            className="font-bold text-base mt-4 mb-2"
            style={{ fontFamily: "'Noto Serif JP', serif", color: 'var(--sudoku-fixed)' }}
          >
            操作方法
          </h3>
          <ul
            className="text-sm space-y-1.5"
            style={{ color: 'var(--sudoku-fixed)', fontFamily: "'Noto Sans JP', sans-serif", lineHeight: 1.8 }}
          >
            <li>• セルをクリック → 数字ボタンで入力</li>
            <li>• キーボード 1〜9 で入力、Delete/0 で削除</li>
            <li>• 矢印キーでセル移動</li>
            <li>• Ctrl+Z でUndo</li>
          </ul>
        </div>
      )}

      {/* フッター */}
      <div
        className="mt-10 text-xs text-center"
        style={{ color: 'var(--sudoku-cell-border)', fontFamily: "'Noto Sans JP', sans-serif" }}
      >
        MIT License · Open Source
      </div>
    </div>
  );
}
