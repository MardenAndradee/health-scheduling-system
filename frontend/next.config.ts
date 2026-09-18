import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Repassa /api/* para o backend, por trás dos panos. Sem isso, frontend e
  // backend são origens diferentes pro navegador e o cookie HttpOnly do
  // login não funcionaria em HTTP local (exigiria SameSite=None + HTTPS).
  // Com o proxy, o navegador só conversa com esta origem — o cookie vira
  // "mesmo site" de verdade. BACKEND_URL é lido só no processo do Next
  // (nunca vai pro bundle do navegador), então dá pra apontar para outra
  // porta de backend sem tocar em código.
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.BACKEND_URL || "http://localhost:8080/api"}/:path*`,
      },
    ];
  },
};

export default nextConfig;
