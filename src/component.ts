import {
  Binding,
  Component,
  ContextTags,
  createServiceBinding,
  injectable,
} from '@loopback/core';
import {MailerBindings} from './keys';
import {MailerService} from './services/mailer.service';

@injectable({tags: {[ContextTags.KEY]: MailerBindings.COMPONENT}})
export class MailerComponent implements Component {
  bindings?: Binding[] = [createServiceBinding(MailerService)];
}
