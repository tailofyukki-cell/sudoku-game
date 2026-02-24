/**
 * SudokuGrid Component
 * Design: 和モダン × ミニマリズム
 * - 3×3ブロック境界を太く、セル境界を細く
 * - 選択・関連・エラーの視覚的フィードバック
 */
import { useEffect, useRef } from 'react';
import { Board } from '@/lib/sudoku';

interface SudokuGridProps {
  puzzle: Board;
  userBoard: Board;
  memoBoard: (number[] | null)[][];
  selectedCell: [number, number] | null;
  errors: Set<string>;
  onSelectCell: (row: number, col: number) => void;
}

export default function SudokuGrid({
  puzzle,
  userBoard,
  memoBoard,
  selectedCell,
  errors,
  onSelectCell,
}: SudokuGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);

  // セルの状態を計算
  function getCellState(row: number, col: number) {
    const isFixed = puzzle[row][col] !== null;
    const isSelected = selectedCell?.[0] === row && selectedCell?.[1] === col;
    const isError = errors.has(`${row},${col}`);
    const value = userBoard[row][col];
    const memo = memoBoard[row][col];

    let isRelated = false;
    let isSameNumber = false;

    if (selectedCell) {
      const [sr, sc] = selectedCell;
      const selectedVal = userBoard[sr][sc];
      const sameRow = row === sr;
      const sameCol = col === sc;
      const sameBlock =
        Math.floor(row / 3) === Math.floor(sr / 3) &&
        Math.floor(col / 3) === Math.floor(sc / 3);
      isRelated = !isSelected && (sameRow || sameCol || sameBlock);
      isSameNumber =
        !isSelected &&
        selectedVal !== null &&
        value === selectedVal;
    }

    return { isFixed, isSelected, isError, isRelated, isSameNumber, value, memo };
  }

  // セルの背景色を決定
  function getCellBg(state: ReturnType<typeof getCellState>) {
    if (state.isSelected) return 'var(--sudoku-selected)';
    if (state.isError) return 'var(--sudoku-error-bg)';
    if (state.isSameNumber) return 'var(--sudoku-same-number)';
    if (state.isRelated) return 'var(--sudoku-related)';
    return '#FDFAF5';
  }

  // セルの数字色を決定
  function getCellColor(state: ReturnType<typeof getCellState>) {
    if (state.isError) return 'var(--sudoku-error)';
    if (state.isFixed) return 'var(--sudoku-fixed)';
    return 'var(--sudoku-input)';
  }

  // セルのボーダースタイル
  function getCellBorder(row: number, col: number) {
    const rightBold = col === 2 || col === 5;
    const bottomBold = row === 2 || row === 5;
    const rightNone = col === 8;
    const bottomNone = row === 8;

    return {
      borderRight: rightNone ? 'none' : rightBold ? '2.5px solid var(--sudoku-block-border)' : '1px solid var(--sudoku-cell-border)',
      borderBottom: bottomNone ? 'none' : bottomBold ? '2.5px solid var(--sudoku-block-border)' : '1px solid var(--sudoku-cell-border)',
      borderLeft: col === 0 ? 'none' : '1px solid var(--sudoku-cell-border)',
      borderTop: row === 0 ? 'none' : '1px solid var(--sudoku-cell-border)',
    };
  }

  return (
    <div
      ref={gridRef}
      className="sudoku-grid w-full"
      style={{
        maxWidth: 'min(100%, 500px)',
        margin: '0 auto',
        border: '3px solid var(--sudoku-block-border)',
        borderRadius: '4px',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(92,74,50,0.18)',
      }}
      role="grid"
      aria-label="数独グリッド"
    >
      {Array.from({ length: 9 }, (_, row) =>
        Array.from({ length: 9 }, (_, col) => {
          const state = getCellState(row, col);
          const borderStyle = getCellBorder(row, col);

          return (
            <div
              key={`${row}-${col}`}
              role="gridcell"
              aria-label={`行${row + 1}列${col + 1}: ${state.value ?? '空'}`}
              aria-selected={state.isSelected}
              data-row={row}
              data-col={col}
              onClick={() => onSelectCell(row, col)}
              style={{
                position: 'relative',
                aspectRatio: '1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: getCellBg(state),
                cursor: state.isFixed ? 'default' : 'pointer',
                transition: 'background-color 0.1s ease',
                ...borderStyle,
              }}
            >
              {state.value !== null ? (
                <span
                  style={{
                    fontFamily: "'Roboto Mono', monospace",
                    fontSize: 'clamp(14px, 3.8vw, 28px)',
                    fontWeight: state.isFixed ? 700 : 500,
                    color: getCellColor(state),
                    lineHeight: 1,
                    transition: 'color 0.1s ease',
                    userSelect: 'none',
                  }}
                >
                  {state.value}
                </span>
              ) : state.memo ? (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gridTemplateRows: 'repeat(3, 1fr)',
                    width: '100%',
                    height: '100%',
                    padding: '1px',
                    gap: 0,
                  }}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                    <div
                      key={n}
                      style={{
                        fontFamily: "'Roboto Mono', monospace",
                        fontSize: 'clamp(5px, 1.1vw, 8px)',
                        color: state.memo!.includes(n) ? 'var(--sudoku-memo)' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        lineHeight: 1,
                        userSelect: 'none',
                      }}
                    >
                      {n}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })
      )}
    </div>
  );
}
