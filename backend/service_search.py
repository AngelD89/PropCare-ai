import requests
import os

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

def search_service(service, location):
    url = "https://maps.googleapis.com/maps/api/place/textsearch/json"

    query = f"{service} near {location}"

    params = {
        "query": query,
        "key": GOOGLE_API_KEY
    }

    response = requests.get(url, params=params)
    data = response.json()

    results = []

    for place in data.get("results", [])[:5]:
        results.append({
            "name": place["name"],
            "address": place.get("formatted_address"),
            "rating": place.get("rating"),
            "location": place["geometry"]["location"]
        })

    return results
