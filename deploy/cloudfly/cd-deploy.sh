#!/usr/bin/env bash
# Deploy admin portal lên Cloudfly. CD chạy qua SSH: `ssh ... bash -s -- <sha> < deploy/cloudfly/cd-deploy.sh`.
# Chạy tay trên server: `sudo bash /amb-storage-admin/deploy/cloudfly/cd-deploy.sh <sha>` (sha phải là origin/main).
set -Eeuo pipefail

FULL_SHA=${1:-}
APP_DIR=/amb-storage-admin
PROJECT_NAME=amb-storage-admin-prod
ENV_FILE="$APP_DIR/.env.production"
COMPOSE_FILE="$APP_DIR/deploy/cloudfly/docker-compose.yml"
DEPLOY_IMAGE="amb-storage-admin:${FULL_SHA}"
# Giữ lại vài image gần nhất để rollback tay
KEEP_IMAGES=3
ROLLBACK_REQUIRED=0
PREVIOUS_IMAGE=
PREVIOUS_IMAGE_ID=
PREVIOUS_ENV_IMAGE=

fail() { echo "ERROR: $*" >&2; exit 1; }
require_command() { command -v "$1" >/dev/null 2>&1 || fail "required command is missing: $1"; }

compose() {
  local image=$1
  shift
  AMB_STORAGE_ADMIN_IMAGE="$image" \
    docker compose --project-name "$PROJECT_NAME" --file "$COMPOSE_FILE" --env-file "$ENV_FILE" "$@"
}

admin_container_id() {
  docker ps --filter "label=com.docker.compose.project=$PROJECT_NAME" \
    --filter 'label=com.docker.compose.service=admin' --format '{{.ID}}' | head -n 1
}

admin_healthy() {
  local id=$1
  [[ "$(docker inspect -f '{{.State.Status}}' "$id")" == running ]] || return 1
  [[ "$(docker inspect -f '{{if .State.Health}}{{.State.Health.Status}}{{else}}missing{{end}}' "$id")" == healthy ]] || return 1
  # SPA phục vụ được và proxy /api tới API qua amb-network hoạt động
  docker exec "$id" wget -qO /dev/null http://127.0.0.1:8080/ >/dev/null 2>&1 || return 1
  docker exec "$id" wget -qO /dev/null http://127.0.0.1:8080/api/v1/health/live >/dev/null 2>&1
}

wait_for_admin() {
  local deadline=$((SECONDS + 120)) id
  while (( SECONDS < deadline )); do
    id=$(admin_container_id)
    [[ -n "$id" ]] && admin_healthy "$id" && return 0
    sleep 2
  done
  return 1
}

set_env_image() {
  local image=$1 temp_file uid gid mode
  temp_file=$(mktemp "${ENV_FILE}.cd.XXXXXX")
  awk -v image="$image" 'BEGIN { found=0 } /^[[:space:]]*AMB_STORAGE_ADMIN_IMAGE=/ { print "AMB_STORAGE_ADMIN_IMAGE=" image; found++; next } { print } END { if (found != 1) exit 42 }' "$ENV_FILE" >"$temp_file" || {
    rm -f -- "$temp_file"
    fail 'production env file must contain exactly one AMB_STORAGE_ADMIN_IMAGE entry'
  }
  uid=$(stat -c '%u' "$ENV_FILE")
  gid=$(stat -c '%g' "$ENV_FILE")
  mode=$(stat -c '%a' "$ENV_FILE")
  chown "$uid:$gid" "$temp_file"
  chmod "$mode" "$temp_file"
  mv -f -- "$temp_file" "$ENV_FILE"
}

rollback() {
  local status=0
  if [[ -z "$PREVIOUS_IMAGE" ]]; then
    echo 'Admin deployment failed on first install; stopping the unhealthy container.' >&2
    compose "$DEPLOY_IMAGE" stop admin >/dev/null || true
    return 0
  fi
  echo "Admin deployment failed; restoring $PREVIOUS_IMAGE." >&2
  set_env_image "$PREVIOUS_ENV_IMAGE" || status=1
  compose "$PREVIOUS_IMAGE" up -d --no-deps --force-recreate admin >/dev/null || status=1
  if (( status == 0 )); then
    wait_for_admin || status=1
    [[ "$(docker inspect -f '{{.Image}}' "$(admin_container_id)" 2>/dev/null || true)" == "$PREVIOUS_IMAGE_ID" ]] || status=1
  fi
  (( status == 0 )) || fail 'admin rollback failed; manual recovery is required'
  echo 'Admin rollback completed.' >&2
}

