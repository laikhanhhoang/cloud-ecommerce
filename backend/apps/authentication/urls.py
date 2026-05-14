from django.urls import path

from apps.authentication.views import RegisterView, LoginView, LogoutView, UserMeView, CustomTokenRefreshView

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='user_register'),
    path('auth/login/', LoginView.as_view(), name='user_login'),
    path('auth/logout/', LogoutView.as_view(), name='user_logout'),
    path('auth/me/', UserMeView.as_view(), name='user_me'),
    path('auth/token/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
]