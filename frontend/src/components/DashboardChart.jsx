import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatMoney } from "../utils/format";

export default function DashboardChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data}>
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip
          formatter={(value, name) => [formatMoney(value), name]}
        />
        <Legend />

        <Line name="Totais" type="monotone" dataKey="totals" stroke="#3b82f6" strokeWidth={3} />
        <Line name="Parcelas" type="monotone" dataKey="commitments" stroke="#f59e0b" />
        <Line name="Meta" type="monotone" dataKey="goals" stroke="#ef4444" strokeDasharray="3 3" />
        <Line name="Média" type="monotone" dataKey="avg"   stroke="#ab0bf5" strokeWidth={2} strokeDasharray="6 6" />
      </LineChart>
    </ResponsiveContainer>
  );
}