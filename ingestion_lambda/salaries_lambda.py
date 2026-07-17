import boto3
from botocore.exceptions import ClientError
import json
import io
import urllib3
import pandas as pd
from concurrent.futures import ThreadPoolExecutor, as_completed

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
    
    occ_file = s3.get_object(Bucket=bucket_name, Key="All_Occupations.csv")
    file_content = occ_file['Body'].read().decode('utf-8')
    df = pd.read_csv(io.StringIO(file_content))
    occupation_list = df['Occupation'].tolist()

    http = urllib3.PoolManager()
        
    headers = {
        "Content-Type":"application/json",
        "Authorization": f'Bearer {get_secret("SALARIES_API_KEY")}'
    }

    all_records = []

    # Upload the json to S3
    try:
        for state in states:
            for occupation in occupation_list:
                file_name = state + "_" + occupation.replace(" ", "_") + "_salaries.json"
                params = {
                    "keyword" : occupation,
                    "location" : state,
                    "enableMetaData" : False
                }

                r = http.request('GET', endpoint, fields=params, headers=headers)
                data = json.loads(r.data.decode('utf-8'))

                has_wage_data = (
                    data.get('LocationsList') and 
                    data['LocationsList'][0].get('OccupationList') and
                    data['LocationsList'][0]['OccupationList'][0].get('WageInfo') and
                    len(data['LocationsList'][0]['OccupationList'][0]['WageInfo']) > 0
                )

                if has_wage_data:
                    df_normalized = pd.json_normalize(
                        data['LocationsList'],
                        record_path=['OccupationList', 'WageInfo'],
                        meta=[
                            'LocationName',
                            'InputLocation',
                            ['OccupationList', 'Title']
                        ]
                    )

                    if not df_normalized.empty:
                        all_records.append(df_normalized)

                # file_object = io.BytesIO(r.data)
                # s3.upload_fileobj(file_object, bucket_name, file_name)
        
        result_df = pd.concat(all_records, ignore_index=True)

        sv_buffer = io.StringIO()
        result_df.to_csv(csv_buffer, index=False)
        csv_buffer.seek(0)

        s3.put_object(
            Bucket=bucket_name,
            Key="consolidated_salaries.csv",
            Body=csv_buffer.getvalue().encode('utf-8')
        )

            

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
    
    
    