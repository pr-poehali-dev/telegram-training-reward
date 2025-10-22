import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Separator } from '@/components/ui/separator';

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

const BACKEND_URL = 'https://functions.poehali.dev/b2c76a34-3c91-46fc-b13f-bd1d518ee850';

export default function TrainingProgress() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        let userIdToFetch = userId;
        
        if (window.Telegram?.WebApp) {
          const tg = window.Telegram.WebApp;
          const initData = tg.initDataUnsafe;
          
          if (initData?.user) {
            const telegramUser = initData.user;
            userIdToFetch = `${telegramUser.last_name || ''}_${telegramUser.first_name || ''}_1`;
          }
        }

        const url = userIdToFetch 
          ? `${BACKEND_URL}?user_id=${encodeURIComponent(userIdToFetch)}`
          : BACKEND_URL;
        
        const response = await fetch(url);
        const result = await response.json();
        setData(result);
        
        if (result.user) {
          setUserId(result.user.id);
        }
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Icon name="Loader2" className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    );
  }

  const user = data?.user;
  const progress = user ? (user.trainings_completed / 10) * 100 : 0;

  return (
    <div className="container max-w-2xl mx-auto p-4 space-y-6">
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

      {user && data && (
        <>
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
                      participant.id === user.id 
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
