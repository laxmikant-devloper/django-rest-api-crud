import os
from pathlib import Path
from dotenv import load_dotenv
from ollama import chat
from rest_framework.decorators import (api_view, permission_classes, parser_classes)
from rest_framework.parsers import MultiPartParser, FormParser

BASE_DIR = Path(__file__).resolve().parent.parent
ENV_FILE = BASE_DIR / ".env"

load_dotenv(ENV_FILE)
from django.core.mail import send_mail
import resend
from django.conf import settings


from django.shortcuts import render,HttpResponse
from django.views.decorators.csrf import csrf_exempt
import io
from rest_framework.parsers import JSONParser
from rest_framework.renderers import JSONRenderer
from .serializer import StudentSerializer
import json
from . models import Student
from django.http import JsonResponse

from .models import PhoneNumber
import random
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from .authentication import CookieJWTAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.permissions import AllowAny
from django.contrib.auth import authenticate,update_session_auth_hash
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from .models import Profile
from .models import WishlistItem
from .models import Product, CartItem, Order, OrderItem,Notification,Address,Review
import razorpay
from django.conf import settings
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from django.db.models import Q

from django.db.models import Avg, Count
from rest_framework import status


# Create your views here.

# Create student data
@csrf_exempt
def insert_record(request):
    jdata=request.body
   # print(jdata)
    sdata=io.BytesIO(jdata)
   # print(sdata)
    dict=JSONParser().parse(sdata)
    #print(dict)

    s=StudentSerializer(data=dict)
    if s.is_valid():
        s.save()

    d={'res':'data inserted successfilly'}
    jdata=json.dumps(d)
    return HttpResponse(jdata,content_type='application/json')

# read show display student data
def get_all(request):
   rec=Student.objects.all()
  # print(rec)
   s=StudentSerializer(rec,many=True)
   #print(s.data)
   jdata=JSONRenderer().render(s.data)
   #print(jdata)
   #print(type(jdata))
   return HttpResponse(jdata,content_type='application/json')

#delete student data
@csrf_exempt
def delete_a(req):
    print('delete  in function')
    jdata=req.body
   # print(jdata)
    sdata=io.BytesIO(jdata)
   # print(sdata)
    dict=JSONParser().parse(sdata)
   # print(dict)
    rid=dict['id']
    s=Student.objects.get(id=rid)
    s.delete()
    d={'res':'data delete successfully'}
    jdata=json.dumps(d)
    return HttpResponse(jdata,content_type='appliction/json')


# update student data
@csrf_exempt
def edit(req):
    jbdata=  req.body
    #print(jdata)
    sdata=io.BytesIO(jbdata)
    #print(sdata)
    dict=JSONParser().parse(sdata)
   # print(dict)
    rid=dict['id']
    s=Student.objects.get(id=rid)
    stu=StudentSerializer(s, data=dict)
    if stu.is_valid():
        stu.save()
        d={'res':'record updated successfully'}
        json_res=json.dumps(d)
        return HttpResponse(json_res,content_type='application/json')
    else:
        return HttpResponse(
            json.dumps(stu.errors),
            content_type='application/json',
            status=400
        )


    
# phone verification
def phone_page(req):
        return render(req,'phone.html')

# Send OTP
def otp_page(req):
    return render(req,'otp.html')

# # Send OTP# Send OTP
# def send_phone(request):
#     if request.method == "POST":

#         phone = request.POST.get("phone")

#         if not phone:
#             return JsonResponse({
#                 "success": False,
#                 "message": "Phone number is required"
#             })

#         phone_obj, created = PhoneNumber.objects.get_or_create(
#             phone=phone
#         )

#         current_time = timezone.now()

#         # ---------------------------------
#         # Limit reach hone ke baad 2 minutes
#         # ---------------------------------
#         if phone_obj.otp_limit_reached_at:

#             seconds_passed = (
#                 current_time - phone_obj.otp_limit_reached_at
#             ).total_seconds()

#             if seconds_passed < 120:
#                 remaining = int(120 - seconds_passed)

#                 return JsonResponse({
#                     "success": False,
#                     "message": f"OTP limit reached. Please try again after {remaining} seconds."
#                 })

#             # 2 minutes complete -> reset limit
#             phone_obj.otp_resend_count = 0
#             phone_obj.otp_limit_reached_at = None
#             phone_obj.otp_last_sent_at = None
#             phone_obj.save()

#         # ---------------------------------
#         # Normal resend gap = 60 seconds
#         # ---------------------------------
#         if phone_obj.otp_last_sent_at:

#             seconds_passed = (
#                 current_time - phone_obj.otp_last_sent_at
#             ).total_seconds()

#             if seconds_passed < 60:
#                 remaining = int(60 - seconds_passed)

#                 return JsonResponse({
#                     "success": False,
#                     "message": f"Please wait {remaining} seconds before resending OTP."
#                 })

#         # ---------------------------------
#         # Maximum 2 OTP SMS
#         # ---------------------------------
#         if phone_obj.otp_resend_count >= 2:

#             # Limit reach hone ka time save
#             phone_obj.otp_limit_reached_at = current_time
#             phone_obj.save()

#             return JsonResponse({
#                 "success": False,
#                 "message": "OTP limit reached. Please try again after 2 minutes."
#             })

#         # ---------------------------------
#         # Generate 6 digit OTP
#         # ---------------------------------
#         otp = str(random.randint(100000, 999999))

#         phone_obj.otp = otp
#         phone_obj.otp_created_at = current_time
#         phone_obj.otp_last_sent_at = current_time
#         phone_obj.otp_attempts = 0

#         # OTP send count increase
#         phone_obj.otp_resend_count += 1

#         phone_obj.save()

#         request.session["phone"] = phone

#         # Testing ke liye terminal me OTP
#         print("Phone Number:", phone)
#         print("OTP:", otp)

#         return JsonResponse({
#             "success": True,
#             "message": "OTP sent successfully"
#         })

#     return JsonResponse({
#         "success": False,
#         "message": "Only POST method allowed"
#     })

def send_phone(request):

    if request.method != "POST":
        return JsonResponse({
            "success": False,
            "message": "Only POST method allowed"
        })

    # ---------------------------------
    # Get phone + email
    # ---------------------------------

    phone = request.POST.get("phone", "").strip()
    email = request.POST.get("email", "").strip()

    # ---------------------------------
    # Phone validation
    # ---------------------------------

    if not phone:
        return JsonResponse({
            "success": False,
            "message": "Phone number is required"
        })

    if not phone.isdigit() or len(phone) != 10:
        return JsonResponse({
            "success": False,
            "message": "Please enter a valid 10 digit phone number"
        })

    # ---------------------------------
    # Email validation
    # ---------------------------------

    if not email:
        return JsonResponse({
            "success": False,
            "message": "Email address is required"
        })

    if "@" not in email or "." not in email:
        return JsonResponse({
            "success": False,
            "message": "Please enter a valid email address"
        })

    # ---------------------------------
    # Get / Create Phone
    # ---------------------------------

    phone_obj, created = PhoneNumber.objects.get_or_create(
        phone=phone
    )

    current_time = timezone.now()

    # ---------------------------------
    # Generate OTP
    # ---------------------------------

    otp = str(random.randint(100000, 999999))

    phone_obj.otp = otp
    phone_obj.otp_created_at = current_time
    phone_obj.otp_last_sent_at = current_time
    phone_obj.otp_attempts = 0

    # Old resend-limit fields are not used
    phone_obj.save()

    # ---------------------------------
    # Save phone + email in session
    # ---------------------------------

    request.session["phone"] = phone
    request.session["email"] = email

    # ---------------------------------
    # Send OTP using Resend
    # ---------------------------------

    try:

        resend.api_key = settings.RESEND_API_KEY

        resend.Emails.send({
            "from": "SKShop <onboarding@resend.dev>",
            "to": [email],
            "subject": "SKShop OTP Verification",
            "text": f"""
Hello,

Your SKShop verification OTP is:

{otp}

This OTP is valid for 5 minutes.

Please do not share this OTP with anyone.

Thank you,
SKShop Team
"""
        })

    except Exception as e:

        print("Resend Email Error:", e)

        return JsonResponse({
            "success": False,
            "message": "Unable to send OTP to email. Please try again."
        })

    # ---------------------------------
    # Testing
    # ---------------------------------

    print("Phone Number:", phone)
    print("Email:", email)
    print("OTP:", otp)

    return JsonResponse({
        "success": True,
        "message": "OTP sent successfully to your email"
    })
