from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model

from community.models import Conversation, Message
from community.serializers import ConversationListSerializer, MessageSerializer
from .models import ModerationAction
from .serializers import ModerationActionSerializer

User = get_user_model()


class IsModeratorOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role in ('moderator', 'admin')
        )


class DashboardView(APIView):
    permission_classes = [IsModeratorOrAdmin]

    def get(self, request):
        return Response({
            'total_users': User.objects.count(),
            'total_conversations': Conversation.objects.count(),
            'total_messages': Message.objects.count(),
            'flagged_messages': Message.objects.filter(is_flagged=True).count(),
            'moderation_actions': ModerationAction.objects.count(),
        })


class FlaggedMessagesView(APIView):
    permission_classes = [IsModeratorOrAdmin]

    def get(self, request):
        messages = Message.objects.filter(is_flagged=True).select_related('sender', 'conversation')
        return Response(MessageSerializer(messages, many=True).data)


class FlagMessageView(APIView):
    permission_classes = [IsModeratorOrAdmin]

    def post(self, request, message_id):
        try:
            msg = Message.objects.get(id=message_id)
        except Message.DoesNotExist:
            return Response({'error': 'Message not found.'}, status=status.HTTP_404_NOT_FOUND)

        msg.is_flagged = True
        msg.save(update_fields=['is_flagged'])

        ModerationAction.objects.create(
            moderator=request.user,
            action='flag',
            message=msg,
            conversation=msg.conversation,
            reason=request.data.get('reason', ''),
        )
        return Response({'status': 'flagged'})


class RemoveMessageView(APIView):
    permission_classes = [IsModeratorOrAdmin]

    def post(self, request, message_id):
        try:
            msg = Message.objects.get(id=message_id)
        except Message.DoesNotExist:
            return Response({'error': 'Message not found.'}, status=status.HTTP_404_NOT_FOUND)

        ModerationAction.objects.create(
            moderator=request.user,
            action='remove',
            message=msg,
            conversation=msg.conversation,
            reason=request.data.get('reason', ''),
        )
        msg.content = '[Message removed by moderator]'
        msg.is_flagged = True
        msg.save(update_fields=['content', 'is_flagged'])
        return Response({'status': 'removed'})


class JoinConversationView(APIView):
    permission_classes = [IsModeratorOrAdmin]

    def post(self, request, conversation_id):
        try:
            conv = Conversation.objects.get(id=conversation_id)
        except Conversation.DoesNotExist:
            return Response({'error': 'Conversation not found.'}, status=status.HTTP_404_NOT_FOUND)

        conv.participants.add(request.user)

        ModerationAction.objects.create(
            moderator=request.user,
            action='join',
            conversation=conv,
            reason='Upstream Literacy Team joined the conversation.',
        )

        Message.objects.create(
            conversation=conv,
            sender=request.user,
            content='Upstream Literacy Team has joined this conversation.',
        )
        return Response({'status': 'joined'})


class AdminConversationListView(APIView):
    permission_classes = [IsModeratorOrAdmin]

    def get(self, request):
        convs = Conversation.objects.all().prefetch_related('participants', 'messages')[:50]
        return Response(ConversationListSerializer(convs, many=True).data)
