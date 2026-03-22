from rest_framework import serializers
from .models import ModerationAction
from community.serializers import MessageSerializer


class ModerationActionSerializer(serializers.ModelSerializer):
    moderator_name = serializers.CharField(source='moderator.username', read_only=True)

    class Meta:
        model = ModerationAction
        fields = ['id', 'moderator', 'moderator_name', 'action', 'message', 'conversation', 'reason', 'created_at']
        read_only_fields = ['moderator']
