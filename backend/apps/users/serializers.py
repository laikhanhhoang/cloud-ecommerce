from rest_framework import serializers

from .models import UserAuth, UserProfile

# ------------------------------------------
# Sub-serializers
# ------------------------------------------

# UserProfile Serializer 
class ProfileSerializer(serializers.ModelSerializer):
    """
    Hiển thị và cập nhật thông tin cá nhân mở rộng.
    """
    class Meta:
        model = UserProfile
        fields = ['full_name', 'avatar', 'phone_number']

# UserAuth Serializer 
class AuthSerializer(serializers.ModelSerializer):
    """
    Serializer chuẩn Production cho thông tin xác thực.
    Chỉ trả về các thông tin cần thiết và đảm bảo tính đóng gói.
    """
    class Meta:
        model = UserAuth
        fields = [
            'id', 
            'username', 
            'first_name', 
            'last_name', 
            'date_joined',
            'is_active'
        ]
        extra_kwargs = {
            'email': {'read_only': True},
            'username': {'read_only': True},
            
            # Định dạng ngày tham gia để Frontend không phải xử lý thêm
            'date_joined': {
                'read_only': True,
                'format': '%d/%m/%Y %H:%M' 
            },
            
            # Trạng thái tài khoản chỉ để xem
            'is_active': {'read_only': True},
        }
        
# ------------------------------------------
# Các Serializer nghiệp vụ chính
# ------------------------------------------

# Hiển thị thông tin User (Lồng Profile) - Only Read
class UserDetailSerializer(serializers.ModelSerializer):
    """
    ONLY-READ Serializer tổng hợp thông tin chi tiết của người dùng.
    Lồng thông tin xác thực (Auth) và thông tin cá nhân (Profile) vào một Response duy nhất.
    """
    
    auth_info = AuthSerializer(source='*', read_only=True) # source='*' báo cho DRF lấy các trường của AuthSerializer từ instance UserAuth trong model của class Meta
    profile = ProfileSerializer(read_only=True) # Tên của trường phải trung với related_name trong UserProfile

    class Meta:
        model = UserAuth
        fields = ['id', 'auth_info', 'profile']
        read_only_fields = fields



