/**
 * useSudoku Hook
 * ゲーム状態管理・操作ロジック
 */
import { useCallback, useEffect, useReducer, useRef } from 'react';
import {
  Board,
  Difficulty,
  SavedGame,
  clearSavedGame,
  copyBoard,
  formatTime,
  generatePuzzle,
  getBestTime,
  getErrors,
  isComplete,
  isValid,
  loadGame,
  saveBestTime,
  saveGame,
  saveSettings,
} from '@/lib/sudoku';

export type GamePhase = 'title' | 'playing' | 'complete';

export interface HistoryEntry {
  row: number;
  col: number;
  prev: number | null;
  prevMemo: number[] | null;
}

export interface SudokuState {
  phase: GamePhase;
  difficulty: Difficulty;
  puzzle: Board;
  solution: Board;
  userBoard: Board;
  memoBoard: (number[] | null)[][];
  selectedCell: [number, number] | null;
  errors: Set<string>;
  mistakes: number;
  elapsed: number;
  isRunning: boolean;
  isMemoMode: boolean;
  history: HistoryEntry[];
  hintsUsed: number;
  isComplete: boolean;
  bestTime: number | null;
  lastCompletedTime: number;
}

type Action =
  | { type: 'START_GAME'; difficulty: Difficulty; puzzle: Board; solution: Board; savedGame?: SavedGame }
  | { type: 'SELECT_CELL'; row: number; col: number }
  | { type: 'INPUT_NUMBER'; num: number }
  | { type: 'DELETE_NUMBER' }
  | { type: 'UNDO' }
  | { type: 'HINT' }
  | { type: 'TOGGLE_MEMO' }
  | { type: 'TICK' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'RESTART' }
  | { type: 'GO_TITLE' }
  | { type: 'SET_DIFFICULTY'; difficulty: Difficulty };

function emptyMemoBoard(): (number[] | null)[][] {
  return Array.from({ length: 9 }, () => Array(9).fill(null));
}

const initialState: SudokuState = {
  phase: 'title',
  difficulty: 'normal',
  puzzle: Array.from({ length: 9 }, () => Array(9).fill(null)),
  solution: Array.from({ length: 9 }, () => Array(9).fill(null)),
  userBoard: Array.from({ length: 9 }, () => Array(9).fill(null)),
  memoBoard: emptyMemoBoard(),
  selectedCell: null,
  errors: new Set(),
  mistakes: 0,
  elapsed: 0,
  isRunning: false,
  isMemoMode: false,
  history: [],
  hintsUsed: 0,
  isComplete: false,
  bestTime: null,
  lastCompletedTime: 0,
};

