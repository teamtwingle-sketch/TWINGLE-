from datetime import date, timedelta
from django.contrib import admin
from .models import PaymentRequest, SubscriptionPlan

@admin.action(description='Approve Payment & Activate Premium')
def approve_payment(modeladmin, request, queryset):
    for payment in queryset:
        if payment.status == 'pending':
            payment.status = 'approved'
            payment.save()
            # Activate user premium
            user = payment.user
            user.is_premium = True
            
            # Calculate expiry
            days = payment.plan.duration_days
            user.premium_expiry = date.today() + timedelta(days=days)
            user.save()

@admin.action(description='Reject Payment')
def reject_payment(modeladmin, request, queryset):
    queryset.update(status='rejected')

@admin.register(PaymentRequest)
class PaymentRequestAdmin(admin.ModelAdmin):
    list_display = ('user', 'plan', 'status', 'created_at')
    list_filter = ('status',)
    actions = [approve_payment, reject_payment]

admin.site.register(SubscriptionPlan)
