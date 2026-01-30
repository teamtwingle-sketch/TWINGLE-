
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from users.views import (
    RegisterView, UserDetailView, MyTokenObtainPairView,
    AdminStatsView, AdminUserListView, AdminBanUserView,
    AdminReportListView, AdminResolveReportView,
    AdminPaymentListView, AdminApprovePaymentView, AdminRejectPaymentView
)
from profiles.views import ProfileDetailView, PublicProfileDetailView, InterestListView, UserPhotoViewSet
from matches.views import DiscoveryView, SwipeView, MatchListView
from chat.views import ChatViewSet, ChatListView, TypingView, CallViewSet
from payments.views import SubscriptionPlanListView, PaymentRequestCreateView, MyPaymentStatusView
from reports.views import ReportCreateView, BlockCreateView
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'photos', UserPhotoViewSet, basename='photo')
router.register(r'messages', ChatViewSet, basename='message')
router.register(r'calls', CallViewSet, basename='calls')

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Auth
    path('api/auth/register/', RegisterView.as_view(), name='auth_register'),
    path('api/auth/login/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/me/', UserDetailView.as_view(), name='auth_me'),

    # Admin Dashboard API
    path('api/admin/stats/', AdminStatsView.as_view()),
    path('api/admin/users/', AdminUserListView.as_view()),
    path('api/admin/users/<int:pk>/ban/', AdminBanUserView.as_view()),
    path('api/admin/reports/', AdminReportListView.as_view()),
    path('api/admin/reports/<int:pk>/resolve/', AdminResolveReportView.as_view()),
    path('api/admin/payments/', AdminPaymentListView.as_view()),
    path('api/admin/payments/<int:pk>/approve/', AdminApprovePaymentView.as_view()),
    path('api/admin/payments/<int:pk>/reject/', AdminRejectPaymentView.as_view()),

    # Profile
    path('api/profile/', ProfileDetailView.as_view(), name='profile_detail'),
    path('api/profile/<int:user_id>/', PublicProfileDetailView.as_view(), name='public_profile'),
    path('api/interests/', InterestListView.as_view(), name='interest_list'),
    
    # Discovery & Swiping
    path('api/discovery/', DiscoveryView.as_view(), name='discovery'),
    path('api/swipe/', SwipeView.as_view(), name='swipe'),
    path('api/matches/', MatchListView.as_view(), name='match_list'),
    
    # Payments
    path('api/plans/', SubscriptionPlanListView.as_view(), name='plan_list'),
    path('api/payments/submit/', PaymentRequestCreateView.as_view(), name='payment_submit'),
    path('api/payments/status/', MyPaymentStatusView.as_view(), name='payment_status'),
    
    # Safety
    path('api/report/', ReportCreateView.as_view(), name='report_create'),
    path('api/block/', BlockCreateView.as_view(), name='block_create'),

    # Router based (Photos, Chat)
    path('api/chats/', ChatListView.as_view(), name='chat_list'),
    path('api/chat/typing/', TypingView.as_view(), name='chat_typing'),
    path('api/', include(router.urls)),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
