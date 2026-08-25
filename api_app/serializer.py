from rest_framework import serializers
from .models import Student


class StudentSerializer(serializers.Serializer):
    name=serializers.CharField(max_length=50)
    rno=serializers.IntegerField()
    per=serializers.FloatField()
    def create(self,validate_data):
        return Student.objects.create(**validate_data)

    def update(self, instance, validate_data):
        instance.name=validate_data.get('name',instance.name)
        instance.rno=validate_data.get('rno',instance.rno)
        instance.per=validate_data.get('per',instance.per)
        instance.save()
        return instance