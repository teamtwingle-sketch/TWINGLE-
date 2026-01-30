
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import PaymentRequest, SubscriptionPlan
from .serializers import PaymentRequestSerializer, SubscriptionPlanSerializer

class SubscriptionPlanListView(generics.ListAPIView):
    queryset = SubscriptionPlan.objects.all()
    serializer_class = SubscriptionPlanSerializer
    permission_classes = (permissions.IsAuthenticated,)

class PaymentRequestCreateView(generics.CreateAPIView):
    serializer_class = PaymentRequestSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user, status='pending')

from datetime import date
from rest_framework import views

class MyPaymentStatusView(views.APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        user = request.user
        days_left = 0
        if user.premium_expiry:
             # Ensure db date is date object or handle datetime
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
