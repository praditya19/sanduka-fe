import { BASE_URL } from "@/app/_utils/GlobalApi";

export async function PATCH(request, { params }) {
  const backendUrl = new URL(
    `/api/sidebar-gallery/${encodeURIComponent(params.id)}/toggle-terlewat`,
    BASE_URL,
  );
  backendUrl.search = new URL(request.url).search;

  const backendResponse = await fetch(backendUrl, {
    method: "PATCH",
    headers: {
      Accept: "application/json",
    },
  });

  return new Response(await backendResponse.text(), {
    status: backendResponse.status,
    headers: {
      "Content-Type":
        backendResponse.headers.get("content-type") ?? "application/json",
    },
  });
}
