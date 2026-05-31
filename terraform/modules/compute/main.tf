resource "google_compute_instance" "vm" {
  count = length(var.instance_names)

  name         = var.instance_names[count.index]
  machine_type = var.machine_type
  zone         = var.zone

  tags = ["k8s"]

  boot_disk {
    initialize_params {
      image = "ubuntu-os-cloud/ubuntu-2404-lts-amd64"
      size  = 15
      type  = "pd-balanced"
    }
  }

  network_interface {
    subnetwork = var.subnet_id

    access_config {}
  }

  metadata = {
    ssh-keys = "${var.ssh_user}:${file(var.public_key_path)}"
  }
}