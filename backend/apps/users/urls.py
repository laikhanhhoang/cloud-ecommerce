from django.urls import path

from apps.users.views import MyProfileView

urlpatterns = [
    path('me/', MyProfileView.as_view(), name='user_me'),
]