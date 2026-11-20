import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { cities, users, travels, deliveries, kycSubmissions, notifications } from './mockData.js';
import { calculateDistanceKm, estimateDeliveryPricing, calculateMatchScore } from './matchingEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, '../dist');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve static frontend build if present
app.use(express.static(distPath));

// In-memory working state
let db = {
  cities: [...cities],
  users: [...users],
  travels: [...travels],
  deliveries: [...deliveries],
  kycSubmissions: [...kycSubmissions],
  notifications: [...notifications],
  currentUserId: 'user_sender_1' // default active session
};

// Helper to find current user
function getCurrentUser() {
  return db.users.find(u => u.id === db.currentUserId) || db.users[0];
}

// Helper to generate 6-digit OTP
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Helper to generate unique seal code
function generateSealCode(from, to) {
  const fromCode = (from || 'DOC').slice(0, 3).toUpperCase();
  const toCode = (to || 'RT').slice(0, 3).toUpperCase();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `SEAL-${fromCode}-${toCode}-${rand}-TAMPER-SAFE`;
}

// Log audit action
function createNotification({ userId, title, message, type = 'info', deliveryId = null }) {
  const notif = {
    id: `notif_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    userId,
    title,
    message,
    type,
    timestamp: new Date().toISOString(),
    read: false,
    deliveryId
  };
  db.notifications.unshift(notif);
  return notif;
}

// ---------------- API ROUTES ---------------- //

// 1. User & Auth
app.get('/api/currentUser', (req, res) => {
  const user = getCurrentUser();
  res.json({ success: true, user });
});

app.post('/api/switchUser', (req, res) => {
  const { userId } = req.body;
  const user = db.users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  db.currentUserId = user.id;
  res.json({ success: true, user });
});

app.get('/api/users', (req, res) => {
  res.json({ success: true, users: db.users });
});

app.get('/api/cities', (req, res) => {
  res.json({ success: true, cities: db.cities });
});

// 2. Deliveries
app.get('/api/deliveries', (req, res) => {
  const { role, userId } = req.query;
  let list = db.deliveries;

  if (userId) {
    list = list.filter(d => d.senderId === userId || d.travellerId === userId);
  } else if (role === 'sender') {
    list = list.filter(d => d.senderId === db.currentUserId);
  } else if (role === 'traveller') {
    list = list.filter(d => d.travellerId === db.currentUserId);
  }

  res.json({ success: true, deliveries: list });
});

app.get('/api/deliveries/:id', (req, res) => {
  const delivery = db.deliveries.find(d => d.id === req.params.id);
  if (!delivery) {
    return res.status(404).json({ success: false, message: 'Delivery not found' });
  }
  res.json({ success: true, delivery });
});

// Create Delivery Request (Sender)
app.post('/api/deliveries', (req, res) => {
  const {
    title,
    category,
    weightCategory,
    fromCity,
    toCity,
    senderAddress,
    recipientName,
    recipientPhone,
    recipientAddress,
    urgency = 'Same Day',
    preferredDeliveryTime,
    notes,
    declaredValue = 10000,
    insuranceCover = true,
    selectedTravellerId = null
  } = req.body;

  const sender = getCurrentUser();

  // Find city coordinates for distance calculation
  const fromObj = db.cities.find(c => c.name.toLowerCase() === fromCity.toLowerCase()) || { lat: 28.6139, lng: 77.2090 };
  const toObj = db.cities.find(c => c.name.toLowerCase() === toCity.toLowerCase()) || { lat: 26.8467, lng: 80.9462 };
  const distanceKm = calculateDistanceKm(fromObj.lat, fromObj.lng, toObj.lat, toObj.lng) || 450;

  // Calculate pricing breakdown
  const pricing = estimateDeliveryPricing({
    distanceKm,
    urgency,
    category,
    declaredValue: Number(declaredValue),
    insuranceRequired: insuranceCover
  });

  const pickupOtp = generateOtp();
  const dropoffOtp = generateOtp();
  const sealCode = generateSealCode(fromCity, toCity);
  const deliveryId = `DOC-${Math.floor(10000 + Math.random() * 90000)}`;

  let traveller = null;
  let transportMode = null;
  let transportDetail = null;
  let status = 'requested';

  if (selectedTravellerId) {
    traveller = db.users.find(u => u.id === selectedTravellerId);
    const trip = db.travels.find(t => t.travellerId === selectedTravellerId && t.fromCity.toLowerCase() === fromCity.toLowerCase());
    if (trip) {
      transportMode = trip.transportMode;
      transportDetail = trip.transportDetail;
      trip.capacityAvailable = Math.max(0, trip.capacityAvailable - 1);
    }
    status = 'matched';
  }

  const newDelivery = {
    id: deliveryId,
    title: title || `${category} Document Consignment`,
    category: category || 'Legal Documents',
    weightCategory: weightCategory || 'Standard Envelope (< 250g)',
    envelopeSealCode: sealCode,
    senderId: sender.id,
    senderName: sender.name,
    senderPhone: sender.phone,
    senderAddress: senderAddress || 'Connaught Place, New Delhi',
    recipientName: recipientName || 'Authorized Recipient',
    recipientPhone: recipientPhone || '+91 98000 12345',
    recipientAddress: recipientAddress || 'Main Street, Destination City',
    fromCity,
    toCity,
    distanceKm,
    urgency,
    preferredDeliveryTime: preferredDeliveryTime || 'Today before 6:00 PM',
    notes: notes || 'Hand-carry with tamper-evident seal intact.',
    declaredValue: Number(declaredValue),
    insuranceCover,
    fare: pricing.totalFare,
    payoutTraveller: pricing.travellerPayout,
    platformFee: pricing.platformFee,
    insuranceFee: pricing.insuranceFee,
    status,
    travellerId: traveller ? traveller.id : null,
    travellerName: traveller ? traveller.name : null,
    travellerPhone: traveller ? traveller.phone : null,
    transportMode,
    transportDetail,
    pickupOtp,
    pickupVerifiedAt: null,
    dropoffOtp,
    dropoffVerifiedAt: null,
    proofOfDeliveryUrl: null,
    currentLocation: {
      lat: fromObj.lat,
      lng: fromObj.lng,
      checkpointName: status === 'matched' ? 'Assigned to Traveller - Pickup Pending' : 'Looking for Verified Traveller',
      progressPercent: 5,
      estimatedArrival: `In approx ${pricing.estimatedTransitHours} hours`
    },
    checkpoints: [
      {
        title: 'Delivery Request Created',
        location: fromCity,
        timestamp: new Date().toISOString(),
        completed: true,
        note: `Tamper seal code generated: ${sealCode}. Pickup OTP issued.`
      }
    ],
    createdAt: new Date().toISOString()
  };

  db.deliveries.unshift(newDelivery);

  // Notify sender
  createNotification({
    userId: sender.id,
    title: `Delivery Request Created: ${deliveryId}`,
    message: `Your request for ${fromCity} to ${toCity} is active. Security seal: ${sealCode}. Pickup OTP is ${pickupOtp}.`,
    type: 'success',
    deliveryId
  });

  // If traveller was pre-selected, notify traveller
  if (traveller) {
    createNotification({
      userId: traveller.id,
      title: `New Document Delivery Booking (${deliveryId})`,
      message: `${sender.name} booked you for ${fromCity} -> ${toCity}. Payout: ₹${pricing.travellerPayout}.`,
      type: 'info',
      deliveryId
    });
  }

  res.status(201).json({ success: true, delivery: newDelivery });
});

// Book / Assign Traveller to existing request
app.post('/api/deliveries/:id/book', (req, res) => {
  const { travellerId } = req.body;
  const delivery = db.deliveries.find(d => d.id === req.params.id);
  const traveller = db.users.find(u => u.id === travellerId);

  if (!delivery || !traveller) {
    return res.status(404).json({ success: false, message: 'Delivery or Traveller not found' });
  }

  const trip = db.travels.find(t => t.travellerId === travellerId && t.fromCity.toLowerCase() === delivery.fromCity.toLowerCase());

  delivery.travellerId = traveller.id;
  delivery.travellerName = traveller.name;
  delivery.travellerPhone = traveller.phone;
  delivery.status = 'matched';
  if (trip) {
    delivery.transportMode = trip.transportMode;
    delivery.transportDetail = trip.transportDetail;
    trip.capacityAvailable = Math.max(0, trip.capacityAvailable - 1);
  }

  delivery.checkpoints.push({
    title: 'Matched with Verified Traveller',
    location: delivery.fromCity,
    timestamp: new Date().toISOString(),
    completed: true,
    note: `Assigned to ${traveller.name} (${traveller.badge || 'Verified Courier'}).`
  });

  createNotification({
    userId: delivery.senderId,
    title: `Traveller Assigned (${delivery.id})`,
    message: `${traveller.name} accepted your delivery request from ${delivery.fromCity} to ${delivery.toCity}.`,
    type: 'success',
    deliveryId: delivery.id
  });

  createNotification({
    userId: traveller.id,
    title: `Delivery Assigned (${delivery.id})`,
    message: `You are confirmed for document ${delivery.id}. Collect package from sender using Pickup OTP.`,
    type: 'info',
    deliveryId: delivery.id
  });

  res.json({ success: true, delivery });
});

// 3. Handover Security: Verify Pickup OTP
app.post('/api/deliveries/:id/verify-pickup', (req, res) => {
  const { otp } = req.body;
  const delivery = db.deliveries.find(d => d.id === req.params.id);

  if (!delivery) {
    return res.status(404).json({ success: false, message: 'Delivery not found' });
  }

  if (delivery.pickupOtp !== otp.trim()) {
    return res.status(400).json({ success: false, message: 'Invalid Pickup OTP. Please ask the sender for the 6-digit code shown in their app.' });
  }

  delivery.status = 'in_transit';
  delivery.pickupVerifiedAt = new Date().toISOString();
  delivery.currentLocation.checkpointName = `Departed ${delivery.fromCity} - In Transit via ${delivery.transportMode || 'Express'}`;
  delivery.currentLocation.progressPercent = 30;

  delivery.checkpoints.push({
    title: 'Tamper Seal Verified & Pickup Handover Confirmed',
    location: `${delivery.fromCity} Pickup Point`,
    timestamp: new Date().toISOString(),
    completed: true,
    note: `Pickup OTP verified successfully. Chain-of-custody transferred to traveller ${delivery.travellerName}.`
  });

  createNotification({
    userId: delivery.senderId,
    title: 'Package Handed Over & In Transit',
    message: `Traveller has verified Pickup OTP for ${delivery.id}. Pouch is locked with seal ${delivery.envelopeSealCode}.`,
    type: 'success',
    deliveryId: delivery.id
  });

  res.json({ success: true, delivery, message: 'Pickup OTP verified! Custody transferred.' });
});

// 4. Handover Security: Verify Dropoff OTP & Confirm Delivery
app.post('/api/deliveries/:id/verify-dropoff', (req, res) => {
  const { otp, proofPhotoUrl } = req.body;
  const delivery = db.deliveries.find(d => d.id === req.params.id);

  if (!delivery) {
    return res.status(404).json({ success: false, message: 'Delivery not found' });
  }

  if (delivery.dropoffOtp !== otp.trim()) {
    return res.status(400).json({ success: false, message: 'Invalid Receiver Dropoff OTP. Please verify the 6-digit code with the recipient.' });
  }

  delivery.status = 'delivered';
  delivery.dropoffVerifiedAt = new Date().toISOString();
  delivery.proofOfDeliveryUrl = proofPhotoUrl || 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=500&auto=format&fit=crop&q=80';
  delivery.currentLocation.checkpointName = `Delivered to ${delivery.recipientName} at ${delivery.toCity}`;
  delivery.currentLocation.progressPercent = 100;
  delivery.currentLocation.estimatedArrival = 'Delivered';

  delivery.checkpoints.push({
    title: 'Delivery Handover Complete (Dropoff OTP Verified)',
    location: `${delivery.toCity} Destination`,
    timestamp: new Date().toISOString(),
    completed: true,
    note: `Recipient verified OTP. Tamper seal verified intact. Escrow payout of ₹${delivery.payoutTraveller} released to traveller.`
  });

  // Credit payout to traveller wallet
  const traveller = db.users.find(u => u.id === delivery.travellerId);
  if (traveller) {
    traveller.walletBalance = (traveller.walletBalance || 0) + delivery.payoutTraveller;
    traveller.earningsTotal = (traveller.earningsTotal || 0) + delivery.payoutTraveller;
    traveller.completedDeliveries = (traveller.completedDeliveries || 0) + 1;
  }

  // Notify both
  createNotification({
    userId: delivery.senderId,
    title: 'Document Successfully Delivered! 🎯',
    message: `Consignment ${delivery.id} was handed over to ${delivery.recipientName} in ${delivery.toCity}. Digital receipt available.`,
    type: 'success',
    deliveryId: delivery.id
  });

  createNotification({
    userId: delivery.travellerId,
    title: 'Payout Released: ₹' + delivery.payoutTraveller,
    message: `Delivery ${delivery.id} completed! ₹${delivery.payoutTraveller} credited directly to your DocRoute wallet.`,
    type: 'success',
    deliveryId: delivery.id
  });

  res.json({ success: true, delivery, message: 'Delivery completed and payout released!' });
});

// 5. Update Transit Checkpoint
app.post('/api/deliveries/:id/checkpoint', (req, res) => {
  const { title, location, note, progressPercent } = req.body;
  const delivery = db.deliveries.find(d => d.id === req.params.id);

  if (!delivery) {
    return res.status(404).json({ success: false, message: 'Delivery not found' });
  }

  const cp = {
    title: title || 'Transit Update',
    location: location || delivery.currentLocation.checkpointName,
    timestamp: new Date().toISOString(),
    completed: true,
    note: note || 'On-schedule transit checkpoint.'
  };

  delivery.checkpoints.push(cp);
  if (progressPercent !== undefined) {
    delivery.currentLocation.progressPercent = progressPercent;
  }
  delivery.currentLocation.checkpointName = `${title} (${location})`;

  createNotification({
    userId: delivery.senderId,
    title: `Checkpoint: ${title}`,
    message: `DocRoute ${delivery.id}: ${location}. ${note || ''}`,
    type: 'info',
    deliveryId: delivery.id
  });

  res.json({ success: true, delivery });
});

// 6. Travel Plans (Traveller role)
app.get('/api/travels', (req, res) => {
  const { fromCity, toCity, date } = req.query;
  let list = db.travels;

  if (fromCity) {
    list = list.filter(t => t.fromCity.toLowerCase().includes(fromCity.toLowerCase()));
  }
  if (toCity) {
    list = list.filter(t => t.toCity.toLowerCase().includes(toCity.toLowerCase()));
  }

  res.json({ success: true, travels: list });
});

app.post('/api/travels', (req, res) => {
  const {
    fromCity,
    toCity,
    departureDate,
    departureTime,
    expectedArrivalTime,
    transportMode,
    transportDetail,
    capacityTotal = 3,
    baseFare = 450,
    stops = [],
    notes
  } = req.body;

  const traveller = getCurrentUser();

  const newTrip = {
    id: `trip_${Date.now()}`,
    travellerId: traveller.id,
    travellerName: traveller.name,
    travellerAvatar: traveller.avatar,
    travellerRating: traveller.rating || 5.0,
    travellerTrustScore: traveller.trustScore || 95,
    fromCity,
    fromCode: fromCity.slice(0, 3).toUpperCase(),
    toCity,
    toCode: toCity.slice(0, 3).toUpperCase(),
    departureDate: departureDate || new Date().toISOString().split('T')[0],
    departureTime: departureTime || '09:00',
    expectedArrivalTime: expectedArrivalTime || '14:00',
    transportMode: transportMode || 'Train',
    transportDetail: transportDetail || 'Express Transit',
    capacityTotal: Number(capacityTotal),
    capacityAvailable: Number(capacityTotal),
    baseFare: Number(baseFare),
    status: 'scheduled',
    stops: Array.isArray(stops) ? stops : (stops ? stops.split(',').map(s => s.trim()) : []),
    notes: notes || 'Willing to hand-carry sealed official envelopes.',
    verificationVerified: traveller.kycStatus === 'verified'
  };

  db.travels.unshift(newTrip);

  createNotification({
    userId: traveller.id,
    title: 'Travel Route Published',
    message: `Your route ${fromCity} -> ${toCity} (${transportMode}) is now live for matching delivery requests!`,
    type: 'success'
  });

  res.status(201).json({ success: true, travel: newTrip });
});

// 7. Intelligent Matching Engine API
app.post('/api/matching/find-travellers', (req, res) => {
  const { fromCity, toCity, category = 'Legal Documents', urgency = 'Same Day', declaredValue = 10000 } = req.body;

  if (!fromCity || !toCity) {
    return res.status(400).json({ success: false, message: 'fromCity and toCity are required' });
  }

  const dummyDelivery = { fromCity, toCity, category, urgency };
  
  const matches = db.travels
    .filter(t => t.capacityAvailable > 0)
    .map(trip => {
      const matchDetails = calculateMatchScore(dummyDelivery, trip);
      return {
        ...trip,
        matchScore: matchDetails.score,
        matchReasons: matchDetails.reasons
      };
    })
    .filter(t => t.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore);

  // Pricing estimate
  const fromObj = db.cities.find(c => c.name.toLowerCase() === fromCity.toLowerCase()) || { lat: 28.6139, lng: 77.2090 };
  const toObj = db.cities.find(c => c.name.toLowerCase() === toCity.toLowerCase()) || { lat: 26.8467, lng: 80.9462 };
  const distanceKm = calculateDistanceKm(fromObj.lat, fromObj.lng, toObj.lat, toObj.lng) || 450;
  
  const pricing = estimateDeliveryPricing({
    distanceKm,
    urgency,
    category,
    declaredValue: Number(declaredValue)
  });

  res.json({
    success: true,
    count: matches.length,
    distanceKm,
    pricing,
    matches
  });
});

// 8. KYC Submissions & Admin Review
app.get('/api/verify/kyc', (req, res) => {
  res.json({ success: true, submissions: db.kycSubmissions });
});

app.post('/api/verify/kyc', (req, res) => {
  const { idType, idNumber, documentFrontUrl, selfieUrl } = req.body;
  const user = getCurrentUser();

  const newSub = {
    id: `KYC-2026-${Math.floor(100 + Math.random() * 900)}`,
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    userPhone: user.phone,
    idType: idType || 'Aadhaar Card',
    idNumber: idNumber || 'XXXX-XXXX-7721',
    submittedAt: new Date().toISOString(),
    status: 'pending',
    confidenceScore: 98.7,
    aiAnalysis: 'Facial biometric features match ID card portrait photo. Document checksum valid against government registry simulation.',
    documentFrontUrl: documentFrontUrl || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=500&auto=format&fit=crop&q=80',
    selfieUrl: selfieUrl || user.avatar
  };

  db.kycSubmissions.unshift(newSub);
  user.kycStatus = 'pending';

  createNotification({
    userId: 'user_admin',
    title: 'New Identity Verification Submission',
    message: `${user.name} submitted ${idType} for KYC approval. Confidence: 98.7%`,
    type: 'warning'
  });

  res.status(201).json({ success: true, submission: newSub });
});

app.patch('/api/verify/kyc/:id/review', (req, res) => {
  const { status, remarks } = req.body; // 'approved' or 'rejected'
  const sub = db.kycSubmissions.find(s => s.id === req.params.id);

  if (!sub) {
    return res.status(404).json({ success: false, message: 'Submission not found' });
  }

  sub.status = status;
  sub.reviewRemarks = remarks || (status === 'approved' ? 'Verified by Admin Compliance Desk' : 'Document illegible or rejected');
  sub.reviewedAt = new Date().toISOString();

  const user = db.users.find(u => u.id === sub.userId);
  if (user) {
    user.kycStatus = status;
    if (status === 'approved') {
      user.trustScore = Math.max(95, user.trustScore || 90);
      user.badge = 'Verified Courier';
    }
  }

  createNotification({
    userId: sub.userId,
    title: status === 'approved' ? 'KYC Verification Approved! 🎉' : 'KYC Verification Rejected',
    message: status === 'approved' 
      ? 'Congratulations! Your identity is verified. You can now accept document deliveries and earn on trips.'
      : 'Your submission was not approved. Remarks: ' + sub.reviewRemarks,
    type: status === 'approved' ? 'success' : 'error'
  });

  res.json({ success: true, submission: sub });
});

// 9. Wallet & Earnings
app.get('/api/wallet/:userId', (req, res) => {
  const user = db.users.find(u => u.id === req.params.userId) || getCurrentUser();
  const userDeliveries = db.deliveries.filter(d => d.travellerId === user.id && d.status === 'delivered');

  res.json({
    success: true,
    wallet: {
      userId: user.id,
      balance: user.walletBalance || 0,
      totalEarnings: user.earningsTotal || 0,
      escrowPending: db.deliveries
        .filter(d => d.travellerId === user.id && ['matched', 'in_transit'].includes(d.status))
        .reduce((sum, d) => sum + (d.payoutTraveller || 0), 0),
      completedDeliveriesCount: userDeliveries.length,
      recentPayouts: userDeliveries.slice(0, 5).map(d => ({
        deliveryId: d.id,
        amount: d.payoutTraveller,
        route: `${d.fromCity} → ${d.toCity}`,
        date: d.dropoffVerifiedAt || d.createdAt
      }))
    }
  });
});

app.post('/api/wallet/withdraw', (req, res) => {
  const { amount, upiId } = req.body;
  const user = getCurrentUser();

  const numAmount = Number(amount);
  if (!numAmount || numAmount <= 0 || numAmount > (user.walletBalance || 0)) {
    return res.status(400).json({ success: false, message: 'Invalid or insufficient withdrawal balance' });
  }

  user.walletBalance -= numAmount;

  createNotification({
    userId: user.id,
    title: `Instant Payout Initiated: ₹${numAmount}`,
    message: `Transferred ₹${numAmount} to UPI VPA ${upiId || 'commuter@oksbi'}. Transaction ref: TXN-${Math.floor(100000 + Math.random() * 900000)}.`,
    type: 'success'
  });

  res.json({
    success: true,
    message: `₹${numAmount} transferred to ${upiId || 'UPI handle'}.`,
    newBalance: user.walletBalance
  });
});

// 10. Admin Analytics & Telemetry
app.get('/api/admin/stats', (req, res) => {
  const totalDeliveries = db.deliveries.length;
  const activeDeliveries = db.deliveries.filter(d => ['in_transit', 'matched', 'requested'].includes(d.status)).length;
  const deliveredCount = db.deliveries.filter(d => d.status === 'delivered').length;
  const totalVolume = db.deliveries.reduce((sum, d) => sum + (d.fare || 0), 0);
  const platformRevenue = db.deliveries.reduce((sum, d) => sum + (d.platformFee || 0), 0);
  const activeTravellers = db.users.filter(u => u.role === 'traveller' && u.kycStatus === 'verified').length;
  const pendingKycCount = db.kycSubmissions.filter(k => k.status === 'pending').length;

  res.json({
    success: true,
    stats: {
      totalDeliveries,
      activeDeliveries,
      deliveredCount,
      successRate: '99.8%',
      totalVolume,
      platformRevenue,
      activeTravellers,
      pendingKycCount,
      avgSpeedHours: 4.8,
      tamperRate: '0.00%',
      activeCorridors: ['DEL-LKO (Vande Bharat)', 'BOM-PNQ (Expressway)', 'DEL-CDG (Shatabdi)']
    }
  });
});

// 11. Notifications
app.get('/api/notifications', (req, res) => {
  const user = getCurrentUser();
  const list = db.notifications.filter(n => n.userId === user.id || user.role === 'admin');
  res.json({ success: true, notifications: list });
});

app.post('/api/notifications/mark-read', (req, res) => {
  const user = getCurrentUser();
  db.notifications.forEach(n => {
    if (n.userId === user.id || user.role === 'admin') {
      n.read = true;
    }
  });
  res.json({ success: true, message: 'All notifications marked as read' });
});

// 12. Simulator API (To demo instant live route events for the user)
app.post('/api/simulation/advance', (req, res) => {
  const { deliveryId, step } = req.body;
  const delivery = db.deliveries.find(d => d.id === deliveryId) || db.deliveries[0];

  if (!delivery) {
    return res.status(404).json({ success: false, message: 'Delivery not found' });
  }

  if (step === 'pickup') {
    delivery.status = 'in_transit';
    delivery.pickupVerifiedAt = new Date().toISOString();
    delivery.currentLocation.checkpointName = `Departed ${delivery.fromCity} Station (Train moving)`;
    delivery.currentLocation.progressPercent = 45;
    delivery.checkpoints.push({
      title: 'Demo Fast-Forward: Pickup Confirmed',
      location: delivery.fromCity,
      timestamp: new Date().toISOString(),
      completed: true,
      note: 'Verified with OTP ' + delivery.pickupOtp
    });
  } else if (step === 'midway') {
    delivery.status = 'in_transit';
    delivery.currentLocation.checkpointName = 'Midway Corridor (Speed: 130 km/h)';
    delivery.currentLocation.progressPercent = 75;
    delivery.checkpoints.push({
      title: 'Midway High-Speed Corridor',
      location: 'Route Checkpoint',
      timestamp: new Date().toISOString(),
      completed: true,
      note: 'GPS telemetry continuous. Tamper seal intact.'
    });
  } else if (step === 'deliver') {
    delivery.status = 'delivered';
    delivery.dropoffVerifiedAt = new Date().toISOString();
    delivery.currentLocation.checkpointName = `Delivered at ${delivery.toCity}`;
    delivery.currentLocation.progressPercent = 100;
    delivery.currentLocation.estimatedArrival = 'Completed';
    delivery.checkpoints.push({
      title: 'Demo Fast-Forward: Delivery Complete',
      location: delivery.toCity,
      timestamp: new Date().toISOString(),
      completed: true,
      note: 'Dropoff OTP ' + delivery.dropoffOtp + ' accepted.'
    });
    // credit wallet
    const traveller = db.users.find(u => u.id === delivery.travellerId);
    if (traveller) {
      traveller.walletBalance = (traveller.walletBalance || 0) + delivery.payoutTraveller;
    }
  }

  res.json({ success: true, delivery, message: `Simulated step '${step}' completed.` });
});

// Fallback to React index.html for client-side routing
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(distPath, 'index.html'));
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`DocRoute Express API Server running on http://localhost:${PORT}`);
});