on_exit() {
  local status=$?
  trap - EXIT
  if (( status != 0 && ROLLBACK_REQUIRED )); then rollback || status=1; fi
  exit "$status"
}
trap on_exit EXIT

[[ "$FULL_SHA" =~ ^[0-9a-f]{40}$ ]] || fail 'deployment requires a 40-character lowercase commit SHA'
[[ -d "$APP_DIR" && ! -L "$APP_DIR" && -d "$APP_DIR/.git" ]] || fail "$APP_DIR is missing, a symlink, or not a Git repository"
[[ -f "$ENV_FILE" && ! -L "$ENV_FILE" ]] || fail 'production env file is missing or is a symlink'
[[ "$(stat -c '%u:%a' "$ENV_FILE")" == 0:600 ]] || fail 'production env file must be root-owned with mode 0600'
for command_name in docker git awk mktemp stat flock; do require_command "$command_name"; done

cd "$APP_DIR"
case "$(git remote get-url origin)" in
  git@github.com:kailearndev/amb-portal.git|https://github.com/kailearndev/amb-portal|https://github.com/kailearndev/amb-portal.git) ;;
  *) fail 'origin is not the canonical admin repository' ;;
esac
[[ -z "$(git status --porcelain --untracked-files=all)" ]] || fail 'server checkout has uncommitted changes'

exec 9>/run/lock/amb-storage-admin-deploy.lock
flock -n 9 || fail 'another admin deployment is already running'
git fetch --prune origin main
[[ "$(git rev-parse refs/remotes/origin/main)" == "$FULL_SHA" ]] || fail 'origin/main is not the successful CI commit'
git checkout --detach --force "$FULL_SHA"
[[ "$(git rev-parse HEAD)" == "$FULL_SHA" ]] || fail 'checkout does not match the requested commit'
[[ -f "$COMPOSE_FILE" && ! -L "$COMPOSE_FILE" ]] || fail 'Compose file is missing or is a symlink'

docker info >/dev/null
docker compose version >/dev/null
docker network inspect amb-network >/dev/null 2>&1 || fail 'required external network is missing: amb-network'
compose "$DEPLOY_IMAGE" config --quiet

PREVIOUS_ENV_IMAGE=$(awk -F= '/^[[:space:]]*AMB_STORAGE_ADMIN_IMAGE=/{ sub(/^[[:space:]]*AMB_STORAGE_ADMIN_IMAGE=/, ""); print; exit }' "$ENV_FILE")
admin_id=$(admin_container_id)
if [[ -n "$admin_id" ]]; then
  PREVIOUS_IMAGE=$(docker inspect -f '{{.Config.Image}}' "$admin_id")
  PREVIOUS_IMAGE_ID=$(docker inspect -f '{{.Image}}' "$admin_id")
  docker image inspect "$PREVIOUS_IMAGE" >/dev/null || fail 'previous admin image is not available for rollback'
  [[ "$PREVIOUS_ENV_IMAGE" == "$PREVIOUS_IMAGE" ]] || fail 'env image and running admin image disagree'
else
  echo 'No running admin container found; treating this as the first deployment.'
fi

compose "$DEPLOY_IMAGE" build admin
set_env_image "$DEPLOY_IMAGE"
ROLLBACK_REQUIRED=1
compose "$DEPLOY_IMAGE" up -d --no-deps --force-recreate admin >/dev/null
wait_for_admin || fail 'new admin container did not become healthy within 120 seconds'
[[ "$(docker inspect -f '{{.Config.Image}}' "$(admin_container_id)")" == "$DEPLOY_IMAGE" ]] || fail 'healthy admin is not running the requested image'
ROLLBACK_REQUIRED=0

# Dọn image cũ, giữ KEEP_IMAGES bản mới nhất (luôn giữ image đang chạy)
docker image ls amb-storage-admin --format '{{.CreatedAt}}|{{.Repository}}:{{.Tag}}' \
  | sort -r | awk -F'|' -v keep="$KEEP_IMAGES" 'NR > keep { print $2 }' \
  | grep -vx "$DEPLOY_IMAGE" | xargs -r docker image rm >/dev/null 2>&1 || true

echo "Cloudfly admin deployment succeeded for $FULL_SHA."
