from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    # wire up the api routes from the oracle app
    path('api/', include('oracle.urls')), 
]