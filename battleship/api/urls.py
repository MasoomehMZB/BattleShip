from django.urls import path
from rest_framework.authtoken.views import obtain_auth_token
from api.views import AccountDataAPIView, ArrangeBoardAPIView, ChangePersonalDataAPIView, CreateGameAPIView, GameRulesByGameAPIView, GetBoardShipsAPIView, HitAPIView, JoinGameAPIView, PlayerTurnAPIView, RegisterAPIView, LeaderboardAPIView, MyGamesAPIView, SurrenderGameAPIView, WaitingGamesListAPIView

urlpatterns = [    
    path('account/register/', RegisterAPIView.as_view()),
    path('account/login/', obtain_auth_token, name='api_token_auth'),
    path('account/me/', AccountDataAPIView.as_view()),
    path('account/me/edit/', ChangePersonalDataAPIView.as_view(), name='active-games'),
    
    path('games/create/', CreateGameAPIView.as_view()),
    path('games/<int:game_id>/join/', JoinGameAPIView.as_view(), name='join-game'),
    path('games/<int:game_id>/rules/', GameRulesByGameAPIView.as_view(), name='game-rules'),
    path('games/<int:game_id>/board/', ArrangeBoardAPIView.as_view(), name='arrange-board'),
    path('games/<int:game_id>/shots/', HitAPIView.as_view(), name='hit'),
    path('games/<int:game_id>/ships/', GetBoardShipsAPIView.as_view(), name='user-ships'),
    path('games/<int:game_id>/surrender/', SurrenderGameAPIView.as_view(), name='surrender'),
    path('games/<int:game_id>/turn/', PlayerTurnAPIView.as_view(), name='player-turn'),
    
    path('games/leaderboard/', LeaderboardAPIView.as_view()),
    path('games/history/', MyGamesAPIView.as_view()),
    path('games/waiting/', WaitingGamesListAPIView.as_view(), name='active-games'),
    ]