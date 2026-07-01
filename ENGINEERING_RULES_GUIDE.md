# Engineering Rules Integration Guide

Standard industrial compliance references implemented inside the Enterprise Rules Platform:

## Applied Reference Codes

### Safety Rules (ESD Protection Verification)
*   **Reference**: `ESD-S20.20` / `MIL-STD-2073-1D`
*   **Standard**: Standard for Protection of Electrical and Electronic Parts, Assemblies, and Equipment.
*   **Trigger**: Linked payload contains microprocessor, transceiver, high-voltage battery cells, or custom electronic components.

### Stacking Rules (Vertical Stress Validation)
*   **Reference**: `ASTM-D642` / `ASTM-D4169`
*   **Standard**: Compressive Resistance of Shipping Containers, Components, and Unit Loads.
*   **Trigger**: Modular palletised assemblies or multi-tier intermodal steel racks.

### Forklift Rules (Handling Clearance Verification)
*   **Reference**: `OSHA-1910.178` / `ANSI-MH29.1`
*   **Standard**: Powered Industrial Truck Handling and Lift Pocket Safe Clearance Margins.
*   **Trigger**: Containers with aggregate container weight over 1,500 lbs.

### Ergonomic Rules (Manual Lift Lifting Checks)
*   **Reference**: `NIOSH Lifting Equation` / `OSHA Manual Handling`
*   **Standard**: Safe Lifting Limits for Manual Handling. Warns engineers when modular box designs exceed 35 lbs.
*   **Trigger**: Hand-held modular plastic cases and dunnage kits.
