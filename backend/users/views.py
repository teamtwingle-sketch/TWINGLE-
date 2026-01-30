
from rest_framework import generics, permissions, status, views
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import RegisterSerializer, UserSerializer, MyTokenObtainPairSerializer
from .models import User
from reports.models import Report
from payments.models import PaymentRequest
from django.db.models import Count
from reports.serializers import ReportSerializer
from payments.serializers import PaymentRequestSerializer
from datetime import date, timedelta

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

class UserDetailView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        return self.request.user

# --- Admin API Views ---

class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and (request.user.is_staff or request.user.is_superuser)

class AdminStatsView(views.APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]

    def get(self, request):
        return Response({
            "total_users": User.objects.count(),
            "premium_users": User.objects.filter(is_premium=True).count(),
            "pending_reports": Report.objects.filter(resolved=False).count(),
            "pending_payments": PaymentRequest.objects.filter(status='pending').count(),
        })

class AdminUserListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]
    serializer_class = UserSerializer
    queryset = User.objects.all().order_by('-date_joined')

class AdminBanUserView(views.APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]

    def post(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
            user.status = 'perm_banned'
            user.is_active = False 
            user.save()
            return Response({"status": "banned"})
        except User.DoesNotExist:
            return Response(status=404)

class AdminReportListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]
    serializer_class = ReportSerializer
    queryset = Report.objects.all().order_by('-created_at')

class AdminResolveReportView(views.APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]

    def post(self, request, pk):
        try:
            report = Report.objects.get(pk=pk)
            report.resolved = True
            report.resolution_notes = request.data.get('notes', 'Resolved by admin')
            report.save()
            return Response({"status": "resolved"})
        except Report.DoesNotExist:
            return Response(status=404)

class AdminPaymentListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]
    serializer_class = PaymentRequestSerializer
    queryset = PaymentRequest.objects.all().order_by('-created_at')

class AdminApprovePaymentView(views.APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]

    def post(self, request, pk):
        try:
            payment = PaymentRequest.objects.get(pk=pk)
            if payment.status != 'pending':
                return Response({"error": "Already processed"}, status=400)
            
            payment.status = 'approved'
            payment.save()
            
            user = payment.user
            user.is_premium = True
            days = payment.plan.duration_days
            user.premium_expiry = date.today() + timedelta(days=days)
            
            # Set Swipe Limit
            p_name = payment.plan.name.lower()
            if 'platinum' in p_name:
                user.daily_swipe_limit = 100000
            elif 'gold' in p_name:
                user.daily_swipe_limit = 60
            
            user.save()
            
            return Response({"status": "approved"})
        except PaymentRequest.DoesNotExist:
            return Response(status=404)

class AdminRejectPaymentView(views.APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]

    def post(self, request, pk):
        try:
            payment = PaymentRequest.objects.get(pk=pk)
            payment.status = 'rejected'
            payment.save()
            return Response({"status": "rejected"})
        except PaymentRequest.DoesNotExist:
            return Response(status=404)
