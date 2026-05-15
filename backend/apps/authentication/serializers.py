from apps.users.models import UserAuth
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password

from rest_framework import serializers
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer, TokenRefreshSerializer
from rest_framework_simplejwt.tokens import RefreshToken

# Serializer chuyên biệt cho Đăng ký
class RegisterSerializer(serializers.ModelSerializer):
    """
        Serializer xử lý logic đăng ký tài khoản người dùng mới.
    """

    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = UserAuth
        fields = ['email', 'username', 'password', 'password_confirm']
        extra_kwargs = {'password': {'write_only': True}}

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Mật khẩu không khớp."})
        validate_password(attrs['password'])
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        return UserAuth.objects.create_user(**validated_data)
    
# Serializer dùng để custom các trường được gói trong JWT Token
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Tùy chỉnh nội dung (Payload) của Token khi khởi tạo lần đầu.
    """
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Thêm các custom field vào Payload của Access Token
        token['email'] = user.email
        token['is_verified'] = user.is_verified
        
        return token    

# Serializer chuyên biệt cho Đăng nhập
class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(write_only=True)
    password = serializers.CharField(
        style={'input_type': 'password'},
        trim_whitespace=False,
        write_only=True
    )

    def validate(self, data):
        email = data.get('email')
        password = data.get('password')

        if email and password:
            user = authenticate(request=self.context.get('request'),
                                email=email, password=password)

            if not user:
                raise serializers.ValidationError(
                    "Email hoặc mật khẩu không chính xác. Vui lòng thử lại.",
                    code='authorization'
                )
            
            if not user.is_active:
                raise serializers.ValidationError(
                    "Tài khoản của bạn đã bị khóa.",
                    code='authorization'
                )

            if not user.is_verified: 
                raise serializers.ValidationError(
                    "Tài khoản chưa được xác thực email. Vui lòng kiểm tra hộp thư.",
                    code='authorization'
                )

        else:
            raise serializers.ValidationError(
                "Phải cung cấp cả email và mật khẩu.",
                code='authorization'
            )

        # Lưu object user vào validated_data để View có thể lấy ra dùng
        data['user'] = user
        return data


class CustomTokenRefreshSerializer(TokenRefreshSerializer):

    def validate(self, attrs):
        data = super().validate(attrs)

        refresh = RefreshToken(
            data.get("refresh", attrs["refresh"])
        )

        user_id = refresh["user_id"]
        user = UserAuth.objects.get(id=user_id)

        if not user.is_active:
            raise AuthenticationFailed("User inactive")

        refresh["email"] = user.email
        refresh["is_verified"] = user.is_verified

        data["access"] = str(refresh.access_token)

        if "refresh" in data: # data['refresh'] sẽ là refresh token mới nếu ROTATE_REFRESH_TOKENS = True,
            data["refresh"] = str(refresh)

        return data