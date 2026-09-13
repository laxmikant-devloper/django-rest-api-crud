from django.urls import path
from . import views


urlpatterns = [
    path('chatbot/', views.chatbot),
    path('insert',views.insert_record),
    path('getall',views.get_all),
    path('delete',views.delete_a),
    path('edit',views.edit),


    path('phone/', views.phone_page, name='phone_page'),
    path('send-phone/', views.send_phone),
    path('otp/', views.otp_page),
    path('verify-otp', views.verify_otp),
    path('profile/', views.profile),
    path('profile-page/', views.profile_page),
    path('my-phone/', views.my_phone),
    path('token/refresh/', views.refresh_token, name='refresh_token'),
    path('logout/', views.logout_user,  name='logout'),

    path('register/', views.register_page),
    path('login/', views.login_page),
    path('login-user/', views.login_user),
    path('register-user/', views.register_user),
    path('update-profile/', views.update_profile),
    path('dashboard/', views.dashboard_page),
    path('edit-profile/', views.edit_profile_page),
    path('dashboard/profile/', views.profile_view_page),
    path('update_profile/', views.update_profile),
    path('products/', views.products),
    path('add-to-cart/', views.add_to_cart),
    path('cart-count/', views.cart_count),
    path('cart/', views.cart),
    path('update-cart-quantity/', views.update_cart_quantity),
    path('remove-cart-item/<int:cart_id>/', views.remove_cart_item),
    path('dashboard/order/', views.order_page),

    path('dashboard/cart/', views.cart_page),
    path('dashboard/pay/', views.payment_page),
    path('create-order/', views.create_order),
    path('verify-payment/', views.verify_payment),
    path('orders/', views.orders),
    path('update-order-status/', views.update_order_status),
    path('download-invoice/<int:order_id>/', views.download_invoice),
        
    path('wishlist-count/', views.wishlist_count),
    path('wishlist-toggle/', views.toggle_wishlist),
    path('notification-count/', views.notification_count),
    path('notifications/', views.notifications),
    path('dashboard/notification/', views.notification_page),
    path('notification-read/', views.mark_notification_read),
    path('dashboard/wishlist/', views.wishlist_page),
    path('dashboard/address/', views.address_page),
    path('addresses/', views.address_list),
    path('addresses/<int:address_id>/', views.address_manage),
    path('reviews/', views.reviews_api),
    path('dashboard/reviews/', views.review_page),
    
    path('dashboard/helps/', views.helps_page),
    path('dashboard/setting/', views.settings_page),
    path('change-password/', views.change_password),
    path('dashboard/privacy-security/', views.privacy_security_page),

    path('forget/', views.forget_page),
    path('forgot-password/send-otp/', views.forgot_password_send_otp),
    path('forgot-password/verify-otp/', views.forgot_password_verify_otp),
    path('forgot-password/reset/', views.forgot_password_reset),
    path("product/<int:product_id>/",views.product_detail_page, name="product_detail_page"),
    path("product-api/<int:product_id>/",views.product_detail_api,name="product_detail_api"),
    path("wishlist/",views.wishlist_products,name="wishlist-products" ),
        
    
]