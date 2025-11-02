"use client";

import React from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Area,
  Line,
} from "recharts";

import rawData from "../../public/data/kariera_pabliszera_clean.json";

// 👇 Declare accepted prop
interface PublisherCareerChartProps {
  locale: "pl-PL" | "en-US";
}

const PublisherCareerChart: React.FC<PublisherCareerChartProps> = ({ locale }) => {
  // --- 🧠 STEP 1: Normalize and merge duplicate months ---
  const mergedDataMap: Record<string, any> = {};

  rawData.forEach((d) => {
    const key = d.month;
    const monthUnix = d.monthUnix ? Number(d.monthUnix) : 0;
    const gross = d.gross ? parseFloat(String(d.gross).replace(/,/g, "")) : 0;
    const net = d.net ? parseFloat(String(d.net).replace(/,/g, "")) : 0;
    const gna = d.gna ? parseFloat(String(d.gna).replace(/,/g, "")) : 0;

    if (!mergedDataMap[key]) {
      mergedDataMap[key] = {
        month: d.month,
        monthUnix,
        gross,
        net,
        gna,
        type: d.type === "Bonus" ? "Bonus" : "Salary",
      };
    } else {
      mergedDataMap[key].gross += gross;
      mergedDataMap[key].net += net;
      mergedDataMap[key].type =
        d.type === "Bonus" || mergedDataMap[key].type === "Bonus"
          ? "Bonus"
          : "Salary";
      mergedDataMap[key].monthUnix = Math.max(
        mergedDataMap[key].monthUnix,
        monthUnix
      );
    }
  });

  const mergedData = Object.values(mergedDataMap);

  // --- 🧭 STEP 2: Parse & localize months ---
  const parseMonth = (m: string) => {
    const parts = m.split(" ");
    if (parts.length === 2) {
      const [mon, year] = parts;
      return new Date(`${mon} 01, ${year}`).getTime();
    }
    return 0;
  };

  const formatMonthLocalized = (m: string) => {
    const timestamp = parseMonth(m);
    const date = new Date(timestamp);
    return date.toLocaleString(locale, { month: "short", year: "numeric" });
  };

  // --- ✅ STEP 3: Prepare data ---
  const parsedData = (mergedData as any[])
    .map((d) => ({
      ...d,
      sortKey: parseMonth(d.month),
      monthLabel: formatMonthLocalized(d.month),
      grossLayer: d.gross > 0 ? d.gross : null,
    }))
    .sort((a, b) => a.sortKey - b.sortKey);

  // --- 💬 STEP 4: Custom Tooltip ---
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
    const isBonus = data.type === "Bonus";
    const gross = data.gross;
    const net = data.net;
    const gna = data.gna;

    return (
      <div
        style={{
          backgroundColor: "white",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          padding: "8px 12px",
        }}
      >
        <p style={{ marginBottom: "4px", fontWeight: "600" }}>{label}</p>
        {gross > 0 && (
          <p>
            <span style={{ color: "#60a3bc" }}>
              {locale === "pl-PL" ? "Brutto:" : "Gross:"}
            </span>{" "}
            {gross.toLocaleString()}
          </p>
        )}
        <p>
          <span style={{ color: "#0a3d62" }}>
            {isBonus
              ? locale === "pl-PL"
                ? "Netto (z premią):"
                : "Net (incl. Bonus):"
              : locale === "pl-PL"
              ? "Netto:"
              : "Net:"}
          </span>{" "}
          {net.toLocaleString()}
        </p>
        {isBonus && (
          <p style={{ color: "#f7b731" }}>
            {locale === "pl-PL" ? "Miesiąc bonusa dolce vita 💰" : "Bonus dolce vita month 💰"}
          </p>
        )}
        <p>
          <span style={{ color: "#079992" }}>
            {locale === "pl-PL" ? "Średnia krajowa brutto:" : "GNA:"}
          </span>{" "}
          {gna.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </p>
      </div>
    );
  };

  // --- 🧩 STEP 5: Render chart ---
  return (
    <div className="w-full h-[450px] bg-white dark:bg-zinc-900 rounded-2xl shadow-sm p-4">
      <h2 className="text-xl font-semibold mb-4 text-zinc-800 dark:text-zinc-100">
        {locale === "pl-PL"
          ? "Wynagrodzenie a Średnia Krajowa"
          : "Salary vs Gross National Average"}
      </h2>

      <ResponsiveContainer width="100%" height="90%">
        <ComposedChart
          data={parsedData}
          margin={{ top: 20, right: 40, bottom: 20, left: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="monthLabel" tick={{ fill: "#71717a" }} />
          <YAxis
            tick={{ fill: "#71717a" }}
            tickFormatter={(val) => `${val.toLocaleString()}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />

          {/* Net area */}
          <Area
            type="monotone"
            dataKey="net"
            stroke="#0a3d62"
            fill="#3c6382"
            name={locale === "pl-PL" ? "Netto" : "Net"}
          />

          {/* Gross layer */}
          <Area
            type="monotone"
            dataKey="grossLayer"
            stroke="#60a3bc"
            fill="#82ccdd"
            name={locale === "pl-PL" ? "Brutto" : "Gross"}
            connectNulls={false}
          />

          {/* Bonus overlay */}
          <Area
            type="monotone"
            dataKey={(entry) => (entry.type === "Bonus" ? entry.net : null)}
            stroke="#f7b731"
            fill="#fed330"
            name={locale === "pl-PL" ? "Bonus dolce vita" : "Bonus dolce vita"}
          />

          {/* GNA line */}
          <Line
            type="monotone"
            dataKey="gna"
            stroke="#079992"
            strokeWidth={3}
            dot={false}
            activeDot={false}
            name={
              locale === "pl-PL"
                ? "Średnia krajowa brutto"
                : "Gross National Average"
            }
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PublisherCareerChart;
