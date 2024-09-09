import { Link } from "@remix-run/react";

export function Navbar() {
  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">
          CommitToday
        </Link>
        <ul className="flex space-x-4">
          <li>
            <Link to="/" className="hover:text-gray-300">
              ホーム
            </Link>
          </li>
          <li>
            <Link to="/tasks" className="hover:text-gray-300">
              タスク
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
