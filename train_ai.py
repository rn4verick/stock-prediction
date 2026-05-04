import pandas as pd
from sklearn.ensemble import RandomForestClassifier
import joblib

# training data 
# 1 = up, 0 = down
dummy_data = {
    'rsi': [80, 20, 60, 90, 30, 50, 85, 25],
    'momentum': [0, 1, 1, 0, 1, 0, 0, 1],
    'volume_spike': [1, 1, 0, 1, 0, 0, 1, 1],
    'will_rise': [0, 1, 1, 0, 1, 0, 0, 1] 
}

df = pd.DataFrame(dummy_data)

# features vs target
X = df[['rsi', 'momentum', 'volume_spike']]
y = df['will_rise']

# fit the model 
model = RandomForestClassifier(random_state=42)
model.fit(X, y)

# save it so django can read it later
joblib.dump(model, 'stock_predictor.pkl')
print("Model trained and saved! Don't forget to move it to the config folder.")