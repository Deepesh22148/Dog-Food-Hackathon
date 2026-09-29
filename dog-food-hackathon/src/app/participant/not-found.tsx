import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ textAlign: "center", padding: "50px" }}>
      <h2>404 - Page Not Found</h2>
      <p>The page you are looking for does not exist. this is from the participant</p>
      <Link href="/participant/welcome-home">Return Home</Link>
    </div>
  );
}