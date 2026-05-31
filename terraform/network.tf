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