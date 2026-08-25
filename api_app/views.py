from django.shortcuts import render,HttpResponse
from django.views.decorators.csrf import csrf_exempt
import io
from rest_framework.parsers import JSONParser
from rest_framework.renderers import JSONRenderer
from .serializer import StudentSerializer
import json
from . models import Student

# Create your views here.
@csrf_exempt
def insert_record(request):
    jdata=request.body
    print(jdata)
    sdata=io.BytesIO(jdata)
    print(sdata)
    dict=JSONParser().parse(sdata)
    print(dict)

    s=StudentSerializer(data=dict)
    if s.is_valid():
        s.save()

    d={'res':'data inserted successfilly'}
    jdata=json.dumps(d)
    return HttpResponse(jdata,content_type='application/json')

def get_all(request):
   rec=Student.objects.all()
   print(rec)
   s=StudentSerializer(rec,many=True)
   print(s.data)
   jdata=JSONRenderer().render(s.data)
   print(jdata)
   print(type(jdata))
   return HttpResponse(jdata,content_type='appliction/json')


@csrf_exempt
def delete_a(req):
    print('delete  in function')
    jdata=req.body
    print(jdata)
    sdata=io.BytesIO(jdata)
    print(sdata)
    dict=JSONParser().parse(sdata)
    print(dict)
    rid=dict['id']
    s=Student.objects.get(id=rid)
    s.delete()
    d={'res':'data delete successfully'}
    jdata=json.dumps(d)
    return HttpResponse(jdata,content_type='appliction/json')

@csrf_exempt
def edit(req):
    jbdata=  req.body
    #print(jdata)
    sdata=io.BytesIO(jbdata)
    #print(sdata)
    dict=JSONParser().parse(sdata)
    print(dict)
    rid=dict['id']
    s=Student.objects.get(id=rid)
    stu=StudentSerializer(s,dict)
    if stu.is_valid():
        stu.save()
        d={'res':'record updated successfully'}
        json_res=json.dumps(d)
        return HttpResponse(json_res,content_type='appliction/json')