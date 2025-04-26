#!/bin/bash

# 사용법: ./build-and-push.sh <TAG>
# 기본 태그 설정
TAG=${1:-latest}  # 첫 번째 인자로 태그를 받으며, 없으면 기본값은 "latest"

# 이미지 정보
IMAGES=(
  "sukjuhong/kwitch-api:apps/api/Dockerfile"
)

# docker login
echo "🔑 Logging in to Docker Hub..."
docker login -u sukjuhong

# 스크립트 시작
echo "🚀 Starting build and push process..."
echo "🔖 Using tag: $TAG"

# 각 이미지 빌드 및 푸시
for IMAGE_INFO in "${IMAGES[@]}"; do
  IMAGE_NAME=$(echo "$IMAGE_INFO" | cut -d':' -f1)
  DOCKERFILE_PATH=$(echo "$IMAGE_INFO" | cut -d':' -f2)

  echo "🏗️ Building Docker image: $IMAGE_NAME:$TAG"
  docker build -t "$IMAGE_NAME:$TAG" -t "$IMAGE_NAME:latest" -f "$DOCKERFILE_PATH" .
  if [ $? -ne 0 ]; then
    echo "❌ Docker build failed for $IMAGE_NAME!"
    exit 1
  fi
  echo "✅ Docker image built successfully: $IMAGE_NAME:$TAG"

  echo "📤 Pushing Docker image: $IMAGE_NAME:$TAG"
  docker push "$IMAGE_NAME:$TAG"
  if [ $? -ne 0 ]; then
    echo "❌ Docker push failed for $IMAGE_NAME"
    exit 1
  fi
  echo "✅ Pushed successfully: $IMAGE_NAME:$TAG"
done

echo "🎉 All images built and pushed successfully!"
