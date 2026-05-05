from django.db import models
from django.contrib.auth.models import User

# this is the blueprint for our database table
class SavedPrediction(models.Model):
    # link this entry to a specific user
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    
    # what we're actually storing
    ticker_symbol = models.CharField(max_length=50)
    prediction_text = models.CharField(max_length=500)
    date_saved = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.owner.username} saved {self.ticker_symbol}"