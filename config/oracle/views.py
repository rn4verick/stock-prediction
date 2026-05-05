from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import SavedPrediction
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

# --- USER REGISTRATION ---
@api_view(['POST'])
def register_user(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    # check if they are trying to steal a name
    if User.objects.filter(username=username).exists():
        return Response({"error": "Username already taken"}, status=400)
        
    # create and save the new user securely
    user = User.objects.create_user(username=username, password=password)
    return Response({"message": "User created successfully!"})

# --- USER LOGIN ---
@api_view(['POST'])
def login_user(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    # django checks the database for us
    user = authenticate(username=username, password=password)
    
    if user is not None:
        return Response({"message": "Login successful", "username": username})
    else:
        return Response({"error": "Invalid credentials"}, status=400)
    
@api_view(['POST'])
def add_to_watchlist(request):
    # CREATE: grab data from the frontend and shove it into MySQL
    who_is_it = request.data.get('username')
    user_account = User.objects.get(username=who_is_it)
    
    SavedPrediction.objects.create(
        owner=user_account, 
        ticker_symbol=request.data.get('ticker'), 
        prediction_text=request.data.get('prediction')
    )
    return Response({"message": "Successfully saved!"})

@api_view(['GET'])
def fetch_my_watchlist(request):
    # READ: find everything belonging to this specific user
    who_is_it = request.query_params.get('username')
    user_account = User.objects.get(username=who_is_it)
    
    # grab the list and format it for React
    my_stocks = SavedPrediction.objects.filter(owner=user_account).values('id', 'ticker_symbol', 'prediction_text')
    return Response(list(my_stocks))

@api_view(['DELETE'])
def drop_from_watchlist(request, item_id):
    # DELETE: nuke it by its ID
    SavedPrediction.objects.get(id=item_id).delete()
    return Response({"message": "Deleted from list"})