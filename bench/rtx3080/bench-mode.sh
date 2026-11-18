#!/bin/sh
# Free RAM/VRAM on the GPU node for a big-model benchmark, then give it back.
#   ./bench-mode.sh on    scale the RAM/GPU-heavy core deployments to 0 (remembers their replica counts)
#   ./bench-mode.sh off   restore them
# Pauses (while on): ollama (GPU), classifier + whisper + kokoro + TEI embed/rerank (about 11 GB resident).
# litellm routes to them, so local-llm, embeddings, rerank, STT/TTS and the shadow-mode triage classifier are DOWN until `off`.
set -eu
NS=core
STATE=${TMPDIR:-/tmp}/bench-mode.replicas
DEPLOYS="ollama classifier whisper kokoro tei-embed tei-rerank tei-rerank-fast"

case "${1:-}" in
on)
  [ -e "$STATE" ] && { echo "already on ($STATE exists); run 'off' first" >&2; exit 1; }
  for d in $DEPLOYS; do
    n=$(kubectl get deploy "$d" -n $NS -o jsonpath='{.spec.replicas}' 2>/dev/null) || continue
    echo "$d $n" >> "$STATE"
    kubectl scale deploy "$d" -n $NS --replicas=0
  done
  kubectl wait --for=delete pod -n $NS -l 'app in (ollama,classifier,whisper,kokoro,tei-embed,tei-rerank,tei-rerank-fast)' --timeout=120s || true
  echo "paused. restore with: $0 off" ;;
off)
  [ -e "$STATE" ] || { echo "nothing to restore ($STATE missing)" >&2; exit 1; }
  while read -r d n; do kubectl scale deploy "$d" -n $NS --replicas="$n"; done < "$STATE"
  rm "$STATE" ;;
*) echo "usage: $0 on|off" >&2; exit 2 ;;
esac
