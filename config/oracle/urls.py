from django.urls import path
from . import views

urlpatterns = [
    # endpoint: /api/predict/
    path('predict/', views.predict_stock, name='predict_stock'),
]