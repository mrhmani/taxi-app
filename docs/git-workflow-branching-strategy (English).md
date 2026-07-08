# Git Workflow & Branching Strategy

## Goal

To keep project development organized and manageable, we work with a fixed branch structure. This ensures that new features, bugfixes, and releases remain properly separated and that the entire development history is easy to find.

## Branch Structure

```text
main
│
develop
├── feature/login
├── feature/rittenstaat
├── feature/pakbon
├── feature/pdf-export
├── bugfix/login
└── hotfix/production
```

### Branches

* **main**

  * Always contains the stable production version.
  * Only fully tested code is merged here.

* **develop**

  * Central development branch.
  * New features are merged here before going to `main`.

* **feature/**

  * A separate branch is created for every new feature.
  * Example: `feature/login`, `feature/pdf-export`.

* **bugfix/**

  * For fixing bugs that do not add new functionality.

* **hotfix/**

  * For urgent production issues that must be resolved immediately.

## Workflow

1. Create a new branch from `develop`.
2. Develop and test the feature.
3. Merge the feature branch into `develop`.
4. After acceptance, `develop` is merged into `main`.

## History

Feature, bugfix, and hotfix branches are **not deleted** after merging. This preserves the complete development history and ensures that earlier implementations can always be referenced or reused.
