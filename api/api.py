from flask import Flask, request, jsonify, Response
import mysql.connector
import requests

app = Flask(__name__)

mydb = mysql.connector.connect(
    host="127.0.0.1",
    user="root",
    database="mainstay"
)

mycursor = mydb.cursor(dictionary=True)

# create database and table if needed
# mycursor.execute("CREATE DATABASE mainstay")
#
# mycursor.execute("CREATE TABLE countries (name VARCHAR(255), flag VARCHAR(255))")


@app.route('/countries')
def return_saved():
    mycursor.execute("SELECT * FROM countries")
    response = mycursor.fetchall()
    return {"response": response}, 200

@app.route('/countries/add', methods = ['POST'])
def add_country():
    name = request.json.get("name")
    flag = request.json.get("flag")
    insert = "INSERT INTO countries(name,flag) VALUES (%s, %s)"
    values = (name, flag)
    mycursor.execute(insert, values)
    mydb.commit()
    return {"response": "Country added!"}, 200

@app.route('/countries/delete', methods = ['DELETE'])
def delete_country():
    name = request.json.get("name")
    delete = "DELETE FROM countries WHERE name = %s"
    value = (name,)
    mycursor.execute(delete, value)
    mydb.commit()
    return {"response": "Country deleted"}, 200

@app.route('/countries/extra/<searchTerm>')
def return_combined_countries(searchTerm):
    response = requests.get("https://restcountries.eu/rest/v2/name/{}".format(searchTerm))
    response = response.json()[:5]
    return {"response": response}, 200

# Well over while still trying to figure out the best way to approach combining the lists. Replacing the Canadian flag is pretty straightforward
# (get the list of first five responses, check if Canada is in list, if so, replace flag url. For the rest, maybe pull first six responses from
# api, then sort that list with add'l countries list and take the top 5. Not foolproof, but could be a reasonable enough solution.
