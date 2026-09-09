import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const RAW = `category,classification,font_count,pct_of_category
Adult,sans-serif,102,68.46
Adult,monospace,32,21.48
Adult,icon-font,8,5.37
Adult,serif,3,2.01
Adult,handwriting,2,1.34
Adult,display,1,0.67
Adult,system-ui,1,0.67
Business,sans-serif,939,65.03
Business,icon-font,180,12.47
Business,monospace,164,11.36
Business,serif,110,7.62
Business,display,35,2.42
Business,handwriting,13,0.9
Business,system-ui,3,0.21
Education,sans-serif,1162,56.77
Education,icon-font,381,18.61
Education,serif,258,12.6
Education,monospace,198,9.67
Education,display,25,1.22
Education,handwriting,21,1.03
Education,script,1,0.05
Education,system-ui,1,0.05
Entertainment,sans-serif,543,67.45
Entertainment,monospace,101,12.55
Entertainment,icon-font,66,8.2
Entertainment,serif,62,7.7
Entertainment,display,15,1.86
Entertainment,system-ui,15,1.86
Entertainment,handwriting,3,0.37
Finance,sans-serif,296,66.67
Finance,monospace,55,12.39
Finance,icon-font,45,10.14
Finance,serif,31,6.98
Finance,display,8,1.8
Finance,system-ui,5,1.13
Finance,handwriting,4,0.9
Food and Drink,sans-serif,92,63.01
Food and Drink,serif,22,15.07
Food and Drink,icon-font,12,8.22
Food and Drink,monospace,11,7.53
Food and Drink,display,7,4.79
Food and Drink,script,1,0.68
Food and Drink,system-ui,1,0.68
Gaming,sans-serif,356,68.59
Gaming,monospace,97,18.69
Gaming,icon-font,44,8.48
Gaming,serif,13,2.5
Gaming,display,8,1.54
Gaming,handwriting,1,0.19
Government,sans-serif,757,57.57
Government,icon-font,214,16.27
Government,serif,171,13
Government,monospace,161,12.24
Government,handwriting,10,0.76
Government,display,1,0.08
Government,script,1,0.08
Health,sans-serif,417,61.32
Health,icon-font,102,15
Health,monospace,78,11.47
Health,serif,67,9.85
Health,display,11,1.62
Health,handwriting,4,0.59
Health,system-ui,1,0.15
Jobs,sans-serif,78,70.27
Jobs,monospace,15,13.51
Jobs,icon-font,9,8.11
Jobs,serif,6,5.41
Jobs,system-ui,2,1.8
Jobs,handwriting,1,0.9
News,sans-serif,2090,64.25
News,serif,646,19.86
News,icon-font,218,6.7
News,monospace,210,6.46
News,display,58,1.78
News,handwriting,19,0.58
News,system-ui,11,0.34
News,script,1,0.03
Other,sans-serif,214,67.08
Other,icon-font,41,12.85
Other,monospace,33,10.34
Other,serif,20,6.27
Other,display,9,2.82
Other,script,1,0.31
Other,system-ui,1,0.31
Real Estate,sans-serif,30,65.22
Real Estate,serif,6,13.04
Real Estate,icon-font,5,10.87
Real Estate,display,2,4.35
Real Estate,monospace,2,4.35
Real Estate,system-ui,1,2.17
Reference,sans-serif,799,62.47
Reference,serif,189,14.78
Reference,monospace,165,12.9
Reference,icon-font,105,8.21
Reference,display,11,0.86
Reference,system-ui,6,0.47
Reference,handwriting,4,0.31
Science,sans-serif,316,61.72
Science,icon-font,68,13.28
Science,serif,66,12.89
Science,monospace,54,10.55
Science,handwriting,5,0.98
Science,display,3,0.59
Shopping,sans-serif,482,69.25
Shopping,monospace,85,12.21
Shopping,icon-font,53,7.61
Shopping,serif,43,6.18
Shopping,display,13,1.87
Shopping,handwriting,12,1.72
Shopping,system-ui,7,1.01
Shopping,script,1,0.14
Social Media,sans-serif,317,68.32
Social Media,monospace,62,13.36
Social Media,icon-font,36,7.76
Social Media,serif,15,3.23
Social Media,display,14,3.02
Social Media,system-ui,13,2.8
Social Media,handwriting,7,1.51
Sports,sans-serif,168,68.02
Sports,monospace,25,10.12
Sports,icon-font,23,9.31
Sports,serif,15,6.07
Sports,display,11,4.45
Sports,handwriting,3,1.21
Sports,system-ui,2,0.81
Technology,sans-serif,3421,67.89
Technology,monospace,767,15.22
Technology,icon-font,471,9.35
Technology,serif,225,4.47
Technology,display,75,1.49
Technology,system-ui,52,1.03
Technology,handwriting,25,0.5
Technology,script,3,0.06
Travel,sans-serif,290,65.32
Travel,monospace,46,10.36
Travel,serif,46,10.36
Travel,icon-font,44,9.91
Travel,display,11,2.48
Travel,handwriting,4,0.9
Travel,system-ui,2,0.45
Travel,script,1,0.23`;

