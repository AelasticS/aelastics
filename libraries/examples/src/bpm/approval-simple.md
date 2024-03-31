# stateDiagram

```mermaid
stateDiagram-v2
direction TB
    state "Write" as WRITE
    state "Approve" as APPROVE

    
    [*] --> WRITE
    WRITE --> APPROVE
    APPROVE --> [*]