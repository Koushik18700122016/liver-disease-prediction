import { useState } from "react";
import {
  RadialBarChart,
  RadialBar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const FIELDS = [
  { name: "Age", label: "Age", step: 1, min: 1, max: 120, unit: "yrs", group: "demographic" },
  { name: "Total_Bilirubin", label: "Total Bilirubin", step: 0.1, unit: "mg/dL", group: "bilirubin" },
  { name: "Direct_Bilirubin", label: "Direct Bilirubin", step: 0.1, unit: "mg/dL", group: "bilirubin" },
  { name: "Alkphose", label: "Alkaline Phosphatase", step: 1, unit: "U/L", group: "enzymes" },
  { name: "Sgpt", label: "SGPT (ALT)", step: 1, unit: "U/L", group: "enzymes" },
  { name: "Sgot", label: "SGOT (AST)", step: 1, unit: "U/L", group: "enzymes" },
  { name: "TP", label: "Total Protein", step: 0.1, unit: "g/dL", group: "proteins" },
  { name: "ALB", label: "Albumin", step: 0.1, unit: "g/dL", group: "proteins" },
  { name: "A_G_Ratio", label: "A/G Ratio", step: 0.01, unit: "", group: "proteins" },
];

const GROUP_LABELS = {
  demographic: "Demographics",
  bilirubin: "Bilirubin Markers",
  enzymes: "Liver Enzymes",
  proteins: "Proteins",
};

const INITIAL_FORM = {
  Age: "", Gender: "",
  Total_Bilirubin: "", Direct_Bilirubin: "",
  Alkphose: "", Sgpt: "", Sgot: "",
  TP: "", ALB: "", A_G_Ratio: "",
};

const getRiskLevel = (pct) => {
  if (pct > 70) return { label: "High Risk", color: "#f87171", icon: "⚠️", bg: "rgba(248,113,113,0.12)" };
  if (pct > 40) return { label: "Moderate Risk", color: "#fbbf24", icon: "⚡", bg: "rgba(251,191,36,0.12)" };
  return { label: "Low Risk", color: "#34d399", icon: "✓", bg: "rgba(52,211,153,0.12)" };
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, padding: "8px 14px", fontSize: 12, color: "#94a3b8" }}>
        <span style={{ color: "#e2e8f0", fontWeight: 600 }}>{payload[0].name}</span>: {payload[0].value}
      </div>
    );
  }
  return null;
};

