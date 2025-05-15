from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from api.views import AccountDataView, CreateGameAPIView, JoinGameView, RegisterAPIView

urlpatterns = [
    path('register/', RegisterAPIView.as_view()),
    path('login/', TokenObtainPairView.as_view()),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('account/', AccountDataView.as_view()),
    path('create-game/', CreateGameAPIView.as_view()),
    path('join-game/<int:game_id>/', JoinGameView.as_view(), name='join-game'),
    ]