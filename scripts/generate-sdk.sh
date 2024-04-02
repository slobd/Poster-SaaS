docker run --rm \
    -v "${PWD}/web-app-material/sdk:/local" \
    -v "${PWD}/nest-backend:/nest-backend" \
    openapitools/openapi-generator-cli generate --global-property skipFormModel=false \
    -i "/nest-backend/openApiSpec.json" \
    -g typescript-axios \
    -o /local \
    --additional-properties=useSingleRequestParameter=true

# You may need to run this afterwars
# sudo chown -R username:group web-app-material/sdk
