# Changelog

## [Feature] Profile picture upload (Auth)

- **Endpoint:** `POST /api/v1/auth/me/profile-picture`
- **Auth:** Bearer token
- **Body:** `multipart/form-data` with field `profilePicture`
- **Storage:** `STORAGE_PATH/profile-pictures/<userId>/profile.<ext>`
- **DB:** Updates `User.profilePicture` with public `/storage/...` URL
- **Middleware:** `src/middleware/profilePictureUpload.middleware.js` (multer, 10 MB limit, jpeg/png/webp/gif)
- **Service:** `uploadProfilePicture` in `src/services/auth.service.js`
- **Controller:** `uploadMyProfilePicture` in `src/controllers/auth.controller.js`
- **Route:** Added to `src/routes/auth.routes.js`

---

## [Feature] Extended User profile fields (registration)

- **Model:** `src/models/user.model.js`
  - Added: `phone`, `teacherTitle`, `yearsExperience`, `highestQualification`, `subjects`, `schoolName`, `schoolType`, `country`, `city`, `preferredCurriculumId`, `agreedToTermsAt`, `termsVersion`
- **Validation:** `src/validations/auth.validation.js` – extended `registerSchema` with optional teacher profile fields
- **Service:** `src/services/auth.service.js` – maps `agreeToTerms` to `agreedToTermsAt` and includes new fields in `toPublicUser`
- **Docs:** Updated `instruction.md` with examples for teacher registration payload

---

## [Feature] Lesson video thumbnail upload

- **Endpoint:** `POST /api/v1/lessons/:lessonId/video/thumbnail`
- **Auth:** Bearer token (teacher)
- **Body:** `multipart/form-data` with field `thumbnail`
- **Storage:** `STORAGE_PATH/thumbnails/<videoId>/thumbnail.<ext>`
- **DB:** Added `Video` fields: `thumbnailPath`, `thumbnailUrl`, `thumbnailMimeType`, `thumbnailSize`
- **Middleware:** `src/middleware/thumbnailUpload.middleware.js`
- **Service:** `uploadLessonVideoThumbnail` in `src/services/video.service.js`
- **Controller:** `uploadVideoThumbnail` in `src/controllers/lesson.controller.js`
- **Route:** Added to `src/routes/lesson.route.js`
- **Response:** Returns `data.video.thumbnailUrl`

---

## [Feature] Consolidated API documentation

- **File:** `instruction.md`
  - Section 12: Consolidated endpoint reference (auth, lessons, static assets)
  - Section 13: Model-by-model API routes (curriculums, academic levels/classes, class combinations, subjects, courses, lessons)
  - Includes auth requirements, request bodies, query params, and key response fields
  - Calls out required multipart field names (`video`, `thumbnail`, `profilePicture`)

---

## [Fix] Mongoose pre-save/validate hooks (`next is not a function`)

- **File:** `src/models/user.model.js`
  - Changed `pre("validate")` to async/promise style (no `next` argument)
  - Changed `pre("save")` to async/promise style (no `next` argument)
  - Fixes crashes during user registration and profile picture uploads

---

## [Fix] Auth middleware regression (GET requests hanging)

- **File:** `src/middleware/auth.middleware.js`
  - Restored `return next()` at end of `optionalAuthenticate`
  - Fixes endless loading for all routes using optional auth (e.g., `GET /api/v1/curriculums`)

---

## [Infrastructure] Storage helpers for profile pictures

- **File:** `src/utils/storage.js`
  - Added `getProfilePicturesDir()`, `ensureProfilePicturesFolder()`, `getRelativeProfilePicturePath()`
  - Integrated into `ensureBaseStorage()` so the directory is created on startup

---

## [Docs] Updated frontend integration notes

- **File:** `instruction.md`
  - Added step-by-step flow for video + thumbnail upload
  - Added explicit field names and returned URL fields (`hlsMasterPlaylistPath`, `thumbnailUrl`)

---

## [Note] Existing behavior retained

- All existing endpoints and validations remain unchanged.
- New fields are optional; existing users and data are unaffected.
- Static serving under `/storage` already covers uploads, HLS, thumbnails, and profile pictures.

---

_Prepared for frontend team integration._
