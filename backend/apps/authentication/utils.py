from django.conf import settings
from datetime import timedelta

def set_auth_cookies(response, access_token, refresh_token=None):
    # Lấy cấu hình từ settings.py
    simple_jwt_settings = getattr(settings, 'SIMPLE_JWT', {})
    
    # 2. Lấy giá trị, nếu không có trong settings thì dùng timedelta mặc định
    access_lifetime = simple_jwt_settings.get(
        'ACCESS_TOKEN_LIFETIME', 
        timedelta(minutes=15) # Đây mới là chỗ để giá trị mặc định
    )
    
    refresh_lifetime = simple_jwt_settings.get(
        'REFRESH_TOKEN_LIFETIME', 
        timedelta(days=7) # Giá trị mặc định nếu settings bị thiếu
    )

    # 3. Bây giờ mới đổi sang giây
    access_max_age = int(access_lifetime.total_seconds())
    refresh_max_age = int(refresh_lifetime.total_seconds())

    samesite_val = 'Lax'
    secure_val = getattr(settings, 'ORIGIN_HTTPS_ON', False)
    if secure_val and getattr(settings, 'CROSS_DOMAIN_AUTH', False): samesite_val = 'None'

    common_settings = {
        'httponly': True,
        'secure': secure_val,
        'samesite': samesite_val,
        'path': '/',
    }

    # 1. Gán Access Token
    response.set_cookie(
        key='access_token',
        value=access_token,
        max_age=access_max_age, # Lấy tự động: 900 giây (15p)
        **common_settings
    )

    # 2. Gán Refresh Token
    if refresh_token:
        response.set_cookie(
            key='refresh_token',
            value=refresh_token,
            max_age=refresh_max_age, # Lấy tự động: 604800 giây (7 ngày)
            **common_settings
        )
    
    return response


def remove_auth_cookies(response):
    response.delete_cookie('access_token')
    response.delete_cookie('refresh_token')
    return response