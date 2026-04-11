from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Create or update the default admin account."

    def handle(self, *args, **options):
        admin_email = "admin@howmuch.com"
        admin_password = "Admin1234!"
        User = get_user_model()

        user, created = User.objects.get_or_create(
            username=admin_email,
            defaults={"email": admin_email},
        )

        user.email = admin_email
        user.is_staff = True
        user.is_superuser = True
        user.is_active = True

        if hasattr(user, "user_type"):
            user.user_type = "ADMIN"
        if hasattr(user, "is_verified"):
            user.is_verified = True

        user.set_password(admin_password)
        user.save()

        action = "Created" if created else "Updated"
        self.stdout.write(self.style.SUCCESS(f"{action} admin user: {admin_email}"))
