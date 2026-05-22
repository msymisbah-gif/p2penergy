/**
 * Firestore Seed Script — 5 Demo Homes
 * Schema: Database Schema 3.7.1
 *
 * Usage:
 *   1. Set FIREBASE_PROJECT_ID in your .env or export it
 *   2. node scripts/seedFirestore.js
 *
 * Requires: firebase-admin  →  npm install -D firebase-admin
 * Requires: A service account key at scripts/serviceAccountKey.json
 */

const admin = require('firebase-admin');
const path  = require('path');

const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'serviceAccountKey.json');

let serviceAccount;
try {
  serviceAccount = require(SERVICE_ACCOUNT_PATH);
} catch {
  console.error('❌  لم يتم العثور على ملف serviceAccountKey.json في مجلد scripts/');
  console.error('    قم بتحميله من Firebase Console → Project Settings → Service Accounts');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const NOW = admin.firestore.Timestamp.now();

/**
 * Demo homes — each maps to a real Firebase Auth user.
 * Replace `uid` values with the actual UIDs after creating
 * the users in Firebase Authentication.
 */
const DEMO_HOMES = [
  {
    uid: 'demo-uid-home-001',
    name:            'منزل الشمس — أجدابيا',
    ownerEmail:      'home1@solar.ly',
    balance:         120.5,   // kWh currently available
    walletBalance:   350.00,  // LYD
    totalProduced:   980.0,
    totalConsumed:   620.0,
    totalSold:       180.0,
    totalPurchased:   40.0,
    joinedAt:        NOW,
    isActive:        true,
  },
  {
    uid: 'demo-uid-home-002',
    name:            'منزل النور — بنغازي',
    ownerEmail:      'home2@solar.ly',
    balance:         85.0,
    walletBalance:   210.50,
    totalProduced:   750.0,
    totalConsumed:   500.0,
    totalSold:        90.0,
    totalPurchased:   60.0,
    joinedAt:        NOW,
    isActive:        true,
  },
  {
    uid: 'demo-uid-home-003',
    name:            'منزل الأمل — طبرق',
    ownerEmail:      'home3@solar.ly',
    balance:         200.0,
    walletBalance:   500.00,
    totalProduced:  1200.0,
    totalConsumed:   400.0,
    totalSold:       300.0,
    totalPurchased:   20.0,
    joinedAt:        NOW,
    isActive:        true,
  },
  {
    uid: 'demo-uid-home-004',
    name:            'منزل الفجر — دبرة',
    ownerEmail:      'home4@solar.ly',
    balance:          10.0,
    walletBalance:    80.00,
    totalProduced:   300.0,
    totalConsumed:   400.0,
    totalSold:        20.0,
    totalPurchased:  120.0,
    joinedAt:        NOW,
    isActive:        true,
  },
  {
    uid: 'demo-uid-home-005',
    name:            'منزل السلام — الكفرة',
    ownerEmail:      'home5@solar.ly',
    balance:         50.0,
    walletBalance:   150.00,
    totalProduced:   600.0,
    totalConsumed:   450.0,
    totalSold:        70.0,
    totalPurchased:   50.0,
    joinedAt:        NOW,
    isActive:        true,
  },
];

async function seed() {
  console.log('🌱  بدء زرع البيانات التجريبية في Firestore...\n');
  const batch = db.batch();

  for (const home of DEMO_HOMES) {
    const { uid, ...data } = home;
    const ref = db.collection('homes').doc(uid);
    batch.set(ref, data, { merge: true });
    console.log(`  ✅  ${data.name}  (${uid})`);
  }

  await batch.commit();
  console.log('\n🎉  تم الزرع بنجاح! تحقق من Firebase Console → Firestore → homes');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌  فشل الزرع:', err.message);
  process.exit(1);
});
