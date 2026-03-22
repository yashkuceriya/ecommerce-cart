from django.urls import path
from . import views

urlpatterns = [
    path('districts/search/', views.DistrictSearchView.as_view(), name='district-search'),
    path('problem-statements/', views.ProblemStatementListView.as_view(), name='problem-statements'),
    path('profile/', views.CommunityProfileView.as_view(), name='community-profile'),
    path('profiles/<int:user_id>/', views.CommunityProfileDetailView.as_view(), name='community-profile-detail'),
    path('matches/', views.MatchingView.as_view(), name='matches'),
    path('conversations/', views.ConversationListView.as_view(), name='conversations'),
    path('conversations/create/', views.ConversationCreateView.as_view(), name='conversation-create'),
    path('conversations/<int:pk>/', views.ConversationDetailView.as_view(), name='conversation-detail'),
    path('conversations/<int:pk>/messages/', views.SendMessageView.as_view(), name='send-message'),
    path('directory/', views.MemberDirectoryView.as_view(), name='directory'),
    path('unread-count/', views.UnreadCountView.as_view(), name='unread-count'),
]
