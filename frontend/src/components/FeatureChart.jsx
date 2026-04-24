import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

const FeatureChart = ({ formData }) => {
  const data = Object.keys(formData).map((key) => ({
    name: key,
    value: formData[key]
  }));

  return (
    <BarChart width={350} height={250} data={data}>
      <XAxis dataKey="name" hide />
      <YAxis />
      <Tooltip />
      <Bar dataKey="value" />
    </BarChart>
  );
};

export default FeatureChart;