import { EventStatus } from './event-status.enum';

export const getEventStatus = (start: Date | string, end: Date | string): EventStatus => {
  console.log(' getEventStatus called with:');
  console.log('   start:', start);
  console.log('   end:', end);

  const startDate = start instanceof Date ? start : new Date(start);
  const endDate   = end   instanceof Date ? end   : new Date(end);
  const now = new Date();

  console.log(' Parsed Dates:');
  console.log('   startDate:', startDate.toISOString());
  console.log('   endDate:', endDate.toISOString());
  console.log('   now:', now.toISOString());

  console.log(' Comparisons:');
  console.log('   now < startDate ?', now < startDate);
  console.log('   now > endDate ?', now > endDate);

  if (now < startDate) {
    console.log('Status = UPCOMING');
    return EventStatus.UPCOMING;
  }

  if (now > endDate) {
    console.log('Status = CLOSED');
    return EventStatus.CLOSED;
  }

  console.log('Status = AVAILABLE');
  return EventStatus.AVAILABLE; 
};
 