from django.urls import path

from apps.authentication.views import RegisterView, LoginView, LogoutView, UserMeView, CustomTokenRefreshView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='user_register'),
    path('login/', LoginView.as_view(), name='user_login'),
    path('logout/', LogoutView.as_view(), name='user_logout'),
    path('me/', UserMeView.as_view(), name='user_me'),
    path('token/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
]