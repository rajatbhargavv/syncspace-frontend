# Performance Measurements

## Production build baseline

Measurements are from `npm run build` on the local Vite production build. Gzip sizes are
reported by Vite.

| Asset                                    |  Minified |         Gzip |
| ---------------------------------------- | --------: | -----------: |
| Entry (`index-*.js`)                     | 256.13 kB |     74.00 kB |
| React vendor chunk                       | 208.92 kB |     68.24 kB |
| Query vendor chunk                       |  48.08 kB |     14.62 kB |
| Board drag-and-drop chunk                |  43.43 kB |     14.44 kB |
| Charts chunk (lazy analytics dependency) | 422.35 kB |    114.10 kB |
| Analytics route chunk                    |  16.60 kB |      5.78 kB |
| Service worker                           |  19.46 kB |      6.64 kB |
| Precache entries                         |        41 | 1,485.94 KiB |

The entry gzip size is below the requested 200 kB login and 300 kB app-shell budgets.
The charts chunk is intentionally isolated from the initial entry, but its transfer remains
a follow-up optimization target.

## Pending measurements

Mobile Lighthouse scores, LCP/CLS/INP, and route-specific screenshots require a production
preview plus a browser environment and are not invented here. Add before/after scores when
the backend/demo environment is available.
