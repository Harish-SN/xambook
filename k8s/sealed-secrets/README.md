# Sealing secrets (stop committing plaintext)

The repo currently has plaintext Secrets in:
- `k8s/postgres/postgres.yaml`      (postgres-secret)
- `k8s/backend/backend.yaml`        (backend-secret)
- `k8s/keycloak/keycloak.yaml`      (keycloak-secret)

Once the `sealed-secrets` controller is running, encrypt each one and replace the
plaintext `Secret` with the generated `SealedSecret`. The ciphertext is safe to commit.

## 1. Install kubeseal locally
```bash
# macOS
brew install kubeseal
```

## 2. Seal an existing secret
Extract just the Secret document, then pipe it through kubeseal:

```bash
# Example: backend-secret
kubectl create secret generic backend-secret \
  --namespace xambook \
  --from-literal=POSTGRES_URL='postgres://postgres:xambook2025secure@postgres:5432/xambook?sslmode=disable' \
  --from-literal=KEYCLOAK_URL='http://keycloak:8080' \
  --from-literal=KEYCLOAK_REALM='xambook' \
  --from-literal=CORS_ALLOW_ORIGIN='https://xambook.com' \
  --from-literal=OTEL_EXPORTER_OTLP_ENDPOINT='otel-collector.observability.svc.cluster.local:4317' \
  --from-literal=RAZORPAY_KEY_ID='rzp_test_xxxx' \
  --from-literal=RAZORPAY_KEY_SECRET='xxxx' \
  --from-literal=ADMIN_KEY='xambook-admin-secret-2025' \
  --dry-run=client -o yaml \
| kubeseal --controller-name sealed-secrets-controller --controller-namespace kube-system \
           --format yaml > backend-sealedsecret.yaml
```

## 3. Replace plaintext with the SealedSecret
Delete the plaintext `Secret` block from the manifest and commit `backend-sealedsecret.yaml`
instead. The controller decrypts it into a real `Secret` in-cluster. Repeat for
`postgres-secret` and `keycloak-secret`.

> The controller's private key never leaves the cluster, so only this cluster can
> decrypt these SealedSecrets.
