import React from "react";
import Form from "../components/Form";
import ResultCard from "../components/ResultCard";

const Home = () => {
  const [result, setResult] = React.useState(null);
  const [formData, setFormData] = React.useState(null);

  return (
    <div className="app-container">
      <Form setResult={setResult} setFormData={setFormData} />
      <ResultCard result={result} formData={formData} />
    </div>
  );
};

export default Home;