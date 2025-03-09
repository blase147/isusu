import { useEffect, useState } from "react";

export default function ActivitiesList() {
  interface Activity {
    name: string;
    date: string;
  }

  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/activityList")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        setActivities(data);
        setLoading(false);
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading activities...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-2">Activities List</h2>
      <ul>
        {activities.map((activity, index) => (
          <li key={index} className="border-b py-2">
            {activity.name} - {activity.date}
          </li>
        ))}
      </ul>
    </div>
  );
}
