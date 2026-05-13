provider "aws" {
  region                      = "us-east-1"
  access_key                  = "test"
  secret_key                  = "test"
  skip_credentials_validation = true
  skip_metadata_api_check     = true
  skip_requesting_account_id  = true
  s3_use_path_style           = true

  endpoints {
    s3 = "http://127.0.0.1:4566"
  }
}

module "dev_backend_s3" {
  source      = "../../modules/s3" # Đường dẫn trỏ đến thư mục module ở Bước 1
  bucket_name = "local-django-bucket"
  environment = "dev"
}