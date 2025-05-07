#curso mongo de cero en youtube https://youtu.be/rcZlFmioTkE?si=yRLyaxErgUQFDsRK 

from pymongo import MongoClient

client= MongoClient('localhost', 27017)

db= client["iaserviciosvip"] 

collection= db["citas"]

print("Colecciones a la base de datos:", db.list_collection_names())

print("usuario en la coleccion")
for citas in collection.find():
    print(citas)

    nuevo_usuario = {
        "Fecha":"Junio",
        "Dia" : "Jueves"
    }
    resultado = collection.insert_one(nuevo_usuario)
    print("usuario insertado:", resultado.inserted_id)

resultado = collection.update_one(
    {"Fecha": "Mayo"},
    {"$set":{"edad":133}}
)
print("Documento modificado:", resultado.modified_count)