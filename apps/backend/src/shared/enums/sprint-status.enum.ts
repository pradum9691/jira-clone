/**
 * Sprint status enum.
 *
 * State transitions:
 * PLANNED → ACTIVE (via /start endpoint)
 * ACTIVE → COMPLETED (via /complete endpoint)
 *
 * No backwards transitions allowed.
 */
export enum SprintStatus {
  PLANNED = 'PLANNED',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
}