# Verify OTP
# def verify_otp(request):

    if request.method == "POST":

        phone = request.POST.get("phone")
        otp = request.POST.get("otp")

        # Phone number check
        phone_obj = PhoneNumber.objects.filter(
            phone=phone
        ).first()

        if phone_obj is None:
            return JsonResponse({
                "success": False,
                "message": "Phone number not found"
            })

        # Attempt limit
        if phone_obj.otp_attempts >= 3:
            return JsonResponse({
                "success": False,
                "message": "Too many wrong attempts. Please resend OTP."
            })

        # OTP exists check
        if phone_obj.otp_created_at is None:
            return JsonResponse({
                "success": False,
                "message": "OTP not found. Please resend OTP."
            })

        # OTP time check
        current_time = timezone.now()

        otp_age = current_time - phone_obj.otp_created_at

        if otp_age > timedelta(minutes=5):
            return JsonResponse({
                "success": False,
                "message": "OTP has expired. Please resend OTP."
            })

        # Correct OTP
        if phone_obj.otp == otp:

            # Phone number se user find/create
            user, created = User.objects.get_or_create(
                username=phone
            )

            # New user check
            if created:
                new_user = True
            elif user.first_name:
                new_user = False
            else:
                new_user = True

            # PhoneNumber ko User se connect
            phone_obj.user = user
            phone_obj.save()

            # JWT token generate
            refresh = RefreshToken.for_user(user)

            # OTP clear
            phone_obj.otp = None
            phone_obj.otp_created_at = None
            phone_obj.otp_attempts = 0
            phone_obj.save()

            # Response
            response = JsonResponse({
                "success": True,
                "message": "OTP verified successfully",
                "new_user": new_user
            })

            # Access Token
            response.set_cookie(
                "access_token",
                str(refresh.access_token),
                httponly=True,
                secure=False,
                samesite="Lax",
                max_age=120,
                path="/"
            )

            # Refresh Token
            response.set_cookie(
                "refresh_token",
                str(refresh),
                httponly=True,
                secure=False,
                samesite="Lax",
                max_age=600,
                path="/"
            )

            return response

        # Wrong OTP
        phone_obj.otp_attempts += 1
        phone_obj.save()

        remaining = 3 - phone_obj.otp_attempts

        if remaining > 0:
            return JsonResponse({
                "success": False,
                "message": f"Invalid OTP. {remaining} attempts remaining."
            })

        return JsonResponse({
            "success": False,
            "message": "Too many wrong attempts. Please resend OTP."
        })

    return JsonResponse({
        "success": False,
        "message": "Only POST method allowed"
    })

def verify_otp(request):

    if request.method == "POST":

        phone = request.POST.get("phone")
        otp = request.POST.get("otp")
        email = request.POST.get("email")

        # ---------------------------------
        # Phone check
        # ---------------------------------

        phone_obj = PhoneNumber.objects.filter(
            phone=phone
        ).first()

        if phone_obj is None:

            return JsonResponse({
                "success": False,
                "message": "Phone number not found"
            })

        # ---------------------------------
        # Attempt limit
        # ---------------------------------

        if phone_obj.otp_attempts >= 3:

            return JsonResponse({
                "success": False,
                "message":
                    "Too many wrong attempts. Please resend OTP."
            })

        # ---------------------------------
        # OTP exists check
        # ---------------------------------

        if phone_obj.otp_created_at is None:

            return JsonResponse({
                "success": False,
                "message":
                    "OTP not found. Please resend OTP."
            })

        # ---------------------------------
        # OTP expiry
        # ---------------------------------

        current_time = timezone.now()

        otp_age = (
            current_time -
            phone_obj.otp_created_at
        )

        if otp_age > timedelta(minutes=5):

            return JsonResponse({
                "success": False,
                "message":
                    "OTP has expired. Please resend OTP."
            })

        # ---------------------------------
        # Correct OTP
        # ---------------------------------

        if phone_obj.otp == otp:

            # ---------------------------------
            # User find/create
            # ---------------------------------

            user, created = User.objects.get_or_create(
                username=phone
            )

            # ---------------------------------
            # New user check
            # ---------------------------------

            if created:

                new_user = True

            elif user.first_name:

                new_user = False

            else:

                new_user = True

            # ---------------------------------
            # Save email
            # ---------------------------------

            if email:

                user.email = email
                user.save()

            # ---------------------------------
            # Connect PhoneNumber with User
            # ---------------------------------

            phone_obj.user = user

            phone_obj.otp = None
            phone_obj.otp_created_at = None
            phone_obj.otp_attempts = 0

            phone_obj.save()

            # ---------------------------------
            # JWT
            # ---------------------------------

            refresh = RefreshToken.for_user(user)

            # ---------------------------------
            # Response
            # ---------------------------------

            response = JsonResponse({

                "success": True,

                "message":
                    "OTP verified successfully",

                "new_user":
                    new_user

            })

            # ---------------------------------
            # Access Token
            # ---------------------------------

            response.set_cookie(

                "access_token",

                str(refresh.access_token),

                httponly=True,

                secure=False,

                samesite="Lax",

                max_age=120,

                path="/"

            )

            # ---------------------------------
            # Refresh Token
            # ---------------------------------

            response.set_cookie(

                "refresh_token",

                str(refresh),

                httponly=True,

                secure=False,

                samesite="Lax",

                max_age=600,

                path="/"

            )

            return response

        # ---------------------------------
        # Wrong OTP
        # ---------------------------------

        phone_obj.otp_attempts += 1

        phone_obj.save()

        remaining = (
            3 - phone_obj.otp_attempts
        )

        if remaining > 0:

            return JsonResponse({

                "success": False,

                "message":
                    f"Invalid OTP. {remaining} attempts remaining."

            })

        return JsonResponse({

            "success": False,

            "message":
                "Too many wrong attempts. Please resend OTP."

        })

    return JsonResponse({

        "success": False,

        "message":
            "Only POST method allowed"

    })

def profile_page(request):
    return render(request, "profile.html")

# profile
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile(request):
    user = request.user

    profile, created = Profile.objects.get_or_create( user=user)

    photo_url = None

    if profile.photo:
        photo_url = request.build_absolute_uri(profile.photo.url)

    return Response({
        "success": True,
        "message": "Authenticated successfully",
        "user_id": user.id,
        "name": user.first_name,
        "email": user.email,
        "phone": user.username,
        "photo": photo_url
    })

