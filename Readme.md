### 1. Test Curl Reporting TUG

- On Local

```bash
  curl -X GET \
  'http://localhost:8091/api/v1/reports-tug/tug3/129759' \
  -H 'Accept: application/pdf' \
  -H 'Authorization: Bearer <token>' \
  --output response_tug3.pdf
```

- On Domain

```bash
  curl -X GET \
  'https://devwarehouse.nusadaya.net/api/v1/reports-tug/tug3/129759' \
  -H 'Accept: application/pdf' \
  -H 'Authorization: Bearer <token>' \
  --output response_tug3.pdf
```
