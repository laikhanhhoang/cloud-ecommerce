from django.conf import settings
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import RegexValidator



class UserAuth(AbstractUser):
    email = models.EmailField(unique=True)     # Ghi đè email để bắt buộc phải có và không trùng lặp
    username = models.CharField(
        max_length=30,
        unique=True,
        blank=True,  # Cho phép để trống trong Form/Serializer
        null=True    # Cho phép trống trong Database
    )
    is_verified = models.BooleanField(default=False)
    
    # Định nghĩa trường dùng để đăng nhập
    USERNAME_FIELD = 'email'     
    # Định nghĩa các trường bắt buộc khi chạy lệnh createsuperuser (ngoại trừ password và email)   
    REQUIRED_FIELDS = [] # AbstractUser mặc định đã có username, nên chúng ta vẫn phải giữ nó trong REQUIRED_FIELDS

    class Meta:
        db_table = 'user_auth' 
        verbose_name = 'User Authentication'

    def __str__(self):
        return self.email
    

# Định nghĩa validator, sẽ được mặc định mang theo tới Serializer và Form khi dùng UserProfile
phone_validator = RegexValidator(
    regex=r'^(0|84|(\+84))?\d{9,10}$',
    message="Số điện thoại không hợp lệ. Vui lòng nhập định dạng 10 số (VD: 0987654321)."
)

# 2. Name Validator: Đảm bảo bao phủ toàn bộ bảng chữ cái Tiếng Việt
name_validator = RegexValidator(
    regex=r'^[a-zA-ZÀ-ỹ\sĐđ]+$', 
    message="Tên chỉ được chứa chữ cái và khoảng trắng."
)

class UserProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='profile'
    )
    
    # Dùng blank=True, không dùng null=True cho CharField
    full_name = models.CharField(
        max_length=255, 
        blank=True, 
        validators=[name_validator]
    )
    
    avatar = models.ImageField(
        upload_to='avatars/', 
        null=True, 
        blank=True
    )
    
    phone_number = models.CharField(
        max_length=15, 
        blank=True,
        validators=[phone_validator]
    )
    
    last_updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'user_profile'
        verbose_name = 'User Profile'
        verbose_name_plural = 'User Profiles'

    def __str__(self):
        # Dùng getattr để tránh lỗi nếu vì lý do nào đó UserAuth chưa được load
        return f"Profile of {getattr(self.user, 'email', 'Unknown')}"