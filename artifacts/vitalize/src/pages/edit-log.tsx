import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation, useParams } from "wouter";
import { motion } from "framer-motion";
import { Activity, Droplets, Moon, Flame, Check, ArrowLeft } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { 
  useUpdateHealthLog, 
  useGetHealthLog,
  getGetHealthLogQueryKey,
  getListHealthLogsQueryKey,
  getGetDailySummaryQueryKey,
  getGetWeeklyTrendQueryKey
} from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";

const formSchema = z.object({
  steps: z.coerce.number().min(0),
  hydrationMl: z.coerce.number().min(0),
  sleepHours: z.coerce.number().min(0).max(24),
  caloriesKcal: z.coerce.number().min(0),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function EditLog() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const id = parseInt(params.id || "0", 10);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: logEntry, isLoading } = useGetHealthLog(id, {
    query: { 
      enabled: !!id, 
      queryKey: getGetHealthLogQueryKey(id) 
    }
  });

  const updateLog = useUpdateHealthLog();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      steps: 0,
      hydrationMl: 0,
      sleepHours: 0,
      caloriesKcal: 0,
      notes: "",
    },
  });

  React.useEffect(() => {
    if (logEntry) {
      form.reset({
        steps: logEntry.steps,
        hydrationMl: logEntry.hydrationMl,
        sleepHours: logEntry.sleepHours,
        caloriesKcal: logEntry.caloriesKcal,
        notes: logEntry.notes || "",
      });
    }
  }, [logEntry, form]);

  const onSubmit = (values: FormValues) => {
    if (!id) return;
    
    updateLog.mutate(
      { 
        id,
        data: values
      },
      {
        onSuccess: () => {
          toast({
            title: "Log updated",
            description: "Your health metrics have been updated successfully.",
          });
          queryClient.invalidateQueries({ queryKey: getGetHealthLogQueryKey(id) });
          queryClient.invalidateQueries({ queryKey: getListHealthLogsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetDailySummaryQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetWeeklyTrendQueryKey() });
          setLocation("/history");
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to update log. Please try again.",
            variant: "destructive"
          });
        }
      }
    );
  };

  if (isLoading) {
    return <Skeleton className="w-full h-[500px] bg-white/5 rounded-2xl" />;
  }

  if (!logEntry && !isLoading) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">Log not found</h2>
        <Link href="/history">
          <Button variant="outline">Back to History</Button>
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-2xl mx-auto"
    >
      <div className="mb-8">
        <Link href="/history" className="inline-flex items-center text-sm text-muted-foreground hover:text-white mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to History
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Edit Log</h1>
        <p className="text-muted-foreground mt-1">Update metrics for {logEntry?.date}</p>
      </div>

      <div className="glass-card rounded-2xl p-6 md:p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="steps"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-white/80">
                      <Activity className="w-4 h-4 text-primary" /> Steps
                    </FormLabel>
                    <FormControl>
                      <Input type="number" className="bg-white/5 border-white/10 h-12 text-lg focus-visible:ring-primary" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hydrationMl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-white/80">
                      <Droplets className="w-4 h-4 text-secondary" /> Hydration (ml)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" className="bg-white/5 border-white/10 h-12 text-lg focus-visible:ring-secondary" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sleepHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-white/80">
                      <Moon className="w-4 h-4 text-indigo-400" /> Sleep (hours)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" step="0.5" className="bg-white/5 border-white/10 h-12 text-lg focus-visible:ring-indigo-400" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="caloriesKcal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-white/80">
                      <Flame className="w-4 h-4 text-rose-500" /> Calories (kcal)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" className="bg-white/5 border-white/10 h-12 text-lg focus-visible:ring-rose-500" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white/80">Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="How are you feeling?" 
                      className="bg-white/5 border-white/10 min-h-[100px] resize-none focus-visible:ring-primary" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              disabled={updateLog.isPending}
              className="w-full h-12 text-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl"
            >
              {updateLog.isPending ? "Saving..." : (
                <span className="flex items-center gap-2">
                  <Check className="w-5 h-5" /> Update Entry
                </span>
              )}
            </Button>
          </form>
        </Form>
      </div>
    </motion.div>
  );
}
