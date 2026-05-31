# Internal node-to-node: everything within the subnet is trusted.
resource "google_compute_firewall" "allow_internal" {
  name    = "xambook-allow-internal"
  network = google_compute_network.xambook_vpc.name

  allow {
    protocol = "tcp"
    ports    = ["0-65535"]
  }
  allow {
    protocol = "udp"
    ports    = ["0-65535"]
  }
  allow {
    protocol = "icmp"
  }

  source_ranges = ["10.0.0.0/24"]
}

# SSH ONLY to the control-plane.
resource "google_compute_firewall" "allow_ssh_control_plane" {
  name    = "xambook-allow-ssh-cp"
  network = google_compute_network.xambook_vpc.name

  allow {
    protocol = "tcp"
    ports    = ["22"]
  }

  source_ranges = var.ssh_source_ranges
  target_tags   = ["xambook-control-plane"]
}

# HTTPS (443) ONLY from Cloudflare's IP ranges -> control-plane.
# This is the "orange cloud" origin lock: only Cloudflare can reach your
# origin on 443, so nobody can bypass Cloudflare by hitting the IP directly.
# Source: https://www.cloudflare.com/ips/  (update if Cloudflare changes ranges)
resource "google_compute_firewall" "allow_cloudflare_https" {
  name    = "xambook-allow-cloudflare-https"
  network = google_compute_network.xambook_vpc.name

  allow {
    protocol = "tcp"
    ports    = ["443"]
  }

  target_tags = ["xambook-control-plane"]

  source_ranges = [
    "173.245.48.0/20",
    "103.21.244.0/22",
    "103.22.200.0/22",
    "103.31.4.0/22",
    "141.101.64.0/18",
    "108.162.192.0/18",
    "190.93.240.0/20",
    "188.114.96.0/20",
    "197.234.240.0/22",
    "198.41.128.0/17",
    "162.158.0.0/15",
    "104.16.0.0/13",
    "104.24.0.0/14",
    "172.64.0.0/13",
    "131.0.72.0/22",
  ]
}