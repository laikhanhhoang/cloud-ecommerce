provider "aws" {
  region                      = "ap-southeast-2"
  access_key                  = "test"
  secret_key                  = "test"
  skip_credentials_validation = true
  skip_metadata_api_check     = true
  skip_requesting_account_id  = true
  s3_use_path_style           = true

  endpoints {
    s3 = "http://127.0.0.1:4566"
    iam = "http://localhost:4566"
  }
}


# --------------------------------------------
# FRONTEND - Các resource liên quan đến Frontend sẽ được định nghĩa ở đây
# Lưu ý: Các resource đều có tiền tố "dev_" để phân biệt các environment và tiền tố "frontend_" để phân biệt với folder khác 
# --------------------------------------------
module "dev_frontend_s3" {
  source        = "../../modules/s3"

  bucket_name   = "dev-frontend-s3"
  environment   = "dev"

  public_bucket = true
}

resource "aws_s3_bucket_policy" "frontend_public_policy" {
  bucket = module.dev_frontend_s3.bucket_id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${module.dev_frontend_s3.bucket_arn}/*"
      }
    ]
  })
}

resource "aws_s3_bucket_website_configuration" "frontend" {
  bucket = module.dev_frontend_s3.bucket_id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html"
  }
}

resource "aws_iam_user" "frontend_s3_user" {
  name = "frontend-s3-user"
}

resource "aws_iam_access_key" "frontend_s3_key" {
  user = aws_iam_user.frontend_s3_user.name
}

resource "aws_iam_user_policy" "frontend_s3_policy" {
  name = "frontend-s3-full-access"
  user = aws_iam_user.frontend_s3_user.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = ["s3:PutObject", "s3:GetObject", "s3:ListBucket", "s3:DeleteObject"]
        Effect   = "Allow"
        Resource = [module.dev_frontend_s3.bucket_arn, "${module.dev_frontend_s3.bucket_arn}/*"]  
      }
    ]
  })
}



# --------------------------------------------
# BACKEND - Các resource liên quan đến Backend sẽ được định nghĩa ở đây
# Lưu ý: Các resource đều có tiền tố "dev_" để phân biệt các environment và tiền tố "backend_" để phân biệt với folder khác 
# --------------------------------------------

# S3
# 1. Tạo bucket env localstack cho Backend
module "dev_backend_s3" {
  source      = "../../modules/s3" # Đường dẫn trỏ đến thư mục module ở Bước 1
  bucket_name = "dev-backend-s3"
  environment = "dev"
}

# 2. Tạo User và Access Key cho Backend và định nghĩa Policy cho phép Backend toàn quyền ới Bucket trên
resource "aws_iam_user" "backend_s3_user" {
  name = "backend-s3-user"
}

resource "aws_iam_access_key" "backend_s3_key" {
  user = aws_iam_user.backend_s3_user.name
}

resource "aws_iam_user_policy" "backend_s3_policy" {
  name = "backend-s3-full-access"
  user = aws_iam_user.backend_s3_user.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = ["s3:PutObject", "s3:GetObject", "s3:ListBucket", "s3:DeleteObject"]
        Effect   = "Allow"
        Resource = [module.dev_backend_s3.bucket_arn, "${module.dev_backend_s3.bucket_arn}/*"]  
      }
    ]
  })
}