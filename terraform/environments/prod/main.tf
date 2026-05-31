module "network" {
  source = "../../modules/network"

  network_name = "xambook-vpc"
  subnet_name  = "xambook-subnet"
  subnet_cidr  = "10.10.0.0/24"
  region = var.region
}
module "firewall" {
  source = "../../modules/firewall"

  network_name = "xambook-vpc"
}

module "compute" {
  source = "../../modules/compute"

  instance_names = [
    "cp-1",
    "worker-1",
    "worker-2"
  ]

  machine_type    = var.machine_type
  zone            = var.zone
  subnet_id       = module.network.subnet_id
  ssh_user        = var.ssh_user
  public_key_path = var.public_key_path
}