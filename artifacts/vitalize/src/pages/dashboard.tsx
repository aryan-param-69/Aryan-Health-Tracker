import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Activity, Droplets, Moon, Flame, ArrowRight, Target } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { 
  useGetDailySummary, 
  useGetWeeklyTrend,
  getGetDailySummaryQueryKey,
  getGetWeeklyTrendQueryKey
} from "@workspace/api-client-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function Dashboard() {
  const { data: summary, isLoading: isLoadingSummary } = useGetDailySummary({
    query: { queryKey: getGetDailySummaryQueryKey() }
  });

  const { data: trend, isLoading: isLoadingTrend } = useGetWeeklyTrend({
    query: { queryKey: getGetWeeklyTrendQueryKey() }
  });

  if (isLoadingSummary) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48 bg-white/5" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Skeleton className="h-48 w-full bg-white/5 rounded-2xl" />
          <Skeleton className="h-48 w-full bg-white/5 rounded-2xl" />
          <Skeleton className="h-48 w-full bg-white/5 rounded-2xl" />
          <Skeleton className="h-48 w-full bg-white/5 rounded-2xl" />
        </div>
        <Skeleton className="h-80 w-full bg-white/5 rounded-2xl" />
      </div>
    );
  }

  const metrics = [
    { label: "Steps", value: summary?.steps, goal: summary?.stepsGoal, percent: summary?.stepsPercent, unit: "", icon: Activity, color: "var(--color-primary)", colorTailwind: "text-primary" },
    { label: "Hydration", value: summary?.hydrationMl, goal: summary?.hydrationGoalMl, percent: summary?.hydrationPercent, unit: "ml", icon: Droplets, color: "var(--color-secondary)", colorTailwind: "text-secondary" },
    { label: "Sleep", value: summary?.sleepHours, goal: summary?.sleepGoalHours, percent: summary?.sleepPercent, unit: "h", icon: Moon, color: "hsl(250 80% 60%)", colorTailwind: "text-indigo-400" },
    { label: "Calories", value: summary?.caloriesKcal, goal: summary?.caloriesGoalKcal, percent: summary?.caloriesPercent, unit: "kcal", icon: Flame, color: "hsl(10 80% 60%)", colorTailwind: "text-rose-500" },
  ];

  return (
    <motion.div 
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Today</h1>
          <p className="text-muted-foreground mt-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-medium text-muted-foreground">Vitality Score</div>
            <div className="text-2xl font-bold text-primary">{summary?.overallScore || 0}</div>
          </div>
          <Link href="/log" className="bg-primary/20 text-primary hover:bg-primary/30 px-4 py-2 rounded-full font-medium transition-colors flex items-center gap-2">
            Log Data <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {metrics.map((m) => (
          <div key={m.label} className="glass-card rounded-2xl p-5 flex flex-col items-center justify-center relative overflow-hidden group">
            <div className={`absolute top-3 left-3 ${m.colorTailwind} opacity-50`}>
              <m.icon className="w-5 h-5" />
            </div>
            
            <div className="relative w-28 h-28 flex items-center justify-center mb-4">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="56"
                  cy="56"
                  r="48"
                  fill="none"
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="8"
                />
                <motion.circle
                  cx="56"
                  cy="56"
                  r="48"
                  fill="none"
                  stroke={m.color}
                  strokeWidth="8"
                  strokeLinecap="round"
                  initial={{ strokeDasharray: 301, strokeDashoffset: 301 }}
                  animate={{ strokeDashoffset: 301 - (301 * Math.min(100, m.percent || 0)) / 100 }}
                  transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                  style={{ filter: `drop-shadow(0 0 6px ${m.color})` }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-xl font-bold ${m.colorTailwind}`}>{m.value || 0}</span>
                <span className="text-xs text-muted-foreground font-medium">{m.unit}</span>
              </div>
            </div>

            <div className="text-center w-full">
              <div className="text-sm font-semibold tracking-wide uppercase text-white/80">{m.label}</div>
              <div className="text-xs text-white/40 mt-1">Goal: {m.goal || 0} {m.unit}</div>
            </div>
          </div>
        ))}
      </motion.div>

      <motion.div variants={itemVariants} className="glass-card rounded-2xl p-6 relative overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">7-Day Trend</h2>
        </div>
        
        {isLoadingTrend ? (
          <Skeleton className="h-[250px] w-full bg-white/5" />
        ) : trend && trend.length > 0 ? (
          <div className="h-[250px] w-full mt-4 -ml-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSteps" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { weekday: 'short' })}
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: 'var(--color-primary)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="steps" 
                  stroke="var(--color-primary)" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorSteps)" 
                  activeDot={{ r: 6, fill: "var(--color-primary)", stroke: "rgba(255,255,255,0.5)", strokeWidth: 4 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[250px] flex items-center justify-center flex-col text-muted-foreground">
            <Activity className="w-12 h-12 mb-3 opacity-20" />
            <p>No trend data available yet.</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
