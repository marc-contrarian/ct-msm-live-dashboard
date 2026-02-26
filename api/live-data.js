export default function handler(req, res) {
  // Current Academy count - Updated 2026-02-26
  const currentEnrollments = 319; // As of 2:23 PM CT on 2/26/26
  const currentRevenue = currentEnrollments * 10000; // $10K per enrollment
  
  const liveData = {
    tickets: 5680,
    ticketRevenue: 666134,
    enrollments: currentEnrollments,
    enrollmentRevenue: currentRevenue,
    lastUpdated: new Date().toISOString(),
    eventStatus: 'live',
    nextUpdate: new Date(Date.now() + 30000).toISOString()
  };
  
  res.json(liveData);
}