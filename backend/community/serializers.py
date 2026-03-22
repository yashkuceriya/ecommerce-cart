from rest_framework import serializers
from django.contrib.auth import get_user_model

from .models import District, ProblemStatement, CommunityProfile, Conversation, Message

User = get_user_model()


class DistrictSerializer(serializers.ModelSerializer):
    locale_display = serializers.CharField(source='get_locale_display', read_only=True)

    class Meta:
        model = District
        fields = [
            'id', 'nces_id', 'name', 'state', 'locale', 'locale_display',
            'enrollment', 'frl_percentage', 'el_percentage',
        ]


class ProblemStatementSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProblemStatement
        fields = ['id', 'code', 'title', 'description', 'category']


class MemberSummarySerializer(serializers.ModelSerializer):
    district_name = serializers.CharField(source='district.name', read_only=True, default=None)
    district_state = serializers.CharField(source='district.state', read_only=True, default=None)
    district_locale = serializers.CharField(
        source='district.get_locale_display', read_only=True, default=None
    )

    class Meta:
        model = User
        fields = [
            'id', 'first_name', 'last_name', 'organization',
            'district_name', 'district_state', 'district_locale',
        ]


class CommunityProfileSerializer(serializers.ModelSerializer):
    user = MemberSummarySerializer(read_only=True)
    problem_statements = ProblemStatementSerializer(many=True, read_only=True)
    district = DistrictSerializer(source='user.district', read_only=True)

    class Meta:
        model = CommunityProfile
        fields = [
            'id', 'user', 'title', 'years_in_role', 'problem_statements',
            'challenge_description', 'is_public', 'district', 'created_at',
        ]


class CommunityProfileCreateUpdateSerializer(serializers.ModelSerializer):
    problem_statement_ids = serializers.ListField(
        child=serializers.IntegerField(), write_only=True, required=False
    )
    district_id = serializers.IntegerField(write_only=True, required=False)

    class Meta:
        model = CommunityProfile
        fields = [
            'title', 'years_in_role', 'challenge_description',
            'is_public', 'problem_statement_ids', 'district_id',
        ]

    def create(self, validated_data):
        ps_ids = validated_data.pop('problem_statement_ids', [])
        district_id = validated_data.pop('district_id', None)
        user = self.context['request'].user
        if district_id:
            user.district_id = district_id
            user.save(update_fields=['district_id'])
        profile = CommunityProfile.objects.create(user=user, **validated_data)
        if ps_ids:
            profile.problem_statements.set(ps_ids)
        return profile

    def update(self, instance, validated_data):
        ps_ids = validated_data.pop('problem_statement_ids', None)
        district_id = validated_data.pop('district_id', None)
        if district_id:
            instance.user.district_id = district_id
            instance.user.save(update_fields=['district_id'])
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if ps_ids is not None:
            instance.problem_statements.set(ps_ids)
        return instance


class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ['id', 'sender', 'sender_name', 'content', 'is_flagged', 'created_at']
        read_only_fields = ['sender', 'is_flagged']

    def get_sender_name(self, obj):
        return f"{obj.sender.first_name} {obj.sender.last_name}".strip() or obj.sender.username


class ConversationListSerializer(serializers.ModelSerializer):
    participants = MemberSummarySerializer(many=True, read_only=True)
    last_message = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ['id', 'participants', 'last_message', 'updated_at']

    def get_last_message(self, obj):
        msg = obj.messages.order_by('-created_at').first()
        if msg:
            return MessageSerializer(msg).data
        return None


class ConversationDetailSerializer(serializers.ModelSerializer):
    participants = MemberSummarySerializer(many=True, read_only=True)
    messages = MessageSerializer(many=True, read_only=True)

    class Meta:
        model = Conversation
        fields = ['id', 'participants', 'messages', 'created_at', 'updated_at']


class MatchResultSerializer(serializers.Serializer):
    profile = CommunityProfileSerializer()
    score = serializers.FloatField()
    problem_score = serializers.FloatField()
    semantic_score = serializers.FloatField(allow_null=True)
    demographic_score = serializers.FloatField()
