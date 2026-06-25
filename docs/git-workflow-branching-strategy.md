# Git Workflow & Branching Strategy

## Doel

Om de ontwikkeling van het project overzichtelijk en beheersbaar te houden, wordt gewerkt met een vaste branch-structuur. Hierdoor blijven nieuwe functionaliteiten, bugfixes en releases goed gescheiden en is de volledige ontwikkelgeschiedenis eenvoudig terug te vinden.

## Branch structuur

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

  * Bevat altijd de stabiele productieversie.
  * Alleen volledig geteste code wordt hierheen gemerged.

* **develop**

  * Centrale ontwikkelbranch.
  * Nieuwe functionaliteiten worden hier samengevoegd voordat ze naar `main` gaan.

* **feature/**

  * Voor iedere nieuwe functionaliteit wordt een aparte branch aangemaakt.
  * Voorbeeld: `feature/login`, `feature/pdf-export`.

* **bugfix/**

  * Voor het oplossen van fouten die geen nieuwe functionaliteit toevoegen.

* **hotfix/**

  * Voor urgente productieproblemen die direct opgelost moeten worden.

## Workflow

1. Maak een nieuwe branch vanaf `develop`.
2. Ontwikkel en test de functionaliteit.
3. Merge de feature naar `develop`.
4. Na acceptatie wordt `develop` gemerged naar `main`.

## Historie

Feature-, bugfix- en hotfix-branches worden **niet verwijderd** na het mergen. Hierdoor blijft de volledige ontwikkelgeschiedenis behouden en kunnen eerdere implementaties altijd worden geraadpleegd of hergebruikt.
