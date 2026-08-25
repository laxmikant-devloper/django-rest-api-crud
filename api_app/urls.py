from django.urls import path
from . import views

urlpatterns = [
    path('insert',views.insert_record),
    path('getall',views.get_all),
    path('delete',views.delete_a),
    path('edit',views.edit)
    
]