from fastapi import FastAPI
from pydantic import BaseModel
import numpy as np
import joblib
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow React connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = joblib.load("model.pkl")
scaler = joblib.load("scaler.pkl")

class Patient(BaseModel):
    Age: float
    Gender: int
    Total_Bilirubin: float
    Direct_Bilirubin: float
    Alkphose: float
    Sgpt: float
    Sgot: float
    TP: float
    ALB: float
    A_G_Ratio: float

@app.get("/")
def home():
    return {"message": "API Running"}

@app.post("/predict")
def predict(data: Patient):
    input_data = np.array([[
        data.Age, data.Gender, data.Total_Bilirubin,
        data.Direct_Bilirubin, data.Alkphose,
        data.Sgpt, data.Sgot, data.TP,
        data.ALB, data.A_G_Ratio
    ]])

    scaled = scaler.transform(input_data)
    pred = model.predict(scaled)[0]
    prob = model.predict_proba(scaled)[0][1]

    return {
        "prediction": int(pred),
        "probability": round(float(prob), 2)
    }