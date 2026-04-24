import React from "react";
import RiskChart from "./RiskChart";
import FeatureChart from "./FeatureChart";

const ResultCard = ({ result, formData }) => {
  if (!result) {
    return (
      <div className="glass">
        <h2>Results</h2>
        <p>Fill the form and click predict</p>
      </div>
    );
  }

  const risk = result.probability * 100;

  const getColor = () => {
    if (risk > 70) return "#ff4d4f";
    if (risk > 40) return "#faad14";
    return "#52c41a";
  };

  return (
    <div className="glass">
      <h2>Prediction Result</h2>

      <h3 style={{ color: getColor() }}>
        {risk > 70 ? "High Risk ⚠️" :
         risk > 40 ? "Moderate Risk ⚡" :
         "Low Risk ✅"}
      </h3>

      <p>Confidence: {risk.toFixed(2)}%</p>

      <RiskChart probability={result.probability} />

      {formData && (
        <>
          <h4>Patient Data</h4>
          <FeatureChart formData={formData} />
        </>
      )}
    </div>
  );
};

export default ResultCard;