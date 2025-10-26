import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import funcUrls from '../../backend/func2url.json';

interface UserData {
  id: string;
  name: string;
  surname: string;
  full_name: string;
  trainings_completed: number;
  trainings_left: number;
}

interface Stats {
  total_participants: number;
  total_completed_goal: number;
}

interface ApiResponse {
  user: UserData | null;
  rank: number | null;
  stats: Stats;
  leaderboard: UserData[];
}

const BACKEND_URL = funcUrls.sheets;

export default function TrainingProgress() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [surname, setSurname] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const savedSurname = localStorage.getItem('training_surname');
    const savedName = localStorage.getItem('training_name');
    
    if (savedSurname && savedName) {
      setSurname(savedSurname);
      setName(savedName);
      autoLogin(savedSurname, savedName);
    }
  }, []);

  const autoLogin = async (savedSurname: string, savedName: string) => {
    setLoading(true);

    try {
      const response = await fetch(BACKEND_URL);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      const foundUser = result.leaderboard.find(
        (participant: UserData) => 
          participant.name.toLowerCase() === savedName.trim().toLowerCase() &&
          participant.surname.toLowerCase() === savedSurname.trim().toLowerCase()
      );

      if (foundUser) {
        const userRank = result.leaderboard.findIndex(
          (p: UserData) => p.id === foundUser.id
        ) + 1;

        setData({
          user: foundUser,
          rank: userRank,
          stats: result.stats,
          leaderboard: result.leaderboard
        });
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem('training_surname');
        localStorage.removeItem('training_name');
      }
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!surname.trim() || !name.trim()) {
      setError('Пожалуйста, заполните все поля');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(BACKEND_URL);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      const foundUser = result.leaderboard.find(
        (participant: UserData) => 
          participant.name.toLowerCase() === name.trim().toLowerCase() &&
          participant.surname.toLowerCase() === surname.trim().toLowerCase()
      );

      if (foundUser) {
        const userRank = result.leaderboard.findIndex(
          (p: UserData) => p.id === foundUser.id
        ) + 1;

        setData({
          user: foundUser,
          rank: userRank,
          stats: result.stats,
          leaderboard: result.leaderboard
        });
        setIsAuthenticated(true);
        
        localStorage.setItem('training_surname', surname.trim());
        localStorage.setItem('training_name', name.trim());
      } else {
        setError(`Пользователь ${surname} ${name} не найден. Проверьте правильность написания.`);
      }
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
      setError('Ошибка подключения к серверу. Попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-white">
        <Card className="w-full max-w-md border-2 border-black shadow-lg">
          <CardHeader className="text-center">
            <img 
              src="https://cdn.poehali.dev/files/f7749e8b-59af-4ee0-825b-bc5b0dd1fae9.jpg" 
              alt="Город Спорта" 
              className="w-32 h-32 mx-auto mb-4 object-contain"
            />
            <CardTitle className="text-2xl font-bold text-black">Челлендж: 10 тренировок</CardTitle>
            <p className="text-gray-700 mt-2">
              Войдите, чтобы узнать ваш прогресс
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="surname" className="text-sm font-medium">
                  Фамилия
                </label>
                <Input
                  id="surname"
                  type="text"
                  placeholder="Иванов"
                  value={surname}
                  onChange={(e) => setSurname(e.target.value)}
                  disabled={loading}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Имя
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Иван"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  className="w-full"
                />
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90 text-black font-bold" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Icon name="Loader2" className="w-4 h-4 mr-2 animate-spin" />
                    Поиск...
                  </>
                ) : (
                  <>
                    <Icon name="LogIn" className="w-4 h-4 mr-2" />
                    Войти
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  const user = data?.user;
  const progress = user ? (user.trainings_completed / 10) * 100 : 0;

  return (
    <div className="min-h-screen bg-white">
      <div className="container max-w-2xl mx-auto p-4 space-y-6">
        <div className="flex items-center justify-between">
          <img 
            src="https://cdn.poehali.dev/files/f7749e8b-59af-4ee0-825b-bc5b0dd1fae9.jpg" 
            alt="Город Спорта" 
            className="w-20 h-20 object-contain"
          />
          <Button 
            variant="outline" 
            size="sm"
            className="border-black text-black hover:bg-primary hover:text-black"
            onClick={() => {
              setIsAuthenticated(false);
              setData(null);
              setSurname('');
              setName('');
              setError('');
              localStorage.removeItem('training_surname');
              localStorage.removeItem('training_name');
            }}
          >
            <Icon name="LogOut" className="w-4 h-4 mr-2" />
            Выйти
          </Button>
        </div>

      <Card className="bg-black text-primary border-2 border-primary shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2 text-primary font-bold">
            <Icon name="Trophy" className="w-6 h-6" />
            Челлендж: 10 тренировок
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {user && user.trainings_completed >= 10 ? (
            <div className="text-center space-y-4">
              <div className="text-5xl">🎉</div>
              <div className="text-2xl font-bold text-primary">Поздравляем!</div>
              <div className="text-lg font-medium text-white">Поздравляю с успешным прохождением 10 тренировок в октябре!  Воспользуйтесь скидкой 15% на покупку следующего тренировочного блока и продолжайте двигаться вперед к новым вершинам!</div>
              <div className="bg-primary/10 border border-primary rounded-lg p-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary">10/10</div>
                  <div className="text-sm text-white">Челлендж завершён! 🏆</div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="text-lg font-medium text-white">Пройди 10 тренировок в октябре и получи скидку 15% на следующий блок!</div>
              
              {user && (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-white">
                      <span>Прогресс</span>
                      <span className="font-bold text-primary">{user.trainings_completed} из 10</span>
                    </div>
                    <Progress value={progress} className="h-3 bg-gray-800" />
                  </div>
                  
                  <div className="bg-primary/10 border border-primary rounded-lg p-4">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-primary">{user.trainings_left}</div>
                      <div className="text-sm text-white">тренировок до подарка</div>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {data && data.stats && (
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-2 border-primary">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-3">
              <Icon name="Users" className="w-6 h-6 text-primary" />
              <div className="text-center">
                <span className="text-lg text-gray-700">Сегодня челлендж выполнили </span>
                <span className="text-2xl font-bold text-primary">{data.stats.total_completed_goal}</span>
                <span className="text-lg text-gray-700"> {data.stats.total_completed_goal === 1 ? 'человек' : data.stats.total_completed_goal < 5 ? 'человека' : 'человек'}!</span>
              </div>
              <Icon name="Flame" className="w-6 h-6 text-primary" />
            </div>
          </CardContent>
        </Card>
      )}

      {data && (
        <>
          {user && (
            <Card className="border-2 border-black">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-black font-bold">
                  <Icon name="BarChart3" className="w-5 h-5" />
                  Ваша статистика
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-primary/10 border-2 border-primary rounded-lg">
                    <div className="text-2xl font-bold text-black">{user.trainings_completed}</div>
                    <div className="text-sm text-gray-700">Выполнено</div>
                  </div>
                  <div className="text-center p-4 bg-primary/10 border-2 border-primary rounded-lg">
                    <div className="text-2xl font-bold text-black">#{data.rank}</div>
                    <div className="text-sm text-gray-700">Ваше место</div>
                  </div>
                </div>
                
                <Separator className="bg-gray-300" />
                
                <div>
                  <div className="text-sm font-semibold text-gray-700 mb-3 text-center">Ваши награды</div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className={`text-center p-3 rounded-lg border-2 transition-all ${
                      user.trainings_completed >= 5 
                        ? 'bg-amber-700 border-amber-800' 
                        : 'bg-gray-200 border-gray-300'
                    }`}>
                      <Icon name="Medal" className={`w-8 h-8 mx-auto mb-1 ${
                        user.trainings_completed >= 5 ? 'text-yellow-200' : 'text-gray-400'
                      }`} />
                      <div className={`text-xs font-bold ${
                        user.trainings_completed >= 5 ? 'text-yellow-100' : 'text-gray-500'
                      }`}>Бронза</div>
                      <div className={`text-[10px] ${
                        user.trainings_completed >= 5 ? 'text-yellow-200' : 'text-gray-400'
                      }`}>5 тренировок</div>
                    </div>
                    
                    <div className={`text-center p-3 rounded-lg border-2 transition-all ${
                      user.trainings_completed >= 7 
                        ? 'bg-gray-400 border-gray-500' 
                        : 'bg-gray-200 border-gray-300'
                    }`}>
                      <Icon name="Medal" className={`w-8 h-8 mx-auto mb-1 ${
                        user.trainings_completed >= 7 ? 'text-gray-100' : 'text-gray-400'
                      }`} />
                      <div className={`text-xs font-bold ${
                        user.trainings_completed >= 7 ? 'text-white' : 'text-gray-500'
                      }`}>Серебро</div>
                      <div className={`text-[10px] ${
                        user.trainings_completed >= 7 ? 'text-gray-100' : 'text-gray-400'
                      }`}>7 тренировок</div>
                    </div>
                    
                    <div className={`text-center p-3 rounded-lg border-2 transition-all ${
                      user.trainings_completed >= 10 
                        ? 'bg-primary border-black' 
                        : 'bg-gray-200 border-gray-300'
                    }`}>
                      <Icon name="Medal" className={`w-8 h-8 mx-auto mb-1 ${
                        user.trainings_completed >= 10 ? 'text-yellow-300' : 'text-gray-400'
                      }`} />
                      <div className={`text-xs font-bold ${
                        user.trainings_completed >= 10 ? 'text-black' : 'text-gray-500'
                      }`}>Золото</div>
                      <div className={`text-[10px] ${
                        user.trainings_completed >= 10 ? 'text-gray-800' : 'text-gray-400'
                      }`}>10 тренировок</div>
                    </div>
                  </div>
                </div>
                
                <Separator className="bg-gray-300" />
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Всего участников:</span>
                  <span className="font-semibold text-black">{data.stats.total_participants}</span>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="border-2 border-black">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-black font-bold">
                <Icon name="Users" className="w-5 h-5" />
                Топ-15 участников
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.leaderboard.slice(0, 15).map((participant, index) => (
                  <div
                    key={participant.id}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      user && participant.id === user.id 
                        ? 'bg-primary/20 border-2 border-primary' 
                        : 'bg-gray-100 border border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        index === 0 ? 'bg-primary text-black border-2 border-black' :
                        index === 1 ? 'bg-gray-300 text-black border-2 border-gray-500' :
                        index === 2 ? 'bg-gray-200 text-black border-2 border-gray-400' :
                        'bg-white text-black border border-gray-400'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-black">
                          {participant.surname.charAt(0)}. {participant.name}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon name="Dumbbell" className="w-4 h-4 text-gray-700" />
                      <span className="font-bold text-black">{participant.trainings_completed}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
      </div>
    </div>
  );
}