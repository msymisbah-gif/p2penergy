/**
 * Firestore Seed Script — Creates 5 demo homes.
 *
 * This script does TWO things in one command:
 *   1. Creates Firebase Auth users (email + password)
 *   2. Creates Firestore /homes/{uid} documents with the exact
 *      UIDs Firebase assigned — no manual copying needed.
 *
 * ── HOW TO RUN ─────────────────────────────────────────────────────────────
 *   1. Download service account key:
 *      Firebase Console → Project Settings → Service Accounts
 *      → Generate new private key → save as scripts/serviceAccountKey.json
 *   2. npm install -D firebase-admin   (one time)
 *   3. node scripts/seedFirestore.js
 * ───────────────────────────────────────────────────────────────────────────
 *
 * Safe to re-run — existing users are skipped, existing docs are merged.
 *
 * ⚠️  serviceAccountKey.json is in .gitignore — NEVER commit it.
 */

const admin = require('firebase-admin');
const path  = require('path');

const KEY_PATH = path.join(__dirname, 'serviceAccountKey.json');

try {
  const serviceAccount = require(KEY_PATH);
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
} catch {
  console.error('\n❌  لم يتم العثور على ملف serviceAccountKey.json');
  console.error('   → Firebase Console → Project Settings → Service Accounts');
  console.error('   → "Generate new private key" → احفظه باسم scripts/serviceAccountKey.json\n');
  process.exit(1);
}

const db   = admin.firestore();
const auth = admin.auth();
const NOW  = admin.firestore.Timestamp.now();

// ── Demo user definitions ──────────────────────────────────────────────────
// All 5 accounts share the same password for easy thesis demo login.
const DEMO_USERS = [
  {
    email:          'home1@solar.ly',
    password:       'Solar@2024',
    name:           'منزل الشمس — أجدابيا',
    mobile:         '0912345001',
    meterRef:       'MTR-AJ-10001',
    balance:        120.5,
    walletBalance:  350.00,
    totalProduced:  980.0,
    totalConsumed:  620.0,
    totalSold:      180.0,
    totalPurchased:  40.0,
  },
  {
    email:          'home2@solar.ly',
    password:       'Solar@2024',
    name:           'منزل النور — بنغازي',
    mobile:         '0912345002',
    meterRef:       'MTR-BN-10002',
    balance:         85.0,
    walletBalance:  210.50,
    totalProduced:  750.0,
    totalConsumed:  500.0,
    totalSold:       90.0,
    totalPurchased:  60.0,
  },
  {
    email:          'home3@solar.ly',
    password:       'Solar@2024',
    name:           'منزل الأمل — طبرق',
    mobile:         '0912345003',
    meterRef:       'MTR-TB-10003',
    balance:        200.0,
    walletBalance:  500.00,
    totalProduced: 1200.0,
    totalConsumed:  400.0,
    totalSold:      300.0,
    totalPurchased:  20.0,
  },
  {
    email:          'home4@solar.ly',
    password:       'Solar@2024',
    name:           'منزل الفجر — درنة',
    mobile:         '0912345004',
    meterRef:       'MTR-DR-10004',
    balance:         10.0,
    walletBalance:   80.00,
    totalProduced:  300.0,
    totalConsumed:  400.0,
    totalSold:       20.0,
    totalPurchased: 120.0,
  },
  {
    email:          'home5@solar.ly',
    password:       'Solar@2024',
    name:           'منزل السلام — الكفرة',
    mobile:         '0912345005',
    meterRef:       'MTR-KF-10005',
    balance:         50.0,
    walletBalance:  150.00,
    totalProduced:  600.0,
    totalConsumed:  450.0,
    totalSold:       70.0,
    totalPurchased:  50.0,
  },
];

async function seed() {
  console.log('\n🌱  بدء إعداد البيانات التجريبية...\n');
  const batch = db.batch();
  let created = 0;
  let skipped = 0;

  for (const user of DEMO_USERS) {
    const { email, password, name, ...stats } = user;

    // 1) Create (or find existing) Firebase Auth user
    let authUser;
    try {
      authUser = await auth.createUser({ email, password, displayName: name });
      console.log(`  ✅  تم إنشاء المستخدم: ${email}  (${authUser.uid})`);
      created++;
    } catch (err) {
      if (err.code === 'auth/email-already-exists') {
        authUser = await auth.getUserByEmail(email);
        console.log(`  ℹ️   موجود بالفعل:    ${email}  (${authUser.uid})`);
        skipped++;
      } else {
        throw err;
      }
    }

    // 2) Write Firestore document using the real UID
    const homeRef = db.collection('homes').doc(authUser.uid);
    batch.set(homeRef, {
      name,
      ownerEmail:     email,
      mobile:         stats.mobile,
      meterRef:       stats.meterRef,
      balance:        stats.balance,
      walletBalance:  stats.walletBalance,
      totalProduced:  stats.totalProduced,
      totalConsumed:  stats.totalConsumed,
      totalSold:      stats.totalSold,
      totalPurchased: stats.totalPurchased,
      joinedAt:       NOW,
      isActive:       true,
    }, { merge: true });
  }

  await batch.commit();

  console.log('\n────────────────────────────────────────────────────');
  console.log(`  تم إنشاؤهم:   ${created}  |  موجودون مسبقاً: ${skipped}`);
  console.log('  ✅  اكتمل الزرع! تحقق من Firebase Console → Firestore → homes');
  console.log('\n  بيانات تسجيل الدخول للمنازل الخمسة:');
  console.log('  الإيميل: home1@solar.ly  →  home5@solar.ly');
  console.log('  كلمة المرور: Solar@2024');
  console.log('────────────────────────────────────────────────────\n');

  process.exit(0);
}

seed().catch((err) => {
  console.error('\n❌  فشل الزرع:', err.message, '\n');
  process.exit(1);
});
