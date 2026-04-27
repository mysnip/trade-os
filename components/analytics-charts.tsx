"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalyticsResult, GroupMetric } from "@/lib/analytics/metrics";

const positive = "#14b8a6";
const negative = "#ef4444";
const neutral = "#f59e0b";

function BarMetricChart({ title, data }: { title: string; data: GroupMetric[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.slice(0, 10)}>
            <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
            <XAxis dataKey="key" />
            <YAxis />
            <Tooltip
              contentStyle={{ background: "#151922", border: "1px solid #303642", borderRadius: 8 }}
              formatter={(value) => Number(value).toFixed(2)}
            />
            <Bar dataKey="netPnl" radius={[4, 4, 0, 0]}>
              {data.slice(0, 10).map((entry) => (
                <Cell key={entry.key} fill={entry.netPnl >= 0 ? positive : negative} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function AnalyticsCharts({ metrics }: { metrics: AnalyticsResult }) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Card className="xl:col-span-2">
        <CardHeader>
          <CardTitle>PnL over time</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={metrics.equityCurve}>
              <defs>
                <linearGradient id="equity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={positive} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={positive} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip contentStyle={{ background: "#151922", border: "1px solid #303642", borderRadius: 8 }} />
              <Area type="monotone" dataKey="equity" stroke={positive} fill="url(#equity)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <BarMetricChart title="PnL by Instrument" data={metrics.pnlByInstrument} />
      <BarMetricChart title="PnL by Weekday" data={metrics.pnlByWeekday} />
      <BarMetricChart title="PnL by Hour" data={metrics.pnlByHour} />
      <BarMetricChart title="Session Performance" data={metrics.pnlBySession} />
      <BarMetricChart title="Long vs Short Performance" data={metrics.pnlByDirection} />
      <BarMetricChart
        title="R-Multiple Distribution"
        data={metrics.rDistribution.map((item) => ({ ...item, netPnl: item.trades }))}
      />

      <Card className="xl:col-span-2">
        <CardHeader>
          <CardTitle>Winrate by Setup</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={metrics.winrateBySetup.slice(0, 10)}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="key" />
              <YAxis />
              <Tooltip contentStyle={{ background: "#151922", border: "1px solid #303642", borderRadius: 8 }} />
              <Bar dataKey="winrate" fill={neutral} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
