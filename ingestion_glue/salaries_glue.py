import sys
import boto3
from botocore.exceptions import ClientError
import json
import io
import pandas as pd
import asyncio
import aiohttp

s3 = boto3.client('s3')
print("INITIALIZING")

def get_secret(key):
    secret_name = "salary_keys"
    region_name = "us-west-2"
    
    session = boto3.session.Session()
    client = session.client(
        service_name='secretsmanager',
        region_name=region_name
    )

    try:
        get_secret_value_response = client.get_secret_value(SecretId=secret_name)
    except ClientError as e:
        raise e

    secret = json.loads(get_secret_value_response['SecretString'])[key]
    return secret


async def fetch_occupation_data(session, endpoint, headers, state, occupation):
    params = {
        "keyword": occupation,
        "location": state,
        "enableMetaData": "false"
    }
    
    try:
        async with session.get(endpoint, params=params, headers=headers) as response:
            data = await response.json()
            
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
                    return df_normalized
    except Exception as e:
        print(f"Error fetching {state}/{occupation}: {e}")
    
    return pd.DataFrame()

async def fetch_all_data_batched(endpoint, headers, states, occupation_list, batch_size=10):
    # fetch data in batches of 10 to avoid memory overload and speed up Glue execution
    all_dfs = []
    
    for i in range(0, len(states), batch_size):
        state_batch = states[i:i+batch_size]
        
        async with aiohttp.ClientSession() as session:
            tasks = []
            for state in state_batch:
                for occupation in occupation_list:
                    print(state + " with occupation of" + occupation + " STARTED!")
                    task = fetch_occupation_data(session, endpoint, headers, state, occupation)
                    tasks.append(task)
                    print(state + " with occupation of " + occupation + " FINISHED!!")
            
            batch_results = await asyncio.gather(*tasks)
            batch_dfs = [df for df in batch_results if not df.empty]
            all_dfs.extend(batch_dfs)
    
    return all_dfs

def main():
    # list of 50 states
    states = ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"]
    
    bucket_name = "metro-data-bucket"
    endpoint = f'https://api.careeronestop.org/v1/comparesalaries/{get_secret("SALARIES_USER_ID")}/wageocc'
    
    # get list of occupations
    occ_file = s3.get_object(Bucket=bucket_name, Key="All_Occupations.csv")
    file_content = occ_file['Body'].read().decode('utf-8')
    df = pd.read_csv(io.StringIO(file_content))
    occupation_list = df['Occupation'].tolist()

    headers = {
        "Content-Type": "application/json",
        "Authorization": f'Bearer {get_secret("SALARIES_API_KEY")}'
    }

    try:
        # run async function to fetch all data concurrently
        all_dfs = asyncio.run(fetch_all_data_batched(endpoint, headers, states, occupation_list))
        
        if not all_dfs:
            return {
                'statusCode': 400,
                'body': json.dumps('No wage data found')
            }
        
        # combine all dataframes
        result_df = pd.concat(all_dfs, ignore_index=True)
        
        # upload to S3 as a csv
        csv_buffer = io.StringIO()
        result_df.to_csv(csv_buffer, index=False)
        csv_buffer.seek(0)

        s3.put_object(
            Bucket=bucket_name,
            Key="consolidated_salaries.csv",
            Body=csv_buffer.getvalue().encode('utf-8')
        )
        
        print("SUCCESS")

        return {
            'statusCode': 200,
            'body': json.dumps(f'Successfully uploaded consolidated_salaries.csv with {len(result_df)} records')
        }
        
    except Exception as e:
        print(e)
        return {
            'statusCode': 500,
            'body': json.dumps(f'Failed: {str(e)}')
        }

if __name__=="__main__":
    main()