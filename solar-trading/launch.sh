#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
#  P2P Solar Energy Trading — One-command launch script
#  Run this ONCE from inside the solar-trading folder:
#     bash launch.sh
# ═══════════════════════════════════════════════════════════════
set -e

echo ""
echo "═══════════════════════════════════════════════════════"
echo "  P2P Solar Energy Trading — Launch Script"
echo "═══════════════════════════════════════════════════════"

# ── Step 1: Check .env exists ──────────────────────────────────
if [ ! -f ".env" ]; then
  echo ""
  echo "❌  ملف .env غير موجود!"
  echo ""
  echo "  1. افتح Firebase Console → Project Settings → Your apps"
  echo "  2. انسخ قيم الإعدادات"
  echo "  3. أنشئ ملف .env بناءً على .env.example"
  echo ""
  echo "  مثال:"
  echo "     cp .env.example .env"
  echo "     ثم عدّل القيم داخله"
  echo ""
  exit 1
fi
echo "✅  ملف .env موجود"

# ── Step 2: Check service account key ─────────────────────────
if [ ! -f "scripts/serviceAccountKey.json" ]; then
  echo ""
  echo "❌  ملف scripts/serviceAccountKey.json غير موجود!"
  echo ""
  echo "  Firebase Console → Project Settings → Service Accounts"
  echo "  → Generate new private key → احفظ باسم scripts/serviceAccountKey.json"
  echo ""
  exit 1
fi
echo "✅  مفتاح خدمة Firebase موجود"

# ── Step 3: Install dependencies ──────────────────────────────
echo ""
echo "📦  تثبيت الحزم..."
npm install --silent

# ── Step 4: Seed demo users + Firestore data ──────────────────
echo ""
echo "🌱  إنشاء المستخدمين التجريبيين في Firebase..."
node scripts/seedFirestore.js

# ── Step 5: Deploy Firestore security rules ────────────────────
echo ""
echo "🔒  نشر قواعد أمان Firestore..."
npx firebase-tools deploy --only firestore:rules --project p2p-solar-trading-goea

# ── Step 6: Build & start ─────────────────────────────────────
echo ""
echo "🔨  بناء التطبيق..."
npm run build --silent

echo ""
echo "═══════════════════════════════════════════════════════"
echo "  ✅  انتهى! جارٍ تشغيل التطبيق محلياً..."
echo ""
echo "  افتح المتصفح على:  http://localhost:3000"
echo ""
echo "  بيانات الدخول التجريبية:"
echo "    الإيميل:   home1@solar.ly  إلى  home5@solar.ly"
echo "    كلمة المرور: Solar@2024"
echo "═══════════════════════════════════════════════════════"
echo ""
npm start
