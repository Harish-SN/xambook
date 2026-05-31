resource "google_compute_network" "xambook_vpc" {
  name                    = "xambook-vpc"
  auto_create_subnetworks = false
}

resource "google_compute_subnetwork" "xambook_subnet" {
  name          = "xambook-subnet"
  ip_cidr_range = "10.0.0.0/24"
  region        = var.region
  network       = google_compute_network.xambook_vpc.id
}

# Cloud NAT so the private worker nodes (no external IP) can still reach the
# internet for pulling images and for cloudflared's outbound tunnel.
resource "google_compute_router" "xambook_router" {
  name    = "xambook-router"
  region  = var.region
  network = google_compute_network.xambook_vpc.id
}

resource "google_compute_router_nat" "xambook_nat" {
  name                               = "xambook-nat"
  router                             = google_compute_router.xambook_router.name
  region                             = var.region
  nat_ip_allocate_option             = "AUTO_ONLY"
  source_subnetwork_ip_ranges_to_nat = "ALL_SUBNETWORKS_ALL_IP_RANGES"
}