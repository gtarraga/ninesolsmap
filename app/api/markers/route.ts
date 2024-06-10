import { createClient } from "@/lib/supabase/supabase-server-side";

export async function GET (
    _req: Request,
    { params }: { params: { data: string[] } }
  ) {
    try {
        const supabase = createClient()
        const { data, error } = await supabase.from("markers").select("*");

        if(error) {
          console.log(error.message);
          return new Response(`${error}`, { status: 500 });
        }

        return new Response(JSON.stringify(data), { status: 200 })

    } catch (error) {
        return new Response("Internal Server Error", { status: 500 });
    }
}