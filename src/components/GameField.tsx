import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useAudio } from '@/hooks/useAudio';

interface GameBlock {
  x: number;
  y: number;
  color: string;
  type: 'mario' | 'enemy' | 'coin' | 'tetris';
}

interface GameFieldProps {
  onPause: () => void;
  onGameOver: (score: number) => void;
}

const FIELD_WIDTH = 10;
const FIELD_HEIGHT = 20;
const BLOCK_SIZE = 30;

const MARIO_RED = '#FF6B35';
const TETRIS_BLUE = '#4A90E2';
const COIN_YELLOW = '#FFD700';
const PIPE_GREEN = '#22C55E';

export const GameField: React.FC<GameFieldProps> = ({ onPause, onGameOver }) => {
  const { playSound, initAudioContext } = useAudio();
  const [gameField, setGameField] = useState<(GameBlock | null)[][]>(
    Array(FIELD_HEIGHT).fill(null).map(() => Array(FIELD_WIDTH).fill(null))
  );
  const [currentPiece, setCurrentPiece] = useState<GameBlock | null>(null);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [linesCleared, setLinesCleared] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [marioPosition, setMarioPosition] = useState({ x: 4, y: 18 });

  const createNewPiece = useCallback(() => {
    const types: ('mario' | 'enemy' | 'coin' | 'tetris')[] = ['mario', 'enemy', 'coin', 'tetris'];
    const colors = [MARIO_RED, '#8B4513', COIN_YELLOW, TETRIS_BLUE];
    const randomType = types[Math.floor(Math.random() * types.length)];
    const randomColor = colors[types.indexOf(randomType)];
    
    return {
      x: Math.floor(FIELD_WIDTH / 2),
      y: 0,
      color: randomColor,
      type: randomType
    };
  }, []);

  const moveMario = useCallback((direction: 'left' | 'right' | 'jump') => {
    initAudioContext();
    setMarioPosition(prev => {
      const newPos = { ...prev };
      
      switch (direction) {
        case 'left':
          if (newPos.x > 0) newPos.x--;
          break;
        case 'right':
          if (newPos.x < FIELD_WIDTH - 1) newPos.x++;
          break;
        case 'jump':
          playSound('jump');
          if (newPos.y > 0) newPos.y -= 2;
          setTimeout(() => {
            setMarioPosition(p => ({ ...p, y: Math.min(p.y + 2, FIELD_HEIGHT - 2) }));
          }, 300);
          break;
      }
      
      return newPos;
    });
  }, [initAudioContext, playSound]);

  const clearLines = useCallback(() => {
    const newField = [...gameField];
    let clearedCount = 0;
    
    for (let y = FIELD_HEIGHT - 1; y >= 0; y--) {
      if (newField[y].every(cell => cell !== null)) {
        newField.splice(y, 1);
        newField.unshift(Array(FIELD_WIDTH).fill(null));
        clearedCount++;
        y++; // Check the same line again
      }
    }
    
    if (clearedCount > 0) {
      playSound('line-clear');
      setGameField(newField);
      setLinesCleared(prev => prev + clearedCount);
      setScore(prev => prev + clearedCount * 100 * level);
      setLevel(Math.floor((linesCleared + clearedCount) / 10) + 1);
    }
  }, [gameField, level, linesCleared]);

  useEffect(() => {
    if (!isPlaying) return;
    
    const gameLoop = setInterval(() => {
      if (currentPiece) {
        if (currentPiece.y < FIELD_HEIGHT - 1 && !gameField[currentPiece.y + 1][currentPiece.x]) {
          setCurrentPiece(prev => prev ? { ...prev, y: prev.y + 1 } : null);
        } else {
          // Place piece
          const newField = [...gameField];
          newField[currentPiece.y][currentPiece.x] = currentPiece;
          setGameField(newField);
          setCurrentPiece(null);
          
          // Check for collision with Mario
          if (currentPiece.x === marioPosition.x && currentPiece.y === marioPosition.y) {
            if (currentPiece.type === 'coin') {
              playSound('coin');
              setScore(prev => prev + 50);
            } else if (currentPiece.type === 'enemy') {
              playSound('game-over');
              onGameOver(score);
              return;
            }
          }
          
          clearLines();
        }
      } else {
        setCurrentPiece(createNewPiece());
      }
    }, Math.max(100, 1000 - level * 50));

    return () => clearInterval(gameLoop);
  }, [isPlaying, currentPiece, gameField, marioPosition, level, score, clearLines, createNewPiece, onGameOver]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isPlaying) return;
      
      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
          moveMario('left');
          break;
        case 'ArrowRight':
        case 'd':
          moveMario('right');
          break;
        case ' ':
        case 'w':
          e.preventDefault();
          moveMario('jump');
          break;
        case 'Escape':
          playSound('pause');
          onPause();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying, moveMario, onPause]);

  const renderBlock = (block: GameBlock | null, isMario = false, isCurrent = false) => {
    if (!block && !isMario) return null;
    
    const style: React.CSSProperties = {
      width: BLOCK_SIZE,
      height: BLOCK_SIZE,
      position: 'absolute',
      borderRadius: '4px',
      border: '2px solid #333',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '18px',
      fontWeight: 'bold',
      opacity: isCurrent ? 0.8 : 1,
      zIndex: isMario ? 10 : 1
    };

    if (isMario) {
      return (
        <div
          style={{
            ...style,
            backgroundColor: MARIO_RED,
            left: marioPosition.x * BLOCK_SIZE,
            top: marioPosition.y * BLOCK_SIZE,
          }}
        >
          🍄
        </div>
      );
    }

    if (block) {
      const emoji = block.type === 'mario' ? '🍄' : 
                   block.type === 'enemy' ? '👹' :
                   block.type === 'coin' ? '🪙' : '🔷';
      
      return (
        <div style={{ ...style, backgroundColor: block.color }}>
          {emoji}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      {/* Game Stats */}
      <div className="flex gap-6 text-lg font-bold">
        <div className="text-yellow-600">Очки: {score}</div>
        <div className="text-blue-600">Уровень: {level}</div>
        <div className="text-green-600">Линии: {linesCleared}</div>
      </div>

      {/* Game Field */}
      <Card className="relative bg-black border-4 border-gray-700" style={{
        width: FIELD_WIDTH * BLOCK_SIZE + 20,
        height: FIELD_HEIGHT * BLOCK_SIZE + 20,
        padding: '10px'
      }}>
        <div className="relative" style={{
          width: FIELD_WIDTH * BLOCK_SIZE,
          height: FIELD_HEIGHT * BLOCK_SIZE,
          background: 'linear-gradient(180deg, #87CEEB 0%, #98FB98 100%)'
        }}>
          {/* Grid background */}
          <div className="absolute inset-0 opacity-20">
            {Array.from({ length: FIELD_HEIGHT }).map((_, y) => (
              Array.from({ length: FIELD_WIDTH }).map((_, x) => (
                <div
                  key={`${x}-${y}`}
                  className="absolute border border-gray-400"
                  style={{
                    left: x * BLOCK_SIZE,
                    top: y * BLOCK_SIZE,
                    width: BLOCK_SIZE,
                    height: BLOCK_SIZE
                  }}
                />
              ))
            ))}
          </div>

          {/* Placed blocks */}
          {gameField.map((row, y) =>
            row.map((block, x) => (
              <div
                key={`${x}-${y}`}
                style={{
                  position: 'absolute',
                  left: x * BLOCK_SIZE,
                  top: y * BLOCK_SIZE
                }}
              >
                {renderBlock(block)}
              </div>
            ))
          )}

          {/* Current falling piece */}
          {currentPiece && (
            <div
              style={{
                position: 'absolute',
                left: currentPiece.x * BLOCK_SIZE,
                top: currentPiece.y * BLOCK_SIZE
              }}
            >
              {renderBlock(currentPiece, false, true)}
            </div>
          )}

          {/* Mario character */}
          {renderBlock(null, true)}
        </div>
      </Card>

      {/* Controls */}
      <div className="flex gap-4">
        <Button
          onClick={() => moveMario('left')}
          variant="outline"
          size="lg"
          className="bg-blue-500 text-white border-blue-600 hover:bg-blue-600"
        >
          <Icon name="ArrowLeft" size={20} />
        </Button>
        <Button
          onClick={() => moveMario('jump')}
          variant="outline"
          size="lg"
          className="bg-red-500 text-white border-red-600 hover:bg-red-600"
        >
          ПРЫЖОК
        </Button>
        <Button
          onClick={() => moveMario('right')}
          variant="outline"
          size="lg"
          className="bg-blue-500 text-white border-blue-600 hover:bg-blue-600"
        >
          <Icon name="ArrowRight" size={20} />
        </Button>
        <Button
          onClick={onPause}
          variant="outline"
          size="lg"
          className="bg-yellow-500 text-white border-yellow-600 hover:bg-yellow-600"
        >
          <Icon name="Pause" size={20} />
        </Button>
      </div>

      <div className="text-sm text-gray-600 text-center">
        Используйте стрелки или A/D для движения, Пробел/W для прыжка, Esc для паузы
      </div>
    </div>
  );
};