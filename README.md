# Ederaxy Backend Server

A scalable, secure backend for a Rwanda-aligned learning platform that combines **video streaming** with a **structured LMS**. Built to support **teachers**, **students**, and **curriculum-first education** without compromising performance or data integrity.

---

## Project's Main Vision

- Model Rwanda’s academic curriculum cleanly
- Give teachers YouTube-level video delivery
- Let students learn, resume, and prove progress
- Keep the backend secure, observable, and scalable from day one

---

## PHASE 0 = Foundation & App Hygiene {COMPLETED}

### Goal

Get a **stable, secure Express core** that everything else plugs into.

### What to do

- Load environment variables early
- Initialize Express
- Attach global middleware
- Centralize error handling
- Prepare logging

## PHASE 1 = Authentication & role system {COMPLETED}

### Goal

Secure the platform and separate teachers from students.

### What to do

1. Design user identity
2. Implement password security
3. Issue JWTs
4. Protect routes
5. Enforce roles

### Outcome

1. Users can login/register
2. Role-based access works
3. Security foundation locked

# PHASE 2 = Curriculum & learning structure

### Goal

Model **Rwanda’s education flow** cleanly. PLus all the eeducation taxonomy

### What to do

1. Define academic hierarchy
2. Lock ownership to teachers
3. Allow students to read only
4. improved replica of Rwanda's education taxonomy

### Outcome

- Curriculum fully navigable
- Lessons ready to accept videos

# PHASE 3 = Video upload & processing (CRITICAL PHASE) {COMPLETED}

### Goal

Achieving **streaming quality** without killing the main server.

### expectations

1. Accept uploads safely
2. Queue heavy processing
3. Transcode into HLS
4. Store results
5. Update DB state
