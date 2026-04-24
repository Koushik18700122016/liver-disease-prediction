import React from "react";
import { RadialBarChart, RadialBar, Legend } from "recharts";

const RiskChart = ({ probability }) => {
  const data = [
    {
      name: "Risk",
      value: probability * 100,
      fill: "#ff4d4f"
    }
  ];

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <RadialBarChart
        width={250}
        height={250}
        innerRadius="70%"
        outerRadius="100%"
        data={data}
        startAngle={180}
        endAngle={0}
      >
        <RadialBar minAngle={15} dataKey="value" />
        <Legend
          iconSize={10}
          layout="vertical"
          verticalAlign="middle"
          wrapperStyle={{ color: "white" }}
        />
      </RadialBarChart>
    </div>
  );
};

export default RiskChart;