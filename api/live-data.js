export default function handler(req, res) {
  // Current Academy count - Updated 2026-02-26
  const currentEnrollments = 318; // As of 2026-02-26 (refund processed)
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