export default function UserDashboard() {
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <h1 className="text-2xl font-bold mb-4">User Dashboard</h1>
      <p className="text-slate-600">Normal user landing area – extend as needed.</p>
      <button onClick={() => { localStorage.clear(); window.location = "/login"; }} className="mt-6 px-4 py-2 bg-rose-600 text-white rounded">Logout</button>
    </div>
  );
}
