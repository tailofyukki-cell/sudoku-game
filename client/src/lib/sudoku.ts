/**
 * Sudoku Core Logic
 * 盤面生成・検証・ソルバーのコアロジック
 */

export type Board = (number | null)[][];
export type Difficulty = 'easy' | 'normal' | 'hard';

// 難易度ごとの空マス数
const EMPTY_CELLS: Record<Difficulty, { min: number; max: number }> = {
  easy:   { min: 30, max: 36 },
  normal: { min: 40, max: 46 },
  hard:   { min: 50, max: 56 },
};

/** 配列をシャッフル（Fisher-Yates） */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** 空の9×9盤面を作成 */
function emptyBoard(): Board {
  return Array.from({ length: 9 }, () => Array(9).fill(null));
}

/** 指定セルに数字を置けるか検証 */
export function isValid(board: Board, row: number, col: number, num: number): boolean {
  // 行チェック
  for (let c = 0; c < 9; c++) {
    if (board[row][c] === num) return false;
  }
  // 列チェック
  for (let r = 0; r < 9; r++) {
    if (board[r][col] === num) return false;
  }
  // 3×3ブロックチェック
  const br = Math.floor(row / 3) * 3;
  const bc = Math.floor(col / 3) * 3;
  for (let r = br; r < br + 3; r++) {
    for (let c = bc; c < bc + 3; c++) {
      if (board[r][c] === num) return false;
    }
  }
  return true;
}

/** バックトラッキングで完成盤面を生成 */
function fillBoard(board: Board): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === null) {
        const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        for (const num of nums) {
          if (isValid(board, row, col, num)) {
            board[row][col] = num;
            if (fillBoard(board)) return true;
            board[row][col] = null;
          }
        }
        return false;
      }
    }
  }
  return true;
}

/** 解の数をカウント（最大2まで） */
function countSolutions(board: Board, limit = 2): number {
  let count = 0;
  function solve(b: Board): boolean {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (b[row][col] === null) {
          for (let num = 1; num <= 9; num++) {
            if (isValid(b, row, col, num)) {
              b[row][col] = num;
              if (solve(b)) {
                if (count >= limit) return true;
              }
              b[row][col] = null;
            }
          }
          return false;
        }
      }
    }
    count++;
    return count >= limit;
  }
  const copy = board.map(r => [...r]);
  solve(copy);
  return count;
}

/** 盤面をディープコピー */
export function copyBoard(board: Board): Board {
  return board.map(row => [...row]);
}

/** 完成盤面を生成 */
function generateSolution(): Board {
  const board = emptyBoard();
  fillBoard(board);
  return board;
}

/** ナンプレ問題を生成（ユニーク解保証） */
export function generatePuzzle(difficulty: Difficulty): {
  puzzle: Board;
  solution: Board;
} {
  const solution = generateSolution();
  const puzzle = copyBoard(solution);

  const { min, max } = EMPTY_CELLS[difficulty];
  const targetEmpty = min + Math.floor(Math.random() * (max - min + 1));

  const positions = shuffle(
    Array.from({ length: 81 }, (_, i) => [Math.floor(i / 9), i % 9] as [number, number])
  );

  let removed = 0;
  for (const [row, col] of positions) {
    if (removed >= targetEmpty) break;
    const backup = puzzle[row][col];
    puzzle[row][col] = null;
    // ユニーク解チェック
    if (countSolutions(puzzle) !== 1) {
      puzzle[row][col] = backup; // 元に戻す
    } else {
      removed++;
    }
  }

  return { puzzle, solution };
}

/** 盤面の検証エラーを返す（エラーのある [row, col] セットを返す） */
export function getErrors(board: Board): Set<string> {
  const errors = new Set<string>();
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const val = board[row][col];
      if (val === null) continue;
      // 一時的にnullにして検証
      board[row][col] = null;
      if (!isValid(board, row, col, val)) {
        errors.add(`${row},${col}`);
      }
      board[row][col] = val;
    }
  }
  return errors;
}

/** 盤面が完成しているか判定 */
export function isComplete(board: Board, solution: Board): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] !== solution[row][col]) return false;
    }
  }
  return true;
}

/** 秒数を mm:ss 形式にフォーマット */
export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

/** ローカルストレージキー */
const LS_KEYS = {
  bestTimes: 'sudoku_best_times',
  savedGame: 'sudoku_saved_game',
  settings: 'sudoku_settings',
} as const;

export interface SavedGame {
  puzzle: Board;
  solution: Board;
  userBoard: Board;
  memoBoard: (number[] | null)[][];
  difficulty: Difficulty;
  elapsed: number;
  mistakes: number;
  timestamp: number;
}

export function saveBestTime(difficulty: Difficulty, seconds: number): void {
  try {
    const raw = localStorage.getItem(LS_KEYS.bestTimes);
    const times: Partial<Record<Difficulty, number>> = raw ? JSON.parse(raw) : {};
    if (!times[difficulty] || seconds < times[difficulty]!) {
      times[difficulty] = seconds;
      localStorage.setItem(LS_KEYS.bestTimes, JSON.stringify(times));
    }
  } catch { /* ignore */ }
}

export function getBestTime(difficulty: Difficulty): number | null {
  try {
    const raw = localStorage.getItem(LS_KEYS.bestTimes);
    if (!raw) return null;
    const times: Partial<Record<Difficulty, number>> = JSON.parse(raw);
    return times[difficulty] ?? null;
  } catch { return null; }
}

export function saveGame(game: SavedGame): void {
  try {
    localStorage.setItem(LS_KEYS.savedGame, JSON.stringify(game));
  } catch { /* ignore */ }
}

export function loadGame(): SavedGame | null {
  try {
    const raw = localStorage.getItem(LS_KEYS.savedGame);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function clearSavedGame(): void {
  try {
    localStorage.removeItem(LS_KEYS.savedGame);
  } catch { /* ignore */ }
}

export function saveSettings(settings: { difficulty: Difficulty }): void {
  try {
    localStorage.setItem(LS_KEYS.settings, JSON.stringify(settings));
  } catch { /* ignore */ }
}

export function loadSettings(): { difficulty: Difficulty } | null {
  try {
    const raw = localStorage.getItem(LS_KEYS.settings);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
