# Sequential Approval

```mermaid
stateDiagram-v2
direction TB
    state "Write" as WRITE
    state "Approve 1" as APPROVE1
    state "Approve 2" as APPROVE2

    
    [*] --> WRITE
    WRITE --> APPROVE1
    APPROVE1 --> APPROVE2
    APPROVE2 --> [*]