#!/usr/bin/env bash
# Package-shape checks, run against the tarball that `npm publish` would upload.
#
# The same script runs locally (`npm run check:package`) and in CI (gate.yml), so
# "passes here" and "passes in the gate" mean the same thing.
#
#   1. publint            package.json fields and exports are well formed
#   2. attw (esm-only)    the types resolve for ESM consumers and bundlers
#   3. consumer tsc       types-test/consumer.ts compiles against the installed tarball
#   4. validate:quick     every value is reachable, run on the packed files, not the repo
#
# Needs the devDependencies installed (`npm ci`). Exits non-zero on the first failure.
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
bin="$root/node_modules/.bin"
work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT

step() { printf '\n==> %s\n' "$1"; }

cd "$root"

step "Pack"
tarball="$work/$(npm pack --pack-destination "$work" --silent)"
echo "$tarball"
tar -tzf "$tarball"

step "publint (warnings are errors)"
"$bin/publint" run "$tarball" --strict

# attw exits 0 for a package that ships no types at all ("does not contain types").
# The consumer typecheck below is what fails in that case.
step "attw (esm-only profile)"
"$bin/attw" "$tarball" --profile esm-only

step "Unpack"
unpacked="$work/unpacked"
mkdir -p "$unpacked"
tar -xzf "$tarball" -C "$unpacked"

step "Consumer typecheck (tarball installed as a dependency)"
consumer="$work/consumer"
mkdir -p "$consumer/node_modules/rng-with-intention"
cp -R "$unpacked/package/." "$consumer/node_modules/rng-with-intention/"
cp "$root/types-test/consumer.ts" "$consumer/consumer.ts"
printf '{ "type": "module" }\n' > "$consumer/package.json"
cd "$consumer"
common=(--noEmit --strict --target es2022 --lib es2022 consumer.ts)
echo "-- module nodenext"
"$bin/tsc" "${common[@]}" --module nodenext --moduleResolution nodenext
echo "-- module esnext, resolution bundler"
"$bin/tsc" "${common[@]}" --module esnext --moduleResolution bundler
# The plugin, the one known consumer, still resolves with node10 (the `types` field).
# TypeScript 6 deprecates it, hence --ignoreDeprecations.
echo "-- module esnext, resolution node10"
"$bin/tsc" "${common[@]}" --module esnext --moduleResolution node10 --ignoreDeprecations 6.0
cd "$root"

step "validate:quick on the packed files"
mkdir -p "$unpacked/package/scripts"
cp "$root/scripts/validate-coverage.js" "$unpacked/package/scripts/"
(cd "$unpacked/package" && node scripts/validate-coverage.js --quick)

printf '\nAll package checks passed.\n'
