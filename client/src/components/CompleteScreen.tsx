/**
 * CompleteScreen Component
 * Design: 和モダン × ミニマリズム
 * - クリア祝福画面、タイム・ミス数・ヒント数表示
 */
import { useEffect, useRef } from 'react';
import { Difficulty, formatTime, getBestTime } from '@/lib/sudoku';

interface CompleteScreenProps {
  difficulty: Difficulty;
  elapsed: number;
  mistakes: number;
  hintsUsed: number;
  onReplay: () => void;
  onNewGame: () => void;
  onGoTitle: () => void;
}

export default function CompleteScreen({
  difficulty,
  elapsed,
  mistakes,
  hintsUsed,
  onReplay,
  onNewGame,
  onGoTitle,
}: CompleteScreenProps) {
  const bestTime = getBestTime(difficulty);
  const isNewBest = bestTime !== null && bestTime === elapsed;
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 完成アニメーション
    if (containerRef.current) {
      containerRef.current.style.animation = 'fadeInUp 0.5s ease forwards';
    }
  }, []);

  const diffLabel = { easy: 'Easy', normal: 'Normal', hard: 'Hard' }[difficulty];
  const diffClass = `difficulty-badge difficulty-${difficulty}`;

  // スコア評価
  function getRating() {
    const penaltyMistakes = mistakes * 30;
    const penaltyHints = hintsUsed * 60;
    const totalPenalty = penaltyMistakes + penaltyHints;
    const baseScore = elapsed + totalPenalty;
    const thresholds = {
      easy:   [120, 240, 360],
      normal: [240, 480, 720],
      hard:   [480, 960, 1440],
    };
    const [s, a, b] = thresholds[difficulty];
    if (baseScore <= s) return { stars: 3, label: '完璧！' };
    if (baseScore <= a) return { stars: 2, label: '素晴らしい！' };
    if (baseScore <= b) return { stars: 1, label: 'クリア！' };
    return { stars: 1, label: 'クリア！' };
  }

  const rating = getRating();

  return (
    <div
      ref={containerRef}
      className="min-h-screen flex flex-col items-center justify-center px-4 py-8"
      style={{ background: 'var(--sudoku-bg)' }}
    >
      {/* 完成マーク */}
      <div className="text-center mb-8 fade-in-up">
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{
            background: 'linear-gradient(135deg, #D4AF37 0%, #F0D060 50%, #D4AF37 100%)',
            boxShadow: '0 8px 32px rgba(212,175,55,0.4)',
            animation: 'completePulse 1s ease 0.3s',
          }}
        >
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        {/* 星評価 */}
        <div className="flex justify-center gap-2 mb-3">
          {[1, 2, 3].map((star) => (
            <svg
              key={star}
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill={star <= rating.stars ? '#D4AF37' : 'none'}
              stroke={star <= rating.stars ? '#D4AF37' : 'var(--sudoku-cell-border)'}
              strokeWidth="2"
              style={{
                transition: 'all 0.3s ease',
                animationDelay: `${0.4 + star * 0.1}s`,
              }}
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          ))}
        </div>

        <div
          className="text-3xl font-bold mb-1"
          style={{ fontFamily: "'Noto Serif JP', serif", color: 'var(--sudoku-fixed)' }}
        >
          {rating.label}
        </div>
        <span className={diffClass}>{diffLabel}</span>
      </div>

      {/* スタッツ */}
      <div
        className="w-full max-w-xs rounded-xl p-6 mb-8 fade-in-up"
        style={{
          background: '#FDFAF5',
          border: '1px solid var(--sudoku-cell-border)',
          boxShadow: '0 4px 20px rgba(92,74,50,0.1)',
          animationDelay: '0.2s',
        }}
      >
        <div className="space-y-4">
          {/* タイム */}
          <div className="flex items-center justify-between">
            <span
              style={{ color: 'var(--sudoku-grid-border)', fontFamily: "'Noto Sans JP', sans-serif", fontSize: '14px' }}
            >
              クリアタイム
            </span>
            <div className="text-right">
              <div
                className="text-2xl font-bold"
                style={{ fontFamily: "'Roboto Mono', monospace", color: 'var(--sudoku-fixed)' }}
              >
                {formatTime(elapsed)}
              </div>
              {isNewBest && (
                <div
                  className="text-xs font-semibold"
                  style={{ color: '#D4AF37', fontFamily: "'Noto Sans JP', sans-serif" }}
                >
                  ★ ベストタイム更新！
                </div>
              )}
              {!isNewBest && bestTime !== null && (
                <div
                  className="text-xs"
                  style={{ color: 'var(--sudoku-grid-border)', fontFamily: "'Noto Sans JP', sans-serif" }}
                >
                  ベスト: {formatTime(bestTime)}
                </div>
              )}
            </div>
          </div>

          <div style={{ height: '1px', background: 'var(--sudoku-cell-border)' }} />

          {/* ミス数 */}
          <div className="flex items-center justify-between">
            <span
              style={{ color: 'var(--sudoku-grid-border)', fontFamily: "'Noto Sans JP', sans-serif", fontSize: '14px' }}
            >
              ミス数
            </span>
            <span
              style={{
                fontFamily: "'Roboto Mono', monospace",
                fontSize: '18px',
                fontWeight: 600,
                color: mistakes > 0 ? 'var(--sudoku-error)' : 'var(--sudoku-hint)',
              }}
            >
              {mistakes}回
            </span>
          </div>

          {/* ヒント使用数 */}
          <div className="flex items-center justify-between">
            <span
              style={{ color: 'var(--sudoku-grid-border)', fontFamily: "'Noto Sans JP', sans-serif", fontSize: '14px' }}
            >
              ヒント使用
            </span>
            <span
              style={{
                fontFamily: "'Roboto Mono', monospace",
                fontSize: '18px',
                fontWeight: 600,
                color: hintsUsed > 0 ? 'var(--sudoku-grid-border)' : 'var(--sudoku-hint)',
              }}
            >
              {hintsUsed}回
            </span>
          </div>
        </div>
      </div>

      {/* ボタン */}
      <div className="w-full max-w-xs flex flex-col gap-3 fade-in-up" style={{ animationDelay: '0.3s' }}>
        <button
          onClick={onNewGame}
          className="w-full py-4 rounded-lg font-semibold text-base tracking-wide transition-all duration-150 hover:opacity-90 active:scale-95"
          style={{
            background: 'var(--sudoku-block-border)',
            color: '#FDFAF5',
            fontFamily: "'Noto Sans JP', sans-serif",
            boxShadow: '0 4px 16px rgba(92,74,50,0.25)',
          }}
        >
          新しいゲーム
        </button>
        <button
          onClick={onReplay}
          className="w-full py-3.5 rounded-lg font-medium text-sm tracking-wide transition-all duration-150 hover:opacity-80"
          style={{
            background: 'transparent',
            border: '2px solid var(--sudoku-cell-border)',
            color: 'var(--sudoku-grid-border)',
            fontFamily: "'Noto Sans JP', sans-serif",
          }}
        >
          同じ難易度でもう一度
        </button>
        <button
          onClick={onGoTitle}
          className="w-full py-2.5 text-sm transition-all duration-150 hover:opacity-70"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--sudoku-grid-border)',
            fontFamily: "'Noto Sans JP', sans-serif",
          }}
        >
          タイトルへ戻る
        </button>
      </div>
    </div>
  );
}
