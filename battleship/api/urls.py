from django.urls import path
from rest_framework.authtoken.views import obtain_auth_token
from api.views import AccountDataAPIView, ArrangeBoardAPIView, CreateGameAPIView, GetBoardShipsAPIView, HitAPIView, JoinGameAPIView, RegisterAPIView, LeaderboardAPIView, MyGamesAPIView, SurrenderGameAPIView, WaitingGamesListAPIView

urlpatterns = [
    path('register/', RegisterAPIView.as_view()),
    path('login/', obtain_auth_token, name='api_token_auth'),
    path('account/', AccountDataAPIView.as_view()),
    
    path('create-game/', CreateGameAPIView.as_view()),
    path('join-game/<int:game_id>/', JoinGameAPIView.as_view(), name='join-game'),
    path('arrange-board/<int:game_id>/', ArrangeBoardAPIView.as_view(), name='arrange-board'),
    path('hit/<int:game_id>/', HitAPIView.as_view(), name='hit'),
    path('opponent-ships/<int:game_id>/', GetBoardShipsAPIView.as_view(), name='opponent-ships'),
    path('surrender/<int:game_id>/', SurrenderGameAPIView.as_view(), name='surrender'),
    
    path('leaderboard/', LeaderboardAPIView.as_view()),
    path('history/', MyGamesAPIView.as_view()),
    path('active-games/', WaitingGamesListAPIView.as_view(), name='active-games'),
    
    # path('account/register/', RegisterAPIView.as_view()),
    # path('account/login/', obtain_auth_token, name='api_token_auth'),
    # path('account/me/', AccountDataAPIView.as_view()),
    
    # path('games/', CreateGameAPIView.as_view()),
    # path('games/<int:game_id>/join/', JoinGameAPIView.as_view(), name='join-game'),
    # path('games/<int:game_id>/board/', ArrangeBoardAPIView.as_view(), name='arrange-board'),
    # path('games/<int:game_id>/shots/', HitAPIView.as_view(), name='hit'),
    # path('/games/<int:game_id>/opponent/ships/', GetBoardShipsAPIView.as_view(), name='opponent-ships'),
    # path('games/<int:game_id>/surrender', SurrenderGameAPIView.as_view(), name='surrender'),
    
    # path('games/leaderboard/', LeaderboardAPIView.as_view()),
    # path('games/history/', MyGamesAPIView.as_view()),
    # path('games/active/', WaitingGamesListAPIView.as_view(), name='active-games'),
    ]