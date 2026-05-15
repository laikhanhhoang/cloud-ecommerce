variable "public_bucket" {
  type    = bool
  default = false
}

variable "bucket_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "custom_policy_json" {
  description = "JSON policy truyền vào từ môi trường cụ thể"
  type        = string
  default     = ""
}