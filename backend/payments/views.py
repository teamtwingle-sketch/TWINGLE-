import os
from datetime import date, timedelta
from django.utils import timezone
from rest_framework import generics, permissions, status, views
from rest_framework.response import Response
from .models import PaymentRequest, SubscriptionPlan, CouponCode
from .serializers import PaymentRequestSerializer, SubscriptionPlanSerializer

# Cache / load coupon codes from coupons.txt
COUPON_FILE = os.path.join(os.path.dirname(__file__), 'coupons.txt')
_VALID_COUPONS = None

def get_valid_coupons():
    global _VALID_COUPONS
    if _VALID_COUPONS is None:
        try:
            with open(COUPON_FILE, 'r') as f:
                _VALID_COUPONS = set(line.strip() for line in f if line.strip())
        except Exception:
            _VALID_COUPONS = set()
    return _VALID_COUPONS

class SubscriptionPlanListView(generics.ListAPIView):
    queryset = SubscriptionPlan.objects.all()
    serializer_class = SubscriptionPlanSerializer
    permission_classes = (permissions.IsAuthenticated,)

class PaymentRequestCreateView(generics.CreateAPIView):
    serializer_class = PaymentRequestSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def perform_create(self, serializer):
        user = self.request.user
        
        # 1. Prevent multiple pending requests
        if PaymentRequest.objects.filter(user=user, status='pending').exists():
             from rest_framework.exceptions import ValidationError
             raise ValidationError("You already have a pending payment verification.")

        # 2. Check Monthly Limit (Max 3 submissions per month)
        now = timezone.now()
        start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        count = PaymentRequest.objects.filter(
            user=user,
            created_at__gte=start_of_month
        ).count()
        
        if count >= 3:
             from rest_framework.exceptions import PermissionDenied
             raise PermissionDenied("You have reached the limit of 3 payment submissions this month.")

        serializer.save(user=user, status='pending')

class MyPaymentStatusView(views.APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        user = request.user
        days_left = 0
        if user.premium_expiry:
             expiry = user.premium_expiry.date() if hasattr(user.premium_expiry, 'date') else user.premium_expiry
             days_left = (expiry - date.today()).days

        current_status = {
            "is_premium": user.is_premium,
            "expiry": user.premium_expiry,
            "days_left": days_left if days_left > 0 else 0,
            "payment_status": "none"
        }
        
        last_payment = PaymentRequest.objects.filter(user=user).order_by('-created_at').first()
        if last_payment:
            current_status["payment_status"] = last_payment.status
            current_status["plan_name"] = last_payment.plan.name
        
        return Response(current_status)

class RedeemCouponView(views.APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        code = str(request.data.get('code', '')).strip()
        if not code:
            return Response(
                {"error": "Please enter a redeem code."},
                status=status.HTTP_400_BAD_REQUEST
            )

        valid_codes = get_valid_coupons()
        if code not in valid_codes:
            return Response(
                {"error": "Invalid redeem code. Please verify the code and try again."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if already redeemed in DB
        coupon = CouponCode.objects.filter(code=code).first()
        if coupon and coupon.is_used:
            return Response(
                {"error": "This coupon code has already been redeemed."},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = request.user
        now = timezone.now()

        # Mark code as redeemed
        if not coupon:
            coupon = CouponCode.objects.create(code=code, plan_duration_days=90)
        coupon.is_used = True
        coupon.used_by = user
        coupon.used_at = now
        coupon.save()

        # Unlock 90-Day Platinum Premium Plan
        user.is_premium = True
        user.tier = 'platinum'
        user.daily_swipe_limit = 1000000
        user.daily_back_swipe_limit = 1000000

        # If user currently has active premium, add 90 days to existing expiry
        if user.premium_expiry and user.premium_expiry > now:
            user.premium_expiry = user.premium_expiry + timedelta(days=90)
        else:
            user.premium_expiry = now + timedelta(days=90)
        user.save()

        # Link with Platinum SubscriptionPlan
        plan = SubscriptionPlan.objects.filter(duration_days=90).first()
        if not plan:
            plan = SubscriptionPlan.objects.filter(name__icontains='platinum').first()
        if not plan:
            plan, _ = SubscriptionPlan.objects.get_or_create(
                name='Platinum',
                defaults={
                    'price': 300.00,
                    'duration_days': 90,
                    'description': 'Unlimited Swipes, Travel Mode, 90 Days'
                }
            )

        # Create approved payment record for transaction history
        PaymentRequest.objects.create(
            user=user,
            plan=plan,
            transaction_id=f"REDEEM-{code}",
            status='approved',
            admin_note=f"Redeemed 90-day coupon code: {code}"
        )

        expiry_date = user.premium_expiry.date() if hasattr(user.premium_expiry, 'date') else user.premium_expiry
        days_left = (expiry_date - now.date()).days

        return Response({
            "success": True,
            "message": "Congratulations! Your 90-Day Platinum Premium Plan has been unlocked!",
            "days_left": days_left if days_left > 0 else 90,
            "expiry": user.premium_expiry,
            "plan_name": plan.name
        }, status=status.HTTP_200_OK)
