export type UserRole = 'sender' | 'traveller' | 'admin';

export type KYCStatus = 'pending' | 'verified' | 'rejected' | 'none';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  phone: string;
  avatar: string;
  city: string;
  kycStatus: KYCStatus;
  trustScore: number;
  company?: string;
  memberSince?: string;
  totalDeliveries?: number;
  completedTrips?: number;
  completedDeliveries?: number;
  rating?: number;
  idProofType?: string;
  idProofNumber?: string;
  bio?: string;
  badge?: string;
  earningsTotal?: number;
  walletBalance?: number;
}

export interface City {
  id: string;
  name: string;
  state: string;
  code: string;
  lat: number;
  lng: number;
}

export interface Checkpoint {
  title: string;
  location: string;
  timestamp: string | null;
  completed: boolean;
  note: string;
}

export type DeliveryStatus = 
  | 'requested'
  | 'matched'
  | 'pickup_pending'
  | 'in_transit'
  | 'arriving'
  | 'delivered'
  | 'cancelled';

export interface Delivery {
  id: string;
  title: string;
  category: string;
  weightCategory: string;
  envelopeSealCode: string;
  senderId: string;
  senderName: string;
  senderPhone: string;
  senderAddress: string;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  fromCity: string;
  toCity: string;
  distanceKm: number;
  urgency: 'Urgent' | 'Same Day' | 'Next Day' | 'Flexible';
  preferredDeliveryTime: string;
  notes: string;
  declaredValue: number;
  insuranceCover: boolean;
  fare: number;
  payoutTraveller: number;
  platformFee: number;
  insuranceFee: number;
  status: DeliveryStatus;
  travellerId: string | null;
  travellerName: string | null;
  travellerPhone: string | null;
  transportMode: 'Train' | 'Flight' | 'Bus' | 'Car' | null;
  transportDetail: string | null;
  pickupOtp: string;
  pickupVerifiedAt: string | null;
  dropoffOtp: string;
  dropoffVerifiedAt: string | null;
  proofOfDeliveryUrl: string | null;
  currentLocation: {
    lat: number;
    lng: number;
    checkpointName: string;
    progressPercent: number;
    estimatedArrival: string;
  };
  checkpoints: Checkpoint[];
  createdAt: string;
}

export interface TravelPlan {
  id: string;
  travellerId: string;
  travellerName: string;
  travellerAvatar: string;
  travellerRating: number;
  travellerTrustScore: number;
  fromCity: string;
  fromCode: string;
  toCity: string;
  toCode: string;
  departureDate: string;
  departureTime: string;
  expectedArrivalTime: string;
  transportMode: 'Train' | 'Flight' | 'Bus' | 'Car';
  transportDetail: string;
  capacityTotal: number;
  capacityAvailable: number;
  baseFare: number;
  status: 'scheduled' | 'in_transit' | 'completed' | 'cancelled';
  stops: string[];
  notes: string;
  verificationVerified: boolean;
  matchScore?: number;
  matchReasons?: string[];
}

export interface KYCSubmission {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  idType: string;
  idNumber: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  confidenceScore: number;
  aiAnalysis: string;
  documentFrontUrl: string;
  selfieUrl: string;
  reviewRemarks?: string;
  reviewedAt?: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
  deliveryId?: string | null;
}

export interface WalletData {
  userId: string;
  balance: number;
  totalEarnings: number;
  escrowPending: number;
  completedDeliveriesCount: number;
  recentPayouts: Array<{
    deliveryId: string;
    amount: number;
    route: string;
    date: string;
  }>;
}

export interface AdminStats {
  totalDeliveries: number;
  activeDeliveries: number;
  deliveredCount: number;
  successRate: string;
  totalVolume: number;
  platformRevenue: number;
  activeTravellers: number;
  pendingKycCount: number;
  avgSpeedHours: number;
  tamperRate: string;
  activeCorridors: string[];
}
