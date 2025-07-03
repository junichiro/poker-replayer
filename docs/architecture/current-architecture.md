# Current Architecture Diagram

## Component Relationship Overview

```mermaid
graph TD
    A[PokerHandReplay Component] --> B[PokerStarsParser]
    A --> C[ActionHistory Component]
    A --> D[Controls Component]
    A --> E[Table Component]
    A --> F[Player Component]
    A --> G[Card Component]
    A --> H[Pot Component]
    
    B --> I[PlayerStateTracker Logic]
    B --> J[PotCalculator Logic]
    B --> K[ActionParser Logic]
    B --> L[ValidationLogic]
    
    A --> M[Customization Utils]
    A --> N[Loading Utils]
    A --> O[Retry Utils]
    A --> P[Performance Utils]
    
    M --> Q[DOM Manipulation]
    
    style A fill:#ffcccc
    style B fill:#ffcccc
    style M fill:#ffffcc
    style I fill:#ffcccc
    style J fill:#ffcccc
    style K fill:#ffcccc
    style L fill:#ffcccc
    
    classDef violation fill:#ffcccc,stroke:#ff0000
    classDef warning fill:#ffffcc,stroke:#ff8800
    classDef compliant fill:#ccffcc,stroke:#00ff00
```

## SOLID Violations Map

### 🔴 Critical SRP Violations
- **PokerHandReplay Component**: UI + Business Logic + Game Control + Animation
- **PokerStarsParser**: Parsing + State Management + Pot Calculation + Validation
- **Customization Utils**: Theme + Size + Animation + DOM Manipulation

### 🟡 Medium OCP Violations  
- **Parser Architecture**: No abstraction for different poker sites
- **Animation System**: Hardcoded animation logic in components

### 🟠 ISP Violations
- **ReplayConfig Interface**: 11 mixed-concern properties
- **PokerHand Interface**: Large interface with multiple concerns

### 🔴 DIP Violations
- **Direct DOM Dependencies**: Components directly manipulate DOM
- **Parser Instantiation**: Components directly create parser instances

## Dependency Flow Analysis

```mermaid
graph LR
    A[PokerHandReplay] -->|direct instantiation| B[PokerStarsParser]
    A -->|direct DOM access| C[HTMLElement]
    A -->|direct import| D[Customization Utils]
    
    B -->|internal state| E[PlayerChips Map]
    B -->|internal state| F[AllInPlayers Map]
    B -->|internal calculations| G[Pot Math]
    
    D -->|direct manipulation| C
    
    style A fill:#ffcccc
    style B fill:#ffcccc
    style C fill:#ff9999
    style D fill:#ffffcc
    style E fill:#ffcccc
    style F fill:#ffcccc
    style G fill:#ffcccc
```

## Proposed Improved Architecture

```mermaid
graph TD
    A[PokerHandReplay Component] --> B[IHandHistoryParser]
    A --> C[IGameController]
    A --> D[IAnimationService]
    A --> E[IThemeService]
    
    B --> F[PokerStarsParser]
    B --> G[PartyPokerParser]
    B --> H[888PokerParser]
    
    C --> I[GameState Manager]
    C --> J[Action Validator]
    
    D --> K[CardDealStrategy]
    D --> L[ChipMoveStrategy]
    D --> M[PlayerActionStrategy]
    
    F --> N[PotCalculator Service]
    F --> O[PlayerStateTracker Service]
    F --> P[ActionParser Service]
    
    style A fill:#ccffcc
    style B fill:#ccffcc
    style C fill:#ccffcc
    style D fill:#ccffcc
    style E fill:#ccffcc
    style F fill:#ccffcc
    style G fill:#ccffcc
    style H fill:#ccffcc
    style I fill:#ccffcc
    style J fill:#ccffcc
    style K fill:#ccffcc
    style L fill:#ccffcc
    style M fill:#ccffcc
    style N fill:#ccffcc
    style O fill:#ccffcc
    style P fill:#ccffcc
```

## File Size and Complexity Metrics

| File | Lines | Methods | Responsibilities | Violation Level |
|------|-------|---------|------------------|-----------------|
| PokerStarsParser.ts | 920 | 36 | 6 | 🔴 Critical |
| PokerHandReplay.tsx | 602 | ~20 | 6 | 🔴 Critical |
| customization.ts | 370 | ~15 | 5 | 🟡 Medium |
| loading.ts | ~200 | ~10 | 3 | 🟡 Medium |
| types/index.ts | ~500 | N/A | Interface definitions | 🟠 ISP Issues |

## Change Impact Analysis

### Current: Adding New Poker Site
```mermaid
graph LR
    A[New Site Request] --> B[Modify PokerStarsParser]
    B --> C[Update Component Logic]
    C --> D[Change Type Definitions]
    D --> E[Update All Consumers]
    E --> F[Extensive Testing Required]
    
    style A fill:#ffcccc
    style B fill:#ffcccc
    style C fill:#ffcccc
    style D fill:#ffcccc
    style E fill:#ffcccc
    style F fill:#ffcccc
```

### Proposed: Adding New Poker Site
```mermaid
graph LR
    A[New Site Request] --> B[Implement IHandHistoryParser]
    B --> C[Register with Factory]
    C --> D[Zero Changes to Existing Code]
    
    style A fill:#ccffcc
    style B fill:#ccffcc
    style C fill:#ccffcc
    style D fill:#ccffcc
```

---

*Generated as part of SOLID principles analysis*
*See solid-analysis.md for detailed findings and recommendations*