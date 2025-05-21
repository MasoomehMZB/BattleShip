from django.urls import path
from rest_framework.authtoken.views import obtain_auth_token
from api.views import AccountDataView, ArrangeBoardView, CreateGameAPIView, HitView, JoinGameView, RegisterAPIView, LeaderboardAPIView, MyGamesAPIView, WaitingGamesListView, GameRulesByGameView

urlpatterns = [
    path('register/', RegisterAPIView.as_view()),
    path('login/', obtain_auth_token, name='api_token_auth'),
    path('account/', AccountDataView.as_view()),
    
    path('create-game/', CreateGameAPIView.as_view()),
    path('waiting-games/', WaitingGamesListView.as_view()),
    path('join-game/<int:game_id>/', JoinGameView.as_view(), name='join-game'),
    path('game-rules/<int:game_id>/', GameRulesByGameView.as_view(), name='game-rules'),
    path('arrange-board/<int:game_id>/', ArrangeBoardView.as_view(), name='arrange-board'),
    path('hit/<int:game_id>/', HitView.as_view(), name='hit'),
    
    path('players/', LeaderboardAPIView.as_view()),
    path('history/', MyGamesAPIView.as_view()),
    
    ]