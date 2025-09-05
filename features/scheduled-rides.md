# Scheduled Rides

## Section 1 (MVP)
Type: ScheduledRide { id, userId, pickupLocation, dropoffLocation, pickupTimeISO, status(scheduled|canceled|completed), notes? }
Create form (modal or panel) launched from booking/ride request screen.
Store rides in in-memory array (no backend).
List upcoming rides (pickupTime > now) on Activity screen, ascending by pickupTime.
Validation: pickupTime > now; pickup & dropoff required.

## Section 2 (Future)
Editing, cancel flow, persistence layer, reminders.