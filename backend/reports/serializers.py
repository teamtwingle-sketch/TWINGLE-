from rest_framework import serializers
from .models import Report, Block

class ReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = ('id', 'reported_user', 'reason', 'explanation', 'created_at')
        read_only_fields = ('reporter', 'created_at')

    def create(self, validated_data):
        validated_data['reporter'] = self.context['request'].user
        return super().create(validated_data)

class BlockSerializer(serializers.ModelSerializer):
    class Meta:
        model = Block
        fields = ('id', 'blocked_user', 'created_at')
        read_only_fields = ('blocker', 'created_at')

    def create(self, validated_data):
        validated_data['blocker'] = self.context['request'].user
        return super().create(validated_data)
