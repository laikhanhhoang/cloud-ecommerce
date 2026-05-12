from django.urls import path

from apps.users.views import MyProfileView

urlpatterns = [
    path('profile/me/', MyProfileView.as_view(), name='user_me'),
]