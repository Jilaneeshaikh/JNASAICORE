# JNAS Returnable Asset Lifecycle Engine

This document outlines the state engine that governs returnable structural assets. Each physical packaging unit progresses through standardized lifecycle states, ensuring compliance, engineering safety, and optimal operational velocity.

```
       [ Designed ]
            │
            ▼
     [ Manufactured ]
            │
            ▼
       [ Approved ] ──► (Quality & Load-Staged Verification Passed)
            │
            ▼
       [ Released ]
            │
      ┌─────┴──────────────┐
      ▼                    ▼
[ In Service ] ──► [ In Transit ] ──► [ At Customer ]
      ▲                                      │
      │                                      ▼
      └─────────── [ Returned ] ◄────────────┘
                        │
                        ├──────────────────────┐
                        ▼                      ▼
                  [ Maintenance ]         [ Repair ]
                        │                      │
                        └──────► [ Refurbished ]
                                       │
                                       ▼
                               [ Retired / Scrapped ]
```

## Detailed State Definitions

1. **Designed**: Asset concept defined in CAD models, validated against mechanical stress envelopes.
2. **Manufactured**: Physical rig fabricated and assigned a permanent asset serial number.
3. **Approved**: Quality Assurance inspectors complete structural clearances.
4. **Released**: Transferred to active logistics staging for deployment.
5. **In Service**: Deployed in transport cycles carrying high-value payloads.
6. **In Transit**: Active movement between manufacturing hubs and client facilities.
7. **At Customer**: Stationed at end-client staging bays.
8. **Returned**: Discharged payload and returned to decontamination or inspection bays.
9. **Maintenance**: Routine structural refurbishment (fastener torque, washdown).
10. **Repair**: Heavy welding, replacement of damaged vibration-damping pads.
11. **Refurbished**: Returned to prime mechanical standing after overhaul.
12. **Retired**: Decommissioned due to maximum structural cycle count exhaustion.
13. **Scrapped**: Mechanically unviable, dismantled for material reclamation.
