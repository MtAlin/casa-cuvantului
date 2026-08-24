import React, { useState, useEffect } from 'react';
import { Trophy, Flame, CheckCircle, Crown, Medal, User } from 'lucide-react';
import { CommunityStats, CommunityUserStat } from '../types';
import { userPlanService } from '../services/api';
import toast from 'react-hot-toast';

export const AdminCommunityStats: React.FC = () => {
  const [stats, setStats] = useState<CommunityStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await userPlanService.getCommunityStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch community stats', err);
        toast.error('Eroare la încărcarea statisticilor comunității');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!stats) return null;

  const renderTopList = (
    title: string,
    icon: React.ReactNode,
    users: CommunityUserStat[],
    valueKey: 'longestStreak' | 'completedPlans',
    valueLabel: string
  ) => (
    <div className="glass-card p-6 flex flex-col gap-4 relative overflow-hidden group border-emerald-500/10 hover:border-emerald-500/30 transition-all duration-300">
      <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/10 transition-colors" />
      <h3 className="text-xl font-bold flex items-center gap-2 mb-2 relative z-10">
        {icon}
        {title}
      </h3>
      {users.length === 0 ? (
        <p className="text-gray-500 italic text-sm">Nu există date suficiente.</p>
      ) : (
        <div className="flex flex-col gap-3 relative z-10">
          {users.map((item, index) => {
            let rankIcon = null;
            if (index === 0) rankIcon = <Crown className="w-5 h-5 text-yellow-400" />;
            else if (index === 1) rankIcon = <Medal className="w-5 h-5 text-gray-400" />;
            else if (index === 2) rankIcon = <Medal className="w-5 h-5 text-amber-700" />;
            else rankIcon = <span className="font-bold text-gray-500 text-sm w-5 text-center">{index + 1}</span>;

            return (
              <div key={item.user._id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-6 flex justify-center">{rankIcon}</div>
                  {item.user.avatar ? (
                    <img src={item.user.avatar} alt="avatar" className="w-8 h-8 rounded-full object-cover border border-white/10" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                      <User className="w-4 h-4 text-emerald-400" />
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="font-bold text-sm text-gray-200">{item.user.name}</span>
                    <span className="text-xs text-gray-500">{item.user.email}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-lg">
                  <span className="text-lg">{item[valueKey]}</span>
                  <span className="text-xs font-normal opacity-80">{valueLabel}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div className="mt-12 flex flex-col gap-6 animate-fade-in relative z-10">
      <div className="flex items-center gap-2 px-2">
        <Trophy className="w-6 h-6 text-yellow-400" />
        <h2 className="text-2xl font-bold text-white">Clasament Comunitate (Admin)</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderTopList(
          'Top Zile la Rând',
          <Flame className="w-6 h-6 text-orange-500" />,
          stats.topStreaks,
          'longestStreak',
          'zile'
        )}
        {renderTopList(
          'Top Planuri Finalizate',
          <CheckCircle className="w-6 h-6 text-emerald-500" />,
          stats.topCompleted,
          'completedPlans',
          'planuri'
        )}
      </div>

      {stats.allUserStats && stats.allUserStats.length > 0 && (
        <div className="mt-12 glass-card p-6 border-emerald-500/10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-500/10 transition-colors" />
          <h3 className="text-xl font-bold flex items-center gap-2 mb-6 relative z-10">
            <User className="w-6 h-6 text-blue-400" />
            Detalii Progres Utilizatori
          </h3>
          <div className="overflow-x-auto relative z-10">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-gray-400 text-sm">
                  <th className="py-3 px-4 font-semibold">Utilizator</th>
                  <th className="py-3 px-4 font-semibold text-center">Record Absolut</th>
                  <th className="py-3 px-4 font-semibold text-center">Planuri Finalizate</th>
                  <th className="py-3 px-4 font-semibold text-center">Zile Completate</th>
                  <th className="py-3 px-4 font-semibold text-center">Progres General</th>
                </tr>
              </thead>
              <tbody>
                {stats.allUserStats.map((stat) => (
                  <tr key={stat.user._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        {stat.user.avatar ? (
                          <img src={stat.user.avatar} alt="avatar" className="w-10 h-10 rounded-full object-cover border border-white/10" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                            <User className="w-5 h-5 text-blue-400" />
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-200">{stat.user.name}</span>
                          <span className="text-xs text-gray-500">{stat.user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="inline-flex items-center gap-1 bg-orange-500/10 text-orange-400 px-3 py-1 rounded-full font-bold">
                        <Flame className="w-4 h-4" /> {stat.longestStreak}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="inline-flex items-center gap-1 bg-purple-500/10 text-purple-400 px-3 py-1 rounded-full font-bold">
                        <CheckCircle className="w-4 h-4" /> {stat.completedPlans}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center font-bold text-emerald-400">
                      {stat.completedDays || 0}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${stat.percentage || 0}%` }} />
                        </div>
                        <span className="text-sm font-bold text-gray-300">{stat.percentage || 0}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
