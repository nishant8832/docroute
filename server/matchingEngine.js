// DocRoute Smart AI Route Matching & Fare Estimation Engine

// Calculate approximate straight-line distance using Haversine formula
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

// Calculate dynamic price based on distance, urgency, document type, and insurance
export function estimateDeliveryPricing({
  distanceKm = 300,
  urgency = 'Same Day',
  category = 'Legal Documents',
  declaredValue = 10000,
  insuranceRequired = true
}) {
  // Base fare
  let baseRate = 200;
  if (distanceKm > 100) {
    baseRate += Math.round((distanceKm - 100) * 0.75);
  }

  // Urgency multiplier
  let urgencyMultiplier = 1.0;
  if (urgency === 'Urgent') urgencyMultiplier = 1.35;
  else if (urgency === 'Same Day') urgencyMultiplier = 1.20;
  else if (urgency === 'Next Day') urgencyMultiplier = 1.05;

  let fare = Math.round(baseRate * urgencyMultiplier);

  // Category surcharge for high-security handling
  let categorySurcharge = 0;
  if (['Legal Documents', 'Passport & Visas', 'Financial & Cheques'].includes(category)) {
    categorySurcharge = 50;
  }

  // Insurance fee (0.1% of declared value, min ₹15)
  const insuranceFee = insuranceRequired ? Math.max(15, Math.round(declaredValue * 0.001)) : 0;

  const totalFare = fare + categorySurcharge + insuranceFee;

  // Revenue split: 80% to Traveller, 15% to Platform, 5% to Trust & Transit Guarantee Fund
  const travellerPayout = Math.round(totalFare * 0.80);
  const platformFee = Math.round(totalFare * 0.15);
  const guaranteeFund = totalFare - travellerPayout - platformFee;

  return {
    totalFare,
    travellerPayout,
    platformFee,
    insuranceFee: guaranteeFund + insuranceFee,
    distanceKm,
    urgencyMultiplier,
    estimatedTransitHours: Math.max(1.5, Math.round((distanceKm / 75) * 10) / 10)
  };
}

// Score a traveller against a delivery request
export function calculateMatchScore(delivery, travelPlan) {
  let score = 0;
  const reasons = [];

  // 1. Direct Route Match (40 pts)
  const sameFrom = delivery.fromCity.toLowerCase() === travelPlan.fromCity.toLowerCase();
  const sameTo = delivery.toCity.toLowerCase() === travelPlan.toCity.toLowerCase();
  
  if (sameFrom && sameTo) {
    score += 40;
    reasons.push('Direct city-to-city route match');
  } else if (sameFrom && travelPlan.stops && travelPlan.stops.some(s => s.toLowerCase().includes(delivery.toCity.toLowerCase()))) {
    score += 35;
    reasons.push('Destination is an intermediate stop on traveller route');
  } else {
    // Weak or partial match
    return { score: 0, reasons: ['Route cities do not match corridor'] };
  }

  // 2. Trust Score of Traveller (30 pts)
  const trustPoints = Math.round(((travelPlan.travellerTrustScore || 90) / 100) * 30);
  score += trustPoints;
  if (travelPlan.travellerTrustScore >= 95) {
    reasons.push(`Top-tier verified traveller trust score (${travelPlan.travellerTrustScore}%)`);
  }

  // 3. Transport Speed & Mode (15 pts)
  if (travelPlan.transportMode === 'Flight') {
    score += 15;
    reasons.push('Express aviation transit (Fastest)');
  } else if (travelPlan.transportMode === 'Train' && travelPlan.transportDetail?.includes('Vande Bharat')) {
    score += 14;
    reasons.push('High-speed premium rail (Vande Bharat Express)');
  } else if (travelPlan.transportMode === 'Train') {
    score += 12;
    reasons.push('Superfast train transit');
  } else {
    score += 10;
    reasons.push('Road express transit');
  }

  // 4. Capacity Availability (10 pts)
  if (travelPlan.capacityAvailable >= 2) {
    score += 10;
    reasons.push('Ample carrying capacity available');
  } else if (travelPlan.capacityAvailable >= 1) {
    score += 6;
    reasons.push('Limited capacity remaining (1 slot)');
  } else {
    return { score: 0, reasons: ['No remaining baggage capacity'] };
  }

  // 5. Rating bonus (5 pts)
  if ((travelPlan.travellerRating || 4.5) >= 4.9) {
    score += 5;
    reasons.push('5-star rated courier reliability');
  }

  return {
    score: Math.min(100, score),
    reasons
  };
}
