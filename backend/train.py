import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from imblearn.over_sampling import SMOTE
import joblib

columns = [
    'Age','Gender','Total_Bilirubin',
    'Direct_Bilirubin','Alkphose',
    'Sgpt','Sgot','TP','ALB','A/G_Ratio','Selector'
]

data = pd.read_csv("ILPD.csv", names=columns)

# Clean data
data = data.iloc[1:].copy()

data['Gender'] = data['Gender'].map({'Male':1, 'Female':0})
data['Selector'] = data['Selector'].map({1:1, 2:0})

# Convert numeric
for col in data.columns:
    data[col] = pd.to_numeric(data[col], errors='coerce')

# Fill missing
data.fillna(data.median(), inplace=True)

X = data.drop("Selector", axis=1)
y = data["Selector"]

# SMOTE
smote = SMOTE(random_state=42)
X_res, y_res = smote.fit_resample(X, y)

# Scale
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X_res)

# Train
model = RandomForestClassifier(n_estimators=200)
model.fit(X_scaled, y_res)

# Save
joblib.dump(model, "model.pkl")
joblib.dump(scaler, "scaler.pkl")

print("✅ Model trained & saved")