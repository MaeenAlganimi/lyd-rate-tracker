"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";

import { formatDate, formatRate } from "@/lib/format";
import type { Locale } from "@/lib/i18n/locale";

type Point = {
  date: string;
  official: number | null;
  parallel: number | null;
  parallelSample: boolean;
};

export function HistoryChart({
  points,
  locale,
  labels,
}: {
  points: Point[];
  locale: Locale;
  labels: { official: string; parallel: string; sample: string };
}) {
  return (
    <div dir="ltr" className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points} margin={{ top: 12, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#e6dccb" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={(value: string) => formatDate(value, locale)}
            minTickGap={28}
            tick={{ fill: "#4e5b6c", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#4e5b6c", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={58}
            domain={["auto", "auto"]}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const point = payload[0].payload as Point;
              return (
                <div className="rounded-md border border-line bg-card px-3 py-2 text-xs shadow-sm" dir={locale === "ar" ? "rtl" : "ltr"}>
                  <p className="mb-1 font-semibold">{formatDate(point.date, locale)}</p>
                  <p className="text-sea">
                    {labels.official}: {formatRate(point.official === null ? null : String(point.official))}
                  </p>
                  <p className="text-copper">
                    {labels.parallel}
                    {point.parallelSample ? ` · ${labels.sample}` : ""}: {formatRate(point.parallel === null ? null : String(point.parallel))}
                  </p>
                </div>
              );
            }}
          />
          <Line type="monotone" dataKey="official" name={labels.official} stroke="#0e6b66" strokeWidth={2.4} dot={false} connectNulls={false} />
          <Line
            type="monotone"
            dataKey="parallel"
            name={labels.parallel}
            stroke="#b5522a"
            strokeWidth={2.4}
            strokeDasharray="6 4"
            dot={false}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
