
from rest_framework import serializers
from .models import PaymentRequest, SubscriptionPlan

class SubscriptionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionPlan
        fields = '__all__'

class PaymentRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentRequest
        fields = ('id', 'plan', 'screenshot', 'transaction_id', 'status', 'created_at')
        read_only_fields = ('status', 'created_at')
