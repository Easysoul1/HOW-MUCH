from django.urls import path
from . import views

app_name = 'crowdsource'

urlpatterns = [
    path('submissions/', views.SubmissionListCreateView.as_view(), name='submission-list-create'),
    path('submissions/<int:pk>/', views.SubmissionDetailView.as_view(), name='submission-detail'),
    path('items/<int:pk>/approve/', views.ItemApproveView.as_view(), name='item-approve'),
    path('items/<int:pk>/reject/', views.ItemRejectView.as_view(), name='item-reject'),
]
