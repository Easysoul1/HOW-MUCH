"""
Django management command to send price update reminders to vendors.

Run this command daily via cron to remind vendors about stale prices.

Usage:
    python manage.py send_price_reminders

Cron setup (run daily at 9 AM):
    0 9 * * * cd /path/to/backend && /path/to/venv/bin/python manage.py send_price_reminders >> /var/log/howmuch/price_reminders.log 2>&1
"""

from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from apps.pricing.models import VendorListing
from apps.notifications.models import Notification


class Command(BaseCommand):
    help = 'Send price update reminders for listings older than 7 days'

    def add_arguments(self, parser):
        parser.add_argument(
            '--days',
            type=int,
            default=7,
            help='Number of days since last update (default: 7)',
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Print what would be done without actually sending notifications',
        )

    def handle(self, *args, **options):
        days = options['days']
        dry_run = options['dry_run']
        
        cutoff_date = timezone.now() - timedelta(days=days)
        
        # Find all listings that haven't been updated in {days} days
        stale_listings = VendorListing.objects.filter(
            updated_at__lt=cutoff_date,
            is_available=True  # Only available listings
        ).select_related('vendor', 'product', 'size')
        
        # Group by vendor to send one notification per vendor
        vendors_with_stale = {}
        for listing in stale_listings:
            vendor_id = listing.vendor.id
            if vendor_id not in vendors_with_stale:
                vendors_with_stale[vendor_id] = {
                    'vendor': listing.vendor,
                    'listings': []
                }
            vendors_with_stale[vendor_id]['listings'].append(listing)
        
        if not vendors_with_stale:
            self.stdout.write(
                self.style.SUCCESS(f'No stale listings found (older than {days} days)')
            )
            return
        
        notifications_created = 0
        
        for vendor_id, data in vendors_with_stale.items():
            vendor = data['vendor']
            listing_count = len(data['listings'])
            
            # Create notification message
            if listing_count == 1:
                message = f"You have 1 price listing that hasn't been updated in {days} days. Please review and update if needed."
            else:
                message = f"You have {listing_count} price listings that haven't been updated in {days} days. Please review and update if needed."
            
            if dry_run:
                self.stdout.write(
                    self.style.WARNING(
                        f'[DRY RUN] Would notify {vendor.email}: {message}'
                    )
                )
            else:
                # Check if we already sent a reminder recently (last 24 hours)
                recent_reminder = Notification.objects.filter(
                    user=vendor,
                    type='PRICE_UPDATE_REMINDER',
                    created_at__gte=timezone.now() - timedelta(hours=24)
                ).exists()
                
                if not recent_reminder:
                    Notification.objects.create(
                        user=vendor,
                        type='PRICE_UPDATE_REMINDER',
                        message=message,
                        link='/vendor/inventory'
                    )
                    notifications_created += 1
                    self.stdout.write(
                        self.style.SUCCESS(
                            f'✓ Notified {vendor.email}: {listing_count} stale listing(s)'
                        )
                    )
                else:
                    self.stdout.write(
                        self.style.WARNING(
                            f'⊘ Skipped {vendor.email}: already notified in last 24h'
                        )
                    )
        
        if dry_run:
            self.stdout.write(
                self.style.SUCCESS(
                    f'\n[DRY RUN] Would create {len(vendors_with_stale)} notifications'
                )
            )
        else:
            self.stdout.write(
                self.style.SUCCESS(
                    f'\n✓ Created {notifications_created} price update reminders'
                )
            )
