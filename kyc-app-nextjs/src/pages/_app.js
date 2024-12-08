import "@/styles/globals.css";
import { KeycloakProvider } from "@/pages/auth/provider/KeycloakProvider";
import { useRouter } from "next/router";

function MyApp({ Component, pageProps }) {
    const router = useRouter();

    // بررسی مسیر فعلی
    const isRegisterPage = router.pathname === "/register";

    return (
        // اگر در صفحه ثبت‌نام هستیم، KeycloakProvider را اعمال نمی‌کنیم
        !isRegisterPage ? (
            <KeycloakProvider>
                <Component {...pageProps} />
            </KeycloakProvider>
        ) : (
            <Component {...pageProps} />
        )
    );
}

export default MyApp;
