terraform {
  backend "gcs" {
    bucket = "xambook-tf-state"
    prefix = "prod"
  }
}