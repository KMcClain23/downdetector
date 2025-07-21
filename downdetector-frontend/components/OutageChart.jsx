import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function OutageChart({ outages }) {
  const data = outages.map((o) => ({
    time: new Date(o.reportedAt).toLocaleTimeString(),
    count: 1,
  }));

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-2">Outage Timeline</h2>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid stroke="#ccc" />
          <XAxis dataKey="time" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