function reducer(state: SudokuState, action: Action): SudokuState {
  switch (action.type) {
    case 'START_GAME': {
      const { difficulty, puzzle, solution, savedGame } = action;
      const userBoard = savedGame ? savedGame.userBoard : copyBoard(puzzle);
      const memoBoard = savedGame ? savedGame.memoBoard : emptyMemoBoard();
      const elapsed = savedGame ? savedGame.elapsed : 0;
      const mistakes = savedGame ? savedGame.mistakes : 0;
      const errors = getErrors(userBoard);
      return {
        ...initialState,
        phase: 'playing',
        difficulty,
        puzzle,
        solution,
        userBoard,
        memoBoard,
        elapsed,
        mistakes,
        errors,
        isRunning: true,
        bestTime: getBestTime(difficulty),
      };
    }

    case 'SELECT_CELL': {
      return { ...state, selectedCell: [action.row, action.col] };
    }

    case 'INPUT_NUMBER': {
      if (!state.selectedCell) return state;
      const [row, col] = state.selectedCell;
      if (state.puzzle[row][col] !== null) return state; // 固定セルは変更不可

      const { num } = action;

      if (state.isMemoMode) {
        // メモモード
        const newMemo = copyBoard(state.memoBoard as Board) as (number[] | null)[][];
        const prev = state.memoBoard[row][col];
        const current = prev ? [...prev] : [];
        const idx = current.indexOf(num);
        if (idx >= 0) {
          current.splice(idx, 1);
        } else {
          current.push(num);
          current.sort();
        }
        newMemo[row][col] = current.length > 0 ? current : null;
        const entry: HistoryEntry = { row, col, prev: state.userBoard[row][col], prevMemo: prev };
        return {
          ...state,
          memoBoard: newMemo,
          history: [...state.history, entry],
        };
      }

      // 通常入力
      const newBoard = copyBoard(state.userBoard);
      const prevVal = newBoard[row][col];
      newBoard[row][col] = num;

      const errors = getErrors(newBoard);
      const hasError = errors.has(`${row},${col}`);
      let mistakes = state.mistakes;
      if (hasError && !errors.has(`${row},${col}`) === false) {
        // 新しいエラーが発生した場合のみカウント
        const prevErrors = getErrors(state.userBoard);
        if (!prevErrors.has(`${row},${col}`)) {
          mistakes = state.mistakes + 1;
        }
      }

      // メモをクリア
      const newMemo = copyBoard(state.memoBoard as Board) as (number[] | null)[][];
      const prevMemo = newMemo[row][col];
      newMemo[row][col] = null;
      // 同じ行・列・ブロックのメモからこの数字を削除
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (r === row && c === col) continue;
          const sameRow = r === row;
          const sameCol = c === col;
          const sameBlock = Math.floor(r / 3) === Math.floor(row / 3) && Math.floor(c / 3) === Math.floor(col / 3);
          if ((sameRow || sameCol || sameBlock) && newMemo[r][c]) {
            const filtered = newMemo[r][c]!.filter(n => n !== num);
            newMemo[r][c] = filtered.length > 0 ? filtered : null;
          }
        }
      }

      const entry: HistoryEntry = { row, col, prev: prevVal, prevMemo };
      const completed = !hasError && isComplete(newBoard, state.solution);

      if (completed) {
        saveBestTime(state.difficulty, state.elapsed);
        clearSavedGame();
      }

      return {
        ...state,
        userBoard: newBoard,
        memoBoard: newMemo,
        errors,
        mistakes,
        history: [...state.history, entry],
        isComplete: completed,
        isRunning: !completed,
        lastCompletedTime: completed ? state.elapsed : state.lastCompletedTime,
        bestTime: completed ? getBestTime(state.difficulty) : state.bestTime,
        phase: completed ? 'complete' : 'playing',
      };
    }

    case 'DELETE_NUMBER': {
      if (!state.selectedCell) return state;
      const [row, col] = state.selectedCell;
      if (state.puzzle[row][col] !== null) return state;

      const newBoard = copyBoard(state.userBoard);
      const prevVal = newBoard[row][col];
      const newMemo = copyBoard(state.memoBoard as Board) as (number[] | null)[][];
      const prevMemo = newMemo[row][col];

      if (prevVal === null && prevMemo === null) return state;

      newBoard[row][col] = null;
      newMemo[row][col] = null;
      const errors = getErrors(newBoard);
      const entry: HistoryEntry = { row, col, prev: prevVal, prevMemo };

      return {
        ...state,
        userBoard: newBoard,
        memoBoard: newMemo,
        errors,
        history: [...state.history, entry],
      };
    }

    case 'UNDO': {
      if (state.history.length === 0) return state;
      const last = state.history[state.history.length - 1];
      const newBoard = copyBoard(state.userBoard);
      const newMemo = copyBoard(state.memoBoard as Board) as (number[] | null)[][];
      newBoard[last.row][last.col] = last.prev;
      newMemo[last.row][last.col] = last.prevMemo;
      const errors = getErrors(newBoard);
      return {
        ...state,
        userBoard: newBoard,
        memoBoard: newMemo,
        errors,
        history: state.history.slice(0, -1),
      };
    }

    case 'HINT': {
      // 未入力のセルからランダムに1つ正解を表示
      const emptyCells: [number, number][] = [];
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (state.userBoard[r][c] === null || state.errors.has(`${r},${c}`)) {
            emptyCells.push([r, c]);
          }
        }
      }
      if (emptyCells.length === 0) return state;
      const [row, col] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      const num = state.solution[row][col]!;
      const newBoard = copyBoard(state.userBoard);
      const prevVal = newBoard[row][col];
      newBoard[row][col] = num;
      const newMemo = copyBoard(state.memoBoard as Board) as (number[] | null)[][];
      const prevMemo = newMemo[row][col];
      newMemo[row][col] = null;
      const errors = getErrors(newBoard);
      const entry: HistoryEntry = { row, col, prev: prevVal, prevMemo };
      const completed = isComplete(newBoard, state.solution);
      if (completed) {
        saveBestTime(state.difficulty, state.elapsed);
        clearSavedGame();
      }
      return {
        ...state,
        userBoard: newBoard,
        memoBoard: newMemo,
        errors,
        history: [...state.history, entry],
        hintsUsed: state.hintsUsed + 1,
        selectedCell: [row, col],
        isComplete: completed,
        isRunning: !completed,
        lastCompletedTime: completed ? state.elapsed : state.lastCompletedTime,
        phase: completed ? 'complete' : 'playing',
      };
    }

    case 'TOGGLE_MEMO': {
      return { ...state, isMemoMode: !state.isMemoMode };
    }

    case 'TICK': {
      if (!state.isRunning) return state;
      return { ...state, elapsed: state.elapsed + 1 };
    }

    case 'PAUSE': {
      return { ...state, isRunning: false };
    }

    case 'RESUME': {
      return { ...state, isRunning: true };
    }

    case 'RESTART': {
      const userBoard = copyBoard(state.puzzle);
      return {
        ...state,
        userBoard,
        memoBoard: emptyMemoBoard(),
        selectedCell: null,
        errors: new Set(),
        mistakes: 0,
        elapsed: 0,
        isRunning: true,
        history: [],
        hintsUsed: 0,
        isComplete: false,
        phase: 'playing',
      };
    }

    case 'GO_TITLE': {
      return { ...initialState, difficulty: state.difficulty };
    }

    case 'SET_DIFFICULTY': {
      return { ...state, difficulty: action.difficulty };
    }

    default:
      return state;
  }
}

