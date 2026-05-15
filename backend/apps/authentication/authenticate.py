from rest_framework import exceptions
from rest_framework_simplejwt.authentication import JWTAuthentication


class CustomJWTAuthentication(JWTAuthentication):
    """
    Cơ chế xác thực: Ưu tiên lấy Access Token từ Cookie trước.
    """
    def authenticate(self, request):
        # 1. Thử lấy token từ Cookie
        raw_token = request.COOKIES.get('access_token')

        # 2. Nếu Cookie trống, thử tìm ở Header (hỗ trợ Postman/Mobile App)
        if raw_token is None:
            return super().authenticate(request)

        # 3. Xác thực chuỗi token lấy được từ Cookie
        try:
            validated_token = self.get_validated_token(raw_token)
        except:
            # Token trong cookie bị sai hoặc hết hạn
            raise exceptions.AuthenticationFailed('Phiên đăng nhập đã hết hạn hoặc không hợp lệ.')
        
        # Trả về User và Token đã được xác thực cho hệ thống Django
        return self.get_user(validated_token), validated_token