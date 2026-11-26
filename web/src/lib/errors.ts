/** An error whose message is safe and meant to be shown to the user (Hebrew). */
export class UserError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export function errorResponse(err: unknown) {
  if (err instanceof UserError) {
    return Response.json({ error: err.message }, { status: err.status });
  }
  console.error(err);
  return Response.json(
    { error: "משהו השתבש אצלנו. נסו שוב בעוד רגע ואם זה חוזר, כתבו לנו." },
    { status: 500 },
  );
}