// Fixed order + color for each classification, so a color always means
// the same thing across every row.
const CLASSIFICATIONS = [
  { key: 'sans-serif', color: '#CCB7AE' },
  { key: 'serif', color: '#D6CFCB' },
  { key: 'monospace', color: '#A6808C' },
  { key: 'icon-font', color: '#889188' },
  { key: 'display', color: '#9EE37D' },
  { key: 'handwriting', color: '#b97abc' },
  { key: 'system-ui', color: '#b48eb5' },
  { key: 'script', color: '#8A897C' },
];

// Widest category label determines how much left-hand room the axis needs.
const Y_AXIS_WIDTH = 110;

function parseData() {
  const rows = RAW.trim()
    .split('\n')
    .slice(1)
    .map((line) => {
      const [category, classification, font_count, pct_of_category] = line.split(',');
      return {
        category,
        classification,
        count: Number(font_count),
        pct: Number(pct_of_category),
      };
    });

  const byCategory: Record<string, Record<string, any>> = {};
  for (const row of rows) {
    if (!byCategory[row.category]) {
      // Default every classification to 0 so missing ones don't come
      // through as `undefined`, which breaks the stack's total width.
      byCategory[row.category] = { category: row.category };
      for (const { key } of CLASSIFICATIONS) {
        byCategory[row.category][key] = 0;
        byCategory[row.category][`${key}__count`] = 0;
      }
    }
    byCategory[row.category][row.classification] = row.pct;
    byCategory[row.category][`${row.classification}__count`] = row.count;
  }
  return Object.values(byCategory);
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: any[];
  label?: string;
}) {
  if (!active || !payload || !payload.length) return null;
  const sorted = [...payload]
    .filter((p) => p.value > 0)
    .sort((a, b) => b.value - a.value);

  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: 6,
        padding: '10px 12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        fontSize: 13,
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 6, color: '#0f172a' }}>{label}</div>
      {sorted.map((p) => (
        <div
          key={p.dataKey}
          style={{ display: 'flex', justifyContent: 'space-between', gap: 16, color: '#334155' }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: 2,
                background: p.fill,
                display: 'inline-block',
              }}
            />
            {p.dataKey}
          </span>
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>
            {p.value.toFixed(1)}%{' '}
            <span style={{ color: '#94a3b8' }}>
              ({p.payload[`${p.dataKey}__count`]?.toLocaleString()})
            </span>
          </span>
        </div>
      ))}
    </div>
  );
}

// Recharts right-aligns category tick text against the axis line by
// default. Render our own <text> anchored to the left (x=0) instead so
// labels sit flush against the chart's left edge.
function LeftAlignedYAxisTick({ x, y, payload }: { x?: number; y?: number; payload?: any }) {
  return (
    <text x={0} y={y} dy={4} textAnchor="start" fontSize={12} fill="#334155">
      {payload.value}
    </text>
  );
}

export default function FontClassificationChart() {
  const data = useMemo(() => parseData(), []);
  const rowHeight = 34;
  const chartHeight = Math.max(400, data.length * rowHeight + 80);

  return (
    <div>
      <div style={{ width: '100%', fontSize: 14, marginBottom: 14 }}>
        Font classifications by website category
      </div>

      <div style={{ width: '100%', height: chartHeight }}>
        <ResponsiveContainer>
          <BarChart
            data={data}
            layout="vertical"
            barCategoryGap={10}
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          >
            <XAxis
              type="number"
              domain={[0, 100]}
              allowDataOverflow
              padding={{ left: 0, right: 0 }}
              tickFormatter={(t) => `${t}%`}
              tick={{ fontSize: 12, fill: '#64748b' }}
              axisLine={{ stroke: 'none' }}
              tickLine={false}
            />
            <YAxis
              dataKey="category"
              type="category"
              width={Y_AXIS_WIDTH}
              tick={<LeftAlignedYAxisTick />}
              axisLine={{ stroke: 'none' }}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(15,23,42,0.04)' }} />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} iconType="square" iconSize={10} />
            {CLASSIFICATIONS.map(({ key, color }) => (
              <Bar
                key={key}
                dataKey={key}
                stackId="a"
                fill={color}
                name={key}
                radius={0}
                isAnimationActive={false}
                maxBarSize={26}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}