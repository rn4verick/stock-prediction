from rest_framework.decorators import api_view
from rest_framework.response import Response
import joblib
import random
import os

@api_view(['POST'])
def predict_stock(request):
    # grab the model from the config folder
    try:
        # had to use dirname twice to go up two levels 
        base_dir = os.path.dirname(os.path.dirname(__file__))
        model_path = os.path.join(base_dir, 'stock_predictor.pkl')
        ai_model = joblib.load(model_path)
    except Exception as e:
        print("CRASH LOADING MODEL:", e) # debug
        return Response({'prediction': f"Error loading model: {e}"})

    # get ticker from frontend request
    ticker = request.data.get('ticker', 'UNKNOWN').upper()
    
    # rem: hook this up to the yahoo finance api later before grading
    # using fake data for now to test the ML model logic
    fake_rsi = random.randint(10, 95)
    is_positive_momentum = random.choice([0, 1])
    fake_vol = random.choice([0, 1])
    
    # predict expects a 2D array
    prediction = ai_model.predict([[fake_rsi, is_positive_momentum, fake_vol]])[0]
    
    if prediction == 1:
        result = f"📈 {ticker} is going UP! (Buy Signal)"
    else:
        result = f"📉 {ticker} is going DOWN! (Sell/Short Signal)"
    
    # send stats back so the UI looks cool
    stats = f"RSI: {fake_rsi} | Momentum: {'Positive' if is_positive_momentum else 'Negative'}"
    
    return Response({
        'prediction': result, 
        'stats': stats, 
        'ticker': ticker
    })