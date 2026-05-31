output "control_plane_ip" {
  value       = google_compute_address.control_plane_ip.address
  description = "Control plane public IP"
}

output "worker_ips" {
  value       = [for ip in google_compute_address.worker_ip : ip.address]
  description = "Worker node public IPs"
}

output "all_node_ips" {
  value = concat(
    [google_compute_address.control_plane_ip.address],
    [for ip in google_compute_address.worker_ip : ip.address],
  )
  description = "All node public IPs (control-plane first)"
}

output "ceph_data_disks" {
  value       = [for d in google_compute_disk.ceph_data : d.name]
  description = "Raw data disks attached for Ceph OSDs (in-guest path: /dev/disk/by-id/google-ceph-data)"
}