export default function LiverDashboard() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((er) => ({ ...er, [name]: false }));
  };

  const handleSubmit = async () => {
    const newErrors = {};
    let valid = true;

    Object.entries(INITIAL_FORM).forEach(([k]) => {
      const val = form[k];
      if (val === "" || (k !== "Gender" && isNaN(parseFloat(val)))) {
        newErrors[k] = true;
        valid = false;
      }
    });

    if (!valid) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Age: parseFloat(form.Age),
          Gender: parseInt(form.Gender),
          Total_Bilirubin: parseFloat(form.Total_Bilirubin),
          Direct_Bilirubin: parseFloat(form.Direct_Bilirubin),
          Alkphose: parseFloat(form.Alkphose),
          Sgpt: parseFloat(form.Sgpt),
          Sgot: parseFloat(form.Sgot),
          TP: parseFloat(form.TP),
          ALB: parseFloat(form.ALB),
          A_G_Ratio: parseFloat(form.A_G_Ratio),
        }),
      });

      const data = await res.json();
      setResult(data);
    } catch (error) {
      console.error("Prediction failed:", error);
      alert("Server error. Make sure FastAPI is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => { setForm(INITIAL_FORM); setResult(null); setErrors({}); };

  const risk = result ? getRiskLevel(result.probability * 100) : null;

  const chartData = FIELDS.map((f) => ({
    name: f.label.split(" ")[0],
    fullName: f.label,
    value: parseFloat(form[f.name]) || 0,
  }));

  const radialData = result ? [{ value: result.probability * 100, fill: risk.color }] : [];

  const groups = [...new Set(FIELDS.map((f) => f.group))];

  return (
    <div style={{
      minHeight: "100vh",
      background: "#060b14",
      fontFamily: "'DM Mono', 'Fira Code', 'Courier New', monospace",
      color: "#e2e8f0",
      padding: "0",
      margin: 0,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@700;800&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; } 
        ::-webkit-scrollbar-track { background: #0f172a; }
        ::-webkit-scrollbar-thumb { background: #1e3a5f; border-radius: 2px; }
        input, select { outline: none; }
        input:focus, select:focus { border-color: #38bdf8 !important; box-shadow: 0 0 0 2px rgba(56,189,248,0.15) !important; }
        .field-row { transition: all 0.15s ease; }
        .field-row:hover label { color: #93c5fd !important; }
        .submit-btn { transition: all 0.2s ease; cursor: pointer; }
        .submit-btn:hover { background: #0ea5e9 !important; transform: translateY(-1px); box-shadow: 0 8px 25px rgba(14,165,233,0.35) !important; }
        .submit-btn:active { transform: translateY(0); }
        .reset-btn { transition: all 0.2s ease; cursor: pointer; }
        .reset-btn:hover { background: rgba(148,163,184,0.1) !important; }
        @keyframes fadeUp { from { opacity:0; transform: translateY(16px); } to { opacity:1; transform: translateY(0); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
        .result-card { animation: fadeUp 0.4s ease forwards; }
        .spinner { animation: spin 0.8s linear infinite; display: inline-block; }
        .risk-badge { animation: fadeUp 0.3s 0.1s ease both; }
        .error-shake { border-color: #f87171 !important; animation: shake 0.3s ease; }
        @keyframes shake { 0%,100% { transform:translateX(0); } 25% { transform:translateX(-4px); } 75% { transform:translateX(4px); } }
      `}</style>

      {/* Header */}
      <div style={{ background: "linear-gradient(180deg, #0c1829 0%, #060b14 100%)", borderBottom: "1px solid #0f2744", padding: "20px 40px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #0ea5e9, #6366f1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🫀</div>
          <div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 800, letterSpacing: "-0.5px", color: "#f1f5f9" }}>HepatoScan</div>
            <div style={{ fontSize: 10, color: "#475569", letterSpacing: "0.1em", textTransform: "uppercase" }}>Liver Disease Risk Predictor</div>
          </div>
        </div>
        <div style={{ fontSize: 10, color: "#1e3a5f", letterSpacing: "0.12em", textTransform: "uppercase" }}>Diagnostic Tool v2.0</div>
      </div>

      <div style={{ display: "flex", gap: 0, minHeight: "calc(100vh - 77px)" }}>

        {/* LEFT — Input Panel */}
        <div style={{ width: 420, flexShrink: 0, background: "#080e1a", borderRight: "1px solid #0f2744", padding: "32px 28px", overflowY: "auto" }}>

          {/* Gender */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 10, color: "#38bdf8", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 14, fontWeight: 500 }}>Demographics</div>
            <div className="field-row" style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 11, color: "#64748b", marginBottom: 6, letterSpacing: "0.05em" }}>GENDER</label>
              <select
                name="Gender"
                value={form.Gender}
                onChange={handleChange}
                className={errors.Gender ? "error-shake" : ""}
                style={{
                  width: "100%", padding: "10px 14px", background: "#0c1829",
                  border: `1px solid ${errors.Gender ? "#f87171" : "#1e3a5f"}`,
                  borderRadius: 8, color: form.Gender === "" ? "#334155" : "#e2e8f0",
                  fontSize: 13, appearance: "none",
                }}
              >
                <option value="">Select gender</option>
                <option value="1">Male</option>
                <option value="0">Female</option>
              </select>
            </div>
          </div>

          {/* Grouped Fields */}
          {groups.filter(g => g !== "demographic").map((group) => (
            <div key={group} style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 10, color: "#38bdf8", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 14, fontWeight: 500 }}>
                {GROUP_LABELS[group]}
              </div>
              {FIELDS.filter((f) => f.group === group).map((field) => (
                <div key={field.name} className="field-row" style={{ marginBottom: 12 }}>
                  <label style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748b", marginBottom: 6, letterSpacing: "0.04em" }}>
                    <span>{field.label.toUpperCase()}</span>
                    {field.unit && <span style={{ color: "#1e3a5f" }}>{field.unit}</span>}
                  </label>
                  <input
                    type="number"
                    name={field.name}
                    value={form[field.name]}
                    onChange={handleChange}
                    step={field.step}
                    min={field.min}
                    max={field.max}
                    placeholder="—"
                    className={errors[field.name] ? "error-shake" : ""}
                    style={{
                      width: "100%", padding: "10px 14px",
                      background: "#0c1829",
                      border: `1px solid ${errors[field.name] ? "#f87171" : "#1e3a5f"}`,
                      borderRadius: 8, color: "#e2e8f0", fontSize: 13,
                      transition: "border-color 0.15s",
                    }}
                  />
                </div>
              ))}
            </div>
          ))}

          {/* Age field separately */}
          <div style={{ marginBottom: 28 }}>
            {FIELDS.filter((f) => f.group === "demographic").map((field) => (
              <div key={field.name} className="field-row" style={{ marginBottom: 12 }}>
                <label style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748b", marginBottom: 6 }}>
                  <span>{field.label.toUpperCase()}</span>
                  <span style={{ color: "#1e3a5f" }}>{field.unit}</span>
                </label>
                <input
                  type="number"
                  name={field.name}
                  value={form[field.name]}
                  onChange={handleChange}
                  step={field.step}
                  min={field.min}
                  max={field.max}
                  placeholder="—"
                  className={errors[field.name] ? "error-shake" : ""}
                  style={{
                    width: "100%", padding: "10px 14px", background: "#0c1829",
                    border: `1px solid ${errors[field.name] ? "#f87171" : "#1e3a5f"}`,
                    borderRadius: 8, color: "#e2e8f0", fontSize: 13,
                  }}
                />
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button className="submit-btn" onClick={handleSubmit} style={{
              flex: 1, padding: "13px", background: "#0284c7", border: "none",
              borderRadius: 10, color: "#fff", fontFamily: "'DM Mono', monospace",
              fontSize: 12, fontWeight: 500, letterSpacing: "0.08em",
              boxShadow: "0 4px 15px rgba(2,132,199,0.3)",
            }}>
              {loading ? <span className="spinner">◌</span> : "▶  RUN ANALYSIS"}
            </button>
            <button className="reset-btn" onClick={handleReset} style={{
              padding: "13px 18px", background: "transparent",
              border: "1px solid #1e3a5f", borderRadius: 10, color: "#475569",
              fontFamily: "'DM Mono', monospace", fontSize: 12,
            }}>↺</button>
          </div>
        </div>

        {/* RIGHT — Results Panel */}
        <div style={{ flex: 1, padding: "32px 36px", overflowY: "auto" }}>

          {!result && !loading && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 16, opacity: 0.25 }}>
              <div style={{ fontSize: 64 }}>🫁</div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, letterSpacing: "-0.5px" }}>Awaiting Input</div>
              <div style={{ fontSize: 12, color: "#475569", textAlign: "center", maxWidth: 260, lineHeight: 1.8 }}>
                Fill in the patient details on the left and run the analysis to see results here.
              </div>
            </div>
          )}

          {loading && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 16 }}>
              <div style={{ fontSize: 36, animation: "pulse 1s infinite" }}>⬡</div>
              <div style={{ fontSize: 12, color: "#38bdf8", letterSpacing: "0.2em", textTransform: "uppercase" }}>Analyzing biomarkers…</div>
            </div>
          )}

          {result && !loading && (
            <div className="result-card">
              {/* Risk Banner */}
              <div className="risk-badge" style={{
                background: risk.bg, border: `1px solid ${risk.color}30`,
                borderRadius: 14, padding: "22px 28px", marginBottom: 28,
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <div>
                  <div style={{ fontSize: 11, color: "#64748b", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 6 }}>Assessment</div>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, color: risk.color, letterSpacing: "-1px" }}>
                    {risk.icon} {risk.label}
                  </div>
                  <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>
                    Confidence: <span style={{ color: risk.color, fontWeight: 600 }}>{(result.probability * 100).toFixed(1)}%</span>
                  </div>
                </div>
                {/* Radial gauge */}
                <div style={{ position: "relative", width: 130, height: 130 }}>
                  <RadialBarChart
                    width={130} height={130}
                    innerRadius="68%" outerRadius="90%"
                    data={radialData}
                    startAngle={220} endAngle={-40}
                    style={{ position: "absolute", top: 0, left: 0 }}
                  >
                    <RadialBar dataKey="value" background={{ fill: "#0f172a" }} cornerRadius={6} />
                  </RadialBarChart>
                  <div style={{
                    position: "absolute", inset: 0, display: "flex",
                    flexDirection: "column", alignItems: "center", justifyContent: "center",
                  }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: risk.color, fontFamily: "'Syne', sans-serif" }}>
                      {Math.round(result.probability * 100)}
                    </div>
                    <div style={{ fontSize: 9, color: "#475569", letterSpacing: "0.1em" }}>SCORE</div>
                  </div>
                </div>
              </div>

              {/* Chart */}
              <div style={{ background: "#080e1a", border: "1px solid #0f2744", borderRadius: 14, padding: "24px 20px", marginBottom: 24 }}>
                <div style={{ fontSize: 10, color: "#38bdf8", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 20 }}>Biomarker Profile</div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData} barCategoryGap="30%">
                    <XAxis dataKey="name" tick={{ fill: "#475569", fontSize: 10, fontFamily: "'DM Mono', monospace" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#1e3a5f", fontSize: 10 }} axisLine={false} tickLine={false} width={30} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(56,189,248,0.05)" }} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, i) => (
                        <Cell key={i} fill={`hsl(${200 + i * 12}, 80%, ${45 + i * 2}%)`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Summary table */}
              <div style={{ background: "#080e1a", border: "1px solid #0f2744", borderRadius: 14, padding: "24px 20px" }}>
                <div style={{ fontSize: 10, color: "#38bdf8", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16 }}>Input Summary</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0" }}>
                  {[{ label: "Gender", value: form.Gender === "1" ? "Male" : "Female" },
                  ...FIELDS.map((f) => ({ label: f.label, value: `${form[f.name]} ${f.unit}`.trim() }))
                  ].map((row, i) => (
                    <div key={i} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "9px 12px",
                      background: i % 2 === 0 ? "rgba(14,165,233,0.03)" : "transparent",
                      borderRadius: 6,
                    }}>
                      <span style={{ fontSize: 11, color: "#475569" }}>{row.label}</span>
                      <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Disclaimer */}
              <div style={{ marginTop: 20, padding: "14px 18px", background: "rgba(251,191,36,0.05)", border: "1px solid rgba(251,191,36,0.15)", borderRadius: 10 }}>
                <div style={{ fontSize: 10, color: "#92400e", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>⚠ Disclaimer</div>
                <div style={{ fontSize: 11, color: "#78716c", lineHeight: 1.7 }}>
                  This tool is for research purposes only and does not constitute medical advice. Always consult a licensed physician for diagnosis and treatment.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
