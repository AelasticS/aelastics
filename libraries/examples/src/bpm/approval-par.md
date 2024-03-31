# Parallel Approval

```mermaid
stateDiagram-v2
direction LR
    state "Write" as WRITE
    state "Approve 1" as APPROVE1
    state "Approve 2" as APPROVE2
    state Fork1 <<fork>>
    state Join  <<fork>>

    
    [*] --> WRITE
    WRITE --> Fork1
    Fork1 --> APPROVE1
    Fork1 --> APPROVE2
    APPROVE1 --> Join
    APPROVE2 --> Join
    Join --> [*]
