from django.apps import AppConfig


class UsersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.users' 
    # Sau khi khai báo name, app mặc định sẽ lấy phần cuối của đường dẫn làm label để dùng ở các file khác, hiện tại ở đây là 'users'
    # Bạn có thể khai báo cụ thể hơn, ví dụ label = 'users_app' nếu muốn, nhưng thường thì để mặc định là ổn.

    def ready(self):
        import apps.users.signals
