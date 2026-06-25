/**
 * Issue status enum.
 *
 * State transitions:
 * OPEN → IN_PROGRESS → IN_REVIEW → DONE
 * (Bidirectional movement allowed)
 */
export enum IssueStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  IN_REVIEW = 'IN_REVIEW',
  DONE = 'DONE',
}