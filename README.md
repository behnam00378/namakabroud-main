# سیستم مدیریت نگهبانان

این پروژه یک API برای مدیریت نگهبانان، مناطق، شیفت‌ها و مرخصی‌ها است.

## نصب و راه‌اندازی

```bash
# نصب وابستگی‌ها
npm install

# اجرای برنامه در محیط توسعه
npm run dev

# اجرای برنامه در محیط تولید
npm start
```

## متغیرهای محیطی

فایل `.env` را در پوشه اصلی پروژه ایجاد کنید و متغیرهای زیر را تنظیم کنید:

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/guardManagementSystem
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
```

## API های اصلی

### احراز هویت

- `POST /api/auth/register` - ثبت نام نگهبان جدید
- `POST /api/auth/login` - ورود به سیستم
- `GET /api/auth/logout` - خروج از سیستم
- `GET /api/auth/me` - دریافت اطلاعات کاربر فعلی

### نگهبانان

- `GET /api/guards` - دریافت لیست همه نگهبانان
- `GET /api/guards/:id` - دریافت اطلاعات یک نگهبان
- `POST /api/guards` - ایجاد نگهبان جدید
- `PUT /api/guards/:id` - به‌روزرسانی اطلاعات نگهبان
- `DELETE /api/guards/:id` - حذف نگهبان

### مناطق

- `GET /api/areas` - دریافت لیست همه مناطق
- `GET /api/areas/:id` - دریافت اطلاعات یک منطقه
- `POST /api/areas` - ایجاد منطقه جدید
- `PUT /api/areas/:id` - به‌روزرسانی اطلاعات منطقه
- `DELETE /api/areas/:id` - حذف منطقه

### شیفت‌ها

- `GET /api/shifts` - دریافت لیست همه شیفت‌ها
- `GET /api/shifts/:id` - دریافت اطلاعات یک شیفت
- `POST /api/shifts` - ایجاد شیفت جدید
- `PUT /api/shifts/:id` - به‌روزرسانی اطلاعات شیفت
- `DELETE /api/shifts/:id` - حذف شیفت
- `POST /api/shifts/generate-shifts` - تولید خودکار شیفت‌های یک هفته
- `GET /api/shifts/guard/:guardId` - دریافت شیفت‌های یک نگهبان
- `GET /api/shifts/area/:areaId` - دریافت شیفت‌های یک منطقه

### مرخصی‌ها

- `GET /api/leaves` - دریافت لیست همه مرخصی‌ها
- `GET /api/leaves/:id` - دریافت اطلاعات یک مرخصی
- `POST /api/leaves` - ثبت درخواست مرخصی جدید
- `PUT /api/leaves/:id` - به‌روزرسانی اطلاعات مرخصی
- `DELETE /api/leaves/:id` - حذف درخواست مرخصی
- `POST /api/leaves/:id/handle` - رسیدگی به درخواست مرخصی (تأیید یا رد)
- `GET /api/leaves/:id/replacement-options` - دریافت گزینه‌های نگهبان جایگزین
- `GET /api/leaves/guard/:guardId` - دریافت مرخصی‌های یک نگهبان

## قوانین شیفت

- هر نگهبان 8 ساعت در روز کار می‌کند.
- در هر منطقه، در 24 ساعت، 3 نگهبان شیفت عوض می‌کنند.
- شیفت‌ها شامل:
  - صبح: 7 صبح تا 3 بعد از ظهر
  - بعد از ظهر: 3 بعد از ظهر تا 11 شب
  - شب: 11 شب تا 7 صبح
- شیفت‌ها هفتگی و از شنبه تا پنجشنبه الگوی ثابتی دارند، اما جمعه تغییر می‌کنند:
  - اگر شنبه تا پنجشنبه صبح باشد، جمعه شب می‌شود.
  - اگر شنبه تا پنجشنبه شب باشد، جمعه بعد از ظهر می‌شود.
  - اگر شنبه تا پنجشنبه بعد از ظهر باشد، جمعه صبح می‌شود.

## سیستم مرخصی

- نگهبان می‌تواند درخواست مرخصی بدهد (با تاریخ شروع و پایان).
- وضعیت مرخصی می‌تواند "در انتظار"، "تأیید شده" یا "رد شده" باشد.
- اگر مرخصی تأیید شود، یک نگهبان جایگزین برای شیفت‌های آن زمان تعیین می‌شود.
- وقتی مرخصی تأیید می‌شود، شیفت‌های نگهبان در بازه مرخصی به نگهبان جایگزین منتقل می‌شود.

## تکنولوژی‌ها

- Node.js
- Express.js
- MongoDB و Mongoose
- JWT برای احراز هویت
- moment-jalaali برای مدیریت تاریخ شمسی 