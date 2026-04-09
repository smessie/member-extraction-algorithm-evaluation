#!/bin/bash

# Replication of Telraam benchmark
ENV_DIR_TELRAAM_REPLICATION="/users/iesmessa/member-extraction-algorithm-evaluation/config/telraam"
OUT_DIR_TELRAAM_REPLICATION="/users/iesmessa/member-extraction-algorithm-evaluation/out/telraam"

for env_file in "$ENV_DIR_TELRAAM_REPLICATION"/*.env; do
    base_name=$(basename "$env_file" .env)

    out_file="$OUT_DIR_TELRAAM_REPLICATION/${base_name}.json"

    NODE_OPTIONS=--max-old-space-size=14336 npx ldes-evaluation-runner-orchestrator "$env_file" "$out_file" "$SERVER_HOSTNAME"

    docker compose -f node_modules/ldes-evaluation-runner-orchestrator/docker-compose.yml down
done


# Replication of DCAT-AP Feed Sweden benchmark
ENV_DIR_DCAT_SWEDEN_REPLICATION="/users/iesmessa/member-extraction-algorithm-evaluation/config/dcat-sweden"
OUT_DIR_DCAT_SWEDEN_REPLICATION="/users/iesmessa/member-extraction-algorithm-evaluation/out/dcat-sweden"

for env_file in "$ENV_DIR_DCAT_SWEDEN_REPLICATION"/*.env; do
    base_name=$(basename "$env_file" .env)

    out_file="$OUT_DIR_DCAT_SWEDEN_REPLICATION/${base_name}.json"

    NODE_OPTIONS=--max-old-space-size=14336 npx ldes-evaluation-runner-orchestrator "$env_file" "$out_file" "$SERVER_HOSTNAME"

    docker compose -f node_modules/ldes-evaluation-runner-orchestrator/docker-compose.yml down
done


# Replication of Marine Regions benchmark
ENV_DIR_MARINE_REGIONS_REPLICATION="/users/iesmessa/member-extraction-algorithm-evaluation/config/marine-regions"
OUT_DIR_MARINE_REGIONS_REPLICATION="/users/iesmessa/member-extraction-algorithm-evaluation/out/marine-regions"

for env_file in "$ENV_DIR_MARINE_REGIONS_REPLICATION"/*.env; do
    base_name=$(basename "$env_file" .env)

    out_file="$OUT_DIR_MARINE_REGIONS_REPLICATION/${base_name}.json"

    NODE_OPTIONS=--max-old-space-size=14336 npx ldes-evaluation-runner-orchestrator "$env_file" "$out_file" "$SERVER_HOSTNAME"

    docker compose -f node_modules/ldes-evaluation-runner-orchestrator/docker-compose.yml down
done
