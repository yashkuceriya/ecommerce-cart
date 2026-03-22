from django.contrib import admin
from .models import ModerationAction


@admin.register(ModerationAction)
class ModerationActionAdmin(admin.ModelAdmin):
    list_display = ['moderator', 'action', 'conversation', 'created_at']
    list_filter = ['action']
