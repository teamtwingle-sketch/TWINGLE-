from datetime import date, timedelta
from django.contrib import admin
from .models import PaymentRequest, SubscriptionPlan, CouponCode

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
    list_display = ('user', 'plan', 'status', 'transaction_id', 'created_at')
    list_filter = ('status',)
    search_fields = ('user__email', 'transaction_id')
    actions = [approve_payment, reject_payment]

@admin.register(CouponCode)
class CouponCodeAdmin(admin.ModelAdmin):
    list_display = ('code', 'plan_duration_days', 'is_used', 'used_by', 'used_at', 'created_at')
    list_filter = ('is_used', 'plan_duration_days')
    search_fields = ('code', 'used_by__email')

admin.site.register(SubscriptionPlan)
