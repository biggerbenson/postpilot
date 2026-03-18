import type { Post, SocialAccount } from "@prisma/client";

export interface PublishContext {
  post: Post & { media?: unknown[] };
  account: SocialAccount;
}

export interface PublishResult {
  success: boolean;
  message?: string;
  externalId?: string;
  response?: unknown;
}

export interface IPublisher {
  publish(context: PublishContext): Promise<PublishResult>;
  validateMedia?(context: PublishContext): Promise<boolean>;
  formatCaption?(post: Post, platform: string): string;
}
