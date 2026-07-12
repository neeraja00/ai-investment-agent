import Chart from "react-apexcharts";
import { Activity } from "lucide-react";

export default function ChartCard({ data, ticker }) {
  if (!data || data.length === 0) return null;

  const series = [{
    name: 'Price',
    data: data.map(d => ({
      x: new Date(d.date).getTime(),
      y: [d.open, d.high, d.low, d.close]
    }))
  }];

  const options = {
    chart: {
      type: 'candlestick',
      height: 350,
      background: 'transparent',
      toolbar: { show: false },
      animations: { enabled: false },
      fontFamily: 'inherit'
    },
    theme: { mode: 'dark' },
    xaxis: {
      type: 'datetime',
      labels: { style: { colors: 'var(--text-muted)' } },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: {
      tooltip: { enabled: true },
      labels: {
        style: { colors: 'var(--text-muted)' },
        formatter: (val) => `$${val.toFixed(2)}`
      }
    },
    grid: {
      borderColor: 'rgba(255,255,255,0.05)',
      strokeDashArray: 4,
    },
    plotOptions: {
      candlestick: {
        colors: {
          upward: '#10b981',
          downward: '#ef4444'
        }
      }
    }
  };

  return (
    <div className="card" style={{ padding: "24px" }}>
      <h3 style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <Activity size={20} color="var(--accent-pink)" /> 30-Day Price History
      </h3>
      <div style={{ width: "100%", height: 350 }}>
        <Chart options={options} series={series} type="candlestick" height="100%" />
      </div>
    </div>
  );
}
