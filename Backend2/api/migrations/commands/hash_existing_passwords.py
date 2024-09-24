from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password

class Command(BaseCommand):
    help = 'Hash existing passwords'

    def handle(self, *args, **options):
        users = User.objects.filter(password_hashed=False)
        for user in users:
            user.password = make_password(user.password)
            user.password_hashed = True
            user.save()
        self.stdout.write(self.style.SUCCESS('Successfully hashed existing passwords'))
