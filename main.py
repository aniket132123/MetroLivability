from airflow.models import DAG
import requests
import json
import os
from dotenv import load_dotenv, dotenv_values 
from sqlalchemy import create_engine
import pandas as pd

# load .env
load_dotenv()

# Connect to postgres server and create table
engine = create_engine("postgresql+psycopg2://ds_user:mypassword@localhost:5432/cost_of_living_data")  

# download mean housing sale prices since 2008
zillow_url = 'https://files.zillowstatic.com/research/public_csvs/mean_sale_price_now/Metro_mean_sale_price_now_uc_sfrcondo_month.csv?t=1767743583'
df = pd.read_csv(zillow_url)

# drop the mean national sales data for now
df = df.drop(index=0, axis=0)

# take mean sales from 2025
house_prices = df[['RegionName', '2025-01-31', '2025-02-28', '2025-03-31', '2025-04-30', 
                   '2025-05-31', '2025-06-30', '2025-07-31', '2025-08-31', 
                   '2025-09-30', '2025-10-31', '2025-11-30']]



house_prices.to_sql(
    'house_prices',
    engine,
    if_exists="replace",
    index=False
)

# Salaries API
# TODO: get the salaries for every state in housing prices table
# TODO: get the salaries for various different positions
endpoint = f"/v1/comparesalaries/{os.getenv("SALARIES_USER_ID")}/wageocc"
url = "https://api.careeronestop.org" + endpoint

headers = {
    "Content-Type":"application/json",
    "Authorization": f"Bearer {os.getenv("SALARIES_API_KEY")}"
}

params = {
    "keyword" : "Software Developers",
    "location" : "VA",
    "enableMetaData" : False
}

response = requests.get(url, headers=headers, params=params)
if response.status_code == 200:
    data = response.json()
    print(data)
else:
    print(f"Error: {response.status_code}")


# OPEN-METEO API
# TODO: run through all the cities in housing and gather weather data
url = "https://api.open-meteo.com/v1/forecast"
params = {
    "latitude": '47.6',
    "longitude": '122.3',
    "start_date": "2025-10-08",
    "end_date": "2026-01-06",
    "daily": "temperature_2m_mean"
}
response = requests.get(url, params=params)
print(response.json())