#phone
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_phone(request):

    phone_obj = PhoneNumber.objects.filter(user=request.user ).first()

    if phone_obj is None:
        return Response({
            "success": False,
            "message": "Phone number not found"
        })

    return Response({
        "success": True,
        "user_id": request.user.id,
        "phone": phone_obj.phone
    })


#refresh token autometic
@api_view(['POST'])
def refresh_token(request):
    refresh = request.COOKIES.get("refresh_token")

    if not refresh:
        return Response({
            "success": False,
            "message": "Refresh token not found"
        }, status=401)

    serializer = TokenRefreshSerializer(
        data={"refresh": refresh }
    )

    if serializer.is_valid():

        new_access = serializer.validated_data["access"]

        response = Response({
            "success": True,
            "message": "Access token refreshed"
        })

        response.set_cookie(
            "access_token",
            new_access,
            httponly=True,
            secure=False,
            samesite="Lax",
            max_age=1800
        )

        return response

    return Response({
        "success": False,
        "message": "Refresh token is invalid or expired"
    }, status=401)



#register 
def register_page(request):
    return render(request, "register.html")

#login
def login_page(request):
    return render(request, "login.html")

#logout
@api_view(['POST'])
def logout_user(request):

    response = Response({
        "success": True,
        "message": "Logout successful"
    })

    response.set_cookie(
        "access_token", "",
        max_age=0,
        expires=0,
        httponly=True,
        secure=False,
        samesite="Lax",
        path="/"
    )

    response.set_cookie(
        "refresh_token",  "",
        max_age=0,
        expires=0,
        httponly=True,
        secure=False,
        samesite="Lax",
        path="/"
    )

    return response


#login
@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):

    email = request.data.get("email")
    password = request.data.get("password")

    if not email or not password:
        return Response({
            "success": False,
            "message": "Email and password are required"
        }, status=400)

    user = User.objects.filter(email=email).first()

    if user is None:
        return Response({
            "success": False,
            "message": "Invalid email or password"
        }, status=401)

    authenticated_user = authenticate(
        username=user.username,
        password=password
    )

    if authenticated_user is None:
        return Response({
            "success": False,
            "message": "Invalid email or password"
        }, status=401)

    refresh = RefreshToken.for_user(authenticated_user)

    response = Response({
        "success": True,
        "message": "Login successful"
    })

    response.set_cookie(
        "access_token",
        str(refresh.access_token),
        httponly=True,
        secure=False,
        samesite="Lax",
        max_age=1800,
        path="/"
    )

    response.set_cookie(
        "refresh_token",
        str(refresh),
        httponly=True,
        secure=False,
        samesite="Lax",
        max_age=604800,
        path="/"
    )

    return response





def edit_profile_page(request):
    return render(request, "edit-profile.html")

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def update_profile(request):
    print("UPDATE PROFILE FUNCTION CALLED")
    user = request.user

    name = request.data.get("name")
    email = request.data.get("email")
    phone = request.data.get("phone")

    # ==============================
    # VALIDATION
    # ==============================

    if not name or not email or not phone:

        return Response({
            "success": False,
            "message": "Name, email and phone are required"
        }, status=400)


    # ==============================
    # UPDATE USER
    # ==============================

    user.first_name = name
    user.email = email
    user.save()


    # ==============================
    # UPDATE PHONE
    # ==============================

    phone_obj = PhoneNumber.objects.filter(
        user=user
    ).first()

    if phone_obj:

        phone_obj.phone = phone
        phone_obj.save()

    else:

        phone_obj = PhoneNumber.objects.create(
            user=user,
            phone=phone
        )


    # ==============================
    # PROFILE
    # ==============================

    profile, created = Profile.objects.get_or_create(
        user=user
    )


    # ==============================
    # UPDATE PROFILE PHOTO
    # ==============================

    print("REQUEST DATA:", request.data)
    print("REQUEST FILES:", request.FILES)

    photo = request.FILES.get("photo")

    print("PHOTO FROM BACKEND:", photo)
    if photo:

        profile.photo = photo
        profile.save()


    # ==============================
    # PHOTO URL
    # ==============================

    photo_url = None

    if profile.photo:

        photo_url = request.build_absolute_uri(
            profile.photo.url
        )


    # ==============================
    # RESPONSE
    # ==============================

    return Response({

    "success": True,

    "message":
        "Profile updated successfully",

    "name":
        user.first_name,

    "email":
        user.email,

    "phone":
        phone_obj.phone,

    "photo":
        photo_url,

    "debug_files":
        list(request.FILES.keys())

})

@api_view(['POST'])
@authentication_classes([CookieJWTAuthentication])
@permission_classes([IsAuthenticated])
def register_user(request):

    name = request.data.get("name")
    email = request.data.get("email")
    password = request.data.get("password")

    # Required fields check
    if not name or not email or not password:
        return Response({
            "success": False,
            "message": "Name, email and password are required"
        }, status=400)

    # Password length
    if len(password) < 8:
        return Response({
            "success": False,
            "message": "Password must be at least 8 characters"
        }, status=400)

    user = request.user

    # Save user details
    user.first_name = name
    user.email = email

    # Secure password save
    user.set_password(password)

    user.save()

    return Response({
        "success": True,
        "message": "Registration completed successfully",
        "name": user.first_name,
        "email": user.email
    })




# @api_view(['PUT'])
# @permission_classes([IsAuthenticated])
# def update_profile(request):

#     name = request.data.get("name")
#     email = request.data.get("email")

#     if not name or not email:
#         return Response({
#             "success": False,
#             "message": "Name and email are required"
#         }, status=400)

#     user = request.user

#     user.first_name = name
#     user.email = email
#     user.save()

#     return Response({
#         "success": True,
#         "message": "Profile updated successfully",
#         "name": user.first_name,
#         "email": user.email,
#         "phone": user.username
#     })


def dashboard_page(request):
    return render(request, "dashboard.html")

@api_view(['GET'])
def products(request):

    category = request.GET.get("category")
    search = request.GET.get("search")

    product_list = Product.objects.all()

    # ==============================
    # CATEGORY FILTER
    # ==============================

    if category:
        product_list = product_list.filter(
            category=category
        )

    # ==============================
    # SEARCH FILTER
    # ==============================

    if search:

        product_list = product_list.filter(
            Q(name__icontains=search) |
            Q(description__icontains=search) |
            Q(category__icontains=search)
        )

    product_list = product_list.order_by("-created_at")

    data = []

    for product in product_list:

        image_url = None

        if product.image:

            image_url = request.build_absolute_uri(
                product.image.url
            )

        data.append({

            "id": product.id,

            "name": product.name,

            "price": str(product.price),

            "description": product.description,

            "image": image_url,

            "category": product.category

        })

    return Response({

        "success": True,

        "products": data

    })

# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def add_to_cart(request):

#     product_id = request.data.get("product_id")

#     if not product_id:
#         return Response({
#             "success": False,
#             "message": "Product ID is required"
#         }, status=400)


#     try:
#         product = Product.objects.get(
#             id=product_id
#         )

#     except Product.DoesNotExist:

#         return Response({
#             "success": False,
#             "message": "Product not found"
#         }, status=404)


#     cart_item, created = CartItem.objects.get_or_create(

