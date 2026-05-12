import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Target, Activity, Droplets, Moon, Flame, Check } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { 
  useGetGoals, 
  useUpdateGoals,
  getGetGoalsQueryKey,
  getGetDailySummaryQueryKey
} from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const formSchema = z.object({
  stepsGoal: z.coerce.number().min(100),
  hydrationGoalMl: z.coerce.number().min(500),
  sleepGoalHours: z.coerce.number().min(1).max(24),
  caloriesGoalKcal: z.coerce.number().min(500),
});

type FormValues = z.infer<typeof formSchema>;

export default function Goals() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: goals, isLoading } = useGetGoals({
    query: { queryKey: getGetGoalsQueryKey() }
  });

  const updateGoals = useUpdateGoals();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      stepsGoal: 10000,
      hydrationGoalMl: 2500,
      sleepGoalHours: 8,
      caloriesGoalKcal: 2500,
    },
  });

  React.useEffect(() => {
    if (goals) {
      form.reset({
        stepsGoal: goals.stepsGoal,
        hydrationGoalMl: goals.hydrationGoalMl,
        sleepGoalHours: goals.sleepGoalHours,
        caloriesGoalKcal: goals.caloriesGoalKcal,
      });
    }
  }, [goals, form]);

  const onSubmit = (values: FormValues) => {
    updateGoals.mutate(
      { data: values },
      {
        onSuccess: () => {
          toast({
            title: "Goals updated",
            description: "Your daily targets have been saved.",
          });
          queryClient.invalidateQueries({ queryKey: getGetGoalsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetDailySummaryQueryKey() });
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to update goals. Please try again.",
            variant: "destructive"
          });
        }
      }
    );
  };

  if (isLoading) {
    return <Skeleton className="w-full h-[500px] bg-white/5 rounded-2xl" />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="max-w-2xl mx-auto"
    >
      <div className="mb-8 flex items-center gap-3">
        <Target className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Daily Goals</h1>
          <p className="text-muted-foreground mt-1">Set your targets for a healthier life.</p>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6 md:p-8 border-primary/20">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            <FormField
              control={form.control}
              name="stepsGoal"
              render={({ field }) => (
                <FormItem className="bg-white/5 p-4 rounded-xl border border-white/5">
                  <FormLabel className="flex items-center gap-2 text-white/80 text-lg mb-2">
                    <Activity className="w-5 h-5 text-primary" /> Daily Steps
                  </FormLabel>
                  <FormControl>
                    <Input type="number" className="bg-background border-white/10 h-12 text-lg focus-visible:ring-primary" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="hydrationGoalMl"
              render={({ field }) => (
                <FormItem className="bg-white/5 p-4 rounded-xl border border-white/5">
                  <FormLabel className="flex items-center gap-2 text-white/80 text-lg mb-2">
                    <Droplets className="w-5 h-5 text-secondary" /> Daily Hydration (ml)
                  </FormLabel>
                  <FormControl>
                    <Input type="number" className="bg-background border-white/10 h-12 text-lg focus-visible:ring-secondary" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sleepGoalHours"
              render={({ field }) => (
                <FormItem className="bg-white/5 p-4 rounded-xl border border-white/5">
                  <FormLabel className="flex items-center gap-2 text-white/80 text-lg mb-2">
                    <Moon className="w-5 h-5 text-indigo-400" /> Sleep Target (hours)
                  </FormLabel>
                  <FormControl>
                    <Input type="number" step="0.5" className="bg-background border-white/10 h-12 text-lg focus-visible:ring-indigo-400" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="caloriesGoalKcal"
              render={({ field }) => (
                <FormItem className="bg-white/5 p-4 rounded-xl border border-white/5">
                  <FormLabel className="flex items-center gap-2 text-white/80 text-lg mb-2">
                    <Flame className="w-5 h-5 text-rose-500" /> Active Calories (kcal)
                  </FormLabel>
                  <FormControl>
                    <Input type="number" className="bg-background border-white/10 h-12 text-lg focus-visible:ring-rose-500" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              disabled={updateGoals.isPending}
              className="w-full h-12 text-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl mt-4"
            >
              {updateGoals.isPending ? "Saving..." : (
                <span className="flex items-center gap-2">
                  <Check className="w-5 h-5" /> Save Goals
                </span>
              )}
            </Button>
          </form>
        </Form>
      </div>
    </motion.div>
  );
}
