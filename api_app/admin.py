from django.contrib import admin
from .models import Order, OrderItem
from .models import Product, ProductImage

# admin.site.register(Product)


#register admin
@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "user",
        "total_amount",
        "payment_method",
        "payment_status",
        "status",
        "created_at",
    )

    list_filter = (
        "status",
        "payment_status",
        "payment_method",
    )

    search_fields = (
        "id",
        "user__username",
        "full_name",
        "mobile",
        "payment_id",
    )

    ordering = ("-created_at",)



#product me multiple image on upload
class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 4
    fields = ("image",)

#product admin
@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):

    list_display = (
        "name",
        "category",
        "price",
        "created_at",
    )

    list_filter = ("category",)

    search_fields = ("name", "description")

    inlines = [ProductImageInline]