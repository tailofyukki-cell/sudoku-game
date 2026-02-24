/**
 * GameScreen Component
 * Design: 和モダン × ミニマリズム
 * - グリッドと操作パネルのレイアウト
 * - キーボード操作対応
 */
import { useEffect, useCallback } from 'react';
import { SudokuState } from '@/hooks/useSudoku';
import SudokuGrid from './SudokuGrid';
import GameControls from './GameControls';

interface GameScreenProps {
  state: SudokuState;
  onSelectCell: (row: number, col: number) => void;
  onInputNumber: (n: number) => void;
  onDelete: () => void;
  onUndo: () => void;
  onHint: () => void;
  onToggleMemo: () => void;
  onRestart: () => void;
  onGoTitle: () => void;
}

export default function GameScreen({
  state,
  onSelectCell,
  onInputNumber,
  onDelete,
  onUndo,
  onHint,
  onToggleMemo,
  onRestart,
  onGoTitle,
}: GameScreenProps) {
  // キーボード操作
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // 数字入力
    if (e.key >= '1' && e.key <= '9') {
      e.preventDefault();
      onInputNumber(parseInt(e.key));
      return;
    }
    // 削除
    if (e.key === 'Delete' || e.key === 'Backspace' || e.key === '0') {
      e.preventDefault();
      onDelete();
      return;
    }
    // Undo
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
      e.preventDefault();
      onUndo();
      return;
    }
    // メモモード切替
    if (e.key === 'm' || e.key === 'M') {
      e.preventDefault();
      onToggleMemo();
      return;
    }
    // 矢印キーでセル移動
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
      if (!state.selectedCell) {
        onSelectCell(0, 0);
        return;
      }
      const [row, col] = state.selectedCell;
      let newRow = row;
      let newCol = col;
      if (e.key === 'ArrowUp') newRow = Math.max(0, row - 1);
      if (e.key === 'ArrowDown') newRow = Math.min(8, row + 1);
      if (e.key === 'ArrowLeft') newCol = Math.max(0, col - 1);
      if (e.key === 'ArrowRight') newCol = Math.min(8, col + 1);
      onSelectCell(newRow, newCol);
      return;
    }
    // Tab/Shift+Tabでセル移動
    if (e.key === 'Tab') {
      e.preventDefault();
      if (!state.selectedCell) {
        onSelectCell(0, 0);
        return;
      }
      const [row, col] = state.selectedCell;
      const idx = row * 9 + col;
      const nextIdx = e.shiftKey ? (idx - 1 + 81) % 81 : (idx + 1) % 81;
      onSelectCell(Math.floor(nextIdx / 9), nextIdx % 9);
      return;
    }
  }, [state.selectedCell, onInputNumber, onDelete, onUndo, onToggleMemo, onSelectCell]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'var(--sudoku-bg)' }}
    >
      {/* ヘッダー */}
      <header
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: '1px solid var(--sudoku-cell-border)' }}
      >
        <button
          onClick={onGoTitle}
          className="flex items-center gap-1.5 text-sm transition-opacity hover:opacity-70"
          style={{ color: 'var(--sudoku-grid-border)', fontFamily: "'Noto Sans JP', sans-serif" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          戻る
        </button>
        <div
          className="text-xl font-bold tracking-widest"
          style={{ fontFamily: "'Noto Serif JP', serif", color: 'var(--sudoku-fixed)' }}
        >
          数独
        </div>
        <div style={{ width: '48px' }} /> {/* バランス用 */}
      </header>

      {/* メインコンテンツ */}
      <main className="flex-1 flex flex-col items-center justify-start px-3 py-4 gap-4 overflow-auto">
        {/* グリッド */}
        <div className="w-full" style={{ maxWidth: '500px' }}>
          <SudokuGrid
            puzzle={state.puzzle}
            userBoard={state.userBoard}
            memoBoard={state.memoBoard}
            selectedCell={state.selectedCell}
            errors={state.errors}
            onSelectCell={onSelectCell}
          />
        </div>

        {/* コントロール */}
        <div className="w-full" style={{ maxWidth: '500px' }}>
          <GameControls
            difficulty={state.difficulty}
            elapsed={state.elapsed}
            mistakes={state.mistakes}
            hintsUsed={state.hintsUsed}
            isMemoMode={state.isMemoMode}
            canUndo={state.history.length > 0}
            bestTime={state.bestTime}
            onInputNumber={onInputNumber}
            onDelete={onDelete}
            onUndo={onUndo}
            onHint={onHint}
            onToggleMemo={onToggleMemo}
            onRestart={onRestart}
            onGoTitle={onGoTitle}
          />
        </div>

        {/* キーボードヒント（デスクトップのみ） */}
        <div
          className="hidden md:block text-xs text-center pb-4"
          style={{ color: 'var(--sudoku-cell-border)', fontFamily: "'Noto Sans JP', sans-serif" }}
        >
          矢印キー: 移動 &nbsp;|&nbsp; 1〜9: 入力 &nbsp;|&nbsp; Delete: 削除 &nbsp;|&nbsp; M: メモ &nbsp;|&nbsp; Ctrl+Z: Undo
        </div>
      </main>
    </div>
  );
}
