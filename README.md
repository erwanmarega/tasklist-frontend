# TaskList — Frontend

Interface web de gestion de tâches (TaskList), avec chaîne CI/CD Jenkins complète : tests automatisés, analyse qualité (SonarQube), analyse de sécurité (Trivy), génération de SBOM (SPDX) et publication d'image Docker sur Docker Hub.

## Stack technique

| Élément | Technologie |
|---------|-------------|
| Framework | React 19 |
| Build | Vite |
| Langage | TypeScript |
| Tests | Vitest + Testing Library (jsdom) |
| Qualité | SonarQube |
| Sécurité | Trivy (scan + SBOM SPDX) |
| Conteneur | Docker (multi-stage + nginx) |
| CI/CD | Jenkins (pipeline déclaratif) |

## Architecture du dépôt

```
src/
  components/     # TaskForm, TaskItem, TaskList
  hooks/          # useTasks
  api/            # client API (taskApi)
  types/          # types partagés
  __tests__/      # tests unitaires (composants, hook, API)
Dockerfile              # build multi-stage (node → nginx)
Jenkinsfile             # pipeline CI/CD
sonar-project.properties  # configuration SonarQube
vite.config.ts          # config Vite + Vitest (couverture, reporter JUnit)
```

## Prérequis

- Node.js 22, npm
- Docker
- (CI) Jenkins avec outil NodeJS `NodeJS-22`, credential `dockerhub-credentials`, serveur SonarQube `SonarQube`, Trivy accessible via image Docker.

## Installation locale

```bash
npm ci
```

## Commandes utiles

```bash
npm run dev            # serveur de développement Vite
npm run build          # build de production (tsc -b && vite build)
npm run preview        # prévisualisation du build
npm test               # tests unitaires
npm run test:coverage  # tests unitaires + couverture
```

## Pipeline CI/CD (Jenkinsfile)

Le pipeline déclaratif exécute, à chaque build :

1. **Install** — `npm ci`
2. **Build** — `tsc -b && vite build`
3. **Unit Tests** — tests + couverture (rapport JUnit + HTML publiés)
4. **SonarQube Analysis** — analyse qualité de code
5. **Docker Build** — construction de l'image multi-stage
6. **SBOM (SPDX)** — génération du SBOM au format SPDX (Trivy)
7. **Trivy Scan** — analyse de vulnérabilités HIGH/CRITICAL
8. **Docker Push** — publication de l'image sur Docker Hub

## Stratégie de tests

- Composants (`TaskForm`, `TaskItem`, `TaskList`) : rendu et interactions utilisateur (Testing Library).
- Hook `useTasks` : logique d'état.
- Client API : appels mockés.
- Couverture V8, rapport `lcov` importé dans SonarQube.

## Sécurité (DevSecOps)

- Aucun secret en clair : identifiants Docker Hub et token SonarQube gérés par les **credentials Jenkins**.
- `.env` ignoré par Git.
- Scan **Trivy** de l'image (OS + dépendances) à chaque build.
- **SBOM SPDX** (`sbom-spdx.json`) archivé pour la traçabilité de la chaîne d'approvisionnement.

## Docker

Image multi-stage : build des fichiers statiques avec `node:22-alpine`, servis par `nginx:alpine`.

```bash
docker build -t tasklist-frontend .
docker run --rm -p 8080:80 tasklist-frontend
```

## Documentation

La documentation technique complète (architecture, configuration Jenkins/SonarQube/Docker, stratégies de test et de sécurité, runbook) est versionnée dans ce dépôt et maintenue de façon collaborative via Git (README + historique des commits).
