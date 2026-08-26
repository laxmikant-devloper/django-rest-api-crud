import requests
import json


# data={'name':'pawan','rno':105,'per':98.99}
# print(data)
# print(type(data))

# data_json=json.dumps(data)
# print(data_json)
# print(type(data_json))

# URL="http://localhost:8000/insert"
# res=requests.post(URL,data_json)
# print(res.json())


# fetch records from databases table

# URL="http://localhost:8000/getall"
# res=requests.get(URL)
# print(res.json())


#delete record
# URL="http://localhost:8000/delete"
# d={'id':2}
# json_data=json.dumps(d)
# res=requests.delete(URL,data=json_data)
# print(res.json())

#edit recrod

# URL='http://localhost:8000/edit'
# data={'id':3,'name':'laxmi kant','rno':102,'per':79}
# jdata=json.dumps(data)
# res=requests.put(URL,data=jdata)
# print(res.json())
