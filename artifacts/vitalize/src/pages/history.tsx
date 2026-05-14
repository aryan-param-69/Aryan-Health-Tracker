import React from "react";
import { motion } from "framer-motion";
import { 
  useListHealthLogs, 
  useDeleteHealthLog,
  getListHealthLogsQueryKey,
  getGetDailySummaryQueryKey,
  getGetWeeklyTrendQueryKey
} from "@workspace/api-client-react";
import { Activity, Droplets, Moon, Flame, Calendar as CalendarIcon, Edit2, Trash2, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function History() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: logs, isLoading } = useListHealthLogs(
    { limit: 30 },
    { query: { queryKey: getListHealthLogsQueryKey({ limit: 30 }) } }
  );

  const deleteLog = useDeleteHealthLog();

  const handleDelete = (id: number) => {
    deleteLog.mutate(
      { id },
      {
        onSuccess: () => {
          toast({
            title: "Log deleted",
            description: "The health log entry has been removed.",
          });
          queryClient.invalidateQueries({ queryKey: getListHealthLogsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetDailySummaryQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetWeeklyTrendQueryKey() });
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to delete the log.",
            variant: "destructive"
          });
        }
      }
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">History</h1>
        <p className="text-muted-foreground mt-1">Review your past performance.</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="w-full h-24 bg-white/5 rounded-xl" />
          ))}
        </div>
      ) : logs && logs.length > 0 ? (
        <div className="space-y-4">
          {logs.map((log, i) => (
            <motion.div 
              key={log.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card rounded-xl p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
            >
              <div className="flex items-center gap-4 min-w-[140px]">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-primary border border-white/10">
                  <CalendarIcon className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-white/90">{format(new Date(log.date), 'MMM d, yyyy')}</div>
                  <div className="text-xs text-muted-foreground">{format(new Date(log.date), 'EEEE')}</div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 sm:gap-6 flex-1 max-w-2xl">
                <div className="flex flex-col sm:items-center">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                    <Activity className="w-3.5 h-3.5 text-primary" /> <span className="hidden sm:inline">Steps</span>
                  </div>
                  <div className="font-medium">{log.steps}</div>
                </div>
                <div className="flex flex-col sm:items-center">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                    <Droplets className="w-3.5 h-3.5 text-secondary" /> <span className="hidden sm:inline">Water</span>
                  </div>
                  <div className="font-medium">{log.hydrationMl} <span className="text-[10px] opacity-50">ml</span></div>
                </div>
                <div className="flex flex-col sm:items-center">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                    <Moon className="w-3.5 h-3.5 text-indigo-400" /> <span className="hidden sm:inline">Sleep</span>
                  </div>
                  <div className="font-medium">{log.sleepHours} <span className="text-[10px] opacity-50">h</span></div>
                </div>
                <div className="flex flex-col sm:items-center">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                    <Flame className="w-3.5 h-3.5 text-rose-500" /> <span className="hidden sm:inline">Cals</span>
                  </div>
                  <div className="font-medium">{log.caloriesKcal}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                <Link href={`/edit/${log.id}`}>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-white">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                </Link>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="glass-card border-destructive/20">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Log Entry</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete the log for {format(new Date(log.date), 'MMM d, yyyy')}? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-white/5 border-white/10 hover:bg-white/10">Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => handleDelete(log.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-muted-foreground glass-card rounded-2xl">
          <Clock className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p>No history available. Start logging to see your progress.</p>
        </div>
      )}
    </motion.div>
  );
}