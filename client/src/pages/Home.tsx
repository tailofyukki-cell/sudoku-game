/**
 * Home Page - Sudoku Game Entry Point
 * Design: 和モダン × ミニマリズム
 */
import { useEffect } from 'react';
import { useSudoku } from '@/hooks/useSudoku';
import TitleScreen from '@/components/TitleScreen';
import GameScreen from '@/components/GameScreen';
import CompleteScreen from '@/components/CompleteScreen';
import { loadSettings } from '@/lib/sudoku';

export default function Home() {
  const {
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
  } = useSudoku();

  // 設定の読み込み
  useEffect(() => {
    const settings = loadSettings();
    if (settings) {
      setDifficulty(settings.difficulty);
    }
  }, []);

  if (state.phase === 'title') {
    return (
      <TitleScreen
        difficulty={state.difficulty}
        onSetDifficulty={setDifficulty}
        onStart={startGame}
      />
    );
  }

  if (state.phase === 'complete') {
    return (
      <CompleteScreen
        difficulty={state.difficulty}
        elapsed={state.lastCompletedTime}
        mistakes={state.mistakes}
        hintsUsed={state.hintsUsed}
        onReplay={() => startGame(state.difficulty)}
        onNewGame={() => goTitle()}
        onGoTitle={goTitle}
      />
    );
  }

  return (
    <GameScreen
      state={state}
      onSelectCell={selectCell}
      onInputNumber={inputNumber}
      onDelete={deleteNumber}
      onUndo={undo}
      onHint={hint}
      onToggleMemo={toggleMemo}
      onRestart={restart}
      onGoTitle={goTitle}
    />
  );
}
