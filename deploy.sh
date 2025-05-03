#!/bin/zsh

source ~/.zshrc

# Check if a commit message was provided
if [ "$#" -ne 1 ]; then
    echo "Please provide a commit message"
    exit 1
fi

# The commit message is the first argument to the script
COMMIT_MESSAGE="$1"

# bbuild the binary for ubuntu 20.04
echo "🏰 Building binary for Ubuntu 20.04"
GOOS=linux GOARCH=amd64 go build -o wattamellon

# Add changes to the staging area
# You can adjust this to add specific files or use other git add options
git add .

# Commit the changes with the provided commit message
git commit -m "$COMMIT_MESSAGE"

# Push changes to the Git repository
git push

# Check if the push was successful
if [ $? -eq 0 ]; then
    echo "🐈 Done pushing changes to git. Now pulling changes to VPS."
else
    echo "Git push failed"
    exit 1
fi
# Copy the files to the VPS
ssh_shrood "\
cd /var/www/repos/wattamellon.shrood.app/app; \
git reset --hard origin/main; \
git pull; \
echo '👍 pulled changes from git and reset to origin'; \
echo 'Current directory: '; pwd; \
# Stop any existing containers that might be using port 3306
docker ps | grep 3307 && docker stop \$(docker ps | grep 3306 | awk '{print \$1}'); \
# Force remove any existing containers
docker compose -f ./docker-compose.yml --env-file ./.env down --remove-orphans; \
# restart the docker container
echo '⛴️ Restarting docker container';\
docker compose -f ./docker-compose.yml --env-file ./.env up -d
"

echo "⭐️🚀✅ Deployment successful"