"use client";

import TripPlanner from '../components/TripPlanner';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <TripPlanner />
    </main>
  );
}