import { Email } from '@/domain/value-objects/Email';
import { PhoneNumber } from '@/domain/value-objects/PhoneNumber';

export interface IProfileProps {
  userId: string;
  email: Email;
  phone: PhoneNumber;
  passwordHash: string;
  name: string | null;
  avatarUrl: string | null;
  blocked: boolean;
}

/**
 * Profile aggregate root. Pure business object with no framework or persistence
 * concerns. Persistence mapping lives in infrastructure.
 */
export class Profile {
  constructor(private readonly props: IProfileProps) {}

  get userId(): string {
    return this.props.userId;
  }

  get email(): Email {
    return this.props.email;
  }

  get phone(): PhoneNumber {
    return this.props.phone;
  }

  get passwordHash(): string {
    return this.props.passwordHash;
  }

  get name(): string | null {
    return this.props.name;
  }

  get avatarUrl(): string | null {
    return this.props.avatarUrl;
  }

  get blocked(): boolean {
    return this.props.blocked;
  }

  public toPublic(): {
    id: string;
    name: string | null;
    email: string;
    avatarUrl: string | null;
  } {
    return {
      id: this.props.userId,
      name: this.props.name,
      email: this.props.email.value,
      avatarUrl: this.props.avatarUrl,
    };
  }
}
