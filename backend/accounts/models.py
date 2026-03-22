from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLE_CHOICES = [
        ('customer', 'Customer'),
        ('community_member', 'Community Member'),
        ('moderator', 'Moderator'),
        ('admin', 'Admin'),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='customer')
    phone = models.CharField(max_length=20, blank=True)
    organization = models.CharField(max_length=255, blank=True)
    district = models.ForeignKey(
        'community.District', on_delete=models.SET_NULL, null=True, blank=True
    )
    bio = models.TextField(blank=True)

    def __str__(self):
        return self.email or self.username
