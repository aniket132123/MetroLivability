import json
import datetime
import boto3
import urllib3
import pandas as pd
import requests
import io
from io import StringIO

s3 = boto3.client('s3')

def lambda_handler(event, context):
    curr_date = datetime.datetime.now().date()
    start_date = curr_date - datetime.timedelta(days=90)
    end_date = curr_date + datetime.timedelta(days=5)

    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": '47.6',
        "longitude": '122.3',
        "start_date": start_date.strftime("%Y-%m-%d"),
        "end_date": end_date.strftime("%Y-%m-%d"),
        "daily": "temperature_2m_mean"
    }

    try:
        http = urllib3.PoolManager()
        r = http.request('GET', url, fields=params)
        info = r.json()

        # Convert to Pandas DataFrame
        df = pd.DataFrame(info)

        # Upload to S3
        csv_buffer = StringIO()
        df.to_csv(csv_buffer, index=False)
        file_name = "weather.csv"
        bucket_name = "metro-data-bucket"
        s3.put_object(
            Bucket=bucket_name,
            Key=file_name,
            Body=csv_buffer.getvalue()
        )
    except Exception as e:
        print(e)
        return {
            'statusCode': 500,
            'body': json.dumps('Failed to upload file to S3')
        }

    return {
        'statusCode': 200,
        'body': json.dumps('Upload to S3 successful!')
    }
