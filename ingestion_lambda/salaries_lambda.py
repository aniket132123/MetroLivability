import boto3
from botocore.exceptions import ClientError
import json
import io
import urllib3

s3 = boto3.client('s3')

def get_secret(key):

    secret_name = "salary_keys"
    region_name = "us-west-2"
    key_string = key

    # Create a Secrets Manager client
    session = boto3.session.Session()
    client = session.client(
        service_name='secretsmanager',
        region_name=region_name
    )

    try:
        get_secret_value_response = client.get_secret_value(
            SecretId=secret_name
        )
    except ClientError as e:
        raise e

    secret = json.loads(get_secret_value_response['SecretString'])[key_string]
    return secret




def lambda_handler(event, context):
    # define bucket name and download salaries data
    states = ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"]
    
    bucket_name = "metro-data-bucket"
    endpoint = f'https://api.careeronestop.org/v1/comparesalaries/{get_secret("SALARIES_USER_ID")}/wageocc'
    
    # Upload the json to S3
    try:
        http = urllib3.PoolManager()

        headers = {
            "Content-Type":"application/json",
            "Authorization": f'Bearer {get_secret("SALARIES_API_KEY")}'
        }

        for state in states:
            file_name = state + "_salaries.json"
            params = {
                "keyword" : "Software Developers",
                "location" : state,
                "enableMetaData" : False
            }

            r = http.request('GET', endpoint, fields=params, headers=headers)

            file_object = io.BytesIO(r.data)
            s3.upload_fileobj(file_object, bucket_name, file_name)

        return {
            'statusCode': 200,
            'body': json.dumps(f'Successfully uploaded {file_name} to {bucket_name}')
        }
    except Exception as e:
        print(e)
        return {
            'statusCode': 500,
            'body': json.dumps('Failed to upload file to S3')
        }
    
    
    