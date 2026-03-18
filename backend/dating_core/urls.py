
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from users.views import (
    RegisterView, UserDetailView, MyTokenObtainPairView, UserDeleteView, GoogleLoginView,
    AdminStatsView, AdminUserListView, AdminBanUserView,
    AdminReportListView, AdminResolveReportView,
    AdminPaymentListView, AdminApprovePaymentView, AdminRejectPaymentView,
    RequestVerificationView, AdminVerificationListView, AdminVerifyUserView,
    NotificationListView
)
from profiles.views import ProfileDetailView, PublicProfileDetailView, InterestListView, UserPhotoViewSet
from django.views.generic import TemplateView
from matches.views import DiscoveryView, SwipeView, MatchListView, SentLikesView, UndoSwipeView, ReceivedLikesView
from chat.views import ChatViewSet, ChatListView, TypingView, CallViewSet, PublicChatViewSet
from payments.views import SubscriptionPlanListView, PaymentRequestCreateView, MyPaymentStatusView
from reports.views import ReportCreateView, BlockCreateView
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'photos', UserPhotoViewSet, basename='photo')
router.register(r'messages', ChatViewSet, basename='message')
router.register(r'calls', CallViewSet, basename='calls')
router.register(r'public-chat', PublicChatViewSet, basename='public_chat')

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Auth
    path('api/auth/register/', RegisterView.as_view(), name='auth_register'),
    path('api/auth/login/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/me/', UserDetailView.as_view(), name='auth_me'),
    path('api/auth/delete/', UserDeleteView.as_view(), name='auth_delete'),
    path('api/auth/google/', GoogleLoginView.as_view(), name='auth_google'),
    path('api/notifications/', NotificationListView.as_view(), name='notifications'),

    # Admin Dashboard API
    path('api/admin/stats/', AdminStatsView.as_view()),
    path('api/admin/users/', AdminUserListView.as_view()),
    path('api/admin/users/<int:pk>/ban/', AdminBanUserView.as_view()),
    path('api/admin/reports/', AdminReportListView.as_view()),
    path('api/admin/reports/<int:pk>/resolve/', AdminResolveReportView.as_view()),
    path('api/admin/payments/', AdminPaymentListView.as_view()),
    path('api/admin/payments/<int:pk>/approve/', AdminApprovePaymentView.as_view()),
    path('api/admin/payments/<int:pk>/reject/', AdminRejectPaymentView.as_view()),
    
    # Verification
    path('api/verification/request/', RequestVerificationView.as_view()),
    path('api/admin/verification/', AdminVerificationListView.as_view()),
    path('api/admin/verification/<int:pk>/verify/', AdminVerifyUserView.as_view()),

    # Profile
    path('api/profile/', ProfileDetailView.as_view(), name='profile_detail'),
    path('api/profile/<int:user_id>/', PublicProfileDetailView.as_view(), name='public_profile'),
    path('api/interests/', InterestListView.as_view(), name='interest_list'),
    
    # Discovery & Swiping
    path('api/discovery/', DiscoveryView.as_view(), name='discovery'),
    path('api/swipe/', SwipeView.as_view(), name='swipe'),
    path('api/swipe/undo/', UndoSwipeView.as_view(), name='swipe_undo'),
    path('api/matches/', MatchListView.as_view(), name='match_list'),
    path('api/matches/sent/', SentLikesView.as_view(), name='sent_likes'),
    path('api/matches/received/', ReceivedLikesView.as_view(), name='received_likes'),
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
    
    # SEO Files
    path('sitemap.xml', TemplateView.as_view(template_name='sitemap.xml', content_type='text/xml')),
    path('robots.txt', TemplateView.as_view(template_name='robots.txt', content_type='text/plain')),
    
    path('', TemplateView.as_view(template_name='index.html')),
]

from django.views.static import serve
from django.urls import re_path

# Serve media files in development AND production (since we are not using S3/Cloud Storage)
# Note: This is not efficient for high-traffic production but necessary for this deployment setup.
urlpatterns += [
    re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
]

if settings.DEBUG:
    # Static is handled by WhiteNoise in production, but we keep this for dev
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

