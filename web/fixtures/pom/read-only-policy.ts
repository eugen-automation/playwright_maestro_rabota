export function allowsRegistrationDocument(
  request: {
    method: string;
    url: string;
    navigation: boolean;
    resourceType: string;
  },
  registrationUrl: string,
): boolean {
  return (
    request.method === 'GET' &&
    request.navigation &&
    request.resourceType === 'document' &&
    request.url === registrationUrl
  );
}
