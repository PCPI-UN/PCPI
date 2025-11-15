import { EventStatus } from './event-status.enum';

export const getEventStatus = (
  start: Date | string,
  end: Date | string,
  inscriptionDeadline?: Date | string | null,
): EventStatus => {
  const startDate = start instanceof Date ? start : new Date(start);
  const endDate = end instanceof Date ? end : new Date(end);
  const now = new Date();

  // Event has ended
  if (now > endDate) {
    return EventStatus.CLOSED;
  }

  // Event is currently happening
  if (now >= startDate && now <= endDate) {
    return EventStatus.AVAILABLE;
  }

  // Event hasn't started yet - check registration deadline
  if (inscriptionDeadline) {
    const regDeadline =
      inscriptionDeadline instanceof Date
        ? inscriptionDeadline
        : new Date(inscriptionDeadline);

    // Registrations closed but event hasn't started
    if (now >= regDeadline && now < startDate) {
      return EventStatus.REGISTRATION_CLOSED;
    }
  }

  // Registrations still open, event hasn't started
  return EventStatus.UPCOMING;
};
 