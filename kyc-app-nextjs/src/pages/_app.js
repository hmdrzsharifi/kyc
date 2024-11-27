import "@/styles/globals.css";
import {KeycloakProvider} from "@/pages/auth/provider/KeycloakProvider";

function MyApp({ Component, pageProps }) {
  return (
      <KeycloakProvider>
        <Component {...pageProps} />
      </KeycloakProvider>
  );
}
export default MyApp;
