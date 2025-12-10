import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export const supabaseServer = async () => {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    {
      cookies: {
        get: (key: string) => cookieStore.get(key)?.value,
        set: (key: string, value: string, options: any) => {
          try {
            cookieStore.set({ name: key, value, ...options });
          } catch (error) {
            // encoding error, ignore
          }
        },
        remove: (key: string, options: any) => {
          try {
            cookieStore.set({ name: key, value: "", ...options, maxAge: 0 });
          } catch (error) {
            // encoding error, ignore
          }
        },
      },
    },
  );
};

