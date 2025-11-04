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

  const totalCount = data?.leaderboard.length || 0;
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

        <Card className="bg-black text-primary border-2 border-primary shadow-[0_8px_30px_rgb(0,0,0,0.12),0_4px_8px_rgb(255,217,0,0.2)]">
          <CardHeader>
            <CardTitle className="text-lg sm:text-2xl flex items-center justify-between text-primary font-bold">
              <div className="flex items-center gap-1 sm:gap-2">
                <Icon name="Trophy" className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="text-base sm:text-2xl">Челлендж: 10 тренировок</span>
              </div>
              <div className="text-sm sm:text-lg font-normal whitespace-nowrap">
                Участников: {totalCount}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <div className="bg-green-500/20 p-2 sm:p-4 rounded-lg border border-green-500/40 shadow-[0_4px_12px_rgba(34,197,94,0.15)]">
                <div className="text-xl sm:text-2xl font-bold text-primary">{completedCount}</div>
                <div className="text-[10px] sm:text-xs text-primary/80 leading-tight">Выполнили</div>
                <div className="text-[9px] sm:text-xs text-primary/60 leading-tight">10+ тренировок</div>
              </div>
              <div className="bg-yellow-500/20 p-2 sm:p-4 rounded-lg border border-yellow-500/40 shadow-[0_4px_12px_rgba(234,179,8,0.15)]">
                <div className="text-xl sm:text-2xl font-bold text-primary">{closeCount}</div>
                <div className="text-[10px] sm:text-xs text-primary/80 leading-tight">Близко</div>
                <div className="text-[9px] sm:text-xs text-primary/60 leading-tight">7-9 тренировок</div>
              </div>
              <div className="bg-primary/10 p-2 sm:p-4 rounded-lg border border-primary/30 shadow-[0_4px_12px_rgba(255,217,0,0.1)]">
                <div className="text-xl sm:text-2xl font-bold text-primary">{othersCount}</div>
                <div className="text-[10px] sm:text-xs text-primary/80 leading-tight">В процессе</div>
                <div className="text-[9px] sm:text-xs text-primary/60 leading-tight">1-6 тренировок</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-black shadow-[0_8px_30px_rgb(0,0,0,0.08),0_2px_10px_rgb(0,0,0,0.04)]">
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
                  className="pl-10 pr-4"
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
                        ? 'bg-primary/5 border-primary shadow-[0_4px_16px_rgba(255,217,0,0.12)]'
                        : 'bg-gray-50 border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)]'
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
                            <span className="whitespace-nowrap">{participant.trainings_completed} / 10</span>
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