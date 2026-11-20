from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('payments', '0003_alter_paymentrequest_id_alter_subscriptionplan_id'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AlterField(
            model_name='paymentrequest',
            name='screenshot',
            field=models.ImageField(blank=True, null=True, upload_to='payment_proofs/'),
        ),
        migrations.CreateModel(
            name='CouponCode',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('code', models.CharField(db_index=True, max_length=50, unique=True)),
                ('plan_duration_days', models.IntegerField(default=90)),
                ('is_used', models.BooleanField(default=False)),
                ('used_at', models.DateTimeField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('used_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='redeemed_coupons', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