export function useSudoku() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const saveRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // タイマー
  useEffect(() => {
    if (state.isRunning) {
      timerRef.current = setInterval(() => dispatch({ type: 'TICK' }), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [state.isRunning]);

  // 自動保存（3秒デバウンス）
  useEffect(() => {
    if (state.phase !== 'playing') return;
    if (saveRef.current) clearTimeout(saveRef.current);
    saveRef.current = setTimeout(() => {
      saveGame({
        puzzle: state.puzzle,
        solution: state.solution,
        userBoard: state.userBoard,
        memoBoard: state.memoBoard,
        difficulty: state.difficulty,
        elapsed: state.elapsed,
        mistakes: state.mistakes,
        timestamp: Date.now(),
      });
    }, 3000);
    return () => { if (saveRef.current) clearTimeout(saveRef.current); };
  }, [state.userBoard, state.memoBoard, state.elapsed]);

  // ページ離脱時に保存
  useEffect(() => {
    const handleUnload = () => {
      if (state.phase === 'playing') {
        saveGame({
          puzzle: state.puzzle,
          solution: state.solution,
          userBoard: state.userBoard,
          memoBoard: state.memoBoard,
          difficulty: state.difficulty,
          elapsed: state.elapsed,
          mistakes: state.mistakes,
          timestamp: Date.now(),
        });
      }
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [state]);

  const startGame = useCallback((difficulty: Difficulty, resume?: boolean) => {
    saveSettings({ difficulty });
    if (resume) {
      const saved = loadGame();
      if (saved && saved.difficulty === difficulty) {
        dispatch({
          type: 'START_GAME',
          difficulty: saved.difficulty,
          puzzle: saved.puzzle,
          solution: saved.solution,
          savedGame: saved,
        });
        return;
      }
    }
    const { puzzle, solution } = generatePuzzle(difficulty);
    dispatch({ type: 'START_GAME', difficulty, puzzle, solution });
  }, []);

  const selectCell = useCallback((row: number, col: number) => {
    dispatch({ type: 'SELECT_CELL', row, col });
  }, []);

  const inputNumber = useCallback((num: number) => {
    dispatch({ type: 'INPUT_NUMBER', num });
  }, []);

  const deleteNumber = useCallback(() => {
    dispatch({ type: 'DELETE_NUMBER' });
  }, []);

  const undo = useCallback(() => {
    dispatch({ type: 'UNDO' });
  }, []);

  const hint = useCallback(() => {
    dispatch({ type: 'HINT' });
  }, []);

  const toggleMemo = useCallback(() => {
    dispatch({ type: 'TOGGLE_MEMO' });
  }, []);

  const restart = useCallback(() => {
    dispatch({ type: 'RESTART' });
  }, []);

  const goTitle = useCallback(() => {
    dispatch({ type: 'GO_TITLE' });
  }, []);

  const setDifficulty = useCallback((difficulty: Difficulty) => {
    dispatch({ type: 'SET_DIFFICULTY', difficulty });
  }, []);

  return {
    state,
    startGame,
    selectCell,
    inputNumber,
    deleteNumber,
    undo,
    hint,
    toggleMemo,
    restart,
    goTitle,
    setDifficulty,
    formatTime: (s: number) => formatTime(s),
    hasSavedGame: (difficulty: Difficulty) => {
      const saved = loadGame();
      return saved !== null && saved.difficulty === difficulty;
    },
  };
}
