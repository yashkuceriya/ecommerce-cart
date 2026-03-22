from django.urls import path
from . import views

urlpatterns = [
    path('dashboard/', views.DashboardView.as_view(), name='mod-dashboard'),
    path('flagged/', views.FlaggedMessagesView.as_view(), name='mod-flagged'),
    path('flag/<int:message_id>/', views.FlagMessageView.as_view(), name='mod-flag'),
    path('remove/<int:message_id>/', views.RemoveMessageView.as_view(), name='mod-remove'),
    path('join/<int:conversation_id>/', views.JoinConversationView.as_view(), name='mod-join'),
    path('conversations/', views.AdminConversationListView.as_view(), name='mod-conversations'),
]
