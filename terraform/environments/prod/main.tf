# ---------------------------------------------------------
# BUCKET 1: FRONTEND (Chỉ cho CDN đọc)
# ---------------------------------------------------------
data "aws_iam_policy_document" "frontend_sig" {
  statement {
    actions   = ["s3:GetObject"]
    resources = ["arn:aws:s3:::my-app-frontend/*"]
    principals {
      type = "AWS"
      identifiers = ["arn:aws:iam::123:role/cdn-role"]
    }
  }
}

module "s3_frontend" {
  source             = "../../modules/s3"
  bucket_name        = "my-app-frontend"
  environment        = "prod"
  custom_policy_json = data.aws_iam_policy_document.frontend_sig.json
}

# ---------------------------------------------------------
# BUCKET 2: BACKEND (Django Full + CDN Read)
# ---------------------------------------------------------
data "aws_iam_policy_document" "backend_sig" {
  statement {
    actions   = ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"]
    resources = ["arn:aws:s3:::my-app-backend/*"]
    principals {
      type = "AWS"
      identifiers = ["arn:aws:iam::123:user/django-user"]
    }
  }
}

module "s3_backend" {
  source             = "../../modules/s3"
  bucket_name        = "my-app-backend"
  environment        = "prod"
  custom_policy_json = data.aws_iam_policy_document.backend_sig.json
}

# ---------------------------------------------------------
# BUCKET 3: LOGS (Chỉ cho hệ thống lưu log)
# ---------------------------------------------------------
module "s3_logs" {
  source      = "../../modules/s3"
  bucket_name = "my-app-system-logs"
  environment = "prod"
  # Không truyền policy => Bucket này hoàn toàn riêng tư, không ai vào được trừ root
}