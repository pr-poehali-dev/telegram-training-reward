import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
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
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    setLoading(true);

    try {
      const response = await fetch(BACKEND_URL);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      setData({
        user: null,
        rank: null,
        stats: result.stats,
        leaderboard: result.leaderboard
      });
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <Icon name="Loader2" className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Загрузка данных...</p>
        </div>
      </div>
    );
  }

  const completedCount = data?.leaderboard.filter(u => u.trainings_completed >= 10).length || 0;
  const closeCount = data?.leaderboard.filter(u => u.trainings_completed >= 7 && u.trainings_completed <= 9).length || 0;
  const othersCount = data?.leaderboard.filter(u => u.trainings_completed >= 1 && u.trainings_completed <= 6).length || 0;

  const filteredLeaderboard = data?.leaderboard.filter(participant => {
    const fullName = `${participant.name} ${participant.surname}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  }) || [];

  return (
    <div className="min-h-screen bg-white">
      <div className="container max-w-2xl mx-auto p-4 space-y-6">
        <div className="flex items-center justify-center">
          <img 
            src="https://cdn.poehali.dev/files/f7749e8b-59af-4ee0-825b-bc5b0dd1fae9.jpg" 
            alt="Город Спорта" 
            className="w-20 h-20 object-contain"
          />
        </div>

        <Card className="bg-black text-primary border-2 border-primary shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2 text-primary font-bold">
              <Icon name="Trophy" className="w-6 h-6" />
              Челлендж: 10 тренировок
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-green-500/20 p-4 rounded-lg border border-green-500/40">
                <div className="text-2xl font-bold text-primary">{completedCount}</div>
                <div className="text-xs text-primary/80">Выполнили челлендж</div>
                <div className="text-xs text-primary/60">10+ тренировок</div>
              </div>
              <div className="bg-yellow-500/20 p-4 rounded-lg border border-yellow-500/40">
                <div className="text-2xl font-bold text-primary">{closeCount}</div>
                <div className="text-xs text-primary/80">Близко к финалу</div>
                <div className="text-xs text-primary/60">7-9 тренировок</div>
              </div>
              <div className="bg-primary/10 p-4 rounded-lg border border-primary/30">
                <div className="text-2xl font-bold text-primary">{othersCount}</div>
                <div className="text-xs text-primary/80">Победа впереди!</div>
                <div className="text-xs text-primary/60">1-6 тренировок</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-black shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-black flex items-center gap-2">
              <Icon name="Users" className="w-5 h-5" />
              Рейтинг участников
            </CardTitle>
            <div className="mt-4">
              <div className="relative">
                <Icon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Поиск по имени или фамилии..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredLeaderboard.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Icon name="Search" className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>Участники не найдены</p>
                </div>
              ) : (
                filteredLeaderboard.map((participant, index) => {
                const actualIndex = data?.leaderboard.findIndex(p => p.id === participant.id) || 0;
                const isCompleted = participant.trainings_completed >= 10;
                const isTopThree = index < 3;
                
                return (
                  <div
                    key={participant.id}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      isCompleted
                        ? 'bg-primary/5 border-primary'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full font-bold bg-gray-200 text-gray-700">
                        {actualIndex + 1}
                      </div>
                      
                      <div className="flex-1">
                        <div className="font-semibold text-black">
                          {participant.name} {participant.surname.charAt(0)}.
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant={isCompleted ? "default" : "secondary"}
                            className={isCompleted ? "bg-primary text-black font-bold" : ""}
                          >
                            <Icon name="Dumbbell" className="w-3 h-3 mr-1" />
                            {participant.trainings_completed} / 10
                          </Badge>
                          {isCompleted && (
                            <Badge className="bg-green-600 hover:bg-green-700 text-white">
                              <Icon name="Check" className="w-3 h-3 mr-1" />
                              Завершено
                            </Badge>
                          )}
                        </div>
                      </div>


                    </div>
                  </div>
                );
              })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}