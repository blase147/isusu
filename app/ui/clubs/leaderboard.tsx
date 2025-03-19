import { useEffect, useState } from "react";

export default function Leaderboard() {
  interface Leader {
    name: string;
    contributions: number;
  }

  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/isusu/leaderboard") // ✅ Fixed API endpoint
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        setLeaders(data.leaderboard); // ✅ Corrected data extraction
        setLoading(false);
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading leaderboard...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-2">Leaderboard</h2>
      <ul>
        {leaders.map((leader, index) => (
          <li key={index} className="border-b py-2">
            {leader.name} - {leader.contributions} contributions
          </li>
        ))}
      </ul>
    </div>
  );
}
