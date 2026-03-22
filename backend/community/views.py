from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from django.db.models import Q

from .models import District, ProblemStatement, CommunityProfile, Conversation, Message, ConversationReadState
from .serializers import (
    DistrictSerializer, ProblemStatementSerializer,
    CommunityProfileSerializer, CommunityProfileCreateUpdateSerializer,
    ConversationListSerializer, ConversationDetailSerializer,
    MessageSerializer, MatchResultSerializer,
)
from .matching import find_matches, get_embedding

User = get_user_model()


class DistrictSearchView(generics.ListAPIView):
    serializer_class = DistrictSerializer

    def get_queryset(self):
        q = self.request.query_params.get('q', '')
        if len(q) < 2:
            return District.objects.none()
        return District.objects.filter(name__icontains=q)[:20]


class ProblemStatementListView(generics.ListAPIView):
    queryset = ProblemStatement.objects.all()
    serializer_class = ProblemStatementSerializer
    pagination_class = None


class CommunityProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            profile = request.user.community_profile
            return Response(CommunityProfileSerializer(profile).data)
        except CommunityProfile.DoesNotExist:
            return Response({'detail': 'No profile found.'}, status=status.HTTP_404_NOT_FOUND)

    def post(self, request):
        if hasattr(request.user, 'community_profile'):
            return Response(
                {'detail': 'Profile already exists. Use PUT to update.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        serializer = CommunityProfileCreateUpdateSerializer(
            data=request.data, context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        profile = serializer.save()

        if profile.challenge_description:
            embedding = get_embedding(profile.challenge_description)
            if embedding:
                profile.challenge_embedding = embedding
                profile.save(update_fields=['challenge_embedding'])

        return Response(
            CommunityProfileSerializer(profile).data, status=status.HTTP_201_CREATED
        )

    def put(self, request):
        try:
            profile = request.user.community_profile
        except CommunityProfile.DoesNotExist:
            return Response({'detail': 'No profile found.'}, status=status.HTTP_404_NOT_FOUND)

        old_desc = profile.challenge_description
        serializer = CommunityProfileCreateUpdateSerializer(
            profile, data=request.data, partial=True, context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        profile = serializer.save()

        if profile.challenge_description and profile.challenge_description != old_desc:
            embedding = get_embedding(profile.challenge_description)
            if embedding:
                profile.challenge_embedding = embedding
                profile.save(update_fields=['challenge_embedding'])

        return Response(CommunityProfileSerializer(profile).data)


class CommunityProfileDetailView(generics.RetrieveAPIView):
    serializer_class = CommunityProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        user_id = self.kwargs['user_id']
        return CommunityProfile.objects.select_related(
            'user', 'user__district'
        ).prefetch_related('problem_statements').get(user_id=user_id, is_public=True)


class MatchingView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            profile = request.user.community_profile
        except CommunityProfile.DoesNotExist:
            return Response(
                {'detail': 'Create a community profile first.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        matches = find_matches(profile)
        serializer = MatchResultSerializer(matches, many=True)
        return Response(serializer.data)


class ConversationListView(generics.ListAPIView):
    serializer_class = ConversationListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Conversation.objects.filter(
            participants=self.request.user
        ).prefetch_related('participants', 'messages')


class ConversationCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user_id = request.data.get('user_id')
        if not user_id:
            return Response(
                {'error': 'user_id is required.'}, status=status.HTTP_400_BAD_REQUEST
            )
        try:
            other_user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Check for existing conversation between these two users
        existing = Conversation.objects.filter(
            participants=request.user
        ).filter(participants=other_user)
        if existing.exists():
            conv = existing.first()
            return Response(ConversationDetailSerializer(conv).data)

        conv = Conversation.objects.create()
        conv.participants.add(request.user, other_user)
        return Response(
            ConversationDetailSerializer(conv).data, status=status.HTTP_201_CREATED
        )


class ConversationDetailView(generics.RetrieveAPIView):
    serializer_class = ConversationDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Conversation.objects.filter(
            participants=self.request.user
        ).prefetch_related('participants', 'messages__sender')

    def retrieve(self, request, *args, **kwargs):
        response = super().retrieve(request, *args, **kwargs)
        # Mark as read
        conv = self.get_object()
        ConversationReadState.objects.update_or_create(
            user=request.user, conversation=conv
        )
        return response


class UnreadCountView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        convs = Conversation.objects.filter(participants=request.user)
        total_unread = 0
        for conv in convs:
            read_state = conv.read_states.filter(user=request.user).first()
            if read_state:
                unread = conv.messages.filter(created_at__gt=read_state.last_read_at).exclude(sender=request.user).count()
            else:
                unread = conv.messages.exclude(sender=request.user).count()
            total_unread += unread
        return Response({'unread_count': total_unread})


class SendMessageView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            conv = Conversation.objects.get(pk=pk, participants=request.user)
        except Conversation.DoesNotExist:
            return Response(
                {'error': 'Conversation not found.'}, status=status.HTTP_404_NOT_FOUND
            )
        content = request.data.get('content', '').strip()
        if not content:
            return Response(
                {'error': 'Message content is required.'}, status=status.HTTP_400_BAD_REQUEST
            )
        msg = Message.objects.create(
            conversation=conv, sender=request.user, content=content
        )
        conv.save()  # updates updated_at
        return Response(MessageSerializer(msg).data, status=status.HTTP_201_CREATED)


class MemberDirectoryView(generics.ListAPIView):
    serializer_class = CommunityProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = CommunityProfile.objects.filter(is_public=True).select_related(
            'user', 'user__district'
        ).prefetch_related('problem_statements')

        state = self.request.query_params.get('state')
        if state:
            qs = qs.filter(user__district__state=state)

        locale = self.request.query_params.get('locale')
        if locale:
            qs = qs.filter(user__district__locale=locale)

        problem = self.request.query_params.get('problem_statement')
        if problem:
            qs = qs.filter(problem_statements__id=problem)

        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(
                Q(user__first_name__icontains=search) |
                Q(user__last_name__icontains=search) |
                Q(user__organization__icontains=search)
            )

        return qs.distinct()
