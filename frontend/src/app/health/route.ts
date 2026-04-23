export async function GET() {
  return Response.json({
    success: true,
    message: 'Frontend service is running',
  });
}
