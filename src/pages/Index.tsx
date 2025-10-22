import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Participant {
  id: number;
  name: string;
  workouts: number;
  rank: number;
}

const mockParticipants: Participant[] = [
  { id: 1, name: 'Анна Смирнова', workouts: 10, rank: 1 },
  { id: 2, name: 'Дмитрий Иванов', workouts: 9, rank: 2 },
  { id: 3, name: 'Елена Петрова', workouts: 8, rank: 3 },
  { id: 4, name: 'Максим Козлов', workouts: 7, rank: 4 },
  { id: 5, name: 'Ольга Новикова', workouts: 6, rank: 5 },
  { id: 6, name: 'Сергей Волков', workouts: 5, rank: 6 },
  { id: 7, name: 'Мария Соколова', workouts: 4, rank: 7 },
  { id: 8, name: 'Андрей Морозов', workouts: 3, rank: 8 },
];

const currentUser = {
  name: 'Вы',
  workouts: 6,
  rank: 5,
};

const achievements = [
  {
    id: 1,
    title: 'Скидка 15%',
    description: 'На следующий блок тренировок',
    icon: 'Gift',
    requirement: 10,
    unlocked: false,
  },
  {
    id: 2,
    title: 'Бронзовая медаль',
    description: 'За 5 тренировок',
    icon: 'Medal',
    requirement: 5,
    unlocked: true,
  },
  {
    id: 3,
    title: 'Серебряная медаль',
    description: 'За 7 тренировок',
    icon: 'Award',
    requirement: 7,
    unlocked: false,
  },
];

const Index = () => {
  const [activeTab, setActiveTab] = useState('home');
  const progressPercentage = (currentUser.workouts / 10) * 100;
  const remainingWorkouts = 10 - currentUser.workouts;
  const completedToday = 3;
  const totalCompleted = 2;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      <div className="container max-w-4xl mx-auto px-4 py-6 pb-24">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-secondary mb-2 tracking-tight">
            WORKOUT TRACKER
          </h1>
          <p className="text-muted-foreground">Твой путь к успеху</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 h-12">
            <TabsTrigger value="home" className="text-sm font-semibold">
              <Icon name="Home" size={18} className="mr-2" />
              Главная
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="text-sm font-semibold">
              <Icon name="Trophy" size={18} className="mr-2" />
              Рейтинг
            </TabsTrigger>
            <TabsTrigger value="achievements" className="text-sm font-semibold">
              <Icon name="Award" size={18} className="mr-2" />
              Достижения
            </TabsTrigger>
          </TabsList>

          <TabsContent value="home" className="space-y-6">
            <Card className="border-2 border-primary/20 shadow-lg animate-scale-in">
              <CardHeader className="bg-gradient-to-r from-primary to-orange-600 text-white rounded-t-lg">
                <CardTitle className="text-center text-xl md:text-2xl font-bold">
                  Пройди 10 тренировок до 31.10 и получи скидку 15% на следующий блок!
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 pb-8">
                <div className="text-center mb-6">
                  <div className="relative inline-flex items-center justify-center w-48 h-48 mb-4">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="96"
                        cy="96"
                        r="88"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="none"
                        className="text-gray-200"
                      />
                      <circle
                        cx="96"
                        cy="96"
                        r="88"
                        stroke="url(#gradient)"
                        strokeWidth="12"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 88}`}
                        strokeDashoffset={`${2 * Math.PI * 88 * (1 - progressPercentage / 100)}`}
                        className="transition-all duration-1000 ease-out"
                        strokeLinecap="round"
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#FF6B00" />
                          <stop offset="100%" stopColor="#2ecc71" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-6xl font-bold text-primary">{currentUser.workouts}</span>
                      <span className="text-sm text-muted-foreground font-semibold">из 10</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-semibold text-secondary">
                      До подарка осталось:{' '}
                      <span className="text-2xl text-primary font-bold">{remainingWorkouts}</span>{' '}
                      {remainingWorkouts === 1 ? 'тренировка' : 'тренировок'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 shadow-md animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Icon name="BarChart3" size={24} className="text-primary" />
                  Статистика дня
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-4 rounded-lg border border-primary/20">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon name="Flame" size={20} className="text-primary" />
                      <p className="text-sm text-muted-foreground font-medium">Сегодня выполнили</p>
                    </div>
                    <p className="text-3xl font-bold text-primary">+{completedToday}</p>
                    <p className="text-xs text-muted-foreground">человек</p>
                  </div>

                  <div className="bg-gradient-to-br from-accent/10 to-accent/5 p-4 rounded-lg border border-accent/20">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon name="Target" size={20} className="text-accent" />
                      <p className="text-sm text-muted-foreground font-medium">Всего выполнили</p>
                    </div>
                    <p className="text-3xl font-bold text-accent">{totalCompleted}</p>
                    <p className="text-xs text-muted-foreground">человек</p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-orange-50 to-green-50 p-4 rounded-lg border-2 border-primary/30">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon name="TrendingUp" size={20} className="text-secondary" />
                      <p className="font-semibold text-secondary">Ваш рейтинг</p>
                    </div>
                    <Badge className="bg-primary text-white text-lg px-4 py-1 font-bold">
                      #{currentUser.rank}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Продолжай в том же духе! 💪
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-4">
            <Card className="border-2 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white">
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Icon name="Trophy" size={28} />
                  Таблица лидеров
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  {mockParticipants.map((participant, index) => {
                    const isCurrentUser = participant.rank === currentUser.rank;
                    return (
                      <div
                        key={participant.id}
                        className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                          isCurrentUser
                            ? 'bg-gradient-to-r from-primary/20 to-orange-100 border-primary animate-pulse-glow'
                            : 'bg-white border-gray-200 hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                              index === 0
                                ? 'bg-yellow-400 text-white'
                                : index === 1
                                ? 'bg-gray-300 text-white'
                                : index === 2
                                ? 'bg-orange-400 text-white'
                                : 'bg-gray-100 text-secondary'
                            }`}
                          >
                            {participant.rank}
                          </div>
                          <div>
                            <p className="font-semibold text-secondary">
                              {isCurrentUser ? currentUser.name : participant.name}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Progress
                                value={(participant.workouts / 10) * 100}
                                className="w-32 h-2"
                              />
                              <span className="text-xs text-muted-foreground font-medium">
                                {participant.workouts}/10
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            <Icon name="Dumbbell" size={18} className="text-primary" />
                            <span className="text-2xl font-bold text-primary">
                              {participant.workouts}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-4">
            <Card className="border-2 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Icon name="Award" size={28} />
                  Призы и достижения
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid gap-4 md:grid-cols-2">
                  {achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className={`p-6 rounded-lg border-2 transition-all ${
                        achievement.unlocked
                          ? 'bg-gradient-to-br from-green-50 to-green-100 border-accent shadow-md'
                          : 'bg-gray-50 border-gray-300 opacity-75'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`p-3 rounded-full ${
                            achievement.unlocked
                              ? 'bg-accent text-white'
                              : 'bg-gray-300 text-gray-500'
                          }`}
                        >
                          <Icon name={achievement.icon as any} size={28} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-lg text-secondary">
                              {achievement.title}
                            </h3>
                            {achievement.unlocked && (
                              <Badge className="bg-accent text-white">
                                <Icon name="Check" size={14} className="mr-1" />
                                Получено
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {achievement.description}
                          </p>
                          <div className="flex items-center gap-2 text-xs">
                            <Icon name="Target" size={14} className="text-primary" />
                            <span className="font-medium">
                              Требуется: {achievement.requirement} тренировок
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
