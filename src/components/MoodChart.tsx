import { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { format, subDays } from "date-fns";
import { Mood, moodEmojis } from "@/lib/journal-store";

interface MoodChartEntry {
  date: string;
  mood: Mood;
}

interface MoodChartProps {
  entries: MoodChartEntry[];
}

const moodValues: Record<Mood, number> = {
  melancholy: 1,
  reflective: 2,
  peaceful: 3,
  grateful: 4,
  happy: 5,
  energetic: 6,
};

const moodFromValue = (val: number): Mood => {
  const moods: Mood[] = ["melancholy", "reflective", "peaceful", "grateful", "happy", "energetic"];
  return moods[Math.round(val) - 1] || "peaceful";
};

const MoodChart = ({ entries }: MoodChartProps) => {
  const data = useMemo(() => {
    const last14 = Array.from({ length: 14 }, (_, i) => {
      const date = format(subDays(new Date(), 13 - i), "yyyy-MM-dd");
      const dayEntries = entries.filter((e) => e.date.startsWith(date));
      const avg = dayEntries.length > 0
        ? dayEntries.reduce((sum, e) => sum + moodValues[e.mood], 0) / dayEntries.length
        : null;
      return { date: format(subDays(new Date(), 13 - i), "MMM d"), value: avg };
    });
    return last14;
  }, [entries]);

  const hasData = data.some((d) => d.value !== null);

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-8 text-center">
        <span className="mb-2 text-3xl">📊</span>
        <p className="text-sm text-muted-foreground">Start journaling to see your mood trends!</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/50 bg-card/50 p-4 shadow-[var(--shadow-card)]" style={{ backdropFilter: "blur(10px)" }}>
      <h3 className="mb-3 font-serif text-lg font-semibold text-foreground">Mood Journey (14 days)</h3>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(243, 75%, 58%)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(270, 95%, 75%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(0, 0%, 45%)" }} axisLine={false} tickLine={false} />
          <YAxis domain={[1, 6]} hide />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload?.[0]?.value != null) {
                const val = payload[0].value as number;
                const mood = moodFromValue(val);
                return (
                  <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-md">
                    <span>{moodEmojis[mood]} {mood}</span>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="hsl(243, 75%, 58%)"
            strokeWidth={2}
            fill="url(#moodGradient)"
            connectNulls
            dot={{ fill: "hsl(243, 75%, 58%)", r: 3 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MoodChart;
