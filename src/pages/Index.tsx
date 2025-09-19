import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { GameField } from '@/components/GameField';
import Icon from '@/components/ui/icon';
import { useAudio } from '@/hooks/useAudio';

type GameScreen = 'menu' | 'game' | 'leaderboard' | 'instructions' | 'pause' | 'gameOver';

interface Score {
  name: string;
  score: number;
  level: number;
}

function Index() {
  const { playSound, playBackgroundMusic, stopBackgroundMusic, isEnabled, toggleAudio } = useAudio();
  const [currentScreen, setCurrentScreen] = useState<GameScreen>('menu');
  const [currentScore, setCurrentScore] = useState(0);
  const [playerName, setPlayerName] = useState('');
  const [leaderboard, setLeaderboard] = useState<Score[]>([
    { name: 'Mario', score: 15000, level: 8 },
    { name: 'Luigi', score: 12500, level: 7 },
    { name: 'Peach', score: 10000, level: 6 },
    { name: 'Bowser', score: 8500, level: 5 },
    { name: 'Yoshi', score: 7000, level: 4 }
  ]);

  const handleGameOver = (score: number) => {
    setCurrentScore(score);
    setCurrentScreen('gameOver');
    stopBackgroundMusic();
  };

  const saveScore = () => {
    if (playerName.trim()) {
      playSound('menu-select');
      const newScore: Score = {
        name: playerName.trim(),
        score: currentScore,
        level: Math.floor(currentScore / 1000) + 1
      };
      setLeaderboard(prev => [...prev, newScore].sort((a, b) => b.score - a.score).slice(0, 10));
      setPlayerName('');
      setCurrentScreen('leaderboard');
    }
  };

  const renderMainMenu = () => (
    <div className="min-h-screen bg-gradient-to-b from-blue-400 via-blue-500 to-blue-600 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 bg-white/95 backdrop-blur-sm shadow-2xl">
        <div className="text-center space-y-6">
          {/* Logo */}
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-500 via-green-500 to-blue-500 bg-clip-text text-transparent">
              MARIO
            </h1>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-red-500 via-green-500 to-blue-500 bg-clip-text text-transparent">
              TETRIS
            </h2>
            <p className="text-gray-600 text-sm">Классическая аркада встречает головоломку</p>
          </div>

          {/* Game Icons */}
          <div className="flex justify-center gap-4 text-3xl">
            <span>🍄</span>
            <span>🔷</span>
            <span>🪙</span>
            <span>👹</span>
          </div>

          {/* Menu Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={() => {
                playSound('menu-select');
                setCurrentScreen('game');
              }}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 text-lg border-2 border-red-700 shadow-lg"
            >
              🎮 ИГРАТЬ
            </Button>
            
            <Button 
              onClick={() => {
                playSound('menu-select');
                setCurrentScreen('leaderboard');
              }}
              variant="outline"
              className="w-full border-2 border-yellow-500 text-yellow-700 hover:bg-yellow-50 font-bold py-3"
            >
              🏆 ТАБЛИЦА РЕКОРДОВ
            </Button>
            
            <Button 
              onClick={() => {
                playSound('menu-select');
                setCurrentScreen('instructions');
              }}
              variant="outline"
              className="w-full border-2 border-blue-500 text-blue-700 hover:bg-blue-50 font-bold py-3"
            >
              📋 ПРАВИЛА ИГРЫ
            </Button>
            
            <Button 
              onClick={toggleAudio}
              variant="outline"
              className={`w-full border-2 font-bold py-2 text-sm ${
                isEnabled 
                  ? 'border-green-500 text-green-700 hover:bg-green-50' 
                  : 'border-red-500 text-red-700 hover:bg-red-50'
              }`}
            >
              {isEnabled ? '🔊 ЗВУК ВКЛ' : '🔇 ЗВУК ВЫКЛ'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderGame = () => (
    <div className="min-h-screen bg-gradient-to-b from-sky-300 to-green-300 py-4">
      <GameField 
        onPause={() => setCurrentScreen('pause')}
        onGameOver={handleGameOver}
      />
    </div>
  );

  const renderLeaderboard = () => (
    <div className="min-h-screen bg-gradient-to-b from-purple-400 to-purple-600 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 bg-white/95 backdrop-blur-sm">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-purple-800 flex items-center justify-center gap-2">
            🏆 ТАБЛИЦА РЕКОРДОВ
          </h2>
          
          <div className="space-y-2">
            {leaderboard.map((score, index) => (
              <div 
                key={index}
                className={`flex justify-between items-center p-3 rounded-lg ${
                  index === 0 ? 'bg-yellow-100 border-2 border-yellow-400' :
                  index === 1 ? 'bg-gray-100 border-2 border-gray-400' :
                  index === 2 ? 'bg-orange-100 border-2 border-orange-400' :
                  'bg-white border border-gray-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Badge variant={index < 3 ? 'default' : 'secondary'}>
                    #{index + 1}
                  </Badge>
                  <span className="font-medium">{score.name}</span>
                </div>
                <div className="text-right text-sm">
                  <div className="font-bold">{score.score.toLocaleString()}</div>
                  <div className="text-gray-500">Ур. {score.level}</div>
                </div>
              </div>
            ))}
          </div>
          
          <Button 
            onClick={() => setCurrentScreen('menu')}
            variant="outline"
            className="w-full mt-4 border-2 border-purple-500 text-purple-700 hover:bg-purple-50"
          >
            🏠 ГЛАВНОЕ МЕНЮ
          </Button>
        </div>
      </Card>
    </div>
  );

  const renderInstructions = () => (
    <div className="min-h-screen bg-gradient-to-b from-green-400 to-green-600 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg p-6 bg-white/95 backdrop-blur-sm">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-green-800 text-center flex items-center justify-center gap-2">
            📋 ПРАВИЛА ИГРЫ
          </h2>
          
          <div className="space-y-4 text-sm">
            <div className="bg-red-50 p-3 rounded-lg border-l-4 border-red-400">
              <h3 className="font-bold text-red-800 mb-1">🍄 Как играть:</h3>
              <p>Управляйте Марио стрелками или A/D. Уворачивайтесь от падающих блоков и собирайте монеты!</p>
            </div>
            
            <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
              <h3 className="font-bold text-blue-800 mb-1">🔷 Тетрис-блоки:</h3>
              <p>Блоки падают сверху. Заполните горизонтальную линию, чтобы очистить её и получить очки.</p>
            </div>
            
            <div className="bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-400">
              <h3 className="font-bold text-yellow-800 mb-1">🪙 Очки:</h3>
              <p>Монеты: +50 очков<br/>Очищенная линия: +100 × уровень</p>
            </div>
            
            <div className="bg-red-50 p-3 rounded-lg border-l-4 border-red-400">
              <h3 className="font-bold text-red-800 mb-1">👹 Враги:</h3>
              <p>Избегайте контакта с врагами! Столкновение заканчивает игру.</p>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-gray-400">
              <h3 className="font-bold text-gray-800 mb-1">⌨️ Управление:</h3>
              <p>← → или A/D: движение<br/>Пробел или W: прыжок<br/>Esc: пауза</p>
            </div>
          </div>
          
          <Button 
            onClick={() => setCurrentScreen('menu')}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold mt-4"
          >
            🏠 ГЛАВНОЕ МЕНЮ
          </Button>
        </div>
      </Card>
    </div>
  );

  const renderPause = () => (
    <Dialog open={currentScreen === 'pause'} onOpenChange={() => setCurrentScreen('game')}>
      <DialogContent className="bg-white/95 backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">⏸️ ПАУЗА</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <Button 
            onClick={() => setCurrentScreen('game')}
            className="w-full bg-green-500 hover:bg-green-600 text-white"
          >
            ▶️ ПРОДОЛЖИТЬ
          </Button>
          <Button 
            onClick={() => setCurrentScreen('instructions')}
            variant="outline"
            className="w-full"
          >
            📋 ПРАВИЛА
          </Button>
          <Button 
            onClick={() => setCurrentScreen('menu')}
            variant="outline"
            className="w-full border-red-500 text-red-600 hover:bg-red-50"
          >
            🏠 ГЛАВНОЕ МЕНЮ
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  const renderGameOver = () => (
    <Dialog open={currentScreen === 'gameOver'} onOpenChange={() => setCurrentScreen('menu')}>
      <DialogContent className="bg-white/95 backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl text-red-600">💀 ИГРА ОКОНЧЕНА</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4 text-center">
          <div className="text-xl font-bold">
            Ваш счёт: <span className="text-blue-600">{currentScore.toLocaleString()}</span>
          </div>
          
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Введите ваше имя"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg text-center"
              maxLength={20}
            />
            <Button 
              onClick={saveScore}
              disabled={!playerName.trim()}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white"
            >
              💾 СОХРАНИТЬ РЕЗУЛЬТАТ
            </Button>
          </div>
          
          <div className="space-y-2">
            <Button 
              onClick={() => setCurrentScreen('game')}
              className="w-full bg-green-500 hover:bg-green-600 text-white"
            >
              🔄 ИГРАТЬ СНОВА
            </Button>
            <Button 
              onClick={() => setCurrentScreen('menu')}
              variant="outline"
              className="w-full"
            >
              🏠 ГЛАВНОЕ МЕНЮ
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  // Background music for different screens
  useEffect(() => {
    if (!isEnabled) return;
    
    // Simple 8-bit melodies using data URLs would go here
    // For now, we'll use Web Audio API tones
    const playBackgroundTune = () => {
      if (currentScreen === 'menu') {
        // Play menu music - we'll use the existing sound system
        // No continuous background music for now to keep it simple
      }
    };
    
    playBackgroundTune();
    
    return () => {
      stopBackgroundMusic();
    };
  }, [currentScreen, isEnabled, stopBackgroundMusic]);

  return (
    <div className="font-sans">
      {currentScreen === 'menu' && renderMainMenu()}
      {currentScreen === 'game' && renderGame()}
      {currentScreen === 'leaderboard' && renderLeaderboard()}
      {currentScreen === 'instructions' && renderInstructions()}
      {renderPause()}
      {renderGameOver()}
    </div>
  );
}

export default Index;