from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from apps.crowdsource.models import CrowdsourcedSubmission, CrowdsourcedItem
from apps.pricing.models import VendorListing
from apps.products.models import Product, SizeRequest
from .models import Notification

User = get_user_model()


def notify_admins(notification_type, title, message, link=""):
    """Create notifications for all admin users"""
    admins = User.objects.filter(user_type='ADMIN')
    for admin in admins:
        Notification.objects.create(
            user=admin,
            type=notification_type,
            title=title,
            message=message,
            link=link
        )


@receiver(post_save, sender=CrowdsourcedSubmission)
def notify_crowdsource_submission(sender, instance, created, **kwargs):
    """Notify admins when crowdsourcer submits prices"""
    if created:
        notify_admins(
            'CROWDSOURCE_SUBMISSION',
            'New Crowdsourced Submission',
            f'{instance.crowdsourcer.email} submitted {instance.item_count} items from {instance.city}, {instance.state}',
            f'/admin/crowdsource'
        )


@receiver(post_save, sender=CrowdsourcedItem)
def notify_crowdsource_item_status(sender, instance, created, **kwargs):
    """Notify crowdsourcer when their items are approved/rejected & create VendorListing if approved"""
    if not created:  # Only on updates
        if instance.status == 'APPROVED' and instance.approved_at:
            product_name = instance.product.name if instance.product else instance.product_name
            
            # Create VendorListing from approved crowdsourced item
            from apps.pricing.models import VendorListing
            
            # Get or create system "Crowdsource" vendor user
            crowdsource_vendor, _ = User.objects.get_or_create(
                username='crowdsource_system',
                defaults={
                    'email': 'crowdsource@howmuch.ng',
                    'user_type': 'VENDOR',
                    'first_name': 'Crowdsource',
                    'last_name': 'Community',
                }
            )
            
            # Only create listing if we have required data
            if instance.product and instance.size:
                # Check if listing already exists for this product+size
                existing_listing = VendorListing.objects.filter(
                    vendor=crowdsource_vendor,
                    product=instance.product,
                    size=instance.size,
                    brand=instance.brand or ''
                ).first()
                
                if existing_listing:
                    # Update existing listing with new price
                    existing_listing.price = instance.price
                    existing_listing.is_available = True
                    existing_listing.notes = f"Updated by crowdsourcer on {instance.approved_at.strftime('%Y-%m-%d')}"
                    existing_listing.save()
                else:
                    # Create new listing
                    VendorListing.objects.create(
                        vendor=crowdsource_vendor,
                        product=instance.product,
                        size=instance.size,
                        brand=instance.brand or '',
                        price=instance.price,
                        is_available=True,
                        notes=f"Crowdsourced from {instance.submission.city}, {instance.submission.state}"
                    )
            
            # Send notification to crowdsourcer
            Notification.objects.create(
                user=instance.submission.crowdsourcer,
                type='ITEM_APPROVED',
                title='Item Approved',
                message=f'Your submission for {product_name} has been approved and is now live!',
                link='/crowdsourcer/dashboard'
            )
        elif instance.status == 'REJECTED':
            product_name = instance.product.name if instance.product else instance.product_name
            Notification.objects.create(
                user=instance.submission.crowdsourcer,
                type='ITEM_REJECTED',
                title='Item Rejected',
                message=f'Your submission for {product_name} was rejected. {instance.rejection_reason}',
                link='/crowdsourcer/dashboard'
            )


@receiver(post_save, sender=VendorListing)
def notify_vendor_listing(sender, instance, created, **kwargs):
    """Notify admins when vendor creates a listing"""
    if created:
        notify_admins(
            'VENDOR_LISTING',
            'New Vendor Listing',
            f'{instance.vendor.email} added {instance.product.name} ({instance.size.label}) at ₦{instance.price}',
            f'/admin/vendors'
        )


@receiver(post_save, sender=Product)
def notify_product_suggestion(sender, instance, created, **kwargs):
    """Notify vendor when their product suggestion is approved/rejected"""
    if not created and instance.suggested_by:  # Only on updates with suggestor
        if instance.status == 'APPROVED' and instance.reviewed_by:
            Notification.objects.create(
                user=instance.suggested_by,
                type='PRODUCT_APPROVED',
                title='Product Approved',
                message=f'Your product suggestion "{instance.name}" has been approved!',
                link='/vendor/products'
            )
        elif instance.status == 'REJECTED':
            Notification.objects.create(
                user=instance.suggested_by,
                type='PRODUCT_REJECTED',
                title='Product Rejected',
                message=f'Your product suggestion "{instance.name}" was rejected.',
                link='/vendor/products'
            )
    
    # Notify admins when vendor suggests a product
    if created and instance.suggested_by and instance.status == 'PENDING':
        notify_admins(
            'PRODUCT_SUGGESTION',
            'New Product Suggestion',
            f'{instance.suggested_by.email} suggested product: {instance.name}',
            f'/admin/approvals'
        )


@receiver(post_save, sender=SizeRequest)
def notify_size_request(sender, instance, created, **kwargs):
    """Notify vendor when size request is approved/rejected & notify admins on creation"""
    if created:
        # Notify admins
        notify_admins(
            'SIZE_REQUEST',
            'New Size Request',
            f'{instance.requested_by.email} requested new size for {instance.product.name}: {instance.value}{instance.unit.abbreviation}',
            f'/admin/approvals'
        )
    elif not created:  # On update
        if instance.status == 'APPROVED':
            Notification.objects.create(
                user=instance.requested_by,
                type='SIZE_APPROVED',
                title='Size Request Approved',
                message=f'Your size request for {instance.product.name} ({instance.value}{instance.unit.abbreviation}) was approved!',
                link='/vendor/products'
            )
        elif instance.status == 'REJECTED':
            Notification.objects.create(
                user=instance.requested_by,
                type='SIZE_REJECTED',
                title='Size Request Rejected',
                message=f'Your size request for {instance.product.name} was rejected.',
                link='/vendor/products'
            )
