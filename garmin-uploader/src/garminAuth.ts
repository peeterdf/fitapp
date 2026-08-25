import axios from 'axios';
// @ts-ignore — oauth-1.0a no trae tipos propios utilizables tal cual.
import OAuth from 'oauth-1.0a';
import CryptoJS from 'crypto-js';

// ─── LOGIN A GARMIN CONNECT (no oficial) ─────────────────────────────────
// Portado paso a paso desde la implementación real de Pythe1337N/garmin-connect
// (src/common/HttpClient.ts, MIT), no reconstruido de memoria — mismas URLs,
// mismos parámetros, mismo orden de pasos. Verificado además contra
// mkuthan/garmin-workouts (Python, con tests/CI) para confirmar que el flujo
// SSO -> ticket -> OAuth1 -> OAuth2 es el correcto.
//
// LIMITACIÓN CONOCIDA: esta librería de referencia NO maneja MFA/verificación
// en dos pasos (está marcado como TODO en su propio código). Si tu cuenta
// tiene 2FA activado, el login va a fallar acá. No lo probé contra un login
// real (no tengo cuenta de Garmin) — si falla en el paso 2 o 3, lo más
// probable es que Garmin haya cambiado el HTML de su página de login.

const GARMIN_SSO_ORIGIN = 'https://sso.garmin.com';
const GARMIN_SSO = `${GARMIN_SSO_ORIGIN}/sso`;
const GARMIN_SSO_EMBED = `${GARMIN_SSO_ORIGIN}/sso/embed`;
const SIGNIN_URL = `${GARMIN_SSO}/signin`;
const GC_MODERN = 'https://connect.garmin.com/modern';
const GC_API = 'https://connectapi.garmin.com';
const OAUTH_URL = `${GC_API}/oauth-service/oauth`;
export const WORKOUT_URL = `${GC_API}/workout-service/workout`;
export const SCHEDULE_URL = (workoutId: string | number) => `${GC_API}/workout-service/schedule/${workoutId}`;

// Consumer key/secret públicos que usa la app oficial de Garmin Connect
// (Android/iOS) para firmar OAuth1 — publicados por Garmin mismo, la
// comunidad los espeja acá desde hace años.
const OAUTH_CONSUMER_URL = 'https://thegarth.s3.amazonaws.com/oauth_consumer.json';

const USER_AGENT_CONNECTMOBILE = 'com.garmin.android.apps.connectmobile';
const USER_AGENT_BROWSER =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36';

const CSRF_RE = /name="_csrf"\s+value="(.+?)"/;
const TICKET_RE = /ticket=([^"]+)"/;
const ACCOUNT_LOCKED_RE = /var status\s*=\s*"([^"]*)"/;
const MFA_HINT_RE = /mfa|verification code|two-factor|one-time/i;

export class LoginRequiresMfaError extends Error {}
export class LoginFailedError extends Error {}

export interface GarminOAuth1Token {
  oauth_token: string;
  oauth_token_secret: string;
}

export interface GarminOAuth2Token {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  refresh_token_expires_in: number;
  expires_at: number; // epoch seconds, calculado localmente
  refresh_token_expires_at: number;
}

export interface GarminSession {
  consumerKey: string;
  consumerSecret: string;
  oauth1: GarminOAuth1Token;
  oauth2: GarminOAuth2Token;
}

function toQueryString(params: Record<string, string>): string {
  return Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
}

function makeOAuthClient(consumerKey: string, consumerSecret: string): OAuth {
  return new OAuth({
    consumer: { key: consumerKey, secret: consumerSecret },
    signature_method: 'HMAC-SHA1',
    hash_function(baseString: string, key: string) {
      return CryptoJS.HmacSHA1(baseString, key).toString(CryptoJS.enc.Base64);
    },
  });
}

