import { AxiosInstance, isAxiosError } from "axios";
import { URL } from "url";
import { ITaraLoginResult } from "./types/ITaraLoginResult";
import { parseBetween } from "./utils/parseBetween";
import { ITaraInitSessionResult } from "./types/ITaraInitSessionResult";
import { IPollResult } from "./types/IPollResult";

class TaraError extends Error {
    constructor(message: string, options?: { cause: unknown }) {
        super(message);
        this.name = this.constructor.name;
    }
}

class TaraSessionError extends TaraError {
    constructor(message: string, options?: { cause: unknown }) {
        super(message, options);
    }
}

class TaraLoginError extends TaraError {
    constructor(message: string, public responseBody?: unknown, options?: { cause: unknown }) {
        super(message, options);
    }
}

class TaraPollingError extends TaraError {
    constructor(message: string, public status?: string, options?: { cause: unknown }) {
        super(message, options);
    }
}

export class Tara {
    private readonly SMART_ID_INIT_ENDPOINT = "https://tara.ria.ee/auth/sid/init";
    private readonly SMART_ID_POLL_ENDPOINT = "https://tara.ria.ee/auth/sid/poll";
    private readonly AUTH_ACCEPT_ENDPOINT = "https://tara.ria.ee/auth/accept";

    private currentSession: { capturedCsrf: string; controlCode?: string } | null = null;

    constructor(private sessionInitializationUrl: string, private httpClient: AxiosInstance, private beQuiet: boolean = true) { }

    private log(level: "info" | "error", message: string, context: Record<string, unknown> = {}): void {
        if (this.beQuiet) return;
        const timestamp = new Date().toISOString();
        console[level](JSON.stringify({ timestamp, level, message, context }));
    }

    private async initializeSession(): Promise<{ capturedCsrf: string }> {
        try {
            const response = await this.httpClient.get(this.sessionInitializationUrl, {
                maxRedirects: 10,
            });

            const htmlBody: string = response.data;
            const csrfToken = parseBetween(htmlBody, `name="_csrf" value="`, `"`);

            if (!csrfToken) {
                throw new TaraSessionError("CSRF token not found in the response body.");
            }

            this.log("info", "TARA session initialized successfully.");
            return { capturedCsrf: csrfToken };
        } catch (error) {
            this.log("error", "Failed to initialize TARA session.", {
                endpoint: this.sessionInitializationUrl,
                error: error instanceof Error ? error.message : String(error),
            });
            throw new TaraSessionError("Failed to initialize a TARA session.", { cause: error });
        }
    }

    private async pollAuthenticationStatus(): Promise<IPollResult> {
        try {
            const response = await this.httpClient.get(this.SMART_ID_POLL_ENDPOINT);
            return response.data;
        } catch (error) {
            this.log("error", "Polling for authentication status failed.", {
                endpoint: this.SMART_ID_POLL_ENDPOINT,
                error: error instanceof Error ? error.message : String(error),
            });
            throw new TaraPollingError("Polling request failed.", undefined, { cause: error });
        }
    }

    private async acceptAuthentication(): Promise<string> {
        if (!this.currentSession?.capturedCsrf) {
            throw new TaraSessionError("Cannot accept authentication without a valid session and CSRF token.");
        }

        try {
            const response = await this.httpClient.post(this.AUTH_ACCEPT_ENDPOINT, `_csrf=${this.currentSession.capturedCsrf}`, {
                maxRedirects: 10,
            });

            const finalUrlString = response.request?.res?.responseUrl;
            if (!finalUrlString) {
                throw new TaraError("Could not determine the final URL after redirects to parse the token.");
            }

            const finalUrl = new URL(finalUrlString);
            const token = finalUrl.searchParams.get("token");

            if (!token) {
                this.log("error", "Token parameter not found in the final redirect URL.", { finalUrl: finalUrlString });
                throw new TaraError("Authentication token not found in the redirect URL.");
            }

            this.log("info", "Authentication accepted successfully and token captured.");
            return token;
        } catch (error) {
            let errorMessage = "Failed to accept authentication.";
            if (isAxiosError(error) && error.response?.status === 429) {
                errorMessage = "Authentication acceptance failed due to rate limiting (429).";
            }

            this.log("error", errorMessage, {
                endpoint: this.AUTH_ACCEPT_ENDPOINT,
                error: error instanceof Error ? error.message : String(error),
            });

            throw new TaraError(errorMessage, { cause: error });
        }
    }

    public async loginViaSmartID(nationalIdentityNumber: string): Promise<{ controlCode: string }> {
        try {
            this.currentSession = await this.initializeSession();

            const requestBody = `_csrf=${this.currentSession.capturedCsrf}&idCode=${nationalIdentityNumber}`;
            const response = await this.httpClient.post(this.SMART_ID_INIT_ENDPOINT, requestBody);
            const htmlBody = response.data;

            const controlCode = parseBetween(htmlBody, `<p class="control-code">`, `<`);
            const newCsrfToken = parseBetween(htmlBody, `name="_csrf" value="`, `"`);

            if (!controlCode || !newCsrfToken) {
                throw new TaraLoginError("Could not parse control code or new CSRF token from the login initiation response.");
            }

            this.currentSession.capturedCsrf = newCsrfToken;
            this.currentSession.controlCode = controlCode;

            this.log("info", "Smart-ID login initiated successfully.", { nationalIdentityNumber });
            return { controlCode };
        } catch (error) {
            const responseBody = isAxiosError(error) ? error.response?.data : undefined;
            this.log("error", "Smart-ID login failed.", {
                nationalIdentityNumber,
                error: error instanceof Error ? error.message : String(error),
                responseBody,
            });

            throw new TaraLoginError("An error occurred during Smart-ID login.", responseBody, { cause: error });
        }
    }

    public async waitForAuthentication(): Promise<string> {
        this.log("info", "Starting to poll for authentication completion.");
        const pollingIntervalMs = 3000;
        const maxAttempts = 20;

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            const pollResult = await this.pollAuthenticationStatus();

            switch (pollResult.status) {
                case "COMPLETED":
                    this.log("info", "Polling status is COMPLETED. Accepting authentication.");
                    const token = await this.acceptAuthentication();
                    return token;

                case "PENDING":
                    await new Promise(resolve => setTimeout(resolve, pollingIntervalMs));
                    break;

                default:
                    this.log("error", "Polling returned an unhandled status.", { status: pollResult.status });
                    throw new TaraPollingError(`Received unhandled status '${pollResult.status}' while polling.`, pollResult.status);
            }
        }

        throw new TaraPollingError("Authentication polling timed out.", "TIMEOUT");
    }
}