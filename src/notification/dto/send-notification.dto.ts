export class SendNotificationDto {
  readonly token: string;
  readonly title: string;
  readonly body: string;
  readonly data?: Record<string, string>; // optional custom data
}