async function getLoginTicket(username: string, password: string): Promise<string> {
  const client = axios.create();

  // Paso 1: inicia la sesión SSO (setea cookie de sesión).
  const step1Url = `${GARMIN_SSO_EMBED}?${toQueryString({ clientId: 'GarminConnect', locale: 'en', service: GC_MODERN })}`;
  await client.get(step1Url, { headers: { 'User-Agent': USER_AGENT_BROWSER } });

  // Paso 2: pide la página de login y extrae el token _csrf embebido.
  const step2Url = `${SIGNIN_URL}?${toQueryString({ id: 'gauth-widget', embedWidget: 'true', locale: 'en', gauthHost: GARMIN_SSO_EMBED })}`;
  const step2 = await client.get<string>(step2Url, { headers: { 'User-Agent': USER_AGENT_BROWSER } });
  const csrfMatch = CSRF_RE.exec(step2.data);
  if (!csrfMatch) throw new LoginFailedError('No se encontró el token _csrf. Garmin puede haber cambiado su página de login.');
  const csrfToken = csrfMatch[1];

  // Paso 3: envía usuario/contraseña + _csrf, la respuesta HTML trae el ticket.
  const step3Url = `${SIGNIN_URL}?${toQueryString({
    id: 'gauth-widget',
    embedWidget: 'true',
    clientId: 'GarminConnect',
    locale: 'en',
    gauthHost: GARMIN_SSO_EMBED,
    service: GARMIN_SSO_EMBED,
    source: GARMIN_SSO_EMBED,
    redirectAfterAccountLoginUrl: GARMIN_SSO_EMBED,
    redirectAfterAccountCreationUrl: GARMIN_SSO_EMBED,
  })}`;
  const step3Body = toQueryString({ username, password, embed: 'true', _csrf: csrfToken });
  const step3 = await client.post<string>(step3Url, step3Body, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Origin: GARMIN_SSO_ORIGIN,
      Referer: SIGNIN_URL,
      'User-Agent': USER_AGENT_BROWSER,
    },
  });

  const html = step3.data;
  const lockedMatch = ACCOUNT_LOCKED_RE.exec(html);
  if (lockedMatch) {
    throw new LoginFailedError('Tu cuenta de Garmin está bloqueada. Entrá a connect.garmin.com desde un navegador para desbloquearla.');
  }

  const ticketMatch = TICKET_RE.exec(html);
  if (!ticketMatch) {
    if (MFA_HINT_RE.test(html)) {
      throw new LoginRequiresMfaError('Esta cuenta tiene verificación en dos pasos (MFA) activada — todavía no soportado acá.');
    }
    throw new LoginFailedError('Login falló: revisá usuario/contraseña. Si están bien, es posible que Garmin haya cambiado su flujo de login.');
  }
  return ticketMatch[1];
}

async function exchangeOauth1ForOauth2(oauth: OAuth, oauth1: GarminOAuth1Token): Promise<GarminOAuth2Token> {
  const baseUrl = `${OAUTH_URL}/exchange/user/2.0`;
  const token = { key: oauth1.oauth_token, secret: oauth1.oauth_token_secret };
  const authorized = oauth.authorize({ url: baseUrl, method: 'POST' }, token) as unknown as Record<string, string>;
  const url = `${baseUrl}?${toQueryString(authorized)}`;

  const resp = await axios.post(url, null, {
    headers: { 'User-Agent': USER_AGENT_CONNECTMOBILE, 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  const now = Math.floor(Date.now() / 1000);
  return {
    ...resp.data,
    expires_at: now + resp.data.expires_in,
    refresh_token_expires_at: now + resp.data.refresh_token_expires_in,
  };
}

export async function loginToGarmin(username: string, password: string): Promise<GarminSession> {
  const consumerResp = await axios.get(OAUTH_CONSUMER_URL);
  const consumerKey: string = consumerResp.data.consumer_key;
  const consumerSecret: string = consumerResp.data.consumer_secret;

  const ticket = await getLoginTicket(username, password);

  const oauth = makeOAuthClient(consumerKey, consumerSecret);
  const step4Url = `${OAUTH_URL}/preauthorized?${toQueryString({ ticket, 'login-url': GARMIN_SSO_EMBED, 'accepts-mfa-tokens': 'true' })}`;
  const step4AuthHeader = oauth.toHeader(oauth.authorize({ url: step4Url, method: 'GET' }));
  const step4 = await axios.get<string>(step4Url, {
    headers: { ...step4AuthHeader, 'User-Agent': USER_AGENT_CONNECTMOBILE },
  });

  const oauth1Params = new URLSearchParams(step4.data);
  const oauth1: GarminOAuth1Token = {
    oauth_token: oauth1Params.get('oauth_token') ?? '',
    oauth_token_secret: oauth1Params.get('oauth_token_secret') ?? '',
  };
  if (!oauth1.oauth_token) throw new LoginFailedError('No se pudo obtener el token OAuth1 de Garmin.');

  const oauth2 = await exchangeOauth1ForOauth2(oauth, oauth1);

  return { consumerKey, consumerSecret, oauth1, oauth2 };
}

export async function refreshGarminSession(session: GarminSession): Promise<GarminSession> {
  const oauth = makeOAuthClient(session.consumerKey, session.consumerSecret);
  const oauth2 = await exchangeOauth1ForOauth2(oauth, session.oauth1);
  return { ...session, oauth2 };
}

export function isSessionExpired(session: GarminSession): boolean {
  return session.oauth2.expires_at < Math.floor(Date.now() / 1000);
}
