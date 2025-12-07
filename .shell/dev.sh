#!/bin/bash

cd "$(dirname "$0")/.."

echo "Starting Hugo server in DEV mode (fast, no GitInfo)..."
hugo server --disableFastRender --ignoreCache
