from django.contrib import admin
from .models import District, ProblemStatement, CommunityProfile, Conversation, Message


@admin.register(District)
class DistrictAdmin(admin.ModelAdmin):
    list_display = ['name', 'state', 'locale', 'enrollment']
    list_filter = ['state', 'locale']
    search_fields = ['name', 'nces_id']


@admin.register(ProblemStatement)
class ProblemStatementAdmin(admin.ModelAdmin):
    list_display = ['title', 'code', 'category', 'sort_order']
    list_filter = ['category']


@admin.register(CommunityProfile)
class CommunityProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'title', 'is_public', 'created_at']
    list_filter = ['is_public']


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ['id', 'created_at', 'updated_at']


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['conversation', 'sender', 'is_flagged', 'created_at']
    list_filter = ['is_flagged']
