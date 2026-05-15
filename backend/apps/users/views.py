# Third-party imports
from rest_framework import generics, request, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

# Local imports
from apps.users.models import UserProfile
from apps.users.serializers import ProfileSerializer



# api/profile/me - API để lấy thông tin người dùng hiện tại

class MyProfileView(generics.GenericAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_object(self):
        """Lấy đúng profile của user đang đăng nhập"""
        profile, _ = UserProfile.objects.get_or_create(user=self.request.user)
        return profile

    def get(self, request, *args, **kwargs):
        """Tự định nghĩa logic lấy thông tin"""
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def patch(self, request, *args, **kwargs):
        """Tự định nghĩa logic cập nhật một phần (partial update)"""
        instance = self.get_object()
        
        # partial=True là chìa khóa để thực hiện PATCH thay vì PUT
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response({
                "message": "Thông tin hồ sơ đã được cập nhật thành công!", 
                "data": serializer.data
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)