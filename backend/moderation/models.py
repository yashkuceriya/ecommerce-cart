from django.db import models
from django.conf import settings


class ModerationAction(models.Model):
    ACTION_CHOICES = [
        ('flag', 'Flagged'),
        ('remove', 'Removed'),
        ('warn', 'Warning Sent'),
        ('join', 'Joined Conversation'),
    ]

    moderator = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    message = models.ForeignKey(
        'community.Message', on_delete=models.SET_NULL, null=True, blank=True
    )
    conversation = models.ForeignKey(
        'community.Conversation', on_delete=models.SET_NULL, null=True, blank=True
    )
    reason = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.get_action_display()} by {self.moderator} at {self.created_at}"
