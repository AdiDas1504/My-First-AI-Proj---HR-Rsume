import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page grid min-h-[60vh] place-items-center py-16 text-center">
      <div>
        <p className="font-display text-7xl font-bold text-forest">404</p>
        <h1 className="mt-4 text-3xl">העמוד לא נמצא</h1>
        <p className="mt-2 text-muted">אולי הקישור ישן, או שהגרסה נמחקה.</p>
        <Link href="/" className="btn btn-primary mt-8">
          לעמוד הבית
        </Link>
      </div>
    </div>
  );
}
