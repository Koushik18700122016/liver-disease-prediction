const BASE_URL = import.meta.env.VITE_BACKEND_URL;
export const predict = async (data) => {
  const res = await fetch(`${BASE_URL}/predict`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  return res.json();
};