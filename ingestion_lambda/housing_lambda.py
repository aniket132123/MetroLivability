import boto3
import json
import io
import urllib3

s3 = boto3.client('s3')

def lambda_handler(event, context):
    # define bucket name and download housing data
    bucket_name = "metro-data-bucket"
    zillow_url = 'https://files.zillowstatic.com/research/public_csvs/mean_sale_price_now/Metro_mean_sale_price_now_uc_sfrcondo_month.csv?t=1767743583'
    file_name = "zillow_housing_prices.csv"
    
    # Upload the CSV to S3
    try:
        http = urllib3.PoolManager()
        r = http.request('GET', zillow_url)
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
    
    
    