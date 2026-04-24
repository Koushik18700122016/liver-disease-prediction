import React, { useState } from "react";
import { predict } from "../services/api";
import ResultCard from "./ResultCard";

const Form = () => {
  const [form, setForm] = useState({
    Age: "",
    Gender: "",
    Total_Bilirubin: "",
    Direct_Bilirubin: "",
    Alkphose: "",
    Sgpt: "",
    Sgot: "",
    TP: "",
    ALB: "",
    A_G_Ratio: ""
  });

  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]:
        e.target.name === "Gender"
          ? Number(e.target.value)
          : parseFloat(e.target.value)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    for (let key in form) {
      if (form[key] === "" || isNaN(form[key])) {
        alert("Please fill all fields correctly");
        return;
      }
    }

    const res = await predict(form);
    setResult(res);
  };

  return (
    <div className="glass">
      <h2>Patient Details</h2>

      <form onSubmit={handleSubmit}>

        {/* Age */}
        <label>Age</label>
        <input
          type="number"
          name="Age"
          placeholder="Enter age"
          value={form.Age}
          onChange={handleChange}
          min="1"
          max="100"
        />

        {/* Gender */}
        <label>Gender</label>
        <select name="Gender" value={form.Gender} onChange={handleChange}>
          <option value="">Select Gender</option>
          <option value="1">Male</option>
          <option value="0">Female</option>
        </select>

        {/* Bilirubin */}
        <label>Total Bilirubin</label>
        <input
          type="number"
          step="0.1"
          name="Total_Bilirubin"
          value={form.Total_Bilirubin}
          onChange={handleChange}
        />

        <label>Direct Bilirubin</label>
        <input
          type="number"
          step="0.1"
          name="Direct_Bilirubin"
          value={form.Direct_Bilirubin}
          onChange={handleChange}
        />

        {/* Enzymes */}
        <label>Alkaline Phosphotase</label>
        <input
          type="number"
          name="Alkphose"
          value={form.Alkphose}
          onChange={handleChange}
        />

        <label>SGPT</label>
        <input
          type="number"
          name="Sgpt"
          value={form.Sgpt}
          onChange={handleChange}
        />

        <label>SGOT</label>
        <input
          type="number"
          name="Sgot"
          value={form.Sgot}
          onChange={handleChange}
        />

        {/* Proteins */}
        <label>Total Protein</label>
        <input
          type="number"
          step="0.1"
          name="TP"
          value={form.TP}
          onChange={handleChange}
        />

        <label>Albumin</label>
        <input
          type="number"
          step="0.1"
          name="ALB"
          value={form.ALB}
          onChange={handleChange}
        />

        <label>A/G Ratio</label>
        <input
          type="number"
          step="0.1"
          name="A_G_Ratio"
          value={form.A_G_Ratio}
          onChange={handleChange}
        />

        <button type="submit">Predict</button>
      </form>

      {result && <ResultCard result={result} formData={form} />}
    </div>
  );
};

export default Form;