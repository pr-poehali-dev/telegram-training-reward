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
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-purple-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Icon name="Trophy" className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Челлендж: 10 тренировок</CardTitle>
            <p className="text-muted-foreground mt-2">
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
                className="w-full" 
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
    <div className="container max-w-2xl mx-auto p-4 space-y-6">
      <div className="flex justify-end">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => {
            setIsAuthenticated(false);
            setData(null);
            setSurname('');
            setName('');
            setError('');
          }}
        >
          <Icon name="LogOut" className="w-4 h-4 mr-2" />
          Выйти
        </Button>
      </div>

      <Card className="bg-gradient-to-br from-blue-500 to-purple-600 text-white border-0">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Icon name="Trophy" className="w-6 h-6" />
            Челлендж: 10 тренировок
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-lg font-medium">
            Пройди 10 тренировок до 31.10 и получи скидку 15% на следующий блок!
          </div>
          
          {user && (
            <>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Прогресс</span>
                  <span className="font-bold">{user.trainings_completed} из 10</span>
                </div>
                <Progress value={progress} className="h-3 bg-white/20" />
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-center">
                  <div className="text-4xl font-bold">{user.trainings_left}</div>
                  <div className="text-sm opacity-90">тренировок до подарка</div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {data && (
        <>
          {user && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="BarChart3" className="w-5 h-5" />
                  Ваша статистика
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-primary">{user.trainings_completed}</div>
                    <div className="text-sm text-muted-foreground">Выполнено</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-primary">#{data.rank}</div>
                    <div className="text-sm text-muted-foreground">Ваше место</div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Всего участников:</span>
                    <span className="font-semibold">{data.stats.total_participants}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Выполнили план:</span>
                    <Badge variant="secondary" className="font-semibold">
                      {data.stats.total_completed_goal} чел.
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Users" className="w-5 h-5" />
                Топ-10 участников
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.leaderboard.slice(0, 10).map((participant, index) => (
                  <div
                    key={participant.id}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      user && participant.id === user.id 
                        ? 'bg-primary/10 border-2 border-primary' 
                        : 'bg-muted'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        index === 0 ? 'bg-yellow-500 text-white' :
                        index === 1 ? 'bg-gray-400 text-white' :
                        index === 2 ? 'bg-orange-600 text-white' :
                        'bg-muted-foreground/20'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{participant.full_name}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon name="Dumbbell" className="w-4 h-4 text-muted-foreground" />
                      <span className="font-bold">{participant.trainings_completed}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
