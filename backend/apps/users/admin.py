from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from apps.users.models import UserAuth, UserProfile

# 1. Định nghĩa Inline để lồng Profile vào trang User
class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'Profile Information'

class UserAuthAdmin(UserAdmin):
    inlines = (UserProfileInline,) 
    
    list_display = ('email', 'username', 'is_staff', 'is_active')
    list_filter = ('is_staff', 'is_superuser', 'is_active')
    ordering = ('email',)
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('username',)}),
        ('Permissions', {'fields': ('is_verified', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'password', 'is_verified', 'is_staff', 'is_active'),
        }),
    )

admin.site.register(UserAuth, UserAuthAdmin)