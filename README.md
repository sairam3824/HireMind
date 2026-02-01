# HireMind 🚀

**HireMind** is a cutting-edge, AI-powered job aggregation and career management platform designed to revolutionize how job seekers find their next opportunity. By leveraging advanced machine learning for resume analysis and a sleek, modern interface, HireMind bridges the gap between talent and opportunity.

**Live Demo:** [hiremind.saiii.in](https://hiremind.saiii.in)

![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-16.1-black)
![React](https://img.shields.io/badge/React-19.2-blue)
![Supabase](https://img.shields.io/badge/Supabase-Database-green)

---

## 🌟 Key Features

### 🧠 AI-Powered Resume Scanner
- **Instant Analysis**: Upload your resume (PDF) and get immediate feedback.
- **ATS Scoring**: Receive a calculated Applicant Tracking System (ATS) score to see how well your resume parses.
- **Role Prediction**: Our AI predicts the job roles you are best suited for based on your skills and experience.
- **Detailed Insights**: Get granular breakdown of your score (Education, Skills, Experience, Formatting) and actionable tips for improvement.

### 🔍 Intelligent Job Search
- **Data-Driven Listings**: Access a curated database of active job listings.
- **Advanced Filtering**: Filter by role, location, job type, and more.
- **Real-Time Availability**: Listings are updated regularly to ensure relevance.

### 🏢 Company Insights
- **Deep Dives**: Explore profiles of top tech companies.
- **Culture & Stack**: Learn about company cultures and technology stacks before you apply.

### 📊 Performance Dashboard
- **Progress Tracking**: Monitor your resume scores over time.
- **History**: Keep a log of all your resume scans and improvements.
- **Visual Analytics**: Easy-to-read charts and indicators for your career progress.

### 🔐 Secure & Modern
- **Authentication**: Secure user management via Supabase Auth.
- **Privacy First**: Your data is yours. We prioritize user privacy and data security.
- **Responsive Design**: A fully responsive, mobile-first experience built with modern CSS and layouts.

---

## 🛠 Tech Stack

### Frontend
- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Language**: TypeScript
- **Styling**: Vanilla CSS Modules (Scoped, Performant)
- **Icons**: Lucide React
- **Animations**: CSS Transitions & Micro-interactions

### Backend & Data
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Authentication**: Supabase Auth
- **Resume Parser**: Python Microservice (FastAPI/Flask equivalent)
- **Scraper**: Custom Python scripts for job agglomeration

### DevOps
- **Containerization**: Docker (for Resume Matcher service)
- **Deployment**: Vercel (Frontend), AWS (Resume Matcher)
- **Version Control**: Git

---

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites
- **Node.js** (v18+)
- **Python** (v3.8+)
- **Docker** (Optional, for running the Resume Parser locally)
- **Supabase Account**

### Installation

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/sairam3824/HireMind.git
    cd HireMind
    ```

2.  **Frontend Setup**
    Navigate to the frontend folder and install dependencies:
    ```bash
    cd frontend
    npm install
    ```

3.  **Environment Variables**
    Create a `.env.local` file in the `frontend` directory:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    NEXT_PUBLIC_RESUME_PARSER_URL=http://localhost:8000
    ```

4.  **Backend Setup (Optional)**
    If you wish to run the scraper or parser locally:
    ```bash
    # From root directory
    pip install -r requirements.txt
    python run_jobs_supabase.py # To populate initial job data
    ```

5.  **Run the Application**
    ```bash
    # In frontend directory
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 📂 Project Structure

```bash
HireMind/
├── frontend/                # Next.js Application
│   ├── src/
│   │   ├── app/             # App Router Pages & Layouts
│   │   ├── components/      # Reusable UI Components
│   │   ├── lib/             # Utilities (Supabase client, etc.)
│   └── public/              # Static Assets
├── resume-matcher/          # Python Resume Parsing Service
│   ├── Dockerfile           # Container config
│   └── ...
├── scripts/                 # Utility scripts (SQL, Python)
├── LICENSE                  # Apache 2.0 License
└── README.md                # Project Documentation
```

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## 🛡 License

Distributed under the Apache License 2.0. See `LICENSE` for more information.

**Copyright © 2026 Sairam Maruri**

---

## 📞 Contact

**Sairam Maruri** - Full Stack Developer

- **Portfolio**: [saiii.in](https://saiii.in)
- **LinkedIn**: [linkedin.com/in/sairam-maruri](https://linkedin.com/in/sairam-maruri)
- **GitHub**: [github.com/sairam3824](https://github.com/sairam3824)
- **Email**: [sairam.maruri@gmail.com](mailto:sairam.maruri@gmail.com)

Project Link: [https://github.com/sairam3824/HireMind](https://github.com/sairam3824/HireMind)
