#!/usr/bin/env python3
"""
Test notification system functionality
"""
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.notifications.models import Notification
from apps.users.models import User

print("=" * 60)
print("NOTIFICATION SYSTEM STATUS")
print("=" * 60)

# Check total notifications
total = Notification.objects.count()
print(f"\n📊 Total Notifications: {total}")

# Check by user type
vendors = User.objects.filter(user_type='VENDOR')
admins = User.objects.filter(user_type='ADMIN')

print(f"\n👥 Users:")
print(f"  - Vendors: {vendors.count()}")
print(f"  - Admins: {admins.count()}")

# Check notifications by user type
print(f"\n🔔 Notifications by User Type:")
for user_type, users in [('VENDOR', vendors), ('ADMIN', admins)]:
    notif_count = 0
    for user in users:
        user_notifs = Notification.objects.filter(user=user).count()
        notif_count += user_notifs
    print(f"  - {user_type}: {notif_count} notifications")

# Show recent notifications
print(f"\n📬 Recent Notifications:")
for n in Notification.objects.all().order_by('-created_at')[:5]:
    status = "✓ Read" if n.is_read else "• Unread"
    print(f"  {status} | {n.user.email} ({n.user.user_type}) | {n.type}")
    print(f"    Message: {n.message[:70]}...")
    print(f"    Link: {n.link or 'None'}")
    print()

# Check if there are any admin users
print(f"\n👔 Admin Users:")
for admin in admins:
    unread = Notification.objects.filter(user=admin, is_read=False).count()
    print(f"  - {admin.email}: {unread} unread notifications")

print("\n" + "=" * 60)
print("RECOMMENDATIONS:")
print("=" * 60)

if admins.count() == 0:
    print("⚠️  No admin users found! Create an admin user to test admin notifications.")
else:
    print("✅ Admin users exist")

if total == 0:
    print("⚠️  No notifications found! Run 'python3 manage.py send_price_reminders' to create test notifications.")
else:
    print("✅ Notifications exist in database")

print("\n💡 To test notifications:")
print("   1. Log in as a vendor (mercy@gmail.com) at http://localhost:3000/vendor/login")
print("   2. Check the bell icon in the top-right corner")
print("   3. You should see price update reminder notifications")
print()
