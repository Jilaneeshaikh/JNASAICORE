# JNAS Multi-Modal Tracking Plug-in Architecture

To support seamless supply-chain scanning, JNAS incorporates a plug-in-ready telemetry layer that accommodates future physical tracking hardware without restructuring database schemas.

## Configured Telemetry Models

The system architecture defines five tracking profiles:

### 1. RFID (Radio-Frequency Identification)
- **Use Case**: Heavy steel racks and kit carts loaded onto transport trucks.
- **Protocol**: EPC Class 1 Gen 2 UHF RFID standards.
- **Data Footprint**: Permanent Hex string UUID + automatic gate antenna triggers.

### 2. BLE (Bluetooth Low Energy) Beacon
- **Use Case**: Indoor staging-bay geolocation and real-time physical telemetry.
- **Protocol**: iBeacon/Eddystone broadcast frames.
- **Data Footprint**: Active RSSI, battery status, localized positioning nodes.

### 3. QR Code (Quick Response)
- **Use Case**: Light plastic totes, manual dispatch, and rapid smartphone confirmation.
- **Protocol**: ISO/IEC 18004.
- **Data Footprint**: Encrypted HTTPS redirect URI containing `assetId`.

### 4. Barcode
- **Use Case**: Traditional warehouse scanning lanes.
- **Protocol**: Code 128 standard industrial format.
- **Data Footprint**: Alpha-numeric asset identifiers.

### 5. GPS Placeholder / Satellite
- **Use Case**: Intermodal maritime containers and cross-border transport trailers.
- **Data Footprint**: Standard NMEA coordinates.

---

## Technical Hook Definitions

Any external hardware scanner or IoT event stream can integrate with the tracking engine via the standardized REST endpoint or WebSocket client:

```typescript
interface LocationUpdatePayload {
  assetId: string;
  newLocation: string;
  trackingMode: 'RFID' | 'BLE' | 'QR' | 'Barcode' | 'GPS';
  trackingIdentifier: string;
  latitude?: number;
  longitude?: number;
  updatedBy: string;
}
```
When these payloads are ingested, the system generates location history entries and dispatches matching state audit trails.
