from django.urls import path
from . import views

app_name = 'notifications'

urlpatterns = [
    path('', views.NotificationListView.as_view(), name='list'),
    path('count/', views.notification_count, name='count'),
    path('<int:pk>/mark-read/', views.mark_notification_read, name='mark-read'),
    path('mark-all-read/', views.mark_all_read, name='mark-all-read'),
]
