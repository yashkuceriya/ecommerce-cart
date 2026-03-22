from django.db import models
from django.conf import settings


class District(models.Model):
    LOCALE_CHOICES = [
        ('city_large', 'City: Large'),
        ('city_midsize', 'City: Midsize'),
        ('city_small', 'City: Small'),
        ('suburban_large', 'Suburban: Large'),
        ('suburban_midsize', 'Suburban: Midsize'),
        ('suburban_small', 'Suburban: Small'),
        ('town_fringe', 'Town: Fringe'),
        ('town_distant', 'Town: Distant'),
        ('town_remote', 'Town: Remote'),
        ('rural_fringe', 'Rural: Fringe'),
        ('rural_distant', 'Rural: Distant'),
        ('rural_remote', 'Rural: Remote'),
    ]

    nces_id = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=255, db_index=True)
    state = models.CharField(max_length=2)
    locale = models.CharField(max_length=20, choices=LOCALE_CHOICES)
    enrollment = models.PositiveIntegerField(default=0)
    frl_percentage = models.FloatField(default=0, help_text="Free/Reduced Lunch %")
    el_percentage = models.FloatField(default=0, help_text="English Learner %")

    class Meta:
        ordering = ['state', 'name']

    def __str__(self):
        return f"{self.name}, {self.state}"


class ProblemStatement(models.Model):
    code = models.CharField(max_length=50, unique=True)
    title = models.CharField(max_length=255)
    description = models.TextField()
    category = models.CharField(max_length=100)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['sort_order']

    def __str__(self):
        return self.title


class CommunityProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='community_profile'
    )
    title = models.CharField(max_length=255, blank=True)
    years_in_role = models.PositiveIntegerField(null=True, blank=True)
    problem_statements = models.ManyToManyField(
        ProblemStatement, blank=True, related_name='profiles'
    )
    challenge_description = models.TextField(
        blank=True, help_text="Free-text description of current challenges"
    )
    challenge_embedding = models.JSONField(null=True, blank=True)
    is_public = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Profile: {self.user}"


class Conversation(models.Model):
    participants = models.ManyToManyField(
        settings.AUTH_USER_MODEL, related_name='conversations'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']


class ConversationReadState(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='read_states')
    last_read_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'conversation')


class Message(models.Model):
    conversation = models.ForeignKey(
        Conversation, on_delete=models.CASCADE, related_name='messages'
    )
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content = models.TextField()
    is_flagged = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']
