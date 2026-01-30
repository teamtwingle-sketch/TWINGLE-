
from django.contrib import admin
from .models import Report, Block

@admin.register(Block)
class BlockAdmin(admin.ModelAdmin):
    list_display = ('blocker', 'blocked_user', 'created_at')
    search_fields = ('blocker__email', 'blocked_user__email')

@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ('reported_user', 'reporter', 'reason', 'created_at', 'resolved')
    list_filter = ('reason', 'resolved')
    actions = ['resolve_reports', 'ban_user']

    def resolve_reports(self, request, queryset):
        queryset.update(resolved=True)
    
    def ban_user(self, request, queryset):
        for report in queryset:
            user = report.reported_user
            user.status = 'perm_banned'
            user.save()
            report.resolved = True
            report.save()
