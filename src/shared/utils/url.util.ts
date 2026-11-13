const SENSITIVE_QUERY_PARAMETERS =
  /([?&](?:token|access_token|refresh_token|password|new_password|confirm_password)=)[^&#]*/gi;

export const redactSensitiveQueryParameters = (url: string): string =>
  url.replace(SENSITIVE_QUERY_PARAMETERS, "$1[REDACTED]");
