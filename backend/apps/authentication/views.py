from rest_framework import generics, status
from rest_framework.views import APIView

from apps.authentication.serializers import RegisterSerializer, LoginSerializer, CustomTokenObtainPairSerializer, CustomTokenRefreshSerializer
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView

from .utils import set_auth_cookies, remove_auth_cookies
from django.conf import settings

# Create your views here.
# api/auth/register/ - API đăng ký người dùng mới
class RegisterView(generics.CreateAPIView):
    """
    API đăng ký người dùng mới.
    Mọi người đều có thể truy cập (AllowAny).
    """
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Trả về thông báo thành công và thông tin cơ bản kèm theo (không bao gồm mật khẩu)
        return Response({
            "message": f"Chúc mừng {user.email}, tài khoản đã được tạo thành công!",
            "user": {
                "username": user.username,
                "email": user.email
            }
        }, status=status.HTTP_201_CREATED)


# api/auth/me - API để lấy thông tin người dùng hiện tại
class UserMeView(APIView):
    permission_classes = [IsAuthenticated] # Chỉ cho phép nếu token hợp lệ

    def get(self, request):
        user = request.user
        return Response({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": getattr(user, 'role', 'customer'), # Trả về role nếu có
        }, status=status.HTTP_200_OK)


# api/auth/login/ - API đăng nhập, trả về token và set cookie
class LoginView(generics.GenericAPIView):
    serializer_class = LoginSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):

        if request.user.is_authenticated:
            return Response(
                {"message": "Bạn đã đăng nhập rồi!"}, 
                status=status.HTTP_200_OK
            )
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        
        refresh = CustomTokenObtainPairSerializer.get_token(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)

        # 2. Chuẩn bị data trả về (nên có thêm ID hoặc Role)
        response_data = {
            "message": "Đăng nhập thành công!",
            "user": {
                "id": user.id, # Thường Frontend cần ID để query tiếp
                "username": user.username,
                "email": user.email,
            }
        }

        if settings.DEBUG:
            response_data["access_token"] = access_token
            response_data["refresh_token"] = refresh_token

        response = Response(response_data, status=status.HTTP_200_OK)

        return set_auth_cookies(response, access_token, refresh_token)
    

# api/auth/logout/ - API đăng xuất, xóa cookie và blacklist refresh token
class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.COOKIES.get('refresh_token')

            # 1. Vô hiệu hóa refresh_token trong database (Blacklist)
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()

            # 2. Tạo đối tượng Response
            response = Response(
                {"message": "Đăng xuất thành công!"}, 
                status=status.HTTP_200_OK
            )

            # 3. Sử dụng hàm tiện ích để xóa sạch Cookie trên trình duyệt
            return remove_auth_cookies(response)

        except Exception as e:
            response = Response(
                {"error": "Có lỗi xảy ra hoặc phiên đã hết hạn."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            return remove_auth_cookies(response)
        
# api/auth/token/refresh/ - API refresh token, trả về access token mới và set cookie mới
class CustomTokenRefreshView(TokenRefreshView):
    """
    View ghi đè lại cách lấy Refresh Token: Lấy từ Cookie thay vì Body.
    """
    serializer_class = CustomTokenRefreshSerializer

    def post(self, request, *args, **kwargs):
        # Lấy refresh token từ Cookie
        refresh_token = request.COOKIES.get('refresh_token')

        if not refresh_token:
            return Response(
                {"error": "Refresh token không tồn tại. Vui lòng đăng nhập lại."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Đưa token vào dữ liệu của serializer để xử lý validate
        serializer = self.get_serializer(data={'refresh': refresh_token})

        try:
            serializer.is_valid(raise_exception=True)
        except Exception:
            return Response(
                {"error": "Token không hợp lệ hoặc đã hết hạn."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        access_token = serializer.validated_data.get('access')
        new_refresh_token = serializer.validated_data.get('refresh')

        response = Response(
            {"message": "Làm mới phiên đăng nhập thành công!"},
            status=status.HTTP_200_OK
        )

        # Cập nhật lại các Cookie mới vào trình duyệt
        return set_auth_cookies(response, access_token, new_refresh_token)
    
