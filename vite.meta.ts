import { execSync, type ExecSyncOptionsWithStringEncoding } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'

// Single source of truth for the build-time defines shared by the library build
// (vite.config.ts) and the example-site build (vite.config.example.ts): the
// package version + the short commit it was built from. Injected via Vite
// `define` and surfaced as the __APP_VERSION__ / __GIT_HASH__ globals declared
// in env.d.ts. The git call is wrapped so builds outside a checkout still succeed.
export function buildDefines(): Record<string, string> {
  const pkgVersion: string = JSON.parse(
    readFileSync(fileURLToPath(new URL('./package.json', import.meta.url)), 'utf-8'),
  ).version
  const gitHash: string = (() => {
    // encoding → string return; stdio silences git's stderr (e.g. "not a git repo").
    const opts: ExecSyncOptionsWithStringEncoding = {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }
    try {
      const hash = execSync('git rev-parse --short HEAD', opts).trim()
      // `--porcelain` emits one line per changed/untracked path → non-empty = dirty tree.
      const dirty = execSync('git status --porcelain', opts).trim() !== ''
      return dirty ? `${hash}-dirty` : hash
    } catch {
      return 'unknown'
    }
  })()

  return {
    __APP_VERSION__: JSON.stringify(pkgVersion),
    __GIT_HASH__: JSON.stringify(gitHash),
  }
}
