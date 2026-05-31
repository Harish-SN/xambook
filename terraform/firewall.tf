# Internal node-to-node communication
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

# Public internet access
resource "google_compute_firewall" "allow_external" {
  name    = "xambook-allow-external"
  network = google_compute_network.xambook_vpc.name

  allow {
    protocol = "tcp"
    ports    = [
      "22",   # SSH
      "80",   # HTTP
      "443",  # HTTPS
      "6443"  # Kubernetes API
    ]
  }

  source_ranges = ["0.0.0.0/0"]
}