# TaxiLivo Case Study: ActionDialog Refactor & AI-Assisted Architecture Decisions

## Executive Summary

During the development of TaxiLivo, I wanted to improve the user experience around important user actions such as saving, resetting, submitting, deleting trip logs, and logging out.

What initially appeared to be a simple UI improvement evolved into a valuable lesson about software architecture, component design, maintainability, and AI-assisted development.

This document explains the original problem, the architectural decisions that were considered, the role AI played in the decision-making process, and the final solution that was implemented.

---

## Background

At the time of implementation, TaxiLivo already contained a working notification system based on toast messages.

The application displayed notifications such as:

- Saved successfully
- Deleted successfully
- Submitted successfully

using:

```
Toast.jsx
Toast.css
```

In addition, some confirmations were implemented separately inside individual components.

Examples:

```
Navigation.jsx
└── Logout confirmation

MyTripLogs.jsx
└── Delete confirmation
```

Although functional, this created inconsistencies across the application.

---

## The Original Problem

The primary issue was not technical functionality. Everything already worked.

The issue was user experience.

Important actions such as:

- Reset
- Delete
- Submit

could have significant consequences for the user.

A small toast notification did not provide enough confidence that the action was intentional or completed successfully.

Additionally, different parts of the application handled confirmations differently, making the product feel inconsistent.

---

## Initial Goal

The original objective was simple:

> Replace basic toast notifications with a more professional confirmation and success experience.

The desired experience included:

- Confirmation dialogs before destructive actions.
- Clear visual success feedback.
- Better consistency across the application.
- A more polished and modern user experience.

---

## First AI Proposals

The initial AI-generated solution introduced:

```
ConfirmationModal.jsx
ConfirmationModal.css

SuccessModal.jsx
SuccessModal.css
```

At first glance, this appeared reasonable.

However, it raised an important architectural question:

> Do we really need multiple modal components for a relatively small application?

This question became the turning point of the entire implementation process.

---

## Architecture Review Process

Instead of immediately implementing the proposed solution, I chose to pause and review the architecture.

This led to an important realization:

Many AI-generated solutions are technically correct but not always optimal for the size and complexity of the project.

I began evaluating:

- Whether additional files were truly necessary.
- Whether functionality could be consolidated.
- Whether the solution would still make sense six months later.
- Whether maintenance costs justified the architecture.

---

## Key Lesson #1: Avoid Component Proliferation

One of the biggest risks in React projects is creating too many specialized components.

The following structure was considered:

```
ConfirmationModal.jsx
SuccessModal.jsx
DeleteModal.jsx
LogoutModal.jsx
SaveModal.jsx
```

While technically clean, this introduces:

- More files
- More CSS files
- More maintenance
- More duplicated logic
- More duplicated styling

For an application of TaxiLivo's size, this would have been unnecessary complexity.

---

## The Alternative Approach

Instead of creating multiple modal components, I explored a reusable component approach.

The idea was simple:

Create one dialog component that can display different states.

This became:

```
ActionDialog.jsx
ActionDialog.css
```

---

## Why ActionDialog Was Chosen

The name ActionDialog was intentionally selected.

The dialog is responsible for actions performed on trip logs:

- Save
- Reset
- Submit
- Delete

These actions belong to the same business domain.

Rather than building separate UI components for each action, a single reusable component could handle all scenarios.

Benefits:

- Less code.
- Fewer files.
- Shared styling.
- Shared animations.
- Easier maintenance.
- Consistent UX.

---

## Why Logout Was Kept Separate

During the architecture review another important distinction emerged.

Logout is fundamentally different from trip log actions.

Trip log actions:

- Save
- Reset
- Submit
- Delete

belong to the trip log domain.

Logout belongs to:

- Authentication
- Session management
- Navigation

For this reason, Logout was intentionally excluded from ActionDialog.

Final architecture:

```
ActionDialog
├── Save
├── Reset
├── Submit
└── Delete

Navigation
└── Logout Confirmation
```

This separation improved clarity and respected domain boundaries.

---

## UX Decisions

Not every action should behave the same way.

The implementation intentionally follows different flows depending on risk.

### Save

Save is not destructive.

Flow:

```
Save
↓
Execute immediately
↓
Success feedback
```

No confirmation required.

---

### Reset

Reset may cause data loss.

Flow:

```
Reset
↓
Confirmation
↓
Execute
↓
Success feedback
```

Confirmation required.

---

### Submit

Submit sends user data.

Flow:

```
Submit
↓
Confirmation
↓
Execute
↓
Success feedback
```

Confirmation required.

---

### Delete

Delete permanently removes data.

Flow:

```
Delete
↓
Confirmation
↓
Execute
↓
Success feedback
```

Confirmation required.

---

### Logout

Logout only affects the current session.

Flow:

```
Logout
↓
Confirmation
↓
Redirect to Login
```

No success feedback required.

---

## AI Prompt Engineering Lessons

One of the most valuable lessons from this project was learning how to work effectively with AI.

Initially, my prompts focused on implementation.

Over time, I realized a better process exists.

Instead of asking AI to build immediately:

```
Build feature X.
```

I learned to use the following workflow:

```
1. Define the problem.
2. Request an implementation plan.
3. Review the architecture.
4. Challenge unnecessary complexity.
5. Approve the plan.
6. Implement.
```

This consistently produced better outcomes.

---

## Key Lesson #2: Architecture Before Code

The most important lesson from this refactor is:

> Good architecture decisions should happen before implementation begins.

The final solution was not the first solution proposed by AI.

It emerged through discussion, review, questioning assumptions, and simplifying the design.

---

## Final Results

The final implementation achieved:

- Professional confirmation dialogs.
- Professional success feedback.
- Consistent UX.
- Fewer components.
- Less duplicated code.
- Better maintainability.
- Clear separation of responsibilities.
- Simpler project structure.

Most importantly, the final solution solved the original problem without introducing unnecessary complexity.

---

## Conclusion

This refactor was not simply about replacing toast notifications.

It became an exercise in architectural thinking, maintainability, UX design, and AI collaboration.

The biggest takeaway is that simplicity is often the best architecture.

A well-designed reusable component can provide a cleaner, more scalable solution than multiple specialized components.

By challenging the first proposal and focusing on maintainability, the final implementation became both simpler and more professional.
