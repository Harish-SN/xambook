variable "instance_names" {
  type = list(string)
}

variable "machine_type" {
  type = string
}

variable "zone" {
  type = string
}

variable "subnet_id" {
  type = string
}

variable "ssh_user" {
  type = string
}

variable "public_key_path" {
  type = string
}