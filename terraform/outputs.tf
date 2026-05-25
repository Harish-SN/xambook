output "app_server_ip" {
  value       = google_compute_address.app_server_ip.address
  description = "App server public IP"
}

output "data_server_ip" {
  value       = google_compute_address.data_server_ip.address
  description = "Data server public IP"
}