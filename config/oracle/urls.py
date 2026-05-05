from django.urls import path
from . import views 


urlpatterns = [
    path('predict/', views.predict_stock, name='predict_stock'),
    path('register/', views.register_user, name='register'),
    path('login/', views.login_user, name='login'),
    
    
    path('save-it/', views.add_to_watchlist, name='save_stock'),
    path('get-list/', views.fetch_my_watchlist, name='get_watchlist'),
    path('remove-it/<int:item_id>/', views.drop_from_watchlist, name='delete_stock'),
]