from rest_framework import generics, permissions
from .models import Report, Block
from .serializers import ReportSerializer, BlockSerializer

class ReportCreateView(generics.CreateAPIView):
    queryset = Report.objects.all()
    serializer_class = ReportSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def perform_create(self, serializer):
        report = serializer.save(reporter=self.request.user)
        
        # Check report count for automatic ban
        reported_user = report.reported_user
        count = Report.objects.filter(reported_user=reported_user).count()
        
        if count >= 3:
            reported_user.status = 'under_review'
            reported_user.save()
            
        if count >= 10:
             reported_user.status = 'temp_banned'
             reported_user.save()
             Report.objects.filter(reported_user=reported_user).update(action_taken="Auto-temp-banned (10+ reports)")

class BlockCreateView(generics.CreateAPIView):
    queryset = Block.objects.all()
    serializer_class = BlockSerializer
    permission_classes = (permissions.IsAuthenticated,)
