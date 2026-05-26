<div align="center">

# 🍱 FoodBridge
### Smart Food Donation & Distribution Platform

<p align="center">
  <img src="https://img.shields.io/badge/Build-MERN%20Stack-green?style=for-the-badge" />
  <img src="https://img.shields.io/badge/NGO-Connected-blue?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Food-Donation-orange?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Real--Time-Tracking-success?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Status-Active-brightgreen?style=for-the-badge" />
</p>

<p align="center">
  FoodBridge is a smart food donation and distribution platform that connects restaurants, households, event organizers, NGOs, and volunteers to reduce food waste and help people in need.
</p>

---

</div>

# 📌 Overview

FoodBridge is a **food waste management and donation platform** designed to bridge the gap between surplus food providers and people in need.

The platform enables:

- 🍽️ Food Donation Management  
- 🏢 Restaurant & Event Surplus Tracking  
- 🤝 NGO & Volunteer Coordination  
- 📍 Location-Based Pickup & Delivery  
- 🔔 Real-Time Notifications  
- 📊 Donation Analytics & Tracking  
- 📦 Food Pickup Requests  
- 🧠 Smart Recommendation System

The goal of FoodBridge is to **reduce food wastage, support communities, and ensure surplus food reaches needy people efficiently.**

---

# ✨ Features

## 🍱 Food Donation System
- Donate excess food instantly
- Upload food quantity & details
- Pickup request generation
- Food availability tracking
- Expiry/safety tracking

---

## 🏢 Restaurant & Event Management
- Restaurants can donate surplus food
- Event organizers can list extra food
- Daily donation management
- Donation history tracking

---

## 🤝 NGO & Volunteer Network
- NGOs receive donation requests
- Volunteers assigned for pickup & delivery
- Delivery coordination system
- Request acceptance & status tracking

---

## 📍 Location-Based Tracking
- Nearby donation discovery
- Pickup route management
- Live food tracking
- Real-time status updates

---

## 🔔 Smart Notifications
- New donation alerts
- Pickup reminders
- Delivery updates
- Food availability notifications

---

## 📊 Dashboard & Analytics
- Total food donated
- Donation history
- NGO activity tracking
- Waste reduction insights

---

## 👥 Role-Based Access
### Donor
- Donate food
- Track donations
- View history

### NGO
- Accept requests
- Manage distributions
- View donations

### Volunteer
- Pickup food
- Deliver food
- Update delivery status

### Admin
- Manage platform
- Track users
- Monitor activities

---

# 🏗️ System Architecture

```text
                  ┌──────────────────┐
                  │     Frontend     │
                  │ React + Tailwind │
                  └─────────┬────────┘
                            │
                            ▼
                  ┌──────────────────┐
                  │   Backend APIs   │
                  │ Node.js + Express│
                  └─────────┬────────┘
                            │
         ┌──────────────────┼──────────────────┐
         ▼                  ▼                  ▼
   ┌──────────┐      ┌───────────┐      ┌──────────┐
   │ MongoDB  │      │ Auth/JWT  │      │ Maps API │
   │ Database │      │ Security  │      │ Tracking │
   └──────────┘      └───────────┘      └──────────┘
```

---

# ⚙️ Tech Stack

## Frontend
- React.js
- Tailwind CSS
- React Router DOM
- Axios

## Backend
- Node.js
- Express.js
- JWT Authentication
- REST API

## Database
- MongoDB
- Mongoose

## Additional Services
- Maps API (Location Tracking)
- Notification System
- Cloud Storage (Optional)

## Deployment
- Vercel (Frontend)
- Render / Railway (Backend)
- MongoDB Atlas

---

# 📂 Project Structure

```bash
FoodBridge/
│
├── client/
│   ├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── assets/
│
├── server/
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   ├── config/
│   └── utils/
│
├── README.md
├── package.json
└── .env
```

---

# 🚀 Installation

## 1. Clone Repository

```bash
git clone https://github.com/your-username/foodbridge.git
cd foodbridge
```

## 2. Install Dependencies

### Frontend

```bash
cd client
npm install
```

### Backend

```bash
cd server
npm install
```

---

## 3. Setup Environment Variables

Create a `.env` file inside backend:

```env
PORT=5000
MONGO_URI=your_mongodb_url
JWT_SECRET=your_secret_key
MAPS_API_KEY=your_maps_key
```

---

## 4. Run Application

### Backend

```bash
npm run server
```

### Frontend

```bash
npm start
```

---

# 📷 Screenshots

Add project screenshots here

```md
📌 Login Page  
📌 Dashboard  
📌 Food Donation Form  
📌 NGO Request Page  
📌 Volunteer Tracking  
📌 Analytics Dashboard
```

---

# 🔥 Working Flow

```text
User Login/Register
        ↓
Select Role (Donor / NGO / Volunteer)
        ↓
Donate or Accept Food Request
        ↓
Pickup Request Generated
        ↓
Volunteer Assigned
        ↓
Food Delivered Successfully
        ↓
Donation Status Updated
        ↓
Analytics & Impact Tracking
```

---

# 🌍 Future Enhancements

- 🤖 AI-Based Food Demand Prediction  
- 📍 Live GPS Tracking  
- 📱 Mobile App Support  
- 🌐 Multi-Language Support  
- 🏆 Reward & Volunteer Points System  
- 📦 QR-Based Food Verification  
- 📈 Smart Donation Analytics  

---

# 🤝 Contribution

Contributions are welcome!

1. Fork the repository

2. Create a new branch

```bash
git checkout -b feature-name
```

3. Commit changes

```bash
git commit -m "Added new feature"
```

4. Push changes

```bash
git push origin feature-name
```

5. Open a Pull Request

---

# 📄 License

This project is licensed under the MIT License.

---

# 👨‍💻 Developer

**Haarish Guru**

Built with ❤️ to reduce food waste and help communities.

---

<div align="center">

### ⭐ If you like this project, don't forget to star the repository!

</div>
