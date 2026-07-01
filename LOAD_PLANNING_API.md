# Load Planning API Specifications

## 1. Get All Load Plans
- **Method**: `GET`
- **Location**: In-memory / State registry accessor
- **Interface**: `logisticsRegistry.getLoadPlans(): LoadPlan[]`
- **Returns**: Array of active load plans with nested capacity models.

## 2. Get Load Plan by ID
- **Method**: `GET`
- **Interface**: `logisticsRegistry.getLoadPlanById(id: string): LoadPlan | undefined`

## 3. Create Load Plan
- **Method**: `POST`
- **Interface**: `logisticsRegistry.createLoadPlan(plan: Omit<LoadPlan, 'id' | 'planNumber' | ...>): LoadPlan`
- **Functionality**: Instantiates a new load plan with a unique incremental number, sets default statuses to `Draft`, and fires a unified `'ACTIVITY_CREATED'` event.

## 4. Update Load Plan Status & Containers
- **Method**: `PUT`
- **Interface**: `logisticsRegistry.updateLoadPlan(id: string, updates: Partial<LoadPlan>): LoadPlan`
- **Events**: Triggers `'Container Assigned'` or `'Approval Changed'` event streams upon parameter modifications.