#         user=request.user,

#         product=product,

#         defaults={
#             "quantity": 1
#         }

#     )


#     if not created:

#         cart_item.quantity += 1
#         cart_item.save()


#     return Response({

#         "success": True,

#         "message": "Product added to cart",

#         "product_id": product.id,

#         "quantity": cart_item.quantity

#     })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_to_cart(request):

    product_id = request.data.get("product_id")

    # Detail page se quantity aayegi
    # Dashboard se nahi aayegi to default 1 rahegi
    quantity = request.data.get("quantity")

    if not product_id:
        return Response({
            "success": False,
            "message": "Product ID is required"
        }, status=400)

    try:
        product = Product.objects.get(id=product_id)

    except Product.DoesNotExist:
        return Response({
            "success": False,
            "message": "Product not found"
        }, status=404)

    # ==========================================
    # QUANTITY
    # ==========================================

    if quantity is not None:

        try:
            quantity = int(quantity)

        except (ValueError, TypeError):
            return Response({
                "success": False,
                "message": "Invalid quantity"
            }, status=400)

        if quantity < 1:
            return Response({
                "success": False,
                "message": "Quantity must be at least 1"
            }, status=400)

    else:
        # Dashboard ke normal Add to Cart ke liye
        quantity = 1

    # ==========================================
    # CART ITEM
    # ==========================================

    cart_item, created = CartItem.objects.get_or_create(
        user=request.user,
        product=product,
        defaults={
            "quantity": quantity
        }
    )

    # ==========================================
    # EXISTING ITEM
    # ==========================================

    if not created:

        # Agar detail page se quantity bheji gayi hai
        if "quantity" in request.data:

            # Exact quantity set karo
            cart_item.quantity = quantity

        else:

            # Dashboard Add to Cart
            # normal +1 behavior
            cart_item.quantity += 1

        cart_item.save()

    # ==========================================
    # RESPONSE
    # ==========================================

    return Response({
        "success": True,
        "message": "Product added to cart",
        "product_id": product.id,
        "quantity": cart_item.quantity
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def cart_count(request):

    items = CartItem.objects.filter(
        user=request.user
    )

    count = sum(
        item.quantity
        for item in items
    )

    return Response({
        "success": True,
        "count": count
    })





@api_view(['GET'])
@permission_classes([IsAuthenticated])
def cart(request):

    cart_items = CartItem.objects.filter(
        user=request.user
    ).select_related("product")

    data = []

    total = 0

    for item in cart_items:

        item_total = item.product.price * item.quantity

        total += item_total

        image_url = None

        if item.product.image:
            image_url = request.build_absolute_uri(
                item.product.image.url
            )

        data.append({

            "id": item.id,

            "product_id": item.product.id,

            "name": item.product.name,

            "price": str(item.product.price),

            "quantity": item.quantity,

            "total": str(item_total),

            "image": image_url

        })

    return Response({

        "success": True,

        "items": data,

        "total": str(total)

    })




@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_cart_quantity(request):

    cart_id = request.data.get("cart_id")
    quantity = request.data.get("quantity")

    if not cart_id or quantity is None:
        return Response({
            "success": False,
            "message": "Cart ID and quantity are required"
        }, status=400)

    try:
        cart_item = CartItem.objects.get(
            id=cart_id,
            user=request.user
        )
    except CartItem.DoesNotExist:
        return Response({
            "success": False,
            "message": "Cart item not found"
        }, status=404)

    try:
        quantity = int(quantity)
    except (ValueError, TypeError):
        return Response({
            "success": False,
            "message": "Invalid quantity"
        }, status=400)

    if quantity < 1:
        return Response({
            "success": False,
            "message": "Quantity must be at least 1"
        }, status=400)

    cart_item.quantity = quantity
    cart_item.save()

    return Response({
        "success": True,
        "message": "Cart quantity updated",
        "quantity": cart_item.quantity
    })


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_cart_item(request, cart_id):

    try:
        cart_item = CartItem.objects.get(
            id=cart_id,
            user=request.user
        )
    except CartItem.DoesNotExist:
        return Response({
            "success": False,
            "message": "Cart item not found"
        }, status=404)

    cart_item.delete()

    return Response({
        "success": True,
        "message": "Item removed from cart"
    })

def cart_page(request):
    return render(request, "cart.html")

def order_page(request):
    return render(request, "order.html")

def wishlist_page(request):
    return render(request, "wishlist.html")

def address_page(request):
    return render(request, "address.html")

def payment_page(request):
    return render(request, "pay.html")

def review_page(request):
    return render(request, "reviwe.html")

def helps_page(request):
    return render(request, "help.html")

def settings_page(request):
    return render(request, "setting.html")

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_order(request):

    user = request.user

    full_name = request.data.get("full_name")
    mobile = request.data.get("mobile")
    pincode = request.data.get("pincode")
    city = request.data.get("city")
    state = request.data.get("state")
    address = request.data.get("address")
    payment_method = request.data.get("payment_method")

    if not all([
        full_name,
        mobile,
        pincode,
        city,
        state,
        address,
        payment_method
    ]):
        return Response({
            "success": False,
            "message": "All address and payment details are required"
        }, status=400)

    if payment_method not in ["upi", "card", "cod"]:
        return Response({
            "success": False,
            "message": "Invalid payment method"
        }, status=400)

    cart_items = CartItem.objects.filter(
        user=user
    ).select_related("product")

    if not cart_items.exists():
        return Response({
            "success": False,
            "message": "Your cart is empty"
        }, status=400)

    # Calculate total from server
    total = 0

    for item in cart_items:
        total += item.product.price * item.quantity

    # Create local order
    order = Order.objects.create(
        user=user,
        full_name=full_name,
        mobile=mobile,
        pincode=pincode,
        city=city,
        state=state,
        address=address,
        payment_method=payment_method,
        total_amount=total,
        payment_status="pending",
        status="pending"
    )



    # Save order items
    for item in cart_items:

        item_total = item.product.price * item.quantity

        OrderItem.objects.create(
            order=order,
            product=item.product,
            product_name=item.product.name,
            price=item.product.price,
            quantity=item.quantity,
            total=item_total
        )


        product_names = OrderItem.objects.filter(
                order=order
            ).values_list(
                "product_name",
                flat=True
            )

        product_names_text = ", ".join(product_names)

        Notification.objects.create(
                user=user,
                message=(
                    f"Your order #{order.id} for "
                    f"{product_names_text} has been placed successfully."
                )
            )

    # Razorpay client
    client = razorpay.Client(
        auth=(
            settings.RAZORPAY_KEY_ID,
            settings.RAZORPAY_KEY_SECRET
        )
    )

    # Amount in paise
    razorpay_amount = int(total * 100)

    try:

        razorpay_order = client.order.create({
            "amount": razorpay_amount,
            "currency": "INR",
            "receipt": f"order_{order.id}"
        })

    except Exception as e:

        order.delete()

        return Response({
            "success": False,
            "message": "Unable to create Razorpay order",
            "error": str(e)
        }, status=500)

    # Save Razorpay Order ID
    order.payment_order_id = razorpay_order["id"]
    order.save()

    return Response({
        "success": True,
        "message": "Order created successfully",

        "order_id": order.id,

        "razorpay_order_id": razorpay_order["id"],

        "amount": str(order.total_amount),

        "razorpay_amount": razorpay_amount,

        "currency": "INR",

        "key_id": settings.RAZORPAY_KEY_ID,

        "payment_method": order.payment_method,

        "payment_status": order.payment_status
    })




@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_payment(request):

    user = request.user

    order_id = request.data.get("order_id")
    razorpay_payment_id = request.data.get("razorpay_payment_id")
    razorpay_order_id = request.data.get("razorpay_order_id")
    razorpay_signature = request.data.get("razorpay_signature")

    if not all([
        order_id,
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature
    ]):
        return Response({
            "success": False,
            "message": "Payment details are required"
        }, status=400)

    try:
        order = Order.objects.get(
            id=order_id,
            user=user
        )
    except Order.DoesNotExist:
        return Response({
            "success": False,
            "message": "Order not found"
        }, status=404)

    # Check Razorpay Order ID
    if order.payment_order_id != razorpay_order_id:
        return Response({
            "success": False,
            "message": "Invalid Razorpay order"
        }, status=400)

    client = razorpay.Client(
        auth=(
            settings.RAZORPAY_KEY_ID,
            settings.RAZORPAY_KEY_SECRET
        )
    )

    try:

        client.utility.verify_payment_signature({
            "razorpay_order_id": razorpay_order_id,
            "razorpay_payment_id": razorpay_payment_id,
            "razorpay_signature": razorpay_signature
        })

    except Exception:

        order.payment_status = "failed"
        order.save()

        return Response({
            "success": False,
            "message": "Payment verification failed"
        }, status=400)

    # Payment verified successfully
    order.payment_id = razorpay_payment_id
    order.payment_status = "paid"
    order.status = "confirmed"
    order.save()
# ======================================
# PAYMENT SUCCESS NOTIFICATION
# ======================================

    Notification.objects.create(
        user=user,
        message=(
            f"Payment successful for Order #{order.id}."
        )
    )

    # Clear cart only after successful verification
    CartItem.objects.filter(
        user=user
    ).delete()

    return Response({
        "success": True,
        "message": "Payment verified successfully",
        "order_id": order.id,
        "payment_id": order.payment_id,
        "payment_status": order.payment_status,
        "order_status": order.status
    })



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def orders(request):

    order_list = Order.objects.filter(
        user=request.user
    ).prefetch_related("items").order_by("-created_at")

    data = []

    for order in order_list:

        items = []

        for item in order.items.all():

            image_url = None

            if item.product.image:
                image_url = request.build_absolute_uri(
                    item.product.image.url
                )

            items.append({
                "product_id": item.product.id,
                "name": item.product_name,
                "price": str(item.price),
                "quantity": item.quantity,
                "total": str(item.total),
                "image": image_url
            })

        data.append({
            "id": order.id,
            "full_name": order.full_name,
            "mobile": order.mobile,
            "pincode": order.pincode,
            "city": order.city,
            "state": order.state,
            "address": order.address,

            "payment_method": order.payment_method,
            "payment_id": order.payment_id,
            "payment_order_id": order.payment_order_id,
            "payment_status": order.payment_status,

            "total_amount": str(order.total_amount),

            "status": order.status,

            "created_at": order.created_at.strftime(
                "%d %b %Y, %I:%M %p"
            ),

            "items": items
        })

    return Response({
        "success": True,
        "orders": data
    })





@api_view(['GET'])
@permission_classes([IsAuthenticated])
def wishlist_count(request):

    count = WishlistItem.objects.filter(
        user=request.user
    ).count()

    return Response({
        "success": True,
        "count": count
    })



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def wishlist_products(request):

    wishlist_items = WishlistItem.objects.filter(
        user=request.user
    ).select_related("product").order_by("-id")

    products = []

    for item in wishlist_items:

        product = item.product

        image_url = None

        if product.image:
            image_url = request.build_absolute_uri(
                product.image.url
            )

        products.append({
            "id": product.id,
            "name": product.name,
            "price": str(product.price),
            "category": product.get_category_display(),
            "image": image_url
        })

    return Response({
        "success": True,
        "products": products
    })




@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_wishlist(request):

    product_id = request.data.get("product_id")

    if not product_id:
        return Response({
            "success": False,
            "message": "Product ID is required"
        }, status=400)

    try:
        product = Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        return Response({
            "success": False,
            "message": "Product not found"
        }, status=404)

    wishlist_item = WishlistItem.objects.filter(
        user=request.user,
        product=product
    ).first()

    if wishlist_item:
        wishlist_item.delete()

        return Response({
            "success": True,
            "wishlisted": False,
            "message": "Removed from wishlist"
        })

    WishlistItem.objects.create(
        user=request.user,
        product=product
    )

    return Response({
        "success": True,
        "wishlisted": True,
        "message": "Added to wishlist"
    })




@api_view(['GET'])
@permission_classes([IsAuthenticated])
def notification_count(request):

    count = Notification.objects.filter(
        user=request.user,
        is_read=False
    ).count()

    return Response({
        "success": True,
        "count": count
    })



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def notifications(request):

    notification_list = Notification.objects.filter(
        user=request.user
    ).order_by("-created_at")

    data = []

    for notification in notification_list:

        data.append({
            "id": notification.id,
            "message": notification.message,
            "is_read": notification.is_read,
            "created_at": notification.created_at.strftime(
                "%d-%m-%Y %I:%M %p"
            )
        })

    return Response({
        "success": True,
        "notifications": data
    })


def notification_page(request):
    return render( request, "notification.html")


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_notification_read(request):

    notification_id = request.data.get("notification_id")

    if not notification_id:
        return Response({
            "success": False,
            "message": "Notification ID is required"
        }, status=400)

    try:
        notification = Notification.objects.get(
            id=notification_id,
            user=request.user
        )
    except Notification.DoesNotExist:
        return Response({
            "success": False,
            "message": "Notification not found"
        }, status=404)

    notification.is_read = True
    notification.save()

    return Response({
        "success": True,
        "message": "Notification marked as read"
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def download_invoice(request, order_id):

    user = request.user

    try:
        order = Order.objects.get(
            id=order_id,
            user=user
        )
    except Order.DoesNotExist:
        return Response({
            "success": False,
            "message": "Order not found"
        }, status=404)

    # Invoice only for delivered orders
    if order.status != "delivered":
        return Response({
            "success": False,
            "message": "Invoice is available after delivery"
        }, status=400)

    response = HttpResponse(
        content_type="application/pdf"
    )

    response["Content-Disposition"] = (
        f'attachment; filename="Invoice_Order_{order.id}.pdf"'
    )

    pdf = canvas.Canvas(
        response,
        pagesize=A4
    )

    width, height = A4

    # -------------------------
    # HEADER
    # -------------------------

    pdf.setFont("Helvetica-Bold", 20)

    pdf.drawString(
        25 * mm,
        height - 25 * mm,
        "INVOICE"
    )

    pdf.setFont("Helvetica", 10)

    pdf.drawRightString(
        width - 25 * mm,
        height - 25 * mm,
        f"Order #{order.id}"
    )

    pdf.drawRightString(
        width - 25 * mm,
        height - 31 * mm,
        order.created_at.strftime(
            "%d %b %Y, %I:%M %p"
        )
    )


    # -------------------------
    # CUSTOMER DETAILS
    # -------------------------

    y = height - 55 * mm

    pdf.setFont(
        "Helvetica-Bold",
        12
    )

    pdf.drawString(
        25 * mm,
        y,
        "Delivery Address"
    )

    y -= 8 * mm

    pdf.setFont(
        "Helvetica",
        10
    )

    pdf.drawString(
        25 * mm,
        y,
        order.full_name
    )

    y -= 6 * mm

    pdf.drawString(
        25 * mm,
        y,
        f"Mobile: {order.mobile}"
    )

    y -= 6 * mm

    pdf.drawString(
        25 * mm,
        y,
        order.address[:90]
    )

    y -= 6 * mm

    pdf.drawString(
        25 * mm,
        y,
        f"{order.city}, {order.state} - {order.pincode}"
    )


    # -------------------------
    # PRODUCTS
    # -------------------------

    y -= 15 * mm

    pdf.setFont(
        "Helvetica-Bold",
        12
    )

    pdf.drawString(
        25 * mm,
        y,
        "Ordered Products"
    )

    y -= 8 * mm

    # Table header

    pdf.setFont(
        "Helvetica-Bold",
        10
    )

    pdf.drawString(
        25 * mm,
        y,
        "Product"
    )

    pdf.drawString(
        105 * mm,
        y,
        "Price"
    )

    pdf.drawString(
        135 * mm,
        y,
        "Qty"
    )

    pdf.drawString(
        160 * mm,
        y,
        "Total"
    )

    y -= 5 * mm

    pdf.line(
        25 * mm,
        y,
        width - 25 * mm,
        y
    )

    y -= 7 * mm

    pdf.setFont(
        "Helvetica",
        10
    )

    for item in order.items.all():

        pdf.drawString(
            25 * mm,
            y,
            item.product_name[:35]
        )

        pdf.drawString(
            105 * mm,
            y,
            f"Rs. {item.price}"
        )

        pdf.drawString(
            137 * mm,
            y,
            str(item.quantity)
        )

        pdf.drawString(
            160 * mm,
            y,
            f"Rs. {item.total}"
        )

        y -= 7 * mm

        # New page if required

        if y < 35 * mm:

            pdf.showPage()

            y = height - 25 * mm

            pdf.setFont(
                "Helvetica",
                10
            )


    # -------------------------
    # TOTAL
    # -------------------------

    y -= 5 * mm

    pdf.line(
        120 * mm,
        y,
        width - 25 * mm,
        y
    )

    y -= 10 * mm

    pdf.setFont(
        "Helvetica-Bold",
        13
    )

    pdf.drawRightString(
        width - 25 * mm,
        y,
        f"Grand Total: Rs. {order.total_amount}"
    )


    # -------------------------
    # PAYMENT DETAILS
    # -------------------------

    y -= 15 * mm

    pdf.setFont(
        "Helvetica-Bold",
        11
    )

    pdf.drawString(
        25 * mm,
        y,
        "Payment Details"
    )

    y -= 7 * mm

    pdf.setFont(
        "Helvetica",
        10
    )

    pdf.drawString(
        25 * mm,
        y,
        f"Payment Method: {order.payment_method}"
    )

    y -= 6 * mm

    pdf.drawString(
        25 * mm,
        y,
        f"Payment Status: {order.payment_status}"
    )

    if order.payment_id:

        y -= 6 * mm

        pdf.drawString(
            25 * mm,
            y,
            f"Payment ID: {order.payment_id}"
        )


    # -------------------------
    # ORDER STATUS
    # -------------------------

    y -= 12 * mm

    pdf.setFont(
        "Helvetica-Bold",
        11
    )

    pdf.drawString(
        25 * mm,
        y,
        "Order Status: Delivered"
    )


    # -------------------------
    # FOOTER
    # -------------------------

    pdf.setFont(
        "Helvetica",
        9
    )

    pdf.drawCentredString(
        width / 2,
        15 * mm,
        "Thank you for your purchase!"
    )

    pdf.save()

    return response




@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_order_status(request):

    order_id = request.data.get("order_id")
    new_status = request.data.get("status")

    allowed_statuses = [
        "confirmed",
        "shipped",
        "out_for_delivery",
        "delivered",
        "cancelled"
    ]

    if not order_id or not new_status:
        return Response({
            "success": False,
            "message": "Order ID and status are required"
        }, status=400)

    if new_status not in allowed_statuses:
        return Response({
            "success": False,
            "message": "Invalid order status"
        }, status=400)

    try:
        order = Order.objects.get(
            id=order_id,
            user=request.user
        )
    except Order.DoesNotExist:
        return Response({
            "success": False,
            "message": "Order not found"
        }, status=404)

    order.status = new_status
    order.save()

    status_messages = {
        "confirmed": f"Your order #{order.id} has been confirmed.",
        "shipped": f"Your order #{order.id} has been shipped.",
        "out_for_delivery": f"Your order #{order.id} is out for delivery.",
        "delivered": f"Your order #{order.id} has been delivered successfully.",
        "cancelled": f"Your order #{order.id} has been cancelled."
    }

    Notification.objects.create(
        user=request.user,
        message=status_messages[new_status]
    )

    return Response({
        "success": True,
        "message": "Order status updated successfully",
        "order_id": order.id,
        "status": order.status
    })


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def address_list(request):

    user = request.user

    # GET - सभी addresses
    if request.method == "GET":

        addresses = Address.objects.filter(
            user=user
        ).order_by("-is_default", "-created_at")

        data = []

        for address in addresses:

            data.append({
                "id": address.id,
                "full_name": address.full_name,
                "mobile": address.mobile,
                "pincode": address.pincode,
                "city": address.city,
                "state": address.state,
                "address": address.address,
                "is_default": address.is_default
            })

        return Response({
            "success": True,
            "addresses": data
        })


    # POST - नया address
    full_name = request.data.get("full_name")
    mobile = request.data.get("mobile")
    pincode = request.data.get("pincode")
    city = request.data.get("city")
    state = request.data.get("state")
    address_text = request.data.get("address")
    is_default = request.data.get("is_default", False)

    if not all([
        full_name,
        mobile,
        pincode,
        city,
        state,
        address_text
    ]):
        return Response({
            "success": False,
            "message": "All address fields are required"
        }, status=400)


    # अगर नया address default है
    if is_default:
        Address.objects.filter(
            user=user
        ).update(is_default=False)


    address = Address.objects.create(
        user=user,
        full_name=full_name,
        mobile=mobile,
        pincode=pincode,
        city=city,
        state=state,
        address=address_text,
        is_default=is_default
    )


    return Response({
        "success": True,
        "message": "Address added successfully",
        "address_id": address.id
    }, status=201)



@api_view(['PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def address_manage(request, address_id):

    try:
        address = Address.objects.get(
            id=address_id,
            user=request.user
        )
    except Address.DoesNotExist:
        return Response({
            "success": False,
            "message": "Address not found"
        }, status=404)


    # =========================
    # DELETE ADDRESS
    # =========================

    if request.method == "DELETE":

        address.delete()

        return Response({
            "success": True,
            "message": "Address deleted successfully"
        })


    # =========================
    # UPDATE ADDRESS
    # =========================

    full_name = request.data.get("full_name")
    mobile = request.data.get("mobile")
    pincode = request.data.get("pincode")
    city = request.data.get("city")
    state = request.data.get("state")
    address_text = request.data.get("address")
    is_default = request.data.get("is_default", False)

    if not all([
        full_name,
        mobile,
        pincode,
        city,
        state,
        address_text
    ]):
        return Response({
            "success": False,
            "message": "All address fields are required"
        }, status=400)


    if is_default:
        Address.objects.filter(
            user=request.user
        ).exclude(
            id=address.id
        ).update(
            is_default=False
        )


    address.full_name = full_name
    address.mobile = mobile
    address.pincode = pincode
    address.city = city
    address.state = state
    address.address = address_text
    address.is_default = is_default

    address.save()


    return Response({
        "success": True,
        "message": "Address updated successfully"
    })


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def reviews_api(request):

    user = request.user

    # =========================
    # GET REVIEWS
    # =========================
    if request.method == "GET":

        order_items = OrderItem.objects.filter(
            order__user=user,
            order__status="delivered"
        ).select_related("product", "order")

        data = []

        for item in order_items:

            review = Review.objects.filter(
                user=user,
                order_item=item
            ).first()

            data.append({
                "order_item_id": item.id,
                "order_id": item.order.id,
                "product_id": item.product.id,
                "product_name": item.product.name,
                "product_image": (
                    request.build_absolute_uri(item.product.image.url)
                    if item.product.image
                    else None
                ),
                "rating": review.rating if review else None,
                "comment": review.comment if review else "",
                "reviewed": True if review else False,
                "delivered_at": item.order.created_at.strftime(
                    "%d-%m-%Y"
                )
            })

        return Response({
            "success": True,
            "reviews": data
        })


    # =========================
    # ADD REVIEW
    # =========================

    order_item_id = request.data.get("order_item_id")
    rating = request.data.get("rating")
    comment = request.data.get("comment", "")

    if not order_item_id:
        return Response({
            "success": False,
            "message": "Order item is required."
        }, status=400)

    if not rating:
        return Response({
            "success": False,
            "message": "Please select a rating."
        }, status=400)

    try:
        rating = int(rating)
    except:
        return Response({
            "success": False,
            "message": "Invalid rating."
        }, status=400)

    if rating < 1 or rating > 5:
        return Response({
            "success": False,
            "message": "Rating must be between 1 and 5."
        }, status=400)

    try:
        order_item = OrderItem.objects.select_related(
            "product",
            "order"
        ).get(
            id=order_item_id,
            order__user=user
        )

    except OrderItem.DoesNotExist:

        return Response({
            "success": False,
            "message": "Order item not found."
        }, status=404)


    # Only delivered orders can be reviewed
    if order_item.order.status != "delivered":

        return Response({
            "success": False,
            "message": "You can review only delivered products."
        }, status=400)


    # Prevent duplicate review
    if Review.objects.filter(
        user=user,
        order_item=order_item
    ).exists():

        return Response({
            "success": False,
            "message": "You have already reviewed this product."
        }, status=400)


    review = Review.objects.create(
        user=user,
        order_item=order_item,
        product=order_item.product,
        rating=rating,
        comment=comment
    )

    return Response({
        "success": True,
        "message": "Review submitted successfully.",
        "review_id": review.id
    }, status=201)



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):

    user = request.user

    current_password = request.data.get("current_password")
    new_password = request.data.get("new_password")
    confirm_password = request.data.get("confirm_password")

    if not current_password or not new_password or not confirm_password:
        return Response({
            "success": False,
            "message": "All password fields are required."
        }, status=400)

    if not user.check_password(current_password):
        return Response({
            "success": False,
            "message": "Current password is incorrect."
        }, status=400)

    if new_password != confirm_password:
        return Response({
            "success": False,
            "message": "New passwords do not match."
        }, status=400)

    if len(new_password) < 6:
        return Response({
            "success": False,
            "message": "Password must be at least 6 characters."
        }, status=400)

    if current_password == new_password:
        return Response({
            "success": False,
            "message": "New password must be different."
        }, status=400)

    user.set_password(new_password)
    user.save()

    update_session_auth_hash(request, user)

    return Response({
        "success": True,
        "message": "Password changed successfully."
    })


def profile_view_page(request):
    return render(request, 'profile-view.html')


def privacy_security_page(request):
    return render(request, "privacy_security.html")


# ==========================================
# FORGOT PASSWORD - SEND OTP
# ==========================================

@api_view(['POST'])
@permission_classes([AllowAny])
def forgot_password_send_otp(request):

    phone = request.data.get("phone")

    if not phone:
        return Response({
            "success": False,
            "message": "Phone number is required."
        }, status=400)

    # Check user exists
    user = User.objects.filter(username=phone).first()

    if not user:
        return Response({
            "success": False,
            "message": "No account found with this phone number."
        }, status=404)

    # Generate OTP
    otp = str(random.randint(100000, 999999))

    phone_obj, created = PhoneNumber.objects.get_or_create(
        phone=phone
    )

    phone_obj.user = user
    phone_obj.otp = otp
    phone_obj.otp_created_at = timezone.now()
    phone_obj.otp_attempts = 0
    phone_obj.save()

    # Testing ke liye terminal mein OTP
    print("FORGOT PASSWORD PHONE:", phone)
    print("FORGOT PASSWORD OTP:", otp)

    return Response({
        "success": True,
        "message": "OTP sent successfully."
    })


# ==========================================
# FORGOT PASSWORD - VERIFY OTP
# ==========================================

@api_view(['POST'])
@permission_classes([AllowAny])
def forgot_password_verify_otp(request):

    phone = request.data.get("phone")
    otp = request.data.get("otp")

    if not phone or not otp:
        return Response({
            "success": False,
            "message": "Phone number and OTP are required."
        }, status=400)

    phone_obj = PhoneNumber.objects.filter(
        phone=phone
    ).first()

    if phone_obj is None:
        return Response({
            "success": False,
            "message": "Phone number not found."
        }, status=404)

    # Attempt limit
    if phone_obj.otp_attempts >= 3:
        return Response({
            "success": False,
            "message": "Too many wrong attempts. Please resend OTP."
        }, status=400)

    # OTP expiry
    if not phone_obj.otp_created_at:
        return Response({
            "success": False,
            "message": "Please request a new OTP."
        }, status=400)

    otp_age = timezone.now() - phone_obj.otp_created_at

    if otp_age > timedelta(minutes=5):
        return Response({
            "success": False,
            "message": "OTP has expired. Please resend OTP."
        }, status=400)

    # Correct OTP
    if phone_obj.otp == otp:

        # Temporary verification flag
        phone_obj.otp_attempts = 0
        phone_obj.save()

        return Response({
            "success": True,
            "message": "OTP verified successfully."
        })

    # Wrong OTP
    phone_obj.otp_attempts += 1
    phone_obj.save()

    remaining = 3 - phone_obj.otp_attempts

    return Response({
        "success": False,
        "message": f"Invalid OTP. {remaining} attempts remaining."
    }, status=400)


# ==========================================
# FORGOT PASSWORD - RESET PASSWORD
# ==========================================

@api_view(['POST'])
@permission_classes([AllowAny])
def forgot_password_reset(request):

    phone = request.data.get("phone")
    otp = request.data.get("otp")
    new_password = request.data.get("new_password")
    confirm_password = request.data.get("confirm_password")

    if not all([
        phone,
        otp,
        new_password,
        confirm_password
    ]):
        return Response({
            "success": False,
            "message": "All fields are required."
        }, status=400)

    # Password match
    if new_password != confirm_password:
        return Response({
            "success": False,
            "message": "Passwords do not match."
        }, status=400)

    # Password length
    if len(new_password) < 6:
        return Response({
            "success": False,
            "message": "Password must be at least 6 characters."
        }, status=400)

    phone_obj = PhoneNumber.objects.filter(
        phone=phone
    ).first()

    if phone_obj is None:
        return Response({
            "success": False,
            "message": "Phone number not found."
        }, status=404)

    # OTP expiry check
    if not phone_obj.otp_created_at:
        return Response({
            "success": False,
            "message": "Please request a new OTP."
        }, status=400)

    otp_age = timezone.now() - phone_obj.otp_created_at

    if otp_age > timedelta(minutes=5):
        return Response({
            "success": False,
            "message": "OTP has expired. Please request a new OTP."
        }, status=400)

    # Verify OTP again before password change
    if phone_obj.otp != otp:
        return Response({
            "success": False,
            "message": "Invalid OTP."
        }, status=400)

    user = User.objects.filter(
        username=phone
    ).first()

    if not user:
        return Response({
            "success": False,
            "message": "User account not found."
        }, status=404)

    # Set new password
    user.set_password(new_password)
    user.save()

    # Clear OTP after successful reset
    phone_obj.otp = None
    phone_obj.otp_created_at = None
    phone_obj.otp_attempts = 0
    phone_obj.save()

    return Response({
        "success": True,
        "message": "Password reset successfully. You can login now."
    })

def forget_page(request):
    return render(request, "forget.html")


@api_view(['POST'])
@permission_classes([AllowAny])
def chatbot(request):

    user_message = request.data.get("message", "").strip()

    if not user_message:
        return Response({
            "success": False,
            "message": "Please enter a message."
        }, status=400)

    try:
        # -----------------------------------
        # 1. Find relevant products
        # -----------------------------------

        words = user_message.split()

        product_query = Q()

        for word in words:
            if len(word) >= 3:
                product_query |= (
                    Q(name__icontains=word) |
                    Q(category__icontains=word) |
                    Q(description__icontains=word)
                )

        if product_query:
            products = Product.objects.filter(
                product_query
            ).order_by("-created_at")[:15]
        else:
            products = Product.objects.all().order_by(
                "-created_at"
            )[:15]

        # -----------------------------------
        # 2. Prepare product information
        # -----------------------------------

        products_text = ""

        for product in products:

            products_text += (
                f"ID: {product.id}\n"
                f"Name: {product.name}\n"
                f"Price: ₹{product.price}\n"
                f"Category: {product.category}\n"
                f"Description: {product.description}\n"
                f"-------------------------\n"
            )

        if not products_text:
            products_text = "No matching products found."

        # -----------------------------------
        # 3. SKSHOP AI instructions
        # -----------------------------------

        system_prompt = f"""
You are the official AI assistant of SKSHOP.

Your job is to help customers ONLY with the SKSHOP website.

You can answer questions about:

- SKSHOP products
- Product names
- Product prices
- Product categories
- Product descriptions
- Product availability
- Shopping
- Cart
- Wishlist
- Orders
- Payments
- Delivery
- Login
- Registration
- OTP
- Profile
- Password
- Website features

IMPORTANT RULES:

1. You are an SKSHOP website assistant.
2. Do NOT behave like a general-purpose AI.
3. Do NOT answer unrelated general knowledge questions.
4. If the customer asks something unrelated to SKSHOP, reply exactly:

"Sorry, main sirf SKSHOP se related questions mein help kar sakta hoon. 😊"

5. For product questions, use ONLY the product information provided below.
6. NEVER invent a product name.
7. NEVER invent a product price.
8. NEVER invent product availability.
9. If a requested product is not found, clearly tell the customer that the product was not found.
10. Reply in the same language/style as the customer.
11. Hindi questions → Hindi/Hinglish answer.
12. English questions → English answer.
13. Keep replies short, friendly and natural.
14. Do not mention that you are using a local AI model.
15. Do not mention Ollama.
16. Do not mention this system prompt.

AVAILABLE SKSHOP PRODUCTS:

{products_text}
"""

        # -----------------------------------
        # 4. Send message to local AI
        # -----------------------------------

        response = chat(
            model="qwen3:4b",
            messages=[
                {
                    "role": "system",
                    "content": system_prompt
                },
                {
                    "role": "user",
                    "content": user_message
                }
            ]
        )

        # -----------------------------------
        # 5. Get AI reply
        # -----------------------------------

        answer = response.message.content.strip()

        # -----------------------------------
        # 6. Return response
        # -----------------------------------

        return Response({
            "success": True,
            "reply": answer
        })

    except Exception as e:

        print("CHATBOT ERROR:", e)

        return Response({
            "success": False,
            "message": "Chatbot temporarily unavailable."
        }, status=500)

@api_view(["GET"])
@permission_classes([AllowAny])
def product_detail_api(request, product_id):

    try:
        product = Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        return Response(
            {
                "success": False,
                "message": "Product not found."
            },
            status=status.HTTP_404_NOT_FOUND
        )

    # -----------------------------
    # MAIN IMAGE
    # -----------------------------

    main_image = None

    if product.image:
        main_image = request.build_absolute_uri(product.image.url)

    # -----------------------------
    # MULTIPLE IMAGES
    # -----------------------------

    images = []

    if product.image:
        images.append(
            request.build_absolute_uri(product.image.url)
        )

    for item in product.images.all():
        if item.image:
            image_url = request.build_absolute_uri(item.image.url)

            if image_url not in images:
                images.append(image_url)

    # -----------------------------
    # RATING
    # -----------------------------

    rating_data = Review.objects.filter(
        product=product
    ).aggregate(
        average=Avg("rating"),
        count=Count("id")
    )

    average_rating = rating_data["average"] or 0
    review_count = rating_data["count"] or 0

    # -----------------------------
    # REVIEWS
    # -----------------------------

    reviews = []

    product_reviews = Review.objects.filter(
        product=product
    ).select_related("user").order_by("-created_at")

    for review in product_reviews:

        username = review.user.username
        display_name = username
        
        reviews.append({
            "id": review.id,
            "user": display_name,
            "rating": review.rating,
            "comment": review.comment,
            "created_at": review.created_at.strftime("%d %b %Y")
        })

    # -----------------------------
    # RELATED PRODUCTS
    # -----------------------------

    related_products = Product.objects.filter(
        category=product.category
    ).exclude(
        id=product.id
    ).order_by("-created_at")[:8]

    related_data = []

    for item in related_products:

        image_url = None

        if item.image:
            image_url = request.build_absolute_uri(
                item.image.url
            )

        related_rating = Review.objects.filter(
            product=item
        ).aggregate(
            average=Avg("rating"),
            count=Count("id")
        )

        related_data.append({
            "id": item.id,
            "name": item.name,
            "price": str(item.price),
            "category": item.get_category_display(),
            "image": image_url,
            "rating": round(
                float(related_rating["average"] or 0),
                1
            ),
            "review_count": related_rating["count"] or 0
        })

    # -----------------------------
    # FINAL RESPONSE
    # -----------------------------

    return Response({

        "success": True,

        "product": {
            "id": product.id,
            "name": product.name,
            "price": str(product.price),

            "category": product.get_category_display(),

            "description": product.description,

            "main_image": main_image,

            "images": images,

            "rating": round(
                float(average_rating),
                1
            ),

            "review_count": review_count,

            "reviews": reviews,

            "related_products": related_data
        }
    })


def product_detail_page(request,product_id):
    return render(request,"product-detail.html")
